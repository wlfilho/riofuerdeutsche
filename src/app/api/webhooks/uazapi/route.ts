// src/app/api/webhooks/uazapi/route.ts
//
// Recebe os eventos do Webhook Global do uazapi (instância `rfd`) e registra o
// toque de WhatsApp no CRM, para que a triagem automática saiba que um cliente
// já está sendo atendido por lá e não rascunhe uma cobrança por e-mail em cima
// da conversa. Ver a skill `triagem-anfrage`, seção "WhatsApp".
//
// SOMENTE LEITURA do lado do WhatsApp: esta rota nunca envia mensagem. Envio
// por API não oficial é o que derruba o número.
//
// O parser é deliberadamente tolerante — o payload cru vai inteiro para
// whatsapp_events, então nenhum evento se perde por formato inesperado.

import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { digitsOnly as digits, phoneTail as tail } from '@/lib/phone';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

/**
 * Extrai o telefone de qualquer um dos campos que o uazapi possa usar.
 *
 * Formato real observado (evento `messages`): telefone limpo em `chat.phone`,
 * e o par chatid/sender_pn em `message.*`. NUNCA usar `message.sender` — é um
 * LID (identificador de privacidade do WhatsApp), não telefone, e viraria um
 * "telefone" de 13+ dígitos falso se entrasse nos candidatos.
 */
function extractPhone(p: Record<string, unknown>): string {
  const chat = p.chat as Record<string, unknown> | undefined;
  const msg = (p.message ?? p.msg) as Record<string, unknown> | undefined;
  const candidates = [
    chat?.phone, msg?.chatid, chat?.wa_chatid, msg?.sender_pn,
    p.chatid, p.chatId, p.from, p.number, p.phone, p.remoteJid,
    (p.key as Record<string, unknown> | undefined)?.remoteJid,
  ];
  for (const c of candidates) {
    if (typeof c !== 'string') continue;
    // "5521967527243@s.whatsapp.net" -> "5521967527243"
    const d = digits(c.split('@')[0]);
    if (d.length >= 8) return d;
  }
  return '';
}

/** Extrai o texto da mensagem, cobrindo os formatos comuns. */
function extractText(p: Record<string, unknown>): string {
  const msg = (p.message ?? p.msg) as Record<string, unknown> | undefined;
  const candidates = [
    p.text, p.body, p.content, p.caption,
    msg?.conversation, msg?.text, msg?.body,
    (msg?.extendedTextMessage as Record<string, unknown> | undefined)?.text,
    (msg?.imageMessage as Record<string, unknown> | undefined)?.caption,
  ];
  for (const c of candidates) {
    if (typeof c === 'string' && c.trim()) return c.trim();
  }
  return '';
}

/** true = mensagem enviada pelo Will; false = recebida do cliente. */
function extractFromMe(p: Record<string, unknown>): boolean {
  const key = p.key as Record<string, unknown> | undefined;
  const msg = (p.message ?? p.msg) as Record<string, unknown> | undefined;
  for (const c of [p.fromMe, p.fromme, key?.fromMe, msg?.fromMe]) {
    if (typeof c === 'boolean') return c;
    if (c === 'true') return true;
    if (c === 'false') return false;
  }
  return false;
}

function extractTimestamp(p: Record<string, unknown>): string | null {
  const msg = (p.message ?? p.msg) as Record<string, unknown> | undefined;
  const raw = p.messageTimestamp ?? p.timestamp ?? p.t ?? msg?.messageTimestamp;
  const n = typeof raw === 'string' ? Number(raw) : typeof raw === 'number' ? raw : NaN;
  if (!Number.isFinite(n) || n <= 0) return null;
  // uazapi manda segundos em alguns eventos e milissegundos em outros.
  const ms = n > 1e12 ? n : n * 1000;
  return new Date(ms).toISOString();
}

/** true = mensagem de grupo. Prioriza os booleanos que o uazapi já manda prontos. */
function extractIsGroup(p: Record<string, unknown>): boolean {
  const chat = p.chat as Record<string, unknown> | undefined;
  const msg = (p.message ?? p.msg) as Record<string, unknown> | undefined;
  if (typeof msg?.isGroup === 'boolean') return msg.isGroup;
  if (typeof chat?.wa_isGroup === 'boolean') return chat.wa_isGroup;
  const chatid = msg?.chatid ?? chat?.wa_chatid ?? p.chatid ?? p.chatId ?? p.remoteJid ?? '';
  return String(chatid).includes('@g.us');
}

/** Nome da instância uazapi que disparou o evento (`rfd`). */
function extractInstance(p: Record<string, unknown>): string | null {
  const c = p.instanceName ?? p.instance;
  return typeof c === 'string' ? c : null;
}

export async function POST(request: NextRequest) {
  // Autenticação. O header é o caminho preferido; o token na query existe
  // porque o painel do uazapi só deixa configurar a URL do Webhook Global.
  // Se der para mandar header por lá, use o header e tire o token da URL —
  // query string vai parar em log de servidor.
  const secret = process.env.UAZAPI_WEBHOOK_SECRET;
  const given =
    request.headers.get('x-webhook-secret') ??
    request.nextUrl.searchParams.get('token');

  if (!secret || given !== secret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let payload: Record<string, unknown>;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  // A partir daqui a resposta é sempre 200. Webhook que recebe erro entra em
  // retry, e retry infinito de um evento malformado é pior que o evento perdido
  // — que, de todo modo, ficou gravado cru em whatsapp_events.
  try {
    // Alguns eventos vêm aninhados em `data`.
    const p = ((payload.data as Record<string, unknown>) ?? payload) || {};

    const phone = extractPhone(p);
    const phoneTail = tail(phone);
    const text = extractText(p);
    const fromMe = extractFromMe(p);
    const isGroup = extractIsGroup(p);

    let parseStatus: 'ok' | 'unparsed' | 'ignored' = 'ok';
    let parseNote: string | null = null;

    if (isGroup) {
      parseStatus = 'ignored';
      parseNote = 'mensagem de grupo';
    } else if (!phoneTail) {
      parseStatus = 'unparsed';
      parseNote = 'telefone não reconhecido no payload';
    } else if (!text) {
      parseStatus = 'ignored';
      parseNote = 'evento sem texto (mídia, status ou presença)';
    }

    // Resolve contato e lead pelo final do telefone.
    let contactId: string | null = null;
    let leadId: string | null = null;

    if (parseStatus === 'ok' && phoneTail) {
      const { data: contacts } = await supabaseAdmin
        .from('contacts')
        .select('id, phone')
        .not('phone', 'is', null);

      const match = (contacts ?? []).find(
        c => digits(c.phone).slice(-8) === phoneTail,
      );
      contactId = match?.id ?? null;

      if (contactId) {
        const { data: leads } = await supabaseAdmin
          .from('price_leads')
          .select('id')
          .eq('contact_id', contactId)
          .is('archived_at', null)
          .order('created_at', { ascending: false })
          .limit(1);
        leadId = leads?.[0]?.id ?? null;
      }

      if (!contactId) parseNote = 'telefone sem contato correspondente';
      else if (!leadId) parseNote = 'contato sem lead ativo';
    }

    const { error: eventError } = await supabaseAdmin.from('whatsapp_events').insert({
      instance: extractInstance(p),
      phone: phone || null,
      phone_tail: phoneTail,
      direction: fromMe ? 'sent' : 'received',
      message_text: text || null,
      message_at: extractTimestamp(p),
      contact_id: contactId,
      lead_id: leadId,
      payload,
      parse_status: parseStatus,
      parse_note: parseNote,
    });

    // Índice único de dedupe: retry do mesmo evento cai aqui e não vira toque
    // duplicado no CRM.
    if (eventError) {
      if (eventError.code === '23505') {
        return NextResponse.json({ ok: true, duplicate: true });
      }
      console.error('[uazapi] falha ao gravar evento:', eventError.message);
      return NextResponse.json({ ok: true, stored: false });
    }

    // O toque no CRM é o que a triagem lê. Só grava quando há lead: sem lead,
    // o evento fica em whatsapp_events e pode ser reprocessado depois.
    if (leadId && parseStatus === 'ok') {
      const excerpt = text.length > 280 ? `${text.slice(0, 277)}…` : text;
      const { error: touchError } = await supabaseAdmin.from('lead_contacts').insert({
        lead_id: leadId,
        type: 'whatsapp',
        direction: fromMe ? 'sent' : 'received',
        note: excerpt,
        is_automatic: true,
        automatic_label: 'uazapi',
      });
      if (touchError) {
        console.error('[uazapi] falha ao gravar toque:', touchError.message);
      }
    }

    return NextResponse.json({ ok: true, status: parseStatus, lead: leadId });
  } catch (err) {
    console.error('[uazapi] erro inesperado:', (err as Error).message);
    return NextResponse.json({ ok: true, error: true });
  }
}

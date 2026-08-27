import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { DEFAULT_EMAIL_LOCALE as EMAIL_LOCALE } from '@/lib/email/render';
import { sendTemplatedEmail } from '@/lib/email/sendTemplatedEmail';
import deMessages from '@/i18n/messages/de.json';
import {
  getCampaign,
  PHONE_COUNTRY_CODES,
  PHONE_COUNTRY_LABELS,
  type Campaign,
  type CampaignData,
  type PhoneCountry,
} from '@/lib/campaigns';

/**
 * Canais de CHEGADA aceitos no `?von=` da /anfrage — de onde a pessoa veio
 * antes de preencher. Não confundir com o canal de SUBMISSÃO, que para tudo
 * que passa por esta rota é sempre 'form'. Ver o comentário em leadFields.
 */
const VALID_ARRIVAL_CHANNELS = ['whatsapp', 'email', 'instagram'] as const;

function isIsoDate(s: unknown): s is string {
  return (
    typeof s === 'string' &&
    /^\d{4}-\d{2}-\d{2}$/.test(s) &&
    !isNaN(new Date(s + 'T12:00:00').getTime())
  );
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// Notificação interna pro Will, mas os dias vão em alemão: é o que o cliente
// selecionou no formulário. Formato longo (weekday + mês por extenso) não é
// coberto por format.ts, então o Intl fica aqui com o locale dos e-mails.
function formatGermanDay(iso: string): string {
  return new Intl.DateTimeFormat(EMAIL_LOCALE, {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(iso + 'T12:00:00Z'));
}

/**
 * Rótulo alemão de um interesse, lido do mesmo catálogo que o formulário usa —
 * o cliente recebe no e-mail exatamente o texto que marcou na tela, e não há
 * uma segunda cópia das frases para sair do ar com a primeira.
 */
function interestLabelDe(id: string): string {
  const catalog = (deMessages as { public: { anfrageAida: Record<string, string> } })
    .public.anfrageAida;
  return catalog[`interest${id.charAt(0).toUpperCase()}${id.slice(1)}`] ?? id;
}

/** Interesses e idades só existem no formulário de campanha. */
function buildCampaignData(campaign: Campaign, body: Record<string, unknown>): CampaignData {
  const rawInterests = Array.isArray(body.interests) ? body.interests : [];
  const interests = campaign.interests.filter(id => rawInterests.includes(id));
  const childrenAges =
    typeof body.childrenAges === 'string' ? body.childrenAges.trim().slice(0, 100) : '';
  const preferredDay =
    typeof body.preferredDay === 'string' && campaign.fixedDays.includes(body.preferredDay)
      ? body.preferredDay
      : '';
  const phoneCountry = PHONE_COUNTRY_CODES.includes(body.phoneCountry as PhoneCountry)
    ? (body.phoneCountry as PhoneCountry)
    : undefined;

  return {
    ...(interests.length > 0 && { interests }),
    ...(childrenAges && { children_ages: childrenAges }),
    ...(preferredDay && { preferred_day: preferredDay }),
    ...(phoneCountry && { phone_country: phoneCountry }),
    consent_at: new Date().toISOString(),
  };
}

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Ungültige Anfrage.' }, { status: 400 });
  }

  // Honeypot: answer success so bots don't adapt
  if (body.website) {
    return NextResponse.json({ ok: true });
  }

  const campaign = getCampaign(body.campaign);
  const name = typeof body.name === 'string' ? body.name.trim().slice(0, 200) : '';
  const email = typeof body.email === 'string' ? body.email.trim().slice(0, 200) : '';
  const phone = typeof body.phone === 'string' ? body.phone.trim().slice(0, 50) : '';
  const pax = Number(body.pax);
  const children = body.children === undefined ? 0 : Number(body.children);
  const rawDays = Array.isArray(body.days) ? body.days : [];
  // O formulário manda o `?von=` da URL neste campo. Vale como canal de
  // chegada; valor desconhecido (ou ausente) vira null em vez de derrubar o
  // envio — link velho ou parâmetro digitado errado não pode custar um lead.
  const arrivalChannel = VALID_ARRIVAL_CHANNELS.includes(
    body.source as typeof VALID_ARRIVAL_CHANNELS[number],
  )
    ? (body.source as string)
    : null;

  if (!name) {
    return NextResponse.json({ error: 'Bitte gib deinen Namen an.' }, { status: 400 });
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Bitte gib eine gültige E-Mail-Adresse an.' }, { status: 400 });
  }
  if (!Number.isInteger(pax) || pax < 1 || pax > 99) {
    return NextResponse.json({ error: 'Bitte gib die Anzahl der Erwachsenen an.' }, { status: 400 });
  }
  if (!Number.isInteger(children) || children < 0 || children > 99) {
    return NextResponse.json({ error: 'Bitte gib eine gültige Anzahl an Kindern an.' }, { status: 400 });
  }

  // Numa campanha as datas vêm da escala do navio, não do cliente. E como os
  // dados ficam guardados até o programa estar pronto, o opt-in é obrigatório.
  let days: string[];
  if (campaign) {
    if (body.consent !== true) {
      return NextResponse.json({ error: 'Bitte bestätige die Einwilligung.' }, { status: 400 });
    }
    days = campaign.fixedDays;
  } else {
    days = [...new Set(rawDays.filter(isIsoDate))].sort();
    if (days.length === 0 || days.length > 30) {
      return NextResponse.json({ error: 'Bitte wähle mindestens einen Wunschtag aus.' }, { status: 400 });
    }
  }

  const campaignData = campaign ? buildCampaignData(campaign, body) : null;

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  const { data: contact, error: contactError } = await supabase
    .from('contacts')
    .upsert(
      // De propósito o canal de chegada, e não 'form': `contacts.source` conta
      // por onde a PESSOA apareceu (WhatsApp, e-mail, Instagram) — é ficha de
      // cadastro, não de pedido. Ver o comentário em leadFields sobre por que
      // os dois campos divergem para o mesmo lead.
      { email, name, phone: phone || null, source: arrivalChannel ?? 'other' },
      { onConflict: 'email' },
    )
    .select('id')
    .single();

  if (contactError) {
    return NextResponse.json({ error: 'Etwas ist schiefgelaufen. Bitte versuche es später erneut.' }, { status: 500 });
  }

  // ATENÇÃO — `price_leads.source` e `contacts.source` divergem de propósito
  // para o mesmo lead, e isso não é bug. São perguntas diferentes:
  //
  //   price_leads.source = COMO o pedido chegou até o sistema (canal de
  //     submissão). Tudo que passa por esta rota é 'form', sem exceção.
  //     'other' fica reservado pro cadastro manual do Will no admin
  //     (POST /api/admin/leads) — é o que torna a Fase 1 mensurável: antes
  //     os dois caíam no mesmo balde e não dava pra separar um do outro.
  //   price_leads.arrival_channel = DE ONDE a pessoa veio antes de preencher
  //     (o `?von=` da URL). Quem clicou no link do WhatsApp e preencheu o
  //     formulário é source='form' + arrival_channel='whatsapp'.
  //   contacts.source = por onde a PESSOA apareceu pela primeira vez. Segue
  //     o canal de chegada, não o de submissão — daí a divergência.
  //
  // Ou seja: um mesmo lead legitimamente termina com price_leads.source
  // 'form' e contacts.source 'whatsapp'. Igualar os dois destruiria a
  // distinção entre canal de aquisição e canal de conversão.
  //
  // Submissão de campanha (AIDA) também é 'form' — é formulário de verdade.
  // Para medir só o funil da /anfrage, filtre `campaign is null`.
  const leadFields = {
    name,
    email,
    phone: phone || null,
    pax,
    children,
    days: days.length,
    requested_days: days,
    source: 'form',
    arrival_channel: arrivalChannel,
    contact_id: contact.id,
    campaign: campaign?.slug ?? null,
    campaign_data: campaignData,
  };

  // Numa campanha o mesmo interessado costuma reenviar o formulário (mudou o
  // número de pessoas, achou que não tinha ido). Um lead por pessoa mantém a
  // lista de divulgação limpa; fora de campanha, cada Anfrage é uma nova.
  let leadId: string | null = null;
  if (campaign) {
    const { data: existing } = await supabase
      .from('price_leads')
      .select('id')
      .eq('email', email)
      .eq('campaign', campaign.slug)
      .order('created_at', { ascending: false })
      .limit(1);
    leadId = existing?.[0]?.id ?? null;
  }

  const isReturning = leadId !== null;

  if (leadId) {
    const { error: updateError } = await supabase
      .from('price_leads')
      .update({ ...leadFields, updated_at: new Date().toISOString() })
      .eq('id', leadId);
    if (updateError) {
      return NextResponse.json({ error: 'Etwas ist schiefgelaufen. Bitte versuche es später erneut.' }, { status: 500 });
    }
  } else {
    const { data: lead, error: leadError } = await supabase
      .from('price_leads')
      .insert({ ...leadFields, status: 'new' })
      .select('id')
      .single();
    if (leadError) {
      return NextResponse.json({ error: 'Etwas ist schiefgelaufen. Bitte versuche es später erneut.' }, { status: 500 });
    }
    leadId = lead.id;
  }

  // Toda campanha também é uma etiqueta (`lead_groups`): o admin vê e filtra o
  // lead da AIDA do mesmo jeito que qualquer grupo manual no CRM, em vez de um
  // segundo sistema de rótulos paralelo. Best-effort — não deve derrubar o
  // envio do formulário.
  if (campaign) {
    try {
      const { data: existingGroup } = await supabase
        .from('lead_groups')
        .select('id')
        .eq('name', campaign.label)
        .maybeSingle();
      const groupId = existingGroup?.id ?? (
        await supabase.from('lead_groups').insert({ name: campaign.label }).select('id').single()
      ).data?.id;
      if (groupId) {
        // 23505 = reenvio do formulário, o lead já tinha essa etiqueta — não é erro.
        const { error: memberError } = await supabase
          .from('lead_group_members')
          .insert({ lead_id: leadId, group_id: groupId });
        if (memberError && memberError.code !== '23505') throw memberError;
      }
    } catch (err) {
      console.error('[anfrage] falha ao etiquetar lead com a campanha:', err);
    }
  }

  const paxLabel = `${pax} pax${children > 0 ? ` + ${children} criança${children !== 1 ? 's' : ''}` : ''}`;
  const interestLabels = (campaignData?.interests ?? []).map(
    id => campaign!.interestLabels[id] ?? id,
  );
  // Telefone fora de DE/AT/CH é sinal de negócio, não detalhe de formulário:
  // significa interesse vindo de fora do público que a campanha assume.
  const phoneCountry = campaignData?.phone_country;
  const outsideDach = phoneCountry === 'other';
  const leadUrl = `https://riofuerdeutsche.de/admin/leads/${leadId}`;
  const propostaUrl = `https://riofuerdeutsche.de/admin/propostas/nova?lead_id=${leadId}`;

  // Confirmação para o próprio inscrito. Só no primeiro envio: quem reenvia o
  // formulário está corrigindo dados, não pedindo outro e-mail.
  //
  // Vale por si só num tour que é daqui a dois anos: a pessoa fica com o
  // registro do que pediu, o bounce revela na hora endereço que não existe, e
  // o convite a responder cria histórico com o provedor dela antes das
  // mensagens que realmente importam.
  if (campaign && !isReturning) {
    try {
      const germanDays = campaign.fixedDays.map(formatGermanDay).join(' und ');
      const paxLabelDe =
        `${pax} ${pax === 1 ? 'Erwachsener' : 'Erwachsene'}` +
        (children > 0 ? ` + ${children} ${children === 1 ? 'Kind' : 'Kinder'}` : '');

      const sent = await sendTemplatedEmail({
        slug: campaign.emailTemplateSlug,
        to: email,
        locale: EMAIL_LOCALE,
        data: {
          nome: name.trim().split(' ')[0],
          email,
          // Sempre os dois dias de escala, mesmo quem marcou preferência: o dia
          // do tour ainda não está fechado, e devolver a preferência como
          // "Termin" soaria a confirmação de algo que não existe.
          termin: germanDays,
          pax: paxLabelDe,
          interessen:
            (campaignData?.interests ?? []).map(interestLabelDe).join(', ') || '—',
        },
      });

      // sendTemplatedEmail devolve o erro em vez de lançar: sem este log, uma
      // falha de envio ficaria invisível nos logs da Vercel.
      if (!sent.success) {
        console.error('[anfrage] confirmação não enviada:', email, sent.error);
      }
    } catch (err) {
      console.error('[anfrage] confirmação falhou:', email, err);
    }
  }

  // Best-effort admin notification; the lead is saved either way.
  try {
    const { data: settings } = await supabase
      .from('site_settings')
      .select('business_email')
      .limit(1)
      .single();
    const to = settings?.business_email || 'will@riofuerdeutsche.de';

    const daysHtml = days.map(d => `<li>${formatGermanDay(d)}</li>`).join('');
    const campaignHtml = campaign
      ? `
        <p>
          <strong>Campanha:</strong> ${escapeHtml(campaign.label)}<br/>
          <strong>Interesses:</strong> ${interestLabels.length > 0 ? escapeHtml(interestLabels.join(', ')) : '—'}<br/>
          <strong>Dia preferido:</strong> ${campaignData?.preferred_day ? formatGermanDay(campaignData.preferred_day) : 'indiferente'}<br/>
          <strong>Idade das crianças:</strong> ${escapeHtml(campaignData?.children_ages ?? '') || '—'}<br/>
          <strong>Telefone (país):</strong> ${phoneCountry ? escapeHtml(PHONE_COUNTRY_LABELS[phoneCountry]) : '—'}
        </p>
        ${outsideDach
          ? `<p style="padding:12px;border-radius:8px;background:#fef3c7;color:#78350f">
              ⚠️ <strong>Este lead informou um telefone fora de DE/AT/CH.</strong>
              Vale conferir se o tour em grupo em alemão faz sentido para ele.
            </p>`
          : ''}`
      : '';

    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: 'Rio für Deutsche <will@riofuerdeutsche.de>',
      to,
      subject: campaign
        ? `🚢 ${campaign.label}: ${name} (${paxLabel})${outsideDach ? ' ⚠️ fora do DACH' : ''}`
        : `🔔 Nova solicitação de tour: ${name} (${paxLabel}, ${days.length} dia${days.length !== 1 ? 's' : ''})`,
      html: `
        <h2>${campaign ? `Novo interessado — ${escapeHtml(campaign.label)}` : 'Nova solicitação pelo formulário Anfrage'}</h2>
        <p>
          <strong>Nome:</strong> ${escapeHtml(name)}<br/>
          <strong>E-Mail:</strong> ${escapeHtml(email)}<br/>
          <strong>Telefone:</strong> ${escapeHtml(phone) || '—'}<br/>
          <strong>Adultos:</strong> ${pax}<br/>
          <strong>Crianças:</strong> ${children}<br/>
          <strong>Origem:</strong> formulário${arrivalChannel ? ` (via ${escapeHtml(arrivalChannel)})` : ''}
        </p>
        ${campaignHtml}
        <p><strong>Dias desejados:</strong></p>
        <ul>${daysHtml}</ul>
        <p>
          ${campaign
            ? `<a href="${leadUrl}">Abrir lead</a> · <a href="https://riofuerdeutsche.de/admin/leads?campaign=${campaign.slug}">Ver toda a campanha</a>`
            : `<a href="${propostaUrl}">Criar proposta agora</a> · <a href="https://riofuerdeutsche.de/admin/crm">Abrir CRM</a>`}
        </p>
      `,
    });
  } catch {
    // notification failure must not break the client flow
  }

  return NextResponse.json({ ok: true });
}

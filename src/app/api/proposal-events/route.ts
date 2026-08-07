import { NextRequest, NextResponse } from 'next/server';
import { createClient as createServiceClient } from '@supabase/supabase-js';
import { createClient } from '@/utils/supabase/server';

/**
 * Coleta de eventos da página pública da proposta (ProposalTracker).
 *
 * Endpoint público: quem tem o token da proposta pode postar. O cliente nunca
 * manda proposal_id — o servidor resolve pelo token, e o metadata é
 * reconstruído campo a campo aqui (nada do body vai cru pro banco).
 *
 * O próprio Will logado como admin não conta: no evento 'open' a sessão do
 * cookie é checada e, sendo admin, a resposta pede pro tracker se desligar
 * ({ disabled: true }) e nada é gravado. Os demais eventos não repetem a
 * checagem — sem 'open' gravado, o tracker nem chega a mandá-los.
 *
 * Robôs e IAs (link colado num agente que navega com headless browser) também
 * não contam: user-agent de automação é rejeitado em TODOS os eventos, antes
 * de qualquer acesso ao banco (BOT_UA_RE abaixo).
 */

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Robôs que executam JS (IA navegando o link, headless browsers, crawlers) não
// são leitores da proposta: user-agent de automação é descartado antes do banco.
// Previews de link (WhatsApp/Telegram) não rodam JS e nunca chegam aqui, então
// não entram no padrão — "WhatsApp" também aparece no UA do browser in-app real.
const BOT_UA_RE =
  /headless|bot\b|crawl|spider|scrape|python|curl|wget|axios|node-fetch|java\/|phantom|puppeteer|playwright|selenium|webdriver|lighthouse|anthropic|claude|openai|gpt|perplexity/i;
const EVENT_TYPES = ['open', 'ping', 'section', 'click'] as const;
const SECTIONS = ['overview', 'program', 'price', 'bank', 'contact', 'share'] as const;
const CLICK_TARGET_RE = /^[a-z0-9_]{1,40}$/;

type EventType = (typeof EVENT_TYPES)[number];

function str(v: unknown, max: number): string | null {
  return typeof v === 'string' && v.length > 0 ? v.slice(0, max) : null;
}

function num(v: unknown, min: number, max: number): number | null {
  const n = Number(v);
  if (!Number.isFinite(n)) return null;
  return Math.min(max, Math.max(min, Math.round(n)));
}

// Reconstrói o metadata permitido para o tipo de evento; null = evento inválido.
function buildMetadata(type: EventType, raw: Record<string, unknown>): Record<string, unknown> | null {
  switch (type) {
    case 'open': {
      const out: Record<string, unknown> = {};
      const w = num(raw.screen_w, 0, 20000);
      const h = num(raw.screen_h, 0, 20000);
      const tz = str(raw.tz, 60);
      if (w !== null) out.screen_w = w;
      if (h !== null) out.screen_h = h;
      if (tz) out.tz = tz;
      return out;
    }
    case 'ping': {
      const active = num(raw.active_seconds, 0, 86400);
      const scroll = num(raw.scroll_pct, 0, 100);
      if (active === null && scroll === null) return null;
      return { active_seconds: active ?? 0, scroll_pct: scroll ?? 0 };
    }
    case 'section': {
      const section = raw.section;
      if (!SECTIONS.includes(section as (typeof SECTIONS)[number])) return null;
      return { section, at_seconds: num(raw.at_seconds, 0, 86400) ?? 0 };
    }
    case 'click': {
      const target = typeof raw.target === 'string' ? raw.target : '';
      if (!CLICK_TARGET_RE.test(target)) return null;
      return { target, at_seconds: num(raw.at_seconds, 0, 86400) ?? 0 };
    }
  }
}

async function isAdminRequest(): Promise<boolean> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;
    const { data } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
    return data?.role === 'admin';
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const token = typeof body.token === 'string' ? body.token : '';
  const type = body.event_type as EventType;
  const sessionId = str(body.session_id, 64);
  const visitorId = str(body.visitor_id, 64);
  const rawMeta = (body.metadata ?? {}) as Record<string, unknown>;

  if (!UUID_RE.test(token) || !EVENT_TYPES.includes(type) || !sessionId || !visitorId) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const metadata = buildMetadata(type, rawMeta);
  if (metadata === null) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  // Sem user-agent = não é browser real; com padrão de automação = robô/IA.
  const userAgent = str(request.headers.get('user-agent'), 300);
  if (!userAgent || BOT_UA_RE.test(userAgent)) {
    return NextResponse.json({ ok: true, disabled: true });
  }

  if (type === 'open' && (await isAdminRequest())) {
    return NextResponse.json({ ok: true, disabled: true });
  }

  const admin = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  const { data: proposal } = await admin
    .from('proposals')
    .select('id')
    .eq('public_token', token)
    .single();
  if (!proposal) {
    return NextResponse.json({ ok: false }, { status: 404 });
  }

  const { error } = await admin.from('proposal_events').insert({
    proposal_id: proposal.id,
    session_id: sessionId,
    visitor_id: visitorId,
    event_type: type,
    metadata,
    user_agent: userAgent,
    referrer: type === 'open' ? str(body.referrer, 300) : null,
    locale: str(body.locale, 10),
  });

  if (error) {
    // Falha de analytics nunca deve virar erro visível pro cliente da proposta.
    console.error('[proposal-events] insert failed:', error.message);
  }
  return NextResponse.json({ ok: true });
}

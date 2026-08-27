import { createClient as createServiceClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

/**
 * Funil da /anfrage: view -> start -> submit.
 *
 * Coleta própria porque os eventos customizados do Vercel Analytics exigem
 * plano Pro/Enterprise (402 no Hobby). Mesmas defesas de /api/proposal-events,
 * pelos mesmos motivos:
 *
 *   - user-agent de automação não conta (robô não abandona formulário);
 *   - o Will logado como admin não conta — ele abre a /anfrage pra conferir, e
 *     isso inflaria justamente o 'view' sem nunca virar 'submit', que é o
 *     número que a medição existe pra proteger;
 *   - país vem dos headers de geo da Vercel, o IP nunca é guardado.
 *
 * Responde sempre 200: telemetria não pode quebrar o formulário. O índice
 * único (session_id, event_type) descarta repetição — 23505 é esperado.
 */
const EVENT_TYPES = ['view', 'start', 'submit'] as const;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const BOT_UA_RE =
  /headless|bot\b|crawl|spider|scrape|python|curl|wget|axios|node-fetch|java\/|phantom|puppeteer|playwright|selenium|webdriver|lighthouse|anthropic|claude|openai|gpt|perplexity/i;

function str(v: unknown, max: number): string | null {
  return typeof v === 'string' && v.length > 0 ? v.slice(0, max) : null;
}

export async function POST(request: NextRequest) {
  if (BOT_UA_RE.test(request.headers.get('user-agent') ?? '')) {
    return NextResponse.json({ ok: true });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: true });
  }

  const sessionId =
    typeof body.sessionId === 'string' && UUID_RE.test(body.sessionId) ? body.sessionId : null;
  const eventType = EVENT_TYPES.includes(body.event as (typeof EVENT_TYPES)[number])
    ? (body.event as string)
    : null;
  if (!sessionId || !eventType) return NextResponse.json({ ok: true });

  // O admin conferindo a própria página não é visitante.
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase
        .from('profiles').select('role').eq('id', user.id).single();
      if (profile?.role === 'admin') return NextResponse.json({ ok: true, disabled: true });
    }
  } catch {
    // sem sessão legível: segue como visitante anônimo
  }

  const service = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  const { error } = await service.from('anfrage_events').insert({
    session_id: sessionId,
    event_type: eventType,
    von: str(body.von, 40),
    tour: str(body.tour, 60),
    thema: str(body.thema, 60),
    lead_id: typeof body.leadId === 'string' && UUID_RE.test(body.leadId) ? body.leadId : null,
    country: request.headers.get('x-vercel-ip-country'),
  });

  // 23505 = mesmo evento já registrado nesta sessão. Esperado, não é erro.
  if (error && error.code !== '23505') {
    console.error('[anfrage-events] falha ao gravar:', error.message);
  }
  return NextResponse.json({ ok: true });
}

import { createClient as createServiceClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

/**
 * Aceite/recusa do banner de cookies.
 *
 * O GA4 só carrega depois do aceite, então ele nunca vê quem recusou. Sem esta
 * coleta paralela não existe denominador: dá pra contar os aceites e nada mais.
 * Mesmas defesas de /api/anfrage/events, pelos mesmos motivos:
 *
 *   - user-agent de automação não conta;
 *   - o Will logado como admin não conta — ele reabre o banner pra conferir o
 *     layout, e cada teste desses viraria uma escolha falsa;
 *   - país vem dos headers de geo da Vercel, o IP nunca é guardado.
 *
 * Responde sempre 200: o banner não pode depender disto pra fechar.
 */
const BOT_UA_RE =
  /headless|bot\b|crawl|spider|scrape|python|curl|wget|axios|node-fetch|java\/|phantom|puppeteer|playwright|selenium|webdriver|lighthouse|anthropic|claude|openai|gpt|perplexity/i;

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

  const choice =
    body.choice === 'accepted' || body.choice === 'rejected' ? (body.choice as string) : null;
  if (!choice) return NextResponse.json({ ok: true });

  // O admin conferindo o próprio banner não é visitante.
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

  const { error } = await service.from('consent_events').insert({
    choice,
    country: request.headers.get('x-vercel-ip-country'),
  });

  if (error) console.error('[consent-events] falha ao gravar:', error.message);
  return NextResponse.json({ ok: true });
}

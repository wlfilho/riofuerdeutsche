import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { isFoundVia } from '@/lib/interessen';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Grava o "Wie hast du uns gefunden?", que é perguntado na PÁGINA DE SUCESSO e
 * não no formulário — depois do envio a pessoa já converteu, não há o que
 * abandonar, e o formulário não cresce (67% dos visitantes estão no celular).
 *
 * O lead já existe quando a resposta chega, então o cliente precisa do id.
 * O que dá pra fazer com esse id está deliberadamente estreito:
 *
 *   - só o campo found_via é tocado, nada mais;
 *   - só um valor da lista fechada (FOUND_VIA_VALUES) é aceito;
 *   - só se found_via ainda for null — não dá pra reescrever;
 *   - só na primeira hora de vida do lead.
 *
 * Ou seja: quem tiver o UUID consegue, no máximo, marcar uma origem declarada
 * uma única vez num lead recém-criado. Não enumera, não lê, não altera o resto.
 * Responde 200 mesmo quando não grava — é telemetria opcional, e um erro aqui
 * não pode assustar quem acabou de mandar o pedido.
 */
export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: true });
  }

  const leadId = typeof body.leadId === 'string' && UUID_RE.test(body.leadId) ? body.leadId : null;
  const value = isFoundVia(body.value) ? body.value : null;
  if (!leadId || !value) return NextResponse.json({ ok: true });

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  const umaHoraAtras = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const { error } = await supabase
    .from('price_leads')
    .update({ found_via: value })
    .eq('id', leadId)
    .is('found_via', null)
    .gte('created_at', umaHoraAtras);

  if (error) console.error('[found-via] falha ao gravar:', error.message);
  return NextResponse.json({ ok: true });
}

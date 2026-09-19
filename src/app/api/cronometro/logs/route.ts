/**
 * Recebe os segmentos medidos no tour e grava em tour_time_logs.
 *
 * Escreve com o client de sessão, não com a service role: a RLS da tabela é
 * admin_only via auth.uid(), então o próprio banco confere quem está
 * gravando. Service role aqui só aumentaria a superfície sem ganhar nada.
 *
 * Idempotência: `client_event_id` nasce no aparelho e tem índice único
 * parcial. O upsert por essa coluna faz reenvio virar atualização, não linha
 * nova — que é o que sustenta tanto o sync offline quanto a tela de revisão
 * (corrigir um horário é reenviar o mesmo id).
 */
import { createClient } from '@/utils/supabase/server';
import { duracaoSegundos, pareceConfiavel } from '@/lib/cronometro/rules';
import type { Segment, SegmentKind } from '@/lib/cronometro/types';
import { NextRequest, NextResponse } from 'next/server';

const KINDS: SegmentKind[] = ['travel', 'visit'];

function numeroOuNull(v: unknown): number | null {
  return typeof v === 'number' && Number.isFinite(v) ? v : null;
}

function textoOuNull(v: unknown): string | null {
  return typeof v === 'string' && v.trim() !== '' ? v.trim() : null;
}

/**
 * Valida e normaliza um segmento vindo do aparelho.
 *
 * Devolve null em vez de lançar: um segmento corrompido não pode derrubar o
 * lote inteiro e levar junto um dia de medição que não existe em outro lugar.
 */
function normalizar(bruto: unknown): Record<string, unknown> | null {
  if (!bruto || typeof bruto !== 'object') return null;
  const s = bruto as Partial<Segment>;

  const clientEventId = textoOuNull(s.client_event_id);
  const kind = s.segment_kind;
  if (!clientEventId || !kind || !KINDS.includes(kind)) return null;

  const started = textoOuNull(s.started_at);
  const ended = textoOuNull(s.ended_at);
  if (!started || !ended) return null;
  if (Number.isNaN(Date.parse(started)) || Number.isNaN(Date.parse(ended))) return null;
  // O banco tem CHECK (ended_at >= started_at); barrar aqui dá mensagem melhor.
  if (Date.parse(ended) < Date.parse(started)) return null;

  const duracao = duracaoSegundos(started, ended);

  return {
    client_event_id: clientEventId,
    tour_date_id: textoOuNull(s.tour_date_id),
    segment_kind: kind,
    from_service_id: textoOuNull(s.from_service_id),
    to_service_id: textoOuNull(s.to_service_id),
    place_label: textoOuNull(s.place_label),
    started_at: started,
    ended_at: ended,
    start_latitude: numeroOuNull(s.start_latitude),
    start_longitude: numeroOuNull(s.start_longitude),
    end_latitude: numeroOuNull(s.end_latitude),
    end_longitude: numeroOuNull(s.end_longitude),
    gps_accuracy_m: s.gps_accuracy_m === null || s.gps_accuracy_m === undefined
      ? null
      : Math.round(Number(s.gps_accuracy_m)),
    // A regra de duração absurda é aplicada aqui, não só no aparelho: é o
    // servidor que responde pelo dado. Um "confiável" vindo de fora nunca
    // sobrepõe um segmento que a regra reprova; o caminho de volta é a tela de
    // revisão marcar à mão, e ela manda reliable = false, nunca true por cima.
    reliable: pareceConfiavel(kind, duracao) && s.reliable !== false,
    note: textoOuNull(s.note),
    synced_at: new Date().toISOString(),
  };
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let corpo: { segments?: unknown[] };
  try {
    corpo = (await request.json()) as { segments?: unknown[] };
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 });
  }

  const brutos = Array.isArray(corpo.segments) ? corpo.segments : [];
  if (brutos.length === 0) return NextResponse.json({ accepted: [] });

  const linhas = brutos.map(normalizar).filter((l): l is Record<string, unknown> => l !== null);
  const descartados = brutos.length - linhas.length;
  if (linhas.length === 0) {
    return NextResponse.json({ accepted: [], discarded: descartados });
  }

  // ── Idempotência ───────────────────────────────────────────────────────────
  // O caminho óbvio seria upsert com onConflict: 'client_event_id'. Ele NÃO
  // funciona aqui: o índice único da coluna é PARCIAL
  // (WHERE client_event_id IS NOT NULL) e o Postgres só infere ON CONFLICT
  // sobre índice parcial se o predicado vier junto, o que o PostgREST não
  // permite expressar. Na prática, todo sync morreria com
  // "42P10: there is no unique or exclusion constraint matching the ON
  // CONFLICT specification" — e o app offline pararia inteiro, em silêncio.
  //
  // Então a resolução é explícita: descobre o que já existe, atualiza pelo id
  // (chave primária, essa sim com constraint de verdade) e insere o resto.
  const ids = linhas.map(l => l.client_event_id as string);
  const { data: existentes, error: erroLeitura } = await supabase
    .from('tour_time_logs')
    .select('id, client_event_id')
    .in('client_event_id', ids);

  if (erroLeitura) {
    console.error('[cronometro] falha conferindo duplicados:', erroLeitura.message);
    return NextResponse.json({ error: erroLeitura.message }, { status: 500 });
  }

  const idPorEvento = new Map((existentes ?? []).map(r => [r.client_event_id, r.id]));
  const aceitos: string[] = [];

  const novos = linhas.filter(l => !idPorEvento.has(l.client_event_id as string));
  if (novos.length > 0) {
    const { data, error } = await supabase
      .from('tour_time_logs')
      .insert(novos)
      .select('client_event_id');

    if (error) {
      // 23505 = o índice único pegou uma corrida entre dois envios do mesmo
      // segmento. O dado já está lá, que é o que importa; a linha entra como
      // aceita para sair da fila do aparelho em vez de reenviar para sempre.
      if (error.code !== '23505') {
        console.error('[cronometro] falha inserindo segmentos:', error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      aceitos.push(...novos.map(l => l.client_event_id as string));
    } else {
      aceitos.push(...(data ?? []).map(r => r.client_event_id as string));
    }
  }

  // Reenvio do mesmo segmento (rede que voltou no meio, ou correção): atualiza
  // a linha que já existe, nunca cria outra.
  for (const linha of linhas) {
    const idExistente = idPorEvento.get(linha.client_event_id as string);
    if (!idExistente) continue;

    const { error } = await supabase
      .from('tour_time_logs')
      .update(linha)
      .eq('id', idExistente);

    if (error) {
      console.error('[cronometro] falha atualizando segmento:', error.message);
      continue;
    }
    aceitos.push(linha.client_event_id as string);
  }

  return NextResponse.json({ accepted: aceitos, discarded: descartados });
}

/**
 * Correção manual de um registro, da tela de revisão.
 *
 * Por id, e não por client_event_id como o POST: aqui a linha já existe e é
 * ela que está sendo editada. Usar o upsert daria no mesmo para o que veio do
 * aparelho, mas quebraria em qualquer linha sem client_event_id.
 *
 * `reliable` só é aceito para REBAIXAR. Marcar um registro como confiável é
 * uma afirmação sobre o mundo que nem eu nem a tela temos como sustentar; o
 * caminho de volta, se a duração parecer certa, é corrigir os horários, e aí a
 * regra de absurdo deixa de disparar sozinha.
 */
export async function PATCH(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let corpo: Record<string, unknown>;
  try {
    corpo = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 });
  }

  const id = textoOuNull(corpo.id);
  if (!id) return NextResponse.json({ error: 'id obrigatório' }, { status: 400 });

  const { data: atual, error: erroLeitura } = await supabase
    .from('tour_time_logs')
    .select('segment_kind, started_at, ended_at, reliable, from_service_id, to_service_id, tour_date_id')
    .eq('id', id)
    .single();

  if (erroLeitura || !atual) {
    return NextResponse.json({ error: 'Registro não encontrado' }, { status: 404 });
  }

  const started = textoOuNull(corpo.started_at) ?? atual.started_at;
  const ended = textoOuNull(corpo.ended_at) ?? atual.ended_at;
  if (Number.isNaN(Date.parse(started)) || Number.isNaN(Date.parse(ended))) {
    return NextResponse.json({ error: 'Horário inválido' }, { status: 400 });
  }
  if (Date.parse(ended) < Date.parse(started)) {
    return NextResponse.json({ error: 'O fim não pode ser antes do início.' }, { status: 400 });
  }

  const kind = atual.segment_kind as SegmentKind;
  const duracao = duracaoSegundos(started, ended);

  // A confiança pode ir nos dois sentidos, com um limite: a regra de duração
  // absurda não é negociável. Rebaixar é sempre aceito; promover só quando a
  // duração passa na regra — assim um registro que a máquina reprovou nunca
  // é branqueado, mas um corte manual bem fundamentado (o horário impresso no
  // ingresso, por exemplo) pode voltar a contar.
  const duracaoOk = pareceConfiavel(kind, duracao);
  const reliable =
    corpo.reliable === false ? false
    : corpo.reliable === true ? duracaoOk
    : duracaoOk && atual.reliable;

  const patch: Record<string, unknown> = {
    started_at: started,
    ended_at: ended,
    reliable,
  };
  if ('note' in corpo) patch.note = textoOuNull(corpo.note);

  // Trocar o lugar à mão. Numa visita, começo e fim são o mesmo lugar por
  // definição (ver o comentário em types.ts), então o espelhamento acontece
  // aqui e não depende de a tela lembrar disso.
  if ('to_service_id' in corpo || 'place_label' in corpo) {
    const destino = textoOuNull(corpo.to_service_id);
    patch.to_service_id = destino;
    // Escolher do catálogo apaga o texto livre e vice-versa: os dois juntos
    // deixariam a tela mostrando um nome e a comparação usando outro.
    patch.place_label = destino ? null : textoOuNull(corpo.place_label);
    if (kind === 'visit') patch.from_service_id = destino;
  }

  const { error } = await supabase.from('tour_time_logs').update(patch).eq('id', id);
  if (error) {
    console.error('[cronometro] falha corrigindo registro:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

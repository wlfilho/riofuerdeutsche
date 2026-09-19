/**
 * Quebra um registro em dois, num instante escolhido à mão.
 *
 * Existe porque um bloco medido nem sempre contém uma coisa só, e os dois
 * casos apareceram no primeiro dia de uso real (19/09/2026):
 *
 *  - esqueci de marcar a chegada, e o deslocamento engoliu a visita inteira;
 *  - duas horas de fila de ingresso ficaram dentro do bloco da visita, o que
 *    faria o Pão de Açúcar parecer uma visita de 3h35 em vez de 1h37.
 *
 * O corte é sempre uma lembrança, não uma medição, então as duas metades
 * nascem `reliable = false`. Quem sabe que o corte é firme — o horário
 * impresso num ingresso, por exemplo — promove depois, pelo PATCH.
 */
import { createClient } from '@/utils/supabase/server';
import type { SegmentKind } from '@/lib/cronometro/types';
import { NextRequest, NextResponse } from 'next/server';

const KINDS: SegmentKind[] = ['travel', 'visit'];

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let corpo: { id?: string; at?: string; first_kind?: string; second_kind?: string };
  try {
    corpo = await request.json();
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 });
  }

  const id = corpo.id?.trim();
  const at = corpo.at?.trim();
  if (!id || !at) return NextResponse.json({ error: 'id e at são obrigatórios' }, { status: 400 });
  if (Number.isNaN(Date.parse(at))) {
    return NextResponse.json({ error: 'Horário do corte inválido' }, { status: 400 });
  }

  const primeiro = corpo.first_kind as SegmentKind;
  const segundo = corpo.second_kind as SegmentKind;
  if (!KINDS.includes(primeiro) || !KINDS.includes(segundo)) {
    return NextResponse.json({ error: 'Tipo de segmento inválido' }, { status: 400 });
  }

  const { data: original, error: erroLeitura } = await supabase
    .from('tour_time_logs')
    .select('id, tour_date_id, segment_kind, from_service_id, to_service_id, place_label, started_at, ended_at, start_latitude, start_longitude, end_latitude, end_longitude, gps_accuracy_m, note')
    .eq('id', id)
    .single();

  if (erroLeitura || !original) {
    return NextResponse.json({ error: 'Registro não encontrado' }, { status: 404 });
  }

  // O corte tem que cair DENTRO do bloco, e sobrar bloco dos dois lados: um
  // corte na borda produziria um segmento de duração zero, que é lixo com
  // aparência de dado.
  const inicio = Date.parse(original.started_at);
  const fim = Date.parse(original.ended_at);
  const corte = Date.parse(at);
  if (corte <= inicio || corte >= fim) {
    return NextResponse.json(
      { error: 'O corte precisa ficar entre o início e o fim do registro.' },
      { status: 400 },
    );
  }

  // O lugar do corte é onde o bloco terminava: é lá que a primeira metade
  // chega e de onde a segunda parte. Numa visita isso mantém as duas pontas
  // no mesmo lugar, como a convenção exige.
  const lugarDoCorte = original.to_service_id;

  const { error: erroUpdate } = await supabase
    .from('tour_time_logs')
    .update({
      segment_kind: primeiro,
      ended_at: at,
      reliable: false,
      note: original.note ?? 'Primeira metade de um registro dividido à mão. Corte estimado.',
      // A coordenada do fim era do fim do bloco inteiro, que agora é o fim da
      // SEGUNDA metade. Deixá-la aqui apontaria esta metade para um lugar
      // onde ela não terminou.
      end_latitude: null,
      end_longitude: null,
    })
    .eq('id', id);

  if (erroUpdate) {
    console.error('[cronometro] falha dividindo (update):', erroUpdate.message);
    return NextResponse.json({ error: erroUpdate.message }, { status: 500 });
  }

  const { data: novo, error: erroInsert } = await supabase
    .from('tour_time_logs')
    .insert({
      tour_date_id: original.tour_date_id,
      segment_kind: segundo,
      from_service_id: lugarDoCorte,
      to_service_id: original.to_service_id,
      place_label: original.place_label,
      started_at: at,
      ended_at: original.ended_at,
      start_latitude: null,
      start_longitude: null,
      end_latitude: original.end_latitude,
      end_longitude: original.end_longitude,
      gps_accuracy_m: original.gps_accuracy_m,
      reliable: false,
      note: 'Segunda metade de um registro dividido à mão. Corte estimado.',
      client_event_id: crypto.randomUUID(),
      synced_at: new Date().toISOString(),
    })
    .select('id')
    .single();

  if (erroInsert) {
    // A primeira metade já foi encurtada. Desfazer é mais seguro do que
    // deixar o dia com um buraco entre o corte e o fim original.
    await supabase
      .from('tour_time_logs')
      .update({ segment_kind: original.segment_kind, ended_at: original.ended_at, note: original.note })
      .eq('id', id);
    console.error('[cronometro] falha dividindo (insert):', erroInsert.message);
    return NextResponse.json({ error: erroInsert.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, novo_id: novo?.id });
}

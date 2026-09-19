/**
 * Leitura dos dados de deslocamento — só servidor.
 *
 * Separado de src/lib/travel.ts porque aquele é puro e vai para o bundle do
 * browser; este fala com o Supabase e com o ORS.
 */
import { createClient } from '@/utils/supabase/server';
import { orsMatrix, type LatLng } from '@/lib/ors';
import type { TravelMatrixPayload } from '@/lib/travel';

/**
 * Matriz pré-calculada entre as paradas do catálogo, na forma compacta que o
 * builder consome. Ausência de linha não é erro: aquele par cai no tempo fixo.
 */
export async function getTravelMatrix(): Promise<TravelMatrixPayload> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('proposal_travel_matrix')
    .select('from_service_id, to_service_id, duration_seconds');

  if (error || !data || data.length === 0) {
    if (error) console.error('[travel] falha lendo proposal_travel_matrix:', error.message);
    return { ids: [], seconds: [] };
  }

  const ids = [...new Set(data.flatMap(r => [r.from_service_id, r.to_service_id]))].sort();
  const pos = new Map(ids.map((id, i) => [id, i]));
  const seconds: Array<Array<number | null>> = ids.map(() => ids.map(() => null));

  for (const row of data) {
    const i = pos.get(row.from_service_id);
    const j = pos.get(row.to_service_id);
    if (i === undefined || j === undefined) continue;
    seconds[i][j] = row.duration_seconds;
  }

  return { ids, seconds };
}

/**
 * Tempos de carro entre a origem da proposta e cada atração do catálogo, nos
 * dois sentidos.
 *
 * Calcula para TODAS as atrações de uma vez, não só para a primeira e a última
 * parada do roteiro atual: o Will reordena o dia o tempo todo, e assim o
 * número acompanha o arrasto sem uma ida à rede a cada mudança. São 2
 * requisições de matriz por consulta, contra uma cota de 500 por dia.
 */
export async function getOriginLegs(
  origin: LatLng,
): Promise<Record<string, { to: number; from: number }>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('proposal_services')
    .select('id, latitude, longitude')
    .eq('is_active', true)
    .neq('category', 'transfer')
    .not('latitude', 'is', null);

  if (error || !data || data.length === 0) return {};

  // Índice 0 é a origem; 1..n são as atrações, na mesma ordem de `data`.
  const locations: Array<[number, number]> = [
    [origin.longitude, origin.latitude],
    ...data.map(s => [Number(s.longitude), Number(s.latitude)] as [number, number]),
  ];
  const alvos = data.map((_, i) => i + 1);

  const [ida, volta] = await Promise.all([
    orsMatrix(locations, { sources: [0], destinations: alvos }),
    orsMatrix(locations, { sources: alvos, destinations: [0] }),
  ]);

  const legs: Record<string, { to: number; from: number }> = {};
  data.forEach((s, i) => {
    const to = ida.durations[0]?.[i];
    const from = volta.durations[i]?.[0];
    if (to === null || to === undefined || from === null || from === undefined) return;
    legs[s.id] = { to: Math.round(to), from: Math.round(from) };
  });
  return legs;
}

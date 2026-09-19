/**
 * Leituras do cronômetro que acontecem no servidor.
 *
 * As tabelas envolvidas (tour_dates, price_leads, tour_time_logs) são
 * admin-only sob RLS, e quem chega aqui já passou pelo guard do layout, então
 * o client de sessão basta — a própria RLS é a segunda tranca.
 */
import { createClient } from '@/utils/supabase/server';
import { getSettings } from '@/lib/settings';
import { betweenKey, expandMatrix, trafficFactorAt } from '@/lib/travel';
import { getTravelMatrix } from '@/lib/travelServer';
import type { Place } from './types';

export type TourDoDia = {
  id: string;
  tour_name: string | null;
  start_time: string | null;
  pax: number | null;
  cliente: string | null;
};

/** "2026-09-19" no fuso do Rio, que é onde o tour acontece. */
export function hojeNoRio(): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo' }).format(new Date());
}

/**
 * Tours de uma data. Mais de um no mesmo dia acontece (manhã e tarde, grupos
 * diferentes), por isso a tela pergunta qual em vez de adivinhar.
 */
export async function getToursDoDia(dataISO: string): Promise<TourDoDia[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('tour_dates')
    .select('id, tour_name, start_time, pax, lead:price_leads(name)')
    .eq('date', dataISO)
    .order('start_time', { ascending: true, nullsFirst: false });

  if (error) {
    console.error('[cronometro] falha lendo tour_dates:', error.message);
    return [];
  }

  return (data ?? []).map(t => {
    // O embed do PostgREST vem como objeto ou lista conforme a cardinalidade
    // inferida; normalizar aqui evita o `any` espalhado na tela.
    const lead = t.lead as { name?: string } | { name?: string }[] | null;
    const nome = Array.isArray(lead) ? lead[0]?.name : lead?.name;
    return {
      id: t.id,
      tour_name: t.tour_name,
      start_time: t.start_time,
      pax: t.pax,
      cliente: nome ?? null,
    };
  });
}

/**
 * Paradas do catálogo com coordenada, para identificar o lugar sem rede.
 *
 * Vai inteira para o aparelho e é copiada em IndexedDB: são ~30 linhas, alguns
 * KB, e é o que permite identificar o Cristo estando no Cristo, sem sinal.
 */
export async function getParadas(): Promise<Place[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('proposal_services')
    .select('id, name, latitude, longitude, duration_hours')
    .eq('is_active', true)
    .not('latitude', 'is', null)
    .not('longitude', 'is', null)
    .order('name');

  if (error) {
    console.error('[cronometro] falha lendo proposal_services:', error.message);
    return [];
  }

  return (data ?? []).map(s => ({
    id: s.id,
    name: s.name,
    latitude: Number(s.latitude),
    longitude: Number(s.longitude),
    duration_hours: s.duration_hours === null ? null : Number(s.duration_hours),
  }));
}

// ─── Leitura dos registros ────────────────────────────────────────────────────

export type RegistroMedido = {
  id: string;
  segment_kind: 'travel' | 'visit';
  from_service_id: string | null;
  to_service_id: string | null;
  from_nome: string | null;
  to_nome: string | null;
  place_label: string | null;
  started_at: string;
  ended_at: string;
  duration_seconds: number;
  reliable: boolean;
  note: string | null;
};

type LinhaBruta = {
  id: string;
  segment_kind: string;
  from_service_id: string | null;
  to_service_id: string | null;
  place_label: string | null;
  started_at: string;
  ended_at: string;
  duration_seconds: number | null;
  reliable: boolean;
  note: string | null;
};

/**
 * Registros de um dia.
 *
 * O nome da parada é resolvido aqui, com um mapa id→nome, em vez de dois
 * embeds do PostgREST na mesma tabela: from e to apontam para
 * proposal_services, e embed duplo exige desambiguar por nome de constraint,
 * que quebra silenciosamente se a FK for renomeada.
 */
export async function getRegistrosDoDia(dataISO: string): Promise<RegistroMedido[]> {
  const supabase = await createClient();

  // A data do tour define o dia, não o instante UTC: um tour que termina 21h
  // no Rio já é o dia seguinte em UTC, e cairia fora da janela.
  const inicio = new Date(`${dataISO}T00:00:00-03:00`).toISOString();
  const fim = new Date(`${dataISO}T23:59:59-03:00`).toISOString();

  const { data, error } = await supabase
    .from('tour_time_logs')
    .select('id, segment_kind, from_service_id, to_service_id, place_label, started_at, ended_at, duration_seconds, reliable, note')
    .gte('started_at', inicio)
    .lte('started_at', fim)
    .order('started_at');

  if (error) {
    console.error('[cronometro] falha lendo tour_time_logs:', error.message);
    return [];
  }

  const linhas = (data ?? []) as LinhaBruta[];
  const ids = [...new Set(linhas.flatMap(l => [l.from_service_id, l.to_service_id]).filter((v): v is string => !!v))];

  const nomes = new Map<string, string>();
  if (ids.length > 0) {
    const { data: servicos } = await supabase
      .from('proposal_services')
      .select('id, name')
      .in('id', ids);
    for (const s of servicos ?? []) nomes.set(s.id, s.name);
  }

  return linhas.map(l => ({
    id: l.id,
    segment_kind: l.segment_kind as 'travel' | 'visit',
    from_service_id: l.from_service_id,
    to_service_id: l.to_service_id,
    from_nome: l.from_service_id ? nomes.get(l.from_service_id) ?? null : null,
    to_nome: l.to_service_id ? nomes.get(l.to_service_id) ?? null : null,
    place_label: l.place_label,
    started_at: l.started_at,
    ended_at: l.ended_at,
    duration_seconds: l.duration_seconds ?? 0,
    reliable: l.reliable,
    note: l.note,
  }));
}

/** Dias que têm alguma medição, do mais recente para o mais antigo. */
export async function getDiasComRegistro(limite = 30): Promise<string[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('tour_time_logs')
    .select('started_at')
    .order('started_at', { ascending: false })
    .limit(500);

  if (error || !data) return [];

  const fmt = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo' });
  const dias = [...new Set(data.map(r => fmt.format(new Date(r.started_at))))];
  return dias.slice(0, limite);
}

// ─── Comparação: medido contra previsto ───────────────────────────────────────

export type Comparacao = RegistroMedido & {
  /** Previsão do sistema em segundos. Null = o sistema não prevê este trecho. */
  previsto_s: number | null;
  /** Para deslocamento: o tempo cru do ORS, antes do fator de trânsito. */
  base_s: number | null;
  /** Fator de trânsito que valia no horário em que o segmento começou. */
  fator: number | null;
  /** medido ÷ previsto. Acima de 1 = o sistema subestima. */
  razao: number | null;
  /**
   * Para deslocamento: medido ÷ base do ORS. É o fator que teria acertado
   * este trecho — o número que serve para calibrar a tabela de faixas.
   */
  fator_observado: number | null;
};

/** Minuto do dia, no fuso do Rio, em que o segmento começou. */
function minutoNoRio(iso: string): number {
  const hhmm = new Date(iso).toLocaleTimeString('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  const [h, m] = hhmm.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}

/**
 * Medições de um dia ao lado do que o sistema previa.
 *
 * SÓ COMPARA. Não ajusta duration_hours, nem o fator, nem o catálogo — mexer
 * nisso com base em poucas medições seria trocar um chute por outro, com
 * aparência de rigor. A decisão é humana, olhando esta tela.
 */
export async function getComparacao(dataISO: string): Promise<Comparacao[]> {
  const [registros, matriz, settings] = await Promise.all([
    getRegistrosDoDia(dataISO),
    getTravelMatrix(),
    getSettings(),
  ]);

  const entre = expandMatrix(matriz);
  const bands = settings.traffic_factors;

  // Duração de catálogo das paradas visitadas, para comparar com a visita.
  const supabase = await createClient();
  const idsVisitados = [
    ...new Set(
      registros
        .filter(r => r.segment_kind === 'visit' && r.to_service_id)
        .map(r => r.to_service_id as string),
    ),
  ];
  const duracaoCatalogo = new Map<string, number>();
  if (idsVisitados.length > 0) {
    const { data } = await supabase
      .from('proposal_services')
      .select('id, duration_hours')
      .in('id', idsVisitados);
    for (const s of data ?? []) {
      if (s.duration_hours !== null) duracaoCatalogo.set(s.id, Number(s.duration_hours) * 3600);
    }
  }

  return registros.map((r, i) => {
    let base_s: number | null = null;
    let previsto_s: number | null = null;
    let fator: number | null = null;
    let origemDerivada: string | null = null;

    if (r.segment_kind === 'travel') {
      // Um deslocamento começa onde o segmento anterior terminou — isso é da
      // construção do cronômetro, não um palpite. Vale a pena derivar porque
      // `from_service_id` só é preenchido quando o GPS identifica o lugar na
      // hora; corrigido depois na revisão, só o destino é gravado, e sem as
      // duas pontas não há par na matriz e o trecho fica sem previsão.
      const anterior = registros[i - 1];
      const origem = r.from_service_id ?? anterior?.to_service_id ?? null;
      if (origem && r.to_service_id) {
        base_s = entre[betweenKey(origem, r.to_service_id)] ?? null;
      }
      // A origem derivada também vale para o rótulo: sem isto a tela mostraria
      // "? → Colombo" ao lado de uma previsão que só existe porque a origem
      // foi resolvida, o que faria o número parecer vindo do nada.
      if (!r.from_nome && origem) {
        origemDerivada = anterior?.to_nome ?? null;
      }
      if (base_s !== null) {
        fator = trafficFactorAt(bands, minutoNoRio(r.started_at));
        previsto_s = base_s * fator;
      }
    } else if (r.to_service_id) {
      previsto_s = duracaoCatalogo.get(r.to_service_id) ?? null;
    }

    return {
      ...r,
      from_nome: r.from_nome ?? origemDerivada,
      previsto_s,
      base_s,
      fator,
      razao: previsto_s && previsto_s > 0 ? r.duration_seconds / previsto_s : null,
      fator_observado: base_s && base_s > 0 ? r.duration_seconds / base_s : null,
    };
  });
}

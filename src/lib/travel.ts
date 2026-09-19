/**
 * Deslocamento entre as paradas de um roteiro.
 *
 * Módulo puro, sem I/O: roda no browser dentro do Proposal Builder. Quem busca
 * os números é o servidor (matriz gravada em proposal_travel_matrix + a origem
 * geocodificada), e entrega tudo pronto num TravelLookup.
 *
 * A regra de resolução de cada trecho, nesta ordem:
 *   1. origem → 1ª parada e última parada → origem: tempo real calculado
 *      contra o endereço do cliente ('ors');
 *   2. parada → parada: tempo real da matriz pré-calculada ('matrix');
 *   3. sem coordenada dos dois lados: o tempo fixo do catálogo ('fallback').
 *
 * O fallback nunca sai. Ele é o caminho normal de qualquer serviço sem
 * coordenada, incluindo toda atração coringa montada dentro da proposta.
 */

export type LegSource = 'ors' | 'matrix' | 'fallback';

export type Leg = {
  /** Tempo cobrado e exibido: `baseHours * factor`. */
  hours: number;
  /** Tempo cru, antes do fator de trânsito. */
  baseHours: number;
  /** Fator de trânsito aplicado. 1 = nenhum (fallback, ou sem faixa). */
  factor: number;
  source: LegSource;
};

/** Tudo que o builder precisa para resolver trechos sem falar com a rede. */
export type TravelLookup = {
  // id do serviço → segundos de/para a origem da proposta.
  origin: Record<string, { to: number; from: number }>;
  // `${fromId}>${toId}` → segundos entre duas paradas do catálogo.
  between: Record<string, number>;
  // O item do roteiro guarda slug, a matriz é por id.
  idBySlug: Record<string, string>;
};

/**
 * Forma compacta em que a matriz viaja do servidor para o builder: uma lista
 * de ids e o quadrado de segundos indexado por posição. Em UUID por chave, as
 * 900 células passariam de 70 KB no payload da página; assim ficam em ~5 KB.
 * `null` = par sem rota, que cai no tempo fixo como qualquer par ausente.
 */
export type TravelMatrixPayload = { ids: string[]; seconds: Array<Array<number | null>> };

export function expandMatrix(payload: TravelMatrixPayload): Record<string, number> {
  const out: Record<string, number> = {};
  payload.ids.forEach((fromId, i) => {
    payload.ids.forEach((toId, j) => {
      const sec = payload.seconds[i]?.[j];
      if (sec !== null && sec !== undefined) out[betweenKey(fromId, toId)] = sec;
    });
  });
  return out;
}

export const EMPTY_TRAVEL_LOOKUP: TravelLookup = { origin: {}, between: {}, idBySlug: {} };

export function betweenKey(fromId: string, toId: string): string {
  return `${fromId}>${toId}`;
}

// ─── Fator de trânsito ────────────────────────────────────────────────────────

/**
 * Uma faixa de horário e o quanto ela estica o tempo do ORS.
 *
 * Só o início da faixa é guardado: a faixa vale até o início da próxima, e a
 * última dá a volta no relógio até a primeira. Assim é impossível configurar
 * buraco ou sobreposição, que é o erro que uma lista de pares início/fim
 * convida a cometer.
 */
export type TrafficBand = { start: string; factor: number };

/**
 * Ponto de partida da calibragem, decidido em 09/2026 comparando os 866 pares
 * da matriz com os tempos fixos do catálogo: a mediana do catálogo dá 1,81x o
 * ORS, que calcula em fluxo livre. Estes números são menores porque o catálogo
 * embute paradas e margem, não só trânsito. São editáveis em
 * /admin/configuracoes; isto aqui é só o default de quem nunca salvou.
 */
export const DEFAULT_TRAFFIC_BANDS: TrafficBand[] = [
  { start: '07:00', factor: 1.5 },
  { start: '10:00', factor: 1.3 },
  { start: '16:00', factor: 1.5 },
  { start: '19:00', factor: 1.0 },
];

/**
 * jsonb do banco → faixas utilizáveis.
 *
 * O visitante anônimo não lê site_settings (RLS) e a coluna pode faltar numa
 * base antiga, então qualquer coisa que não seja uma lista de faixas válidas
 * cai no default. Devolver [] aqui desligaria o fator em silêncio, que é pior
 * do que usar o número combinado.
 */
export function parseTrafficBands(raw: unknown): TrafficBand[] {
  if (!Array.isArray(raw)) return DEFAULT_TRAFFIC_BANDS;
  const bands = raw
    .filter((b): b is Record<string, unknown> => !!b && typeof b === 'object')
    .map(b => ({ start: String(b.start ?? ''), factor: Number(b.factor) }))
    .filter(b => bandStartMinute(b.start) !== null && Number.isFinite(b.factor) && b.factor > 0);
  return bands.length > 0 ? bands : DEFAULT_TRAFFIC_BANDS;
}

const MIN_POR_DIA = 24 * 60;

/** "HH:MM" → minutos desde a meia-noite. Lixo vira null. */
export function bandStartMinute(hhmm: string): number | null {
  const m = /^(\d{1,2}):(\d{2})$/.exec(hhmm.trim());
  if (!m) return null;
  const h = Number(m[1]);
  const min = Number(m[2]);
  if (h > 23 || min > 59) return null;
  return h * 60 + min;
}

/**
 * Fator da faixa que contém `minute`.
 *
 * Um dia longo passa da meia-noite na conta da timeline (um roteiro que começa
 * 19h e leva 6h chega a 1500 min), então o minuto é normalizado antes: o
 * relógio dá a volta, as faixas também.
 */
export function trafficFactorAt(bands: TrafficBand[], minute: number): number {
  const parsed = bands
    .map(b => ({ start: bandStartMinute(b.start), factor: b.factor }))
    .filter((b): b is { start: number; factor: number } =>
      b.start !== null && Number.isFinite(b.factor) && b.factor > 0)
    .sort((a, b) => a.start - b.start);

  if (parsed.length === 0) return 1;

  const m = ((minute % MIN_POR_DIA) + MIN_POR_DIA) % MIN_POR_DIA;
  // Antes do início da primeira faixa: ainda é a madrugada coberta pela
  // última, que dá a volta na meia-noite.
  let atual = parsed[parsed.length - 1];
  for (const band of parsed) {
    if (band.start <= m) atual = band;
    else break;
  }
  return atual.factor;
}

// Só o que a resolução precisa saber de um item — EditableItem do builder e
// ProposalItem da proposta salva servem os dois.
export type TravelItem = {
  service_slug: string;
  duration_hours: number | null;
  transfer_hours_to: number | null;
  transfer_hours_back: number | null;
};

export type DayLegs = {
  /** Origem → primeira parada. */
  first: Leg;
  /** Trecho i → i+1; sempre items.length - 1 posições. */
  between: Leg[];
  /** Última parada → origem. */
  last: Leg;
};

const SEC_POR_HORA = 3600;

function serviceId(lookup: TravelLookup, item: TravelItem): string | undefined {
  return lookup.idBySlug[item.service_slug];
}

/** Trecho sem fator: o fator entra depois, no passo de relógio. */
function cru(hours: number, source: LegSource): Leg {
  return { hours, baseHours: hours, factor: 1, source };
}

function legFirst(lookup: TravelLookup, item: TravelItem): Leg {
  const id = serviceId(lookup, item);
  const real = id ? lookup.origin[id]?.to : undefined;
  if (real !== undefined) return cru(real / SEC_POR_HORA, 'ors');
  return cru(item.transfer_hours_to ?? 0, 'fallback');
}

function legLast(lookup: TravelLookup, item: TravelItem): Leg {
  const id = serviceId(lookup, item);
  const real = id ? lookup.origin[id]?.from : undefined;
  if (real !== undefined) return cru(real / SEC_POR_HORA, 'ors');
  return cru(item.transfer_hours_back ?? 0, 'fallback');
}

function legBetween(lookup: TravelLookup, from: TravelItem, to: TravelItem): Leg {
  const fromId = serviceId(lookup, from);
  const toId = serviceId(lookup, to);
  const real = fromId && toId ? lookup.between[betweenKey(fromId, toId)] : undefined;
  if (real !== undefined) return cru(real / SEC_POR_HORA, 'matrix');
  // O fixo de um trecho no meio do dia é a média entre a volta de quem sai e a
  // ida de quem chega — o comportamento que o catálogo sempre teve, mantido
  // aqui para que remover a matriz devolva exatamente os números antigos.
  const back = from.transfer_hours_back ?? 0;
  const to_ = to.transfer_hours_to ?? 0;
  return cru((back + to_) / 2, 'fallback');
}

/**
 * Aplica o fator da faixa em que o trecho começa.
 *
 * Só sobre tempo do ORS: o tempo fixo do catálogo já embute trânsito, porque
 * saiu da experiência do Will dirigindo. Multiplicá-lo seria contar duas vezes.
 */
function comFator(leg: Leg, bands: TrafficBand[], minute: number | null): Leg {
  if (leg.source === 'fallback' || minute === null || bands.length === 0) return leg;
  const factor = trafficFactorAt(bands, minute);
  return { ...leg, factor, hours: leg.baseHours * factor };
}

export type DayLegsOptions = {
  /** Início do dia em minutos desde a meia-noite. null = sem fator de trânsito. */
  startMinute?: number | null;
  bands?: TrafficBand[];
};

/**
 * Os trechos de um dia, já com o fator de trânsito de cada um.
 *
 * O fator depende da hora em que o trecho começa, e a hora depende da duração
 * dos trechos anteriores, então a conta é uma varredura para frente pelo dia:
 * relógio no início, soma trecho, soma atividade, e assim por diante. Um dia
 * que começa às 8h e termina às 18h cruza três faixas e usa as três.
 */
export function buildDayLegs(
  items: TravelItem[],
  lookup: TravelLookup,
  opts: DayLegsOptions = {},
): DayLegs {
  const vazio: Leg = cru(0, 'fallback');
  if (items.length === 0) return { first: vazio, between: [], last: vazio };

  const bands = opts.bands ?? [];
  const inicio = opts.startMinute ?? null;
  // Relógio da varredura, em minutos. null propaga: sem hora de início não há
  // faixa a escolher, e todo trecho fica no tempo cru.
  let t = inicio;
  const avanca = (horas: number) => {
    if (t !== null) t += horas * 60;
  };

  const first = comFator(legFirst(lookup, items[0]), bands, t);
  avanca(first.hours);

  const between: Leg[] = [];
  for (let i = 0; i < items.length - 1; i++) {
    avanca(items[i].duration_hours ?? 0);
    const leg = comFator(legBetween(lookup, items[i], items[i + 1]), bands, t);
    avanca(leg.hours);
    between.push(leg);
  }

  avanca(items[items.length - 1].duration_hours ?? 0);
  const last = comFator(legLast(lookup, items[items.length - 1]), bands, t);

  return { first, between, last };
}

/**
 * Os dois trechos que encostam num item: o de chegada e o de saída. O primeiro
 * item chega da origem, o último volta para ela; no meio do dia, o trecho é
 * compartilhado com o vizinho.
 */
export function itemLegs(legs: DayLegs, idx: number, count: number): { to: Leg; back: Leg } {
  return {
    to: idx === 0 ? legs.first : legs.between[idx - 1],
    back: idx === count - 1 ? legs.last : legs.between[idx],
  };
}

/**
 * As horas de deslocamento que cabem a UM item do dia.
 *
 * Os trechos das pontas são só dele; os do meio são divididos com o vizinho
 * que compartilha o mesmo trecho. Sem essa divisão, somar item a item conta
 * todo trecho intermediário duas vezes — foi exatamente o que aconteceu com
 * `transport_hours` até 09/2026, inflando a hora do motorista em roteiros de
 * três paradas ou mais sem nada na tela denunciando.
 *
 * Somado sobre todos os itens do dia, isto dá `first + Σ between + last`, que
 * é o total de deslocamento do dia — a identidade que mantém honorário do
 * guia, custo do motorista e horas da tela falando do mesmo número.
 */
export function sharedLegHours(legs: DayLegs, idx: number, count: number): number {
  const { to, back } = itemLegs(legs, idx, count);
  return to.hours * (idx === 0 ? 1 : 0.5) + back.hours * (idx === count - 1 ? 1 : 0.5);
}

/** Deslocamento total do dia: as pontas inteiras, cada trecho do meio uma vez. */
export function totalLegHours(legs: DayLegs): number {
  return legs.first.hours + legs.between.reduce((s, l) => s + l.hours, 0) + legs.last.hours;
}

function allLegs(legs: DayLegs): Leg[] {
  return [legs.first, ...legs.between, legs.last];
}

/** Um dia inteiro usa tempo real, ou ainda tem trecho no valor fixo? */
export function allLegsReal(legs: DayLegs, itemCount: number): boolean {
  if (itemCount === 0) return false;
  return allLegs(legs).every(l => l.source !== 'fallback');
}

/**
 * Nenhum trecho do dia tem tempo real.
 *
 * Um trecho cinza é normal (serviço sem coordenada, atração coringa). O dia
 * inteiro cinza é sintoma: origem não geocodificada, ou o ORS fora do ar — que
 * devolve 200 com `legs: {}`, não erro, e some sem avisar. Trechos de duração
 * zero não contam: um dia de uma parada só, colada na origem, não é sintoma
 * de nada.
 */
export function allLegsFallback(legs: DayLegs, itemCount: number): boolean {
  if (itemCount === 0) return false;
  const comDuracao = allLegs(legs).filter(l => l.baseHours > 0);
  if (comDuracao.length === 0) return false;
  return comDuracao.every(l => l.source === 'fallback');
}

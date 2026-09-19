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

export type Leg = { hours: number; source: LegSource };

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

// Só o que a resolução precisa saber de um item — EditableItem do builder e
// ProposalItem da proposta salva servem os dois.
export type TravelItem = {
  service_slug: string;
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

function legFirst(lookup: TravelLookup, item: TravelItem): Leg {
  const id = serviceId(lookup, item);
  const real = id ? lookup.origin[id]?.to : undefined;
  if (real !== undefined) return { hours: real / SEC_POR_HORA, source: 'ors' };
  return { hours: item.transfer_hours_to ?? 0, source: 'fallback' };
}

function legLast(lookup: TravelLookup, item: TravelItem): Leg {
  const id = serviceId(lookup, item);
  const real = id ? lookup.origin[id]?.from : undefined;
  if (real !== undefined) return { hours: real / SEC_POR_HORA, source: 'ors' };
  return { hours: item.transfer_hours_back ?? 0, source: 'fallback' };
}

function legBetween(lookup: TravelLookup, from: TravelItem, to: TravelItem): Leg {
  const fromId = serviceId(lookup, from);
  const toId = serviceId(lookup, to);
  const real = fromId && toId ? lookup.between[betweenKey(fromId, toId)] : undefined;
  if (real !== undefined) return { hours: real / SEC_POR_HORA, source: 'matrix' };
  // O fixo de um trecho no meio do dia é a média entre a volta de quem sai e a
  // ida de quem chega — o comportamento que o catálogo sempre teve, mantido
  // aqui para que remover a matriz devolva exatamente os números antigos.
  const back = from.transfer_hours_back ?? 0;
  const to_ = to.transfer_hours_to ?? 0;
  return { hours: (back + to_) / 2, source: 'fallback' };
}

export function buildDayLegs(items: TravelItem[], lookup: TravelLookup): DayLegs {
  const vazio: Leg = { hours: 0, source: 'fallback' };
  if (items.length === 0) return { first: vazio, between: [], last: vazio };

  const between: Leg[] = [];
  for (let i = 0; i < items.length - 1; i++) {
    between.push(legBetween(lookup, items[i], items[i + 1]));
  }
  return {
    first: legFirst(lookup, items[0]),
    between,
    last: legLast(lookup, items[items.length - 1]),
  };
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

/** Um dia inteiro usa tempo real, ou ainda tem trecho no valor fixo? */
export function allLegsReal(legs: DayLegs, itemCount: number): boolean {
  if (itemCount === 0) return false;
  return [legs.first, ...legs.between, legs.last].every(l => l.source !== 'fallback');
}

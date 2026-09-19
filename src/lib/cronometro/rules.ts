/**
 * Regras puras do cronômetro: distância, identificação do lugar e confiança.
 *
 * Sem I/O e sem DOM de propósito — rodam igual no aparelho (para decidir o que
 * mostrar) e no servidor (para decidir o que gravar). A regra de confiança em
 * particular PRECISA valer nos dois lados: o aparelho a usa para avisar, o
 * servidor a aplica porque é ele quem responde pelo dado.
 */
import type { Fix, Place, SegmentKind } from './types';

/** Raio para casar a coordenada com uma parada do catálogo. */
export const RAIO_MATCH_M = 300;

/**
 * Acima disto, o GPS não é bom o bastante para identificar sozinho.
 *
 * Dentro de prédio, em rua estreita de morro ou no primeiro fix depois de
 * horas sem sinal, o aparelho devolve accuracy de centenas de metros. Nesses
 * casos ele "casaria" com qualquer coisa num raio de 300 m, e um lugar errado
 * gravado com cara de certo é pior do que um lugar em branco: contamina
 * justamente a calibragem que a feature existe para alimentar.
 */
export const ACCURACY_MAXIMA_M = 100;

/** Deslocamento acima disto não é um trecho de tour, é esquecimento. */
export const TRAVEL_ABSURDO_S = 3 * 60 * 60;
/** Visita acima disto idem. */
export const VISIT_ABSURDO_S = 6 * 60 * 60;

const RAIO_TERRA_M = 6_371_000;

const rad = (g: number) => (g * Math.PI) / 180;

/** Distância em metros entre duas coordenadas (haversine). */
export function distanciaM(
  aLat: number, aLng: number, bLat: number, bLng: number,
): number {
  const dLat = rad(bLat - aLat);
  const dLng = rad(bLng - aLng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(aLat)) * Math.cos(rad(bLat)) * Math.sin(dLng / 2) ** 2;
  return 2 * RAIO_TERRA_M * Math.asin(Math.min(1, Math.sqrt(h)));
}

export type PlaceMatch = {
  /** Parada identificada sozinha. Null = precisa perguntar. */
  auto: Place | null;
  /** Por que não identificou sozinho, para a tela explicar em vez de só falhar. */
  motivo: 'ok' | 'sem-coordenada' | 'gps-impreciso' | 'nada-por-perto';
  /** Candidatas ordenadas da mais perto para a mais longe, com a distância. */
  candidatas: Array<{ place: Place; distancia: number }>;
};

/**
 * Qual parada do catálogo corresponde a esta coordenada.
 *
 * Identifica sozinho só quando as duas condições valem: fix bom o bastante
 * (accuracy <= 100 m) e uma parada dentro de 300 m. Fora disso devolve as
 * candidatas ordenadas e deixa a decisão para quem está lá.
 */
export function matchPlace(fix: Fix, places: Place[]): PlaceMatch {
  if (fix.latitude === null || fix.longitude === null) {
    return { auto: null, motivo: 'sem-coordenada', candidatas: [] };
  }

  const candidatas = places
    .map(place => ({
      place,
      distancia: distanciaM(fix.latitude!, fix.longitude!, place.latitude, place.longitude),
    }))
    .sort((a, b) => a.distancia - b.distancia);

  // Accuracy nula significa "o aparelho não disse", não "é perfeito" — tratar
  // como impreciso seria pessimista demais, e como preciso, otimista demais.
  // Fica no meio: identifica, mas só se a parada estiver bem mais perto que o
  // raio, onde o erro não muda a resposta.
  const impreciso = fix.accuracy !== null && fix.accuracy > ACCURACY_MAXIMA_M;
  if (impreciso) return { auto: null, motivo: 'gps-impreciso', candidatas };

  const perto = candidatas[0];
  const limite = fix.accuracy === null ? RAIO_MATCH_M / 2 : RAIO_MATCH_M;
  if (!perto || perto.distancia > limite) {
    return { auto: null, motivo: 'nada-por-perto', candidatas };
  }

  return { auto: perto.place, motivo: 'ok', candidatas };
}

/** Segundos entre dois instantes ISO. Negativo vira 0 (o banco recusaria). */
export function duracaoSegundos(started_at: string, ended_at: string): number {
  const s = Date.parse(started_at);
  const e = Date.parse(ended_at);
  if (Number.isNaN(s) || Number.isNaN(e)) return 0;
  return Math.max(0, Math.round((e - s) / 1000));
}

/**
 * Um segmento deste tamanho merece confiança?
 *
 * Duração absurda quase sempre é o botão que ficou aberto: esqueci de marcar
 * "Cheguei", almocei, o deslocamento virou três horas. Nasce com reliable =
 * false para eu revisar, em vez de entrar na média e estragá-la em silêncio.
 */
export function pareceConfiavel(kind: SegmentKind, duracaoS: number): boolean {
  const limite = kind === 'travel' ? TRAVEL_ABSURDO_S : VISIT_ABSURDO_S;
  return duracaoS <= limite;
}

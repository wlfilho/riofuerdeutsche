/**
 * Cronômetro de tour: tipos compartilhados entre o aparelho e o servidor.
 *
 * O objetivo da feature é medir. Nada aqui ajusta duration_hours, fator de
 * trânsito ou catálogo — calibrar em cima de poucas medições seria trocar um
 * chute por outro com cara de rigor. O ajuste é decisão humana, depois, com a
 * tela de comparação na mão.
 */

export type SegmentKind = 'travel' | 'visit';

/** Uma parada do catálogo com coordenada, como o aparelho a conhece. */
export type Place = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  /** Duração prevista da visita, em horas. Null = sem previsão no catálogo. */
  duration_hours: number | null;
};

/** Leitura do GPS no instante do toque. */
export type Fix = {
  latitude: number | null;
  longitude: number | null;
  /** Raio de incerteza em metros. Null = o aparelho não informou (ou negou). */
  accuracy: number | null;
};

/**
 * Segmento fechado, pronto para virar linha em tour_time_logs.
 *
 * `client_event_id` nasce no aparelho ANTES do envio e tem índice único no
 * banco: reenviar o mesmo segmento nunca duplica linha. É também o que permite
 * corrigir depois — a tela de revisão reenvia o mesmo id e o upsert atualiza a
 * linha em vez de criar outra.
 */
export type Segment = {
  client_event_id: string;
  tour_date_id: string | null;
  segment_kind: SegmentKind;
  /** Parada onde o segmento COMEÇOU. Numa visita, é a mesma do fim. */
  from_service_id: string | null;
  /** Parada onde o segmento TERMINOU. Numa visita, é a mesma do início. */
  to_service_id: string | null;
  /** Nome digitado quando o lugar do fim não está no catálogo. */
  place_label: string | null;
  started_at: string;
  ended_at: string;
  start_latitude: number | null;
  start_longitude: number | null;
  end_latitude: number | null;
  end_longitude: number | null;
  gps_accuracy_m: number | null;
  reliable: boolean;
  note: string | null;
};

/** Segmento ainda aberto: existe só no aparelho, nunca no banco. */
export type OpenSegment = {
  client_event_id: string;
  tour_date_id: string | null;
  segment_kind: SegmentKind;
  from_service_id: string | null;
  started_at: string;
  start_latitude: number | null;
  start_longitude: number | null;
  gps_accuracy_m: number | null;
};

/** O que o aparelho guarda entre um toque e outro. */
export type CronometroState = {
  tourDateId: string | null;
  open: OpenSegment | null;
  /**
   * Parada onde estamos parados agora, entre dois segmentos. Vira o
   * `from_service_id` do próximo deslocamento sem pedir GPS de novo.
   */
  lastPlaceId: string | null;
  lastPlaceLabel: string | null;
};

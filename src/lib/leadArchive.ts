/**
 * Arquivamento de leads do CRM.
 *
 * O kanban só deve mostrar o que ainda está pela frente. Um card sai da visão
 * de três formas:
 *
 *   1. Manual — `archived_at` preenchido pelo admin (drawer). Vale sempre.
 *   2. Tour já realizado — a maior data conhecida do lead passou há mais de
 *      TOUR_GRACE_DAYS dias. A folga existe para o tour de ontem continuar
 *      visível: ainda há saldo a cobrar e avaliação a pedir.
 *   3. Perdido esfriou — lead em `lost` sem movimento há mais de
 *      LOST_GRACE_DAYS dias. Perdidos recentes seguem visíveis para dar noção
 *      de quantos negócios caíram no mês; os antigos viram histórico.
 *
 * Nada disso escreve no banco: os casos 2 e 3 são derivados a cada render.
 * Só o arquivamento manual persiste.
 */

export const TOUR_GRACE_DAYS = 7;
export const LOST_GRACE_DAYS = 30;

const TIMEZONE = 'America/Sao_Paulo';

/**
 * Hoje no fuso do Rio, como 'YYYY-MM-DD'.
 *
 * O servidor roda em UTC: depois das 21h no Rio, `new Date()` já virou o dia
 * seguinte. Com 7 dias de folga isso quase nunca muda o resultado, mas o
 * cálculo certo custa uma chamada de Intl.
 */
export function todayInRio(): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: TIMEZONE }).format(new Date());
}

/** Dias decorridos entre duas datas 'YYYY-MM-DD' (negativo se `iso` é futuro). */
function daysSince(iso: string, today: string): number {
  const a = Date.parse(`${iso}T00:00:00Z`);
  const b = Date.parse(`${today}T00:00:00Z`);
  if (Number.isNaN(a) || Number.isNaN(b)) return 0;
  return Math.round((b - a) / 86_400_000);
}

/** Normaliza timestamptz ou date para 'YYYY-MM-DD'. */
function toISODay(value: string | null | undefined): string | null {
  if (!value) return null;
  const day = value.slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(day) ? day : null;
}

/**
 * A data que define o "quando" de um lead: a última data conhecida do tour.
 *
 * Junta `requested_days` (o que o cliente pediu no formulário) com as
 * `tour_dates` (o que foi de fato agendado) e pega a maior. Usar a maior, e
 * não a de `tour_dates`, é proposital — há lead com tour_date antiga e pedido
 * para outubro; priorizar tour_dates o arquivaria vivo.
 */
export function leadTourDate(
  requestedDays: string[] | null | undefined,
  tourDates: string[] | null | undefined,
): string | null {
  const all = [...(requestedDays ?? []), ...(tourDates ?? [])]
    .map(toISODay)
    .filter((d): d is string => d !== null);
  if (all.length === 0) return null;
  return all.reduce((max, d) => (d > max ? d : max));
}

/**
 * A primeira data ainda futura do lead — o que ele tem pela frente.
 * Cai para a última data passada quando tudo já aconteceu, para o card nunca
 * ficar sem data.
 */
export function leadNextDate(
  requestedDays: string[] | null | undefined,
  tourDates: string[] | null | undefined,
  today: string,
): string | null {
  const all = [...(requestedDays ?? []), ...(tourDates ?? [])]
    .map(toISODay)
    .filter((d): d is string => d !== null)
    .sort();
  if (all.length === 0) return null;
  return all.find(d => d >= today) ?? all[all.length - 1];
}

export type ArchiveReason = 'manual' | 'tour_passado' | 'perdido_antigo';

export function leadArchiveReason(lead: {
  status: string;
  archived_at: string | null;
  updated_at: string;
  tourDate: string | null;
}, today: string): ArchiveReason | null {
  if (lead.archived_at) return 'manual';

  // Perdido não tem data futura relevante, mesmo quando o cliente chegou a
  // pedir dias: o critério é há quanto tempo o negócio parou.
  if (lead.status === 'lost') {
    const updated = toISODay(lead.updated_at);
    if (updated && daysSince(updated, today) > LOST_GRACE_DAYS) return 'perdido_antigo';
    return null;
  }

  if (lead.tourDate && daysSince(lead.tourDate, today) > TOUR_GRACE_DAYS) return 'tour_passado';

  return null;
}

/**
 * Recalcula `archiveReason` depois de uma edição feita no cliente (arrastar o
 * card, arquivar pelo drawer). Sem isto, tirar um perdido antigo de `lost`
 * deixaria ele marcado como arquivado até o próximo carregamento da página.
 *
 * `todayInRio()` aqui usa o relógio do navegador, não o do servidor — o que é
 * seguro porque só roda em resposta a uma interação, nunca durante a
 * hidratação.
 */
export function refreshArchiveReason<
  T extends {
    status: string;
    archived_at: string | null;
    updated_at: string;
    lastTourDate: string | null;
  },
>(lead: T): T & { archiveReason: ArchiveReason | null } {
  return {
    ...lead,
    archiveReason: leadArchiveReason({ ...lead, tourDate: lead.lastTourDate }, todayInRio()),
  };
}

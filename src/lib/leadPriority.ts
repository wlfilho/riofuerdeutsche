/**
 * Prioridade de um lead: quem não pode ficar na fila atrás de curioso.
 *
 * O critério é valor potencial do pedido, não simpatia: grupo grande, muitos
 * dias, ou dia de Carnaval. Nenhum deles depende de o Will já ter falado com a
 * pessoa, então dá para calcular no instante em que o formulário chega, que é
 * quando a informação serve para alguma coisa.
 *
 * É derivado, nunca gravado: os três insumos (pax, children, requested_days)
 * já estão no lead, e uma coluna a mais só criaria a chance de ficar velha
 * quando o Will corrigir o número de pessoas à mão.
 */

/** Grupo a partir daqui muda a logística (van, segundo guia) e o valor. */
const GRUPO_GRANDE = 6;

/** Quatro dias ou mais deixa de ser passeio e vira roteiro. */
const MUITOS_DIAS = 4;

export type PriorityReason = 'grupo' | 'dias' | 'karneval';

/**
 * Domingo de Páscoa pelo algoritmo anônimo gregoriano. O Carnaval é uma data
 * móvel amarrada à Páscoa, então não dá para tabelar sem a tabela envelhecer.
 */
function easterSunday(year: number): Date {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(Date.UTC(year, month - 1, day));
}

function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * 86400000);
}

function isoDay(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/**
 * Janela do Carnaval no ano: da sexta-feira à Quarta-feira de Cinzas.
 *
 * Terça de Carnaval é 47 dias antes da Páscoa. A janela começa na sexta porque
 * é quando a cidade já parou, e termina na quarta porque quem chega para o
 * Carnaval costuma ficar até ela.
 */
export function karnevalRange(year: number): { start: string; end: string } {
  const terca = addDays(easterSunday(year), -47);
  return { start: isoDay(addDays(terca, -4)), end: isoDay(addDays(terca, 1)) };
}

export function isKarnevalDay(isoDate: string): boolean {
  const year = Number(isoDate.slice(0, 4));
  if (!Number.isInteger(year)) return false;
  const { start, end } = karnevalRange(year);
  return isoDate >= start && isoDate <= end;
}

export type LeadPriorityInput = {
  pax: number;
  children?: number | null;
  requested_days?: string[] | null;
};

/**
 * Os motivos que tornam o lead prioritário, na ordem em que devem ser lidos.
 * Lista vazia = lead normal, que é a maioria e está tudo bem.
 */
export function leadPriorityReasons(lead: LeadPriorityInput): PriorityReason[] {
  const reasons: PriorityReason[] = [];
  const days = lead.requested_days ?? [];

  if (lead.pax + (lead.children ?? 0) >= GRUPO_GRANDE) reasons.push('grupo');
  if (days.length >= MUITOS_DIAS) reasons.push('dias');
  if (days.some(isKarnevalDay)) reasons.push('karneval');

  return reasons;
}

export function isPriorityLead(lead: LeadPriorityInput): boolean {
  return leadPriorityReasons(lead).length > 0;
}

/**
 * Formatação do admin — sempre pt-BR.
 *
 * O painel admin opera num único locale (pt-BR), então estes wrappers evitam
 * repetir o locale em cada chamada. Tudo delega para src/lib/format.ts, que usa
 * exclusivamente Intl.*.
 *
 * NÃO usar em conteúdo enviado ao cliente (texto de WhatsApp, PDF da proposta):
 * esse conteúdo é alemão e tem formatação própria.
 */
import { formatCurrency, formatDate, formatNumber } from './format';

export const ADMIN_LOCALE = 'pt-BR';

/** Data curta: dd/MM/yyyy. Aceita 'YYYY-MM-DD' sem deslocar o dia. */
export function fmtDate(date: string | Date | null | undefined): string {
  if (!date) return '—';
  return formatDate(date, ADMIN_LOCALE);
}

/** Data + hora: dd/MM/yyyy HH:mm. */
export function fmtDateTime(date: string | Date | null | undefined): string {
  if (!date) return '—';
  const parsed = typeof date === 'string' ? new Date(date) : date;
  if (Number.isNaN(parsed.getTime())) return '—';
  return new Intl.DateTimeFormat(ADMIN_LOCALE, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(parsed);
}

/** Valor em euros: € 1.234,50 */
export function fmtEur(value: number | null | undefined): string {
  return formatCurrency(Number(value ?? 0), 'EUR', ADMIN_LOCALE);
}

/** Valor em reais: R$ 1.234,50 */
export function fmtBrl(value: number | null | undefined): string {
  return formatCurrency(Number(value ?? 0), 'BRL', ADMIN_LOCALE);
}

/** Valor na moeda indicada. */
export function fmtMoney(
  value: number | null | undefined,
  currency: 'EUR' | 'BRL',
): string {
  return formatCurrency(Number(value ?? 0), currency, ADMIN_LOCALE);
}

/** Número simples com separadores de milhar. */
export function fmtNumber(value: number | null | undefined): string {
  return formatNumber(Number(value ?? 0), ADMIN_LOCALE);
}

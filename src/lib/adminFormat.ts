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

/**
 * Nome de um idioma em pt-BR, a partir do código BCP 47 ('de' → "alemão").
 *
 * Os códigos vêm de site_settings.supported_locales, que é configurável: uma
 * tabela de rótulos aqui ficaria desatualizada assim que um idioma novo fosse
 * habilitado. Intl.DisplayNames cobre qualquer código válido; código
 * desconhecido volta como veio, sem esconder informação do admin.
 */
export function fmtLanguage(code: string): string {
  try {
    const label = new Intl.DisplayNames([ADMIN_LOCALE], { type: 'language' }).of(code);
    if (!label || label === code) return code;
    return label.charAt(0).toUpperCase() + label.slice(1);
  } catch {
    return code;
  }
}

/** Número simples com separadores de milhar. */
export function fmtNumber(value: number | null | undefined): string {
  return formatNumber(Number(value ?? 0), ADMIN_LOCALE);
}

/**
 * Dias inteiros desde uma data ISO até agora (nunca negativo).
 * Usado pra sinalizar "parado há N dias" — leads aguardando proposta,
 * propostas sem resposta — nas listas do admin.
 */
export function daysSince(iso: string): number {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return 0;
  return Math.max(0, Math.floor((Date.now() - then) / 86_400_000));
}

/**
 * Nota/score com exatamente 1 casa decimal: 5 vira "5,0", não "5".
 * `fmtNumber` não serve aqui porque descartaria a casa decimal.
 */
export function fmtScore(value: number | null | undefined): string {
  return new Intl.NumberFormat(ADMIN_LOCALE, {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(Number(value ?? 0));
}

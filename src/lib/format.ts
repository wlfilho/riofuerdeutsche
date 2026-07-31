/**
 * Centralised locale-aware formatting.
 *
 * Everything here goes through `Intl.*` — never template strings or manual
 * separator handling. These replace the hardcoded formatting scattered across
 * the app.
 *
 * Formatters are memoised: constructing an `Intl.*` formatter is expensive and
 * these run inside render paths.
 */

type SupportedCurrency = 'EUR' | 'BRL';

const currencyFormatters = new Map<string, Intl.NumberFormat>();
const dateFormatters = new Map<string, Intl.DateTimeFormat>();
const numberFormatters = new Map<string, Intl.NumberFormat>();

function currencyFormatter(locale: string, currency: SupportedCurrency) {
  const key = `${locale}:${currency}`;
  let formatter = currencyFormatters.get(key);
  if (!formatter) {
    formatter = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
    });
    currencyFormatters.set(key, formatter);
  }
  return formatter;
}

function dateFormatter(locale: string) {
  let formatter = dateFormatters.get(locale);
  if (!formatter) {
    // 2-digit day/month + numeric year yields dd.MM.yyyy for de and
    // dd/MM/yyyy for pt-BR — the separator comes from the locale, not from us.
    formatter = new Intl.DateTimeFormat(locale, {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
    dateFormatters.set(locale, formatter);
  }
  return formatter;
}

function numberFormatter(locale: string) {
  let formatter = numberFormatters.get(locale);
  if (!formatter) {
    formatter = new Intl.NumberFormat(locale);
    numberFormatters.set(locale, formatter);
  }
  return formatter;
}

export function formatCurrency(
  value: number,
  currency: SupportedCurrency,
  locale: string,
): string {
  return currencyFormatter(locale, currency).format(value);
}

/**
 * Date-only values (`YYYY-MM-DD`) are parsed as UTC by `new Date()`, which can
 * shift the day backwards in negative-offset timezones like Brazil's. We format
 * those in UTC so a stored date never renders as the previous day.
 */
export function formatDate(date: string | Date, locale: string): string {
  const isDateOnly = typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date);
  const parsed = typeof date === 'string' ? new Date(date) : date;

  if (Number.isNaN(parsed.getTime())) return '';

  if (isDateOnly) {
    return new Intl.DateTimeFormat(locale, {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      timeZone: 'UTC',
    }).format(parsed);
  }

  return dateFormatter(locale).format(parsed);
}

export function formatNumber(value: number, locale: string): string {
  return numberFormatter(locale).format(value);
}

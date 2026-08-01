import { differenceInCalendarDays, startOfDay } from 'date-fns'
import { formatCurrency, formatDate as formatDateIntl } from '@/lib/format'

/**
 * Locale dos e-mails transacionais.
 *
 * Fixo em 'de' por enquanto: hoje todo destinatário é alemão. A localização
 * real dos e-mails (locale do destinatário) é trabalho separado — quando
 * chegar, este literal vira parâmetro.
 */
export const EMAIL_LOCALE = 'de'

/** Data no formato alemão dd.MM.yyyy. */
export function formatDate(isoDate: string) {
  return formatDateIntl(isoDate, EMAIL_LOCALE)
}

/**
 * Valor em euros no formato alemão: "1.234,50 €". Null/zero viram "0,00 €".
 *
 * O Intl separa o valor do símbolo com NBSP (U+00A0); os e-mails sempre usaram
 * espaço normal (U+0020). Visualmente é igual, mas normalizamos para o espaço
 * normal para os e-mails continuarem byte-idênticos aos já enviados — cliente
 * de e-mail e diff de template não deveriam mudar por causa desta refatoração.
 */
export function formatEuro(value: number | null | undefined): string {
  return formatCurrency(value ?? 0, 'EUR', EMAIL_LOCALE).replace(/\u00a0/g, ' ')
}

export function daysUntil(isoDate: string) {
  return differenceInCalendarDays(startOfDay(new Date(isoDate)), startOfDay(new Date()))
}

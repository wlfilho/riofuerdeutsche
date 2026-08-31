import { EMAIL_NUMBER_TO_SLUG, type SequenceEmailNumber } from '@/lib/tour-email-scheduler'
import { sendConfirmationEmail } from './sendConfirmationEmail'
import type { TourEmailRecipient } from './tourEmailSequence'
import { sendTemplatedEmail } from './sendTemplatedEmail'
import {
  formatEmailCurrency,
  formatEmailDate,
  formatTourDetailsHtml,
  getRecipientLocale,
} from './render'

// O destinatário vem montado de `getTourEmailRecipient` (lead + calendário +
// proposta). O tipo antigo `TourSequenceClient` espelhava `tour_clients`, que
// deixou de existir.

/**
 * Envia um e-mail da sequência pré-tour resolvendo o template do banco por
 * (slug, locale do destinatário) — substitui o antigo `sendTourEmail`, que
 * montava o HTML hardcoded por `email_number`.
 *
 * O e-mail #1 delega para `sendConfirmationEmail` — o mesmo caminho que roda
 * quando o lead fecha, comportamento idêntico.
 */
export async function sendTourSequenceEmail(
  emailNumber: SequenceEmailNumber,
  recipient: TourEmailRecipient,
): Promise<{ id: string } | { error: string }> {
  if (emailNumber === 1) {
    try {
      const result = await sendConfirmationEmail(recipient)
      return { id: result.id ?? '' }
    } catch (err) {
      return { error: err instanceof Error ? err.message : String(err) }
    }
  }

  const slug = EMAIL_NUMBER_TO_SLUG[emailNumber]
  const locale = await getRecipientLocale(recipient.email)

  // Estes templates hoje só usam {{nome}} (+ {{assinatura}}, injetada no envio),
  // mas o conteúdo é editável no admin — fornecemos o conjunto completo para um
  // shortcode adicionado no editor nunca sair cru.
  const result = await sendTemplatedEmail({
    slug,
    to: recipient.email,
    data: {
      nome: recipient.name,
      email: recipient.email,
      data_chegada: formatEmailDate(recipient.arrival_date, locale) || recipient.arrival_date,
      data_saida: formatEmailDate(recipient.departure_date, locale) || recipient.departure_date,
      tour: formatTourDetailsHtml(recipient.tour_details ?? ''),
      anzahlung: formatEmailCurrency(recipient.deposit_amount, locale),
      betrag_total: formatEmailCurrency(recipient.total_amount, locale),
    },
    locale,
  })

  if (!result.success) return { error: result.error ?? 'Erro desconhecido no envio.' }
  return { id: result.id ?? '' }
}

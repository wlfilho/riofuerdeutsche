import { EMAIL_NUMBER_TO_SLUG, type SequenceEmailNumber } from '@/lib/tour-email-scheduler'
import { sendConfirmationEmail } from './sendConfirmationEmail'
import { sendTemplatedEmail } from './sendTemplatedEmail'
import {
  formatEmailCurrency,
  formatEmailDate,
  formatTourDetailsHtml,
  getRecipientLocale,
} from './render'

export type TourSequenceClient = {
  name: string
  email: string
  arrival_date: string
  departure_date: string
  tour_details?: string | null
  total_amount?: number | null
  deposit_amount?: number | null
}

/**
 * Envia um e-mail da sequência pré-tour resolvendo o template do banco por
 * (slug, locale do destinatário) — substitui o antigo `sendTourEmail`, que
 * montava o HTML hardcoded por `email_number`.
 *
 * O e-mail #1 delega para `sendConfirmationEmail` (mesmo caminho usado na
 * criação do cliente, comportamento idêntico).
 */
export async function sendTourSequenceEmail(
  emailNumber: SequenceEmailNumber,
  clientId: string,
  client: TourSequenceClient,
): Promise<{ id: string } | { error: string }> {
  if (emailNumber === 1) {
    try {
      const result = await sendConfirmationEmail(clientId)
      return { id: result.id ?? '' }
    } catch (err) {
      return { error: err instanceof Error ? err.message : String(err) }
    }
  }

  const slug = EMAIL_NUMBER_TO_SLUG[emailNumber]
  const locale = await getRecipientLocale(client.email)

  // Estes templates hoje só usam {{nome}} (+ {{assinatura}}, injetada no envio),
  // mas o conteúdo é editável no admin — fornecemos o conjunto completo para um
  // shortcode adicionado no editor nunca sair cru.
  const result = await sendTemplatedEmail({
    slug,
    to: client.email,
    data: {
      nome: client.name,
      email: client.email,
      data_chegada: formatEmailDate(client.arrival_date, locale) || client.arrival_date,
      data_saida: formatEmailDate(client.departure_date, locale) || client.departure_date,
      tour: formatTourDetailsHtml(client.tour_details ?? ''),
      anzahlung: formatEmailCurrency(client.deposit_amount, locale),
      betrag_total: formatEmailCurrency(client.total_amount, locale),
    },
    locale,
  })

  if (!result.success) return { error: result.error ?? 'Erro desconhecido no envio.' }
  return { id: result.id ?? '' }
}

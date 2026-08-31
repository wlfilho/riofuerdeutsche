import { sendTemplatedEmail } from './sendTemplatedEmail'
import {
  formatEmailCurrency,
  formatEmailDate,
  formatTourDetailsHtml,
  getRecipientLocale,
} from './render'
import type { TourEmailRecipient } from './tourEmailSequence'

function formatDate(dateStr: string, locale: string): string {
  if (!dateStr) return ''
  // Preserva o fallback anterior: data malformada volta como veio, em vez de
  // sumir do e-mail (formatEmailDate devolve '' nesse caso).
  return formatEmailDate(dateStr, locale) || dateStr
}

/**
 * E-mail #1 da sequência: confirmação da reserva.
 *
 * Recebe o destinatário já montado (ver `getTourEmailRecipient`) em vez de um
 * id para buscar: os dados vêm de quatro tabelas — lead, tour_dates, proposta e
 * itens — e refazer essa leitura em cada caminho de envio só criaria uma
 * segunda versão da mesma regra.
 */
export async function sendConfirmationEmail(recipient: TourEmailRecipient) {
  const locale = await getRecipientLocale(recipient.email)

  const replacements = {
    nome: recipient.name,
    email: recipient.email,
    data_chegada: formatDate(recipient.arrival_date, locale),
    data_saida: formatDate(recipient.departure_date, locale),
    anzahlung: formatEmailCurrency(recipient.deposit_amount, locale),
    betrag_total: formatEmailCurrency(recipient.total_amount, locale),
    tour: formatTourDetailsHtml(recipient.tour_details ?? ''),
    assinatura: 'Viele Grüße aus Rio,',
  }

  const result = await sendTemplatedEmail({
    slug: 'confirmacao_reserva',
    to: recipient.email,
    data: replacements as never,
    locale,
  })

  if (!result.success) throw new Error(result.error)

  return { success: true, id: result.id }
}

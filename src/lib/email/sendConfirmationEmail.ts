import { createClient } from '@/utils/supabase/server'
import { sendTemplatedEmail } from './sendTemplatedEmail'
import {
  formatEmailCurrency,
  formatEmailDate,
  formatTourDetailsHtml,
  getRecipientLocale,
} from './render'

function formatDate(dateStr: string, locale: string): string {
  if (!dateStr) return ''
  // Preserva o fallback anterior: data malformada volta como veio, em vez de
  // sumir do e-mail (formatEmailDate devolve '' nesse caso).
  return formatEmailDate(dateStr, locale) || dateStr
}

export async function sendConfirmationEmail(clientId: string) {
  const supabase = await createClient()

  // Buscar dados do cliente
  const { data: client, error: clientError } = await supabase
    .from('tour_clients')
    .select('*')
    .eq('id', clientId)
    .single()

  if (clientError || !client) throw new Error('Cliente não encontrado')

  const locale = await getRecipientLocale(client.email)

  // Montar replacements
  const replacements = {
    nome: client.name,
    email: client.email,
    data_chegada: formatDate(client.arrival_date, locale),
    data_saida: formatDate(client.departure_date, locale),
    anzahlung: formatEmailCurrency(client.deposit_amount, locale),
    betrag_total: formatEmailCurrency(client.total_amount, locale),
    tour: formatTourDetailsHtml(client.tour_details ?? ''),
    assinatura: 'Viele Grüße aus Rio,',
  }

  // Enviar via sendTemplatedEmail
  const result = await sendTemplatedEmail({
    slug: 'confirmacao_reserva',
    to: client.email,
    data: replacements as any,
    locale,
  })

  if (!result.success) throw new Error(result.error)

  return { success: true, id: result.id }
}

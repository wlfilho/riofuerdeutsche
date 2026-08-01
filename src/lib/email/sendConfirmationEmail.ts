import { createClient } from '@/utils/supabase/server'
import { sendTemplatedEmail } from './sendTemplatedEmail'
import { formatDate as formatDateDe, formatEuro } from '@/lib/email-templates/utils'

function formatTourDetails(raw: string): string {
  if (!raw) return ''
  const lines = raw.split(/•|\n/).map(l => l.trim()).filter(l => l.length > 0)
  if (lines.length === 0) return raw
  return lines.map(line => `<span style="display:block;padding:3px 0;font-weight:normal;">• ${line}</span>`).join('')
}

function formatDate(dateStr: string): string {
  if (!dateStr) return ''
  // Preserva o fallback anterior: data malformada volta como veio, em vez de
  // sumir do e-mail (formatDate do format.ts devolve '' nesse caso).
  return formatDateDe(dateStr) || dateStr
}

function formatCurrency(value: number | null): string {
  return formatEuro(value)
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

  // Montar replacements
  const replacements = {
    nome: client.name,
    email: client.email,
    data_chegada: formatDate(client.arrival_date),
    data_saida: formatDate(client.departure_date),
    anzahlung: formatCurrency(client.deposit_amount),
    betrag_total: formatCurrency(client.total_amount),
    tour: formatTourDetails(client.tour_details ?? ''),
    assinatura: 'Viele Grüße aus Rio,',
  }

  // Enviar via sendTemplatedEmail
  const result = await sendTemplatedEmail({
    slug: 'confirmacao_reserva',
    to: client.email,
    data: replacements as any,
  })

  if (!result.success) throw new Error(result.error)

  return { success: true, id: result.id }
}

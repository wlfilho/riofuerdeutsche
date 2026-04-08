import { createClient } from '@supabase/supabase-js'
import { sendTourEmail, TourClient } from '@/lib/email-templates'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD

  // Buscar emails pendentes com data <= hoje, apenas para clientes ativos
  const { data: pendingLogs, error: fetchError } = await supabaseAdmin
    .from('email_sequence_log')
    .select(`
      id,
      email_number,
      client_id,
      tour_clients!inner (
        name,
        email,
        arrival_date,
        departure_date,
        tour_details,
        status
      )
    `)
    .eq('status', 'pending')
    .lte('scheduled_date', today)
    .eq('tour_clients.status', 'active')

  if (fetchError) {
    console.error('[cron] Fehler beim Laden der pendenten E-Mails:', fetchError.message)
    return Response.json({ error: fetchError.message }, { status: 500 })
  }

  const logs = pendingLogs ?? []
  let sent = 0
  let errors = 0

  for (const log of logs) {
    const clientData = log.tour_clients as unknown as {
      name: string
      email: string
      arrival_date: string
      departure_date: string
      tour_details: string | null
      status: string
    }

    const client: TourClient = {
      name: clientData.name,
      email: clientData.email,
      arrival_date: clientData.arrival_date,
      departure_date: clientData.departure_date,
      tour_details: clientData.tour_details ?? undefined,
    }

    const emailNum = log.email_number as 1 | 2 | 3 | 4
    const result = await sendTourEmail(emailNum, client)

    if ('error' in result) {
      errors++
      console.error(`[cron] Fehler bei E-Mail #${emailNum} für ${client.email}:`, result.error)
      await supabaseAdmin
        .from('email_sequence_log')
        .update({ status: 'error', error_message: result.error })
        .eq('id', log.id)
    } else {
      sent++
      console.log(`[cron] E-Mail #${emailNum} gesendet an ${client.email} (resend_id: ${result.id})`)
      await supabaseAdmin
        .from('email_sequence_log')
        .update({
          status: 'sent',
          sent_at: new Date().toISOString(),
          resend_id: result.id,
          error_message: null,
        })
        .eq('id', log.id)
    }
  }

  const summary = { processed: logs.length, sent, errors }
  console.log('[cron] Zusammenfassung:', summary)

  return Response.json(summary)
}

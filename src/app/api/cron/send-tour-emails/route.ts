import { createClient } from '@supabase/supabase-js'
import { EMAIL_NUMBER_TO_SLUG, EMAIL_SEQUENCE, type SequenceEmailNumber } from '@/lib/tour-email-scheduler'
import { sendTourSequenceEmail } from '@/lib/email/sendTourSequenceEmail'
import { getTourEmailRecipient, type TourEmailRecipient } from '@/lib/email/tourEmailSequence'

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

  // Pendentes com data <= hoje, apenas de leads que continuam fechados. O
  // `!inner` é o que garante isso: lead reaberto ou perdido some do resultado
  // em vez de virar objeto nulo — mesmo papel que `tour_clients.status =
  // 'active'` tinha antes de a tabela ser aposentada.
  const { data: pendingLogs, error: fetchError } = await supabaseAdmin
    .from('email_sequence_log')
    .select('id, email_number, lead_id, price_leads!inner(status)')
    .eq('status', 'pending')
    .lte('scheduled_date', today)
    .eq('price_leads.status', 'closed')

  if (fetchError) {
    console.error('[cron] Fehler beim Laden der pendenten E-Mails:', fetchError.message)
    return Response.json({ error: fetchError.message }, { status: 500 })
  }

  const logs = pendingLogs ?? []
  let sent = 0
  let errors = 0
  let skipped = 0

  // Um lead pode ter mais de um e-mail vencido no mesmo dia (ex.: cron que não
  // rodou ontem). Monta o destinatário uma vez por lead, não uma por e-mail.
  const recipients = new Map<string, TourEmailRecipient | null>()

  for (const log of logs) {
    const leadId = log.lead_id as string

    if (!recipients.has(leadId)) {
      recipients.set(leadId, await getTourEmailRecipient(supabaseAdmin, leadId))
    }
    const recipient = recipients.get(leadId) ?? null

    // Sem data fechada no calendário não há tour a anunciar. Acontece se as
    // datas forem apagadas depois do agendamento; o log fica pendente em vez
    // de sair um e-mail sobre uma viagem que não existe mais.
    if (!recipient) {
      skipped++
      console.warn(`[cron] Lead ${leadId} ohne bestätigtes Datum — E-Mail übersprungen.`)
      continue
    }

    const emailNum = log.email_number as SequenceEmailNumber
    const result = await sendTourSequenceEmail(emailNum, recipient)

    // Identidade do template gravada em todo caminho de envio — logs antigos
    // por número puro são o que o backfill teve que consertar.
    const templateSlug = EMAIL_NUMBER_TO_SLUG[emailNum] ?? null
    const phase = EMAIL_SEQUENCE.find((e) => e.number === emailNum)?.phase ?? null

    if ('error' in result) {
      errors++
      console.error(`[cron] Fehler bei E-Mail #${emailNum} für ${recipient.email}:`, result.error)
      await supabaseAdmin
        .from('email_sequence_log')
        .update({
          status: 'error',
          error_message: result.error,
          template_slug: templateSlug,
          phase,
        })
        .eq('id', log.id)
    } else {
      sent++
      console.log(`[cron] E-Mail #${emailNum} gesendet an ${recipient.email} (resend_id: ${result.id})`)
      await supabaseAdmin
        .from('email_sequence_log')
        .update({
          status: 'sent',
          sent_at: new Date().toISOString(),
          resend_id: result.id,
          error_message: null,
          template_slug: templateSlug,
          phase,
        })
        .eq('id', log.id)
    }
  }

  const summary = { processed: logs.length, sent, errors, skipped }
  console.log('[cron] Zusammenfassung:', summary)

  return Response.json(summary)
}

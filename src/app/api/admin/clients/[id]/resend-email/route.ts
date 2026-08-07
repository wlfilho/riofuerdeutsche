import { createClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { EMAIL_NUMBER_TO_SLUG, EMAIL_SEQUENCE, type SequenceEmailNumber } from '@/lib/tour-email-scheduler'
import { sendTourSequenceEmail } from '@/lib/email/sendTourSequenceEmail'

async function verifyAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { authorized: false, supabase }
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()
  return { authorized: profile?.role === 'admin', supabase }
}

// POST — Reenviar um email específico
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { authorized, supabase } = await verifyAdmin()
  if (!authorized) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await params // ensure params are resolved (id not needed here, client comes from log)

  const body = await request.json()
  const { email_log_id } = body

  if (!email_log_id) {
    return NextResponse.json({ error: 'email_log_id é obrigatório.' }, { status: 400 })
  }

  // Buscar o registro de log
  const { data: log, error: logError } = await supabase
    .from('email_sequence_log')
    .select('*')
    .eq('id', email_log_id)
    .single()

  if (logError) {
    const status = logError.code === 'PGRST116' ? 404 : 500
    return NextResponse.json({ error: logError.message }, { status })
  }

  // Buscar dados completos do cliente
  const { data: client, error: clientError } = await supabase
    .from('tour_clients')
    .select('name, email, arrival_date, departure_date, tour_details, total_amount, deposit_amount')
    .eq('id', log.client_id)
    .single()

  if (clientError) return NextResponse.json({ error: clientError.message }, { status: 500 })

  // Enviar via template resolvido do banco por (slug, locale do destinatário)
  const emailNum = log.email_number as SequenceEmailNumber
  const result = await sendTourSequenceEmail(emailNum, log.client_id, {
    name: client.name,
    email: client.email,
    arrival_date: client.arrival_date,
    departure_date: client.departure_date,
    tour_details: client.tour_details ?? undefined,
    total_amount: client.total_amount ?? null,
    deposit_amount: client.deposit_amount ?? null,
  })

  const sendError = 'error' in result ? result.error : null
  const resendId = 'id' in result ? result.id || null : null

  // Atualizar o log — sempre gravando a identidade do template
  const { error: updateError } = await supabase
    .from('email_sequence_log')
    .update({
      status: sendError ? 'error' : 'sent',
      sent_at: sendError ? null : new Date().toISOString(),
      resend_id: resendId,
      error_message: sendError,
      template_slug: EMAIL_NUMBER_TO_SLUG[emailNum] ?? log.template_slug,
      phase: EMAIL_SEQUENCE.find((e) => e.number === emailNum)?.phase ?? log.phase,
    })
    .eq('id', email_log_id)

  if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 })

  if (sendError) {
    return NextResponse.json({ error: sendError }, { status: 500 })
  }

  return NextResponse.json({ success: true, resend_id: resendId })
}

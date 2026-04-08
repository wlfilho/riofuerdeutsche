import { createClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { sendTourEmail } from '@/lib/email-templates'
import { sendConfirmationEmail } from '@/lib/email/sendConfirmationEmail'

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

  // Enviar via template
  let resendId: string | null = null
  let sendError: string | null = null

  const emailNum = log.email_number as 1 | 2 | 3 | 4
  
  if (emailNum === 1) {
    try {
      const result = await sendConfirmationEmail(log.client_id)
      resendId = result.id || null
    } catch (error: any) {
      sendError = error.message
    }
  } else {
    const result = await sendTourEmail(emailNum, {
      name: client.name,
      email: client.email,
      arrival_date: client.arrival_date,
      departure_date: client.departure_date,
      tour_details: client.tour_details ?? undefined,
      total_amount: client.total_amount ?? null,
      deposit_amount: client.deposit_amount ?? null,
    })
    if ('error' in result) {
      sendError = result.error
    } else {
      resendId = result.id || null
    }
  }

  // Atualizar o log
  const { error: updateError } = await supabase
    .from('email_sequence_log')
    .update({
      status: sendError ? 'error' : 'sent',
      sent_at: sendError ? null : new Date().toISOString(),
      resend_id: resendId,
      error_message: sendError,
    })
    .eq('id', email_log_id)

  if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 })

  if (sendError) {
    return NextResponse.json({ error: sendError }, { status: 500 })
  }

  return NextResponse.json({ success: true, resend_id: resendId })
}

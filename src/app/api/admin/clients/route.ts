import { createClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { calculateSchedule } from '@/lib/tour-email-scheduler'
import { sendTourEmail } from '@/lib/email-templates'

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

// GET — Listar todos os clientes com contagem de emails
export async function GET() {
  const { authorized, supabase } = await verifyAdmin()
  if (!authorized) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: clients, error } = await supabase
    .from('tour_clients')
    .select('id, name, email, arrival_date, departure_date, status, created_at')
    .order('arrival_date', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Buscar contagens de email para todos os clientes
  const clientIds = (clients ?? []).map(c => c.id)

  let emailCounts: { client_id: string; status: string }[] = []
  if (clientIds.length > 0) {
    const { data } = await supabase
      .from('email_sequence_log')
      .select('client_id, status')
      .in('client_id', clientIds)
    emailCounts = data ?? []
  }

  const result = (clients ?? []).map(client => {
    const clientEmails = emailCounts.filter(e => e.client_id === client.id)
    return {
      ...client,
      emails_sent: clientEmails.filter(e => e.status === 'sent').length,
      emails_total: clientEmails.length,
    }
  })

  return NextResponse.json({ clients: result })
}

// POST — Criar novo cliente e agendar sequência de emails
export async function POST(request: NextRequest) {
  const { authorized, supabase } = await verifyAdmin()
  if (!authorized) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { name, email, arrival_date, departure_date, tour_details } = body

  if (!name || !email || !arrival_date || !departure_date) {
    return NextResponse.json(
      { error: 'name, email, arrival_date e departure_date são obrigatórios.' },
      { status: 400 }
    )
  }

  if (new Date(arrival_date) >= new Date(departure_date)) {
    return NextResponse.json(
      { error: 'arrival_date deve ser anterior a departure_date.' },
      { status: 400 }
    )
  }

  // Inserir cliente
  const { data: client, error: clientError } = await supabase
    .from('tour_clients')
    .insert({ name, email, arrival_date, departure_date, tour_details: tour_details ?? null })
    .select()
    .single()

  if (clientError) return NextResponse.json({ error: clientError.message }, { status: 500 })

  // Calcular sequência de emails
  const schedule = calculateSchedule(new Date(arrival_date))

  const logRows = schedule.map(item => ({
    client_id: client.id,
    email_number: item.number,
    email_name: item.name,
    scheduled_date: item.date.toISOString().split('T')[0],
    status: item.status,
  }))

  const { data: emailLogs, error: logError } = await supabase
    .from('email_sequence_log')
    .insert(logRows)
    .select()

  if (logError) return NextResponse.json({ error: logError.message }, { status: 500 })

  // Disparar email #1 imediatamente
  const email1Log = emailLogs?.find(l => l.email_number === 1)

  let resendId: string | null = null
  let sendError: string | null = null

  const result = await sendTourEmail(1, { name, email, arrival_date, departure_date, tour_details })
  if ('error' in result) {
    sendError = result.error
  } else {
    resendId = result.id
  }

  // Atualizar log do email #1
  if (email1Log) {
    await supabase
      .from('email_sequence_log')
      .update({
        status: sendError ? 'error' : 'sent',
        sent_at: sendError ? null : new Date().toISOString(),
        resend_id: resendId,
        error_message: sendError,
      })
      .eq('id', email1Log.id)
  }

  return NextResponse.json({ client }, { status: 201 })
}

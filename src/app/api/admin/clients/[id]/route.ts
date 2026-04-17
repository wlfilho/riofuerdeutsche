import { createClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

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

// GET — Detalhe de um cliente com histórico de emails
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { authorized, supabase } = await verifyAdmin()
  if (!authorized) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params

  const [
    { data: client, error: clientError },
    { data: sequenceDef, error: defError },
    { data: logs, error: logsError }
  ] = await Promise.all([
    supabase.from('tour_clients').select('*').eq('id', id).single(),
    supabase
      .from('email_sequence_definition')
      .select('sort_order, phase, template_slug, label')
      .eq('is_active', true)
      .order('sort_order', { ascending: true }),
    supabase
      .from('email_sequence_log')
      .select('*')
      .eq('client_id', id),
  ])

  if (clientError) {
    const status = clientError.code === 'PGRST116' ? 404 : 500
    return NextResponse.json({ error: clientError.message }, { status })
  }
  if (defError) return NextResponse.json({ error: defError.message }, { status: 500 })
  if (logsError) return NextResponse.json({ error: logsError.message }, { status: 500 })

  const emails = sequenceDef.map((def, index) => {
    const log = logs?.find(l => l.template_slug === def.template_slug)
    return {
      id: log?.id ?? 'pending-' + def.template_slug,
      email_number: index + 1,
      email_name: def.label,
      template_slug: def.template_slug,
      phase: def.phase,
      scheduled_date: log?.scheduled_date ?? null,
      sent_at: log?.sent_at ?? null,
      status: log?.status ?? 'not_sent',
      error_message: log?.error_message ?? null,
      resend_id: log?.resend_id ?? null,
    }
  })

  return NextResponse.json({ client, emails })
}

// PATCH — Atualizar dados de um cliente
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { authorized, supabase } = await verifyAdmin()
  if (!authorized) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const body = await request.json()

  const {
    name, email, phone, pax,
    arrival_date, departure_date,
    tour_details, status,
    total_amount, deposit_amount,
    internal_notes,
  } = body

  if (!name || !email || !arrival_date || !departure_date) {
    return NextResponse.json(
      { error: 'name, email, arrival_date e departure_date são obrigatórios.' },
      { status: 400 }
    )
  }

  const { data: client, error } = await supabase
    .from('tour_clients')
    .update({
      name,
      email,
      phone: phone ?? null,
      pax: pax ?? 1,
      arrival_date,
      departure_date,
      tour_details: tour_details ?? null,
      status,
      total_amount: total_amount !== undefined ? total_amount : null,
      deposit_amount: deposit_amount !== undefined ? deposit_amount : null,
      internal_notes: internal_notes ?? null,
    })
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ client })
}

// DELETE — Remover um cliente
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { authorized, supabase } = await verifyAdmin()
  if (!authorized) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params

  const { error } = await supabase
    .from('tour_clients')
    .delete()
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}

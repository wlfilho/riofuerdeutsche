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

  const [{ data: client, error: clientError }, { data: emails, error: emailsError }] =
    await Promise.all([
      supabase.from('tour_clients').select('*').eq('id', id).single(),
      supabase
        .from('email_sequence_log')
        .select('*')
        .eq('client_id', id)
        .order('email_number', { ascending: true }),
    ])

  if (clientError) {
    const status = clientError.code === 'PGRST116' ? 404 : 500
    return NextResponse.json({ error: clientError.message }, { status })
  }
  if (emailsError) return NextResponse.json({ error: emailsError.message }, { status: 500 })

  return NextResponse.json({ client, emails })
}

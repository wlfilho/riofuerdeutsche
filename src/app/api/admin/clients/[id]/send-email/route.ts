import { createClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { applyShortcodes } from '@/types/email-templates'

const resend = new Resend(process.env.RESEND_API_KEY)

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

function formatTourDetails(raw: string): string {
  if (!raw) return ''
  const lines = raw.split(/•|\n/).map(l => l.trim()).filter(l => l.length > 0)
  if (lines.length === 0) return raw
  return lines.map(line => `<span style="display:block;padding:3px 0;font-weight:normal;">• ${line}</span>`).join('')
}

function formatDate(dateStr: string): string {
  if (!dateStr) return ''
  const [year, month, day] = dateStr.split('-')
  if (!day) return dateStr
  return `${day}.${month}.${year}`
}

function formatCurrency(value: number | null): string {
  if (value === null) return '0,00 €'
  return value.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €'
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { authorized, supabase } = await verifyAdmin()
  if (!authorized) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id: clientId } = await params
  const { template_slug } = await request.json()

  if (!template_slug) {
    return NextResponse.json({ error: 'template_slug é obrigatório.' }, { status: 400 })
  }

  // 1. Buscar template
  const { data: template, error: templateError } = await supabase
    .from('email_templates')
    .select('subject, html_body, name')
    .eq('slug', template_slug)
    .single()

  if (templateError || !template) {
    return NextResponse.json({ error: 'Template não encontrado.' }, { status: 404 })
  }

  // 2. Buscar cliente
  const { data: client, error: clientError } = await supabase
    .from('tour_clients')
    .select('*')
    .eq('id', clientId)
    .single()

  if (clientError || !client) {
    return NextResponse.json({ error: 'Cliente não encontrado.' }, { status: 404 })
  }

  // 3. Buscar assinatura
  const { data: sigData } = await supabase
    .from('site_settings')
    .select('value')
    .eq('key', 'email_assinatura')
    .single()

  // 4. Preparar replacements
  const replacements = {
    nome: client.name,
    email: client.email,
    data_chegada: formatDate(client.arrival_date),
    data_saida: formatDate(client.departure_date),
    tour: formatTourDetails(client.tour_details ?? ''),
    betrag_total: formatCurrency(client.total_amount),
    anzahlung: formatCurrency(client.deposit_amount),
    assinatura: sigData?.value ?? 'Viele Grüße aus Rio,',
  }

  const subject = applyShortcodes(template.subject, replacements)
  const html = applyShortcodes(template.html_body, replacements)

  // 5. Enviar via Resend
  let resendId: string | null = null
  let errorMessage: string | null = null
  let status: 'sent' | 'error' = 'sent'

  try {
    const { data: resendData, error: sendError } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'will@riofuerdeutsche.de',
      to: client.email,
      subject,
      html,
    })

    if (sendError) {
      status = 'error'
      errorMessage = sendError.message
    } else {
      resendId = resendData?.id ?? null
    }
  } catch (err: any) {
    status = 'error'
    errorMessage = err.message || String(err)
  }

  // 6. Inserir no log
  const { data: log, error: logError } = await supabase
    .from('email_sequence_log')
    .insert({
      client_id: clientId,
      template_slug: template_slug,
      email_name: template.name,
      status,
      sent_at: status === 'sent' ? new Date().toISOString() : null,
      resend_id: resendId,
      error_message: errorMessage,
      scheduled_date: new Date().toISOString().split('T')[0],
      email_number: 1, // placeholder
    })
    .select('id')
    .single()

  if (logError) {
    console.error('Erro ao gravar log:', logError)
  }

  return NextResponse.json({
    success: status === 'sent',
    resend_id: resendId,
    log_id: log?.id,
    error: errorMessage
  })
}

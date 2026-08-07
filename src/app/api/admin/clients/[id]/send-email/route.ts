import { createClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import {
  formatEmailCurrency,
  formatEmailDate,
  formatTourDetailsHtml,
  getEmailTemplate,
  getRecipientLocale,
  renderTemplate,
} from '@/lib/email/render'

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

  // 1. Buscar cliente (antes do template: o locale dele decide a variante)
  const { data: client, error: clientError } = await supabase
    .from('tour_clients')
    .select('*')
    .eq('id', clientId)
    .single()

  if (clientError || !client) {
    return NextResponse.json({ error: 'Cliente não encontrado.' }, { status: 404 })
  }

  // 2. Resolver template por (slug, locale) com cascata
  const locale = await getRecipientLocale(client.email)
  const template = await getEmailTemplate(template_slug, locale)

  if (!template) {
    return NextResponse.json({ error: 'Template não encontrado.' }, { status: 404 })
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
    data_chegada: formatEmailDate(client.arrival_date, locale),
    data_saida: formatEmailDate(client.departure_date, locale),
    tour: formatTourDetailsHtml(client.tour_details ?? ''),
    betrag_total: formatEmailCurrency(client.total_amount, locale),
    anzahlung: formatEmailCurrency(client.deposit_amount, locale),
    assinatura: sigData?.value ?? 'Viele Grüße aus Rio,',
  }

  const subject = renderTemplate(template.subject, replacements)
  const html = renderTemplate(template.html_body, replacements)

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

  // 6. Fase da sequência quando o slug pertence a ela (envio manual avulso fica sem fase)
  const { data: def } = await supabase
    .from('email_sequence_definition')
    .select('phase')
    .eq('template_slug', template_slug)
    .maybeSingle()

  // 7. Inserir no log
  const { data: log, error: logError } = await supabase
    .from('email_sequence_log')
    .insert({
      client_id: clientId,
      template_slug: template_slug,
      phase: def?.phase ?? null,
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

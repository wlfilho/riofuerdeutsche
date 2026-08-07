import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createClient } from '@/utils/supabase/server'
import {
  formatEmailCurrency,
  formatEmailDate,
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

export async function POST(request: Request) {
  const { authorized, supabase } = await verifyAdmin()
  if (!authorized) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { slug, htmlBody, subject, clientId } = await request.json()

    if (!clientId) {
      return NextResponse.json({ error: 'clientId é obrigatório.' }, { status: 400 })
    }

    // Buscar dados do cliente
    const { data: client, error: clientError } = await supabase
      .from('tour_clients')
      .select('name, email, arrival_date, departure_date, tour_details, total_amount, deposit_amount')
      .eq('id', clientId)
      .single()

    if (clientError || !client) {
      return NextResponse.json({ error: 'Cliente não encontrado.' }, { status: 404 })
    }

    const locale = await getRecipientLocale(client.email)

    // Resolver template — o editor pode mandar conteúdo não salvo (htmlBody/subject)
    let finalHtml = htmlBody
    let finalSubject = subject

    if (slug && (!htmlBody || !subject)) {
      const template = await getEmailTemplate(slug, locale)
      if (!template) {
        return NextResponse.json({ error: 'Template not found.' }, { status: 404 })
      }
      finalHtml = template.html_body
      finalSubject = template.subject
    }

    if (!finalHtml || !finalSubject) {
      return NextResponse.json({ error: 'Conteúdo do template em falta.' }, { status: 400 })
    }

    // null/undefined continuam virando string vazia (não "0,00 €"), como antes.
    const formatAmount = (val: number | null) => {
      if (val === null || val === undefined) return ''
      return formatEmailCurrency(val, locale)
    }

    const shortcodeData: Record<string, string> = {
      nome: client.name,
      email: client.email,
      tour: client.tour_details ?? '',
      data_chegada: formatEmailDate(client.arrival_date, locale),
      data_saida: formatEmailDate(client.departure_date, locale),
      anzahlung: formatAmount(client.deposit_amount),
      betrag_total: formatAmount(client.total_amount),
      assinatura: 'Viele Grüße aus Rio,',
    }

    const replacedHtml = renderTemplate(finalHtml, shortcodeData)
    const replacedSubject = renderTemplate(finalSubject, shortcodeData)

    const { error } = await resend.emails.send({
      from: 'Rio für Deutsche <noreply@riofuerdeutsche.de>',
      to: client.email,
      subject: replacedSubject,
      html: replacedHtml,
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

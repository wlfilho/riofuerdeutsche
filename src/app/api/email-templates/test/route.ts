import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { getEmailTemplateBySlug } from '@/app/actions/email-templates'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: Request) {
  try {
    const { slug, htmlBody, subject } = await request.json()

    let finalHtml = htmlBody
    let finalSubject = subject

    if (slug && (!htmlBody || !subject)) {
      const template = await getEmailTemplateBySlug(slug)
      if (!template) {
        return NextResponse.json({ success: false, error: 'Template not found' }, { status: 404 })
      }
      finalHtml = template.html_body
      finalSubject = template.subject
    }

    if (!finalHtml || !finalSubject) {
      return NextResponse.json({ success: false, error: 'Missing content' }, { status: 400 })
    }

    const testData: Record<string, string> = {
      nome: 'Max Mustermann',
      email: 'test@example.com',
      tour: 'Sa. 02.05. – Transfer: Flughafen GIG → Hotel\nSo. 03.05. – Fußball: Flamengo × Vasco – Maracanã\nDi. 05.05. – Klassiker-Tour: Cristo, Zuckerhut, Lapa, Santa Teresa', // placeholder de teste
      data_chegada: '02.05.2026',
      data_saida: '08.05.2026',
      anzahlung: '200,00 €',
      betrag_total: '1.000,00 €',
      assinatura: 'Viele Grüße aus Rio,',
    }

    let replacedHtml = finalHtml
    for (const [key, value] of Object.entries(testData)) {
      replacedHtml = replacedHtml.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value)
    }

    const emailSubject = '[TEST] Buchungsbestätigung – Rio für Deutsche'

    const { error } = await resend.emails.send({
      from: 'Will · Rio für Deutsche <will@riofuerdeutsche.de>',
      to: 'lantelmew@gmail.com',
      subject: emailSubject,
      html: replacedHtml,
    })

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}

import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import { ShortcodeKey } from '@/types/email-templates'
import { getEmailTemplate, getRecipientLocale, renderTemplate } from './render'

const resend = new Resend(process.env.RESEND_API_KEY)

type SendTemplatedEmailParams = {
  slug: string
  to: string
  data: Partial<Record<ShortcodeKey, string>>
  subjectOverride?: string
  /** Locale do destinatário; sem ele, resolve por `contacts.locale` do `to`. */
  locale?: string
}

export async function sendTemplatedEmail({
  slug,
  to,
  data,
  subjectOverride,
  locale,
}: SendTemplatedEmailParams): Promise<{ success: boolean; error?: string; id?: string }> {
  try {
    const resolvedLocale = locale ?? (await getRecipientLocale(to))
    const template = await getEmailTemplate(slug, resolvedLocale)

    if (!template) {
      return { success: false, error: `Template "${slug}" não encontrado.` }
    }

    // Assinatura global via service role: este caminho também roda sem sessão
    // (cron), onde a RLS admin-only de site_settings derrubaria a leitura.
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    )
    const { data: sigData } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'email_assinatura')
      .single()

    const dataWithSignature: Partial<Record<ShortcodeKey, string>> = {
      assinatura: sigData?.value ?? '',
      ...data, // data do caller sobrescreve se precisar de assinatura customizada
    }

    const subject = renderTemplate(subjectOverride ?? template.subject, dataWithSignature)
    const html = renderTemplate(template.html_body, dataWithSignature)

    const { data: resendData, error: sendError } = await resend.emails.send({
      from: 'Will · Rio für Deutsche <will@riofuerdeutsche.de>',
      to,
      subject,
      html,
    })

    if (sendError) return { success: false, error: sendError.message }
    return { success: true, id: resendData?.id }
  } catch (err) {
    return { success: false, error: String(err) }
  }
}

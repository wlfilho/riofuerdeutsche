import { createClient } from '@/utils/supabase/server'
import { Resend } from 'resend'
import { ShortcodeKey, applyShortcodes } from '@/types/email-templates'

const resend = new Resend(process.env.RESEND_API_KEY)

type SendTemplatedEmailParams = {
  slug: string
  to: string
  data: Partial<Record<ShortcodeKey, string>>
  subjectOverride?: string
}

export async function sendTemplatedEmail({
  slug,
  to,
  data,
  subjectOverride,
}: SendTemplatedEmailParams): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient()

    const { data: template, error: dbError } = await supabase
      .from('email_templates')
      .select('subject, html_body')
      .eq('slug', slug)
      .single()

    if (dbError || !template) {
      return { success: false, error: `Template "${slug}" não encontrado.` }
    }

    const subject = applyShortcodes(subjectOverride ?? template.subject, data)
    const html = applyShortcodes(template.html_body, data)

    const { error: sendError } = await resend.emails.send({
      from: 'Will · Rio für Deutsche <will@riofuerdeutsche.de>',
      to,
      subject,
      html,
    })

    if (sendError) return { success: false, error: sendError.message }
    return { success: true }
  } catch (err) {
    return { success: false, error: String(err) }
  }
}

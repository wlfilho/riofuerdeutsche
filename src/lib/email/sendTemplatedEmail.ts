import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import { ShortcodeKey } from '@/types/email-templates'
import { getEmailTemplate, getRecipientLocale, htmlToPlainText, renderTemplate } from './render'

const resend = new Resend(process.env.RESEND_API_KEY)

type SendTemplatedEmailParams = {
  slug: string
  to: string
  data: Partial<Record<ShortcodeKey, string>>
  subjectOverride?: string
  /** Locale do destinatário; sem ele, resolve por `contacts.locale` do `to`. */
  locale?: string
  /** Cópia oculta — usada para o Will guardar o envio na própria caixa. */
  bcc?: string
  /**
   * Ajuste no HTML já interpolado, para blocos que só existem sob condição
   * (o template não tem `if`). Ex.: remover o botão do Instagram quando não há
   * perfil configurado.
   */
  transformHtml?: (html: string) => string
}

export async function sendTemplatedEmail({
  slug,
  to,
  data,
  subjectOverride,
  locale,
  bcc,
  transformHtml,
}: SendTemplatedEmailParams): Promise<{
  success: boolean
  error?: string
  id?: string
  /** Assunto já interpolado — quem registra o envio em log grava este texto. */
  subject?: string
}> {
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
    const rendered = renderTemplate(template.html_body, dataWithSignature)
    const html = transformHtml ? transformHtml(rendered) : rendered

    // Sem `reply_to` de propósito: o `from` já É a caixa real do Will
    // (riofuerdeutsche.de tem MX do Google), então responder devolve para
    // alguém que lê. Um Reply-To num domínio diferente do From é justamente o
    // tipo de divergência que os filtros alemães contam contra o remetente.
    const { data: resendData, error: sendError } = await resend.emails.send({
      from: 'Will · Rio für Deutsche <will@riofuerdeutsche.de>',
      to,
      ...(bcc ? { bcc } : {}),
      subject,
      html,
      // Parte em texto puro em todo envio: só-HTML é sinal negativo nos
      // provedores alemães (GMX, Web.de, T-Online), que são o público.
      text: htmlToPlainText(html),
    })

    if (sendError) return { success: false, error: sendError.message, subject }
    return { success: true, id: resendData?.id, subject }
  } catch (err) {
    return { success: false, error: String(err) }
  }
}

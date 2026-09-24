import { createHash } from 'node:crypto'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import { getEmailTemplate, getRecipientLocale, htmlToPlainText, renderTemplate } from './render'

/**
 * Envio de e-mail de campanha em lote (admin /admin/campanhas).
 *
 * Service role de propósito, mesmo motivo de `render.ts`: a RLS de
 * `campaign_sends`, `contacts` e `site_settings` é admin-only, e a lista de
 * destinatários é sempre recalculada aqui no servidor, nunca vinda do client.
 */

const resend = new Resend(process.env.RESEND_API_KEY)

// Idêntico a sendTemplatedEmail.ts, sem `reply_to` pelo mesmo motivo comentado lá.
const FROM = 'Will · Rio für Deutsche <will@riofuerdeutsche.de>'

/** Limite de e-mails por chamada de `resend.batch.send`. */
const BATCH_SIZE = 100

export type CampaignRecipient = {
  leadId: string
  email: string // já normalizado: trim + lowercase
  name: string
  firstName: string
  pax: number | null
}

export type SkippedRecipient = {
  email: string
  name: string
  reason: 'already_sent' | 'opt_out' | 'duplicate' | 'no_email'
}

export type RenderedCampaignEmail = {
  subject: string
  html: string
  text: string
}

/** Shortcode sem valor no template; a rota devolve 422 para este caso. */
export class UnresolvedShortcodeError extends Error {
  constructor(templateSlug: string, public shortcode: string) {
    super(`Shortcode não resolvido no template "${templateSlug}": ${shortcode}`)
    this.name = 'UnresolvedShortcodeError'
  }
}

function serviceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
}

const normalizeEmail = (email: string | null | undefined) => (email ?? '').trim().toLowerCase()

/** Tags da Resend só aceitam letras, números, `_` e `-`. */
const tagValue = (value: string) => value.replace(/[^A-Za-z0-9_-]/g, '_')

export async function getCampaignRecipients(
  campaign: string,
  templateSlug: string,
): Promise<{ eligible: CampaignRecipient[]; skipped: SkippedRecipient[] }> {
  const supabase = serviceClient()

  const [leadsRes, optOutRes, sentRes] = await Promise.all([
    supabase
      .from('price_leads')
      .select('id, name, email, pax, created_at')
      .eq('campaign', campaign)
      .is('archived_at', null)
      .order('created_at', { ascending: true }),
    supabase.from('contacts').select('email').not('email_opt_out_at', 'is', null),
    supabase
      .from('campaign_sends')
      .select('to_email')
      .eq('template_slug', templateSlug)
      .eq('status', 'sent'),
  ])

  // Falha de leitura aqui não pode virar "lista vazia de exclusões": sem o
  // opt-out ou o histórico, o lote mandaria para quem não devia.
  if (leadsRes.error) throw new Error(`Erro ao ler leads: ${leadsRes.error.message}`)
  if (optOutRes.error) throw new Error(`Erro ao ler descadastros: ${optOutRes.error.message}`)
  if (sentRes.error) throw new Error(`Erro ao ler histórico de envios: ${sentRes.error.message}`)

  const optedOut = new Set((optOutRes.data ?? []).map((c) => normalizeEmail(c.email)))
  const alreadySent = new Set((sentRes.data ?? []).map((s) => normalizeEmail(s.to_email)))

  const eligible: CampaignRecipient[] = []
  const skipped: SkippedRecipient[] = []
  const seen = new Set<string>()

  // Ordenado por created_at asc: o primeiro lead de cada e-mail é o mais antigo.
  for (const lead of leadsRes.data ?? []) {
    const name = (lead.name ?? '').trim()
    const email = normalizeEmail(lead.email)

    if (!email) {
      skipped.push({ email: '', name, reason: 'no_email' })
      continue
    }
    if (seen.has(email)) {
      skipped.push({ email, name, reason: 'duplicate' })
      continue
    }
    seen.add(email)

    if (optedOut.has(email)) {
      skipped.push({ email, name, reason: 'opt_out' })
      continue
    }
    if (alreadySent.has(email)) {
      skipped.push({ email, name, reason: 'already_sent' })
      continue
    }

    eligible.push({
      leadId: lead.id,
      email,
      name,
      // Mesmo padrão de sendAnfrageBestaetigung.
      firstName: name.split(' ')[0],
      pax: lead.pax ?? null,
    })
  }

  return { eligible, skipped }
}

export async function renderCampaignEmail(
  templateSlug: string,
  recipient: Pick<CampaignRecipient, 'email' | 'firstName' | 'pax'>,
): Promise<RenderedCampaignEmail> {
  const locale = await getRecipientLocale(recipient.email)
  const template = await getEmailTemplate(templateSlug, locale)
  if (!template) throw new Error(`Template "${templateSlug}" não encontrado.`)

  // Mesma query de sendTemplatedEmail.ts, copiada para não mexer no original.
  const supabase = serviceClient()
  const { data: sigData } = await supabase
    .from('site_settings')
    .select('value')
    .eq('key', 'email_assinatura')
    .single()

  const data: Record<string, string> = {
    nome: recipient.firstName,
    email: recipient.email,
    pax: recipient.pax != null ? String(recipient.pax) : '',
    assinatura: sigData?.value ?? '',
  }

  const subject = renderTemplate(template.subject, data)
  const html = renderTemplate(template.html_body, data)

  // Trava de segurança: renderTemplate deixa `{{chave}}` visível quando não
  // tem o valor. Num envio em massa isso tem que bloquear tudo, não sair
  // errado para a lista inteira.
  const leftover = `${subject}\n${html}`.match(/\{\{\s*([^}]*?)\s*\}\}|\{\{/)
  if (leftover) {
    const code = leftover[1] ? `{{${leftover[1]}}}` : '{{'
    throw new UnresolvedShortcodeError(templateSlug, code)
  }

  return { subject, html, text: htmlToPlainText(html) }
}

export async function sendCampaignBatch({
  campaign,
  templateSlug,
}: {
  campaign: string
  templateSlug: string
}): Promise<{ sent: number; failed: number; errors: string[] }> {
  const { eligible } = await getCampaignRecipients(campaign, templateSlug)

  // Renderiza todos antes de enviar qualquer um: se um falhar, lança e nada sai.
  const rendered = await Promise.all(
    eligible.map(async (recipient) => ({
      recipient,
      email: await renderCampaignEmail(templateSlug, recipient),
    })),
  )

  const supabase = serviceClient()
  const tags = [
    { name: 'campaign', value: tagValue(campaign) },
    { name: 'template', value: tagValue(templateSlug) },
  ]

  let sent = 0
  let failed = 0
  const errors: string[] = []

  for (let start = 0; start < rendered.length; start += BATCH_SIZE) {
    const chunk = rendered.slice(start, start + BATCH_SIZE)

    // Chave de idempotência por (template, destinatários do bloco): um duplo
    // clique que dispare duas requisições em paralelo não manda o mesmo bloco
    // duas vezes. O índice único de campaign_sends só barra o registro, não o
    // e-mail, porque o registro acontece depois do envio.
    const emailsHash = createHash('sha256')
      .update(chunk.map((c) => c.recipient.email).sort().join(','))
      .digest('hex')
      .slice(0, 32)

    const { data, error } = await resend.batch.send(
      chunk.map(({ recipient, email }) => ({
        from: FROM,
        to: recipient.email,
        subject: email.subject,
        html: email.html,
        text: email.text,
        tags,
      })),
      { idempotencyKey: `campaign/${tagValue(templateSlug)}/${emailsHash}` },
    )

    // v6 (modo strict, o padrão): sucesso é `{ data: { data: [{ id }] } }`,
    // um id por e-mail na mesma ordem do payload. Erro derruba o bloco inteiro.
    const ids = data?.data ?? []
    const blockFailed = !!error || ids.length !== chunk.length
    const blockError = error
      ? error.message
      : `Resend devolveu ${ids.length} ids para ${chunk.length} e-mails.`

    const rows = chunk.map(({ recipient, email }, i) => ({
      campaign,
      template_slug: templateSlug,
      lead_id: recipient.leadId,
      to_email: recipient.email,
      subject: email.subject,
      status: blockFailed ? 'failed' : 'sent',
      resend_id: blockFailed ? null : ids[i]?.id ?? null,
      error_message: blockFailed ? blockError : null,
    }))

    const { error: insertError } = await supabase.from('campaign_sends').insert(rows)
    if (insertError) {
      // O e-mail já saiu (ou já falhou); só o registro não entrou. Reporta em
      // vez de lançar, para o resumo refletir o que de fato aconteceu.
      console.error('[sendCampaignBatch] erro ao registrar envios:', insertError.message)
      errors.push(`Erro ao registrar envios no banco: ${insertError.message}`)
    }

    if (blockFailed) {
      failed += chunk.length
      errors.push(blockError)
      // Bloco falhou: não segue para os próximos.
      break
    }
    sent += chunk.length
  }

  return { sent, failed, errors }
}

export async function sendCampaignTest({
  campaign,
  templateSlug,
  to,
}: {
  campaign: string
  templateSlug: string
  to: string
}): Promise<{ success: boolean; error?: string }> {
  const { eligible } = await getCampaignRecipients(campaign, templateSlug)
  const sample = eligible[0] ?? { email: '', firstName: 'Max', pax: null }

  const email = await renderCampaignEmail(templateSlug, sample)

  const { error } = await resend.emails.send({
    from: FROM,
    to,
    subject: `[TEST] ${email.subject}`,
    html: email.html,
    text: email.text,
  })

  if (error) return { success: false, error: error.message }
  return { success: true }
}

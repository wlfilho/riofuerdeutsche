import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { getCampaign } from '@/lib/campaigns'
import {
  UnresolvedShortcodeError,
  getCampaignRecipients,
  renderCampaignEmail,
  sendCampaignBatch,
  sendCampaignTest,
} from '@/lib/email/sendCampaignBatch'

export const maxDuration = 60

type Mode = 'preview' | 'test' | 'send'

async function verifyAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { authorized: false, supabase, user: null }
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()
  return { authorized: profile?.role === 'admin', supabase, user }
}

export async function POST(request: Request) {
  const { authorized, supabase, user } = await verifyAdmin()
  if (!authorized || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: { campaign?: unknown; templateSlug?: unknown; mode?: unknown; confirmCount?: unknown }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'JSON inválido.' }, { status: 400 })
  }

  const campaign = getCampaign(body.campaign)
  if (!campaign) {
    return NextResponse.json({ error: 'Campanha inválida.' }, { status: 400 })
  }

  const mode = body.mode as Mode
  if (mode !== 'preview' && mode !== 'test' && mode !== 'send') {
    return NextResponse.json({ error: 'Modo inválido.' }, { status: 400 })
  }

  const templateSlug = typeof body.templateSlug === 'string' ? body.templateSlug : ''
  const { data: templateRows } = await supabase
    .from('email_templates')
    .select('slug')
    .eq('slug', templateSlug)
    .eq('category', 'Campanha')
    .limit(1)
  if (!templateSlug || !templateRows || templateRows.length === 0) {
    return NextResponse.json({ error: 'Template de campanha inválido.' }, { status: 400 })
  }

  try {
    if (mode === 'preview') {
      const { eligible, skipped } = await getCampaignRecipients(campaign.slug, templateSlug)
      const sample = eligible[0] ?? { email: '', firstName: 'Max', pax: null }
      const rendered = await renderCampaignEmail(templateSlug, sample)
      return NextResponse.json({
        eligible,
        skipped,
        subject: rendered.subject,
        previewHtml: rendered.html,
      })
    }

    if (mode === 'test') {
      // E-mail do admin logado, nunca hardcoded (regra do CLAUDE.md).
      if (!user.email) {
        return NextResponse.json({ error: 'Usuário sem e-mail.' }, { status: 400 })
      }
      const result = await sendCampaignTest({
        campaign: campaign.slug,
        templateSlug,
        to: user.email,
      })
      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 502 })
      }
      return NextResponse.json({ success: true, to: user.email })
    }

    // mode === 'send': a contagem confirmada na tela tem que bater com a lista
    // recalculada agora. Se alguém entrou ou saiu desde a pré-visualização, o
    // Will precisa ver a lista nova antes de mandar.
    const { eligible } = await getCampaignRecipients(campaign.slug, templateSlug)
    if (body.confirmCount !== eligible.length) {
      return NextResponse.json(
        {
          error: 'A lista mudou desde a pré-visualização. Recarregue.',
          eligibleCount: eligible.length,
        },
        { status: 409 },
      )
    }

    const summary = await sendCampaignBatch({ campaign: campaign.slug, templateSlug })
    return NextResponse.json(summary)
  } catch (err) {
    if (err instanceof UnresolvedShortcodeError) {
      return NextResponse.json({ error: err.message }, { status: 422 })
    }
    const message = err instanceof Error ? err.message : String(err)
    console.error('[api/admin/campaigns/send]', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

'use server'

import { createClient } from '@/utils/supabase/server'

export type SiteSettings = {
  guide_rate_eur: number
  default_exchange_rate: number
  max_hours_per_day: number
  email_assinatura: string
  business_phone: string
  business_whatsapp: string
  business_email: string
  business_instagram: string
  business_facebook: string
  business_youtube: string
  business_telegram: string
  business_address: string
  bank_account_holder: string
  bank_iban: string
  bank_bic: string
  bank_name: string
}

export async function getSiteSettings(): Promise<SiteSettings> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('site_settings')
    .select(
      'guide_rate_eur, default_exchange_rate, max_hours_per_day, value, business_phone, business_whatsapp, business_email, business_instagram, business_facebook, business_youtube, business_telegram, business_address, bank_account_holder, bank_iban, bank_bic, bank_name'
    )
    .eq('key', 'email_assinatura')
    .single()

  return {
    guide_rate_eur: Number(data?.guide_rate_eur ?? 40),
    default_exchange_rate: Number(data?.default_exchange_rate ?? 0.17),
    max_hours_per_day: Number(data?.max_hours_per_day ?? 10),
    email_assinatura: data?.value ?? '',
    business_phone: data?.business_phone ?? '',
    business_whatsapp: data?.business_whatsapp ?? '',
    business_email: data?.business_email ?? '',
    business_instagram: data?.business_instagram ?? '',
    business_facebook: data?.business_facebook ?? '',
    business_youtube: data?.business_youtube ?? '',
    business_telegram: data?.business_telegram ?? '',
    business_address: data?.business_address ?? '',
    bank_account_holder: data?.bank_account_holder ?? '',
    bank_iban: data?.bank_iban ?? '',
    bank_bic: data?.bank_bic ?? '',
    bank_name: data?.bank_name ?? '',
  }
}

export async function saveSiteSettings(
  settings: SiteSettings
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  const { error } = await supabase
    .from('site_settings')
    .update({
      guide_rate_eur: settings.guide_rate_eur,
      default_exchange_rate: settings.default_exchange_rate,
      max_hours_per_day: settings.max_hours_per_day,
      value: settings.email_assinatura,
      business_phone: settings.business_phone,
      business_whatsapp: settings.business_whatsapp,
      business_email: settings.business_email,
      business_instagram: settings.business_instagram,
      business_facebook: settings.business_facebook,
      business_youtube: settings.business_youtube,
      business_telegram: settings.business_telegram,
      business_address: settings.business_address,
      bank_account_holder: settings.bank_account_holder,
      bank_iban: settings.bank_iban,
      bank_bic: settings.bank_bic,
      bank_name: settings.bank_name,
      updated_at: new Date().toISOString(),
    })
    .eq('key', 'email_assinatura')

  if (error) return { success: false, error: error.message }
  return { success: true }
}

// ─── Faixas de honorário por tamanho de grupo ────────────────────────────────
// Vivem em proposal_guide_rate_tiers (tabela própria, ver a migration
// 20260909100000). O guide_rate_eur acima continua sendo o fallback de pax que
// não cai em faixa nenhuma.

export type GuideRateTierInput = {
  // Ausente = linha nova, ainda não gravada.
  id?: string
  min_pax: number
  max_pax: number | null
  rate_eur: number
  sort_order: number
}

// Sobreposição faz findGuideRateTier escolher uma faixa arbitrária entre as
// candidatas, então é barrada aqui e não só na tela.
function validateGuideRateTiers(tiers: GuideRateTierInput[]): string | null {
  for (const t of tiers) {
    if (!Number.isFinite(t.min_pax) || t.min_pax < 1) return 'Faixa com mínimo de pessoas inválido.'
    if (t.max_pax !== null && (!Number.isFinite(t.max_pax) || t.max_pax < t.min_pax))
      return 'Faixa com máximo menor que o mínimo.'
    if (!Number.isFinite(t.rate_eur) || t.rate_eur < 0) return 'Faixa com honorário inválido.'
  }

  const sorted = [...tiers].sort((a, b) => a.min_pax - b.min_pax)
  for (let i = 0; i < sorted.length - 1; i++) {
    const curMax = sorted[i].max_pax
    if (curMax === null) return 'Faixa sem limite superior precisa ser a última.'
    if (sorted[i + 1].min_pax <= curMax) return 'Duas faixas cobrem o mesmo número de pessoas.'
  }
  return null
}

export async function saveGuideRateTiers(
  tiers: GuideRateTierInput[]
): Promise<{ success: boolean; error?: string }> {
  const invalid = validateGuideRateTiers(tiers)
  if (invalid) return { success: false, error: invalid }

  const supabase = await createClient()

  // Apaga só o que sumiu da tela; o resto é upsert, para as faixas manterem o
  // id (e não haver janela em que a tabela fica vazia).
  const { data: existing, error: readError } = await supabase
    .from('proposal_guide_rate_tiers')
    .select('id')
  if (readError) return { success: false, error: readError.message }

  const keep = new Set(tiers.map((t) => t.id).filter(Boolean))
  const toDelete = (existing ?? []).map((r) => r.id).filter((id) => !keep.has(id))

  const updates = tiers.filter((t) => t.id)
  const inserts = tiers.filter((t) => !t.id)

  if (updates.length > 0) {
    const { error } = await supabase.from('proposal_guide_rate_tiers').upsert(
      updates.map((t) => ({
        id: t.id,
        min_pax: t.min_pax,
        max_pax: t.max_pax,
        rate_eur: t.rate_eur,
        sort_order: t.sort_order,
        updated_at: new Date().toISOString(),
      }))
    )
    if (error) return { success: false, error: error.message }
  }

  if (inserts.length > 0) {
    const { error } = await supabase.from('proposal_guide_rate_tiers').insert(
      inserts.map((t) => ({
        min_pax: t.min_pax,
        max_pax: t.max_pax,
        rate_eur: t.rate_eur,
        sort_order: t.sort_order,
      }))
    )
    if (error) return { success: false, error: error.message }
  }

  if (toDelete.length > 0) {
    const { error } = await supabase
      .from('proposal_guide_rate_tiers')
      .delete()
      .in('id', toDelete)
    if (error) return { success: false, error: error.message }
  }

  return { success: true }
}

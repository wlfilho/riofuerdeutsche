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

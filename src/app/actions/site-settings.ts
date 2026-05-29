'use server'

import { createClient } from '@/utils/supabase/server'

export type SiteSettings = {
  guide_rate_eur: number
  default_exchange_rate: number
  max_hours_per_day: number
  email_assinatura: string
}

export async function getSiteSettings(): Promise<SiteSettings> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('site_settings')
    .select('guide_rate_eur, default_exchange_rate, max_hours_per_day, value')
    .eq('key', 'email_assinatura')
    .single()

  return {
    guide_rate_eur: Number(data?.guide_rate_eur ?? 40),
    default_exchange_rate: Number(data?.default_exchange_rate ?? 0.17),
    max_hours_per_day: Number(data?.max_hours_per_day ?? 10),
    email_assinatura: data?.value ?? '',
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
      updated_at: new Date().toISOString(),
    })
    .eq('key', 'email_assinatura')

  if (error) return { success: false, error: error.message }
  return { success: true }
}

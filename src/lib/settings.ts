import { createClient } from '@/utils/supabase/server'

export type Settings = {
  guide_rate_eur: number
  default_exchange_rate: number
  max_hours_per_day: number
  email_assinatura: string
}

export async function getSettings(): Promise<Settings> {
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

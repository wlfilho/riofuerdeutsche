import { cache } from 'react'
import { createClient } from '@/utils/supabase/server'

export type Settings = {
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
}

export const getSettings = cache(async (): Promise<Settings> => {
  const supabase = await createClient()
  const { data } = await supabase
    .from('site_settings')
    .select(
      'guide_rate_eur, default_exchange_rate, max_hours_per_day, value, business_phone, business_whatsapp, business_email, business_instagram, business_facebook, business_youtube, business_telegram, business_address'
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
  }
})

export type ContactUrls = {
  phone: string
  phoneHref: string
  whatsappHref: string
  email: string
  emailHref: string
  instagramHref: string
  youtubeHref: string
  facebookHref: string
  telegramHref: string
  telegram: string
  address: string
}

export function buildContactUrls(s: Settings): ContactUrls {
  const waNum = s.business_whatsapp.replace(/\D/g, '')
  const igHandle = s.business_instagram.replace(/^@/, '')
  const ytRaw = s.business_youtube
  const ytHref = ytRaw.startsWith('http') ? ytRaw : `https://${ytRaw}`
  const fbRaw = s.business_facebook
  const fbHref = fbRaw.startsWith('http') ? fbRaw : fbRaw ? `https://${fbRaw}` : ''
  const tgHandle = s.business_telegram.replace(/^@/, '')

  return {
    phone: s.business_phone,
    phoneHref: `tel:${s.business_phone.replace(/[\s\-()]/g, '')}`,
    whatsappHref: waNum ? `https://wa.me/${waNum}` : '',
    email: s.business_email,
    emailHref: s.business_email ? `mailto:${s.business_email}` : '',
    instagramHref: igHandle ? `https://instagram.com/${igHandle}` : '',
    youtubeHref: ytHref,
    facebookHref: fbHref,
    telegramHref: tgHandle ? `https://t.me/${tgHandle}` : '',
    telegram: s.business_telegram,
    address: s.business_address,
  }
}

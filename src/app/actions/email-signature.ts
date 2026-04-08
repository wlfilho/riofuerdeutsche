'use server'

import { createClient } from '@/utils/supabase/server'

export async function getEmailSignature(): Promise<string> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('site_settings')
    .select('value')
    .eq('key', 'email_assinatura')
    .single()

  return data?.value ?? ''
}

export async function saveEmailSignature(
  html: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  const { error } = await supabase
    .from('site_settings')
    .upsert({ key: 'email_assinatura', value: html })

  if (error) return { success: false, error: error.message }
  return { success: true }
}

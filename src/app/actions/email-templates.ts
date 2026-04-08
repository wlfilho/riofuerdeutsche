'use server'

import { createClient } from '@/utils/supabase/server'
import { EmailTemplate } from '@/types/email-templates'

export async function getEmailTemplates(): Promise<EmailTemplate[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('email_templates')
    .select('*')
    .order('name')

  if (error) throw new Error(error.message)
  return data ?? []
}

export async function getEmailTemplateBySlug(slug: string): Promise<EmailTemplate | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('email_templates')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error) return null
  return data
}

export async function saveEmailTemplate(
  slug: string,
  subject: string,
  html_body: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  const { error } = await supabase
    .from('email_templates')
    .update({ subject, html_body })
    .eq('slug', slug)

  if (error) return { success: false, error: error.message }
  return { success: true }
}

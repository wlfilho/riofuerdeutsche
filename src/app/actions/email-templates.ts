'use server'

import { createClient } from '@/utils/supabase/server'
import { EmailTemplate } from '@/types/email-templates'
import { DEFAULT_EMAIL_LOCALE } from '@/lib/email/render'

export async function getEmailTemplates(): Promise<EmailTemplate[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('email_templates')
    .select('*')
    .order('category').order('sort_order').order('locale')

  if (error) throw new Error(error.message)
  return data ?? []
}

export async function getEmailTemplateBySlug(
  slug: string,
  locale: string = DEFAULT_EMAIL_LOCALE
): Promise<EmailTemplate | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('email_templates')
    .select('*')
    .eq('slug', slug)
    .eq('locale', locale)
    .single()

  if (error) return null
  return data
}

export async function updateEmailTemplatesOrder(
  updates: { id: string; sort_order: number }[]
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  const promises = updates.map(({ id, sort_order }) =>
    supabase
      .from('email_templates')
      .update({ sort_order })
      .eq('id', id)
  )

  const results = await Promise.all(promises)
  const failed = results.find((r) => r.error)
  if (failed?.error) return { success: false, error: failed.error.message }
  return { success: true }
}

export async function saveEmailTemplate(
  slug: string,
  locale: string,
  subject: string,
  html_body: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  const { error } = await supabase
    .from('email_templates')
    .update({ subject, html_body, updated_at: new Date().toISOString() })
    .eq('slug', slug)
    .eq('locale', locale)

  if (error) return { success: false, error: error.message }
  return { success: true }
}

/**
 * Cria a variante de um template em outro idioma, copiando o conteúdo da
 * variante existente para o guia editar — nunca tradução automática.
 */
export async function duplicateEmailTemplate(
  slug: string,
  fromLocale: string,
  toLocale: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  const { data: source, error: sourceError } = await supabase
    .from('email_templates')
    .select('slug, name, subject, html_body, category, sort_order')
    .eq('slug', slug)
    .eq('locale', fromLocale)
    .single()

  if (sourceError || !source) {
    return { success: false, error: `Template "${slug}" (${fromLocale}) não encontrado.` }
  }

  const { error } = await supabase
    .from('email_templates')
    .insert({ ...source, locale: toLocale })

  if (error) return { success: false, error: error.message }
  return { success: true }
}

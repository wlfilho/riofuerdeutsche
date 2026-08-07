import { getEmailTemplateBySlug } from '@/app/actions/email-templates'
import { DEFAULT_EMAIL_LOCALE } from '@/lib/email/render'
import { notFound } from 'next/navigation'
import EmailTemplateEditorClient from './EmailTemplateEditorClient'

export default async function EmailTemplateEditorPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ locale?: string }>
}) {
  const { slug } = await params
  const { locale } = await searchParams
  const template = await getEmailTemplateBySlug(slug, locale ?? DEFAULT_EMAIL_LOCALE)
  if (!template) notFound()

  return <EmailTemplateEditorClient template={template} />
}

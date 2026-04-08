import { getEmailTemplateBySlug } from '@/app/actions/email-templates'
import { notFound } from 'next/navigation'
import EmailTemplateEditorClient from './EmailTemplateEditorClient'

export default async function EmailTemplateEditorPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const template = await getEmailTemplateBySlug(slug)
  if (!template) notFound()

  return <EmailTemplateEditorClient template={template} />
}

import { getEmailTemplates } from '@/app/actions/email-templates'
import Link from 'next/link'
import EmailTemplateListClient from './EmailTemplateListClient'

export default async function EmailTemplatesPage() {
  const templates = await getEmailTemplates()

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">E-Mail Templates</h1>
        <p className="text-gray-500 mt-1 text-sm">
          Bearbeite die HTML-Vorlagen für alle automatischen E-Mails. Verwende Shortcodes wie{' '}
          <code className="bg-gray-100 px-1 rounded text-xs">{'{{nome}}'}</code> für dynamische Inhalte.
        </p>
      </div>

      <EmailTemplateListClient templates={templates} />
    </div>
  )
}

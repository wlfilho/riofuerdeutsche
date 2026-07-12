import { getEmailTemplates } from '@/app/actions/email-templates'
import { getEmailSignature } from '@/app/actions/email-signature'
import EmailTemplateList from '@/components/admin/EmailTemplateList'
import EmailSignatureEditor from '@/components/admin/EmailSignatureEditor'

export default async function EmailTemplatesPage() {
  const [templates, signature] = await Promise.all([
    getEmailTemplates(),
    getEmailSignature(),
  ])

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">E-Mail Templates</h1>
        <p className="text-gray-500 mt-1 text-sm">
          Bearbeite die HTML-Vorlagen für alle automatischen E-Mails. Verwende Shortcodes wie{' '}
          <code className="bg-gray-100 px-1 rounded text-xs">{'{{nome}}'}</code> für dynamische Inhalte.
        </p>
      </div>

      <h2 className="text-base font-semibold text-gray-700 mb-4">Templates</h2>

      <EmailTemplateList initialTemplates={templates} />

      <hr className="border-gray-100 my-10" />

      <EmailSignatureEditor initialValue={signature} />
    </div>
  )
}

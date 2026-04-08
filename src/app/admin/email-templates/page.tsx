import { getEmailTemplates } from '@/app/actions/email-templates'
import Link from 'next/link'

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

      <div className="grid gap-4">
        {templates.map((template) => (
          <div
            key={template.slug}
            className="bg-white border border-gray-200 rounded-xl p-5 flex items-center justify-between hover:border-green-300 transition-colors"
          >
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-base font-semibold text-gray-900">{template.name}</span>
                <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-mono">
                  {template.slug}
                </span>
              </div>
              <p className="text-sm text-gray-500">
                <span className="font-medium text-gray-700">Betreff:</span> {template.subject}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Zuletzt bearbeitet: {new Date(template.updated_at).toLocaleDateString('de-DE', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
            <Link
              href={`/admin/email-templates/${template.slug}`}
              className="ml-4 shrink-0 bg-green-700 hover:bg-green-800 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              Bearbeiten
            </Link>
          </div>
        ))}
      </div>
    </div>
  )
}

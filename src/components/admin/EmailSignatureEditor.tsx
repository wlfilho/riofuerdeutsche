'use client'

import { useState } from 'react'
import { saveEmailSignature } from '@/app/actions/email-signature'

export default function EmailSignatureEditor({ initialValue }: { initialValue: string }) {
  const [html, setHtml] = useState(initialValue)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPreview, setShowPreview] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    const result = await saveEmailSignature(html)
    setSaving(false)
    if (result.success) {
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } else {
      setError(result.error ?? 'Fehler beim Speichern.')
    }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 mb-8">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-base font-semibold text-gray-900">E-Mail Assinatura</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Wird automaticamente als{' '}
            <code className="bg-gray-100 px-1 rounded text-xs font-mono">{'{{assinatura}}'}</code>{' '}
            in alle Templates eingefügt. Akzeptiert HTML (Links, Farben, Zeilenumbrüche).
          </p>
        </div>
        <button
          onClick={() => setShowPreview(!showPreview)}
          className="text-sm text-gray-500 hover:text-gray-700 border border-gray-200 px-3 py-1.5 rounded-lg transition-colors shrink-0 ml-4"
        >
          {showPreview ? 'Editor' : 'Vorschau'}
        </button>
      </div>

      {showPreview ? (
        <div
          className="border border-gray-200 rounded-lg p-4 min-h-[100px] bg-gray-50"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      ) : (
        <textarea
          value={html}
          onChange={(e) => setHtml(e.target.value)}
          rows={6}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-green-500 resize-y"
          placeholder='<p>Bis bald in Rio! 🌊<br><strong>Will</strong><br><a href="https://riofuerdeutsche.de">riofuerdeutsche.de</a></p>'
          spellCheck={false}
        />
      )}

      <div className="flex items-center gap-3 mt-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-green-700 hover:bg-green-800 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          {saving ? 'Wird gespeichert…' : saved ? '✓ Gespeichert' : 'Assinatura speichern'}
        </button>
        {error && <p className="text-red-500 text-sm">{error}</p>}
      </div>
    </div>
  )
}

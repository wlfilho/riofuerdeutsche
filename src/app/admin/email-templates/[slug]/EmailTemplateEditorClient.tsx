'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { EmailTemplate, SHORTCODES, applyExampleShortcodes } from '@/types/email-templates'
import { saveEmailTemplate } from '@/app/actions/email-templates'
import Link from 'next/link'
import { Send, Loader2 } from 'lucide-react'

export default function EmailTemplateEditorClient({ template }: { template: EmailTemplate }) {
  const router = useRouter()
  const [subject, setSubject] = useState(template.subject)
  const [htmlBody, setHtmlBody] = useState(template.html_body)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const [copiedKey, setCopiedKey] = useState<string | null>(null)

  const [sendingTest, setSendingTest] = useState(false)
  const [testToast, setTestToast] = useState<string | null>(null)

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    const result = await saveEmailTemplate(template.slug, subject, htmlBody)
    setSaving(false)
    if (result.success) {
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
      router.refresh()
    } else {
      setError(result.error ?? 'Fehler beim Speichern.')
    }
  }

  const copyShortcode = (key: string) => {
    navigator.clipboard.writeText(`{{${key}}}`)
    setCopiedKey(key)
    setTimeout(() => setCopiedKey(null), 1500)
  }

  const handleTestSend = async () => {
    setSendingTest(true)
    setTestToast(null)
    try {
      const res = await fetch('/api/email-templates/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: template.slug, subject, htmlBody }),
      })
      const data = await res.json()
      if (data.success) {
        setTestToast('Test-E-Mail gesendet an lantelmew@gmail.com ✓')
        setTimeout(() => setTestToast(null), 3000)
      } else {
        alert('Fehler: ' + data.error)
      }
    } catch (err: any) {
      alert('Fehler: ' + err.message)
    } finally {
      setSendingTest(false)
    }
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/email-templates" className="text-gray-400 hover:text-gray-600 transition-colors text-sm">
          ← Alle Templates
        </Link>
        <span className="text-gray-300">/</span>
        <h1 className="text-xl font-bold text-gray-900">{template.name}</h1>
        <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-mono">{template.slug}</span>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Editor — 3 cols */}
        <div className="xl:col-span-3 space-y-4">
          {/* Subject */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Betreff</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          {/* HTML Body */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">HTML-Inhalt</label>
            <textarea
              value={htmlBody}
              onChange={(e) => setHtmlBody(e.target.value)}
              rows={28}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-green-500 resize-y"
              spellCheck={false}
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-green-700 hover:bg-green-800 disabled:opacity-50 text-white text-sm font-medium px-5 py-2 rounded-lg transition-colors"
            >
              {saving ? 'Wird gespeichert…' : saved ? '✓ Gespeichert' : 'Speichern'}
            </button>
            <button
              onClick={() => setShowPreview(true)}
              className="border border-gray-200 hover:border-gray-300 text-gray-700 text-sm font-medium px-5 py-2 rounded-lg transition-colors"
            >
              Vorschau
            </button>
            <div className="relative flex flex-col items-center">
              <button
                onClick={handleTestSend}
                disabled={sendingTest}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors disabled:opacity-50"
              >
                {sendingTest ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Wird gesendet…
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    Test senden
                  </>
                )}
              </button>
              {testToast && (
                <span className="absolute top-full mt-1.5 whitespace-nowrap text-xs font-medium bg-green-100 text-green-800 px-2 py-1 rounded shadow-sm z-10">
                  {testToast}
                </span>
              )}
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
          </div>
        </div>

        {/* Shortcodes Panel — 1 col */}
        <div className="xl:col-span-1">
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 sticky top-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Shortcodes</h3>
            <p className="text-xs text-gray-500 mb-4">Klicke um den Code zu kopieren und füge ihn in den HTML-Editor ein.</p>
            <div className="space-y-2">
              {SHORTCODES.map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => copyShortcode(key)}
                  className="w-full text-left px-3 py-2 rounded-lg border border-gray-200 bg-white hover:border-green-400 hover:bg-green-50 transition-colors group"
                >
                  <span className="block text-xs font-mono text-green-700 font-semibold">
                    {copiedKey === key ? '✓ Kopiert!' : `{{${key}}}`}
                  </span>
                  <span className="block text-xs text-gray-500 mt-0.5">{label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
          onClick={() => setShowPreview(false)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-100 sticky top-0 bg-white">
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide">Vorschau mit Beispieldaten</p>
                <p className="text-sm font-medium text-gray-700">{applyExampleShortcodes(subject)}</p>
              </div>
              <button
                onClick={() => setShowPreview(false)}
                className="text-gray-400 hover:text-gray-600 text-xl font-light"
              >
                ✕
              </button>
            </div>
            <iframe
              srcDoc={applyExampleShortcodes(htmlBody)}
              className="w-full h-[600px] border-0"
              title="E-Mail Vorschau"
            />
          </div>
        </div>
      )}
    </div>
  )
}

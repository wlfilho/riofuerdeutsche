'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Send, Loader2 } from 'lucide-react'
import { EmailTemplate } from '@/types/email-templates'

export default function EmailTemplateListClient({ templates }: { templates: EmailTemplate[] }) {
  const [sending, setSending] = useState<string | null>(null)
  const [toastMsg, setToastMsg] = useState<{ id: string, msg: string } | null>(null)

  const handleTestSend = async (slug: string) => {
    setSending(slug)
    setToastMsg(null)
    try {
      const res = await fetch('/api/email-templates/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug }),
      })
      const data = await res.json()
      if (data.success) {
        setToastMsg({ id: slug, msg: 'Test-E-Mail gesendet ✓' })
        setTimeout(() => setToastMsg(null), 3000)
      } else {
        alert('Fehler: ' + data.error)
      }
    } catch (err: any) {
      alert('Fehler: ' + err.message)
    } finally {
      setSending(null)
    }
  }

  return (
    <div className="grid gap-4">
      {templates.map((template) => (
        <div
          key={template.slug}
          className="bg-white border border-gray-200 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 hover:border-green-300 transition-colors"
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
          <div className="flex items-center gap-3 sm:ml-4 shrink-0">
            <div className="flex flex-col items-center relative">
              <button
                onClick={() => handleTestSend(template.slug)}
                disabled={sending === template.slug}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors disabled:opacity-50"
              >
                {sending === template.slug ? (
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
              {toastMsg?.id === template.slug && (
                <span className="absolute top-full mt-1.5 whitespace-nowrap text-xs font-medium bg-green-100 text-green-800 px-2 py-1 rounded shadow-sm z-10">
                  {toastMsg.msg}
                </span>
              )}
            </div>
            <Link
              href={`/admin/email-templates/${template.slug}`}
              className="bg-green-700 hover:bg-green-800 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              Bearbeiten
            </Link>
          </div>
        </div>
      ))}
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { EmailTemplate, SHORTCODES, applyExampleShortcodes } from '@/types/email-templates'
import { saveEmailTemplate } from '@/app/actions/email-templates'
import Link from 'next/link'
import { Send, Loader2, Users } from 'lucide-react'

interface Client {
  id: string
  name: string
  email: string
}

/** Destinatário do envio de teste (definido no endpoint /api/email-templates/test). */
const TEST_RECIPIENT = 'lantelmew@gmail.com'

function SendToClientModal({
  onClose,
  onSend,
  sending,
}: {
  onClose: () => void
  onSend: (clientId: string) => void
  sending: boolean
}) {
  const t = useTranslations('admin.emailTemplates')
  const tCommon = useTranslations('admin.common')
  const [clients, setClients] = useState<Client[]>([])
  const [loadingClients, setLoadingClients] = useState(true)
  const [selected, setSelected] = useState<string>('')

  useEffect(() => {
    fetch('/api/admin/clients')
      .then(r => r.json())
      .then(data => {
        if (data.clients) setClients(data.clients)
      })
      .finally(() => setLoadingClients(false))
  }, [])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100">
          <h2 className="text-base font-bold text-gray-900">{t('enviarParaCliente')}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">✕</button>
        </div>
        <div className="px-6 py-5 space-y-4">
          <p className="text-sm text-gray-500">
            {t('escolhaCliente')}
          </p>
          {loadingClients ? (
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Loader2 className="w-4 h-4 animate-spin" /> {tCommon('carregando')}
            </div>
          ) : clients.length === 0 ? (
            <p className="text-sm text-gray-400">{t('nenhumCliente')}</p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {clients.map(c => (
                <label
                  key={c.id}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer transition-colors ${
                    selected === c.id
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="client"
                    value={c.id}
                    checked={selected === c.id}
                    onChange={() => setSelected(c.id)}
                    className="accent-green-600"
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{c.name}</p>
                    <p className="text-xs text-gray-500">{c.email}</p>
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>
        <div className="flex items-center justify-end gap-3 px-6 pb-6">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            {tCommon('cancelar')}
          </button>
          <button
            onClick={() => selected && onSend(selected)}
            disabled={!selected || sending}
            className="inline-flex items-center gap-1.5 px-5 py-2 text-sm font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {sending ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> {tCommon('enviando')}</>
            ) : (
              <><Send className="w-4 h-4" /> {tCommon('enviar')}</>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function EmailTemplateEditorClient({ template }: { template: EmailTemplate }) {
  const router = useRouter()
  const t = useTranslations('admin.emailTemplates')
  const tCommon = useTranslations('admin.common')
  const [subject, setSubject] = useState(template.subject)
  const [htmlBody, setHtmlBody] = useState(template.html_body)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const [copiedKey, setCopiedKey] = useState<string | null>(null)

  const [sendingTest, setSendingTest] = useState(false)
  const [testToast, setTestToast] = useState<string | null>(null)

  const [showSendModal, setShowSendModal] = useState(false)

  // "Enviar para cliente" monta os shortcodes a partir de tour_clients — não
  // conhece {{link}}/{{eckdaten}}/{{reisezeitraum}}, que só a proposta preenche.
  // O envio destes templates é pelo botão da própria proposta.
  const isProposalTemplate = template.slug.startsWith('angebot_link')
  const [sendingToClient, setSendingToClient] = useState(false)
  const [clientSentToast, setClientSentToast] = useState<string | null>(null)

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    const result = await saveEmailTemplate(template.slug, template.locale, subject, htmlBody)
    setSaving(false)
    if (result.success) {
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
      router.refresh()
    } else {
      setError(result.error ?? tCommon('erroSalvar'))
    }
  }

  const copyShortcode = (key: string) => {
    navigator.clipboard.writeText(`{{${key}}}`)
    setCopiedKey(key)
    setTimeout(() => setCopiedKey(null), 1500)
  }

  const handleSendToClient = async (clientId: string) => {
    setSendingToClient(true)
    try {
      const res = await fetch('/api/email-templates/send-to-client', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: template.slug, subject, htmlBody, clientId }),
      })
      const data = await res.json()
      if (data.success) {
        setShowSendModal(false)
        setClientSentToast(t('emailEnviado'))
        setTimeout(() => setClientSentToast(null), 3500)
      } else {
        alert(tCommon('erroPrefixo', { mensagem: data.error }))
      }
    } catch (err: any) {
      alert(tCommon('erroPrefixo', { mensagem: err.message }))
    } finally {
      setSendingToClient(false)
    }
  }

  const handleTestSend = async () => {
    setSendingTest(true)
    setTestToast(null)
    try {
      const res = await fetch('/api/email-templates/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: template.slug, locale: template.locale, subject, htmlBody }),
      })
      const data = await res.json()
      if (data.success) {
        setTestToast(t('testeEnviadoPara', { email: TEST_RECIPIENT }))
        setTimeout(() => setTestToast(null), 3000)
      } else {
        alert(tCommon('erroPrefixo', { mensagem: data.error }))
      }
    } catch (err: any) {
      alert(tCommon('erroPrefixo', { mensagem: err.message }))
    } finally {
      setSendingTest(false)
    }
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/email-templates" className="text-gray-400 hover:text-gray-600 transition-colors text-sm">
          {t('todosTemplates')}
        </Link>
        <span className="text-gray-300">/</span>
        <h1 className="text-xl font-bold text-gray-900">{template.name}</h1>
        <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-mono">{template.slug}</span>
        <span className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full font-semibold">
          {template.locale.split('-')[0].toUpperCase()}
        </span>
        {template.category && (
          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
            {template.category}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Editor — 3 cols */}
        <div className="xl:col-span-3 space-y-4">
          {/* Subject */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('assunto')}</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          {/* HTML Body */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('conteudoHtml')}</label>
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
              {saving ? tCommon('salvando') : saved ? t('salvo') : tCommon('salvar')}
            </button>
            <button
              onClick={() => setShowPreview(true)}
              className="border border-gray-200 hover:border-gray-300 text-gray-700 text-sm font-medium px-5 py-2 rounded-lg transition-colors"
            >
              {t('previa')}
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
                    {tCommon('enviando')}
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    {t('enviarTeste')}
                  </>
                )}
              </button>
              {testToast && (
                <span className="absolute top-full mt-1.5 whitespace-nowrap text-xs font-medium bg-green-100 text-green-800 px-2 py-1 rounded shadow-sm z-10">
                  {testToast}
                </span>
              )}
            </div>
            <div className="relative flex flex-col items-center">
              <button
                onClick={() => setShowSendModal(true)}
                disabled={isProposalTemplate}
                title={isProposalTemplate ? t('envioSoPelaProposta') : undefined}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg border border-green-600 bg-green-600 text-white hover:bg-green-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Users className="w-3.5 h-3.5" />
                {t('enviarParaCliente')}
              </button>
              {clientSentToast && (
                <span className="absolute top-full mt-1.5 whitespace-nowrap text-xs font-medium bg-green-100 text-green-800 px-2 py-1 rounded shadow-sm z-10">
                  {clientSentToast}
                </span>
              )}
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
          </div>
        </div>

        {/* Shortcodes Panel — 1 col */}
        <div className="xl:col-span-1">
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 sticky top-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">{t('shortcodes')}</h3>
            <p className="text-xs text-gray-500 mb-4">{t('cliqueCopiar')}</p>
            <div className="space-y-2">
              {SHORTCODES.map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => copyShortcode(key)}
                  className="w-full text-left px-3 py-2 rounded-lg border border-gray-200 bg-white hover:border-green-400 hover:bg-green-50 transition-colors group"
                >
                  <span className="block text-xs font-mono text-green-700 font-semibold">
                    {copiedKey === key ? t('copiado') : `{{${key}}}`}
                  </span>
                  <span className="block text-xs text-gray-500 mt-0.5">{label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Send to Client Modal */}
      {showSendModal && (
        <SendToClientModal
          onClose={() => setShowSendModal(false)}
          onSend={handleSendToClient}
          sending={sendingToClient}
        />
      )}

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
                <p className="text-xs text-gray-400 uppercase tracking-wide">{t('previaExemplo')}</p>
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
              title={t('previaEmail')}
            />
          </div>
        </div>
      )}
    </div>
  )
}

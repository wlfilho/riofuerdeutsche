'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { saveSiteSettings, type SiteSettings } from '@/app/actions/site-settings'

type Tab = 'negocio' | 'proposta' | 'email'

const TAB_KEYS: { id: Tab; labelKey: 'abaNegocio' | 'abaProposta' | 'abaEmail' }[] = [
  { id: 'negocio', labelKey: 'abaNegocio' },
  { id: 'proposta', labelKey: 'abaProposta' },
  { id: 'email', labelKey: 'abaEmail' },
]

export default function ConfiguracoesClient({ initial }: { initial: SiteSettings }) {
  const t = useTranslations('admin.configuracoes')
  const tCommon = useTranslations('admin.common')
  const [form, setForm] = useState(initial)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<'success' | 'error' | null>(null)
  const [showSignaturePreview, setShowSignaturePreview] = useState(false)
  const [tab, setTab] = useState<Tab>('negocio')

  const set = (key: keyof SiteSettings, value: string | number) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  const handleSave = async () => {
    setSaving(true)
    setToast(null)
    const result = await saveSiteSettings(form)
    setSaving(false)
    setToast(result.success ? 'success' : 'error')
    if (result.success) setTimeout(() => setToast(null), 3000)
  }

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{t('titulo')}</h1>
        <div className="flex items-center gap-3">
          {toast === 'success' && (
            <span className="text-sm text-green-700 font-medium">{t('salvas')}</span>
          )}
          {toast === 'error' && (
            <span className="text-sm text-red-600 font-medium">{tCommon('erroSalvar')}</span>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-green-700 hover:bg-green-800 disabled:opacity-50 text-white text-sm font-semibold px-5 py-2 rounded-lg transition-colors"
          >
            {saving ? tCommon('salvando') : tCommon('salvar')}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200 mb-6">
        {TAB_KEYS.map((item) => (
          <button
            key={item.id}
            onClick={() => setTab(item.id)}
            className={`px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors ${
              tab === item.id
                ? 'text-green-700 border-b-2 border-green-700 -mb-px bg-white'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            {t(item.labelKey)}
          </button>
        ))}
      </div>

      {/* Tab: Dados do Negócio */}
      {tab === 'negocio' && (
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="mb-5">
            <h2 className="text-base font-semibold text-gray-900">{t('dadosNegocio')}</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              {t('dadosNegocioSub')}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{tCommon('telefone')}</label>
              <input
                type="tel"
                placeholder="+55 21 9 9999-9999"
                value={form.business_phone}
                onChange={(e) => set('business_phone', e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{tCommon('whatsapp')}</label>
              <input
                type="tel"
                placeholder="+55 21 9 9999-9999"
                value={form.business_whatsapp}
                onChange={(e) => set('business_whatsapp', e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{tCommon('email')}</label>
              <input
                type="email"
                placeholder="contato@riofuerdeutsche.de"
                value={form.business_email}
                onChange={(e) => set('business_email', e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('instagram')}</label>
              <input
                type="text"
                placeholder="@riofuerdeutsche"
                value={form.business_instagram}
                onChange={(e) => set('business_instagram', e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('facebook')}</label>
              <input
                type="text"
                placeholder="facebook.com/riofuerdeutsche"
                value={form.business_facebook}
                onChange={(e) => set('business_facebook', e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('youtube')}</label>
              <input
                type="text"
                placeholder="youtube.com/@riofuerdeutsche"
                value={form.business_youtube}
                onChange={(e) => set('business_youtube', e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('telegram')}</label>
              <input
                type="text"
                placeholder="@wlfilho"
                value={form.business_telegram}
                onChange={(e) => set('business_telegram', e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('endereco')}</label>
              <input
                type="text"
                placeholder="Rio de Janeiro, RJ, Brasil"
                value={form.business_address}
                onChange={(e) => set('business_address', e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* Tab: Proposal Builder */}
      {tab === 'proposta' && (
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-5">{t('geradorPropostas')}</h2>

          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('honorarioPadrao')}
              </label>
              <input
                type="number"
                min={1}
                step={0.5}
                placeholder="40"
                value={form.guide_rate_eur}
                onChange={(e) => set('guide_rate_eur', parseFloat(e.target.value))}
                className="w-48 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <p className="text-xs text-gray-400 mt-1">
                {t('honorarioHint')}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('taxaCambio')}
              </label>
              <input
                type="number"
                min={0.001}
                step={0.001}
                placeholder="0.17"
                value={form.default_exchange_rate}
                onChange={(e) => set('default_exchange_rate', parseFloat(e.target.value))}
                className="w-48 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <p className="text-xs text-gray-400 mt-1">
                {t('taxaCambioHint')}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('limiteHoras')}
              </label>
              <input
                type="number"
                min={1}
                step={0.5}
                placeholder="10"
                value={form.max_hours_per_day}
                onChange={(e) => set('max_hours_per_day', parseFloat(e.target.value))}
                className="w-48 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <p className="text-xs text-gray-400 mt-1">
                {t('limiteHorasHint')}
              </p>
            </div>

            {/* Dados bancários da Anzahlung */}
            <div className="pt-5 border-t border-gray-100">
              <h3 className="text-sm font-semibold text-gray-900">{t('sinalDadosBancarios')}</h3>
              <p className="text-xs text-gray-400 mt-0.5 mb-4">
                {t('sinalDadosHint')}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('titular')}</label>
                  <input
                    type="text"
                    placeholder="William Lantelme Filho"
                    value={form.bank_account_holder}
                    onChange={(e) => set('bank_account_holder', e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('banco')}</label>
                  <input
                    type="text"
                    placeholder="Revolut"
                    value={form.bank_name}
                    onChange={(e) => set('bank_name', e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('iban')}</label>
                  <input
                    type="text"
                    placeholder="LT62 3250 0338 6470 5980"
                    value={form.bank_iban}
                    onChange={(e) => set('bank_iban', e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('bicSwift')}</label>
                  <input
                    type="text"
                    placeholder="REVOLT21"
                    value={form.bank_bic}
                    onChange={(e) => set('bank_bic', e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Assinatura de E-mail */}
      {tab === 'email' && (
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-base font-semibold text-gray-900">{t('assinaturaEmail')}</h2>
              <p className="text-sm text-gray-500 mt-0.5">
                {t('assinaturaHint')}
              </p>
            </div>
            <button
              onClick={() => setShowSignaturePreview(!showSignaturePreview)}
              className="text-sm text-gray-500 hover:text-gray-700 border border-gray-200 px-3 py-1.5 rounded-lg transition-colors shrink-0 ml-4"
            >
              {showSignaturePreview ? t('editor') : t('previa')}
            </button>
          </div>

          {showSignaturePreview ? (
            <div
              className="border border-gray-200 rounded-lg p-4 min-h-[100px] bg-gray-50"
              dangerouslySetInnerHTML={{ __html: form.email_assinatura }}
            />
          ) : (
            <textarea
              value={form.email_assinatura}
              onChange={(e) => set('email_assinatura', e.target.value)}
              rows={6}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-green-500 resize-y"
              placeholder='<p>Bis bald in Rio! 🌊<br><strong>Will</strong><br><a href="https://riofuerdeutsche.de">riofuerdeutsche.de</a></p>'
              spellCheck={false}
            />
          )}
        </div>
      )}
    </>
  )
}

'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

// 'site' entra aqui porque contacts.source PODE ser 'site' (quem chegou pelo
// ?von=site da /anfrage). Sem a opção, abrir a ficha desse contato mostrava o
// select em branco. 'form' continua fora: contacts.source nunca é 'form' — lá
// vai o canal de chegada, não o de submissão.
const SOURCE_VALUES = ['email', 'whatsapp', 'instagram', 'site', 'calculator', 'referral', 'other'] as const;

interface ContactFormData {
  name: string;
  phone: string;
  email: string;
  source: string;
}

interface ContactFormProps {
  mode: 'new' | 'edit';
  initial?: Partial<ContactFormData>;
  onCancel: () => void;
  onSave: (data: ContactFormData) => Promise<void>;
}

export default function ContactForm({ mode, initial = {}, onCancel, onSave }: ContactFormProps) {
  const [form, setForm] = useState<ContactFormData>({
    name: initial.name ?? '',
    phone: initial.phone ?? '',
    email: initial.email ?? '',
    source: initial.source ?? '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const t = useTranslations('admin.contatos');
  const tCommon = useTranslations('admin.common');
  const tSource = useTranslations('admin.status.source');
  const tCrm = useTranslations('admin.crm');

  const set = (field: keyof ContactFormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm(f => ({ ...f, [field]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { setError(tCrm('nomeObrigatorio')); return; }
    if (!form.email.trim()) { setError(tCrm('emailObrigatorio')); return; }
    setSaving(true);
    setError(null);
    try {
      await onSave(form);
    } catch (err) {
      setError(err instanceof Error ? err.message : tCommon('erroSalvar'));
    } finally {
      setSaving(false);
    }
  };

  const isEdit = mode === 'edit';

  return (
    <div className="flex flex-col min-h-full">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
            {isEdit ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            )}
          </div>
          <h2 className="text-base font-semibold text-gray-900">
            {isEdit ? t('editarContato') : t('novoContato')}
          </h2>
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex flex-col flex-1 bg-gray-50">
        <div className="flex-1 p-6 space-y-5">
          {error && (
            <div className="p-3 rounded-lg text-sm bg-red-50 text-red-800 border border-red-200">{error}</div>
          )}

          {/* Name + Phone */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase mb-1.5">
                {tCommon('nome')} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.name}
                onChange={set('name')}
                placeholder={t('nomeCompletoPlaceholder')}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase mb-1.5">{tCommon('telefone')}</label>
              <input
                type="tel"
                value={form.phone}
                onChange={set('phone')}
                placeholder="+49 …"
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase mb-1.5">
              {tCommon('email')} <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={form.email}
              onChange={set('email')}
              placeholder={t('emailPlaceholder')}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
            {isEdit && (
              <p className="mt-1.5 text-xs text-amber-600">
                {t('avisoAlterarEmail')}
              </p>
            )}
          </div>

          {/* Source */}
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase mb-1.5">{tCommon('origem')}</label>
            <select
              value={form.source}
              onChange={set('source')}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">{t('selecionarOrigem')}</option>
              {SOURCE_VALUES.map(value => (
                <option key={value} value={value}>{tSource(value)}</option>
              ))}
            </select>
          </div>

          {/* Info note */}
          <p className="text-xs text-gray-400 italic">
            {isEdit ? t('notaEdicao') : t('notaCriacao')}
          </p>
        </div>

        {/* Footer */}
        <div className="bg-white border-t border-gray-200 px-6 py-4 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            {tCommon('cancelar')}
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 text-sm font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            {saving ? tCommon('salvando') : isEdit ? tCommon('salvarAlteracoes') : t('criarContato')}
          </button>
        </div>
      </form>
    </div>
  );
}

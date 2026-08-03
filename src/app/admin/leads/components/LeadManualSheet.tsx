'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

type FormData = {
  name: string;
  email: string;
  phone: string;
  pax: string;
  source: 'email' | 'whatsapp' | 'instagram' | 'referral' | 'other';
  notes: string;
  claude_chat_url: string;
};

const emptyForm: FormData = {
  name: '',
  email: '',
  phone: '',
  pax: '1',
  source: 'whatsapp',
  notes: '',
  claude_chat_url: '',
};

const INPUT_CLS =
  'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-400';

function Toast({ message, onDone }: { message: string; onDone: () => void }) {
  useState(() => {
    const t = setTimeout(onDone, 3000);
    return () => clearTimeout(t);
  });
  return (
    <div className="fixed bottom-6 right-6 z-50 px-4 py-3 bg-gray-900 text-white text-sm rounded-xl shadow-lg">
      {message}
    </div>
  );
}

export default function LeadManualSheet() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const clearToast = useCallback(() => setToast(null), []);
  const t = useTranslations('admin.crm');
  const tCommon = useTranslations('admin.common');
  const tSource = useTranslations('admin.status.source');

  const set =
    (field: keyof FormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm(prev => ({ ...prev, [field]: e.target.value }));

  const handleClose = () => {
    if (loading) return;
    setOpen(false);
    setForm(emptyForm);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.name.trim()) { setError(t('nomeObrigatorio')); return; }
    if (!form.email.trim()) { setError(t('emailObrigatorio')); return; }
    if (!form.pax || Number(form.pax) < 1) { setError(t('paxMinimo')); return; }

    setLoading(true);
    try {
      const res = await fetch('/api/admin/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim() || null,
          pax: parseInt(form.pax),
          source: form.source,
          notes: form.notes.trim() || null,
          claude_chat_url: form.claude_chat_url.trim() || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? t('erroSalvarLead'));
        return;
      }

      handleClose();
      setToast(t('leadCriado'));
      router.refresh();
    } catch {
      setError(tCommon('erroRede'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="px-4 py-2 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 transition-colors"
      >
        {t('leadManualBotao')}
      </button>

      {/* Overlay + Sheet */}
      {open && (
        <div className="fixed inset-0 z-40 flex">
          <div className="absolute inset-0 bg-black/40" onClick={handleClose} />

          <div className="relative ml-auto w-full max-w-md bg-white h-full shadow-2xl flex flex-col overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">{t('novoLeadManual')}</h2>
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-600 transition-colors text-xl leading-none"
              >
                ✕
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} noValidate className="flex-1 flex flex-col">
              <div className="px-6 py-5 space-y-4 flex-1">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {tCommon('nome')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={set('name')}
                    disabled={loading}
                    className={INPUT_CLS}
                    placeholder="Maria Müller"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {tCommon('email')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={set('email')}
                    disabled={loading}
                    className={INPUT_CLS}
                    placeholder="maria@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{tCommon('whatsapp')}</label>
                  <input
                    type="text"
                    value={form.phone}
                    onChange={set('phone')}
                    disabled={loading}
                    className={INPUT_CLS}
                    placeholder="+49 177 000 0000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {tCommon('pax')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={form.pax}
                    onChange={set('pax')}
                    disabled={loading}
                    className={INPUT_CLS}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {tCommon('origem')} <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={form.source}
                    onChange={set('source')}
                    disabled={loading}
                    className={INPUT_CLS}
                  >
                    <option value="email">{tSource('email')}</option>
                    <option value="whatsapp">{tSource('whatsapp')}</option>
                    <option value="instagram">{tSource('instagram')}</option>
                    <option value="referral">{tSource('referral')}</option>
                    <option value="other">{tSource('other')}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('anotacao')}</label>
                  <textarea
                    value={form.notes}
                    onChange={set('notes')}
                    rows={3}
                    disabled={loading}
                    className={`${INPUT_CLS} resize-none`}
                    placeholder={t('observacoesInternas')}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('conversaClaude')} <span className="text-gray-400 font-normal">{t('opcional')}</span>
                  </label>
                  <input
                    type="url"
                    value={form.claude_chat_url}
                    onChange={set('claude_chat_url')}
                    disabled={loading}
                    className={INPUT_CLS}
                    placeholder="https://claude.ai/chat/..."
                  />
                </div>

                {error && (
                  <div className="p-3 rounded-lg text-sm bg-red-50 text-red-800 border border-red-200">
                    {error}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={loading}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                >
                  {tCommon('cancelar')}
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 text-sm font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? tCommon('salvando') : t('salvarLead')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {toast && <Toast message={toast} onDone={clearToast} />}
    </>
  );
}

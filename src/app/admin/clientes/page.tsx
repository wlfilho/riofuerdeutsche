'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  pax: number;
  arrival_date: string;
  departure_date: string;
  tour_details: string | null;
  status: 'active' | 'pending' | 'completed' | 'cancelled';
  total_amount: number | null;
  deposit_amount: number | null;
  internal_notes: string | null;
  emails_sent: number;
  emails_total: number;
  created_at: string;
}

type FormData = {
  name: string;
  email: string;
  phone: string;
  pax: string;
  arrival_date: string;
  departure_date: string;
  tour_details: string;
  status: Client['status'];
  total_amount: string;
  deposit_amount: string;
  internal_notes: string;
};

const STATUS_CLS: Record<Client['status'], string> = {
  active: 'bg-green-100 text-green-700',
  pending: 'bg-amber-100 text-amber-700',
  completed: 'bg-blue-100 text-blue-700',
  cancelled: 'bg-gray-100 text-gray-500',
};

function StatusBadge({ status }: { status: Client['status'] }) {
  const tStatus = useTranslations('admin.status.client');
  const className = STATUS_CLS[status] ?? STATUS_CLS.active;
  return (
    <span className={`inline-block px-2 py-0.5 text-xs font-semibold rounded-full ${className}`}>
      {tStatus.has(status) ? tStatus(status) : status}
    </span>
  );
}

function Toast({ message, onDone }: { message: string; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3000);
    return () => clearTimeout(t);
  }, [onDone]);
  return (
    <div className="fixed bottom-6 right-6 z-50 px-4 py-3 bg-gray-900 text-white text-sm rounded-xl shadow-lg animate-fade-in">
      {message}
    </div>
  );
}

function SkeletonRow() {
  return (
    <tr>
      {[...Array(5)].map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-4 bg-gray-100 rounded animate-pulse" style={{ width: i === 0 ? '70%' : '60%' }} />
        </td>
      ))}
    </tr>
  );
}

const emptyForm: FormData = {
  name: '',
  email: '',
  phone: '',
  pax: '1',
  arrival_date: '',
  departure_date: '',
  tour_details: '',
  status: 'active',
  total_amount: '',
  deposit_amount: '',
  internal_notes: '',
};

function clientToForm(c: Client): FormData {
  return {
    name: c.name,
    email: c.email,
    phone: c.phone ?? '',
    pax: String(c.pax ?? 1),
    arrival_date: c.arrival_date,
    departure_date: c.departure_date,
    tour_details: c.tour_details ?? '',
    status: c.status,
    total_amount: c.total_amount !== null ? String(c.total_amount) : '',
    deposit_amount: c.deposit_amount !== null ? String(c.deposit_amount) : '',
    internal_notes: c.internal_notes ?? '',
  };
}

const INPUT_CLS =
  'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-400';

function EditModal({
  client,
  onClose,
  onSaved,
}: {
  client: Client;
  onClose: () => void;
  onSaved: (updated: Client) => void;
}) {
  const t = useTranslations('admin.clientes');
  const tCommon = useTranslations('admin.common');
  const tStatus = useTranslations('admin.status.client');
  const [form, setForm] = useState<FormData>(clientToForm(client));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(prev => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.name.trim() || !form.email.trim() || !form.arrival_date || !form.departure_date) {
      setError(t('preenchaObrigatorios'));
      return;
    }
    if (new Date(form.departure_date) < new Date(form.arrival_date)) {
      setError(t('dataSaidaPosterior'));
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/admin/clients/${client.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim() || null,
          pax: form.pax !== '' ? parseInt(form.pax) : 1,
          arrival_date: form.arrival_date,
          departure_date: form.departure_date,
          tour_details: form.tour_details.trim() || null,
          status: form.status,
          total_amount: form.total_amount !== '' ? parseFloat(form.total_amount) : null,
          deposit_amount: form.deposit_amount !== '' ? parseFloat(form.deposit_amount) : null,
          internal_notes: form.internal_notes.trim() || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? tCommon('erroSalvar'));
        return;
      }

      onSaved({ ...client, ...data.client });
    } catch {
      setError(tCommon('erroRede'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">{t('editarCliente')}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors text-xl leading-none"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="px-6 py-5 space-y-4">

            {/* Name + Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {tCommon('nome')} <span className="text-red-500">*</span>
                </label>
                <input type="text" value={form.name} onChange={set('name')} disabled={loading} className={INPUT_CLS} placeholder={t('nomePlaceholder')} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {tCommon('email')} <span className="text-red-500">*</span>
                </label>
                <input type="email" value={form.email} onChange={set('email')} disabled={loading} className={INPUT_CLS} placeholder={t('emailPlaceholder')} />
              </div>
            </div>

            {/* Phone + Pax */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('telefoneWhatsapp')}
                </label>
                <input type="text" value={form.phone} onChange={set('phone')} disabled={loading} className={INPUT_CLS} placeholder={t('telefonePlaceholder')} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('numeroPessoas')}
                </label>
                <input type="number" min="1" value={form.pax} onChange={set('pax')} disabled={loading} className={INPUT_CLS} />
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('dataChegada')} <span className="text-red-500">*</span>
                </label>
                <input type="date" value={form.arrival_date} onChange={set('arrival_date')} disabled={loading} className={INPUT_CLS} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('dataSaida')} <span className="text-red-500">*</span>
                </label>
                <input type="date" value={form.departure_date} onChange={set('departure_date')} min={form.arrival_date || undefined} disabled={loading} className={INPUT_CLS} />
              </div>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{tCommon('status')}</label>
              <select value={form.status} onChange={set('status')} disabled={loading} className={INPUT_CLS}>
                <option value="active">{tStatus('active')}</option>
                <option value="pending">{tStatus('pending')}</option>
                <option value="completed">{tStatus('completed')}</option>
                <option value="cancelled">{tStatus('cancelled')}</option>
              </select>
            </div>

            {/* Amounts */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('valorTotal')}</label>
                <input type="number" min="0" step="0.01" value={form.total_amount} onChange={set('total_amount')} placeholder="0.00" disabled={loading} className={INPUT_CLS} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('sinalRecebido')}</label>
                <input type="number" min="0" step="0.01" value={form.deposit_amount} onChange={set('deposit_amount')} placeholder="0.00" disabled={loading} className={INPUT_CLS} />
              </div>
            </div>

            {/* Tour Details */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('detalhesTour')}</label>
              <textarea
                value={form.tour_details}
                onChange={set('tour_details')}
                rows={3}
                disabled={loading}
                placeholder={t('detalhesTourPlaceholder')}
                className={`${INPUT_CLS} resize-none`}
              />
            </div>

            {/* Internal Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('notasInternas')} <span className="text-xs text-gray-400">{t('apenasVisivelVoce')}</span>
              </label>
              <textarea
                value={form.internal_notes}
                onChange={set('internal_notes')}
                rows={3}
                disabled={loading}
                placeholder={t('notasPlaceholder')}
                className={`${INPUT_CLS} resize-none`}
              />
            </div>

            {error && (
              <div className="p-3 rounded-lg text-sm bg-red-50 text-red-800 border border-red-200">
                {error}
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 px-6 pb-6 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              {tCommon('cancelar')}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 text-sm font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? tCommon('salvando') : tCommon('salvar')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ClientesPage() {
  const t = useTranslations('admin.clientes');
  const tCommon = useTranslations('admin.common');
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editClient, setEditClient] = useState<Client | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const clearToast = useCallback(() => setToast(null), []);

  useEffect(() => {
    fetch('/api/admin/clients')
      .then(res => res.json())
      .then(data => {
        if (data.clients) setClients(data.clients);
        else setError(data.error ?? tCommon('erroCarregar'));
      })
      .catch(() => setError(tCommon('erroRede')))
      .finally(() => setLoading(false));
  }, [tCommon]);

  const handleSaved = (updated: Client) => {
    setClients(prev => prev.map(c => (c.id === updated.id ? { ...c, ...updated } : c)));
    setEditClient(null);
    setToast(t('clienteSalvo'));
  };

  const handleDelete = async (client: Client) => {
    const confirmed = window.confirm(t('confirmarExcluirLongo', { nome: client.name }));
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/admin/clients/${client.id}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error ?? t('erroExcluir'));
        return;
      }
      setClients(prev => prev.filter(c => c.id !== client.id));
      setToast(t('clienteExcluido'));
    } catch {
      alert(tCommon('erroRede'));
    }
  };

  return (
    <div className="p-4 sm:p-6 md:p-10">
      <div className="max-w-7xl">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{t('titulo')}</h1>
            <p className="text-gray-500 mt-1">{t('subtitulo')}</p>
          </div>
          <Link
            href="/admin/clientes/novo"
            className="px-4 py-2 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 transition-colors"
          >
            {t('novoCliente')}
          </Link>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg text-sm bg-red-50 text-red-800 border border-red-200">
            {error}
          </div>
        )}

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{tCommon('nome')}</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{tCommon('email')}</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{tCommon('pax')}</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{tCommon('status')}</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{tCommon('acoes')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <>
                    <SkeletonRow />
                    <SkeletonRow />
                    <SkeletonRow />
                  </>
                ) : clients.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-16 text-center">
                      <p className="text-gray-400 text-sm mb-3">{t('nenhumCliente')}</p>
                      <Link
                        href="/admin/clientes/novo"
                        className="inline-block px-4 py-2 text-sm font-semibold bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        {t('criarPrimeiro')}
                      </Link>
                    </td>
                  </tr>
                ) : (
                  clients.map(client => (
                    <tr key={client.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">{client.name}</td>
                      <td className="px-4 py-3 text-gray-600">{client.email}</td>
                      <td className="px-4 py-3 text-gray-700 tabular-nums">{client.pax ?? 1}</td>
                      <td className="px-4 py-3">
                        <StatusBadge status={client.status} />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/admin/clientes/${client.id}`}
                            className="px-3 py-1.5 text-xs font-medium bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors whitespace-nowrap"
                          >
                            {t('detalhesLink')}
                          </Link>
                          <button
                            onClick={() => setEditClient(client)}
                            title={t('editarTitle')}
                            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDelete(client)}
                            title={t('excluirTitle')}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {editClient && (
        <EditModal
          client={editClient}
          onClose={() => setEditClient(null)}
          onSaved={handleSaved}
        />
      )}

      {/* Toast */}
      {toast && <Toast message={toast} onDone={clearToast} />}
    </div>
  );
}

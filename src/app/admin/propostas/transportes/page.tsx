'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import type { ProposalTransportType } from '@/lib/proposals';

// ─── Types ────────────────────────────────────────────────────────────────────

type CostMode = 'auto' | 'manual' | 'included' | 'free';

type FormState = {
  name: string;
  cost_mode: CostMode;
  price_per_hour: string;
  currency: 'BRL' | 'EUR';
  is_active: boolean;
};

const EMPTY_FORM: FormState = {
  name: '',
  cost_mode: 'auto',
  price_per_hour: '',
  currency: 'BRL',
  is_active: true,
};

function modeFromTransport(t: ProposalTransportType): CostMode {
  if (t.is_included) return 'included';
  if (t.is_manual) return 'manual';
  if (t.price_per_hour !== null) return 'auto';
  return 'free';
}

function formFromTransport(t: ProposalTransportType): FormState {
  return {
    name: t.name,
    cost_mode: modeFromTransport(t),
    price_per_hour: t.price_per_hour !== null ? String(t.price_per_hour) : '',
    currency: (t.currency as 'BRL' | 'EUR') ?? 'BRL',
    is_active: t.is_active,
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function priceBadge(t: ProposalTransportType): string {
  if (t.is_included) return 'Incluso';
  if (t.is_manual) return 'Manual';
  if (t.price_per_hour !== null) {
    const sym = t.currency === 'EUR' ? '€' : 'R$';
    return `${sym}${t.price_per_hour}/h`;
  }
  return 'Sem custo';
}

const TYPE_BADGE: Record<CostMode, { label: string; cls: string }> = {
  auto:     { label: 'Automático', cls: 'bg-green-100 text-green-700' },
  manual:   { label: 'Manual',     cls: 'bg-amber-100 text-amber-700' },
  included: { label: 'Incluso',    cls: 'bg-blue-100 text-blue-700' },
  free:     { label: 'Sem custo',  cls: 'bg-gray-100 text-gray-500' },
};

const INPUT_CLS =
  'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent';

// ─── TransportModal ────────────────────────────────────────────────────────────

function TransportModal({
  initial,
  onSave,
  onClose,
}: {
  initial: ProposalTransportType | null;
  onSave: (payload: Partial<ProposalTransportType>) => Promise<void>;
  onClose: () => void;
}) {
  const [form, setForm] = useState<FormState>(
    initial ? formFromTransport(initial) : EMPTY_FORM,
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (patch: Partial<FormState>) => setForm(f => ({ ...f, ...patch }));

  const handleSave = async () => {
    setError(null);
    if (!form.name.trim()) { setError('Nome é obrigatório.'); return; }
    if (form.cost_mode === 'auto') {
      const v = parseFloat(form.price_per_hour);
      if (isNaN(v) || v <= 0) { setError('Preço/hora inválido.'); return; }
    }

    const payload: Partial<ProposalTransportType> = {
      name: form.name.trim(),
      is_manual:   form.cost_mode === 'manual',
      is_included: form.cost_mode === 'included',
      is_active:   form.is_active,
      price_per_hour: form.cost_mode === 'auto' ? parseFloat(form.price_per_hour) : null,
      currency:    form.cost_mode === 'auto' ? form.currency : null,
    };

    setSaving(true);
    try {
      await onSave(payload);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao salvar.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-base font-bold text-gray-900">
            {initial ? 'Editar Transporte' : 'Novo Tipo de Transporte'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">✕</button>
        </div>

        <div className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-lg text-sm bg-red-50 text-red-800 border border-red-200">{error}</div>
          )}

          {/* Nome */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.name}
              onChange={e => set({ name: e.target.value })}
              className={INPUT_CLS}
              placeholder="Ex: Carro particular"
            />
          </div>

          {/* Tipo de custo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de custo <span className="text-red-500">*</span>
            </label>
            <select
              value={form.cost_mode}
              onChange={e => set({ cost_mode: e.target.value as CostMode })}
              className={INPUT_CLS}
            >
              <option value="auto">Automático (preço/hora)</option>
              <option value="manual">Manual (ex: Uber)</option>
              <option value="included">Incluso no pacote</option>
              <option value="free">Sem custo</option>
            </select>
          </div>

          {/* Preço e moeda — só para Automático */}
          {form.cost_mode === 'auto' && (
            <>
              <div className="p-3 bg-blue-50 rounded-lg text-xs text-blue-700">
                O custo será calculado automaticamente: preço/hora × (horas ida + horas volta) de cada atividade.
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Preço por hora <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={form.price_per_hour}
                    onChange={e => set({ price_per_hour: e.target.value })}
                    className={INPUT_CLS}
                    placeholder="50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Moeda</label>
                  <select
                    value={form.currency}
                    onChange={e => set({ currency: e.target.value as 'BRL' | 'EUR' })}
                    className={INPUT_CLS}
                  >
                    <option value="BRL">BRL (R$)</option>
                    <option value="EUR">EUR (€)</option>
                  </select>
                </div>
              </div>
            </>
          )}

          {/* Ativo */}
          <div className="flex items-center gap-3 pt-1">
            <button
              type="button"
              onClick={() => set({ is_active: !form.is_active })}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none ${
                form.is_active ? 'bg-green-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform transition-transform ${
                  form.is_active ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
            <span className="text-sm text-gray-700">Ativo</span>
          </div>
        </div>

        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors">
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            {saving ? 'Salvando…' : 'Salvar'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── DeleteModal ───────────────────────────────────────────────────────────────

function DeleteModal({
  transport,
  usageCount,
  onConfirm,
  onClose,
}: {
  transport: ProposalTransportType;
  usageCount: number;
  onConfirm: () => Promise<void>;
  onClose: () => void;
}) {
  const [deleting, setDeleting] = useState(false);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4">
        <h3 className="text-base font-bold text-gray-900">Deletar transporte?</h3>

        {usageCount > 0 ? (
          <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">
            Este transporte está sendo usado por <strong>{usageCount}</strong> atividade{usageCount !== 1 ? 's' : ''}. Remova a associação antes de deletar.
          </p>
        ) : (
          <p className="text-sm text-gray-600">
            Tem certeza que deseja deletar <strong>{transport.name}</strong>? Esta ação não pode ser desfeita.
          </p>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors">
            Cancelar
          </button>
          {usageCount === 0 && (
            <button
              onClick={async () => {
                setDeleting(true);
                await onConfirm();
              }}
              disabled={deleting}
              className="px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              {deleting ? 'Deletando…' : 'Deletar'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function TransportesPage() {
  const [transports, setTransports] = useState<ProposalTransportType[]>([]);
  const [usageCounts, setUsageCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ProposalTransportType | null>(null);
  const [deleting, setDeleting] = useState<ProposalTransportType | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [tRes, uRes] = await Promise.all([
        fetch('/api/admin/proposals/transports'),
        fetch('/api/admin/proposals/transports/usage'),
      ]);
      if (tRes.ok) {
        const { transports: data } = await tRes.json();
        setTransports(data ?? []);
      }
      if (uRes.ok) {
        const { counts } = await uRes.json();
        setUsageCounts(counts ?? {});
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async (payload: Partial<ProposalTransportType>) => {
    const res = await fetch('/api/admin/proposals/transports', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? 'Erro ao criar.');
    setModalOpen(false);
    await load();
  };

  const handleEdit = async (payload: Partial<ProposalTransportType>) => {
    if (!editing) return;
    const res = await fetch(`/api/admin/proposals/transports/${editing.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? 'Erro ao salvar.');
    setEditing(null);
    await load();
  };

  const handleToggle = async (t: ProposalTransportType) => {
    setTogglingId(t.id);
    setTransports(prev => prev.map(x => x.id === t.id ? { ...x, is_active: !x.is_active } : x));
    try {
      const res = await fetch(`/api/admin/proposals/transports/${t.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !t.is_active }),
      });
      if (!res.ok) {
        setTransports(prev => prev.map(x => x.id === t.id ? { ...x, is_active: t.is_active } : x));
      }
    } catch {
      setTransports(prev => prev.map(x => x.id === t.id ? { ...x, is_active: t.is_active } : x));
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async () => {
    if (!deleting) return;
    const res = await fetch(`/api/admin/proposals/transports/${deleting.id}`, { method: 'DELETE' });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error ?? 'Erro ao deletar.');
    }
    setDeleting(null);
    await load();
  };

  return (
    <div className="p-6 md:p-10">
      <div className="max-w-4xl space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/admin/propostas" className="text-sm text-gray-400 hover:text-gray-700 transition-colors">
              Propostas
            </Link>
            <span className="text-gray-300">/</span>
            <h1 className="text-2xl font-bold text-gray-900">Transportes</h1>
          </div>
          <button
            onClick={() => setModalOpen(true)}
            className="px-4 py-2 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 transition-colors"
          >
            + Novo Tipo
          </button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="py-16 text-center text-sm text-gray-400">Carregando…</div>
          ) : transports.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-3xl mb-3">🚗</p>
              <p className="text-sm text-gray-400">Nenhum tipo de transporte cadastrado.</p>
              <button
                onClick={() => setModalOpen(true)}
                className="mt-4 text-sm text-green-600 hover:underline"
              >
                Criar o primeiro
              </button>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Nome</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Preço/hora</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Tipo</th>
                  <th className="text-center px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Ativo</th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {transports.map(t => {
                  const mode = modeFromTransport(t);
                  const badge = TYPE_BADGE[mode];
                  return (
                    <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3 font-medium text-gray-800">{t.name}</td>
                      <td className="px-5 py-3 text-gray-500">{priceBadge(t)}</td>
                      <td className="px-5 py-3">
                        <span className={`inline-block px-2 py-0.5 text-xs font-semibold rounded-full ${badge.cls}`}>
                          {badge.label}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-center">
                        <button
                          onClick={() => handleToggle(t)}
                          disabled={togglingId === t.id}
                          className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none disabled:opacity-50 ${
                            t.is_active ? 'bg-green-500' : 'bg-gray-200'
                          }`}
                        >
                          <span
                            className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow transform transition-transform ${
                              t.is_active ? 'translate-x-4' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <div className="flex items-center justify-end gap-3">
                          <button
                            onClick={() => setEditing(t)}
                            className="text-xs text-gray-400 hover:text-gray-700 transition-colors"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => setDeleting(t)}
                            className="text-xs text-gray-400 hover:text-red-600 transition-colors"
                          >
                            Deletar
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {modalOpen && (
        <TransportModal
          initial={null}
          onSave={handleCreate}
          onClose={() => setModalOpen(false)}
        />
      )}
      {editing && (
        <TransportModal
          initial={editing}
          onSave={handleEdit}
          onClose={() => setEditing(null)}
        />
      )}
      {deleting && (
        <DeleteModal
          transport={deleting}
          usageCount={usageCounts[deleting.id] ?? 0}
          onConfirm={handleDelete}
          onClose={() => setDeleting(null)}
        />
      )}
    </div>
  );
}

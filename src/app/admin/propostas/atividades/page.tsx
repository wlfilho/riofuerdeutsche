'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import type {
  ProposalService,
  ProposalServiceCategory,
  ProposalServicePeriod,
  ProposalTransportType,
} from '@/lib/proposals';

// ─── Types ────────────────────────────────────────────────────────────────────

type CostDraft = {
  _id: string;
  description: string;
  base_price: number | '';
  currency: 'EUR' | 'BRL';
  price_type: 'fixed' | 'per_pax' | 'per_hour';
};

type FormState = {
  name: string;
  category: ProposalServiceCategory | '';
  description: string;
  pdf_note: string;
  notes: string;
  is_active: boolean;
  duration_hours: string;
  transfer_hours_to: string;
  transfer_hours_back: string;
  suggested_period: ProposalServicePeriod | '';
  transport_type_id: string;
};

const EMPTY_FORM: FormState = {
  name: '', category: '', description: '', pdf_note: '', notes: '',
  is_active: true, duration_hours: '', transfer_hours_to: '',
  transfer_hours_back: '', suggested_period: '', transport_type_id: '',
};

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORY_CONFIG: Record<ProposalServiceCategory, { label: string; cls: string }> = {
  transfer: { label: 'Transfer', cls: 'bg-blue-100 text-blue-700' },
  tour:     { label: 'Tour',     cls: 'bg-green-100 text-green-700' },
  extra:    { label: 'Extra',    cls: 'bg-purple-100 text-purple-700' },
  atração:  { label: 'Atração',  cls: 'bg-amber-100 text-amber-700' },
};

const PERIOD_CONFIG: Record<ProposalServicePeriod, { label: string; icon: string }> = {
  morning:   { label: 'Manhã',       icon: '🌅' },
  afternoon: { label: 'Tarde',       icon: '🌇' },
  evening:   { label: 'Noite',       icon: '🌙' },
  full_day:  { label: 'Dia inteiro', icon: '☀️' },
};

const PRICE_TYPE_LABELS = { fixed: 'Fixo', per_pax: 'Por pessoa', per_hour: 'Por hora' };

const INPUT_CLS =
  'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent';

// Decimal hours ↔ "HH:MM" for <input type="time">
function hoursToTime(h: number | null | undefined): string {
  if (h == null || isNaN(h)) return '';
  const totalMin = Math.round(h * 60);
  const hh = Math.floor(totalMin / 60);
  const mm = totalMin % 60;
  return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
}

function timeToHours(s: string): number | null {
  if (!s) return null;
  const [hh, mm] = s.split(':').map(Number);
  const total = (hh || 0) + (mm || 0) / 60;
  return total > 0 ? Math.round(total * 1000) / 1000 : null;
}

function formatHours(h: number): string {
  const totalMin = Math.round(h * 60);
  const hh = Math.floor(totalMin / 60);
  const mm = totalMin % 60;
  if (hh === 0) return `${mm}min`;
  if (mm === 0) return `${hh}h`;
  return `${hh}h ${mm}min`;
}

// ─── CategoryBadge ────────────────────────────────────────────────────────────

function CategoryBadge({ category }: { category: ProposalServiceCategory }) {
  const cfg = CATEGORY_CONFIG[category] ?? { label: category, cls: 'bg-gray-100 text-gray-600' };
  return (
    <span className={`inline-block px-2 py-0.5 text-xs font-semibold rounded-full ${cfg.cls}`}>
      {cfg.label}
    </span>
  );
}

// ─── CostRow (inside modal) ───────────────────────────────────────────────────

function CostRow({
  cost,
  onChange,
  onRemove,
}: {
  cost: CostDraft;
  onChange: (updates: Partial<CostDraft>) => void;
  onRemove: () => void;
}) {
  return (
    <div className="grid grid-cols-[1fr_6rem_5rem_9rem_2rem] gap-2 items-center">
      <input
        type="text"
        value={cost.description}
        onChange={e => onChange({ description: e.target.value })}
        placeholder="Guia Rocinha"
        className={INPUT_CLS}
      />
      <input
        type="number"
        min="0"
        step="0.01"
        value={cost.base_price}
        onChange={e => onChange({ base_price: parseFloat(e.target.value) || '' })}
        placeholder="0"
        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
      />
      <select
        value={cost.currency}
        onChange={e => onChange({ currency: e.target.value as CostDraft['currency'] })}
        className="w-full px-2 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
      >
        <option value="EUR">EUR</option>
        <option value="BRL">BRL</option>
      </select>
      <select
        value={cost.price_type}
        onChange={e => onChange({ price_type: e.target.value as CostDraft['price_type'] })}
        className="w-full px-2 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
      >
        <option value="fixed">Fixo</option>
        <option value="per_pax">Por pessoa</option>
        <option value="per_hour">Por hora</option>
      </select>
      <button
        onClick={onRemove}
        className="p-1.5 text-gray-300 hover:text-red-500 transition-colors rounded"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>
    </div>
  );
}

// ─── ActivityModal ────────────────────────────────────────────────────────────

function ActivityModal({
  service,
  transportTypes,
  onClose,
  onSaved,
}: {
  service: ProposalService | null; // null = create mode
  transportTypes: ProposalTransportType[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState<FormState>(() => {
    if (!service) return EMPTY_FORM;
    return {
      name: service.name,
      category: service.category,
      description: service.description ?? '',
      pdf_note: service.pdf_note ?? '',
      notes: service.notes ?? '',
      is_active: service.is_active,
      duration_hours: hoursToTime(service.duration_hours),
      transfer_hours_to: hoursToTime(service.transfer_hours_to),
      transfer_hours_back: hoursToTime(service.transfer_hours_back),
      suggested_period: service.suggested_period ?? '',
      transport_type_id: service.transport_type_id ?? '',
    };
  });

  const [costs, setCosts] = useState<CostDraft[]>(() =>
    (service?.costs ?? []).map(c => ({
      _id: c.id,
      description: c.description,
      base_price: c.base_price,
      currency: c.currency as CostDraft['currency'],
      price_type: c.price_type as CostDraft['price_type'],
    }))
  );

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (field: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm(prev => ({ ...prev, [field]: e.target.value }));

  const selectedTransport = transportTypes.find(t => t.id === form.transport_type_id) ?? null;

  const transportHint = useMemo(() => {
    if (!selectedTransport) return null;
    if (selectedTransport.is_included) return 'Nenhum custo de transporte adicional — já está nos itens de custo.';
    if (selectedTransport.is_manual) return 'Valor ajustado manualmente ao montar a proposta.';
    if (selectedTransport.tiers.length > 0)
      return `Custo calculado automaticamente por faixa de pessoas × (horas ida + horas volta).`;
    return 'Sem custo de transporte.';
  }, [selectedTransport]);

  const totalHours = useMemo(() => {
    const to = timeToHours(form.transfer_hours_to) ?? 0;
    const dur = timeToHours(form.duration_hours) ?? 0;
    const back = timeToHours(form.transfer_hours_back) ?? 0;
    return to + dur + back;
  }, [form.transfer_hours_to, form.duration_hours, form.transfer_hours_back]);

  const addCost = () =>
    setCosts(prev => [
      ...prev,
      { _id: Math.random().toString(36).slice(2), description: '', base_price: '', currency: 'EUR', price_type: 'fixed' },
    ]);

  const updateCost = (id: string, updates: Partial<CostDraft>) =>
    setCosts(prev => prev.map(c => (c._id === id ? { ...c, ...updates } : c)));

  const removeCost = (id: string) =>
    setCosts(prev => prev.filter(c => c._id !== id));

  const handleSave = async () => {
    setError(null);
    if (!form.name.trim()) { setError('Título é obrigatório.'); return; }
    if (!form.category) { setError('Categoria é obrigatória.'); return; }

    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        category: form.category,
        description: form.description.trim() || null,
        pdf_note: form.pdf_note.trim() || null,
        notes: form.notes.trim() || null,
        is_active: form.is_active,
        duration_hours: timeToHours(form.duration_hours),
        transfer_hours_to: timeToHours(form.transfer_hours_to),
        transfer_hours_back: timeToHours(form.transfer_hours_back),
        suggested_period: form.suggested_period || null,
        transport_type_id: form.transport_type_id || null,
        costs: costs.map(c => ({
          description: c.description,
          base_price: Number(c.base_price) || 0,
          currency: c.currency,
          price_type: c.price_type,
        })),
      };

      const url = service
        ? `/api/admin/proposals/services/${service.id}`
        : '/api/admin/proposals/services';
      const method = service ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? 'Fehler beim Speichern.'); return; }

      onSaved();
    } catch {
      setError('Netzwerkfehler.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">

        {/* Modal header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100 shrink-0">
          <h2 className="text-lg font-bold text-gray-900">
            {service ? 'Atividade bearbeiten' : 'Nova Atividade'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">✕</button>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto px-6 py-5 space-y-7">

          {/* ── Section 1: Informações Gerais */}
          <div>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">
              Informações Gerais
            </h3>
            <div className="space-y-4">

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Título <span className="text-red-500">*</span>
                  </label>
                  <input type="text" value={form.name} onChange={set('name')} className={INPUT_CLS} placeholder="Favela Tour Rocinha" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Categoria <span className="text-red-500">*</span>
                  </label>
                  <select value={form.category} onChange={set('category')} className={INPUT_CLS}>
                    <option value="">Selecionar…</option>
                    <option value="tour">Tour</option>
                    <option value="transfer">Transfer</option>
                    <option value="atração">Atração</option>
                    <option value="extra">Extra</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de transporte</label>
                <select value={form.transport_type_id} onChange={set('transport_type_id')} className={INPUT_CLS}>
                  <option value="">Nenhum / não definido</option>
                  {transportTypes.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
                {transportHint && (
                  <p className="mt-1 text-xs text-blue-600">{transportHint}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descrição curta</label>
                <textarea value={form.description} onChange={set('description')} rows={2} className={`${INPUT_CLS} resize-none`} placeholder="Aparece no PDF da proposta." />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nota fixa para o PDF</label>
                <textarea value={form.pdf_note} onChange={set('pdf_note')} rows={2} className={`${INPUT_CLS} resize-none`} placeholder="Texto que aparece sempre na proposta ao selecionar esta atividade" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Observação interna{' '}
                  <span className="text-xs font-normal text-gray-400">(não aparece no PDF)</span>
                </label>
                <textarea value={form.notes} onChange={set('notes')} rows={2} className={`${INPUT_CLS} resize-none`} />
              </div>

              <label className="flex items-center gap-3 cursor-pointer select-none">
                <button
                  type="button"
                  onClick={() => setForm(prev => ({ ...prev, is_active: !prev.is_active }))}
                  className={`relative w-10 h-6 rounded-full transition-colors ${form.is_active ? 'bg-green-500' : 'bg-gray-300'}`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.is_active ? 'translate-x-4' : 'translate-x-0'}`} />
                </button>
                <span className="text-sm font-medium text-gray-700">Ativo</span>
              </label>
            </div>
          </div>

          {/* ── Section 2: Tempo */}
          <div>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">Tempo</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Duração</label>
                <input type="time" value={form.duration_hours} onChange={set('duration_hours')} className={INPUT_CLS} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ida</label>
                <input type="time" value={form.transfer_hours_to} onChange={set('transfer_hours_to')} className={INPUT_CLS} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Volta</label>
                <input type="time" value={form.transfer_hours_back} onChange={set('transfer_hours_back')} className={INPUT_CLS} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Total estimado</label>
                <div className={`${INPUT_CLS} bg-gray-50 text-gray-700 font-semibold pointer-events-none`}>
                  {totalHours > 0 ? formatHours(totalHours) : '—'}
                </div>
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Período sugerido</label>
              <select value={form.suggested_period} onChange={set('suggested_period')} className={INPUT_CLS}>
                <option value="">Não especificado</option>
                <option value="morning">🌅 Manhã</option>
                <option value="afternoon">🌇 Tarde</option>
                <option value="evening">🌙 Noite</option>
                <option value="full_day">☀️ Dia inteiro</option>
              </select>
            </div>
          </div>

          {/* ── Section 3: Itens de Custo */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Itens de Custo</h3>
              <button
                onClick={addCost}
                className="text-xs font-semibold text-green-600 hover:text-green-800 transition-colors"
              >
                + Custo
              </button>
            </div>

            {costs.length === 0 ? (
              <p className="text-sm text-gray-400 italic">
                Sem custos adicionais — cada um paga na hora.
              </p>
            ) : (
              <div className="space-y-2">
                <div className="grid grid-cols-[1fr_6rem_5rem_9rem_2rem] gap-2 mb-1">
                  <span className="text-xs text-gray-400">Descrição</span>
                  <span className="text-xs text-gray-400">Valor</span>
                  <span className="text-xs text-gray-400">Moeda</span>
                  <span className="text-xs text-gray-400">Tipo</span>
                  <span />
                </div>
                {costs.map(cost => (
                  <CostRow
                    key={cost._id}
                    cost={cost}
                    onChange={u => updateCost(cost._id, u)}
                    onRemove={() => removeCost(cost._id)}
                  />
                ))}
              </div>
            )}
          </div>

          {error && (
            <div className="p-3 rounded-lg text-sm bg-red-50 text-red-800 border border-red-200">
              {error}
            </div>
          )}
        </div>

        {/* Modal footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 shrink-0">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
            Abbrechen
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2 text-sm font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            {saving ? 'Wird gespeichert…' : 'Salvar'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── DeleteModal ──────────────────────────────────────────────────────────────

function DeleteModal({
  service,
  onCancel,
  onConfirm,
  loading,
}: {
  service: ProposalService;
  onCancel: () => void;
  onConfirm: () => void;
  loading: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-2">Atividade löschen?</h2>
        <p className="text-sm text-gray-600 mb-6">
          Tem certeza? <strong>{service.name}</strong> será removida do catálogo.
        </p>
        <div className="flex justify-end gap-3">
          <button onClick={onCancel} disabled={loading} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50">
            Abbrechen
          </button>
          <button onClick={onConfirm} disabled={loading} className="px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50">
            {loading ? 'Wird gelöscht…' : 'Löschen'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AtividadesPage() {
  const [services, setServices] = useState<ProposalService[]>([]);
  const [transportTypes, setTransportTypes] = useState<ProposalTransportType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [editTarget, setEditTarget] = useState<ProposalService | null | 'new'>('new' as never);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ProposalService | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // editTarget = null → create; ProposalService → edit
  const [modalService, setModalService] = useState<ProposalService | null>(null);

  const fetchServices = useCallback(async () => {
    setLoading(true);
    try {
      const [sRes, tRes] = await Promise.all([
        fetch('/api/admin/proposals/services'),
        fetch('/api/admin/proposals/transports'),
      ]);
      const sData = await sRes.json();
      const tData = await tRes.json();
      if (!sRes.ok) { setError(sData.error ?? 'Fehler beim Laden.'); return; }
      setServices(sData.services ?? []);
      if (tRes.ok) setTransportTypes(tData.transports ?? []);
    } catch {
      setError('Netzwerkfehler.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchServices(); }, [fetchServices]);

  const openCreate = () => { setModalService(null); setModalOpen(true); };
  const openEdit = (s: ProposalService) => { setModalService(s); setModalOpen(true); };
  const closeModal = () => setModalOpen(false);

  const handleSaved = () => { closeModal(); fetchServices(); };

  const handleToggle = async (service: ProposalService) => {
    const newValue = !service.is_active;
    // Optimistic update
    setServices(prev => prev.map(s => s.id === service.id ? { ...s, is_active: newValue } : s));

    const res = await fetch(`/api/admin/proposals/services/${service.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: newValue }),
    });
    if (!res.ok) {
      // Revert
      setServices(prev => prev.map(s => s.id === service.id ? { ...s, is_active: !newValue } : s));
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/admin/proposals/services/${deleteTarget.id}`, { method: 'DELETE' });
      if (!res.ok) { const d = await res.json(); alert(d.error ?? 'Fehler beim Löschen.'); return; }
      setServices(prev => prev.filter(s => s.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch {
      alert('Netzwerkfehler.');
    } finally {
      setDeleteLoading(false);
    }
  };

  // Avoid unused state warning
  void editTarget; void setEditTarget;

  return (
    <div className="p-6 md:p-10">
      <div className="max-w-7xl">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 text-sm text-gray-400 mb-1">
              <Link href="/admin/propostas" className="hover:text-gray-700 transition-colors">Propostas</Link>
              <span>/</span>
              <span className="text-gray-600">Atividades</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Atividades</h1>
          </div>
          <button
            onClick={openCreate}
            className="px-4 py-2 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 transition-colors"
          >
            + Nova Atividade
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg text-sm bg-red-50 text-red-800 border border-red-200">{error}</div>
        )}

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Nome</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Categoria</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Transporte</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Duração total</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Período</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Custos</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Ativo</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  [...Array(4)].map((_, i) => (
                    <tr key={i}>
                      {[...Array(8)].map((_, j) => (
                        <td key={j} className="px-4 py-3">
                          <div className="h-4 bg-gray-100 rounded animate-pulse" style={{ width: j === 0 ? '60%' : '50%' }} />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : services.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-16 text-center">
                      <p className="text-gray-400 text-sm mb-3">Nenhuma atividade cadastrada</p>
                      <button
                        onClick={openCreate}
                        className="inline-block px-4 py-2 text-sm font-semibold bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        + Criar primeira atividade
                      </button>
                    </td>
                  </tr>
                ) : (
                  services.map(s => {
                    const total = (s.transfer_hours_to ?? 0) + (s.duration_hours ?? 0) + (s.transfer_hours_back ?? 0);
                    const period = s.suggested_period ? PERIOD_CONFIG[s.suggested_period] : null;
                    const transportName = transportTypes.find(t => t.id === s.transport_type_id)?.name ?? null;
                    return (
                      <tr key={s.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-gray-900">{s.name}</td>
                        <td className="px-4 py-3">
                          <CategoryBadge category={s.category} />
                        </td>
                        <td className="px-4 py-3 text-gray-600 text-sm">
                          {transportName ?? <span className="text-gray-300">—</span>}
                        </td>
                        <td className="px-4 py-3 text-gray-600 tabular-nums">
                          {total > 0 ? formatHours(total) : '—'}
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          {period ? `${period.icon} ${period.label}` : '—'}
                        </td>
                        <td className="px-4 py-3 text-gray-500">
                          {s.costs.length === 0
                            ? <span className="text-gray-300 text-xs">Sem custo</span>
                            : <span className="text-xs">{s.costs.length} custo{s.costs.length !== 1 ? 's' : ''}</span>}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => handleToggle(s)}
                            className={`relative w-9 h-5 rounded-full transition-colors ${s.is_active ? 'bg-green-500' : 'bg-gray-300'}`}
                          >
                            <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${s.is_active ? 'translate-x-4' : 'translate-x-0'}`} />
                          </button>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => openEdit(s)}
                              title="Bearbeiten"
                              className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => setDeleteTarget(s)}
                              title="Löschen"
                              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {modalOpen && (
        <ActivityModal
          service={modalService}
          transportTypes={transportTypes}
          onClose={closeModal}
          onSaved={handleSaved}
        />
      )}

      {deleteTarget && (
        <DeleteModal
          service={deleteTarget}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
          loading={deleteLoading}
        />
      )}
    </div>
  );
}

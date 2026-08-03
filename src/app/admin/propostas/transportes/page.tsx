'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import type { ProposalTransportType } from '@/lib/proposals';

// ─── Types ────────────────────────────────────────────────────────────────────

type CostMode = 'auto' | 'manual' | 'included' | 'free';

type TierDraft = {
  _id: string;
  min_pax: number | '';
  max_pax: number | '' | null;  // null = sem limite
  car_daily_rate: number | '';        // diária fixa do veículo
  driver_price_per_hour: number | ''; // motorista terceirizado, por hora
  currency: 'BRL' | 'EUR';
  editing: boolean;
};

type FormState = {
  name: string;
  cost_mode: CostMode;
  is_active: boolean;
};

const EMPTY_FORM: FormState = {
  name: '', cost_mode: 'auto', is_active: true,
};

function modeFromTransport(t: ProposalTransportType): CostMode {
  if (t.is_included) return 'included';
  if (t.is_manual) return 'manual';
  if (t.tiers.length > 0) return 'auto';
  return 'free';
}

function tiersFromTransport(t: ProposalTransportType): TierDraft[] {
  return [...t.tiers]
    .sort((a, b) => a.sort_order - b.sort_order)
    .map(tier => ({
      _id: tier.id,
      min_pax: tier.min_pax,
      max_pax: tier.max_pax,
      car_daily_rate: tier.car_daily_rate,
      driver_price_per_hour: tier.driver_price_per_hour,
      currency: tier.currency,
      editing: false,
    }));
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

// Só a aparência; o rótulo vem de admin.transportes.tipos.
const TYPE_BADGE_CLS: Record<CostMode, string> = {
  auto:     'bg-green-100 text-green-700',
  manual:   'bg-amber-100 text-amber-700',
  included: 'bg-blue-100 text-blue-700',
  free:     'bg-gray-100 text-gray-500',
};

const INPUT_CLS =
  'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent';

function newTierDraft(): TierDraft {
  return {
    _id: Math.random().toString(36).slice(2),
    min_pax: '', max_pax: '', car_daily_rate: '', driver_price_per_hour: '', currency: 'BRL', editing: true,
  };
}

// Retorna a CHAVE do erro em admin.transportes (ou null): a tradução acontece
// no componente, que é quem tem o translator.
type TierErrorKey =
  | 'minPaxInvalido'
  | 'maxPaxInvalido'
  | 'diariaInvalida'
  | 'precoHoraInvalido'
  | 'faixasSobrepoem';

function validateTiers(tiers: TierDraft[]): TierErrorKey | null {
  for (const t of tiers) {
    if (t.min_pax === '' || Number(t.min_pax) < 1) return 'minPaxInvalido';
    if (t.max_pax !== null && (t.max_pax === '' || Number(t.max_pax) < Number(t.min_pax)))
      return 'maxPaxInvalido';
    // 0 é permitido: as faixas podem ficar com placeholder até os valores reais serem definidos.
    if (t.car_daily_rate === '' || Number(t.car_daily_rate) < 0) return 'diariaInvalida';
    if (t.driver_price_per_hour === '' || Number(t.driver_price_per_hour) < 0) return 'precoHoraInvalido';
  }
  const ranges = tiers.map(t => ({
    min: Number(t.min_pax),
    max: t.max_pax === null ? Infinity : Number(t.max_pax),
  }));
  for (let i = 0; i < ranges.length; i++) {
    for (let j = i + 1; j < ranges.length; j++) {
      if (ranges[i].min <= ranges[j].max && ranges[j].min <= ranges[i].max)
        return 'faixasSobrepoem';
    }
  }
  return null;
}

function findGaps(tiers: TierDraft[]): number[] {
  const valid = tiers.filter(t => t.min_pax !== '' && (t.max_pax === null || t.max_pax !== ''));
  if (valid.length < 2) return [];
  const sorted = [...valid].sort((a, b) => Number(a.min_pax) - Number(b.min_pax));
  const gaps: number[] = [];
  for (let i = 0; i < sorted.length - 1; i++) {
    if (sorted[i].max_pax === null) break;
    const nextMin = Number(sorted[i + 1].min_pax);
    const curMax = Number(sorted[i].max_pax);
    for (let p = curMax + 1; p < nextMin && gaps.length < 6; p++) gaps.push(p);
  }
  return gaps;
}

// ─── TiersSection ─────────────────────────────────────────────────────────────

function TiersSection({
  tiers,
  onChange,
}: {
  tiers: TierDraft[];
  onChange: (tiers: TierDraft[]) => void;
}) {
  const t = useTranslations('admin.transportes');
  const tCommon = useTranslations('admin.common');
  const update = (id: string, patch: Partial<TierDraft>) =>
    onChange(tiers.map(t => t._id === id ? { ...t, ...patch } : t));
  const remove = (id: string) => onChange(tiers.filter(t => t._id !== id));
  const add = () => onChange([...tiers, newTierDraft()]);

  const gaps = findGaps(tiers);

  const rowCls = 'grid grid-cols-[auto_auto_1fr_auto_auto] gap-2 items-center';

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
          {t('faixasPorPessoas')}
        </span>
        <button
          type="button"
          onClick={add}
          className="text-xs font-semibold text-green-600 hover:text-green-800 transition-colors"
        >
          {t('novaFaixa')}
        </button>
      </div>

      {tiers.length === 0 && (
        <p className="text-sm text-gray-400 italic mb-2">{t('nenhumaFaixa')}</p>
      )}

      <div className="space-y-2">
        {tiers.map(tier => (
          <div key={tier._id}>
            {tier.editing ? (
              /* ── Edit mode ── */
              <div className={`${rowCls} bg-gray-50 rounded-lg p-2`}>
                {/* Min pax */}
                <div className="flex items-center gap-1">
                  <span className="text-xs text-gray-500 whitespace-nowrap">{t('de')}</span>
                  <input
                    type="number"
                    min="1"
                    value={tier.min_pax}
                    onChange={e => update(tier._id, { min_pax: parseInt(e.target.value) || '' })}
                    className="w-16 px-2 py-1 border border-gray-300 rounded text-sm text-center focus:outline-none focus:ring-1 focus:ring-green-500"
                    placeholder="1"
                  />
                </div>
                {/* Max pax */}
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-gray-500 whitespace-nowrap">{t('ateLabel')}</span>
                  <input
                    type="number"
                    min="1"
                    value={tier.max_pax === null ? '' : (tier.max_pax ?? '')}
                    disabled={tier.max_pax === null}
                    onChange={e => update(tier._id, { max_pax: parseInt(e.target.value) || '' })}
                    className="w-16 px-2 py-1 border border-gray-300 rounded text-sm text-center focus:outline-none focus:ring-1 focus:ring-green-500 disabled:bg-gray-100 disabled:text-gray-400"
                    placeholder={tier.max_pax === null ? '∞' : ''}
                  />
                  <label className="flex items-center gap-1 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={tier.max_pax === null}
                      onChange={e => update(tier._id, { max_pax: e.target.checked ? null : '' })}
                      className="rounded"
                    />
                    <span className="text-xs text-gray-500">∞</span>
                  </label>
                </div>
                {/* Prices: car daily rate + driver hourly rate */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <select
                    value={tier.currency}
                    onChange={e => update(tier._id, { currency: e.target.value as 'BRL' | 'EUR' })}
                    className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
                  >
                    <option value="BRL">R$</option>
                    <option value="EUR">€</option>
                  </select>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={tier.car_daily_rate}
                    onChange={e => {
                      const v = parseFloat(e.target.value);
                      update(tier._id, { car_daily_rate: Number.isNaN(v) ? '' : v });
                    }}
                    title={t('diariaCarro')}
                    className="w-20 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
                    placeholder={t('diariaPlaceholder')}
                  />
                  <span className="text-xs text-gray-500 whitespace-nowrap">{t('carroDia')}</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={tier.driver_price_per_hour}
                    onChange={e => {
                      const v = parseFloat(e.target.value);
                      update(tier._id, { driver_price_per_hour: Number.isNaN(v) ? '' : v });
                    }}
                    title={t('motoristaHora')}
                    className="w-20 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
                    placeholder={t('motoristaPlaceholder')}
                  />
                  <span className="text-xs text-gray-500 whitespace-nowrap">{t('motoristaH')}</span>
                </div>
                {/* Save btn */}
                <button
                  type="button"
                  onClick={() => update(tier._id, { editing: false })}
                  className="px-2 py-1 text-xs font-semibold text-green-700 hover:text-green-900 transition-colors"
                >
                  OK
                </button>
                {/* Delete btn */}
                <button
                  type="button"
                  onClick={() => remove(tier._id)}
                  className="p-1 text-gray-300 hover:text-red-500 transition-colors text-base leading-none"
                >
                  ×
                </button>
              </div>
            ) : (
              /* ── View mode ── */
              <div className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-gray-50 group">
                <span className="text-sm text-gray-700">
                  <span className="font-medium tabular-nums">
                    {tier.min_pax}–{tier.max_pax === null ? '∞' : tier.max_pax}
                  </span>
                  {' '}pax
                  <span className="mx-2 text-gray-300">·</span>
                  <span className="text-gray-600">
                    {tier.currency === 'EUR' ? '€' : 'R$'}{Number(tier.car_daily_rate).toFixed(0)}{t('diariaCarroLabel')}
                    {' + '}
                    {tier.currency === 'EUR' ? '€' : 'R$'}{Number(tier.driver_price_per_hour).toFixed(0)}{t('hMotorista')}
                  </span>
                </span>
                <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    type="button"
                    onClick={() => update(tier._id, { editing: true })}
                    className="text-xs text-gray-400 hover:text-gray-700 transition-colors"
                  >
                    {tCommon('editar')}
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(tier._id)}
                    className="text-xs text-gray-400 hover:text-red-600 transition-colors"
                  >
                    ×
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {gaps.length > 0 && (
        <div className="mt-2 p-2 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-700">
          {gaps.length === 1
            ? t('avisoNaoCoberto', { numero: gaps[0] })
            : t('avisoNaoCobertos', {
                numeros: `${gaps.slice(0, 5).join(', ')}${gaps.length > 5 ? '…' : ''}`,
              })}
        </div>
      )}
    </div>
  );
}

// ─── TransportModal ────────────────────────────────────────────────────────────

function TransportModal({
  initial,
  onSave,
  onClose,
}: {
  initial: ProposalTransportType | null;
  onSave: (transportPayload: Partial<ProposalTransportType>, tiers: TierDraft[]) => Promise<void>;
  onClose: () => void;
}) {
  const t = useTranslations('admin.transportes');
  const tCommon = useTranslations('admin.common');
  const [form, setForm] = useState<FormState>(
    initial
      ? { name: initial.name, cost_mode: modeFromTransport(initial), is_active: initial.is_active }
      : EMPTY_FORM,
  );
  const [tiers, setTiers] = useState<TierDraft[]>(initial ? tiersFromTransport(initial) : []);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (patch: Partial<FormState>) => setForm(f => ({ ...f, ...patch }));

  const handleSave = async () => {
    setError(null);
    if (!form.name.trim()) { setError(tCommon('nomeObrigatorio')); return; }

    if (form.cost_mode === 'auto') {
      const tierError = validateTiers(tiers);
      if (tierError) { setError(t(tierError)); return; }
      if (tiers.length === 0) { setError(t('adicioneUmaFaixa')); return; }
    }

    const payload: Partial<ProposalTransportType> = {
      name: form.name.trim(),
      is_manual: form.cost_mode === 'manual',
      is_included: form.cost_mode === 'included',
      is_active: form.is_active,
    };

    setSaving(true);
    try {
      await onSave(payload, form.cost_mode === 'auto' ? tiers : []);
    } catch (e) {
      setError(e instanceof Error ? e.message : tCommon('erroSalvar'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh]">

        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <h3 className="text-base font-bold text-gray-900">
            {initial ? t('editarTransporte') : t('novoTipoTransporte')}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">✕</button>
        </div>

        <div className="overflow-y-auto px-6 py-5 space-y-5">
          {error && (
            <div className="p-3 rounded-lg text-sm bg-red-50 text-red-800 border border-red-200">{error}</div>
          )}

          {/* Nome */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {tCommon('nome')} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.name}
              onChange={e => set({ name: e.target.value })}
              className={INPUT_CLS}
              placeholder={t('nomePlaceholder')}
            />
          </div>

          {/* Tipo de custo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('tipoCusto')} <span className="text-red-500">*</span>
            </label>
            <select
              value={form.cost_mode}
              onChange={e => set({ cost_mode: e.target.value as CostMode })}
              className={INPUT_CLS}
            >
              <option value="auto">{t('custoPorFaixas')}</option>
              <option value="manual">{t('custoManual')}</option>
              <option value="included">{t('custoIncluso')}</option>
              <option value="free">{t('custoSemCusto')}</option>
            </select>
          </div>

          {/* Faixas — só para modo auto */}
          {form.cost_mode === 'auto' && (
            <div className="border border-gray-200 rounded-xl p-4">
              <TiersSection tiers={tiers} onChange={setTiers} />
            </div>
          )}

          {/* Ativo */}
          <div className="flex items-center gap-3">
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
            <span className="text-sm text-gray-700">{tCommon('ativo')}</span>
          </div>
        </div>

        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100 shrink-0">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors">
            {tCommon('cancelar')}
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            {saving ? tCommon('salvando') : tCommon('salvar')}
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
  const t = useTranslations('admin.transportes');
  const tCommon = useTranslations('admin.common');
  const [deleting, setDeleting] = useState(false);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4">
        <h3 className="text-base font-bold text-gray-900">{t('deletarTransporte')}</h3>

        {usageCount > 0 ? (
          <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">
            {t.rich('transporteEmUso', {
              count: usageCount,
              strong: chunks => <strong>{chunks}</strong>,
            })}
          </p>
        ) : (
          <p className="text-sm text-gray-600">
            {t.rich('confirmarDeletar', {
              nome: transport.name,
              strong: chunks => <strong>{chunks}</strong>,
            })}
          </p>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors">
            {tCommon('cancelar')}
          </button>
          {usageCount === 0 && (
            <button
              onClick={async () => { setDeleting(true); await onConfirm(); }}
              disabled={deleting}
              className="px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              {deleting ? tCommon('deletando') : tCommon('deletar')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function TransportesPage() {
  const t = useTranslations('admin.transportes');
  const tCommon = useTranslations('admin.common');
  const tPropostas = useTranslations('admin.propostas');
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

  const handleCreate = async (payload: Partial<ProposalTransportType>, tiers: TierDraft[]) => {
    const res = await fetch('/api/admin/proposals/transports', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...payload,
        tiers: tiers.map(t => ({
          min_pax: Number(t.min_pax),
          max_pax: t.max_pax === null ? null : Number(t.max_pax),
          car_daily_rate: Number(t.car_daily_rate),
          driver_price_per_hour: Number(t.driver_price_per_hour),
          currency: t.currency,
        })),
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? t('erroCriar'));
    setModalOpen(false);
    await load();
  };

  const handleEdit = async (payload: Partial<ProposalTransportType>, tiers: TierDraft[]) => {
    if (!editing) return;
    const res = await fetch(`/api/admin/proposals/transports/${editing.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...payload,
        tiers: tiers.map(t => ({
          min_pax: Number(t.min_pax),
          max_pax: t.max_pax === null ? null : Number(t.max_pax),
          car_daily_rate: Number(t.car_daily_rate),
          driver_price_per_hour: Number(t.driver_price_per_hour),
          currency: t.currency,
        })),
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? tCommon('erroSalvar'));
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
      throw new Error(data.error ?? tCommon('erroDeletar'));
    }
    setDeleting(null);
    await load();
  };

  return (
    <div className="p-4 sm:p-6 md:p-10">
      <div className="max-w-4xl space-y-6">

        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link href="/admin/propostas" className="text-sm text-gray-400 hover:text-gray-700 transition-colors">
              {tPropostas('titulo')}
            </Link>
            <span className="text-gray-300">/</span>
            <h1 className="text-2xl font-bold text-gray-900">{t('titulo')}</h1>
          </div>
          <button
            onClick={() => setModalOpen(true)}
            className="px-4 py-2 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 transition-colors"
          >
            {t('novoTipo')}
          </button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="py-16 text-center text-sm text-gray-400">{tCommon('carregando')}</div>
          ) : transports.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-3xl mb-3">🚗</p>
              <p className="text-sm text-gray-400">{t('nenhumTipo')}</p>
              <button
                onClick={() => setModalOpen(true)}
                className="mt-4 text-sm text-green-600 hover:underline"
              >
                {t('criarPrimeiro')}
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{tCommon('nome')}</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{t('colFaixas')}</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{t('colTipo')}</th>
                  <th className="text-center px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{tCommon('ativo')}</th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{tCommon('acoes')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {transports.map(transport => {
                  const mode = modeFromTransport(transport);
                  return (
                    <tr key={transport.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3 font-medium text-gray-800">{transport.name}</td>
                      <td className="px-5 py-3">
                        {transport.is_included || transport.is_manual ? (
                          <span className="text-gray-400 text-xs">{tCommon('vazio')}</span>
                        ) : transport.tiers.length === 0 ? (
                          <span className="inline-block px-2 py-0.5 text-xs font-semibold rounded-full bg-amber-100 text-amber-700">
                            {t('semFaixas')}
                          </span>
                        ) : (
                          <div className="flex flex-col gap-0.5">
                            {[...transport.tiers]
                              .sort((a, b) => a.sort_order - b.sort_order)
                              .map(tier => {
                                const sym = tier.currency === 'EUR' ? '€' : 'R$';
                                const maxLabel = tier.max_pax === null ? '∞' : tier.max_pax;
                                return (
                                  <span key={tier.id} className="text-xs text-gray-600 tabular-nums">
                                    {tier.min_pax}–{maxLabel}{t('paxSep')}{sym}{tier.car_daily_rate}{t('diariaMais')}{sym}{tier.driver_price_per_hour}{t('hMotorista')}
                                  </span>
                                );
                              })}
                          </div>
                        )}
                      </td>
                      <td className="px-5 py-3">
                        <span className={`inline-block px-2 py-0.5 text-xs font-semibold rounded-full ${TYPE_BADGE_CLS[mode]}`}>
                          {t(`tipos.${mode}`)}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-center">
                        <button
                          onClick={() => handleToggle(transport)}
                          disabled={togglingId === transport.id}
                          className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none disabled:opacity-50 ${
                            transport.is_active ? 'bg-green-500' : 'bg-gray-200'
                          }`}
                        >
                          <span
                            className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow transform transition-transform ${
                              transport.is_active ? 'translate-x-4' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <div className="flex items-center justify-end gap-3">
                          <button
                            onClick={() => setEditing(transport)}
                            className="text-xs text-gray-400 hover:text-gray-700 transition-colors"
                          >
                            {tCommon('editar')}
                          </button>
                          <button
                            onClick={() => setDeleting(transport)}
                            className="text-xs text-gray-400 hover:text-red-600 transition-colors"
                          >
                            {tCommon('deletar')}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            </div>
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

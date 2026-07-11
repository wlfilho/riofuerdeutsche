'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { Proposal, ProposalService, ProposalTreatment } from '@/lib/proposals';

// ─── Types ────────────────────────────────────────────────────────────────────

export type InitialLead = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  pax: number | null;
  children: number | null;
  requested_days: string[] | null;
};

type EditableItem = {
  _id: string;
  day: string;
  service_slug: string;
  service_name: string;
  duration_hours: number | null;
  transfer_hours_to: number | null;
  transfer_hours_back: number | null;
  costs: Array<{
    description: string;
    base_price: number;
    currency: 'EUR' | 'BRL';
    price_type: 'fixed' | 'per_pax' | 'per_hour';
  }>;
  note: string;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatGermanDay(iso: string): string {
  return new Date(iso + 'T12:00:00').toLocaleDateString('de-DE', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

// Guide hours for one item, sharing adjacent transfers with neighbours to avoid
// double-counting when multiple activities sit in the same day.
function calcItemGuideHours(
  item: EditableItem,
  isFirst: boolean,
  isLast: boolean,
): number {
  const toH = (item.transfer_hours_to ?? 0) * (isFirst ? 1 : 0.5);
  const backH = (item.transfer_hours_back ?? 0) * (isLast ? 1 : 0.5);
  return toH + (item.duration_hours ?? 0) + backH;
}

function calcItemAdditionalCosts(item: EditableItem, pax: number, exchangeRate: number): number {
  return (item.costs ?? []).reduce((sum, cost) => {
    let amount = cost.base_price;
    if (cost.price_type === 'per_pax') amount = cost.base_price * pax;
    const eur = cost.currency === 'BRL'
      ? (exchangeRate > 0 ? amount * exchangeRate : 0)
      : amount;
    return sum + eur;
  }, 0);
}

// Returns the total EUR per item, distributing the day's ceiled guide fee
// proportionally so that the sum across items equals ceil(dayHours) × guideRate.
function calcDayItemTotals(
  dayItems: EditableItem[],
  pax: number,
  exchangeRate: number,
  guideRate: number,
): number[] {
  if (dayItems.length === 0) return [];
  const rawHours = dayItems.map((item, idx) =>
    calcItemGuideHours(item, idx === 0, idx === dayItems.length - 1),
  );
  const dayRawHours = rawHours.reduce((s, h) => s + h, 0);
  const ceiledGuideFee = Math.ceil(dayRawHours) * guideRate;
  return dayItems.map((item, idx) => {
    const ratio = dayRawHours > 0 ? rawHours[idx] / dayRawHours : 1 / dayItems.length;
    return ceiledGuideFee * ratio + calcItemAdditionalCosts(item, pax, exchangeRate);
  });
}

function calcItemTotalEur(
  item: EditableItem,
  pax: number,
  exchangeRate: number,
  guideRate: number,
  isFirst = true,
  isLast = true,
): number {
  const guideFee = calcItemGuideHours(item, isFirst, isLast) * guideRate;
  return guideFee + calcItemAdditionalCosts(item, pax, exchangeRate);
}

function formatEur(n: number): string {
  return `€${n.toFixed(2).replace('.', ',')}`;
}

function formatCostPrice(cost: EditableItem['costs'][0]): string {
  const sym = cost.currency === 'EUR' ? '€' : 'R$';
  const val = cost.base_price % 1 === 0
    ? cost.base_price.toFixed(0)
    : cost.base_price.toFixed(2).replace('.', ',');
  const suffix = cost.price_type === 'per_pax' ? ' / pessoa'
    : cost.price_type === 'per_hour' ? ' / Std.'
    : ' fixo';
  return `${sym}${val}${suffix}`;
}

function formatCostSummary(costs: ProposalService['costs']): string {
  if (costs.length === 0) return 'sem custo adicional';
  return costs
    .map(c => {
      const sym = c.currency === 'EUR' ? '€' : 'R$';
      const val = c.base_price % 1 === 0 ? c.base_price.toFixed(0) : c.base_price.toFixed(2);
      const suffix = c.price_type === 'per_pax' ? '/pax'
        : c.price_type === 'per_hour' ? '/h'
        : ' fx';
      return `${sym}${val}${suffix}`;
    })
    .join(' + ');
}

function formatServiceHours(s: ProposalService): string {
  const total = (s.transfer_hours_to ?? 0) + (s.duration_hours ?? 0) + (s.transfer_hours_back ?? 0);
  return total > 0 ? `${total}h total` : '—';
}

function calcDayHours(items: EditableItem[]): number {
  if (items.length === 0) return 0;

  let total = 0;

  total += items[0].transfer_hours_to ?? 0;

  for (let i = 0; i < items.length; i++) {
    total += items[i].duration_hours ?? 0;

    if (i < items.length - 1) {
      const between =
        ((items[i].transfer_hours_back ?? 0) + (items[i + 1].transfer_hours_to ?? 0)) / 2;
      total += between;
    }
  }

  total += items[items.length - 1].transfer_hours_back ?? 0;

  return total;
}

const INPUT_CLS =
  'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent';

const CATEGORIES = [
  { key: 'tour' as const,      label: 'Tours',      icon: '🗺️' },
  { key: 'transfer' as const,  label: 'Transfers',  icon: '🚗' },
  { key: 'extra' as const,     label: 'Extras',     icon: '⭐' },
  { key: 'atração' as const,   label: 'Atrações',   icon: '🏛️' },
];

// ─── ServicePickerModal ───────────────────────────────────────────────────────

function ServicePickerModal({
  services,
  onAdd,
  onClose,
}: {
  services: ProposalService[];
  onAdd: (service: ProposalService) => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
          <h3 className="text-base font-bold text-gray-900">Leistung hinzufügen</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">
            ✕
          </button>
        </div>
        <div className="overflow-y-auto p-4 space-y-5">
          {CATEGORIES.map(({ key, label, icon }) => {
            const list = services.filter(s => s.category === key);
            if (!list.length) return null;
            return (
              <div key={key}>
                <p className="text-xs font-semibold text-gray-400 uppercase mb-2 tracking-wide">
                  {icon} {label}
                </p>
                <div className="space-y-0.5">
                  {list.map(s => (
                    <button
                      key={s.id}
                      onClick={() => { onAdd(s); onClose(); }}
                      className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm hover:bg-green-50 transition-colors text-left group"
                    >
                      <span className="font-medium text-gray-800 group-hover:text-green-800 truncate">
                        {s.name}
                      </span>
                      <div className="flex items-center gap-2 ml-4 shrink-0 text-xs text-gray-400">
                        <span className="tabular-nums">{formatServiceHours(s)}</span>
                        <span className="text-gray-200">·</span>
                        <span>{formatCostSummary(s.costs)}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
          {services.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-6">Keine Leistungen verfügbar.</p>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── ServiceRow ───────────────────────────────────────────────────────────────

function ServiceRow({
  item,
  pax,
  exchangeRate,
  guideRate,
  isFirst,
  isLast,
  onChange,
  onRemove,
}: {
  item: EditableItem;
  pax: number;
  exchangeRate: number;
  guideRate: number;
  isFirst: boolean;
  isLast: boolean;
  onChange: (updates: Partial<EditableItem>) => void;
  onRemove: () => void;
}) {
  const guideHours = calcItemGuideHours(item, isFirst, isLast);
  const guideFee = guideHours * guideRate;
  const totalEur = calcItemTotalEur(item, pax, exchangeRate, guideRate, isFirst, isLast);
  const hasBrl = (item.costs ?? []).some(c => c.currency === 'BRL');

  const timeLabel = [
    item.transfer_hours_to ? `Ida ${item.transfer_hours_to}h` : '',
    item.duration_hours ? `Atividade ${item.duration_hours}h` : '',
    item.transfer_hours_back ? `Volta ${item.transfer_hours_back}h` : '',
  ].filter(Boolean).join(' · ');

  return (
    <div className="bg-gray-50 rounded-xl p-3 space-y-2.5">
      {/* Name + remove */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-800">{item.service_name}</p>
          {timeLabel && <p className="text-xs text-gray-400 mt-0.5">{timeLabel}</p>}
        </div>
        <button
          onClick={onRemove}
          title="Entfernen"
          className="p-1 text-gray-300 hover:text-red-500 transition-colors rounded shrink-0"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      {/* Cost breakdown */}
      <div className="space-y-1">
        {guideHours > 0 && (
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-500">
              Honorário guia
              <span className="text-gray-400"> · {guideHours}h × {guideRate} EUR/h</span>
            </span>
            <span className="tabular-nums text-gray-600 ml-4 shrink-0">{formatEur(guideFee)}</span>
          </div>
        )}
        {(item.costs ?? []).map((cost, idx) => {
          let amount = cost.base_price;
          if (cost.price_type === 'per_pax') amount = cost.base_price * pax;
          const eur = cost.currency === 'BRL'
            ? (exchangeRate > 0 ? amount * exchangeRate : 0)
            : amount;
          return (
            <div key={idx} className="flex items-center justify-between text-xs">
              <span className="text-gray-500">
                {cost.description}
                <span className="text-gray-400"> · {formatCostPrice(cost)}</span>
              </span>
              <span className="tabular-nums text-gray-600 ml-4 shrink-0">{formatEur(eur)}</span>
            </div>
          );
        })}
      </div>

      {/* Note — only editable field */}
      <input
        type="text"
        value={item.note}
        onChange={e => onChange({ note: e.target.value })}
        className={INPUT_CLS}
        placeholder="Anmerkung (z.B. GIG → Ipanema)"
      />

      {/* Total */}
      <div className="flex items-center justify-end gap-1.5 pt-1 border-t border-gray-200">
        <span className="text-xs text-gray-400">Total:</span>
        <span className="text-sm font-semibold text-gray-700 tabular-nums">{formatEur(totalEur)}</span>
        {hasBrl && (
          <span className="text-xs text-gray-400">(câmbio {exchangeRate})</span>
        )}
      </div>
    </div>
  );
}

// ─── DayBlock ─────────────────────────────────────────────────────────────────

function DayBlock({
  day,
  items,
  services,
  pax,
  exchangeRate,
  guideRate,
  maxHoursPerDay,
  onAddItem,
  onUpdateItem,
  onRemoveItem,
  onRemoveDay,
}: {
  day: string;
  items: EditableItem[];
  services: ProposalService[];
  pax: number;
  exchangeRate: number;
  guideRate: number;
  maxHoursPerDay: number;
  onAddItem: (day: string, service: ProposalService) => void;
  onUpdateItem: (id: string, updates: Partial<EditableItem>) => void;
  onRemoveItem: (id: string) => void;
  onRemoveDay: () => void;
}) {
  const [pickerOpen, setPickerOpen] = useState(false);

  const dayTotal = calcDayItemTotals(items, pax, exchangeRate, guideRate).reduce((s, v) => s + v, 0);
  const dayHours = calcDayHours(items);
  const overloaded = dayHours > maxHoursPerDay;

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <div className={`flex items-start justify-between bg-gray-50 px-4 py-3 ${items.length > 0 ? 'border-b border-gray-200' : ''}`}>
        <div>
          <p className="text-sm font-semibold text-gray-800">{formatGermanDay(day)}</p>
          {items.length > 0 && (
            <p className="text-xs text-gray-400 mt-0.5">
              {items.length} Leistung{items.length !== 1 ? 'en' : ''} · {formatEur(dayTotal)}
              {dayHours > 0 && ` · ${dayHours}h`}
            </p>
          )}
          {overloaded && (
            <p className="text-xs text-amber-600 font-medium mt-1">
              ⚠️ Mais de {maxHoursPerDay}h neste dia — verifique o programa.
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 ml-4 shrink-0">
          <button
            onClick={() => setPickerOpen(true)}
            className="px-3 py-1.5 text-xs font-semibold bg-white border border-gray-300 text-gray-600 rounded-lg hover:bg-green-50 hover:border-green-300 hover:text-green-700 transition-colors"
          >
            + Leistung
          </button>
          <button
            onClick={onRemoveDay}
            title="Tag entfernen"
            className="p-1.5 text-gray-300 hover:text-red-500 transition-colors rounded"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>

      {items.length > 0 && (
        <div className="p-3 space-y-2">
          {items.map((item, idx) => (
            <ServiceRow
              key={item._id}
              item={item}
              pax={pax}
              exchangeRate={exchangeRate}
              guideRate={guideRate}
              isFirst={idx === 0}
              isLast={idx === items.length - 1}
              onChange={updates => onUpdateItem(item._id, updates)}
              onRemove={() => onRemoveItem(item._id)}
            />
          ))}
        </div>
      )}

      {pickerOpen && (
        <ServicePickerModal
          services={services}
          onAdd={s => onAddItem(day, s)}
          onClose={() => setPickerOpen(false)}
        />
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function NovaPropostaForm({
  services,
  defaultGuideRate,
  defaultExchangeRate,
  maxHoursPerDay,
  initialData,
  proposalId,
  initialLead,
}: {
  services: ProposalService[];
  defaultGuideRate: number;
  defaultExchangeRate: number;
  maxHoursPerDay: number;
  initialData?: Proposal;
  proposalId?: string;
  initialLead?: InitialLead;
}) {
  const router = useRouter();
  const isEditing = !!proposalId;

  const initialItems: EditableItem[] = (initialData?.items ?? []).map(item => ({
    _id: Math.random().toString(36).slice(2),
    day: item.day,
    service_slug: item.service_slug,
    service_name: item.service_name,
    duration_hours: item.duration_hours,
    transfer_hours_to: item.transfer_hours_to,
    transfer_hours_back: item.transfer_hours_back,
    costs: item.costs.map(c => ({
      description: c.description,
      base_price: c.base_price,
      currency: c.currency,
      price_type: c.price_type,
    })),
    note: item.note,
  }));

  const [clientName, setClientName] = useState(initialData?.client_name ?? initialLead?.name ?? '');
  const [clientEmail, setClientEmail] = useState(initialData?.client_email ?? initialLead?.email ?? '');
  const [clientPhone, setClientPhone] = useState(initialData?.client_phone ?? initialLead?.phone ?? '');
  const [pax, setPax] = useState(initialData?.pax ?? initialLead?.pax ?? 2);
  const [treatment, setTreatment] = useState<ProposalTreatment>(initialData?.treatment ?? 'du-ihr');
  const [exchangeRate, setExchangeRate] = useState(initialData?.exchange_rate ?? defaultExchangeRate);
  const [guideRate, setGuideRate] = useState(initialData?.guide_rate ?? defaultGuideRate);
  const [internalNotes, setInternalNotes] = useState(
    initialData?.internal_notes
      ?? ((initialLead?.children ?? 0) > 0
        ? `Grupo com ${initialLead!.children} criança${initialLead!.children !== 1 ? 's' : ''} (não contam no preço).`
        : '')
  );
  const [items, setItems] = useState<EditableItem[]>(initialItems);
  const [activeDays, setActiveDays] = useState<string[]>(
    initialItems.length > 0
      ? [...new Set(initialItems.map(i => i.day))].sort()
      : [...(initialLead?.requested_days ?? [])].sort()
  );
  const [showDayPicker, setShowDayPicker] = useState(false);
  const [dayInput, setDayInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<1 | 2>(1);

  // Live daily rate for new proposals only; when editing, the rate stored on
  // the proposal is a price snapshot and must not silently change.
  useEffect(() => {
    if (isEditing) return;
    fetch('/api/admin/exchange-rate')
      .then(res => res.json())
      .then(data => {
        if (data?.rate) {
          setExchangeRate(parseFloat(data.rate.toFixed(4)));
        }
      })
      .catch(() => {});
  }, [isEditing]);

  const summaryItems = useMemo(
    () => activeDays.flatMap(day => items.filter(i => i.day === day)),
    [activeDays, items],
  );

  const grandTotal = useMemo(
    () => activeDays.reduce((total, day) => {
      const dayItems = items.filter(i => i.day === day);
      return total + calcDayItemTotals(dayItems, pax, exchangeRate, guideRate).reduce((s, v) => s + v, 0);
    }, 0),
    [activeDays, items, pax, exchangeRate, guideRate],
  );

  // ─── Day handlers ─────────────────────────────────────────────────────────────

  const handleAddDay = useCallback((date: string) => {
    setActiveDays(prev => (prev.includes(date) ? prev : [...prev, date].sort()));
    setDayInput('');
    setShowDayPicker(false);
  }, []);

  const handleRemoveDay = useCallback((date: string) => {
    setActiveDays(prev => prev.filter(d => d !== date));
    setItems(prev => prev.filter(i => i.day !== date));
  }, []);

  // ─── Item handlers ────────────────────────────────────────────────────────────

  const handleAddItem = useCallback((day: string, service: ProposalService) => {
    setItems(prev => [
      ...prev,
      {
        _id: Math.random().toString(36).slice(2),
        day,
        service_slug: service.slug,
        service_name: service.name,
        duration_hours: service.duration_hours,
        transfer_hours_to: service.transfer_hours_to,
        transfer_hours_back: service.transfer_hours_back,
        costs: (service.costs ?? []).map(c => ({
          description: c.description,
          base_price: c.base_price,
          currency: c.currency,
          price_type: c.price_type,
        })),
        note: '',
      },
    ]);
  }, []);

  const handleUpdateItem = useCallback((id: string, updates: Partial<EditableItem>) => {
    setItems(prev => prev.map(i => (i._id === id ? { ...i, ...updates } : i)));
  }, []);

  const handleRemoveItem = useCallback((id: string) => {
    setItems(prev => prev.filter(i => i._id !== id));
  }, []);

  // ─── Step navigation ──────────────────────────────────────────────────────────

  const handleGoToItinerary = () => {
    setError(null);
    if (!clientName.trim()) { setError('Name ist Pflichtfeld.'); return; }
    if (pax < 1) { setError('Mindestens 1 Person.'); return; }
    setStep(2);
    window.scrollTo({ top: 0 });
  };

  const handleBackToData = () => {
    setError(null);
    setStep(1);
    window.scrollTo({ top: 0 });
  };

  // ─── Submit ───────────────────────────────────────────────────────────────────

  const handleSubmit = async () => {
    setError(null);
    if (!clientName.trim()) { setError('Name ist Pflichtfeld.'); return; }
    if (pax < 1) { setError('Mindestens 1 Person.'); return; }
    if (summaryItems.length === 0) { setError('Mindestens eine Leistung im Itinerar hinzufügen.'); return; }

    setSubmitting(true);
    try {
      const cleanItems = activeDays.flatMap(day => {
        const dayItems = summaryItems.filter(i => i.day === day);
        const dayTotals = calcDayItemTotals(dayItems, pax, exchangeRate, guideRate);
        return dayItems.map((item, idx) => {
          const { _id: _skip, costs, ...rest } = item;
          return {
            ...rest,
            costs: costs.map(cost => {
              let amount = cost.base_price;
              if (cost.price_type === 'per_pax') amount = cost.base_price * pax;
              const eur = cost.currency === 'BRL'
                ? (exchangeRate > 0 ? amount * exchangeRate : 0)
                : amount;
              return { ...cost, total_eur: eur };
            }),
            total_eur: dayTotals[idx],
          };
        });
      });

      // Arrival/departure are derived from the tour days so the proposals
      // list and the German output (Reisezeitraum) keep working unchanged.
      const tourDays = [...new Set(cleanItems.map(i => i.day))].sort();

      const url = isEditing ? `/api/admin/proposals/${proposalId}` : '/api/admin/proposals';
      const method = isEditing ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_name: clientName.trim(),
          client_email: clientEmail.trim(),
          client_phone: clientPhone.trim(),
          pax,
          lead_id: !isEditing ? initialLead?.id : undefined,
          arrival_date: tourDays[0],
          departure_date: tourDays[tourDays.length - 1],
          treatment,
          internal_notes: internalNotes.trim(),
          items: cleanItems,
          exchange_rate: exchangeRate,
          guide_rate: guideRate,
        }),
      });

      const data = await res.json();
      if (!res.ok) { setError(data.error ?? 'Fehler beim Speichern.'); return; }

      router.push(`/admin/propostas/${data.id}/output`);
    } catch {
      setError('Netzwerkfehler. Bitte versuche es erneut.');
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="p-6 md:p-10">
      <div className="max-w-3xl space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/admin/propostas" className="text-sm text-gray-400 hover:text-gray-700 transition-colors">
              ← Propostas
            </Link>
            <span className="text-gray-200">/</span>
            {isEditing && (
              <>
                <Link href={`/admin/propostas/${proposalId}/output`} className="text-sm text-gray-400 hover:text-gray-700 transition-colors">
                  {initialData?.client_name}
                </Link>
                <span className="text-gray-200">/</span>
              </>
            )}
            <h1 className="text-2xl font-bold text-gray-900">
              {isEditing ? 'Proposta bearbeiten' : 'Nova Proposta'}
            </h1>
          </div>
          {step === 1 ? (
            <button
              onClick={handleGoToItinerary}
              className="px-5 py-2 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 transition-colors"
            >
              Continuar →
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="px-5 py-2 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Wird gespeichert…' : isEditing ? 'Änderungen speichern' : 'Gerar Proposta'}
            </button>
          )}
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-3 text-sm">
          <button
            onClick={step === 2 ? handleBackToData : undefined}
            className={`flex items-center gap-2 ${step === 1 ? 'text-green-700 font-semibold' : 'text-gray-400 hover:text-gray-600 transition-colors'}`}
          >
            <span className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${step === 1 ? 'bg-green-600 text-white' : 'bg-green-100 text-green-700'}`}>
              {step === 2 ? '✓' : '1'}
            </span>
            Dados do cliente
          </button>
          <div className={`h-px w-10 ${step === 2 ? 'bg-green-300' : 'bg-gray-200'}`} />
          <div className={`flex items-center gap-2 ${step === 2 ? 'text-green-700 font-semibold' : 'text-gray-400'}`}>
            <span className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${step === 2 ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
              2
            </span>
            Itinerário
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-lg text-sm bg-red-50 text-red-800 border border-red-200">
            {error}
          </div>
        )}

        {/* ── Step 1: Client data ── */}
        {step === 1 && (
        <>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-base font-bold text-gray-900 mb-5">Dados do Cliente</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome <span className="text-red-500">*</span>
              </label>
              <input type="text" value={clientName} onChange={e => setClientName(e.target.value)} className={INPUT_CLS} placeholder="Martin Müller" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">E-Mail</label>
              <input type="email" value={clientEmail} onChange={e => setClientEmail(e.target.value)} className={INPUT_CLS} placeholder="martin@email.de" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp</label>
              <input type="text" value={clientPhone} onChange={e => setClientPhone(e.target.value)} className={INPUT_CLS} placeholder="+49 170 1234567" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nº de pessoas <span className="text-red-500">*</span>
              </label>
              <input type="number" min="1" value={pax} onChange={e => setPax(Math.max(1, parseInt(e.target.value) || 1))} className={INPUT_CLS} placeholder="2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tratamento <span className="text-red-500">*</span>
              </label>
              <select value={treatment} onChange={e => setTreatment(e.target.value as ProposalTreatment)} className={INPUT_CLS}>
                <option value="Sie">Sie (formal)</option>
                <option value="du-ihr">du/ihr (informal)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Honorário do guia (EUR/h) <span className="text-red-500">*</span>
              </label>
              <input type="number" min="1" step="1" value={guideRate} onChange={e => setGuideRate(parseFloat(e.target.value) || 0)} className={INPUT_CLS} placeholder="40" />
              <p className="text-xs text-gray-400 mt-1">Tarifa por hora do guia. Padrão: 40 EUR/h.</p>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Observações internas{' '}
                <span className="text-xs font-normal text-gray-400">(apenas visível para você)</span>
              </label>
              <textarea value={internalNotes} onChange={e => setInternalNotes(e.target.value)} rows={3} className={`${INPUT_CLS} resize-none`} placeholder="Notas internas..." />
            </div>
          </div>
        </div>

        {/* Step 1 footer */}
        <div className="flex justify-end pb-10">
          <button
            onClick={handleGoToItinerary}
            className="px-6 py-3 bg-green-600 text-white text-sm font-semibold rounded-xl hover:bg-green-700 transition-colors"
          >
            Continuar para o itinerário →
          </button>
        </div>
        </>
        )}

        {/* ── Step 2: Itinerary ── */}
        {step === 2 && (
        <>
        {/* Client data recap */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-600">
          <span className="font-semibold text-gray-800">{clientName}</span>
          <span>{pax} {pax === 1 ? 'pessoa' : 'pessoas'}</span>
          {activeDays.length > 0 && (
            <span>{activeDays.length} {activeDays.length === 1 ? 'dia' : 'dias'} de tour</span>
          )}
          <span className="text-gray-400">{guideRate} EUR/h · câmbio {exchangeRate}</span>
          <button
            onClick={handleBackToData}
            className="ml-auto text-xs font-semibold text-green-700 hover:text-green-900 transition-colors"
          >
            Editar dados
          </button>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-base font-bold text-gray-900 mb-5">Itinerário</h2>

          <div className="space-y-3">
            {activeDays.length === 0 && (
              <div className="flex flex-col items-center justify-center py-10 text-center text-gray-400">
                <div className="text-3xl mb-3">🗓</div>
                <p className="text-sm mb-4">Adicione os dias de tour do cliente para montar o itinerário.</p>
              </div>
            )}

            {activeDays.map(day => (
              <DayBlock
                key={day}
                day={day}
                items={items.filter(i => i.day === day)}
                services={services}
                pax={pax}
                exchangeRate={exchangeRate}
                guideRate={guideRate}
                maxHoursPerDay={maxHoursPerDay}
                onAddItem={handleAddItem}
                onUpdateItem={handleUpdateItem}
                onRemoveItem={handleRemoveItem}
                onRemoveDay={() => handleRemoveDay(day)}
              />
            ))}

            <div className="pt-1">
              {showDayPicker ? (
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    autoFocus
                    value={dayInput}
                    onChange={e => setDayInput(e.target.value)}
                    className={`${INPUT_CLS} max-w-xs`}
                  />
                  <button
                    onClick={() => { if (dayInput) handleAddDay(dayInput); }}
                    disabled={!dayInput}
                    className="px-3 py-2 text-xs font-semibold bg-white border border-gray-300 text-gray-600 rounded-lg hover:bg-green-50 hover:border-green-300 hover:text-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Adicionar
                  </button>
                  <button
                    onClick={() => { setShowDayPicker(false); setDayInput(''); }}
                    className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    Abbrechen
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowDayPicker(true)}
                  className="px-4 py-2 text-sm font-semibold border border-dashed border-gray-300 text-gray-500 rounded-lg hover:bg-green-50 hover:border-green-400 hover:text-green-700 transition-colors w-full"
                >
                  + Tag hinzufügen
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ── Section 3: Price Summary ── */}
        {summaryItems.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-base font-bold text-gray-900 mb-4">Resumo de Preços</h2>
            <div className="space-y-2">
              {activeDays.flatMap(day => {
                const dayItems = items.filter(i => i.day === day);
                const dayTotals = calcDayItemTotals(dayItems, pax, exchangeRate, guideRate);
                return dayItems.map((item, idx) => (
                  <div key={item._id} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-gray-400 text-xs shrink-0">
                        {formatGermanDay(item.day).split(',')[0]}
                      </span>
                      <span className="text-gray-700 truncate">{item.service_name}</span>
                    </div>
                    <span className="tabular-nums text-gray-700 font-medium ml-4 shrink-0">
                      {formatEur(dayTotals[idx])}
                    </span>
                  </div>
                ));
              })}
            </div>
            <div className="mt-4 pt-4 border-t-2 border-gray-200 flex items-center justify-between">
              <span className="font-semibold text-gray-600">Gesamtbetrag</span>
              <span className="text-2xl font-bold text-green-600 tabular-nums">
                {formatEur(grandTotal)}
              </span>
            </div>
          </div>
        )}

        {/* Step 2 footer */}
        <div className="flex items-center justify-between pb-10">
          <button
            onClick={handleBackToData}
            className="px-4 py-3 text-sm font-semibold text-gray-500 hover:text-gray-800 transition-colors"
          >
            ← Voltar aos dados
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="px-6 py-3 bg-green-600 text-white text-sm font-semibold rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Wird gespeichert…' : isEditing ? 'Änderungen speichern →' : 'Gerar Proposta →'}
          </button>
        </div>
        </>
        )}

      </div>
    </div>
  );
}

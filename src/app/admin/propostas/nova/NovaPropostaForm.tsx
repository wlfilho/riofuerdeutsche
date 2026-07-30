'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type {
  Proposal,
  ProposalPriceDisplay,
  ProposalService,
  ProposalTransportType,
  ProposalTreatment,
} from '@/lib/proposals';

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

// Where a newly picked service lands inside the day:
// at the start, at the end, or before/after a specific activity.
type InsertPosition = 'start' | 'end' | { before: string } | { after: string };

type EditableItem = {
  _id: string;
  day: string;
  service_slug: string;
  service_name: string;
  service_description: string | null;
  duration_hours: number | null;
  transfer_hours_to: number | null;
  transfer_hours_back: number | null;
  costs: Array<{
    description: string;
    base_price: number;
    currency: 'EUR' | 'BRL';
    price_type: 'fixed' | 'per_pax' | 'per_hour';
    // true = cobrado na proposta; false = cliente paga no local (só exibido).
    included: boolean;
  }>;
  // A atividade usa veículo próprio (transporte por faixa)? Entra no custo
  // de transporte do dia (diária do carro + motorista por hora).
  uses_vehicle: boolean;
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

// Single source of truth for converting one additional-cost line to EUR:
// per_pax multiplies by the group size, per_hour by the activity's own
// duration (transfers excluded), fixed stays as-is.
function calcCostEur(
  cost: EditableItem['costs'][0],
  pax: number,
  durationHours: number,
  exchangeRate: number,
): number {
  let amount = cost.base_price;
  if (cost.price_type === 'per_pax') amount = cost.base_price * pax;
  if (cost.price_type === 'per_hour') amount = cost.base_price * durationHours;
  return cost.currency === 'BRL'
    ? (exchangeRate > 0 ? amount * exchangeRate : 0)
    : amount;
}

function calcItemAdditionalCosts(item: EditableItem, pax: number, exchangeRate: number): number {
  // Custos com included=false ficam fora do total: o cliente paga no local
  // (mas o valor segue exibido na proposta como "Vor Ort zu zahlen").
  return (item.costs ?? []).reduce(
    (sum, cost) => sum + (cost.included ? calcCostEur(cost, pax, item.duration_hours ?? 0, exchangeRate) : 0),
    0,
  );
}

// Vehicle + third-party driver, priced per itinerary day (NOT per activity)
// and fully separate from the guide fee. Two independent day toggles decide
// what is charged: uses_rental_car → car daily rate; uses_driver → driver
// hours over the transfer legs of the day's tier-transport activities.
type DayToggles = { uses_driver: boolean; uses_rental_car: boolean };

const DEFAULT_DAY_TOGGLES: DayToggles = { uses_driver: true, uses_rental_car: true };

// Tarifas efetivas da proposta: a faixa por pax é só o default — a proposta
// pode customizar os dois valores. null = nem faixa nem valor manual.
type TransportRates = {
  carRate: number | null;
  driverRate: number | null;
  currency: 'BRL' | 'EUR';
  tierLabel: string | null;
};

type DayTransport =
  | { status: 'off' }
  | { status: 'no-rates'; hours: number }
  | {
      status: 'ok';
      hours: number;
      carCostEur: number;
      driverCostEur: number;
      costEur: number;
    };

function calcDayTransport(
  dayItems: EditableItem[],
  rates: TransportRates,
  exchangeRate: number,
  toggles: DayToggles,
): DayTransport {
  if (dayItems.length === 0) return { status: 'off' };
  if (!toggles.uses_driver && !toggles.uses_rental_car) return { status: 'off' };

  const hours = dayItems
    .filter(i => i.uses_vehicle)
    .reduce((sum, i) => sum + (i.transfer_hours_to ?? 0) + (i.transfer_hours_back ?? 0), 0);
  if (rates.carRate === null && rates.driverRate === null) return { status: 'no-rates', hours };

  const carAmount = toggles.uses_rental_car ? (rates.carRate ?? 0) : 0;
  const driverAmount = toggles.uses_driver ? (rates.driverRate ?? 0) * hours : 0;
  const toEur = rates.currency === 'BRL' ? (exchangeRate > 0 ? exchangeRate : 0) : 1;
  return {
    status: 'ok',
    hours,
    carCostEur: carAmount * toEur,
    driverCostEur: driverAmount * toEur,
    costEur: (carAmount + driverAmount) * toEur,
  };
}

// Embutir no honorário = o custo existe pro Will, mas não é cobrado por fora.
// Divide o custo do dia entre a parte cobrada (soma no total do cliente) e a
// parte embutida (referência interna).
type EmbedFlags = { car: boolean; driver: boolean };

function splitTransportCost(
  transport: DayTransport,
  embed: EmbedFlags,
): { chargeableEur: number; embeddedEur: number } {
  if (transport.status !== 'ok') return { chargeableEur: 0, embeddedEur: 0 };
  const chargeableEur =
    (embed.car ? 0 : transport.carCostEur) + (embed.driver ? 0 : transport.driverCostEur);
  return { chargeableEur, embeddedEur: transport.costEur - chargeableEur };
}

function serviceUsesVehicle(service: ProposalService): boolean {
  const t = service.transport_type;
  return !!t && !t.is_manual && !t.is_included && t.slug !== 'a-pe' && t.tiers.length > 0;
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

// ─── Day timeline ─────────────────────────────────────────────────────────────

type DaySegment = {
  kind: 'transfer' | 'activity';
  label: string;
  hours: number;
  itemId?: string;
  startMin: number;
  endMin: number;
  // For transfer segments: where a service picked via the segment's "+" lands.
  insert?: InsertPosition;
};

function timeToMinutes(t: string): number {
  const [h, m] = t.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}

function minutesToLabel(min: number): string {
  const h = Math.floor(min / 60) % 24;
  const m = Math.round(min % 60);
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

function formatHoursShort(hours: number): string {
  const totalMin = Math.round(hours * 60);
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  if (h === 0) return `${m}min`;
  if (m === 0) return `${h}h`;
  return `${h}h${m.toString().padStart(2, '0')}`;
}

// Builds the visual day schedule. Transfers between two activities are merged
// into a single block of (back + to) / 2 hours so the timeline total matches
// calcDayHours (and therefore the priced guide hours).
function buildDaySegments(items: EditableItem[], startTime: string): DaySegment[] {
  const segs: DaySegment[] = [];
  let t = timeToMinutes(startTime);

  const push = (
    kind: DaySegment['kind'],
    label: string,
    hours: number,
    itemId?: string,
    insert?: InsertPosition,
  ) => {
    const startMin = t;
    t += Math.round(hours * 60);
    segs.push({ kind, label, hours, itemId, startMin, endMin: t, insert });
  };

  items.forEach((item, i) => {
    if (i === 0 && (item.transfer_hours_to ?? 0) > 0) {
      push('transfer', 'Transfer', item.transfer_hours_to!, undefined, 'start');
    }
    push('activity', item.service_name, item.duration_hours ?? 0, item._id);
    if (i < items.length - 1) {
      const between = ((item.transfer_hours_back ?? 0) + (items[i + 1].transfer_hours_to ?? 0)) / 2;
      if (between > 0) push('transfer', 'Transfer', between, undefined, { after: item._id });
    } else if ((item.transfer_hours_back ?? 0) > 0) {
      push('transfer', 'Transfer', item.transfer_hours_back!, undefined, 'end');
    }
  });

  return segs;
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
          <h3 className="text-base font-bold text-gray-900">Adicionar serviço</h3>
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
            <p className="text-sm text-gray-400 text-center py-6">Nenhum serviço disponível.</p>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── DayScheduleGrid ──────────────────────────────────────────────────────────

const PX_PER_HOUR = 48;

function DayScheduleGrid({
  segments,
  startTime,
  endTime,
  items,
  pax,
  exchangeRate,
  guideRate,
  onUpdateItem,
  onRemoveItem,
  onMoveItem,
  onRequestAdd,
  onDropItem,
}: {
  segments: DaySegment[];
  startTime: string;
  endTime: string;
  items: EditableItem[];
  pax: number;
  exchangeRate: number;
  guideRate: number;
  onUpdateItem: (id: string, updates: Partial<EditableItem>) => void;
  onRemoveItem: (id: string) => void;
  onMoveItem: (id: string, direction: -1 | 1) => void;
  onRequestAdd: (position: InsertPosition) => void;
  onDropItem: (draggedId: string, targetItemId?: string) => void;
}) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | 'grid' | null>(null);

  const startMin = timeToMinutes(startTime);
  const windowEndMin = Math.max(timeToMinutes(endTime), startMin + 60);
  const contentEndMin = segments.length > 0 ? segments[segments.length - 1].endMin : startMin;

  // The grid always shows the whole configured day window; it only grows
  // beyond it when the programme overflows the end of the day.
  const gridStartMin = Math.floor(startMin / 60) * 60;
  const gridEndMin = Math.ceil(Math.max(windowEndMin, contentEndMin) / 60) * 60;
  const totalPx = ((gridEndMin - gridStartMin) / 60) * PX_PER_HOUR;

  const hourMarks: number[] = [];
  for (let m = gridStartMin; m <= gridEndMin; m += 60) hourMarks.push(m);

  const topOf = (min: number) => ((min - gridStartMin) / 60) * PX_PER_HOUR;

  const occupiedMin = contentEndMin - startMin;
  const freeMin = Math.max(windowEndMin - contentEndMin, 0);
  const overflowMin = Math.max(contentEndMin - windowEndMin, 0);

  return (
    <div className="space-y-2">
      <div
        className={`relative rounded transition-colors ${dragOverId === 'grid' ? 'bg-green-50/60 ring-1 ring-green-300' : ''}`}
        style={{ height: totalPx + 8 }}
        onDragOver={e => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; setDragOverId('grid'); }}
        onDragLeave={() => setDragOverId(prev => (prev === 'grid' ? null : prev))}
        onDrop={e => {
          e.preventDefault();
          const id = e.dataTransfer.getData('text/plain');
          if (id) onDropItem(id);
          setDragOverId(null);
        }}
      >
        {/* Hour grid */}
        {hourMarks.map(m => (
          <div
            key={m}
            className="absolute left-0 right-0 border-t border-gray-200"
            style={{ top: topOf(m) }}
          >
            <span className="absolute -top-2 left-0 text-[10px] text-gray-500 tabular-nums bg-white pr-1">
              {minutesToLabel(m)}
            </span>
          </div>
        ))}

        {/* Segments */}
        {segments.map((seg, idx) => {
          const top = topOf(seg.startMin);
          const height = ((seg.endMin - seg.startMin) / 60) * PX_PER_HOUR;

          if (seg.kind === 'transfer') {
            return (
              <div
                key={idx}
                style={{ top, height: Math.max(height, 16) }}
                className="absolute left-12 right-1"
              >
                <div className="h-full flex items-center bg-gray-100/90 border-l-4 border-gray-300 rounded-r-md px-2 overflow-hidden">
                  <p className="text-[10px] text-gray-500 tabular-nums truncate">
                    🚗 Transfer · {formatHoursShort(seg.hours)}
                  </p>
                </div>
                {seg.insert && (
                  <button
                    onClick={() => onRequestAdd(seg.insert!)}
                    title="Inserir serviço aqui"
                    className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-5 h-5 flex items-center justify-center rounded-full bg-white border border-gray-300 text-gray-400 text-xs leading-none hover:border-green-400 hover:text-green-600 shadow-sm transition-colors"
                  >
                    +
                  </button>
                )}
              </div>
            );
          }

          const item = items.find(i => i._id === seg.itemId);
          if (!item) return null;
          const itemIdx = items.findIndex(i => i._id === item._id);
          const isFirst = itemIdx === 0;
          const isLast = itemIdx === items.length - 1;
          const expanded = expandedId === item._id;

          const guideHours = calcItemGuideHours(item, isFirst, isLast);
          const guideFee = guideHours * guideRate;
          const totalEur = calcItemTotalEur(item, pax, exchangeRate, guideRate, isFirst, isLast);
          const hasBrl = (item.costs ?? []).some(c => c.currency === 'BRL');

          const controls = (
            <div className="flex items-center gap-0.5 shrink-0" onClick={e => e.stopPropagation()}>
              <button
                onClick={() => onMoveItem(item._id, -1)}
                disabled={isFirst}
                title="Mover para mais cedo"
                className="p-0.5 text-gray-300 hover:text-green-600 transition-colors rounded disabled:opacity-30 disabled:hover:text-gray-300"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>
              </button>
              <button
                onClick={() => onMoveItem(item._id, 1)}
                disabled={isLast}
                title="Mover para mais tarde"
                className="p-0.5 text-gray-300 hover:text-green-600 transition-colors rounded disabled:opacity-30 disabled:hover:text-gray-300"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
              <button
                onClick={() => onRemoveItem(item._id)}
                title="Entfernen"
                className="p-0.5 text-gray-300 hover:text-red-500 transition-colors rounded"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          );

          if (expanded) {
            return (
              <div
                key={idx}
                style={{ top, minHeight: Math.max(height, 30) }}
                className="absolute left-12 right-1 z-20 bg-white border border-green-300 rounded-lg shadow-xl p-3 space-y-2 cursor-default"
                onClick={e => e.stopPropagation()}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-800">{item.service_name}</p>
                    <p className="text-[11px] text-green-700 tabular-nums">
                      {minutesToLabel(seg.startMin)}–{minutesToLabel(seg.endMin)} · {formatHoursShort(seg.hours)}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {controls}
                    <button
                      onClick={() => setExpandedId(null)}
                      title="Recolher"
                      className="p-0.5 text-gray-400 hover:text-gray-700 transition-colors rounded"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </div>

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
                  {(item.costs ?? []).map((cost, cIdx) => {
                    const eur = calcCostEur(cost, pax, item.duration_hours ?? 0, exchangeRate);
                    return (
                      <div key={cIdx} className="flex items-center justify-between text-xs">
                        <label
                          className="flex items-center gap-1.5 cursor-pointer select-none text-gray-500"
                          title="Marcado: entra no preço da proposta. Desmarcado: cliente paga no local (valor exibido na proposta)."
                        >
                          <input
                            type="checkbox"
                            checked={cost.included}
                            onChange={e => onUpdateItem(item._id, {
                              costs: item.costs.map((c, j) =>
                                j === cIdx ? { ...c, included: e.target.checked } : c,
                              ),
                            })}
                            className="rounded"
                          />
                          <span>
                            {cost.description}
                            <span className="text-gray-400"> · {formatCostPrice(cost)}</span>
                            {!cost.included && (
                              <span className="text-amber-600 font-medium"> · pax paga no local</span>
                            )}
                          </span>
                        </label>
                        <span className={`tabular-nums ml-4 shrink-0 ${cost.included ? 'text-gray-600' : 'text-gray-300 line-through'}`}>
                          {formatEur(eur)}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <input
                  type="text"
                  value={item.note}
                  onChange={e => onUpdateItem(item._id, { note: e.target.value })}
                  className={INPUT_CLS}
                  placeholder="Anotação (ex.: GIG → Ipanema)"
                />

                <div className="flex items-center justify-end gap-1.5 pt-1 border-t border-gray-200">
                  <span className="text-xs text-gray-400">Total:</span>
                  <span className="text-sm font-semibold text-gray-700 tabular-nums">{formatEur(totalEur)}</span>
                  {hasBrl && <span className="text-xs text-gray-400">(câmbio {exchangeRate})</span>}
                </div>
              </div>
            );
          }

          return (
            <div
              key={idx}
              style={{ top, height: Math.max(height, 30) }}
              className="absolute left-12 right-1"
            >
              <div
                draggable
                onDragStart={e => {
                  e.dataTransfer.setData('text/plain', item._id);
                  e.dataTransfer.effectAllowed = 'move';
                }}
                onDragOver={e => {
                  e.preventDefault();
                  e.stopPropagation();
                  e.dataTransfer.dropEffect = 'move';
                  setDragOverId(item._id);
                }}
                onDragLeave={() => setDragOverId(prev => (prev === item._id ? null : prev))}
                onDrop={e => {
                  e.preventDefault();
                  e.stopPropagation();
                  const id = e.dataTransfer.getData('text/plain');
                  if (id) onDropItem(id, item._id);
                  setDragOverId(null);
                }}
                className={`h-full bg-green-50 border-l-4 border-green-500 rounded-r-md px-2 py-1 overflow-hidden cursor-grab active:cursor-grabbing hover:bg-green-100 transition-colors ${dragOverId === item._id ? 'ring-2 ring-green-400' : ''}`}
                onClick={() => setExpandedId(item._id)}
                title="Clique para detalhes · arraste para reordenar"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-xs font-semibold text-green-900 leading-tight truncate">
                    {item.service_name}
                  </p>
                  {controls}
                </div>
                <p className="text-[11px] text-green-700 tabular-nums truncate">
                  {minutesToLabel(seg.startMin)}–{minutesToLabel(seg.endMin)} · {formatHoursShort(seg.hours)} · {formatEur(totalEur)}
                  {item.note && <span className="text-green-600"> · 📝 {item.note}</span>}
                </p>
              </div>
            </div>
          );
        })}

        {/* End-of-day marker when the programme overflows the window */}
        {overflowMin > 0 && (
          <div
            className="absolute left-0 right-0 border-t-2 border-dashed border-amber-400"
            style={{ top: topOf(windowEndMin) }}
          >
            <span className="absolute -top-2.5 right-0 text-[10px] font-semibold text-amber-600 bg-white pl-1">
              fim do dia {minutesToLabel(windowEndMin)}
            </span>
          </div>
        )}

        {segments.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <p className="text-xs text-gray-300">Dia livre — adicione um serviço acima.</p>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between text-xs text-gray-400 pt-2 border-t border-gray-100">
        <span>
          Ocupado: <span className="font-semibold text-gray-600 tabular-nums">{formatHoursShort(occupiedMin / 60)}</span>
          {segments.length > 0 && (
            <span className="tabular-nums"> (até {minutesToLabel(contentEndMin)})</span>
          )}
        </span>
        {overflowMin > 0 ? (
          <span className="text-amber-600 font-medium">
            ⚠️ passa {formatHoursShort(overflowMin / 60)} do fim do dia
          </span>
        ) : (
          <span>
            Livre: <span className="font-semibold text-green-600 tabular-nums">{formatHoursShort(freeMin / 60)}</span>
          </span>
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
  transportRates,
  embed,
  maxHoursPerDay,
  startTime,
  endTime,
  toggles,
  onChangeToggles,
  onChangeStartTime,
  onChangeEndTime,
  onAddItem,
  onUpdateItem,
  onRemoveItem,
  onMoveItem,
  onDropItem,
  onRemoveDay,
}: {
  day: string;
  items: EditableItem[];
  services: ProposalService[];
  pax: number;
  exchangeRate: number;
  guideRate: number;
  transportRates: TransportRates;
  embed: EmbedFlags;
  maxHoursPerDay: number;
  startTime: string;
  endTime: string;
  toggles: DayToggles;
  onChangeToggles: (patch: Partial<DayToggles>) => void;
  onChangeStartTime: (t: string) => void;
  onChangeEndTime: (t: string) => void;
  onAddItem: (day: string, service: ProposalService, position?: InsertPosition) => void;
  onUpdateItem: (id: string, updates: Partial<EditableItem>) => void;
  onRemoveItem: (id: string) => void;
  onMoveItem: (id: string, direction: -1 | 1) => void;
  onDropItem: (draggedId: string, targetDay: string, targetItemId?: string) => void;
  onRemoveDay: () => void;
}) {
  const [pickerFor, setPickerFor] = useState<InsertPosition | null>(null);

  const transport = calcDayTransport(items, transportRates, exchangeRate, toggles);
  const { chargeableEur, embeddedEur } = splitTransportCost(transport, embed);
  const dayTotal =
    calcDayItemTotals(items, pax, exchangeRate, guideRate).reduce((s, v) => s + v, 0)
    + chargeableEur;
  const dayHours = calcDayHours(items);
  const overloaded = dayHours > maxHoursPerDay;

  const segments = buildDaySegments(items, startTime);

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-semibold text-gray-800">{formatGermanDay(day)}</p>
            {items.length > 0 && (
              <p className="text-xs text-gray-400 mt-0.5">
                {items.length} serviço{items.length !== 1 ? 's' : ''} · {formatEur(dayTotal)}
                {dayHours > 0 && ` · ${dayHours}h`}
              </p>
            )}
            {transport.status === 'ok' && (
              <p className="text-xs text-gray-500 mt-0.5">
                🚗 Transporte do dia:{' '}
                {[
                  toggles.uses_rental_car && 'diária do carro',
                  toggles.uses_driver && `${transport.hours}h motorista`,
                ].filter(Boolean).join(' + ')}
                {' · '}{formatEur(chargeableEur)}
                {embeddedEur > 0 && (
                  <span className="text-gray-400"> (+{formatEur(embeddedEur)} embutido no honorário)</span>
                )}
              </p>
            )}
            {transport.status === 'no-rates' && (
              <p className="text-xs text-amber-600 font-medium mt-1">
                ⚠️ Sem faixa de transporte para {pax} pessoas — defina os valores no bloco Transporte acima.
              </p>
            )}
            {items.length > 0 && (
              <div className="flex items-center gap-4 mt-1.5">
                <label className="flex items-center gap-1.5 cursor-pointer select-none text-xs text-gray-600">
                  <input
                    type="checkbox"
                    checked={toggles.uses_driver}
                    onChange={e => onChangeToggles({ uses_driver: e.target.checked })}
                    className="rounded"
                  />
                  Usa motorista
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer select-none text-xs text-gray-600">
                  <input
                    type="checkbox"
                    checked={toggles.uses_rental_car}
                    onChange={e => onChangeToggles({ uses_rental_car: e.target.checked })}
                    className="rounded"
                  />
                  Carro alugado
                </label>
              </div>
            )}
            {overloaded && (
              <p className="text-xs text-amber-600 font-medium mt-1">
                ⚠️ Mais de {maxHoursPerDay}h neste dia — verifique o programa.
              </p>
            )}
          </div>
          <div className="flex items-center gap-2 ml-4 shrink-0">
            <div className="flex items-center gap-1">
              <input
                type="time"
                value={startTime}
                onChange={e => e.target.value && onChangeStartTime(e.target.value)}
                title="Início do dia"
                className="px-2 py-1 border border-gray-300 rounded-md text-xs bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              <span className="text-xs text-gray-400">–</span>
              <input
                type="time"
                value={endTime}
                onChange={e => e.target.value && onChangeEndTime(e.target.value)}
                title="Fim do dia"
                className="px-2 py-1 border border-gray-300 rounded-md text-xs bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={onRemoveDay}
              title="Remover dia"
              className="p-1.5 text-gray-300 hover:text-red-500 transition-colors rounded"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
        <button
          onClick={() => setPickerFor('end')}
          className="mt-2 w-full px-3 py-1.5 text-xs font-semibold bg-white border border-dashed border-gray-300 text-gray-500 rounded-lg hover:bg-green-50 hover:border-green-400 hover:text-green-700 transition-colors"
        >
          + Adicionar serviço
        </button>
      </div>

      <div className="p-4">
        <DayScheduleGrid
          segments={segments}
          startTime={startTime}
          endTime={endTime}
          items={items}
          pax={pax}
          exchangeRate={exchangeRate}
          guideRate={guideRate}
          onUpdateItem={onUpdateItem}
          onRemoveItem={onRemoveItem}
          onMoveItem={onMoveItem}
          onRequestAdd={setPickerFor}
          onDropItem={(draggedId, targetItemId) => onDropItem(draggedId, day, targetItemId)}
        />
      </div>

      {pickerFor && (
        <ServicePickerModal
          services={services}
          onAdd={s => onAddItem(day, s, pickerFor)}
          onClose={() => setPickerFor(null)}
        />
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function NovaPropostaForm({
  services,
  transportTypes,
  defaultGuideRate,
  defaultExchangeRate,
  maxHoursPerDay,
  initialData,
  proposalId,
  initialLead,
}: {
  services: ProposalService[];
  transportTypes: ProposalTransportType[];
  defaultGuideRate: number;
  defaultExchangeRate: number;
  maxHoursPerDay: number;
  initialData?: Proposal;
  proposalId?: string;
  initialLead?: InitialLead;
}) {
  const router = useRouter();
  const isEditing = !!proposalId;

  // Faixas de veículo (carro + motorista) do tipo de transporte "por faixas".
  const vehicleTiers = useMemo(() => {
    const tierType = transportTypes.find(
      t => !t.is_manual && !t.is_included && t.slug !== 'a-pe' && t.tiers.length > 0,
    );
    return tierType ? [...tierType.tiers].sort((a, b) => a.min_pax - b.min_pax) : [];
  }, [transportTypes]);

  // Toggles por dia vêm congelados na linha 'day_transport' de cada dia;
  // propostas antigas sem os campos contam como ambos ligados.
  const initialToggles: Record<string, DayToggles> = {};
  for (const item of initialData?.items ?? []) {
    if (item.kind === 'day_transport') {
      initialToggles[item.day] = {
        uses_driver: item.uses_driver ?? true,
        uses_rental_car: item.uses_rental_car ?? true,
      };
    }
  }

  // Tarifas de transporte e flags "embutido no honorário" congeladas na
  // proposta salva (qualquer linha day_transport carrega os mesmos valores).
  const savedTransport = (initialData?.items ?? []).find(i => i.kind === 'day_transport');

  // Linhas sintéticas de transporte do dia são recalculadas no submit,
  // então ficam de fora da edição.
  const initialItems: EditableItem[] = (initialData?.items ?? [])
    .filter(item => item.kind !== 'day_transport')
    .map(item => {
      const service = services.find(s => s.slug === item.service_slug);
      return {
        _id: Math.random().toString(36).slice(2),
        day: item.day,
        service_slug: item.service_slug,
        service_name: item.service_name,
        // Propostas antigas sem o snapshot pegam a descrição atual do serviço.
        service_description: item.service_description ?? service?.description ?? null,
        duration_hours: item.duration_hours,
        transfer_hours_to: item.transfer_hours_to,
        transfer_hours_back: item.transfer_hours_back,
        costs: item.costs.map(c => ({
          description: c.description,
          base_price: c.base_price,
          currency: c.currency,
          price_type: c.price_type,
          included: c.included ?? true,
        })),
        uses_vehicle: item.uses_vehicle ?? (service ? serviceUsesVehicle(service) : false),
        note: item.note,
      };
    });

  const [clientName, setClientName] = useState(initialData?.client_name ?? initialLead?.name ?? '');
  const [internalLabel, setInternalLabel] = useState(initialData?.internal_label ?? '');
  const [clientEmail, setClientEmail] = useState(initialData?.client_email ?? initialLead?.email ?? '');
  const [clientPhone, setClientPhone] = useState(initialData?.client_phone ?? initialLead?.phone ?? '');
  const [pax, setPax] = useState(initialData?.pax ?? initialLead?.pax ?? 2);
  const [treatment, setTreatment] = useState<ProposalTreatment>(initialData?.treatment ?? 'du-ihr');
  const [exchangeRate, setExchangeRate] = useState(initialData?.exchange_rate ?? defaultExchangeRate);
  // Hourly guide rate: /admin/configuracoes provides the default, but each
  // proposal can override it; existing proposals keep the rate they were
  // priced with.
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
  const [dayStartTimes, setDayStartTimes] = useState<Record<string, string>>({});
  const [dayEndTimes, setDayEndTimes] = useState<Record<string, string>>({});
  // Dias sem entrada usam o default (ambos ligados) — cenário atual do Will.
  const [dayToggles, setDayToggles] = useState<Record<string, DayToggles>>(initialToggles);
  // Tarifas de transporte da proposta: null = segue a faixa por pax.
  const [carRateOverride, setCarRateOverride] = useState<number | null>(
    savedTransport?.car_daily_rate ?? null,
  );
  const [driverRateOverride, setDriverRateOverride] = useState<number | null>(
    savedTransport?.driver_price_per_hour ?? null,
  );
  // Embutir no honorário (por recurso): o custo existe, mas não soma no
  // total do cliente — está coberto pelo honorário do Will.
  const [embedCar, setEmbedCar] = useState<boolean>(savedTransport?.car_cost_included ?? false);
  const [embedDriver, setEmbedDriver] = useState<boolean>(savedTransport?.driver_cost_included ?? false);
  // O que o cliente vê de preços: só o total final (padrão) ou por dia.
  const [priceDisplay, setPriceDisplay] = useState<ProposalPriceDisplay>(
    initialData?.price_display ?? 'total',
  );
  // Anzahlung (sinal em EUR); null = proposta sem bloco de sinal.
  const [depositAmount, setDepositAmount] = useState<number | null>(
    initialData?.deposit_amount ?? null,
  );
  // "Angebot gültig bis": default +14 dias em proposta nova; vazio = sem prazo.
  const [validUntil, setValidUntil] = useState<string>(
    initialData
      ? (initialData.valid_until ?? '')
      : new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10),
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<1 | 2>(1);
  // Na edição a proposta vira página única (sem wizard): dados e itinerário
  // juntos, com salvamento explícito — muda-se uma coisa e salva, sem ter que
  // atravessar passos (evita "Continuar" ser confundido com salvar).
  const singlePage = isEditing;

  // Só na edição: rastreia se algo mudou desde que a proposta foi carregada,
  // pra habilitar o botão de salvar e avisar sobre saída com mudanças pendentes.
  const [dirty, setDirty] = useState(false);

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

  // Guarda de saída: avisa o browser se houver mudanças não salvas na edição.
  useEffect(() => {
    if (!dirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [dirty]);

  // Snapshot serializado de tudo que é editável. Comparando com o valor do
  // primeiro render, marca "dirty" assim que qualquer campo muda — mais
  // confiável que espalhar setDirty por dezenas de onChange/handlers.
  const formSnapshot = useMemo(
    () => JSON.stringify({
      clientName, internalLabel, clientEmail, clientPhone, pax, treatment,
      exchangeRate, guideRate, internalNotes, items, activeDays, dayStartTimes,
      dayEndTimes, dayToggles, carRateOverride, driverRateOverride, embedCar,
      embedDriver, priceDisplay, depositAmount, validUntil,
    }),
    [clientName, internalLabel, clientEmail, clientPhone, pax, treatment,
     exchangeRate, guideRate, internalNotes, items, activeDays, dayStartTimes,
     dayEndTimes, dayToggles, carRateOverride, driverRateOverride, embedCar,
     embedDriver, priceDisplay, depositAmount, validUntil],
  );
  const pristineSnapshot = useMemo(() => formSnapshot, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (isEditing) setDirty(formSnapshot !== pristineSnapshot);
  }, [formSnapshot, pristineSnapshot, isEditing]);

  const summaryItems = useMemo(
    () => activeDays.flatMap(day => items.filter(i => i.day === day)),
    [activeDays, items],
  );

  const transportTier = useMemo(
    () => vehicleTiers.find(t => pax >= t.min_pax && (t.max_pax === null || pax <= t.max_pax)) ?? null,
    [vehicleTiers, pax],
  );

  // Faixa por pax como default, override da proposta por cima.
  const transportRates: TransportRates = useMemo(() => ({
    carRate: carRateOverride ?? transportTier?.car_daily_rate ?? null,
    driverRate: driverRateOverride ?? transportTier?.driver_price_per_hour ?? null,
    currency: transportTier?.currency ?? 'BRL',
    tierLabel: transportTier ? `${transportTier.min_pax}–${transportTier.max_pax ?? '∞'} pax` : null,
  }), [carRateOverride, driverRateOverride, transportTier]);

  const getDayToggles = useCallback(
    (day: string): DayToggles => dayToggles[day] ?? DEFAULT_DAY_TOGGLES,
    [dayToggles],
  );

  const handleChangeToggles = useCallback((day: string, patch: Partial<DayToggles>) => {
    setDayToggles(prev => ({
      ...prev,
      [day]: { ...(prev[day] ?? DEFAULT_DAY_TOGGLES), ...patch },
    }));
  }, []);

  const embedFlags: EmbedFlags = useMemo(
    () => ({ car: embedCar, driver: embedDriver }),
    [embedCar, embedDriver],
  );

  const grandTotal = useMemo(
    () => activeDays.reduce((total, day) => {
      const dayItems = items.filter(i => i.day === day);
      const itemsTotal = calcDayItemTotals(dayItems, pax, exchangeRate, guideRate).reduce((s, v) => s + v, 0);
      const transport = calcDayTransport(dayItems, transportRates, exchangeRate, getDayToggles(day));
      return total + itemsTotal + splitTransportCost(transport, embedFlags).chargeableEur;
    }, 0),
    [activeDays, items, pax, exchangeRate, guideRate, transportRates, getDayToggles, embedFlags],
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
    setDayToggles(prev => {
      const { [date]: _removed, ...rest } = prev;
      return rest;
    });
  }, []);

  // ─── Item handlers ────────────────────────────────────────────────────────────

  const handleAddItem = useCallback((day: string, service: ProposalService, position: InsertPosition = 'end') => {
    const newItem: EditableItem = {
      _id: Math.random().toString(36).slice(2),
      day,
      service_slug: service.slug,
      service_name: service.name,
      service_description: service.description,
      duration_hours: service.duration_hours,
      transfer_hours_to: service.transfer_hours_to,
      transfer_hours_back: service.transfer_hours_back,
      costs: (service.costs ?? []).map(c => ({
        description: c.description,
        base_price: c.base_price,
        currency: c.currency,
        price_type: c.price_type,
        included: c.include_in_price ?? true,
      })),
      uses_vehicle: serviceUsesVehicle(service),
      note: '',
    };
    setItems(prev => {
      if (position === 'start') {
        const idx = prev.findIndex(i => i.day === day);
        if (idx >= 0) {
          const next = [...prev];
          next.splice(idx, 0, newItem);
          return next;
        }
      } else if (typeof position === 'object') {
        const anchorId = 'after' in position ? position.after : position.before;
        const idx = prev.findIndex(i => i._id === anchorId);
        if (idx >= 0) {
          const next = [...prev];
          next.splice('after' in position ? idx + 1 : idx, 0, newItem);
          return next;
        }
      }
      return [...prev, newItem];
    });
  }, []);

  // Drag & drop: moves an item before the target item (same or another day),
  // or to the end of a day when dropped on empty grid space.
  const handleDropItem = useCallback((draggedId: string, targetDay: string, targetItemId?: string) => {
    setItems(prev => {
      const dragged = prev.find(i => i._id === draggedId);
      if (!dragged || draggedId === targetItemId) return prev;
      const without = prev.filter(i => i._id !== draggedId);
      const moved = { ...dragged, day: targetDay };
      if (targetItemId) {
        const idx = without.findIndex(i => i._id === targetItemId);
        if (idx >= 0) {
          const next = [...without];
          next.splice(idx, 0, moved);
          return next;
        }
      }
      return [...without, moved];
    });
  }, []);

  const handleUpdateItem = useCallback((id: string, updates: Partial<EditableItem>) => {
    setItems(prev => prev.map(i => (i._id === id ? { ...i, ...updates } : i)));
  }, []);

  const handleRemoveItem = useCallback((id: string) => {
    setItems(prev => prev.filter(i => i._id !== id));
  }, []);

  // Swaps an item with its neighbour within the same day (global array order
  // defines the order inside each day).
  const handleMoveItem = useCallback((id: string, direction: -1 | 1) => {
    setItems(prev => {
      const idx = prev.findIndex(i => i._id === id);
      if (idx < 0) return prev;
      const day = prev[idx].day;
      const dayIndexes = prev
        .map((it, j) => (it.day === day ? j : -1))
        .filter(j => j >= 0);
      const pos = dayIndexes.indexOf(idx);
      const swapWith = dayIndexes[pos + direction];
      if (swapWith === undefined) return prev;
      const next = [...prev];
      [next[idx], next[swapWith]] = [next[swapWith], next[idx]];
      return next;
    });
  }, []);

  const handleChangeStartTime = useCallback((day: string, t: string) => {
    setDayStartTimes(prev => ({ ...prev, [day]: t }));
  }, []);

  const handleChangeEndTime = useCallback((day: string, t: string) => {
    setDayEndTimes(prev => ({ ...prev, [day]: t }));
  }, []);

  // ─── Step navigation ──────────────────────────────────────────────────────────

  const handleGoToItinerary = () => {
    setError(null);
    if (!clientName.trim()) { setError('Nome é obrigatório.'); return; }
    if (pax < 1) { setError('Mínimo de 1 pessoa.'); return; }
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
    if (!clientName.trim()) { setError('Nome é obrigatório.'); return; }
    if (pax < 1) { setError('Mínimo de 1 pessoa.'); return; }
    if (summaryItems.length === 0) { setError('Adicione ao menos um serviço ao itinerário.'); return; }

    setSubmitting(true);
    try {
      const cleanItems = activeDays.flatMap(day => {
        const dayItems = summaryItems.filter(i => i.day === day);
        const dayTotals = calcDayItemTotals(dayItems, pax, exchangeRate, guideRate);

        const toggles = getDayToggles(day);
        const transport = calcDayTransport(dayItems, transportRates, exchangeRate, toggles);
        const { chargeableEur } = splitTransportCost(transport, embedFlags);

        const activityRows = dayItems.map((item, idx) => {
          const { _id: _skip, costs, ...rest } = item;
          return {
            ...rest,
            costs: costs.map(cost => ({
              ...cost,
              total_eur: calcCostEur(cost, pax, item.duration_hours ?? 0, exchangeRate),
            })),
            total_eur: dayTotals[idx],
          };
        });

        // Custo do dia (carro e/ou motorista, conforme os toggles) congelado no
        // jsonb como linha própria: entra no total_amount somado pelo servidor
        // sem ratear a diária entre as atividades. A linha é gravada mesmo com
        // custo zero para toggles e tarifas sobreviverem à edição. As linhas de
        // `costs` guardam o custo real (referência interna); partes embutidas
        // no honorário ficam de fora do total_eur da linha.
        const tierSuffix = transportRates.tierLabel ? ` (${transportRates.tierLabel})` : '';
        const costs = transport.status === 'ok'
          ? [
              ...(toggles.uses_rental_car ? [{
                description: `Diária do carro${tierSuffix}${embedCar ? ' — embutida no honorário' : ''}`,
                base_price: transportRates.carRate ?? 0,
                currency: transportRates.currency,
                price_type: 'fixed' as const,
                total_eur: transport.carCostEur,
              }] : []),
              ...(toggles.uses_driver ? [{
                description: `Motorista (${transport.hours}h de deslocamento)${embedDriver ? ' — embutido no honorário' : ''}`,
                base_price: transportRates.driverRate ?? 0,
                currency: transportRates.currency,
                price_type: 'per_hour' as const,
                total_eur: transport.driverCostEur,
              }] : []),
            ]
          : [];

        const serviceName =
          toggles.uses_driver && toggles.uses_rental_car ? 'Privattransport (Fahrzeug + Fahrer)'
          : toggles.uses_driver ? 'Privater Fahrer'
          : toggles.uses_rental_car ? 'Mietwagen'
          : 'Privattransport (deaktiviert)';

        const transportRow = {
          kind: 'day_transport' as const,
          day,
          service_slug: '__day_transport__',
          service_name: serviceName,
          duration_hours: null,
          transfer_hours_to: null,
          transfer_hours_back: null,
          costs,
          uses_vehicle: false,
          uses_driver: toggles.uses_driver,
          uses_rental_car: toggles.uses_rental_car,
          car_daily_rate: transportRates.carRate,
          driver_price_per_hour: transportRates.driverRate,
          transport_currency: transportRates.currency,
          car_cost_included: embedCar,
          driver_cost_included: embedDriver,
          total_eur: chargeableEur,
          transport_hours: transport.status === 'off' ? 0 : transport.hours,
          note: '',
        };
        return [...activityRows, transportRow];
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
          internal_label: internalLabel.trim() || null,
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
          price_display: priceDisplay,
          deposit_amount: depositAmount,
          valid_until: validUntil || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) { setError(data.error ?? 'Erro ao salvar.'); return; }

      setDirty(false); // salvo: libera a guarda de saída antes de navegar
      router.push(`/admin/propostas/${data.id}/output`);
    } catch {
      setError('Erro de rede. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="p-4 sm:p-6 md:p-10">
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
              {isEditing ? 'Editar Proposta' : 'Nova Proposta'}
            </h1>
          </div>
          {singlePage ? (
            <button
              onClick={handleSubmit}
              disabled={submitting || !dirty}
              className="px-5 py-2 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Salvando…' : dirty ? 'Salvar alterações' : 'Salvo'}
            </button>
          ) : step === 1 ? (
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
              {submitting ? 'Salvando…' : 'Gerar Proposta'}
            </button>
          )}
        </div>

        {/* Step indicator — só no wizard de criação */}
        {!singlePage && (
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
        )}

        {error && (
          <div className="p-3 rounded-lg text-sm bg-red-50 text-red-800 border border-red-200">
            {error}
          </div>
        )}

        {/* ── Step 1: Client data ── (na edição, sempre visível junto do resto) */}
        {(singlePage || step === 1) && (
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rótulo interno
                <span className="ml-1 text-xs font-normal text-gray-400">só você vê — ex.: Plano chuva</span>
              </label>
              <input type="text" value={internalLabel} onChange={e => setInternalLabel(e.target.value)} className={INPUT_CLS} placeholder="Plano chuva" />
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
                Honorário do guia (€/h)
                <span className="ml-1 text-xs font-normal text-gray-400">padrão: {defaultGuideRate}</span>
              </label>
              <input
                type="number"
                min="0"
                step="1"
                value={guideRate}
                onChange={e => {
                  const v = parseFloat(e.target.value);
                  setGuideRate(Number.isNaN(v) ? 0 : Math.max(0, v));
                }}
                className={INPUT_CLS}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Preços na proposta
                <span className="ml-1 text-xs font-normal text-gray-400">o que o cliente vê</span>
              </label>
              <select
                value={priceDisplay}
                onChange={e => setPriceDisplay(e.target.value as ProposalPriceDisplay)}
                className={INPUT_CLS}
              >
                <option value="total">Só o total final</option>
                <option value="per_day">Total por dia + final</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Anzahlung (€)
                <span className="ml-1 text-xs font-normal text-gray-400">vazio = sem sinal</span>
              </label>
              <input
                type="number"
                min="0"
                step="10"
                value={depositAmount ?? ''}
                onChange={e => {
                  const v = parseFloat(e.target.value);
                  setDepositAmount(Number.isNaN(v) || v <= 0 ? null : v);
                }}
                className={INPUT_CLS}
                placeholder="200"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Gültig bis
                <span className="ml-1 text-xs font-normal text-gray-400">vazio = sem prazo</span>
              </label>
              <input
                type="date"
                value={validUntil}
                onChange={e => setValidUntil(e.target.value)}
                className={INPUT_CLS}
              />
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

        {/* Step 1 footer — só no wizard de criação */}
        {!singlePage && (
        <div className="flex justify-end pb-10">
          <button
            onClick={handleGoToItinerary}
            className="px-6 py-3 bg-green-600 text-white text-sm font-semibold rounded-xl hover:bg-green-700 transition-colors"
          >
            Continuar para o itinerário →
          </button>
        </div>
        )}
        </>
        )}

        {/* ── Step 2: Itinerary ── (na edição, sempre visível junto do resto) */}
        {(singlePage || step === 2) && (
        <>
        {/* Client data recap — só no wizard; na página única os dados já estão acima */}
        {!singlePage && (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-600">
          <span className="font-semibold text-gray-800">{clientName}</span>
          {internalLabel.trim() && (
            <span className="px-1.5 py-0.5 text-[11px] font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded">
              {internalLabel.trim()}
            </span>
          )}
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
        )}

        {/* ── Transporte da proposta ── */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
            <h2 className="text-base font-bold text-gray-900">🚗 Transporte</h2>
            <span className="text-xs text-gray-400">
              {transportTier
                ? `padrão da faixa ${transportRates.tierLabel} — editável só nesta proposta`
                : `sem faixa para ${pax} pessoas — defina os valores manualmente`}
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Diária do carro ({transportRates.currency === 'EUR' ? '€' : 'R$'})
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={transportRates.carRate ?? ''}
                onChange={e => {
                  const v = parseFloat(e.target.value);
                  setCarRateOverride(Number.isNaN(v) ? null : Math.max(0, v));
                }}
                className={INPUT_CLS}
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Motorista ({transportRates.currency === 'EUR' ? '€' : 'R$'}/h)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={transportRates.driverRate ?? ''}
                onChange={e => {
                  const v = parseFloat(e.target.value);
                  setDriverRateOverride(Number.isNaN(v) ? null : Math.max(0, v));
                }}
                className={INPUT_CLS}
                placeholder="0"
              />
            </div>
          </div>
          {transportTier && (carRateOverride !== null || driverRateOverride !== null) && (
            <button
              onClick={() => { setCarRateOverride(null); setDriverRateOverride(null); }}
              className="mt-2 text-xs font-semibold text-green-700 hover:text-green-900 transition-colors"
            >
              ↺ Restaurar padrão da faixa ({transportTier.currency === 'EUR' ? '€' : 'R$'}
              {transportTier.car_daily_rate} diária + {transportTier.currency === 'EUR' ? '€' : 'R$'}
              {transportTier.driver_price_per_hour}/h motorista)
            </button>
          )}
          <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Embutir no honorário
              <span className="ml-2 font-normal normal-case text-gray-400">
                custo coberto pelo seu honorário — não soma no total do cliente
              </span>
            </p>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
              <label className="flex items-center gap-2 cursor-pointer select-none text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={embedCar}
                  onChange={e => setEmbedCar(e.target.checked)}
                  className="rounded"
                />
                Diária do carro
              </label>
              <label className="flex items-center gap-2 cursor-pointer select-none text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={embedDriver}
                  onChange={e => setEmbedDriver(e.target.checked)}
                  className="rounded"
                />
                Motorista
              </label>
            </div>
          </div>
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
                transportRates={transportRates}
                embed={embedFlags}
                maxHoursPerDay={maxHoursPerDay}
                startTime={dayStartTimes[day] ?? '08:00'}
                endTime={dayEndTimes[day] ?? '20:00'}
                toggles={getDayToggles(day)}
                onChangeToggles={patch => handleChangeToggles(day, patch)}
                onChangeStartTime={t => handleChangeStartTime(day, t)}
                onChangeEndTime={t => handleChangeEndTime(day, t)}
                onAddItem={handleAddItem}
                onUpdateItem={handleUpdateItem}
                onRemoveItem={handleRemoveItem}
                onMoveItem={handleMoveItem}
                onDropItem={handleDropItem}
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
                    Cancelar
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowDayPicker(true)}
                  className="px-4 py-2 text-sm font-semibold border border-dashed border-gray-300 text-gray-500 rounded-lg hover:bg-green-50 hover:border-green-400 hover:text-green-700 transition-colors w-full"
                >
                  + Adicionar dia
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
                const toggles = getDayToggles(day);
                const transport = calcDayTransport(dayItems, transportRates, exchangeRate, toggles);
                const { chargeableEur, embeddedEur } = splitTransportCost(transport, embedFlags);
                const dayTotals = calcDayItemTotals(dayItems, pax, exchangeRate, guideRate);
                const rows = dayItems.map((item, idx) => (
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
                if (transport.status === 'ok' && (chargeableEur > 0 || embeddedEur > 0)) {
                  const parts = [
                    toggles.uses_rental_car && 'diária',
                    toggles.uses_driver && `${transport.hours}h motorista`,
                  ].filter(Boolean).join(' + ');
                  rows.push(
                    <div key={`${day}-transport`} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-gray-400 text-xs shrink-0">
                          {formatGermanDay(day).split(',')[0]}
                        </span>
                        <span className="text-gray-500 truncate">
                          🚗 Transporte ({parts})
                          {embeddedEur > 0 && (
                            <span className="text-gray-400"> · {formatEur(embeddedEur)} embutido</span>
                          )}
                        </span>
                      </div>
                      <span className="tabular-nums text-gray-700 font-medium ml-4 shrink-0">
                        {formatEur(chargeableEur)}
                      </span>
                    </div>,
                  );
                }
                return rows;
              })}
            </div>
            <div className="mt-4 pt-4 border-t-2 border-gray-200 flex items-center justify-between">
              <span className="font-semibold text-gray-600">Valor total</span>
              <span className="text-2xl font-bold text-green-600 tabular-nums">
                {formatEur(grandTotal)}
              </span>
            </div>
          </div>
        )}

        {/* Step 2 footer — só no wizard; na edição o salvar fica na barra fixa */}
        {!singlePage && (
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
            {submitting ? 'Salvando…' : 'Gerar Proposta →'}
          </button>
        </div>
        )}
        </>
        )}

        {/* Espaço pra barra fixa não cobrir o final do conteúdo na edição */}
        {singlePage && <div className="h-20" />}

      </div>

      {/* Barra fixa de salvar (só na edição): sempre acessível, sem passos */}
      {singlePage && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur border-t border-gray-200">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 md:px-10 py-3 flex items-center justify-between gap-4">
            <span className={`text-sm ${dirty ? 'text-amber-600 font-medium' : 'text-gray-400'}`}>
              {dirty ? '● Alterações não salvas' : 'Tudo salvo'}
            </span>
            <button
              onClick={handleSubmit}
              disabled={submitting || !dirty}
              className="px-6 py-2.5 bg-green-600 text-white text-sm font-semibold rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Salvando…' : 'Salvar alterações'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

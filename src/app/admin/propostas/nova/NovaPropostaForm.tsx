'use client';

import { Fragment, useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { ADMIN_LOCALE, fmtEur, fmtLanguage } from '@/lib/adminFormat';
import { dayTransportServiceName, resolveDayTransportKey } from '@/lib/dayTransportLabel';
import type {
  Proposal,
  ProposalCurrency,
  ProposalPriceDisplay,
  ProposalService,
  ProposalServiceGroup,
  ProposalTransportType,
  ProposalTreatment,
} from '@/lib/proposals';

// ─── Types ────────────────────────────────────────────────────────────────────

// Moedas oferecidas no select. Lista local (e não importada de @/lib/proposals)
// porque aquele módulo importa o client Supabase de servidor: um import de
// VALOR daqui arrastaria código de servidor para o bundle do browser. O tipo
// ProposalCurrency mantém as duas listas em sincronia — acrescentar uma moeda
// lá sem acrescentar aqui não é erro de tipo, mas remover uma é.
const CURRENCY_OPTIONS: ProposalCurrency[] = ['EUR', 'BRL'];

// Slug sintético das atrações coringa (atividades montadas dentro da proposta,
// que não existem no catálogo). Literal também em src/lib/proposals.ts, pelo
// mesmo motivo da lista de moedas: importar valor de lá arrastaria o client
// Supabase de servidor para o bundle do browser.
const CUSTOM_SLUG = '__custom__';

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
  // Atração coringa: montada direto na proposta, sem serviço no catálogo. O
  // texto foi digitado aqui, no idioma da proposta, então não é re-resolvido
  // no envio nem invalidado ao trocar o idioma.
  is_custom: boolean;
  // Só em coringa: tipo de transporte escolhido, guardado para o modal
  // reexibir a escolha; o efeito no preço já está em uses_vehicle.
  transport_type_slug: string | null;
  // Preço manual do tour (EUR), por cima do calculado; null = segue o cálculo.
  price_override_eur: number | null;
  note: string;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

// Cabeçalho de dia do itinerário — UI do admin, portanto pt-BR. O texto que o
// cliente recebe (WhatsApp/PDF) é gerado em PropostaOutputClient, em alemão.
function formatDayHeader(iso: string): string {
  return new Date(iso + 'T12:00:00').toLocaleDateString(ADMIN_LOCALE, {
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

// Um tipo de transporte "por faixas" (carro + motorista terceirizados) é o
// que faz as horas de deslocamento entrarem no custo do dia; a pé, transporte
// manual ou já incluído, não.
function transportUsesVehicle(t: ProposalTransportType | null | undefined): boolean {
  return !!t && !t.is_manual && !t.is_included && t.slug !== 'a-pe' && t.tiers.length > 0;
}

function serviceUsesVehicle(service: ProposalService): boolean {
  return transportUsesVehicle(service.transport_type);
}

// Horas decimais ↔ "HH:MM" do <input type="time"> — mesmo par usado no
// cadastro de atividades, para os dois formulários lerem igual.
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

// Insere o item no ponto pedido do dia: no começo, no fim, ou antes/depois de
// uma atividade âncora. A ordem do array global define a ordem dentro do dia.
function insertItem(
  prev: EditableItem[],
  newItem: EditableItem,
  position: InsertPosition,
): EditableItem[] {
  if (position === 'start') {
    const idx = prev.findIndex(i => i.day === newItem.day);
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
}

function randomId(): string {
  return Math.random().toString(36).slice(2);
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

// Preço manual por tour: substitui o valor calculado daquele item; os demais
// itens do dia mantêm sua fatia do honorário normalmente.
function applyPriceOverrides(dayItems: EditableItem[], calculated: number[]): number[] {
  return calculated.map((v, idx) => dayItems[idx].price_override_eur ?? v);
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

function formatCostPrice(cost: EditableItem['costs'][0]): string {
  const sym = cost.currency === 'EUR' ? '€' : 'R$';
  const val = cost.base_price % 1 === 0
    ? cost.base_price.toFixed(0)
    : cost.base_price.toFixed(2).replace('.', ',');
  const suffix = cost.price_type === 'per_pax' ? ' / pessoa'
    : cost.price_type === 'per_hour' ? ' / h'
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

// Horas decimais → "6h50" (o somatório de um grupo raramente é redondo).
function formatGroupHours(hours: number): string {
  const totalMin = Math.round(hours * 60);
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  if (h === 0) return `${m}min`;
  return m === 0 ? `${h}h` : `${h}h${String(m).padStart(2, '0')}`;
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

// Passo de 15min do ajuste de duração no itinerário. Valores fora da grade
// (ex.: 1.334h vindos do catálogo) primeiro encaixam no quarto de hora na
// direção do clique, para o stepper não perpetuar quebrados.
function stepQuarterHour(hours: number, dir: 1 | -1): number {
  const snapped = dir === 1 ? Math.floor(hours * 4) / 4 : Math.ceil(hours * 4) / 4;
  return Math.max(0, snapped + dir * 0.25);
}

// Janela padrão de um dia quando a proposta não traz horário salvo (proposta
// nova, ou antiga de antes de o horário ser persistido).
const DEFAULT_DAY_START = '08:00';
const DEFAULT_DAY_END = '20:00';

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

// Rótulos vêm de admin.atividades.categoriasPlural.
const CATEGORIES = [
  { key: 'tour' as const,      icon: '🗺️' },
  { key: 'transfer' as const,  icon: '🚗' },
  { key: 'extra' as const,     icon: '⭐' },
  { key: 'atração' as const,   icon: '🏛️' },
];

// ─── FallbackBadge ────────────────────────────────────────────────────────────

// Dica discreta para o admin: o texto deste serviço não existe no idioma da
// proposta e veio de outro (ver a cascata em src/lib/services-i18n.ts). Não é
// erro — só sinaliza que falta traduzir em /admin/propostas/atividades.
function FallbackBadge({ service }: { service: ProposalService }) {
  const t = useTranslations('admin.propostas');
  if (!service.is_fallback || !service.resolved_locale) return null;
  return (
    <span
      title={t('traducaoFallbackTitulo')}
      className="ml-1.5 align-middle px-1 py-px rounded bg-gray-100 text-gray-400 text-[10px] font-medium tracking-wide"
    >
      {t('traducaoFallback', { idioma: service.resolved_locale })}
    </span>
  );
}

// ─── CustomActivityModal (atração coringa) ────────────────────────────────────

// Atração coringa: atividade montada dentro da proposta, sem passar pelo
// catálogo de /admin/propostas/atividades. É para o passeio pontual e
// exclusivo daquele grupo — o que se repete continua valendo cadastrar, para
// ganhar tradução, grupo e reuso.
//
// Os campos são os mesmos do catálogo porque o preço é calculado igual: as
// horas entram no honorário do guia do dia e as linhas de custo somam por
// cima. A diferença é o alcance: nada disto sai da proposta.

type CustomCostDraft = {
  _id: string;
  description: string;
  // String (e não number) enquanto está no formulário: campo vazio é um
  // estado válido de digitação, e 0 não é a mesma coisa que "ainda não sei".
  base_price: string;
  currency: 'EUR' | 'BRL';
  price_type: 'fixed' | 'per_pax' | 'per_hour';
  included: boolean;
};

type CustomActivityDraft = {
  name: string;
  description: string;
  // "HH:MM" — o formulário fala em relógio, o item guarda horas decimais.
  duration_hours: string;
  transfer_hours_to: string;
  transfer_hours_back: string;
  transport_type_id: string;
  costs: CustomCostDraft[];
};

// O que o modal define no item; o resto (dia, slug, nota, preço manual) é do
// item do itinerário, não do formulário.
type CustomItemFields = Pick<
  EditableItem,
  | 'service_name'
  | 'service_description'
  | 'duration_hours'
  | 'transfer_hours_to'
  | 'transfer_hours_back'
  | 'costs'
  | 'uses_vehicle'
  | 'transport_type_slug'
>;

function emptyCustomDraft(): CustomActivityDraft {
  return {
    name: '',
    description: '',
    duration_hours: '',
    transfer_hours_to: '',
    transfer_hours_back: '',
    transport_type_id: '',
    costs: [],
  };
}

function itemToCustomDraft(
  item: EditableItem,
  transportTypes: ProposalTransportType[],
): CustomActivityDraft {
  const transport = item.transport_type_slug
    ? transportTypes.find(t => t.slug === item.transport_type_slug)
    : undefined;
  return {
    name: item.service_name,
    description: item.service_description ?? '',
    duration_hours: hoursToTime(item.duration_hours),
    transfer_hours_to: hoursToTime(item.transfer_hours_to),
    transfer_hours_back: hoursToTime(item.transfer_hours_back),
    transport_type_id: transport?.id ?? '',
    costs: (item.costs ?? []).map(c => ({
      _id: randomId(),
      description: c.description,
      base_price: String(c.base_price),
      currency: c.currency,
      price_type: c.price_type,
      included: c.included,
    })),
  };
}

function customDraftToFields(
  draft: CustomActivityDraft,
  transportTypes: ProposalTransportType[],
): CustomItemFields {
  const transport = transportTypes.find(t => t.id === draft.transport_type_id);
  return {
    service_name: draft.name.trim(),
    service_description: draft.description.trim() || null,
    duration_hours: timeToHours(draft.duration_hours),
    transfer_hours_to: timeToHours(draft.transfer_hours_to),
    transfer_hours_back: timeToHours(draft.transfer_hours_back),
    // Linha em branco (sem descrição e sem valor) é resto de digitação, não
    // custo: some no salvamento em vez de virar "€0" na proposta.
    costs: draft.costs
      .filter(c => c.description.trim() !== '' || parseFloat(c.base_price) > 0)
      .map(c => ({
        description: c.description.trim(),
        base_price: parseFloat(c.base_price) || 0,
        currency: c.currency,
        price_type: c.price_type,
        included: c.included,
      })),
    uses_vehicle: transportUsesVehicle(transport),
    transport_type_slug: transport?.slug ?? null,
  };
}

function CustomActivityModal({
  initial,
  isEditing,
  transportTypes,
  onCancel,
  onSave,
}: {
  initial: CustomActivityDraft;
  isEditing: boolean;
  transportTypes: ProposalTransportType[];
  onCancel: () => void;
  onSave: (draft: CustomActivityDraft) => void;
}) {
  const t = useTranslations('admin.propostas');
  const tAtv = useTranslations('admin.atividades');
  const tCommon = useTranslations('admin.common');
  const [draft, setDraft] = useState<CustomActivityDraft>(initial);
  const [error, setError] = useState<string | null>(null);

  const set = <K extends keyof CustomActivityDraft>(key: K) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setDraft(d => ({ ...d, [key]: e.target.value }));

  const updateCost = (id: string, patch: Partial<CustomCostDraft>) =>
    setDraft(d => ({
      ...d,
      costs: d.costs.map(c => (c._id === id ? { ...c, ...patch } : c)),
    }));

  const addCost = () =>
    setDraft(d => ({
      ...d,
      costs: [
        ...d.costs,
        {
          _id: randomId(),
          description: '',
          base_price: '',
          currency: 'BRL',
          price_type: 'per_pax',
          included: true,
        },
      ],
    }));

  const removeCost = (id: string) =>
    setDraft(d => ({ ...d, costs: d.costs.filter(c => c._id !== id) }));

  const totalHours =
    (timeToHours(draft.transfer_hours_to) ?? 0)
    + (timeToHours(draft.duration_hours) ?? 0)
    + (timeToHours(draft.transfer_hours_back) ?? 0);

  const usesVehicle = transportUsesVehicle(
    transportTypes.find(tt => tt.id === draft.transport_type_id),
  );

  const handleSave = () => {
    if (!draft.name.trim()) { setError(tCommon('nomeObrigatorio')); return; }
    onSave(draft);
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col"
        onKeyDown={e => { if (e.key === 'Escape') onCancel(); }}
      >
        <div className="flex items-start justify-between px-6 pt-6 pb-4 border-b border-gray-100 shrink-0">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              {isEditing ? t('coringaEditarTitulo') : t('coringaTitulo')}
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">{t('coringaSubtitulo')}</p>
          </div>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600 text-xl leading-none">✕</button>
        </div>

        <div className="overflow-y-auto px-6 py-5 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {tCommon('nome')} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={draft.name}
              onChange={set('name')}
              autoFocus
              placeholder={t('coringaNomePlaceholder')}
              className={INPUT_CLS}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {tAtv('descricaoCurta')}{' '}
              <span className="text-xs font-normal text-gray-400">{tCommon('opcional')}</span>
            </label>
            <textarea
              value={draft.description}
              onChange={set('description')}
              rows={2}
              placeholder={t('coringaDescricaoPlaceholder')}
              className={`${INPUT_CLS} resize-none`}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{tAtv('tipoTransporte')}</label>
            <select value={draft.transport_type_id} onChange={set('transport_type_id')} className={INPUT_CLS}>
              <option value="">{tAtv('nenhumNaoDefinido')}</option>
              {transportTypes.map(tt => (
                <option key={tt.id} value={tt.id}>{tt.name}</option>
              ))}
            </select>
            {usesVehicle && (
              <p className="mt-1 text-xs text-blue-600">{t('coringaTransporteVeiculo')}</p>
            )}
          </div>

          <div>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">{tAtv('tempo')}</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{tAtv('duracao')}</label>
                <input type="time" value={draft.duration_hours} onChange={set('duration_hours')} className={INPUT_CLS} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{tAtv('ida')}</label>
                <input type="time" value={draft.transfer_hours_to} onChange={set('transfer_hours_to')} className={INPUT_CLS} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{tAtv('volta')}</label>
                <input type="time" value={draft.transfer_hours_back} onChange={set('transfer_hours_back')} className={INPUT_CLS} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{tAtv('totalEstimado')}</label>
                <div className={`${INPUT_CLS} bg-gray-50 text-gray-700 font-semibold pointer-events-none`}>
                  {totalHours > 0 ? formatGroupHours(totalHours) : tCommon('vazio')}
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{tAtv('itensCusto')}</h3>
              <button
                onClick={addCost}
                className="text-xs font-semibold text-green-600 hover:text-green-800 transition-colors"
              >
                {tAtv('adicionarCusto')}
              </button>
            </div>
            {draft.costs.length === 0 ? (
              <p className="text-sm text-gray-400 italic">{tAtv('semCustosAdicionais')}</p>
            ) : (
              <div className="space-y-2">
                <div className="grid grid-cols-[1fr_5.5rem_4.5rem_8rem_auto_2rem] gap-2">
                  <span className="text-xs text-gray-400">{tAtv('descricao')}</span>
                  <span className="text-xs text-gray-400">{tCommon('valor')}</span>
                  <span className="text-xs text-gray-400">{tAtv('moeda')}</span>
                  <span className="text-xs text-gray-400">{tAtv('tipo')}</span>
                  <span />
                  <span />
                </div>
                {draft.costs.map(cost => (
                  <div key={cost._id} className="grid grid-cols-[1fr_5.5rem_4.5rem_8rem_auto_2rem] gap-2 items-center">
                    <input
                      type="text"
                      value={cost.description}
                      onChange={e => updateCost(cost._id, { description: e.target.value })}
                      placeholder={tAtv('guiaPlaceholder')}
                      className={INPUT_CLS}
                    />
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={cost.base_price}
                      onChange={e => updateCost(cost._id, { base_price: e.target.value })}
                      placeholder="0"
                      className={INPUT_CLS}
                    />
                    <select
                      value={cost.currency}
                      onChange={e => updateCost(cost._id, { currency: e.target.value as CustomCostDraft['currency'] })}
                      className="w-full px-2 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="EUR">EUR</option>
                      <option value="BRL">BRL</option>
                    </select>
                    <select
                      value={cost.price_type}
                      onChange={e => updateCost(cost._id, { price_type: e.target.value as CustomCostDraft['price_type'] })}
                      className="w-full px-2 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="fixed">{tAtv('tiposPreco.fixed')}</option>
                      <option value="per_pax">{tAtv('tiposPreco.per_pax')}</option>
                      <option value="per_hour">{tAtv('tiposPreco.per_hour')}</option>
                    </select>
                    <label
                      className="flex items-center gap-1 cursor-pointer select-none"
                      title={t('marcadoEntraPreco')}
                    >
                      <input
                        type="checkbox"
                        checked={cost.included}
                        onChange={e => updateCost(cost._id, { included: e.target.checked })}
                        className="rounded"
                      />
                      <span className="text-xs text-gray-500 whitespace-nowrap">{tAtv('cobrar')}</span>
                    </label>
                    <button
                      onClick={() => removeCost(cost._id)}
                      className="p-1.5 text-gray-300 hover:text-red-500 transition-colors rounded"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
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

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 shrink-0">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            {tCommon('cancelar')}
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 text-sm font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
          >
            {isEditing ? tCommon('salvar') : t('coringaAdicionar')}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── ServicePickerPanel ───────────────────────────────────────────────────────

// Minúsculas e sem acentos, para a busca tolerar "selaron" → "Selarón".
function normalizeSearch(s: string): string {
  return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
}

// Grupo do catálogo já resolvido contra o catálogo do idioma da proposta:
// membros inativos ou sem tradução ficam de fora, e grupo que ficou vazio nem
// chega ao picker.
type ResolvedServiceGroup = {
  id: string;
  name: string;
  services: ProposalService[];
};

// Seletor de atividades inline: expande dentro do card do dia (sem overlay),
// com busca, chips de categoria e adição múltipla — o painel permanece aberto
// entre uma adição e outra, e o item aparece na grade do dia na hora.
// Grupos aparecem no topo: um clique adiciona todas as atividades do grupo.
function ServicePickerPanel({
  services,
  groups,
  open,
  onAdd,
  onAddGroup,
  onAddCustom,
  onClose,
}: {
  services: ProposalService[];
  groups: ResolvedServiceGroup[];
  open: boolean;
  onAdd: (service: ProposalService) => void;
  onAddGroup: (services: ProposalService[]) => void;
  // Abre o modal da atração coringa na mesma posição de inserção do painel.
  onAddCustom: () => void;
  onClose: () => void;
}) {
  const t = useTranslations('admin.propostas');
  const tCat = useTranslations('admin.atividades.categoriasPlural');
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<'all' | (typeof CATEGORIES)[number]['key']>('all');
  const [addedCount, setAddedCount] = useState(0);
  const [justAddedId, setJustAddedId] = useState<string | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  // Zera o contador a cada abertura (ajuste durante o render, sem effect).
  const [prevOpen, setPrevOpen] = useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) setAddedCount(0);
  }

  useEffect(() => {
    if (!open) return;
    // O "+" do meio do dia pode estar longe do painel — garante que ele
    // apareça na viewport ao abrir.
    panelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    // Autofoco só em telas largas: no celular abriria o teclado sobre a lista.
    if (window.matchMedia('(min-width: 640px)').matches) {
      searchRef.current?.focus({ preventScroll: true });
    }
  }, [open]);

  const q = normalizeSearch(query.trim());
  const visible = services.filter(
    s => (category === 'all' || s.category === category)
      && (!q || normalizeSearch(s.name).includes(q)),
  );
  // Grupos só na visão "todas": com um chip de categoria ativo, o admin está
  // garimpando atividade individual. A busca também acha pelo nome do grupo.
  const visibleGroups = category === 'all'
    ? groups.filter(g => !q || normalizeSearch(g.name).includes(q))
    : [];

  const handleAdd = (s: ProposalService) => {
    onAdd(s);
    setAddedCount(c => c + 1);
    setJustAddedId(s.id);
    window.setTimeout(() => setJustAddedId(prev => (prev === s.id ? null : prev)), 900);
  };

  const handleAddGroup = (g: ResolvedServiceGroup) => {
    onAddGroup(g.services);
    setAddedCount(c => c + g.services.length);
    setJustAddedId(g.id);
    window.setTimeout(() => setJustAddedId(prev => (prev === g.id ? null : prev)), 900);
  };

  const chipCls = (on: boolean) =>
    `shrink-0 px-3 py-1 rounded-full text-xs font-semibold border transition-colors ${
      on
        ? 'bg-green-600 border-green-600 text-white'
        : 'bg-white border-gray-200 text-gray-600 hover:border-green-300'
    }`;

  return (
    // `inert` quando fechado: o colapso via grid-rows deixa o conteúdo no DOM,
    // e sem isso Tab entraria em inputs invisíveis.
    <div
      inert={!open}
      className={`grid transition-[grid-template-rows] duration-300 ${open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
    >
      <div className="overflow-hidden">
        <div
          ref={panelRef}
          className="mt-2 bg-white border border-gray-200 rounded-lg"
          onKeyDown={e => { if (e.key === 'Escape') onClose(); }}
        >
          <div className="p-3 pb-0">
            <input
              ref={searchRef}
              type="search"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder={t('buscarAtividade')}
              className={INPUT_CLS}
            />
            <button
              onClick={onAddCustom}
              title={t('coringaHint')}
              className="mt-2 w-full px-3 py-2 rounded-lg border border-dashed border-gray-300 text-xs font-semibold text-gray-500 hover:bg-green-50 hover:border-green-400 hover:text-green-700 transition-colors"
            >
              {t('coringaBotao')}
            </button>
            <div className="flex gap-1.5 overflow-x-auto py-2.5">
              <button onClick={() => setCategory('all')} className={chipCls(category === 'all')}>
                {t('todasCategorias')}
              </button>
              {CATEGORIES.map(({ key, icon }) => (
                <button key={key} onClick={() => setCategory(key)} className={chipCls(category === key)}>
                  {icon} {tCat(key)}
                </button>
              ))}
            </div>
            <div className="max-h-64 overflow-y-auto grid sm:grid-cols-2 gap-x-2 content-start pb-2">
              {visibleGroups.length > 0 && (
                <>
                  {!q && (
                    <p className="col-span-full text-xs font-semibold text-gray-400 uppercase tracking-wide mt-2 mb-1 first:mt-0">
                      📦 {t('gruposSecao')}
                    </p>
                  )}
                  {visibleGroups.map(g => {
                    const hours = g.services.reduce(
                      (sum, s) => sum + (s.transfer_hours_to ?? 0) + (s.duration_hours ?? 0) + (s.transfer_hours_back ?? 0),
                      0,
                    );
                    return (
                      <button
                        key={g.id}
                        onClick={() => handleAddGroup(g)}
                        title={t('grupoAdicionaTodas')}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm text-left group transition-colors ${
                          justAddedId === g.id ? 'bg-green-100' : 'hover:bg-green-50'
                        }`}
                      >
                        <span className="font-medium text-gray-800 group-hover:text-green-800 truncate">
                          {g.name}
                        </span>
                        <span className="flex items-center gap-2 ml-3 shrink-0 text-xs text-gray-400">
                          <span>{t('grupoAtividadesCount', { count: g.services.length })}</span>
                          {hours > 0 && (
                            <>
                              <span className="text-gray-200">·</span>
                              <span className="tabular-nums">{formatGroupHours(hours)}</span>
                            </>
                          )}
                          <span
                            className={`w-5 h-5 flex items-center justify-center rounded-full text-sm font-bold ${
                              justAddedId === g.id ? 'bg-green-600 text-white' : 'bg-green-50 text-green-600'
                            }`}
                          >
                            {justAddedId === g.id ? '✓' : '+'}
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </>
              )}
              {CATEGORIES.map(({ key, icon }) => {
                const list = visible.filter(s => s.category === key);
                if (!list.length) return null;
                return (
                  <Fragment key={key}>
                    {category === 'all' && !q && (
                      <p className="col-span-full text-xs font-semibold text-gray-400 uppercase tracking-wide mt-2 mb-1 first:mt-0">
                        {icon} {tCat(key)}
                      </p>
                    )}
                    {list.map(s => (
                      <button
                        key={s.id}
                        onClick={() => handleAdd(s)}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm text-left group transition-colors ${
                          justAddedId === s.id ? 'bg-green-100' : 'hover:bg-green-50'
                        }`}
                      >
                        <span className="font-medium text-gray-800 group-hover:text-green-800 truncate">
                          {s.name}
                          <FallbackBadge service={s} />
                        </span>
                        <span className="flex items-center gap-2 ml-3 shrink-0 text-xs text-gray-400">
                          <span className="tabular-nums">{formatServiceHours(s)}</span>
                          <span className="text-gray-200">·</span>
                          <span>{formatCostSummary(s.costs)}</span>
                          <span
                            className={`w-5 h-5 flex items-center justify-center rounded-full text-sm font-bold ${
                              justAddedId === s.id ? 'bg-green-600 text-white' : 'bg-green-50 text-green-600'
                            }`}
                          >
                            {justAddedId === s.id ? '✓' : '+'}
                          </span>
                        </span>
                      </button>
                    ))}
                  </Fragment>
                );
              })}
              {services.length === 0 && (
                <p className="col-span-full text-sm text-gray-400 text-center py-6">{t('nenhumServicoDisponivel')}</p>
              )}
              {services.length > 0 && visible.length === 0 && (
                <p className="col-span-full text-sm text-gray-400 text-center py-6">{t('nenhumaAtividadeEncontrada')}</p>
              )}
            </div>
          </div>
          <div className="flex items-center justify-between border-t border-gray-100 px-3 py-2">
            {addedCount > 0 ? (
              <span className="text-xs font-medium text-green-700">
                {t('itensAdicionadosCount', { count: addedCount })}
              </span>
            ) : (
              <span className="text-xs text-gray-400">{t('cliqueParaAdicionar')}</span>
            )}
            <button
              onClick={onClose}
              className="px-3 py-1.5 text-xs font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {t('fecharPainel')}
            </button>
          </div>
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
  onEditCustom,
  getCatalogDuration,
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
  // Reabre o modal da atração coringa para editar um item já no dia.
  onEditCustom: (id: string) => void;
  // Duração cadastrada no catálogo (undefined = serviço não existe mais lá).
  getCatalogDuration: (slug: string) => number | null | undefined;
}) {
  const t = useTranslations('admin.propostas');
  const tCommon = useTranslations('admin.common');
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
                    title={t('inserirServicoAqui')}
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
              {item.is_custom && (
                <button
                  onClick={() => onEditCustom(item._id)}
                  title={t('coringaEditar')}
                  className="p-0.5 text-gray-300 hover:text-green-600 transition-colors rounded"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                  </svg>
                </button>
              )}
              <button
                onClick={() => onMoveItem(item._id, -1)}
                disabled={isFirst}
                title={t('moverMaisCedo')}
                className="p-0.5 text-gray-300 hover:text-green-600 transition-colors rounded disabled:opacity-30 disabled:hover:text-gray-300"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>
              </button>
              <button
                onClick={() => onMoveItem(item._id, 1)}
                disabled={isLast}
                title={t('moverMaisTarde')}
                className="p-0.5 text-gray-300 hover:text-green-600 transition-colors rounded disabled:opacity-30 disabled:hover:text-gray-300"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
              <button
                onClick={() => onRemoveItem(item._id)}
                title={t('removerServico')}
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
                    <p className="text-sm font-semibold text-gray-800">
                      {item.service_name}
                      {item.is_custom && (
                        <span className="ml-1.5 align-middle px-1 py-px rounded bg-amber-50 text-amber-600 text-[10px] font-medium tracking-wide">
                          {t('coringaBadge')}
                        </span>
                      )}
                    </p>
                    <p className="text-[11px] text-green-700 tabular-nums">
                      {minutesToLabel(seg.startMin)}–{minutesToLabel(seg.endMin)} · {formatHoursShort(seg.hours)}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {controls}
                    <button
                      onClick={() => setExpandedId(null)}
                      title={t('recolher')}
                      className="p-0.5 text-gray-400 hover:text-gray-700 transition-colors rounded"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </div>

                {(() => {
                  const catalog = getCatalogDuration(item.service_slug);
                  const current = item.duration_hours ?? 0;
                  const overridden = catalog !== undefined && (catalog ?? 0) !== current;
                  return (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">{t('duracao')}</span>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => onUpdateItem(item._id, { duration_hours: stepQuarterHour(current, -1) })}
                          disabled={current <= 0}
                          title={t('duracaoMenos15')}
                          className="w-5 h-5 flex items-center justify-center rounded-full border border-gray-300 text-gray-500 text-sm leading-none hover:border-green-400 hover:text-green-600 transition-colors disabled:opacity-30 disabled:hover:border-gray-300 disabled:hover:text-gray-500"
                        >
                          −
                        </button>
                        <span
                          title={overridden ? t('duracaoAjustada', { valor: formatHoursShort(catalog ?? 0) }) : undefined}
                          className={`tabular-nums font-medium min-w-[2.75rem] text-center ${overridden ? 'text-amber-600' : 'text-gray-700'}`}
                        >
                          {formatHoursShort(current)}
                        </span>
                        <button
                          onClick={() => onUpdateItem(item._id, { duration_hours: stepQuarterHour(current, 1) })}
                          title={t('duracaoMais15')}
                          className="w-5 h-5 flex items-center justify-center rounded-full border border-gray-300 text-gray-500 text-sm leading-none hover:border-green-400 hover:text-green-600 transition-colors"
                        >
                          +
                        </button>
                        {overridden && (
                          <button
                            onClick={() => onUpdateItem(item._id, { duration_hours: catalog })}
                            title={t('restaurarDuracao', { valor: formatHoursShort(catalog ?? 0) })}
                            className="ml-0.5 px-1.5 py-0.5 rounded text-[11px] font-medium text-amber-600 hover:bg-amber-50 transition-colors"
                          >
                            ↺ {formatHoursShort(catalog ?? 0)}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })()}

                <div className="space-y-1">
                  {guideHours > 0 && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">
                        {t('honorarioGuiaResumo')}
                        <span className="text-gray-400"> · {t('horasVezesTaxa', { horas: guideHours, taxa: guideRate })}</span>
                      </span>
                      <span className="tabular-nums text-gray-600 ml-4 shrink-0">{fmtEur(guideFee)}</span>
                    </div>
                  )}
                  {(item.costs ?? []).map((cost, cIdx) => {
                    const eur = calcCostEur(cost, pax, item.duration_hours ?? 0, exchangeRate);
                    return (
                      <div key={cIdx} className="flex items-center justify-between text-xs">
                        <label
                          className="flex items-center gap-1.5 cursor-pointer select-none text-gray-500"
                          title={t('marcadoEntraPreco')}
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
                              <span className="text-amber-600 font-medium"> {t('paxPagaNoLocal')}</span>
                            )}
                          </span>
                        </label>
                        <span className={`tabular-nums ml-4 shrink-0 ${cost.included ? 'text-gray-600' : 'text-gray-300 line-through'}`}>
                          {fmtEur(eur)}
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
                  placeholder={t('anotacaoTransfer')}
                />

                <div className="flex items-center justify-end gap-1.5 pt-1 border-t border-gray-200">
                  <span className="text-xs text-gray-400">{tCommon('total')}:</span>
                  <span className="text-sm font-semibold text-gray-700 tabular-nums">{fmtEur(totalEur)}</span>
                  {hasBrl && <span className="text-xs text-gray-400">{t('cambio', { taxa: exchangeRate })}</span>}
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
                title={t('cliqueDetalhes')}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-xs font-semibold text-green-900 leading-tight truncate">
                    {item.is_custom && <span title={t('coringaBadge')}>✨ </span>}
                    {item.service_name}
                  </p>
                  {controls}
                </div>
                <p className="text-[11px] text-green-700 tabular-nums truncate">
                  {minutesToLabel(seg.startMin)}–{minutesToLabel(seg.endMin)} · {formatHoursShort(seg.hours)} · {fmtEur(totalEur)}
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
              {t('fimDoDia', { hora: minutesToLabel(windowEndMin) })}
            </span>
          </div>
        )}

        {segments.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <p className="text-xs text-gray-300">{t('diaLivre')}</p>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between text-xs text-gray-400 pt-2 border-t border-gray-100">
        <span>
          {t('ocupado')}<span className="font-semibold text-gray-600 tabular-nums">{formatHoursShort(occupiedMin / 60)}</span>
          {segments.length > 0 && (
            <span className="tabular-nums">{t('ate', { hora: minutesToLabel(contentEndMin) })}</span>
          )}
        </span>
        {overflowMin > 0 ? (
          <span className="text-amber-600 font-medium">
            {t('passaFimDia', { tempo: formatHoursShort(overflowMin / 60) })}
          </span>
        ) : (
          <span>
            {t('livre')}<span className="font-semibold text-green-600 tabular-nums">{formatHoursShort(freeMin / 60)}</span>
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
  groups,
  transportTypes,
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
  onAddCustomItem,
  onUpdateItem,
  onRemoveItem,
  onMoveItem,
  onDropItem,
  onRemoveDay,
  onChangeDay,
  conflictDate,
}: {
  day: string;
  items: EditableItem[];
  services: ProposalService[];
  groups: ResolvedServiceGroup[];
  // Catálogo de tipos de transporte, para o modal da atração coringa.
  transportTypes: ProposalTransportType[];
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
  onAddItem: (day: string, service: ProposalService, position?: InsertPosition) => string;
  onAddCustomItem: (day: string, fields: CustomItemFields, position?: InsertPosition) => string;
  onUpdateItem: (id: string, updates: Partial<EditableItem>) => void;
  onRemoveItem: (id: string) => void;
  onMoveItem: (id: string, direction: -1 | 1) => void;
  onDropItem: (draggedId: string, targetDay: string, targetItemId?: string) => void;
  onRemoveDay: () => void;
  onChangeDay: (date: string) => void;
  conflictDate: string | null;
}) {
  const t = useTranslations('admin.propostas');
  const [pickerFor, setPickerFor] = useState<InsertPosition | null>(null);
  // Atração coringa: 'create' carrega a posição de inserção que o painel
  // estava usando; 'edit' carrega o item que está sendo reaberto.
  const [customModal, setCustomModal] = useState<
    | { mode: 'create'; position: InsertPosition }
    | { mode: 'edit'; itemId: string }
    | null
  >(null);

  const editingCustom = customModal?.mode === 'edit'
    ? items.find(i => i._id === customModal.itemId) ?? null
    : null;

  // Salvar a coringa: cria o item no dia (herdando a posição do painel) ou
  // atualiza o que já está lá. Como no picker, uma criação posicional deixa a
  // âncora no item novo, para a próxima adição entrar em seguida.
  const handleCustomSave = (draft: CustomActivityDraft) => {
    const fields = customDraftToFields(draft, transportTypes);
    if (customModal?.mode === 'edit') {
      onUpdateItem(customModal.itemId, fields);
    } else if (customModal?.mode === 'create') {
      const { position } = customModal;
      const newId = onAddCustomItem(day, fields, position);
      if (position !== 'end') setPickerFor({ after: newId });
    }
    setCustomModal(null);
  };

  // Multi-add com o painel aberto: em inserções posicionais ('start' ou
  // before/after via "+" do meio do dia), a âncora avança para o item
  // recém-criado — adições seguidas entram em sequência, não invertidas.
  const handlePickerAdd = (service: ProposalService) => {
    const position = pickerFor ?? 'end';
    const newId = onAddItem(day, service, position);
    if (position !== 'end') setPickerFor({ after: newId });
  };

  // Grupo: adiciona os membros um a um, na ordem do grupo. Em inserções
  // posicionais, a âncora avança a cada item — o bloco entra em sequência a
  // partir do ponto clicado, e a próxima adição continua depois dele.
  const handlePickerAddGroup = (groupServices: ProposalService[]) => {
    let position: InsertPosition = pickerFor ?? 'end';
    for (const service of groupServices) {
      const newId = onAddItem(day, service, position);
      if (position !== 'end') position = { after: newId };
    }
    if (position !== 'end') setPickerFor(position);
  };

  const transport = calcDayTransport(items, transportRates, exchangeRate, toggles);
  const { chargeableEur, embeddedEur } = splitTransportCost(transport, embed);
  const dayTotal =
    applyPriceOverrides(items, calcDayItemTotals(items, pax, exchangeRate, guideRate))
      .reduce((s, v) => s + v, 0)
    + chargeableEur;
  const dayHours = calcDayHours(items);
  const overloaded = dayHours > maxHoursPerDay;

  const segments = buildDaySegments(items, startTime);

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
        <div className="flex items-start justify-between">
          <div>
            {/* A data é editável no lugar: remarcar um dia preserva o roteiro. */}
            <label className="group inline-flex items-center gap-1.5 cursor-pointer">
              <span className="text-sm font-semibold text-gray-800">{formatDayHeader(day)}</span>
              <input
                type="date"
                value={day}
                onChange={e => onChangeDay(e.target.value)}
                title={t('remarcarDia')}
                aria-label={t('remarcarDia')}
                className="w-4 h-4 opacity-40 group-hover:opacity-100 focus:opacity-100 cursor-pointer transition-opacity"
              />
            </label>
            {conflictDate && (
              <p className="text-xs text-red-600 font-medium mt-1">
                {t('diaJaExiste', { data: formatDayHeader(conflictDate) })}
              </p>
            )}
            {items.length > 0 && (
              <p className="text-xs text-gray-400 mt-0.5">
                {t('servicos', { count: items.length })} · {fmtEur(dayTotal)}
                {dayHours > 0 && ` · ${dayHours}h`}
              </p>
            )}
            {transport.status === 'ok' && (
              <p className="text-xs text-gray-500 mt-0.5">
                {t('transporteDoDia')}{' '}
                {[
                  toggles.uses_rental_car && t('diariaCarro'),
                  toggles.uses_driver && t('horasMotorista', { horas: transport.hours }),
                ].filter(Boolean).join(' + ')}
                {' · '}{fmtEur(chargeableEur)}
                {embeddedEur > 0 && (
                  <span className="text-gray-400"> {t('embutidoHonorario', { valor: fmtEur(embeddedEur) })}</span>
                )}
              </p>
            )}
            {transport.status === 'no-rates' && (
              <p className="text-xs text-amber-600 font-medium mt-1">
                {t('semFaixaTransporte', { pax })}
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
                  {t('usaMotorista')}
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer select-none text-xs text-gray-600">
                  <input
                    type="checkbox"
                    checked={toggles.uses_rental_car}
                    onChange={e => onChangeToggles({ uses_rental_car: e.target.checked })}
                    className="rounded"
                  />
                  {t('carroAlugado')}
                </label>
              </div>
            )}
            {overloaded && (
              <p className="text-xs text-amber-600 font-medium mt-1">
                {t('maisDeHoras', { horas: maxHoursPerDay })}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2 ml-4 shrink-0">
            <div className="flex items-center gap-1">
              <input
                type="time"
                value={startTime}
                onChange={e => e.target.value && onChangeStartTime(e.target.value)}
                title={t('inicioDoDia')}
                className="px-2 py-1 border border-gray-300 rounded-md text-xs bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              <span className="text-xs text-gray-400">–</span>
              <input
                type="time"
                value={endTime}
                onChange={e => e.target.value && onChangeEndTime(e.target.value)}
                title={t('fimDoDiaTitle')}
                className="px-2 py-1 border border-gray-300 rounded-md text-xs bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={onRemoveDay}
              title={t('removerDia')}
              className="p-1.5 text-gray-300 hover:text-red-500 transition-colors rounded"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
        <button
          onClick={() => setPickerFor(prev => (prev ? null : 'end'))}
          className={`mt-2 w-full px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
            pickerFor
              ? 'bg-green-50 border-green-400 text-green-700'
              : 'bg-white border-dashed border-gray-300 text-gray-500 hover:bg-green-50 hover:border-green-400 hover:text-green-700'
          }`}
        >
          {t('adicionarServicoBotao')}
        </button>
        <ServicePickerPanel
          services={services}
          groups={groups}
          open={pickerFor !== null}
          onAdd={handlePickerAdd}
          onAddGroup={handlePickerAddGroup}
          onAddCustom={() => setCustomModal({ mode: 'create', position: pickerFor ?? 'end' })}
          onClose={() => setPickerFor(null)}
        />
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
          onEditCustom={id => setCustomModal({ mode: 'edit', itemId: id })}
          getCatalogDuration={slug => services.find(s => s.slug === slug)?.duration_hours}
        />
      </div>

      {customModal && (customModal.mode === 'create' || editingCustom) && (
        <CustomActivityModal
          initial={editingCustom ? itemToCustomDraft(editingCustom, transportTypes) : emptyCustomDraft()}
          isEditing={!!editingCustom}
          transportTypes={transportTypes}
          onCancel={() => setCustomModal(null)}
          onSave={handleCustomSave}
        />
      )}
    </div>
  );
}

// Preço editável no resumo: um input sempre visível — a caixinha comunica
// sozinha que o valor aceita edição. Fora de foco mostra o valor formatado
// (vírgula); ao focar vira número editável. Digitar o próprio calculado (ou
// apagar) remove o override; com override ativo o input fica âmbar, com o
// calculado riscado ao lado e ↺ pra restaurar.
function PriceInput({
  calculated,
  override,
  onChange,
  emphasis = false,
}: {
  calculated: number;
  override: number | null;
  onChange: (value: number | null) => void;
  // true no Valor total: input maior, valor em destaque.
  emphasis?: boolean;
}) {
  const t = useTranslations('admin.propostas');
  // null = repouso (exibe formatado); string = texto cru enquanto digita.
  const [draft, setDraft] = useState<string | null>(null);
  // Escape dispara blur com o draft antigo ainda no closure — o ref garante
  // que o cancelamento vença o commit do blur.
  const cancelled = useRef(false);

  const effective = override ?? calculated;
  const display = draft ?? fmtEur(effective).replace('€', '').trim();

  const commit = () => {
    if (cancelled.current) { cancelled.current = false; setDraft(null); return; }
    if (draft === null) return;
    const trimmed = draft.trim();
    setDraft(null);
    if (trimmed === '') { onChange(null); return; }
    const value = parseFloat(trimmed.replace(/\./g, '').replace(',', '.'));
    if (!isFinite(value) || value < 0) return;
    onChange(Math.abs(value - calculated) < 0.005 ? null : value);
  };

  return (
    <span className="flex items-center gap-2 ml-4 shrink-0">
      {override !== null && (
        <>
          <span className="text-xs text-gray-400 line-through tabular-nums whitespace-nowrap">
            {fmtEur(calculated)}
          </span>
          <button
            onClick={() => onChange(null)}
            title={t('restaurarPrecoCalculado')}
            className="text-sm text-gray-400 hover:text-green-700 transition-colors"
          >
            ↺
          </button>
        </>
      )}
      <span className={`inline-flex items-center gap-1 border rounded-md bg-white px-2 focus-within:ring-2 focus-within:border-transparent ${
        override !== null
          ? 'border-amber-400 focus-within:ring-amber-400'
          : 'border-gray-300 focus-within:ring-green-500'
      } ${emphasis ? 'py-1.5' : 'py-1'}`}>
        <span className={`text-gray-400 ${emphasis ? 'text-sm' : 'text-xs'}`}>€</span>
        <input
          type="text"
          inputMode="decimal"
          value={display}
          title={t('precoManualTitle')}
          onFocus={e => {
            setDraft(String(Math.round(effective * 100) / 100).replace('.', ','));
            e.target.select();
          }}
          onChange={e => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={e => {
            if (e.key === 'Enter') e.currentTarget.blur();
            if (e.key === 'Escape') { cancelled.current = true; e.currentTarget.blur(); }
          }}
          className={`text-right tabular-nums bg-transparent focus:outline-none ${
            emphasis ? 'w-28 text-lg font-bold' : 'w-20 text-sm font-medium'
          } ${override !== null ? 'text-amber-600' : emphasis ? 'text-green-600' : 'text-gray-700'}`}
        />
      </span>
    </span>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function NovaPropostaForm({
  services,
  serviceGroups = [],
  transportTypes,
  defaultGuideRate,
  defaultExchangeRate,
  maxHoursPerDay,
  supportedLocales,
  initialLocale,
  initialCurrency,
  initialData,
  proposalId,
  initialLead,
}: {
  services: ProposalService[];
  // Grupos de atividades (atalhos de montagem): opcional porque só os builders
  // os carregam — quem reusa o form sem grupos não precisa saber deles.
  serviceGroups?: ProposalServiceGroup[];
  transportTypes: ProposalTransportType[];
  defaultGuideRate: number;
  defaultExchangeRate: number;
  maxHoursPerDay: number;
  // Idiomas oferecidos no select, vindos de site_settings.supported_locales
  // (resolvidos no servidor — nada hardcoded aqui).
  supportedLocales: string[];
  // Idioma já resolvido pela cascata contato → configuração → padrão.
  initialLocale: string;
  initialCurrency?: ProposalCurrency;
  initialData?: Proposal;
  proposalId?: string;
  initialLead?: InitialLead;
}) {
  const t = useTranslations('admin.propostas');
  const tCommon = useTranslations('admin.common');
  const tTransportes = useTranslations('admin.transportes');
  const router = useRouter();
  const isEditing = !!proposalId;

  // Grupos resolvidos contra o catálogo do idioma da proposta: membro inativo
  // ou sem tradução sai; grupo que ficar sem nenhum membro nem aparece.
  const resolvedGroups = useMemo<ResolvedServiceGroup[]>(() => {
    const byId = new Map(services.map(s => [s.id, s]));
    return serviceGroups
      .map(g => ({
        id: g.id,
        name: g.name,
        services: g.service_ids.map(id => byId.get(id)).filter(Boolean) as ProposalService[],
      }))
      .filter(g => g.services.length > 0);
  }, [serviceGroups, services]);

  // Faixas de veículo (carro + motorista) do tipo de transporte "por faixas".
  const vehicleTiers = useMemo(() => {
    const tierType = transportTypes.find(
      t => !t.is_manual && !t.is_included && t.slug !== 'a-pe' && t.tiers.length > 0,
    );
    return tierType ? [...tierType.tiers].sort((a, b) => a.min_pax - b.min_pax) : [];
  }, [transportTypes]);

  // Toggles por dia vêm congelados na linha 'day_transport' de cada dia;
  // propostas antigas sem os campos contam como ambos ligados. A janela de
  // horário do dia viaja na mesma linha; sem ela, cai no default.
  const initialToggles: Record<string, DayToggles> = {};
  const initialStartTimes: Record<string, string> = {};
  const initialEndTimes: Record<string, string> = {};
  for (const item of initialData?.items ?? []) {
    if (item.kind === 'day_transport') {
      initialToggles[item.day] = {
        uses_driver: item.uses_driver ?? true,
        uses_rental_car: item.uses_rental_car ?? true,
      };
      if (item.day_start_time) initialStartTimes[item.day] = item.day_start_time;
      if (item.day_end_time) initialEndTimes[item.day] = item.day_end_time;
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
        is_custom: item.is_custom ?? false,
        transport_type_slug: item.transport_type_slug ?? null,
        price_override_eur: item.price_override_eur ?? null,
        note: item.note,
      };
    });

  const [clientName, setClientName] = useState(initialData?.client_name ?? initialLead?.name ?? '');
  const [internalLabel, setInternalLabel] = useState(initialData?.internal_label ?? '');
  const [clientEmail, setClientEmail] = useState(initialData?.client_email ?? initialLead?.email ?? '');
  const [clientPhone, setClientPhone] = useState(initialData?.client_phone ?? initialLead?.phone ?? '');
  const [pax, setPax] = useState(initialData?.pax ?? initialLead?.pax ?? 2);
  const [treatment, setTreatment] = useState<ProposalTreatment>(initialData?.treatment ?? 'du-ihr');
  // Idioma e moeda da proposta. O idioma governa em que língua o catálogo é
  // resolvido, então trocá-lo recarrega a página do builder (ver abaixo).
  const [locale, setLocale] = useState<string>(initialLocale);
  const [currency, setCurrency] = useState<ProposalCurrency>(initialCurrency ?? 'EUR');
  // Sie/du-ihr é distinção do alemão. Em qualquer outro idioma o controle não
  // aparece e a proposta guarda 'du-ihr', o valor neutro.
  const showTreatment = locale === 'de';
  const effectiveTreatment: ProposalTreatment = showTreatment ? treatment : 'du-ihr';
  const [exchangeRate, setExchangeRate] = useState(initialData?.exchange_rate ?? defaultExchangeRate);
  // Hourly guide rate: /admin/configuracoes provides the default, but each
  // proposal can override it; existing proposals keep the rate they were
  // priced with.
  const [guideRate, setGuideRate] = useState(initialData?.guide_rate ?? defaultGuideRate);
  const [internalNotes, setInternalNotes] = useState(
    initialData?.internal_notes
      ?? ((initialLead?.children ?? 0) > 0
        ? t('grupoComCriancas', { count: initialLead!.children ?? 0 })
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
  // Remarcação recusada por data já ocupada: `from` diz em qual bloco mostrar o
  // aviso, `to` é a data recusada.
  const [dayConflict, setDayConflict] = useState<{ from: string; to: string } | null>(null);
  const [dayStartTimes, setDayStartTimes] = useState<Record<string, string>>(initialStartTimes);
  const [dayEndTimes, setDayEndTimes] = useState<Record<string, string>>(initialEndTimes);
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
  // Preço final manual da proposta, por cima da soma calculada (que já inclui
  // os overrides por tour); null = total segue o cálculo.
  const [totalOverride, setTotalOverride] = useState<number | null>(
    initialData?.total_override_amount ?? null,
  );
  // Com preço final manual: true = cliente vê Zwischensumme + Rabatt + total;
  // false = só o preço final, desconto invisível.
  const [showRabatt, setShowRabatt] = useState<boolean>(
    initialData?.discount_visible ?? false,
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
      locale, currency,
      exchangeRate, guideRate, internalNotes, items, activeDays, dayStartTimes,
      dayEndTimes, dayToggles, carRateOverride, driverRateOverride, embedCar,
      embedDriver, priceDisplay, depositAmount, validUntil, totalOverride,
      showRabatt,
    }),
    [clientName, internalLabel, clientEmail, clientPhone, pax, treatment,
     locale, currency,
     exchangeRate, guideRate, internalNotes, items, activeDays, dayStartTimes,
     dayEndTimes, dayToggles, carRateOverride, driverRateOverride, embedCar,
     embedDriver, priceDisplay, depositAmount, validUntil, totalOverride,
     showRabatt],
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
      const itemsTotal = applyPriceOverrides(dayItems, calcDayItemTotals(dayItems, pax, exchangeRate, guideRate))
        .reduce((s, v) => s + v, 0);
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
    setDayConflict(prev => (prev?.from === date || prev?.to === date ? null : prev));
    setActiveDays(prev => prev.filter(d => d !== date));
    setItems(prev => prev.filter(i => i.day !== date));
    const dropKey = <T,>(prev: Record<string, T>): Record<string, T> => {
      const { [date]: _removed, ...rest } = prev;
      return rest;
    };
    setDayToggles(dropKey);
    // Sem isso, tirar um dia e recolocar a mesma data ressuscitaria o horário
    // antigo em vez de voltar ao default.
    setDayStartTimes(dropKey);
    setDayEndTimes(dropKey);
  }, []);

  // Remarcar um dia: o itinerário, os horários e os toggles de transporte
  // acompanham a nova data. Mover pra uma data que já está na proposta é
  // bloqueado — fundir dois roteiros silenciosamente perderia trabalho; pra
  // juntar dois dias o caminho é arrastar os itens (drag-and-drop entre dias).
  const handleChangeDay = useCallback((from: string, to: string) => {
    if (!to || to === from) return;
    if (activeDays.includes(to)) {
      setDayConflict({ from, to });
      return;
    }
    setDayConflict(null);
    setActiveDays(prev => prev.map(d => (d === from ? to : d)).sort());
    setItems(prev => prev.map(i => (i.day === from ? { ...i, day: to } : i)));
    const remapKey = <T,>(prev: Record<string, T>): Record<string, T> => {
      if (!(from in prev)) return prev;
      const { [from]: moved, ...rest } = prev;
      return { ...rest, [to]: moved };
    };
    setDayToggles(remapKey);
    setDayStartTimes(remapKey);
    setDayEndTimes(remapKey);
  }, [activeDays]);

  // ─── Item handlers ────────────────────────────────────────────────────────────

  // Índice por slug: o item do itinerário guarda o snapshot do texto, mas o
  // badge de fallback precisa do serviço vivo do catálogo.
  const serviceBySlug = useMemo(
    () => new Map(services.map(s => [s.slug, s])),
    [services],
  );

  // Nome exibido de um item. Atividades já guardam o texto pronto; a linha
  // sintética de transporte do dia guarda um identificador sem idioma (ou, em
  // propostas antigas, o literal alemão), que vira rótulo pt-BR aqui. Valor
  // desconhecido é exibido cru, sem esconder informação.
  const displayItemName = useCallback(
    (storedName: string): string => {
      const key = resolveDayTransportKey(storedName);
      return key ? t(`transporteDia.${key}`) : storedName;
    },
    [t],
  );

  // Trocar o idioma da proposta invalida o texto já copiado do catálogo: as
  // descrições dos itens foram resolvidas no idioma anterior. Zerando-as aqui,
  // o congelamento do envio (freezeProposalOnSend) as resolve no idioma novo,
  // que é a única resolução que precisa estar certa para o cliente. O catálogo
  // exibido na barra lateral só acompanha depois de salvar e reabrir, já que
  // ele é resolvido no servidor.
  //
  // Atrações coringa ficam de fora: o texto delas foi digitado à mão, não veio
  // do catálogo, e não há nada que o reescreva depois — apagá-lo perderia o
  // trabalho do Will em vez de sincronizar idioma.
  const handleChangeLocale = useCallback((next: string) => {
    setLocale(next);
    setItems(prev => prev.map(i => (i.is_custom ? i : { ...i, service_description: null })));
  }, []);

  // Devolve o _id do item criado — o painel usa como âncora para a próxima
  // inserção posicional.
  const handleAddItem = useCallback((day: string, service: ProposalService, position: InsertPosition = 'end'): string => {
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
      is_custom: false,
      transport_type_slug: service.transport_type?.slug ?? null,
      price_override_eur: null,
      note: '',
    };
    setItems(prev => insertItem(prev, newItem, position));
    return newItem._id;
  }, []);

  // Atração coringa: mesmo caminho de uma atividade do catálogo, só que os
  // campos vêm do modal em vez de proposal_services. O item nasce completo e
  // autônomo — daí em diante nada o resolve contra o catálogo.
  const handleAddCustomItem = useCallback((
    day: string,
    fields: CustomItemFields,
    position: InsertPosition = 'end',
  ): string => {
    const newItem: EditableItem = {
      _id: randomId(),
      day,
      service_slug: CUSTOM_SLUG,
      is_custom: true,
      price_override_eur: null,
      note: '',
      ...fields,
    };
    setItems(prev => insertItem(prev, newItem, position));
    return newItem._id;
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
    if (!clientName.trim()) { setError(tCommon('nomeObrigatorio')); return; }
    if (pax < 1) { setError(t('minimoUmaPessoa')); return; }
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
    if (!clientName.trim()) { setError(tCommon('nomeObrigatorio')); return; }
    if (pax < 1) { setError(t('minimoUmaPessoa')); return; }
    if (summaryItems.length === 0) { setError(t('adicioneServicoItinerario')); return; }

    setSubmitting(true);
    try {
      const cleanItems = activeDays.flatMap(day => {
        const dayItems = summaryItems.filter(i => i.day === day);
        // Dia sem atividades fica fora da proposta salva: gravar só a linha
        // sintética de transporte criaria um dia-fantasma que o editor não
        // reconstrói (a hidratação parte das atividades) e que a página
        // pública exibiria como dia de tour vazio.
        if (dayItems.length === 0) return [];
        const dayTotals = applyPriceOverrides(
          dayItems,
          calcDayItemTotals(dayItems, pax, exchangeRate, guideRate),
        );

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

        // Identificador estável, sem idioma: a linha é só de admin e é
        // traduzida na exibição (ver src/lib/dayTransportLabel.ts).
        const serviceName = dayTransportServiceName(toggles);

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
          // Grava o horário efetivo, não só o que foi mexido: assim reabrir a
          // proposta devolve a mesma grade, sem depender do default do editor.
          day_start_time: dayStartTimes[day] ?? DEFAULT_DAY_START,
          day_end_time: dayEndTimes[day] ?? DEFAULT_DAY_END,
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
          treatment: effectiveTreatment,
          locale,
          currency,
          internal_notes: internalNotes.trim(),
          items: cleanItems,
          exchange_rate: exchangeRate,
          guide_rate: guideRate,
          price_display: priceDisplay,
          total_override_amount: totalOverride,
          discount_visible: totalOverride !== null && showRabatt,
          deposit_amount: depositAmount,
          valid_until: validUntil || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) { setError(data.error ?? tCommon('erroSalvar')); return; }

      setDirty(false); // salvo: libera a guarda de saída antes de navegar
      router.push(`/admin/propostas/${data.id}/output`);
    } catch {
      setError(tCommon('erroRede'));
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
              {t('voltarPropostas')}
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
              {isEditing ? t('editarProposta') : t('novaPropostaTitulo')}
            </h1>
          </div>
          {singlePage ? (
            <button
              onClick={handleSubmit}
              disabled={submitting || !dirty}
              className="px-5 py-2 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? tCommon('salvando') : dirty ? tCommon('salvarAlteracoes') : tCommon('salvo')}
            </button>
          ) : step === 1 ? (
            <button
              onClick={handleGoToItinerary}
              className="px-5 py-2 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 transition-colors"
            >
              {t('continuar')}
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="px-5 py-2 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? tCommon('salvando') : t('gerarProposta')}
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
            {t('dadosCliente')}
          </button>
          <div className={`h-px w-10 ${step === 2 ? 'bg-green-300' : 'bg-gray-200'}`} />
          <div className={`flex items-center gap-2 ${step === 2 ? 'text-green-700 font-semibold' : 'text-gray-400'}`}>
            <span className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${step === 2 ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
              2
            </span>
            {t('itinerario')}
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
          <h2 className="text-base font-bold text-gray-900 mb-5">{t('dadosCliente')}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {tCommon('nome')} <span className="text-red-500">*</span>
              </label>
              <input type="text" value={clientName} onChange={e => setClientName(e.target.value)} className={INPUT_CLS} placeholder="Martin Müller" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('rotuloInterno')}
                <span className="ml-1 text-xs font-normal text-gray-400">{t('rotuloInternoHint')}</span>
              </label>
              <input type="text" value={internalLabel} onChange={e => setInternalLabel(e.target.value)} className={INPUT_CLS} placeholder="Plano chuva" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{tCommon('email')}</label>
              <input type="email" value={clientEmail} onChange={e => setClientEmail(e.target.value)} className={INPUT_CLS} placeholder="martin@email.de" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{tCommon('whatsapp')}</label>
              <input type="text" value={clientPhone} onChange={e => setClientPhone(e.target.value)} className={INPUT_CLS} placeholder="+49 170 1234567" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('numeroPessoas')} <span className="text-red-500">*</span>
              </label>
              <input type="number" min="1" value={pax} onChange={e => setPax(Math.max(1, parseInt(e.target.value) || 1))} className={INPUT_CLS} placeholder="2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('idiomaProposta')} <span className="text-red-500">*</span>
                <span className="ml-1 text-xs font-normal text-gray-400">{t('idiomaPropostaHint')}</span>
              </label>
              <select
                value={locale}
                onChange={e => handleChangeLocale(e.target.value)}
                className={INPUT_CLS}
              >
                {supportedLocales.map(code => (
                  <option key={code} value={code}>
                    {fmtLanguage(code)} ({code})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('moeda')} <span className="text-red-500">*</span>
              </label>
              <select
                value={currency}
                onChange={e => setCurrency(e.target.value as ProposalCurrency)}
                className={INPUT_CLS}
              >
                {CURRENCY_OPTIONS.map(code => (
                  <option key={code} value={code}>
                    {t(`moedas.${code}`)}
                  </option>
                ))}
              </select>
            </div>
            {/* Sie/du-ihr só existe em alemão. */}
            {showTreatment && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('tratamento')} <span className="text-red-500">*</span>
              </label>
              <select value={treatment} onChange={e => setTreatment(e.target.value as ProposalTreatment)} className={INPUT_CLS}>
                <option value="Sie">{t('sieFormal')}</option>
                <option value="du-ihr">{t('duInformal')}</option>
              </select>
            </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('honorarioGuia')}
                <span className="ml-1 text-xs font-normal text-gray-400">{t('padrao', { valor: defaultGuideRate })}</span>
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
                {t('precosNaProposta')}
                <span className="ml-1 text-xs font-normal text-gray-400">{t('oQueClienteVe')}</span>
              </label>
              <select
                value={priceDisplay}
                onChange={e => setPriceDisplay(e.target.value as ProposalPriceDisplay)}
                className={INPUT_CLS}
              >
                <option value="total">{t('soTotalFinal')}</option>
                <option value="per_day">{t('totalPorDia')}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('sinal')}
                <span className="ml-1 text-xs font-normal text-gray-400">{t('sinalHint')}</span>
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
                {t('validaAte')}
                <span className="ml-1 text-xs font-normal text-gray-400">{t('validaAteHint')}</span>
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
                {t('observacoesInternas')}{' '}
                <span className="text-xs font-normal text-gray-400">{t('apenasVisivelVoce')}</span>
              </label>
              <textarea value={internalNotes} onChange={e => setInternalNotes(e.target.value)} rows={3} className={`${INPUT_CLS} resize-none`} placeholder={t('notasInternas')} />
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
            {t('continuarItinerario')}
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
          <span>{pax} {pax === 1 ? tCommon('pessoa') : tCommon('pessoas')}</span>
          {activeDays.length > 0 && (
            <span>{activeDays.length} {t('colDiasTour').toLowerCase()}</span>
          )}
          <span className="text-gray-400">{guideRate} EUR/h · {t('cambio', { taxa: exchangeRate })}</span>
          <button
            onClick={handleBackToData}
            className="ml-auto text-xs font-semibold text-green-700 hover:text-green-900 transition-colors"
          >
            {t('editarDados')}
          </button>
        </div>
        )}

        {/* ── Transporte da proposta ── */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
            <h2 className="text-base font-bold text-gray-900">{t('transporteTitulo')}</h2>
            <span className="text-xs text-gray-400">
              {transportTier
                ? t('padraoDaFaixa', { faixa: transportRates.tierLabel ?? '' })
                : t('semFaixaPara', { pax })}
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('diariaCarroLabel', { moeda: transportRates.currency === 'EUR' ? '€' : 'R$' })}
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
                {t('motoristaLabel', { moeda: transportRates.currency === 'EUR' ? '€' : 'R$' })}
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
              {t('restaurarPadrao', {
                diaria: `${transportTier.currency === 'EUR' ? '€' : 'R$'}${transportTier.car_daily_rate}`,
                hora: `${transportTier.currency === 'EUR' ? '€' : 'R$'}${transportTier.driver_price_per_hour}`,
              })}
            </button>
          )}
          <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              {t('embutirHonorario')}
              <span className="ml-2 font-normal normal-case text-gray-400">
                {t('embutirHonorarioHint')}
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
                {tTransportes('diariaCarro')}
              </label>
              <label className="flex items-center gap-2 cursor-pointer select-none text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={embedDriver}
                  onChange={e => setEmbedDriver(e.target.checked)}
                  className="rounded"
                />
                {t('motorista')}
              </label>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-base font-bold text-gray-900 mb-5">{t('itinerario')}</h2>

          <div className="space-y-3">
            {activeDays.length === 0 && (
              <div className="flex flex-col items-center justify-center py-10 text-center text-gray-400">
                <div className="text-3xl mb-3">🗓</div>
                <p className="text-sm mb-4">{t('adicioneDiasTour')}</p>
              </div>
            )}

            {activeDays.map(day => (
              <DayBlock
                key={day}
                day={day}
                items={items.filter(i => i.day === day)}
                services={services}
                groups={resolvedGroups}
                transportTypes={transportTypes}
                pax={pax}
                exchangeRate={exchangeRate}
                guideRate={guideRate}
                transportRates={transportRates}
                embed={embedFlags}
                maxHoursPerDay={maxHoursPerDay}
                startTime={dayStartTimes[day] ?? DEFAULT_DAY_START}
                endTime={dayEndTimes[day] ?? DEFAULT_DAY_END}
                toggles={getDayToggles(day)}
                onChangeToggles={patch => handleChangeToggles(day, patch)}
                onChangeStartTime={t => handleChangeStartTime(day, t)}
                onChangeEndTime={t => handleChangeEndTime(day, t)}
                onAddItem={handleAddItem}
                onAddCustomItem={handleAddCustomItem}
                onUpdateItem={handleUpdateItem}
                onRemoveItem={handleRemoveItem}
                onMoveItem={handleMoveItem}
                onDropItem={handleDropItem}
                onRemoveDay={() => handleRemoveDay(day)}
                onChangeDay={date => handleChangeDay(day, date)}
                conflictDate={dayConflict?.from === day ? dayConflict.to : null}
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
                    {tCommon('adicionar')}
                  </button>
                  <button
                    onClick={() => { setShowDayPicker(false); setDayInput(''); }}
                    className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {tCommon('cancelar')}
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowDayPicker(true)}
                  className="px-4 py-2 text-sm font-semibold border border-dashed border-gray-300 text-gray-500 rounded-lg hover:bg-green-50 hover:border-green-400 hover:text-green-700 transition-colors w-full"
                >
                  {t('adicionarDia')}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ── Section 3: Price Summary ── */}
        {summaryItems.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-base font-bold text-gray-900 mb-4">{t('resumoPrecos')}</h2>
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
                        {formatDayHeader(item.day).split(',')[0]}
                      </span>
                      <span className="text-gray-700 truncate">
                        {item.is_custom && <span title={t('coringaBadge')}>✨ </span>}
                        {displayItemName(item.service_name)}
                        {serviceBySlug.get(item.service_slug) && (
                          <FallbackBadge service={serviceBySlug.get(item.service_slug)!} />
                        )}
                      </span>
                    </div>
                    <PriceInput
                      calculated={dayTotals[idx]}
                      override={item.price_override_eur}
                      onChange={v => handleUpdateItem(item._id, { price_override_eur: v })}
                    />
                  </div>
                ));
                if (transport.status === 'ok' && (chargeableEur > 0 || embeddedEur > 0)) {
                  const parts = [
                    toggles.uses_rental_car && t('diariaCarro'),
                    toggles.uses_driver && t('horasMotorista', { horas: transport.hours }),
                  ].filter(Boolean).join(' + ');
                  rows.push(
                    <div key={`${day}-transport`} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-gray-400 text-xs shrink-0">
                          {formatDayHeader(day).split(',')[0]}
                        </span>
                        <span className="text-gray-500 truncate">
                          {t('transporte', { partes: parts })}
                          {embeddedEur > 0 && (
                            <span className="text-gray-400"> {t('embutido', { valor: fmtEur(embeddedEur) })}</span>
                          )}
                        </span>
                      </div>
                      <span className="tabular-nums text-gray-700 font-medium ml-4 shrink-0">
                        {fmtEur(chargeableEur)}
                      </span>
                    </div>,
                  );
                }
                return rows;
              })}
            </div>
            <div className="mt-4 pt-4 border-t-2 border-gray-200 flex items-center justify-between">
              <span className="font-semibold text-gray-600">{t('valorTotal')}</span>
              <PriceInput
                calculated={grandTotal}
                override={totalOverride}
                onChange={setTotalOverride}
                emphasis
              />
            </div>
            {totalOverride !== null && (
              <div className="mt-3 flex items-start justify-between gap-4">
                <label className="flex items-start gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={showRabatt}
                    onChange={e => setShowRabatt(e.target.checked)}
                    className="rounded mt-0.5"
                  />
                  <span className="text-xs text-gray-600">
                    {t('mostrarRabatt')}
                    <span className="block text-gray-400">
                      {showRabatt
                        ? t('rabattVisivelHint', {
                            valor: fmtEur(Math.abs(grandTotal - totalOverride)),
                          })
                        : t('rabattInvisivelHint')}
                    </span>
                  </span>
                </label>
                {totalOverride > grandTotal && showRabatt && (
                  <span className="text-xs text-amber-600 font-medium shrink-0">
                    {t('acrescimoAviso')}
                  </span>
                )}
              </div>
            )}
          </div>
        )}

        {/* Step 2 footer — só no wizard; na edição o salvar fica na barra fixa */}
        {!singlePage && (
        <div className="flex items-center justify-between pb-10">
          <button
            onClick={handleBackToData}
            className="px-4 py-3 text-sm font-semibold text-gray-500 hover:text-gray-800 transition-colors"
          >
            {t('voltarDados')}
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="px-6 py-3 bg-green-600 text-white text-sm font-semibold rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? tCommon('salvando') : t('gerarPropostaSeta')}
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
              {dirty ? t('alteracoesNaoSalvas') : t('tudoSalvo')}
            </span>
            <button
              onClick={handleSubmit}
              disabled={submitting || !dirty}
              className="px-6 py-2.5 bg-green-600 text-white text-sm font-semibold rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? tCommon('salvando') : tCommon('salvarAlteracoes')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

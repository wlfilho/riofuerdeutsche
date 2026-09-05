'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  AlertTriangle, BarChart3, Bus, Calendar, Car, Check, ChevronDown, Clock,
  ExternalLink, Eye, FileText, Flame, Link2, Mail, MessageSquare, Pencil, Phone, Plus, Users,
} from 'lucide-react';
import { daysSince, fmtDate, fmtDateTime, fmtDuration, fmtEur, fmtLanguage, fmtMoney } from '@/lib/adminFormat';
import { WEEKDAY_SHORT_PT, parseISODate } from '@/lib/calendarDates';
// Só os tipos: `import type` some na compilação, então nem o lib de propostas
// nem o de e-mail (client de servidor, service role, Resend) entram no bundle.
import type { ProposalItem, ProposalStatus, ProposalTreatment } from '@/lib/proposals';
import type { ProposalAnalyticsSummary } from '@/lib/proposalAnalytics';
import type { ProposalEmailStatus } from '@/lib/email/sendProposalEmail';

// ── Types ─────────────────────────────────────────────────────────────────────

type LeadStatus = 'new' | 'contacted' | 'proposal_sent' | 'closed' | 'completed' | 'lost';

/**
 * Lead com o que o cliente preencheu na /anfrage. Campos opcionais porque leads
 * antigos (e os criados à mão no CRM) não têm o formulário por trás.
 */
export interface ContactLead {
  id: string;
  name: string;
  pax: number;
  days: number | null;
  source: string;
  status: LeadStatus;
  proposal_id: string | null;
  estimated_min: number | null;
  estimated_max: number | null;
  created_at: string;
  phone?: string | null;
  children?: number | null;
  /** Datas que o cliente marcou como disponíveis no formulário. */
  requested_days?: string[] | null;
  interessen?: string[] | null;
  /** Texto livre do cliente. Renderizado como ele escreveu, nunca editado. */
  wunsch?: string | null;
  tour_slug?: string | null;
  found_via?: string | null;
  campaign?: string | null;
  claude_chat_url?: string | null;
}

/**
 * Campos de `proposals` usados na aba. A API do contato devolve a linha inteira
 * (select '*'), então ampliar isto não pede mudança no endpoint.
 */
export interface ContactProposal {
  id: string;
  client_name: string;
  internal_label: string | null;
  pax: number;
  status: ProposalStatus;
  items: ProposalItem[] | null;
  arrival_date: string | null;
  departure_date: string | null;
  total_amount: number | null;
  total_override_amount: number | null;
  deposit_amount: number | null;
  valid_until: string | null;
  locale?: string | null;
  currency?: 'EUR' | 'BRL' | null;
  treatment: ProposalTreatment;
  public_token: string;
  internal_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface ContactTourDate {
  id: string;
  lead_id: string;
  date: string;
  /** Horário real combinado, quando a data já está no calendário. */
  start_time: string | null;
  status: string;
  anzahlung_paid: boolean;
  agreed_price: number | null;
}

interface ContactPropostaTabProps {
  /** Nome exibido no cabeçalho do contato: evita repetir o mesmo nome no card. */
  contactName: string | null;
  leads: ContactLead[];
  proposals: ContactProposal[];
  analytics: Record<string, ProposalAnalyticsSummary>;
  emails: Record<string, ProposalEmailStatus>;
  tourDates: ContactTourDate[];
}

type Tone = 'red' | 'amber' | 'green' | 'blue' | 'gray';

// ── Constants ─────────────────────────────────────────────────────────────────

const STATUS_BADGE_CLASS: Record<ProposalStatus, string> = {
  draft:    'bg-gray-100 text-gray-600',
  sent:     'bg-amber-100 text-amber-700',
  accepted: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
};

// Faixa colorida na lateral do card: dá o estado da proposta antes da leitura.
const STATUS_RAIL_CLASS: Record<ProposalStatus, string> = {
  draft:    'border-l-gray-300',
  sent:     'border-l-amber-400',
  accepted: 'border-l-green-500',
  rejected: 'border-l-red-400',
};

const CHIP_TONE_CLASS: Record<Tone, string> = {
  red:   'bg-red-50 text-red-700 border-red-200',
  amber: 'bg-amber-50 text-amber-700 border-amber-200',
  green: 'bg-green-50 text-green-700 border-green-200',
  blue:  'bg-blue-50 text-blue-700 border-blue-200',
  gray:  'bg-gray-50 text-gray-400 border-gray-200',
};

const ALERT_TONE_CLASS: Record<Tone, string> = {
  red:   'bg-red-50 text-red-800 border-red-100',
  amber: 'bg-amber-50 text-amber-800 border-amber-100',
  green: 'bg-green-50 text-green-800 border-green-100',
  blue:  'bg-blue-50 text-blue-800 border-blue-100',
  gray:  'bg-gray-50 text-gray-600 border-gray-100',
};

// ── Helpers ───────────────────────────────────────────────────────────────────

/** "Sex 12/09" — rótulo curto de dia do itinerário. */
function fmtDayShort(iso: string): string {
  const d = parseISODate(iso);
  return `${WEEKDAY_SHORT_PT[d.getDay()]} ${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
}

/** Dias inteiros até uma data ISO; negativo quando já passou. */
function daysUntil(iso: string): number {
  const target = parseISODate(iso).getTime() + 86_400_000 - 1;
  return Math.ceil((target - Date.now()) / 86_400_000);
}

interface ItineraryDay {
  day: string;
  /** Atividades na ordem em que foram montadas no builder. */
  activities: ProposalItem[];
  /** Soma dos itens do dia, transporte incluído: é o que o dia custa na conta. */
  subtotal: number;
  hasTransport: boolean;
}

/**
 * Itinerário por dia. Linhas 'day_transport' são a linha sintética de carro +
 * motorista, não uma atividade: entram no subtotal e viram um ícone, nunca uma
 * parada da timeline. Dia que só tem uma linha dessas com custo zero é sobra de
 * um dia esvaziado no editor e não conta como dia de tour (mesma regra da
 * proposta pública).
 */
function itineraryDays(items: ProposalItem[] | null): ItineraryDay[] {
  const byDay = new Map<string, ItineraryDay>();
  for (const item of items ?? []) {
    const entry = byDay.get(item.day) ?? { day: item.day, activities: [], subtotal: 0, hasTransport: false };
    if (item.kind === 'day_transport') {
      if (item.total_eur > 0) entry.hasTransport = true;
    } else {
      entry.activities.push(item);
    }
    entry.subtotal += item.total_eur;
    byDay.set(item.day, entry);
  }
  return [...byDay.values()]
    .filter(d => d.activities.length > 0 || d.subtotal > 0)
    .sort((a, b) => a.day.localeCompare(b.day));
}

// ── Timeline do dia ───────────────────────────────────────────────────────────

/** Início padrão quando a data ainda não está no calendário: 09:00. */
const DEFAULT_START_MIN = 9 * 60;

interface TimelineStop {
  /** Deslocamento (min) até esta parada; 0 quando não há transfer declarado. */
  travelMin: number;
  /** Minuto do dia em que a atividade começa. */
  startMin: number;
  durationMin: number;
  name: string;
}

/**
 * Encadeia as atividades do dia em horários aproximados. O transfer entre duas
 * atividades vizinhas é a média entre a volta de uma e a ida da outra, igual ao
 * calcDayHours da proposta pública: assim a soma da timeline bate com as horas
 * que o cliente lê ("ca. X Std."), em vez de virar um segundo número.
 */
function dayTimeline(activities: ProposalItem[], startMin: number) {
  const stops: TimelineStop[] = [];
  let cursor = startMin;
  activities.forEach((item, i) => {
    const travel = i === 0
      ? item.transfer_hours_to ?? 0
      : ((activities[i - 1].transfer_hours_back ?? 0) + (item.transfer_hours_to ?? 0)) / 2;
    cursor += travel * 60;
    const durationMin = (item.duration_hours ?? 0) * 60;
    stops.push({
      travelMin: Math.round(travel * 60),
      startMin: cursor,
      durationMin: Math.round(durationMin),
      name: item.service_name,
    });
    cursor += durationMin;
  });
  const backMin = (activities[activities.length - 1]?.transfer_hours_back ?? 0) * 60;
  return { stops, backMin: Math.round(backMin), endMin: cursor + backMin };
}

/** "09:45" a partir do minuto do dia (dobra depois da meia-noite). */
function fmtClock(minutes: number): string {
  const m = ((Math.round(minutes) % 1440) + 1440) % 1440;
  return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
}

/** Duração enxuta: "45min", "1h", "1h30". */
function fmtSpan(minutes: number): string {
  const m = Math.round(minutes);
  if (m < 60) return `${m}min`;
  const h = Math.floor(m / 60);
  return m % 60 === 0 ? `${h}h` : `${h}h${String(m % 60).padStart(2, '0')}`;
}

/** "09:00:00" → 540; null quando a data não está no calendário. */
function startMinFromTourDate(time: string | null | undefined): number | null {
  if (!time) return null;
  const [h, m] = time.split(':').map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return null;
  return h * 60 + m;
}

/** "12/09/2026 – 16/09/2026", caindo nos dias do itinerário quando faltam datas. */
function dateRange(proposal: ContactProposal, days: ItineraryDay[]): string | null {
  const start = proposal.arrival_date ?? days[0]?.day ?? null;
  const end = proposal.departure_date ?? days[days.length - 1]?.day ?? null;
  if (!start) return null;
  if (!end || end === start) return fmtDate(start);
  return `${fmtDate(start)} – ${fmtDate(end)}`;
}

/**
 * Custos que o cliente paga no local (included === false): ficam fora do total
 * da proposta, mas o Will precisa deles pra falar de dinheiro com o cliente.
 * Dedup por atividade + linha, já que a mesma entrada se repete em vários dias.
 */
function onsiteTotals(items: ProposalItem[] | null, pax: number): { currency: 'EUR' | 'BRL'; amount: number }[] {
  const seen = new Set<string>();
  const byCurrency = new Map<'EUR' | 'BRL', number>();
  for (const item of items ?? []) {
    if (item.kind === 'day_transport') continue;
    for (const cost of item.costs ?? []) {
      if (cost.included ?? true) continue;
      const key = `${item.service_name}|${cost.description}|${cost.base_price}|${cost.currency}`;
      if (seen.has(key)) continue;
      seen.add(key);
      const amount = cost.price_type === 'per_pax' ? cost.base_price * pax : cost.base_price;
      byCurrency.set(cost.currency, (byCurrency.get(cost.currency) ?? 0) + amount);
    }
  }
  return [...byCurrency.entries()].map(([currency, amount]) => ({ currency, amount }));
}

/** Link público do cliente — mesmo formato do PropostaOutputClient. */
function publicProposalUrl(p: ContactProposal): string {
  return `https://riofuerdeutsche.de/${p.locale || 'de'}/p/${p.public_token}`;
}

// ── Peças de UI ───────────────────────────────────────────────────────────────

/** Container de uma seção do card. Cada assunto no seu próprio painel. */
function Panel({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <section className={`bg-white border border-gray-200 rounded-xl ${className}`}>{children}</section>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-2">{children}</p>
  );
}

function Chip({ children, tone = 'gray' }: { children: React.ReactNode; tone?: Tone }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium rounded-full border ${CHIP_TONE_CLASS[tone]}`}>
      {children}
    </span>
  );
}

function StatusBadge({ status }: { status: ProposalStatus }) {
  const tProposal = useTranslations('admin.status.proposal');
  return (
    <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${STATUS_BADGE_CLASS[status]}`}>
      {tProposal(status)}
    </span>
  );
}

function StatTile({ label, value, hint, tone = 'gray' }: { label: string; value: string; hint?: string; tone?: Tone }) {
  const valueClass = {
    red: 'text-red-600', amber: 'text-amber-600', green: 'text-green-700',
    blue: 'text-blue-700', gray: 'text-gray-900',
  }[tone];
  return (
    <div className="px-3 py-2.5 bg-white border border-gray-200 rounded-xl">
      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">{label}</p>
      <p className={`mt-0.5 text-lg font-bold tabular-nums leading-tight ${valueClass}`}>{value}</p>
      {hint && <p className="text-[11px] text-gray-400 leading-tight mt-0.5">{hint}</p>}
    </div>
  );
}

function Metric({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">{label}</p>
      <p className="text-sm text-gray-800 tabular-nums">{children}</p>
    </div>
  );
}

// ── AnfrageRequest ────────────────────────────────────────────────────────────

/**
 * O que o cliente pediu no formulário da /anfrage. Fica antes do programa
 * porque é a pergunta que a proposta responde: as datas disponíveis, o tamanho
 * do grupo e o texto que ele escreveu.
 *
 * `proposalDays` cruza as datas pedidas com as datas realmente montadas — data
 * pedida que ficou de fora, e dia de programa fora do que ele ofereceu, são as
 * duas formas de a proposta responder outra coisa.
 */
function AnfrageRequest({ lead, proposalDays }: { lead: ContactLead; proposalDays?: string[] }) {
  const t = useTranslations('admin.contatos.propostasTab');
  const tc = useTranslations('admin.common');
  const tSource = useTranslations('admin.status.source');
  const tInteresse = useTranslations('admin.status.interesse');
  const tFound = useTranslations('admin.status.foundVia');

  const requested = lead.requested_days ?? [];
  const used = new Set(proposalDays ?? []);
  const label = (map: ReturnType<typeof useTranslations>, key: string) => (map.has(key) ? map(key) : key);
  const interesses = [...(lead.interessen ?? []), ...(lead.tour_slug ? [lead.tour_slug] : [])]
    .filter((v, i, arr) => arr.indexOf(v) === i);

  return (
    <Panel className="px-4 py-3">
      <SectionLabel>{t('pedidoTitulo')}</SectionLabel>

      <p className="text-xs text-gray-600">
        {tc('pessoasCount', { count: lead.pax })}
        {(lead.children ?? 0) > 0 && ` + ${tc('criancasCount', { count: lead.children ?? 0 })}`}
        {lead.days ? ` · ${t('pediuDias', { count: lead.days })}` : ''}
        {lead.source ? ` · ${label(tSource, lead.source)}` : ''}
        {lead.found_via ? ` · ${t('encontrouVia')} ${label(tFound, lead.found_via)}` : ''}
        {lead.campaign ? ` · ${lead.campaign}` : ''}
      </p>

      {requested.length > 0 && (
        <div className="flex items-start gap-2 mt-2">
          <span className="text-[11px] text-gray-400 pt-0.5 flex-shrink-0">{t('datasDisponiveis')}</span>
          <div className="flex flex-wrap gap-1">
            {requested.map(d => {
              const isUsed = used.has(d);
              return (
                <span
                  key={d}
                  title={proposalDays ? (isUsed ? t('dataUsada') : t('dataNaoUsada')) : undefined}
                  className={`px-2 py-0.5 rounded-full text-[11px] font-medium border tabular-nums ${
                    !proposalDays
                      ? 'bg-green-50 border-green-200 text-green-800'
                      : isUsed
                        ? 'bg-green-50 border-green-200 text-green-800'
                        : 'bg-white border-gray-200 text-gray-400 line-through'
                  }`}
                >
                  {fmtDate(d)}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {interesses.length > 0 && (
        <div className="flex items-start gap-2 mt-2">
          <span className="text-[11px] text-gray-400 pt-0.5 flex-shrink-0">{t('interesses')}</span>
          <div className="flex flex-wrap gap-1">
            {interesses.map(i => <Chip key={i} tone="blue">{label(tInteresse, i)}</Chip>)}
          </div>
        </div>
      )}

      {/* Texto do cliente, exatamente como ele escreveu. */}
      {lead.wunsch && (
        <blockquote className="mt-2 pl-2.5 border-l-2 border-gray-200 text-xs text-gray-600 italic whitespace-pre-line">
          {lead.wunsch}
        </blockquote>
      )}

      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-[11px]">
        {lead.phone && (
          <a
            href={`https://wa.me/${lead.phone.replace(/\D/g, '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-gray-500 hover:text-green-700 transition-colors"
          >
            <Phone className="w-3 h-3" />
            {lead.phone}
          </a>
        )}
        {lead.claude_chat_url && (
          <a
            href={lead.claude_chat_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-gray-500 hover:text-gray-800 transition-colors"
          >
            <MessageSquare className="w-3 h-3" />
            {t('conversaClaude')}
          </a>
        )}
        <span className="text-gray-400">{t('pedidoEm')} {fmtDate(lead.created_at)}</span>
      </div>
    </Panel>
  );
}

// ── DayTimeline ───────────────────────────────────────────────────────────────

/**
 * Um dia do programa como linha do tempo. `startMin` vem do calendário quando a
 * data já está lá (horário combinado de verdade); sem isso, ancora em 09:00 e a
 * UI diz que é estimativa, pra ninguém tratar como hora confirmada.
 */
function DayTimeline({
  day,
  startMin,
  outsideRequested,
}: {
  day: ItineraryDay;
  startMin: number | null;
  outsideRequested?: boolean;
}) {
  const t = useTranslations('admin.contatos.propostasTab');
  const anchored = startMin != null;
  const { stops, backMin, endMin } = dayTimeline(day.activities, startMin ?? DEFAULT_START_MIN);
  const totalMin = endMin - (startMin ?? DEFAULT_START_MIN);

  return (
    <div className="mt-3 first:mt-1">
      {/* Cabeçalho do dia */}
      <div className="flex items-baseline gap-2 mb-1">
        <span className="text-xs font-semibold text-gray-700 tabular-nums">{fmtDayShort(day.day)}</span>
        {outsideRequested && (
          <span
            title={t('diaForaDasDatas')}
            className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium rounded-full bg-amber-50 border border-amber-200 text-amber-700"
          >
            <AlertTriangle className="w-2.5 h-2.5" />
            {t('foraDoPedido')}
          </span>
        )}
        {stops.length > 0 && (
          <span className="text-[11px] text-gray-400 tabular-nums">≈ {fmtSpan(totalMin)}</span>
        )}
        <span
          className={`inline-flex items-center gap-1 text-[11px] ${anchored ? 'text-gray-500' : 'text-gray-300'}`}
          title={anchored ? t('horarioCalendario') : t('inicioEstimado')}
        >
          <Clock className="w-3 h-3" />
          {fmtClock(startMin ?? DEFAULT_START_MIN)}
        </span>
        <span className="ml-auto flex items-center gap-1 text-[11px] text-gray-400 tabular-nums">
          {day.hasTransport && <Bus className="w-3 h-3 text-gray-300" aria-label={t('transporteDia')} />}
          {fmtEur(day.subtotal)}
        </span>
      </div>

      {stops.length === 0 ? (
        <p className="pl-4 text-xs text-gray-300">{t('semAtividadesDia')}</p>
      ) : (
        <div className="relative pl-4">
          {/* Trilho da timeline */}
          <span className="absolute left-[3px] top-1.5 bottom-3 w-px bg-gray-200" aria-hidden />
          {stops.map((stop, i) => (
            <div key={`${stop.name}-${i}`}>
              {stop.travelMin > 0 && (
                <p className="flex items-center gap-1 py-0.5 text-[11px] text-gray-300 tabular-nums">
                  <Car className="w-3 h-3" aria-label={t('deslocamento')} />
                  {fmtSpan(stop.travelMin)}
                </p>
              )}
              <div className="relative flex items-baseline gap-2 py-0.5">
                <span className="absolute -left-4 top-[7px] w-[7px] h-[7px] rounded-full bg-gray-400 ring-2 ring-white" aria-hidden />
                <span className="w-10 flex-shrink-0 text-xs font-medium text-gray-500 tabular-nums">
                  {fmtClock(stop.startMin)}
                </span>
                <span className="flex-1 text-xs text-gray-800">{stop.name}</span>
                {stop.durationMin > 0 && (
                  <span className="text-[11px] text-gray-400 tabular-nums">{fmtSpan(stop.durationMin)}</span>
                )}
              </div>
            </div>
          ))}
          {backMin > 0 && (
            <p className="flex items-center gap-1 py-0.5 text-[11px] text-gray-300 tabular-nums">
              <Car className="w-3 h-3" aria-label={t('deslocamento')} />
              {fmtSpan(backMin)}
            </p>
          )}
          <div className="relative flex items-baseline gap-2 py-0.5">
            <span className="absolute -left-4 top-[7px] w-[7px] h-[7px] rounded-full border border-gray-300 bg-white" aria-hidden />
            <span className="w-10 flex-shrink-0 text-xs text-gray-400 tabular-nums">{fmtClock(endMin)}</span>
            <span className="flex-1 text-[11px] text-gray-400">{t('fimDoDia')}</span>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Alertas: o que exige ação nesta proposta ─────────────────────────────────

interface Alert { tone: Tone; icon: React.ReactNode; text: string }

/**
 * Cruza status × leitura × envio × sinal pra transformar os números em uma
 * frase acionável. É o que faz a aba valer mais que a lista de propostas.
 */
function useProposalAlerts(
  proposal: ContactProposal,
  stats: ProposalAnalyticsSummary | undefined,
  email: ProposalEmailStatus | undefined,
  dates: ContactTourDate[],
): Alert[] {
  const t = useTranslations('admin.contatos.propostasTab');
  const alerts: Alert[] = [];
  const sessions = stats?.sessions ?? 0;
  const age = daysSince(proposal.updated_at);

  if (proposal.status === 'sent' && sessions === 0) {
    alerts.push({
      tone: age >= 3 ? 'red' : 'amber',
      icon: <Eye className="w-3.5 h-3.5" />,
      text: age === 0 ? t('nuncaAbertaHoje') : t('nuncaAberta', { count: age }),
    });
  }

  if (proposal.status === 'sent' && !email?.last_sent_at) {
    alerts.push({ tone: 'amber', icon: <Mail className="w-3.5 h-3.5" />, text: t('semEmail') });
  }

  // Leu preço E dados bancários: é o padrão de quem está decidindo pagar.
  if (stats && stats.saw_price && (stats.saw_bank || stats.bank_copy_clicks > 0) && proposal.status === 'sent') {
    alerts.push({ tone: 'green', icon: <Flame className="w-3.5 h-3.5" />, text: t('prontaPraCobrar') });
  }

  // Mais de um aparelho ou um share: o link circulou dentro do grupo.
  if (stats && (stats.unique_visitors > 1 || stats.share_clicks > 0)) {
    alerts.push({
      tone: 'blue',
      icon: <Users className="w-3.5 h-3.5" />,
      text: t('compartilhada', { count: Math.max(stats.unique_visitors, 2) }),
    });
  }

  if (proposal.valid_until && proposal.status === 'sent') {
    const left = daysUntil(proposal.valid_until);
    if (left < 0) {
      alerts.push({
        tone: 'red',
        icon: <AlertTriangle className="w-3.5 h-3.5" />,
        text: t('validadeVencida', { data: fmtDate(proposal.valid_until) }),
      });
    } else if (left <= 3) {
      alerts.push({
        tone: 'amber',
        icon: <AlertTriangle className="w-3.5 h-3.5" />,
        text: t('validadeVencendo', { count: left }),
      });
    }
  }

  if (proposal.status === 'accepted' && proposal.deposit_amount && dates.length > 0 && !dates.some(d => d.anzahlung_paid)) {
    alerts.push({ tone: 'amber', icon: <AlertTriangle className="w-3.5 h-3.5" />, text: t('aceitaSemSinal') });
  }

  if (proposal.status === 'draft' && age >= 7) {
    alerts.push({ tone: 'gray', icon: <FileText className="w-3.5 h-3.5" />, text: t('rascunhoParado', { count: age }) });
  }

  return alerts;
}

// ── ProposalCard ──────────────────────────────────────────────────────────────

function ProposalCard({
  proposal,
  lead,
  contactName,
  stats,
  email,
  dates,
  defaultOpen,
}: {
  proposal: ContactProposal;
  lead?: ContactLead;
  contactName: string | null;
  stats?: ProposalAnalyticsSummary;
  email?: ProposalEmailStatus;
  dates: ContactTourDate[];
  defaultOpen: boolean;
}) {
  const t = useTranslations('admin.contatos.propostasTab');
  const tc = useTranslations('admin.common');
  const [showProgram, setShowProgram] = useState(defaultOpen);
  const [copied, setCopied] = useState(false);

  const days = itineraryDays(proposal.items);
  const range = dateRange(proposal, days);
  const alerts = useProposalAlerts(proposal, stats, email, dates);

  const subtotal = (proposal.items ?? []).reduce((sum, i) => sum + i.total_eur, 0);
  const total = proposal.total_amount;
  const discount = proposal.total_override_amount != null && total != null ? subtotal - total : 0;
  const perPerson = total != null && proposal.pax > 0 ? total / proposal.pax : null;
  const onsite = onsiteTotals(proposal.items, proposal.pax);
  const depositPaid = dates.some(d => d.anzahlung_paid);
  const activityCount = days.reduce((sum, d) => sum + d.activities.length, 0);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(publicProposalUrl(proposal));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard bloqueado: o link continua acessível na página de saída */
    }
  };

  return (
    <div className={`rounded-2xl border border-gray-200 border-l-4 bg-gray-100/60 p-2 space-y-2 ${STATUS_RAIL_CLASS[proposal.status]}`}>
      {/* ── Cabeçalho ── */}
      <Panel className="px-4 py-3">
        <div className="flex items-start gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-sm font-semibold text-gray-900 truncate">
                {/* O nome do contato já está no cabeçalho do perfil: aqui só
                    aparece quando a proposta foi feita em outro nome. */}
                {proposal.internal_label
                  || (contactName && proposal.client_name.trim() === contactName.trim()
                    ? t('propostaTitulo')
                    : proposal.client_name)}
              </p>
              <StatusBadge status={proposal.status} />
              <span className="text-[11px] text-gray-400">
                {t('atualizada')} {daysSince(proposal.updated_at) === 0
                  ? t('hoje')
                  : t('haDias', { count: daysSince(proposal.updated_at) })}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {tc('pessoasCount', { count: proposal.pax })}
              {range && ` · ${range}`}
              {days.length > 0 && ` · ${t('diasPrograma', { count: days.length })}`}
              {activityCount > 0 && ` · ${t('atividadesCount', { count: activityCount })}`}
            </p>
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <a
              href={`/admin/propostas/${proposal.id}/editar`}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-gray-900 rounded-lg hover:bg-gray-700 transition-colors"
            >
              <Pencil className="w-3.5 h-3.5" />
              {tc('editar')}
            </a>
            <a
              href={`/admin/propostas/${proposal.id}/output`}
              title={t('verSaida')}
              aria-label={t('verSaida')}
              className="inline-flex items-center justify-center w-8 h-8 text-gray-400 bg-white border border-gray-200 rounded-lg hover:text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <a
              href={`/admin/propostas/${proposal.id}/estatisticas`}
              title={t('verEstatisticas')}
              aria-label={t('verEstatisticas')}
              className="inline-flex items-center justify-center w-8 h-8 text-gray-400 bg-white border border-gray-200 rounded-lg hover:text-blue-600 hover:bg-blue-50 transition-colors"
            >
              <BarChart3 className="w-3.5 h-3.5" />
            </a>
            <button
              type="button"
              onClick={copyLink}
              title={t('copiarLink')}
              aria-label={t('copiarLink')}
              className="inline-flex items-center justify-center w-8 h-8 text-gray-400 bg-white border border-gray-200 rounded-lg hover:text-gray-700 hover:bg-gray-100 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Link2 className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </Panel>

      {/* ── Alertas: soltos sobre o fundo, para não competirem com as seções ── */}
      {alerts.map((alert, i) => (
        <p
          key={i}
          className={`flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-xl border ${ALERT_TONE_CLASS[alert.tone]}`}
        >
          <span className="flex-shrink-0">{alert.icon}</span>
          {alert.text}
        </p>
      ))}

      {/* ── Programa: o conteúdo da proposta, antes de tudo que é meta ── */}
      <Panel className="overflow-hidden">
        <button
          type="button"
          onClick={() => setShowProgram(o => !o)}
          className="w-full flex items-center justify-between gap-2 px-4 pt-3 pb-1 text-left hover:bg-gray-50 transition-colors"
        >
          <SectionLabel>{t('programaTitulo')}</SectionLabel>
          <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showProgram ? 'rotate-180' : ''}`} />
        </button>
        {showProgram && (
          days.length === 0 ? (
            <p className="px-4 pb-3 text-xs text-gray-400 italic">{t('semItens')}</p>
          ) : (
            <div className="px-4 pb-3">
              {days.map(day => (
                <DayTimeline
                  key={day.day}
                  day={day}
                  startMin={startMinFromTourDate(dates.find(d => d.date === day.day)?.start_time)}
                  outsideRequested={
                    (lead?.requested_days?.length ?? 0) > 0
                    && !lead!.requested_days!.includes(day.day)
                  }
                />
              ))}
              <p className="mt-2.5 text-[11px] text-gray-400 italic">{t('horariosAproximados')}</p>
            </div>
          )
        )}
      </Panel>

      {/* ── Pedido do cliente: o que a proposta acima respondeu ── */}
      {lead && <AnfrageRequest lead={lead} proposalDays={days.map(d => d.day)} />}

      {/* ── Valores ── */}
      <Panel className="px-4 py-3">
        <SectionLabel>{t('valoresTitulo')}</SectionLabel>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Metric label={tc('total')}>
            <span className="font-semibold">{total == null ? tc('vazio') : fmtEur(total)}</span>
          </Metric>
          <Metric label={t('porPessoa')}>{perPerson == null ? tc('vazio') : fmtEur(perPerson)}</Metric>
          <Metric label={t('sinalPedido')}>
            {proposal.deposit_amount ? fmtEur(proposal.deposit_amount) : tc('vazio')}
          </Metric>
          <Metric label={t('noLocal')}>
            {onsite.length === 0
              ? tc('vazio')
              : onsite.map(o => fmtMoney(o.amount, o.currency)).join(' + ')}
          </Metric>
        </div>
        <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
          {discount > 0.005 && (
            <Chip tone="amber">
              {t('subtotal')} {fmtEur(subtotal)} · {t('desconto')} −{fmtEur(discount)}
            </Chip>
          )}
          {proposal.deposit_amount ? (
            <Chip tone={depositPaid ? 'green' : 'amber'}>
              {depositPaid ? `✓ ${t('sinalPago')}` : t('sinalPendente')}
            </Chip>
          ) : null}
          {dates.length > 0 && (
            <Chip tone="gray">
              <Calendar className="w-3 h-3" />
              {t('datasCalendario', { count: dates.length })}
            </Chip>
          )}
        </div>
      </Panel>

      {/* ── Leitura do cliente ── */}
      <Panel className="px-4 py-3">
        <SectionLabel>{t('leituraTitulo')}</SectionLabel>
        {!stats || stats.sessions === 0 ? (
          <p className="text-xs text-gray-400 italic">{t('semLeitura')}</p>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-2.5">
              <Metric label={t('aberturas')}>
                {stats.sessions}
                {stats.unique_visitors > 1 && (
                  <span className="text-xs font-normal text-gray-400"> · {t('visitantes', { count: stats.unique_visitors })}</span>
                )}
              </Metric>
              <Metric label={t('tempoLeitura')}>{fmtDuration(stats.total_active_seconds)}</Metric>
              <Metric label={t('scrollMax')}>{Math.round(stats.max_scroll_pct)}%</Metric>
              <Metric label={t('ultimaAbertura')}>
                {stats.last_view_at ? fmtDateTime(stats.last_view_at) : tc('vazio')}
              </Metric>
            </div>
            <div className="flex flex-wrap gap-1.5">
              <Chip tone={stats.saw_price ? 'green' : 'gray'}>
                {stats.saw_price ? '✓' : '·'} {t('viuPreco')}
              </Chip>
              <Chip tone={stats.saw_bank ? 'green' : 'gray'}>
                {stats.saw_bank ? '✓' : '·'} {t('viuBanco')}
              </Chip>
              {stats.bank_copy_clicks > 0 && <Chip tone="green">✓ {t('copiouBanco')}</Chip>}
              <Chip tone={stats.contact_clicks > 0 ? 'green' : 'gray'}>
                {t('cliquesContato', { count: stats.contact_clicks })}
              </Chip>
              {stats.share_clicks > 0 && <Chip tone="blue">{t('compartilhamentos', { count: stats.share_clicks })}</Chip>}
              {stats.first_view_at && (
                <Chip tone="gray">{t('primeiraAbertura')} {fmtDateTime(stats.first_view_at)}</Chip>
              )}
            </div>
          </>
        )}
      </Panel>

      {/* ── Notas internas ── */}
      {proposal.internal_notes && (
        <Panel className="px-4 py-3">
          <SectionLabel>{t('notasInternas')}</SectionLabel>
          <p className="text-xs text-gray-600 whitespace-pre-line">{proposal.internal_notes}</p>
        </Panel>
      )}

      {/* ── Rodapé: metadado do envio, sem painel próprio ── */}
      <div className="px-2 pb-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-gray-500">
        <span>
          <Mail className="inline-block w-3 h-3 mr-1 align-[-1px]" />
          {email?.last_sent_at ? t('emailEnviado', { data: fmtDate(email.last_sent_at) }) : t('emailNaoEnviado')}
        </span>
        {email?.error_count ? <span className="text-red-600">{t('emailErro', { count: email.error_count })}</span> : null}
        <span>{fmtLanguage(proposal.locale || 'de')} · {proposal.currency ?? 'EUR'} · {proposal.treatment}</span>
        {proposal.valid_until && <span>{t('validaAte')} {fmtDate(proposal.valid_until)}</span>}
        <span className="ml-auto">{t('criadaEm')} {fmtDate(proposal.created_at)}</span>
      </div>
    </div>
  );
}

// ── PendingLeadCard ───────────────────────────────────────────────────────────

function PendingLeadCard({ lead }: { lead: ContactLead }) {
  const t = useTranslations('admin.contatos.propostasTab');
  const tc = useTranslations('admin.common');
  const tSource = useTranslations('admin.status.source');
  const waiting = daysSince(lead.created_at);
  const source = lead.source && tSource.has(lead.source) ? tSource(lead.source) : lead.source;

  return (
    <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-100/60 p-2 space-y-2">
      <Panel className="flex items-center gap-3 px-4 py-3.5">
        <div className="flex-shrink-0 w-9 h-9 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center">
          <FileText className="w-4 h-4 text-gray-300" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-medium text-gray-600">{t('leadSemProposta')}</p>
            <span className={`text-[11px] font-medium ${waiting >= 3 ? 'text-red-500' : 'text-gray-400'}`}>
              {waiting === 0 ? t('hoje') : t('esperandoHa', { count: waiting })}
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-0.5">
            {tc('pessoasCount', { count: lead.pax })}
            {lead.days ? ` · ${tc('diasCount', { count: lead.days })}` : ''}
            {source ? ` · ${source}` : ''}
            {lead.estimated_min != null && lead.estimated_max != null
              ? ` · ${t('estimativa')} ${fmtEur(lead.estimated_min)} – ${fmtEur(lead.estimated_max)}`
              : ''}
          </p>
        </div>
        <a
          href={`/admin/propostas/nova?lead_id=${lead.id}`}
          className="flex-shrink-0 flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          {t('criarProposta')}
        </a>
      </Panel>
      <AnfrageRequest lead={lead} />
    </div>
  );
}

// ── Resumo do contato ─────────────────────────────────────────────────────────

function ContactSummary({
  proposals,
  analytics,
}: {
  proposals: ContactProposal[];
  analytics: Record<string, ProposalAnalyticsSummary>;
}) {
  const t = useTranslations('admin.contatos.propostasTab');
  const tStatus = useTranslations('admin.status.proposal');

  const byStatus = (s: ProposalStatus) => proposals.filter(p => p.status === s);
  const sum = (list: ContactProposal[]) => list.reduce((acc, p) => acc + (p.total_amount ?? 0), 0);
  const open = byStatus('sent');
  const accepted = byStatus('accepted');

  const sessions = proposals.reduce((acc, p) => acc + (analytics[p.id]?.sessions ?? 0), 0);
  const lastView = proposals
    .map(p => analytics[p.id]?.last_view_at)
    .filter((d): d is string => !!d)
    .sort()
    .pop();

  return (
    <div>
      <div className="flex items-center gap-2 flex-wrap mb-2">
        <span className="text-sm font-semibold text-gray-800">
          {t('propostasCount', { count: proposals.length })}
        </span>
        {(['sent', 'accepted', 'rejected', 'draft'] as ProposalStatus[]).map(s => {
          const n = byStatus(s).length;
          if (n === 0) return null;
          return (
            <span key={s} className={`px-2 py-0.5 text-[11px] font-medium rounded-full ${STATUS_BADGE_CLASS[s]}`}>
              {n} {tStatus(s).toLowerCase()}
            </span>
          );
        })}
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
        <StatTile
          label={t('emAberto')}
          value={fmtEur(sum(open))}
          hint={open.length > 0 ? t('propostasCount', { count: open.length }) : undefined}
          tone={open.length > 0 ? 'amber' : 'gray'}
        />
        <StatTile
          label={t('fechado')}
          value={fmtEur(sum(accepted))}
          hint={accepted.length > 0 ? t('propostasCount', { count: accepted.length }) : undefined}
          tone={accepted.length > 0 ? 'green' : 'gray'}
        />
        <StatTile
          label={t('aberturas')}
          value={String(sessions)}
          hint={sessions === 0 ? t('semAbertura') : undefined}
          tone={sessions > 0 ? 'blue' : 'gray'}
        />
        <StatTile
          label={t('ultimaAbertura')}
          value={lastView ? fmtDate(lastView) : '—'}
          hint={lastView ? (daysSince(lastView) === 0 ? t('hoje') : t('haDias', { count: daysSince(lastView) })) : undefined}
        />
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function ContactPropostaTab({
  contactName,
  leads,
  proposals,
  analytics,
  emails,
  tourDates,
}: ContactPropostaTabProps) {
  const t = useTranslations('admin.contatos.propostasTab');

  const proposalsById = new Map(proposals.map(p => [p.id, p]));
  const leadProposalIds = new Set(leads.map(l => l.proposal_id).filter(Boolean));
  const datesByLead = new Map<string, ContactTourDate[]>();
  for (const d of tourDates) {
    datesByLead.set(d.lead_id, [...(datesByLead.get(d.lead_id) ?? []), d]);
  }

  // Uma linha por lead: a proposta vinculada (se houver) ou um CTA pra criar.
  const leadRows = leads.map(lead => ({
    lead,
    proposal: lead.proposal_id ? proposalsById.get(lead.proposal_id) ?? null : null,
  }));

  // Propostas que não estão presas a nenhum lead (ex.: plano B duplicado).
  const orphanProposals = proposals.filter(p => !leadProposalIds.has(p.id));

  if (leadRows.length === 0 && orphanProposals.length === 0) {
    return (
      <div className="p-6">
        <p className="text-sm text-gray-400 italic">{t('nenhuma')}</p>
      </div>
    );
  }

  // Só o primeiro card abre o programa: o de cima é a proposta que está em jogo.
  const firstCardId = leadRows.find(r => r.proposal)?.proposal?.id ?? orphanProposals[0]?.id ?? null;

  return (
    <div className="p-6 space-y-5">
      {proposals.length > 0 && <ContactSummary proposals={proposals} analytics={analytics} />}

      {leadRows.length > 0 && (
        <div className="space-y-3">
          {leadRows.map(({ lead, proposal }) =>
            proposal ? (
              <ProposalCard
                key={lead.id}
                proposal={proposal}
                lead={lead}
                contactName={contactName}
                stats={analytics[proposal.id]}
                email={emails[proposal.id]}
                dates={datesByLead.get(lead.id) ?? []}
                defaultOpen={proposal.id === firstCardId}
              />
            ) : (
              <PendingLeadCard key={lead.id} lead={lead} />
            )
          )}
        </div>
      )}

      {orphanProposals.length > 0 && (
        <div>
          <SectionLabel>{t('outrasPropostas')}</SectionLabel>
          <div className="space-y-3">
            {orphanProposals.map(p => (
              <ProposalCard
                key={p.id}
                proposal={p}
                contactName={contactName}
                stats={analytics[p.id]}
                email={emails[p.id]}
                dates={[]}
                defaultOpen={p.id === firstCardId}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

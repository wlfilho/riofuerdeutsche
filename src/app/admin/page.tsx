// src/app/admin/page.tsx
import Link from 'next/link';
import { getAdminTranslations } from '@/i18n/admin';
import { createClient } from '@/utils/supabase/server';
import {
  todayISO,
  toISODate,
  parseISODate,
  formatTime,
  WEEKDAY_SHORT_PT,
} from '@/lib/calendarDates';
import { fmtEur } from '@/lib/adminFormat';
import { PARTNER_BADGE, TOUR_DATE_STATUS_BADGE, type TourDateStatus } from '@/lib/tourDates';
import type { LeadStatus } from './crm/page';
import type { ProposalStatus } from '@/lib/proposals';

export async function generateMetadata() {
  const t = await getAdminTranslations('admin.dashboard');
  return { title: t('metaTitle') };
}

interface DashboardTour {
  id: string;
  lead_id: string;
  date: string;
  start_time: string | null;
  tour_name: string;
  status: TourDateStatus;
  pax: number | null;
  agreed_price: number | null;
  anzahlung_paid: boolean;
  with_partner: boolean;
  partner_name: string | null;
  lead: { name: string } | null;
}

interface DashboardProposal {
  id: string;
  client_name: string;
  status: ProposalStatus;
  total_amount: number | null;
  pax: number;
  created_at: string;
}

function formatShortDate(iso: string): string {
  const d = parseISODate(iso);
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  return `${WEEKDAY_SHORT_PT[d.getDay()]}, ${dd}/${mm}`;
}

const LEAD_STATUS_BAR: Record<LeadStatus, string> = {
  new: 'bg-blue-500',
  contacted: 'bg-amber-500',
  proposal_sent: 'bg-purple-500',
  closed: 'bg-green-600',
  lost: 'bg-gray-400',
};

const PROPOSAL_STATUS_BADGE: Record<ProposalStatus, string> = {
  draft: 'bg-gray-100 text-gray-700',
  sent: 'bg-blue-50 text-blue-700',
  accepted: 'bg-green-50 text-green-700',
  rejected: 'bg-red-50 text-red-700',
};

export default async function DashboardPage() {
  const t = await getAdminTranslations('admin.dashboard');
  const tLeadStatus = await getAdminTranslations('admin.status.leadPlural');
  const tProposalStatus = await getAdminTranslations('admin.status.proposal');
  const tTourStatus = await getAdminTranslations('admin.status.tourDateShort');
  const tCalendario = await getAdminTranslations('admin.calendario');
  const supabase = await createClient();

  const today = todayISO();
  const now = parseISODate(today);
  const monthStart = toISODate(new Date(now.getFullYear(), now.getMonth(), 1));
  const monthEnd = toISODate(new Date(now.getFullYear(), now.getMonth() + 1, 0));

  const [leadsRes, toursRes, proposalsRes, profilesRes, chaptersRes, reviewsRes] =
    await Promise.all([
      supabase.from('price_leads').select('status, created_at'),
      supabase
        .from('tour_dates')
        .select('id, lead_id, date, start_time, tour_name, status, pax, agreed_price, anzahlung_paid, with_partner, partner_name, lead:price_leads(name)')
        .gte('date', monthStart)
        .order('date', { ascending: true })
        .order('start_time', { ascending: true, nullsFirst: true }),
      supabase
        .from('proposals')
        .select('id, client_name, status, total_amount, pax, created_at')
        .order('created_at', { ascending: false }),
      supabase.from('profiles').select('role'),
      supabase.from('guide_chapters').select('status'),
      supabase
        .from('reviews')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending'),
    ]);

  const loadError = [leadsRes, toursRes, proposalsRes, profilesRes, chaptersRes, reviewsRes]
    .map(r => r.error?.message)
    .find(Boolean);

  // — CRM —
  const leads = (leadsRes.data ?? []) as Array<{ status: LeadStatus; created_at: string }>;
  const leadCounts = Object.fromEntries(
    (Object.keys(LEAD_STATUS_BAR) as LeadStatus[]).map(s => [
      s,
      leads.filter(l => l.status === s).length,
    ]),
  ) as Record<LeadStatus, number>;
  const eligible = leads.length - leadCounts.lost;
  const conversion = eligible > 0 ? Math.round((leadCounts.closed / eligible) * 100) : 0;
  const maxLeadCount = Math.max(1, ...Object.values(leadCounts));

  // — Calendário / Tours —
  const tours = (toursRes.data ?? []) as unknown as DashboardTour[];
  const upcomingTours = tours.filter(t => t.date >= today);
  const upcomingClosed = upcomingTours.filter(t => t.status === 'fechado');
  const monthRevenue = tours
    .filter(t => t.status === 'fechado' && t.date <= monthEnd)
    .reduce((sum, t) => sum + (t.agreed_price ?? 0), 0);
  const futureRevenue = upcomingClosed.reduce((sum, t) => sum + (t.agreed_price ?? 0), 0);
  const pendingAnzahlung = upcomingClosed.filter(t => !t.anzahlung_paid).length;

  // Dias com tours de 2+ clientes diferentes ainda por vir — mesma regra do
  // calendário (ver findConflictingTourDates): um guia só cobre um pack por
  // dia. Só considera daqui pra frente porque conflito de data passada não
  // precisa mais ser resolvido.
  const conflictDatesCount = new Map<string, Set<string>>();
  for (const t of upcomingTours) {
    const leads = conflictDatesCount.get(t.date) ?? new Set<string>();
    leads.add(t.lead_id);
    conflictDatesCount.set(t.date, leads);
  }
  const conflictDaysCount = [...conflictDatesCount.values()].filter(leads => leads.size > 1).length;

  // — Propostas —
  const proposals = (proposalsRes.data ?? []) as DashboardProposal[];
  const sentProposals = proposals.filter(p => p.status === 'sent');
  const sentValue = sentProposals.reduce((sum, p) => sum + (p.total_amount ?? 0), 0);
  const draftProposals = proposals.filter(p => p.status === 'draft').length;
  const recentProposals = proposals.slice(0, 5);

  // — Plataforma —
  const profiles = (profilesRes.data ?? []) as Array<{ role: string }>;
  const chapters = (chaptersRes.data ?? []) as Array<{ status: string }>;
  const pendingReviews = reviewsRes.count ?? 0;

  const kpis = [
    { label: t('leadsNovos'), value: leadCounts.new, href: '/admin/crm' },
    { label: t('conversao'), value: `${conversion}%`, href: '/admin/crm' },
    {
      label: t('propostasAguardando'),
      value: sentProposals.length,
      sub: sentValue > 0 ? fmtEur(sentValue) : undefined,
      href: '/admin/propostas',
    },
    { label: t('toursFuturos'), value: upcomingClosed.length, href: '/admin/calendario' },
    { label: t('receitaMes'), value: fmtEur(monthRevenue), href: '/admin/calendario' },
    { label: t('receitaFutura'), value: fmtEur(futureRevenue), href: '/admin/calendario' },
  ];

  const pendingActions = [
    conflictDaysCount > 0 && {
      href: '/admin/calendario',
      label: t('alertaConflitoAgenda', { count: conflictDaysCount }),
      variant: 'danger' as const,
    },
    leadCounts.new > 0 && {
      href: '/admin/crm',
      label: t('alertaLeadsSemContato', { count: leadCounts.new }),
      variant: 'warning' as const,
    },
    draftProposals > 0 && {
      href: '/admin/propostas',
      label: t('alertaPropostasRascunho', { count: draftProposals }),
      variant: 'warning' as const,
    },
    pendingAnzahlung > 0 && {
      href: '/admin/calendario',
      label: t('alertaSinalPendente', { count: pendingAnzahlung }),
      variant: 'warning' as const,
    },
    pendingReviews > 0 && {
      href: '/admin/bewertungen',
      label: t('alertaAvaliacoesModerar', { count: pendingReviews }),
      variant: 'warning' as const,
    },
  ].filter(Boolean) as Array<{ href: string; label: string; variant: 'warning' | 'danger' }>;

  const platformCards = [
    {
      label: t('membros'),
      value: profiles.length,
      sub: t('premium', { count: profiles.filter(p => p.role === 'premium').length }),
      href: '/admin/users',
    },
    {
      label: t('capitulosPublicados'),
      value: chapters.filter(c => c.status === 'published').length,
      sub: t('rascunhos', { count: chapters.filter(c => c.status === 'draft').length }),
      href: '/admin/guide',
    },
    {
      label: t('avaliacoesPendentes'),
      value: pendingReviews,
      sub: t('moderacao'),
      href: '/admin/bewertungen',
    },
  ];

  return (
    <div className="p-4 sm:p-6 md:p-10">
      <div className="max-w-[1600px]">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{t('titulo')}</h1>
          <p className="text-gray-500 mt-1">{t('subtitulo')}</p>
        </div>

        {loadError && (
          <div className="mb-4 p-3 rounded-lg text-sm bg-red-50 text-red-800 border border-red-200">
            {t('erroCarregar')}{loadError}
          </div>
        )}

        {/* Ações pendentes */}
        {pendingActions.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {pendingActions.map(action => (
              <Link
                key={action.label}
                href={action.href}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm font-medium transition-colors ${
                  action.variant === 'danger'
                    ? 'bg-red-50 border-red-200 text-red-900 hover:bg-red-100'
                    : 'bg-yellow-50 border-yellow-200 text-yellow-900 hover:bg-yellow-100'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${action.variant === 'danger' ? 'bg-red-500' : 'bg-yellow-500'}`} />
                {action.label}
              </Link>
            ))}
          </div>
        )}

        {/* KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3 mb-8">
          {kpis.map(kpi => (
            <Link
              key={kpi.label}
              href={kpi.href}
              className="bg-white rounded-xl border border-gray-200 p-4 text-center hover:border-green-300 hover:shadow-sm transition-all"
            >
              <p className="text-2xl font-bold text-gray-900">{kpi.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{kpi.label}</p>
              {kpi.sub && <p className="text-xs text-gray-400 mt-0.5">{kpi.sub}</p>}
            </Link>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Próximos tours */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800">{t('proximosTours')}</h2>
              <Link href="/admin/calendario" className="text-sm text-green-700 hover:underline">
                {t('verCalendario')}
              </Link>
            </div>
            {upcomingTours.length === 0 ? (
              <p className="text-sm text-gray-400 py-4">{t('nenhumTourFuturo')}</p>
            ) : (
              <ul className="divide-y divide-gray-100">
                {upcomingTours.slice(0, 6).map(tour => {
                  // Nome do tour é detalhe opcional (já está na proposta); o
                  // que sempre aparece aqui é a data + o cliente.
                  const details = [
                    tour.tour_name,
                    tour.pax != null ? t('paxSufixo', { pax: tour.pax }).replace(/^\s*·\s*/, '') : null,
                    tour.agreed_price != null ? fmtEur(tour.agreed_price) : null,
                  ].filter(Boolean);

                  return (
                    <li key={tour.id} className="py-2.5 flex items-center gap-3">
                      <div className="w-20 flex-shrink-0">
                        <p className="text-sm font-semibold text-gray-900">
                          {formatShortDate(tour.date)}
                        </p>
                        {tour.start_time && (
                          <p className="text-xs text-gray-500">{formatTime(tour.start_time)}</p>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {tour.lead?.name ?? t('semLead')}
                        </p>
                        {details.length > 0 && (
                          <p className="text-xs text-gray-500 truncate">{details.join(' · ')}</p>
                        )}
                      </div>
                      <div className="flex-shrink-0 flex items-center gap-1">
                        {tour.with_partner && (
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              tour.partner_name ? PARTNER_BADGE.calmo : PARTNER_BADGE.pendente
                            }`}
                            title={tour.partner_name ?? undefined}
                          >
                            {tour.partner_name
                              ? tCalendario('guiaParceiroNome', { nome: tour.partner_name })
                              : tCalendario('parceiroADefinir')}
                          </span>
                        )}
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${TOUR_DATE_STATUS_BADGE[tour.status]}`}
                        >
                          {tTourStatus(tour.status)}
                        </span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <div className="space-y-6">
            {/* Pipeline CRM */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-800">{t('pipelineCrm')}</h2>
                <Link href="/admin/crm" className="text-sm text-green-700 hover:underline">
                  {t('abrirCrm')}
                </Link>
              </div>
              <div className="space-y-2.5">
                {(Object.keys(LEAD_STATUS_BAR) as LeadStatus[]).map(status => (
                  <div key={status} className="flex items-center gap-3">
                    <span className="w-32 flex-shrink-0 text-xs text-gray-500">
                      {tLeadStatus(status)}
                    </span>
                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${LEAD_STATUS_BAR[status]}`}
                        style={{ width: `${(leadCounts[status] / maxLeadCount) * 100}%` }}
                      />
                    </div>
                    <span className="w-8 flex-shrink-0 text-right text-sm font-semibold text-gray-900">
                      {leadCounts[status]}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Propostas recentes */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-800">{t('propostasRecentes')}</h2>
                <Link href="/admin/propostas" className="text-sm text-green-700 hover:underline">
                  {t('verPropostas')}
                </Link>
              </div>
              {recentProposals.length === 0 ? (
                <p className="text-sm text-gray-400 py-4">{t('nenhumaProposta')}</p>
              ) : (
                <ul className="divide-y divide-gray-100">
                  {recentProposals.map(proposal => (
                    <li key={proposal.id} className="py-2 flex items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/admin/propostas/${proposal.id}`}
                          className="text-sm font-medium text-gray-900 truncate hover:text-green-700 block"
                        >
                          {proposal.client_name}
                        </Link>
                        <p className="text-xs text-gray-500">
                          {formatShortDate(proposal.created_at.slice(0, 10))}
                          {t('paxSufixo', { pax: proposal.pax })}
                        </p>
                      </div>
                      {proposal.total_amount != null && (
                        <span className="text-sm font-semibold text-gray-900 flex-shrink-0">
                          {fmtEur(proposal.total_amount)}
                        </span>
                      )}
                      <span
                        className={`flex-shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold ${PROPOSAL_STATUS_BADGE[proposal.status]}`}
                      >
                        {tProposalStatus(proposal.status)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        {/* Plataforma */}
        <h2 className="text-lg font-semibold text-gray-800 mb-4">{t('plataforma')}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {platformCards.map(card => (
            <Link
              key={card.label}
              href={card.href}
              className="bg-white rounded-xl border border-gray-200 p-5 hover:border-green-300 hover:shadow-sm transition-all"
            >
              <p className="text-sm text-gray-500 mb-1">{card.label}</p>
              <p className="text-2xl md:text-3xl font-bold text-gray-900">{card.value}</p>
              <p className="text-xs text-gray-400 mt-1">{card.sub}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

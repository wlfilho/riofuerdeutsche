// src/app/admin/analytics/page.tsx
//
// Painel de tráfego do site: GA4 + tabelas próprias de evento. Não confundir
// com /admin/propostas/analytics (leitura das propostas) nem com /admin
// (operação do dia). Janela fixa de 30 dias, sem seletor de período.
//
// Duas fontes, com alcances diferentes, e a página é explícita sobre isso:
//
//   - GA4 só mede quem aceitou o banner de cookies, então tudo que vem de lá
//     é piso, não total;
//   - anfrage_events / consent_events / price_leads são coleta própria e
//     medem todo mundo. A seção de cookies existe justamente pra dar a
//     proporção que falta no GA4.
//
// Os dias são agrupados no fuso do Rio porque é o fuso da property do GA4: o
// servidor roda em UTC e, sem isso, as barras do Supabase ficariam deslocadas
// em relação à linha do GA4 nas últimas 3 horas de cada dia.

import { createClient } from '@supabase/supabase-js';
import { getAdminTranslations } from '@/i18n/admin';
import { fmtNumber } from '@/lib/adminFormat';
import {
  ga4Dimension,
  ga4Metric,
  ga4RunReportFiltered,
  type Ga4Row,
} from '@/lib/ga4';
import {
  LeadsChart,
  OverviewChart,
  type LeadsPoint,
  type OverviewPoint,
} from '@/components/admin/AnalyticsCharts';
import { SERIES_COLORS } from '@/lib/analyticsColors';

export async function generateMetadata() {
  const t = await getAdminTranslations('admin.analytics');
  return { title: t('metaTitle') };
}

export const dynamic = 'force-dynamic';

// anfrage_events e consent_events têm RLS sem policy: só a service role lê.
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

const DAYS = 30;
const TIMEZONE = 'America/Sao_Paulo';
const WHATSAPP_EVENT = 'contact_whatsapp';
const TOP_PAGES = 10;

const dayFormatter = new Intl.DateTimeFormat('en-CA', { timeZone: TIMEZONE });

/** Instante ISO do banco → dia no fuso do Rio, 'YYYY-MM-DD'. */
function dayInRio(iso: string): string {
  return dayFormatter.format(new Date(iso));
}

/** Os últimos `n` dias do Rio em ordem cronológica, incluindo hoje. */
function lastDays(n: number): string[] {
  // Meio-dia UTC como âncora: sobra folga em qualquer offset, então somar
  // múltiplos de 24h nunca pula nem repete um dia.
  const base = Date.parse(`${dayFormatter.format(new Date())}T12:00:00Z`);
  return Array.from({ length: n }, (_, i) =>
    new Date(base - (n - 1 - i) * 86_400_000).toISOString().slice(0, 10),
  );
}

/** '20260914' (dimensão `date` do GA4) → '2026-09-14'. */
function ga4DateToISO(value: string): string {
  return `${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6, 8)}`;
}

function pct(part: number, total: number): number {
  return total > 0 ? Math.round((part / total) * 100) : 0;
}

const GA4_RANGE = [{ startDate: `${DAYS - 1}daysAgo`, endDate: 'today' }];

// ── Blocos de layout ───────────────────────────────────────────────────────

function Section({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="bg-white rounded-xl border border-gray-200 p-5">
      <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wide">{title}</h2>
      {hint && <p className="mt-1 text-xs text-gray-400">{hint}</p>}
      <div className="mt-4">{children}</div>
    </section>
  );
}

/**
 * Cartão de total que também é a legenda da série: quadradinho colorido, nome
 * e número juntos. Com isso a identidade da série nunca depende só da cor.
 */
function SeriesCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="rounded-lg border border-gray-200 p-3">
      <p className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase">
        <span
          className="w-2.5 h-2.5 rounded-sm flex-shrink-0"
          style={{ backgroundColor: color }}
          aria-hidden="true"
        />
        {label}
      </p>
      <p className="mt-1 text-2xl font-bold text-gray-900 tabular-nums">{fmtNumber(value)}</p>
    </div>
  );
}

/** Linha de lista com barra de proporção — usada em origem e páginas. */
function RankedRow({
  label,
  value,
  max,
  suffix,
}: {
  label: string;
  value: number;
  max: number;
  suffix?: string;
}) {
  const width = max > 0 ? (value / max) * 100 : 0;
  return (
    <li className="flex items-center gap-3">
      <span className="w-40 sm:w-64 shrink-0 truncate text-sm text-gray-700" title={label}>
        {label}
      </span>
      <span className="flex-1 h-5 bg-gray-100 rounded-md overflow-hidden">
        <span
          className="block h-full bg-green-600 rounded-md"
          style={{ width: `${Math.max(width, value > 0 ? 2 : 0)}%` }}
        />
      </span>
      <span className="w-20 shrink-0 text-right text-sm text-gray-800 tabular-nums">
        <span className="font-semibold">{fmtNumber(value)}</span>
        {suffix && <span className="text-gray-400"> · {suffix}</span>}
      </span>
    </li>
  );
}

/** Etapa do funil da /anfrage: número grande + taxa em relação à etapa anterior. */
function FunnelStep({
  label,
  value,
  rate,
}: {
  label: string;
  value: number;
  rate?: string;
}) {
  return (
    <div className="flex items-baseline justify-between gap-3 py-2 border-b border-gray-100 last:border-0">
      <span className="text-sm text-gray-600">{label}</span>
      <span className="flex items-baseline gap-2">
        {rate && <span className="text-xs text-gray-400 tabular-nums">{rate}</span>}
        <span className="text-xl font-bold text-gray-900 tabular-nums">{fmtNumber(value)}</span>
      </span>
    </div>
  );
}

// ── Página ─────────────────────────────────────────────────────────────────

export default async function AnalyticsPage() {
  const t = await getAdminTranslations('admin.analytics');

  const days = lastDays(DAYS);
  // 00:00Z do primeiro dia é sempre ANTES de 00:00 no Rio (offset negativo):
  // pega o dia inteiro com folga, e o agrupamento por dayInRio descarta o que
  // sobrou do dia anterior.
  const since = `${days[0]}T00:00:00Z`;

  const results = await Promise.allSettled([
    // 0 — visão geral por dia
    ga4RunReportFiltered({
      dateRanges: GA4_RANGE,
      dimensions: [{ name: 'date' }],
      metrics: [{ name: 'sessions' }, { name: 'totalUsers' }, { name: 'screenPageViews' }],
      orderBys: [{ dimension: { dimensionName: 'date' } }],
      limit: DAYS + 1,
    }),
    // 1 — cliques no WhatsApp
    ga4RunReportFiltered({
      dateRanges: GA4_RANGE,
      dimensions: [{ name: 'eventName' }],
      metrics: [{ name: 'eventCount' }],
      dimensionFilter: {
        filter: {
          fieldName: 'eventName',
          stringFilter: { matchType: 'EXACT', value: WHATSAPP_EVENT },
        },
      },
      limit: 1,
    }),
    // 2 — origem do tráfego
    ga4RunReportFiltered({
      dateRanges: GA4_RANGE,
      dimensions: [{ name: 'sessionDefaultChannelGroup' }],
      metrics: [{ name: 'sessions' }],
      orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
      limit: 20,
    }),
    // 3 — páginas mais vistas, sem o admin.
    // `pagePath` já vem sem query string (pagePathWithoutQueryString não
    // existe na Data API; a variante com query é pagePathPlusQueryString).
    ga4RunReportFiltered({
      dateRanges: GA4_RANGE,
      dimensions: [{ name: 'pagePath' }],
      metrics: [{ name: 'screenPageViews' }],
      dimensionFilter: {
        notExpression: {
          filter: {
            fieldName: 'pagePath',
            stringFilter: { matchType: 'BEGINS_WITH', value: '/admin' },
          },
        },
      },
      orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
      limit: TOP_PAGES,
    }),
    // 4 — funil da /anfrage
    supabaseAdmin.from('anfrage_events').select('event_type').gte('created_at', since),
    // 5 — leads por dia (campanha tem funil próprio, fica de fora)
    supabaseAdmin
      .from('price_leads')
      .select('created_at')
      .is('campaign', null)
      .gte('created_at', since),
    // 6 — cookies, histórico inteiro: a tabela é nova e 30 dias quase não teriam dado
    supabaseAdmin.from('consent_events').select('choice'),
  ]);

  /** Linhas de um relatório do GA4, ou [] se aquela consulta falhou. */
  function ga4Rows(index: number): Ga4Row[] {
    const r = results[index];
    return r.status === 'fulfilled' ? ((r.value as { rows?: Ga4Row[] }).rows ?? []) : [];
  }

  function sbRows<T>(index: number): T[] {
    const r = results[index];
    if (r.status !== 'fulfilled') return [];
    return ((r.value as { data?: T[] }).data ?? []) as T[];
  }

  // Erros: GA4 e Supabase caem em avisos separados porque as seções que
  // dependem de cada um são diferentes — uma falha não deve esconder a outra.
  const ga4Error = [0, 1, 2, 3]
    .map(i => {
      const r = results[i];
      return r.status === 'rejected'
        ? r.reason instanceof Error
          ? r.reason.message
          : String(r.reason)
        : null;
    })
    .find(Boolean);

  const dbError = [4, 5, 6]
    .map(i => {
      const r = results[i];
      if (r.status === 'rejected') {
        return r.reason instanceof Error ? r.reason.message : String(r.reason);
      }
      return (r.value as { error?: { message: string } | null }).error?.message ?? null;
    })
    .find(Boolean);

  // ── 3a. Visão geral ──
  const ga4ByDay = new Map(
    ga4Rows(0).map(row => [
      ga4DateToISO(ga4Dimension(row)),
      {
        sessions: ga4Metric(row, 0),
        users: ga4Metric(row, 1),
        pageViews: ga4Metric(row, 2),
      },
    ]),
  );
  const overview: OverviewPoint[] = days.map(date => ({
    date,
    sessions: ga4ByDay.get(date)?.sessions ?? 0,
    users: ga4ByDay.get(date)?.users ?? 0,
    pageViews: ga4ByDay.get(date)?.pageViews ?? 0,
  }));
  const totals = overview.reduce(
    (acc, p) => ({
      sessions: acc.sessions + p.sessions,
      users: acc.users + p.users,
      pageViews: acc.pageViews + p.pageViews,
    }),
    { sessions: 0, users: 0, pageViews: 0 },
  );

  // ── 3b. Funil de contato ──
  const anfrageEvents = sbRows<{ event_type: string }>(4);
  const anfrage = {
    view: anfrageEvents.filter(e => e.event_type === 'view').length,
    start: anfrageEvents.filter(e => e.event_type === 'start').length,
    submit: anfrageEvents.filter(e => e.event_type === 'submit').length,
  };
  const whatsappClicks = ga4Metric(ga4Rows(1)[0] ?? {});

  // ── 3c. Origem do tráfego ──
  const channels = ga4Rows(2).map(row => ({
    label: ga4Dimension(row) || t('origemSemNome'),
    sessions: ga4Metric(row),
  }));
  const channelTotal = channels.reduce((sum, c) => sum + c.sessions, 0);
  const channelMax = Math.max(0, ...channels.map(c => c.sessions));

  // ── 3d. Páginas mais vistas ──
  const pages = ga4Rows(3).map(row => ({
    path: ga4Dimension(row),
    views: ga4Metric(row),
  }));
  const pageMax = Math.max(0, ...pages.map(p => p.views));

  // ── 3e. Leads por dia ──
  const leadsByDay = new Map<string, number>();
  for (const lead of sbRows<{ created_at: string }>(5)) {
    const day = dayInRio(lead.created_at);
    leadsByDay.set(day, (leadsByDay.get(day) ?? 0) + 1);
  }
  const leadsSeries: LeadsPoint[] = days.map(date => ({
    date,
    leads: leadsByDay.get(date) ?? 0,
  }));
  const leadsTotal = leadsSeries.reduce((sum, d) => sum + d.leads, 0);

  // ── 3f. Cookies ──
  const consent = sbRows<{ choice: string }>(6);
  const accepted = consent.filter(c => c.choice === 'accepted').length;
  const rejected = consent.filter(c => c.choice === 'rejected').length;
  const consentTotal = accepted + rejected;

  return (
    <div className="p-4 sm:p-6 md:p-10">
      <div className="max-w-6xl">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{t('titulo')}</h1>
        <p className="text-sm text-gray-500 mt-1 mb-6">{t('subtitulo', { dias: DAYS })}</p>

        {ga4Error && (
          <div className="mb-4 p-3 rounded-lg text-sm bg-red-50 text-red-800 border border-red-200">
            {t('erroGa4')}{ga4Error}
          </div>
        )}
        {dbError && (
          <div className="mb-4 p-3 rounded-lg text-sm bg-red-50 text-red-800 border border-red-200">
            {t('erroBanco')}{dbError}
          </div>
        )}

        <div className="space-y-5">
          {/* ── 3a. Visão geral ── */}
          <Section title={t('visaoGeralTitulo')} hint={t('notaGa4')}>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
              <SeriesCard
                label={t('sessoes')}
                value={totals.sessions}
                color={SERIES_COLORS.sessions}
              />
              <SeriesCard
                label={t('usuarios')}
                value={totals.users}
                color={SERIES_COLORS.users}
              />
              <SeriesCard
                label={t('pageviews')}
                value={totals.pageViews}
                color={SERIES_COLORS.pageViews}
              />
            </div>
            <OverviewChart
              data={overview}
              labels={{
                sessions: t('sessoes'),
                users: t('usuarios'),
                pageViews: t('pageviews'),
              }}
            />
          </Section>

          {/* ── 3b. Funil de contato ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <Section title={t('anfrageTitulo')} hint={t('anfrageHint')}>
              <FunnelStep label={t('anfrageView')} value={anfrage.view} />
              <FunnelStep
                label={t('anfrageStart')}
                value={anfrage.start}
                rate={t('taxa', { pct: pct(anfrage.start, anfrage.view) })}
              />
              <FunnelStep
                label={t('anfrageSubmit')}
                value={anfrage.submit}
                rate={t('taxa', { pct: pct(anfrage.submit, anfrage.start) })}
              />
              <p className="mt-3 text-xs text-gray-400">
                {t('anfrageTotal', { pct: pct(anfrage.submit, anfrage.view) })}
              </p>
            </Section>

            <Section title={t('whatsappTitulo')} hint={t('notaGa4')}>
              <p className="text-3xl font-bold text-gray-900 tabular-nums">
                {fmtNumber(whatsappClicks)}
              </p>
              <p className="mt-1 text-sm text-gray-600">{t('whatsappCliques')}</p>
              <p className="mt-3 text-xs text-gray-400">{t('whatsappNota')}</p>
            </Section>
          </div>

          {/* ── 3c. Origem do tráfego ── */}
          <Section title={t('origemTitulo')} hint={t('notaGa4')}>
            {channels.length === 0 ? (
              <p className="text-sm text-gray-400">{t('semDados')}</p>
            ) : (
              <ul className="space-y-1.5">
                {channels.map(c => (
                  <RankedRow
                    key={c.label}
                    label={c.label}
                    value={c.sessions}
                    max={channelMax}
                    suffix={`${pct(c.sessions, channelTotal)}%`}
                  />
                ))}
              </ul>
            )}
          </Section>

          {/* ── 3d. Páginas mais vistas ── */}
          <Section title={t('paginasTitulo', { n: TOP_PAGES })} hint={t('paginasHint')}>
            {pages.length === 0 ? (
              <p className="text-sm text-gray-400">{t('semDados')}</p>
            ) : (
              <ul className="space-y-1.5">
                {pages.map(p => (
                  <RankedRow key={p.path} label={p.path} value={p.views} max={pageMax} />
                ))}
              </ul>
            )}
          </Section>

          {/* ── 3e. Leads por dia ── */}
          <Section
            title={t('leadsTitulo')}
            hint={t('leadsHint', { total: fmtNumber(leadsTotal), dias: DAYS })}
          >
            <LeadsChart data={leadsSeries} label={t('leads')} />
          </Section>

          {/* ── 3f. Cookies ── */}
          <Section title={t('cookiesTitulo')} hint={t('cookiesHint')}>
            {consentTotal === 0 ? (
              <p className="text-sm text-gray-400">{t('semDados')}</p>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-3xl font-bold text-gray-900 tabular-nums">
                    {pct(accepted, consentTotal)}%
                  </p>
                  <p className="mt-0.5 text-sm text-gray-600">
                    {t('cookiesAceitos', { n: fmtNumber(accepted) })}
                  </p>
                  <div className="mt-2 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-600 rounded-full"
                      style={{ width: `${pct(accepted, consentTotal)}%` }}
                    />
                  </div>
                </div>
                <div>
                  <p className="text-3xl font-bold text-gray-900 tabular-nums">
                    {pct(rejected, consentTotal)}%
                  </p>
                  <p className="mt-0.5 text-sm text-gray-600">
                    {t('cookiesRecusados', { n: fmtNumber(rejected) })}
                  </p>
                  <div className="mt-2 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gray-400 rounded-full"
                      style={{ width: `${pct(rejected, consentTotal)}%` }}
                    />
                  </div>
                </div>
              </div>
            )}
          </Section>
        </div>
      </div>
    </div>
  );
}

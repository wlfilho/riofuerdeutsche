import Link from 'next/link';
import { getAdminTranslations } from '@/i18n/admin';
import { getProposals, type Proposal, type ProposalStatus } from '@/lib/proposals';
import {
  fmtDuration,
  getProposalAnalyticsSummaries,
  type ProposalAnalyticsSummary,
} from '@/lib/proposalAnalytics';
import { fmtDateTime } from '@/lib/adminFormat';

/**
 * Visão agregada dos analytics de leitura: funil de engajamento de todas as
 * propostas + tabela por proposta. O detalhe por sessão fica em
 * /admin/propostas/[id]/estatisticas.
 */

const STATUS_CLASSNAME: Record<ProposalStatus, string> = {
  draft: 'bg-gray-100 text-gray-600',
  sent: 'bg-blue-100 text-blue-700',
  accepted: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
};

function StatCard({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <p className="text-xs font-semibold text-gray-500 uppercase">{label}</p>
      <p className="mt-1 text-2xl font-bold text-gray-900 tabular-nums">{value}</p>
      {hint && <p className="mt-0.5 text-xs text-gray-400">{hint}</p>}
    </div>
  );
}

// Barra do funil: série única no verde do admin, número direto no rótulo (a
// identidade nunca depende só da cor), largura proporcional ao topo do funil.
function FunnelBar({ label, count, total }: { label: string; count: number; total: number }) {
  const pct = total > 0 ? (count / total) * 100 : 0;
  return (
    <div className="flex items-center gap-3">
      <div className="w-40 shrink-0 text-sm text-gray-600">{label}</div>
      <div className="flex-1 h-7 bg-gray-100 rounded-md overflow-hidden">
        <div
          className="h-full bg-green-600 rounded-md min-w-[2px] transition-all"
          style={{ width: `${Math.max(pct, count > 0 ? 2 : 0)}%` }}
        />
      </div>
      <div className="w-24 shrink-0 text-sm text-gray-800 tabular-nums">
        <span className="font-semibold">{count}</span>
        <span className="text-gray-400"> · {total > 0 ? Math.round(pct) : 0}%</span>
      </div>
    </div>
  );
}

function hasIntent(s: ProposalAnalyticsSummary): boolean {
  return s.contact_clicks > 0 || s.bank_copy_clicks > 0;
}

function wasShared(s: ProposalAnalyticsSummary): boolean {
  return s.unique_visitors > 1 || s.share_clicks > 0;
}

export default async function PropostasAnalyticsPage() {
  const t = await getAdminTranslations('admin.propostas.analyticsPage');
  const tStatus = await getAdminTranslations('admin.status.proposal');
  const [proposals, analytics] = await Promise.all([
    getProposals(),
    getProposalAnalyticsSummaries(),
  ]);

  // Funil sobre propostas que saíram do rascunho — as que o cliente pode ter
  // recebido. Rascunho aparece na tabela, mas não distorce as taxas.
  const sent = proposals.filter(p => p.status !== 'draft');
  const opened = sent.filter(p => (analytics[p.id]?.sessions ?? 0) > 0);
  const sawPrice = sent.filter(p => analytics[p.id]?.saw_price);
  const intent = sent.filter(p => analytics[p.id] && hasIntent(analytics[p.id]));
  const shared = sent.filter(p => analytics[p.id] && wasShared(analytics[p.id]));

  const openRate = sent.length > 0 ? Math.round((opened.length / sent.length) * 100) : 0;

  // Tabela: quem tem leitura primeiro (última visita desc); o resto por criação.
  const rows = [...proposals].sort((a, b) => {
    const la = analytics[a.id]?.last_view_at ?? '';
    const lb = analytics[b.id]?.last_view_at ?? '';
    if (la !== lb) return lb.localeCompare(la);
    return (b.created_at ?? '').localeCompare(a.created_at ?? '');
  });

  const signalChips = (p: Proposal): string[] => {
    const s = analytics[p.id];
    if (!s) return [];
    const chips: string[] = [];
    if (s.saw_price) chips.push(t('chipPreco'));
    if (s.saw_bank) chips.push(t('chipBanco'));
    if (s.bank_copy_clicks > 0) chips.push(t('chipCopiouIban'));
    if (s.contact_clicks > 0) chips.push(t('chipContato', { count: s.contact_clicks }));
    if (wasShared(s)) chips.push(t('chipCompartilhada'));
    return chips;
  };

  return (
    <div className="p-4 sm:p-6 md:p-10">
      <div className="max-w-6xl">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-1">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{t('titulo')}</h1>
          <Link
            href="/admin/propostas"
            className="px-3 py-1.5 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            {t('voltar')}
          </Link>
        </div>
        <p className="text-sm text-gray-500 mb-6">{t('subtitulo')}</p>

        {/* ── KPIs ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          <StatCard label={t('kpiEnviadas')} value={String(sent.length)} hint={t('kpiEnviadasHint')} />
          <StatCard
            label={t('kpiAbertas')}
            value={String(opened.length)}
            hint={t('kpiTaxaAbertura', { pct: openRate })}
          />
          <StatCard label={t('kpiViramPreco')} value={String(sawPrice.length)} />
          <StatCard label={t('kpiCompartilhadas')} value={String(shared.length)} />
        </div>

        {/* ── Funil ── */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
          <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-4">
            {t('funilTitulo')}
          </h2>
          <div className="space-y-2.5">
            <FunnelBar label={t('funilEnviadas')} count={sent.length} total={sent.length} />
            <FunnelBar label={t('funilAbertas')} count={opened.length} total={sent.length} />
            <FunnelBar label={t('funilViramPreco')} count={sawPrice.length} total={sent.length} />
            <FunnelBar label={t('funilIntencao')} count={intent.length} total={sent.length} />
          </div>
          <p className="mt-4 text-xs text-gray-400">{t('funilNota')}</p>
        </div>

        {/* ── Por proposta ── */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{t('colProposta')}</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{t('colStatus')}</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{t('colAberturas')}</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{t('colVisitantes')}</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{t('colTempo')}</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{t('colScroll')}</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{t('colSinais')}</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{t('colUltimaVisita')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {rows.map(p => {
                  const s = analytics[p.id];
                  return (
                    <tr key={p.id} className="hover:bg-gray-50 align-top">
                      <td className="px-4 py-3">
                        <Link
                          href={`/admin/propostas/${p.id}/estatisticas`}
                          className="font-medium text-gray-900 hover:text-green-700 hover:underline"
                        >
                          {p.client_name}
                        </Link>
                        {p.internal_label && (
                          <span className="block mt-0.5">
                            <span className="inline-block px-1.5 py-0.5 text-[11px] font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded">
                              {p.internal_label}
                            </span>
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-block px-2 py-0.5 text-xs font-semibold rounded-full ${STATUS_CLASSNAME[p.status]}`}>
                          {tStatus(p.status)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-gray-700 tabular-nums">
                        {s ? s.sessions : <span className="text-gray-300">—</span>}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums">
                        {s ? (
                          <span className={s.unique_visitors > 1 ? 'font-semibold text-amber-700' : 'text-gray-700'}>
                            {s.unique_visitors}
                          </span>
                        ) : (
                          <span className="text-gray-300">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right text-gray-700 tabular-nums whitespace-nowrap">
                        {s ? fmtDuration(s.total_active_seconds) : <span className="text-gray-300">—</span>}
                      </td>
                      <td className="px-4 py-3 text-right text-gray-700 tabular-nums">
                        {s ? `${Math.round(s.max_scroll_pct)}%` : <span className="text-gray-300">—</span>}
                      </td>
                      <td className="px-4 py-3">
                        {signalChips(p).length === 0 ? (
                          <span className="text-gray-300">—</span>
                        ) : (
                          <div className="flex flex-wrap gap-1">
                            {signalChips(p).map(chip => (
                              <span
                                key={chip}
                                className="inline-block px-2 py-0.5 text-[11px] font-medium rounded-full border bg-green-50 text-green-700 border-green-200"
                              >
                                {chip}
                              </span>
                            ))}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-700 whitespace-nowrap tabular-nums">
                        {s?.last_view_at ? fmtDateTime(s.last_view_at) : <span className="text-gray-300">—</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <p className="mt-3 text-xs text-gray-400">{t('rodapeNota')}</p>
      </div>
    </div>
  );
}

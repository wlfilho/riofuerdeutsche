import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getAdminTranslations } from '@/i18n/admin';
import { getProposalById } from '@/lib/proposals';
import {
  describeDevice,
  describeOrigin,
  getProposalSessionStats,
  type ProposalSessionStat,
} from '@/lib/proposalAnalytics';
import { fmtDateTime, fmtDuration } from '@/lib/adminFormat';

/**
 * Estatísticas de leitura da proposta pelo cliente: cada sessão do link
 * público vira uma linha; os cards resumem o engajamento. Dados de
 * proposal_events via views (RLS admin-only).
 */

// Rótulos fixos dos identificadores técnicos de clique — não são i18n porque
// espelham os data-track-click do ProposalPage, não texto de UI reutilizável.
const CLICK_LABELS: Record<string, string> = {
  whatsapp_cta: 'CTA WhatsApp',
  deposit_cta: 'CTA Sinal',
  whatsapp_contact: 'WhatsApp (contato)',
  email_contact: 'E-mail (contato)',
  share_whatsapp: 'Share WhatsApp',
  share_telegram: 'Share Telegram',
  share_email: 'Share e-mail',
  share_copy: 'Copiou o link',
  share_native: 'Share nativo',
  copy_iban: 'Copiou IBAN',
  copy_bic: 'Copiou BIC',
  copy_holder: 'Copiou titular',
  copy_bank_name: 'Copiou banco',
};

const SECTION_LABELS: Record<string, string> = {
  overview: 'Visão geral',
  program: 'Programa',
  price: 'Preço',
  bank: 'Dados bancários',
  contact: 'Contato',
  share: 'Compartilhar',
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

function Chip({ children, tone }: { children: React.ReactNode; tone: 'green' | 'gray' | 'amber' }) {
  const cls = {
    green: 'bg-green-50 text-green-700 border-green-200',
    gray: 'bg-gray-50 text-gray-500 border-gray-200',
    amber: 'bg-amber-50 text-amber-700 border-amber-200',
  }[tone];
  return (
    <span className={`inline-block px-2 py-0.5 text-[11px] font-medium rounded-full border ${cls}`}>
      {children}
    </span>
  );
}

export default async function PropostaEstatisticasPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const t = await getAdminTranslations('admin.propostas.stats');
  const [proposal, sessions] = await Promise.all([
    getProposalById(id),
    getProposalSessionStats(id),
  ]);
  if (!proposal) redirect('/admin/propostas');

  // "Visitante 1, 2, …" na ordem em que cada aparelho apareceu pela primeira vez.
  const visitorLabels = new Map<string, number>();
  for (const s of [...sessions].sort((a, b) => a.started_at.localeCompare(b.started_at))) {
    if (!visitorLabels.has(s.visitor_id)) visitorLabels.set(s.visitor_id, visitorLabels.size + 1);
  }

  const uniqueVisitors = visitorLabels.size;
  const totalActive = sessions.reduce((sum, s) => sum + s.active_seconds, 0);
  const maxScroll = sessions.reduce((max, s) => Math.max(max, s.scroll_pct), 0);
  const sawPrice = sessions.some(s => s.saw_price);
  const sawBank = sessions.some(s => s.saw_bank);
  const contactClicks = sessions.reduce((sum, s) => sum + s.contact_clicks, 0);
  const shareClicks = sessions.reduce((sum, s) => sum + s.share_clicks, 0);
  const bankCopyClicks = sessions.reduce((sum, s) => sum + s.bank_copy_clicks, 0);
  const likelyShared = uniqueVisitors > 1 || shareClicks > 0;

  const sessionSections = (s: ProposalSessionStat) =>
    s.sections.map(sec => SECTION_LABELS[sec] ?? sec);
  const sessionClicks = (s: ProposalSessionStat) => {
    // Cliques repetidos no mesmo alvo viram "×N" em vez de N chips iguais.
    const counts = new Map<string, number>();
    for (const target of s.click_targets) counts.set(target, (counts.get(target) ?? 0) + 1);
    return [...counts.entries()].map(([target, count]) =>
      `${CLICK_LABELS[target] ?? target}${count > 1 ? ` ×${count}` : ''}`,
    );
  };

  return (
    <div className="p-4 sm:p-6 md:p-10">
      <div className="max-w-5xl">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-1">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{t('titulo')}</h1>
          <div className="flex items-center gap-2">
            <Link
              href={`/admin/propostas/${proposal.id}/output`}
              className="px-3 py-1.5 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {t('verProposta')}
            </Link>
            <Link
              href="/admin/propostas"
              className="px-3 py-1.5 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {t('voltar')}
            </Link>
          </div>
        </div>
        <p className="text-sm text-gray-500 mb-6">
          {proposal.client_name}
          {proposal.internal_label && (
            <span className="ml-2 px-1.5 py-0.5 text-[11px] font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded">
              {proposal.internal_label}
            </span>
          )}
        </p>

        {sessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center bg-white rounded-xl border border-gray-200">
            <div className="text-5xl mb-4">👀</div>
            <p className="text-gray-500 text-sm">{t('semVisualizacoes')}</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
              <StatCard label={t('cardAberturas')} value={String(sessions.length)} />
              <StatCard
                label={t('cardVisitantes')}
                value={String(uniqueVisitors)}
                hint={likelyShared ? t('provavelCompartilhada') : undefined}
              />
              <StatCard label={t('cardTempoLeitura')} value={fmtDuration(totalActive)} />
              <StatCard label={t('cardScrollMax')} value={`${Math.round(maxScroll)}%`} />
            </div>

            <div className="flex flex-wrap gap-2 mb-6">
              <Chip tone={sawPrice ? 'green' : 'gray'}>
                {sawPrice ? '✓' : '·'} {t('sinalViuPreco')}
              </Chip>
              <Chip tone={sawBank ? 'green' : 'gray'}>
                {sawBank ? '✓' : '·'} {t('sinalViuBanco')}
              </Chip>
              <Chip tone={bankCopyClicks > 0 ? 'green' : 'gray'}>
                {bankCopyClicks > 0 ? '✓' : '·'} {t('sinalCopiouBanco')}
              </Chip>
              <Chip tone={contactClicks > 0 ? 'green' : 'gray'}>
                {t('sinalCliquesContato', { count: contactClicks })}
              </Chip>
              <Chip tone={shareClicks > 0 ? 'amber' : 'gray'}>
                {t('sinalCompartilhamentos', { count: shareClicks })}
              </Chip>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{t('colQuando')}</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{t('colVisitante')}</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{t('colAparelho')}</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{t('colOrigem')}</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{t('colTempo')}</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{t('colScroll')}</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{t('colSecoes')}</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{t('colAcoes')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {sessions.map(s => (
                      <tr key={s.session_id} className="hover:bg-gray-50 align-top">
                        <td className="px-4 py-3 text-gray-700 whitespace-nowrap tabular-nums">
                          {fmtDateTime(s.started_at)}
                        </td>
                        <td className="px-4 py-3 text-gray-700 whitespace-nowrap">
                          {t('visitanteN', { n: visitorLabels.get(s.visitor_id) ?? 0 })}
                        </td>
                        <td className="px-4 py-3 text-gray-700 whitespace-nowrap">
                          {describeDevice(s.user_agent)}
                        </td>
                        <td className="px-4 py-3 text-gray-700 whitespace-nowrap">
                          {(() => {
                            const origin = describeOrigin(s.country, s.city, s.tz);
                            if (!origin) return <span className="text-gray-400">—</span>;
                            return (
                              <span
                                title={origin.detail || undefined}
                                className={origin.fromTz ? 'text-gray-400' : undefined}
                              >
                                {origin.label}
                                {origin.tzMismatch && (
                                  <span className="ml-1 text-amber-600" title={t('origemDivergente')}>
                                    ⚠
                                  </span>
                                )}
                              </span>
                            );
                          })()}
                        </td>
                        <td className="px-4 py-3 text-right text-gray-700 tabular-nums whitespace-nowrap">
                          {fmtDuration(s.active_seconds)}
                        </td>
                        <td className="px-4 py-3 text-right text-gray-700 tabular-nums">
                          {Math.round(s.scroll_pct)}%
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1">
                            {sessionSections(s).length === 0 ? (
                              <span className="text-gray-400">—</span>
                            ) : (
                              sessionSections(s).map(label => (
                                <Chip key={label} tone="gray">{label}</Chip>
                              ))
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1">
                            {sessionClicks(s).length === 0 ? (
                              <span className="text-gray-400">—</span>
                            ) : (
                              sessionClicks(s).map(label => (
                                <Chip key={label} tone="green">{label}</Chip>
                              ))
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <p className="mt-3 text-xs text-gray-400">{t('rodapeNota')}</p>
          </>
        )}
      </div>
    </div>
  );
}

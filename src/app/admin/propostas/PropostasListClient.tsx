'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { fmtEur } from '@/lib/adminFormat';
import type { Proposal, ProposalStatus } from '@/lib/proposals';
import type { ProposalAnalyticsSummary } from '@/lib/proposalAnalytics';


// Dias de tour reais da proposta (únicos, ordenados), extraídos dos itens —
// chegada/partida são só derivações (primeiro/último dia) e não interessam.
function getTourDays(p: Proposal): string[] {
  return [...new Set(p.items.map(i => i.day))].sort();
}

// Chip curto da tabela do admin (dd/MM); não vai pro texto do cliente.
function formatShortDay(iso: string): string {
  const [, m, d] = iso.split('-');
  return `${d}/${m}`;
}

// Link público enviado ao cliente — mesmo formato de PropostaOutputClient
// (domínio canônico, rota neutra /{locale}/p/{token}). O 'de' é inline porque
// importar o default de @/lib/proposals arrastaria o client Supabase de
// servidor para o bundle do browser.
function publicProposalUrl(p: Proposal): string {
  return `https://riofuerdeutsche.de/${p.locale || 'de'}/p/${p.public_token}`;
}

// Só a aparência: o rótulo vem de admin.status.proposal e o valor (draft/sent/
// accepted/rejected) segue sendo o do banco.
const STATUS_CLASSNAME: Record<ProposalStatus, string> = {
  draft: 'bg-gray-100 text-gray-600',
  sent: 'bg-blue-100 text-blue-700',
  accepted: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
};

function StatusBadge({ status }: { status: ProposalStatus }) {
  const tStatus = useTranslations('admin.status.proposal');
  return (
    <span className={`inline-block px-2 py-0.5 text-xs font-semibold rounded-full ${STATUS_CLASSNAME[status]}`}>
      {tStatus(status)}
    </span>
  );
}

function Toast({ message, onDone }: { message: string; onDone: () => void }) {
  useState(() => {
    const t = setTimeout(onDone, 3000);
    return () => clearTimeout(t);
  });
  return (
    <div className="fixed bottom-6 right-6 z-50 px-4 py-3 bg-gray-900 text-white text-sm rounded-xl shadow-lg">
      {message}
    </div>
  );
}

function DeleteModal({
  proposal,
  onCancel,
  onConfirm,
  loading,
}: {
  proposal: Proposal;
  onCancel: () => void;
  onConfirm: () => void;
  loading: boolean;
}) {
  const t = useTranslations('admin.propostas');
  const tCommon = useTranslations('admin.common');
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-2">{t('propostaExcluir')}</h2>
        <p className="text-sm text-gray-600 mb-6">
          {t.rich('propostaSeraExcluida', {
            nome: proposal.client_name,
            strong: chunks => <strong>{chunks}</strong>,
          })}
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            {tCommon('cancelar')}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
          >
            {loading ? t('excluindo') : tCommon('excluir')}
          </button>
        </div>
      </div>
    </div>
  );
}

// Badge de leitura na lista: aberturas + visitantes distintos (>1 ≈ o link
// circulou além do destinatário) e a última visualização. Clica → estatísticas.
function ViewsBadge({ proposalId, summary }: { proposalId: string; summary?: ProposalAnalyticsSummary }) {
  const t = useTranslations('admin.propostas');
  if (!summary || summary.sessions === 0) {
    return <span className="text-gray-300">—</span>;
  }
  const lastView = summary.last_view_at
    ? new Date(summary.last_view_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
    : null;
  return (
    <Link
      href={`/admin/propostas/${proposalId}/estatisticas`}
      title={t('verEstatisticas')}
      className="group inline-block"
    >
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-xs font-semibold text-blue-700 tabular-nums group-hover:bg-blue-100 transition-colors">
        👁 {summary.sessions}
        {summary.unique_visitors > 1 && (
          <span className="font-normal text-blue-500">· {t('nPessoas', { count: summary.unique_visitors })}</span>
        )}
      </span>
      {lastView && (
        <span className="block mt-0.5 text-[11px] text-gray-400 tabular-nums">{lastView}</span>
      )}
    </Link>
  );
}

export default function PropostasListClient({
  initialProposals,
  analytics = {},
}: {
  initialProposals: Proposal[];
  analytics?: Record<string, ProposalAnalyticsSummary>;
}) {
  const t = useTranslations('admin.propostas');
  const tCommon = useTranslations('admin.common');
  const router = useRouter();
  const [proposals, setProposals] = useState<Proposal[]>(initialProposals);
  const [deleteTarget, setDeleteTarget] = useState<Proposal | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [duplicatingId, setDuplicatingId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const clearToast = useCallback(() => setToast(null), []);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/admin/proposals/${deleteTarget.id}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error ?? t('erroExcluir'));
        return;
      }
      setProposals(prev => prev.filter(p => p.id !== deleteTarget.id));
      setToast(t('propostaExcluida'));
      setDeleteTarget(null);
    } catch {
      alert(t('erroRede'));
    } finally {
      setDeleteLoading(false);
    }
  };

  // Duplica a proposta como rascunho e já abre a cópia pra edição — o caso de
  // uso é o cliente pedir um itinerário alternativo (ex.: plano pra chuva).
  const handleDuplicate = async (p: Proposal) => {
    setDuplicatingId(p.id);
    try {
      const res = await fetch(`/api/admin/proposals/${p.id}/duplicate`, { method: 'POST' });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error ?? t('erroDuplicar'));
        return;
      }
      const copy: Proposal = await res.json();
      setToast(t('propostaDuplicada'));
      router.push(`/admin/propostas/${copy.id}/editar`);
    } catch {
      alert(t('erroRede'));
    } finally {
      setDuplicatingId(null);
    }
  };

  const handleCopyLink = async (p: Proposal) => {
    try {
      await navigator.clipboard.writeText(publicProposalUrl(p));
      setToast(t('linkCopiado'));
    } catch {
      alert(t('erroCopiar'));
    }
  };

  if (proposals.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="text-5xl mb-4">📄</div>
        <p className="text-gray-500 text-sm mb-4">{t('nenhumaProposta')}</p>
        <Link
          href="/admin/propostas/nova"
          className="px-4 py-2 text-sm font-semibold bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          {t('criarPrimeira')}
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{t('colCliente')}</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{tCommon('pax')}</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{t('colDiasTour')}</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{tCommon('total')}</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{tCommon('status')}</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{t('colVisualizacoes')}</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{tCommon('acoes')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {proposals.map(p => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">{p.client_name}</div>
                    {p.internal_label && (
                      <span className="inline-block mt-0.5 px-1.5 py-0.5 text-[11px] font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded">
                        {p.internal_label}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-700 tabular-nums">{p.pax}</td>
                  <td className="px-4 py-3 tabular-nums">
                    {(() => {
                      const days = getTourDays(p);
                      if (days.length === 0) return <span className="text-gray-400">—</span>;
                      const shown = days.slice(0, 4);
                      return (
                        <>
                          <div className="text-gray-700">
                            {shown.map(formatShortDay).join(' · ')}
                            {days.length > shown.length && (
                              <span className="text-gray-400"> +{days.length - shown.length}</span>
                            )}
                          </div>
                          <div className="text-xs text-gray-400">
                            {days.length} {days.length === 1 ? tCommon('dia') : tCommon('dias')} · {days[0].slice(0, 4)}
                          </div>
                        </>
                      );
                    })()}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-700 tabular-nums font-medium">
                    {p.total_amount === null ? tCommon('vazio') : fmtEur(p.total_amount)}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={p.status} />
                  </td>
                  <td className="px-4 py-3">
                    <ViewsBadge proposalId={p.id} summary={analytics[p.id]} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      {/* Estatísticas de leitura */}
                      <Link
                        href={`/admin/propostas/${p.id}/estatisticas`}
                        title={t('verEstatisticas')}
                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                        </svg>
                      </Link>

                      {/* Ver proposta */}
                      <Link
                        href={`/admin/propostas/${p.id}/output`}
                        title={t('visualizarProposta')}
                        className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                          <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                        </svg>
                      </Link>

                      {/* Editar proposta */}
                      <Link
                        href={`/admin/propostas/${p.id}/editar`}
                        title={t('editarPropostaTitle')}
                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                      </Link>

                      {/* Duplicar proposta */}
                      <button
                        onClick={() => handleDuplicate(p)}
                        disabled={duplicatingId !== null}
                        title={t('duplicarProposta')}
                        className="p-1.5 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors disabled:opacity-50"
                      >
                        {duplicatingId === p.id ? (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 12a9 9 0 11-6.219-8.56" strokeLinecap="round" />
                          </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M7 9a2 2 0 012-2h6a2 2 0 012 2v6a2 2 0 01-2 2H9a2 2 0 01-2-2V9z" />
                            <path d="M5 3a2 2 0 00-2 2v6a2 2 0 002 2V5h8a2 2 0 00-2-2H5z" />
                          </svg>
                        )}
                      </button>

                      {/* Copiar link público da proposta */}
                      <button
                        onClick={() => handleCopyLink(p)}
                        title={t('copiarLinkProposta')}
                        className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" />
                        </svg>
                      </button>

                      {/* Deletar */}
                      <button
                        onClick={() => setDeleteTarget(p)}
                        title={tCommon('excluir')}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {deleteTarget && (
        <DeleteModal
          proposal={deleteTarget}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
          loading={deleteLoading}
        />
      )}

      {toast && <Toast message={toast} onDone={clearToast} />}
    </>
  );
}

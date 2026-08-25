'use client';

import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { fmtEur, daysSince } from '@/lib/adminFormat';
import GroupBadges from '@/components/admin/GroupBadges';
import type { Proposal, ProposalStatus } from '@/lib/proposals';
import type { LeadGroup } from '@/lib/leadGroups';
import type { ProposalAnalyticsSummary } from '@/lib/proposalAnalytics';
// Só o tipo: `import type` some na compilação e o lib de e-mail (Resend,
// service role) não entra no bundle do browser.
import type { ProposalEmailStatus } from '@/lib/email/sendProposalEmail';


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

// Sinaliza proposta parada — não só "enviada", qualquer status pode ficar
// esquecido (um rascunho de semanas atrás também merece atenção).
function AgingLabel({ updatedAt }: { updatedAt: string }) {
  const t = useTranslations('admin.propostas');
  const days = daysSince(updatedAt);
  const className = days >= 14 ? 'text-red-500 font-semibold' : days >= 7 ? 'text-amber-600' : 'text-gray-400';
  return (
    <span className={`block text-[11px] ${className}`}>
      {days === 0 ? t('atualizadaHoje') : t('atualizadaHaDias', { count: days })}
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

// Ações do dia a dia (estatísticas/ver/editar) ficam como ícones diretos;
// duplicar, copiar link e excluir — esporádicas ou destrutivas — vão pra cá.
function RowActionsMenu({
  onDuplicate,
  onCopyLink,
  onDelete,
  duplicating,
}: {
  onDuplicate: () => void;
  onCopyLink: () => void;
  onDelete: () => void;
  duplicating: boolean;
}) {
  const t = useTranslations('admin.propostas');
  const tCommon = useTranslations('admin.common');
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        title={t('maisAcoes')}
        className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
          <path d="M10 6a2 2 0 100-4 2 2 0 000 4zM10 12a2 2 0 100-4 2 2 0 000 4zM10 18a2 2 0 100-4 2 2 0 000 4z" />
        </svg>
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-20 py-1">
          <button
            type="button"
            onClick={() => { setOpen(false); onDuplicate(); }}
            disabled={duplicating}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 text-left disabled:opacity-50"
          >
            {duplicating ? t('duplicando') : t('duplicarProposta')}
          </button>
          <button
            type="button"
            onClick={() => { setOpen(false); onCopyLink(); }}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 text-left"
          >
            {t('copiarLinkProposta')}
          </button>
          <button
            type="button"
            onClick={() => { setOpen(false); onDelete(); }}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 text-left"
          >
            {tCommon('excluir')}
          </button>
        </div>
      )}
    </div>
  );
}

type StatusTab = 'all' | ProposalStatus;
const STATUS_TABS: StatusTab[] = ['all', 'draft', 'sent', 'accepted', 'rejected'];
const TAB_LABEL_KEY: Record<StatusTab, string> = {
  all: 'abaTodas',
  draft: 'abaRascunhos',
  sent: 'abaEnviadas',
  accepted: 'abaAceitas',
  rejected: 'abaRecusadas',
};
type SortKey = 'recent' | 'oldest' | 'value' | 'tourDate';

// Quantas propostas mostrar de cada vez por aba, antes do "carregar mais" —
// mesma lógica da faixa de leads pendentes: nada some, só fica escondido até
// pedirem mais.
const PAGE_SIZE = 20;

export default function PropostasListClient({
  initialProposals,
  analytics = {},
  emailStatuses = {},
  groupsByProposal = {},
}: {
  initialProposals: Proposal[];
  analytics?: Record<string, ProposalAnalyticsSummary>;
  /** Envio por e-mail de cada proposta; ausente = nunca saiu por e-mail. */
  emailStatuses?: Record<string, ProposalEmailStatus>;
  /** Etiquetas de cada proposta, herdadas do lead que aponta para ela. */
  groupsByProposal?: Record<string, LeadGroup[]>;
}) {
  const t = useTranslations('admin.propostas');
  const tCommon = useTranslations('admin.common');
  const router = useRouter();
  const [proposals, setProposals] = useState<Proposal[]>(initialProposals);
  const [deleteTarget, setDeleteTarget] = useState<Proposal | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [duplicatingId, setDuplicatingId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  // "Enviadas" é a aba que mais exige ação do Will (aguardando resposta do
  // cliente) — é onde a atenção deve pousar por padrão.
  const [tab, setTab] = useState<StatusTab>('sent');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<SortKey>('recent');
  const [onlyNoEmail, setOnlyNoEmail] = useState(false);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  // Trocar de aba, buscar ou filtrar recomeça a paginação — senão o admin
  // troca pra "Aceitas" e vê uma lista vazia porque o corte ficou lá atrás.
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [tab, search, sortBy, onlyNoEmail]);

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

  // Contagem por status pro rótulo de cada aba — sempre sobre a lista já
  // filtrada por grupo no servidor, nunca sobre o resultado da busca/filtro.
  const counts = useMemo(() => {
    const c: Record<StatusTab, number> = { all: proposals.length, draft: 0, sent: 0, accepted: 0, rejected: 0 };
    for (const p of proposals) c[p.status] += 1;
    return c;
  }, [proposals]);

  const visibleProposals = useMemo(() => {
    let list = tab === 'all' ? proposals : proposals.filter(p => p.status === tab);

    const q = search.trim().toLowerCase();
    if (q) list = list.filter(p => p.client_name.toLowerCase().includes(q));

    if (onlyNoEmail) list = list.filter(p => !emailStatuses[p.id]?.last_sent_at);

    const sorted = [...list];
    switch (sortBy) {
      case 'recent':
        sorted.sort((a, b) => b.created_at.localeCompare(a.created_at));
        break;
      case 'oldest':
        sorted.sort((a, b) => a.updated_at.localeCompare(b.updated_at));
        break;
      case 'value':
        sorted.sort((a, b) => (b.total_amount ?? -1) - (a.total_amount ?? -1));
        break;
      case 'tourDate': {
        const firstDay = (p: Proposal) => getTourDays(p)[0] ?? '9999-99-99';
        sorted.sort((a, b) => firstDay(a).localeCompare(firstDay(b)));
        break;
      }
    }
    return sorted;
  }, [proposals, tab, search, onlyNoEmail, sortBy, emailStatuses]);

  const shownProposals = useMemo(
    () => visibleProposals.slice(0, visibleCount),
    [visibleProposals, visibleCount],
  );

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
      <div className="flex flex-wrap items-center gap-1 border-b border-gray-200 mb-4">
        {STATUS_TABS.map(key => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={`px-3 py-2 text-sm font-semibold border-b-2 -mb-px transition-colors ${
              tab === key
                ? 'border-green-600 text-green-700'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {t(TAB_LABEL_KEY[key])} <span className="text-xs font-normal text-gray-400 tabular-nums">{counts[key]}</span>
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-4">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder={t('buscarCliente')}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm w-full sm:w-56 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
        />
        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value as SortKey)}
          aria-label={t('ordenarPropostas')}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
        >
          <option value="recent">{t('ordMaisRecente')}</option>
          <option value="oldest">{t('ordMaisAntiga')}</option>
          <option value="value">{t('ordMaiorValor')}</option>
          <option value="tourDate">{t('ordDataTour')}</option>
        </select>
        <label className="flex items-center gap-1.5 text-sm text-gray-600 sm:ml-auto">
          <input
            type="checkbox"
            checked={onlyNoEmail}
            onChange={e => setOnlyNoEmail(e.target.checked)}
            className="rounded border-gray-300 text-green-600 focus:ring-green-500"
          />
          {t('somenteSemEmail')}
        </label>
      </div>

      {visibleProposals.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center text-sm text-gray-500 bg-white rounded-xl border border-gray-200">
          {t('nenhumaPropostaFiltro')}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {/* Desktop/tablet: tabela */}
          <div className="hidden md:block overflow-x-auto">
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
                {shownProposals.map(p => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{p.client_name}</div>
                      <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                        {p.internal_label && (
                          <span className="inline-block px-1.5 py-0.5 text-[11px] font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded">
                            {p.internal_label}
                          </span>
                        )}
                        <GroupBadges groups={groupsByProposal[p.id] ?? []} />
                      </div>
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
                      {/* Proposta "enviada" que nunca saiu por e-mail é a que se
                          perde quando o WhatsApp some — fica marcada aqui. */}
                      {p.status === 'sent' && !emailStatuses[p.id]?.last_sent_at && (
                        <span
                          title={t('emailNuncaEnviado')}
                          className="block mt-1 text-[11px] font-semibold text-amber-600"
                        >
                          {t('semEmailBadge')}
                        </span>
                      )}
                      <AgingLabel updatedAt={p.updated_at} />
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

                        <RowActionsMenu
                          duplicating={duplicatingId === p.id}
                          onDuplicate={() => handleDuplicate(p)}
                          onCopyLink={() => handleCopyLink(p)}
                          onDelete={() => setDeleteTarget(p)}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile: cards — a mesma tabela em 7 colunas força scroll lateral
              num celular, então abaixo de md a lista vira cartões. */}
          <div className="md:hidden divide-y divide-gray-100">
            {shownProposals.map(p => {
              const days = getTourDays(p);
              const shownDays = days.slice(0, 2);
              return (
                <div key={p.id} className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-medium text-gray-900">{p.client_name}</div>
                      <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                        {p.internal_label && (
                          <span className="inline-block px-1.5 py-0.5 text-[11px] font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded">
                            {p.internal_label}
                          </span>
                        )}
                        <GroupBadges groups={groupsByProposal[p.id] ?? []} />
                      </div>
                    </div>
                    <StatusBadge status={p.status} />
                  </div>

                  <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-600 tabular-nums">
                    <span>{p.pax} {tCommon('pax')}</span>
                    <span className="font-medium text-gray-800">
                      {p.total_amount === null ? tCommon('vazio') : fmtEur(p.total_amount)}
                    </span>
                    {days.length > 0 && (
                      <span>
                        {shownDays.map(formatShortDay).join(' · ')}
                        {days.length > shownDays.length && ` +${days.length - shownDays.length}`}
                      </span>
                    )}
                  </div>

                  <div className="mt-1 flex items-center gap-2">
                    {p.status === 'sent' && !emailStatuses[p.id]?.last_sent_at && (
                      <span className="text-[11px] font-semibold text-amber-600">{t('semEmailBadge')}</span>
                    )}
                    <AgingLabel updatedAt={p.updated_at} />
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <ViewsBadge proposalId={p.id} summary={analytics[p.id]} />
                    <div className="flex items-center gap-1">
                      <Link
                        href={`/admin/propostas/${p.id}/estatisticas`}
                        title={t('verEstatisticas')}
                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                        </svg>
                      </Link>
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
                      <Link
                        href={`/admin/propostas/${p.id}/editar`}
                        title={t('editarPropostaTitle')}
                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                      </Link>
                      <RowActionsMenu
                        duplicating={duplicatingId === p.id}
                        onDuplicate={() => handleDuplicate(p)}
                        onCopyLink={() => handleCopyLink(p)}
                        onDelete={() => setDeleteTarget(p)}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {visibleProposals.length > shownProposals.length && (
            <div className="px-4 py-3 border-t border-gray-100 text-xs text-gray-500 text-center">
              {t('mostrandoDeTotal', { shown: shownProposals.length, total: visibleProposals.length })}
              {' · '}
              <button
                type="button"
                onClick={() => setVisibleCount(c => c + PAGE_SIZE)}
                className="font-semibold text-green-700 hover:underline"
              >
                {t('carregarMais')}
              </button>
            </div>
          )}
        </div>
      )}

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

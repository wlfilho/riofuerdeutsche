'use client';

import { useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { fmtDate, fmtEur } from '@/lib/adminFormat';
import GroupBadges from '@/components/admin/GroupBadges';
import type { CrmLeadView } from '../page';

function formatEstimate(min: number | null, max: number | null) {
  if (min === null && max === null) return '—';
  if (min !== null && max !== null) return `${fmtEur(min)}–${fmtEur(max)}`;
  return fmtEur(min ?? max);
}

const STATUS_CLASS: Record<string, string> = {
  new: 'bg-gray-100 text-gray-700',
  contacted: 'bg-blue-100 text-blue-700',
  proposal_sent: 'bg-amber-100 text-amber-700',
  closed: 'bg-green-100 text-green-700',
  lost: 'bg-red-100 text-red-700',
};

const STATUS_VALUES = ['new', 'contacted', 'proposal_sent', 'closed', 'lost'] as const;
// Só valores que price_leads.source pode assumir de verdade. 'site' NÃO entra:
// ele é canal de chegada (arrival_channel / contacts.source), não de submissão
// — como opção aqui virava filtro morto, sempre com zero resultados.
const SOURCE_VALUES = ['form', 'calculator', 'email', 'whatsapp', 'instagram', 'referral', 'other'] as const;

const FIELD_CLS =
  'px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent';

function DeleteModal({
  lead,
  onCancel,
  onConfirm,
  loading,
}: {
  lead: CrmLeadView;
  onCancel: () => void;
  onConfirm: () => void;
  loading: boolean;
}) {
  const t = useTranslations('admin.crm');
  const tCommon = useTranslations('admin.common');
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-2">{t('deletarLead')}</h2>
        <p className="text-sm text-gray-600 mb-6">
          {t.rich('leadSeraExcluido', {
            nome: lead.name,
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
            {loading ? tCommon('deletando') : tCommon('deletar')}
          </button>
        </div>
      </div>
    </div>
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

export default function CrmTable({
  leads: initialLeads,
  onLeadClick,
  onLeadDelete,
}: {
  leads: CrmLeadView[];
  onLeadClick: (lead: CrmLeadView) => void;
  onLeadDelete: (id: string) => void;
}) {
  const router = useRouter();
  const [leads, setLeads] = useState<CrmLeadView[]>(initialLeads);
  const [deleteTarget, setDeleteTarget] = useState<CrmLeadView | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const clearToast = useCallback(() => setToast(null), []);
  const t = useTranslations('admin.crm');
  const tCommon = useTranslations('admin.common');
  const tStatus = useTranslations('admin.status.lead');
  const tSource = useTranslations('admin.status.source');
  const tReason = useTranslations('admin.crm.motivoArquivo');

  const [search, setSearch] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Etiqueta não tem filtro aqui: já é o filtro "Grupo" do topo da página
  // (GroupFilter), que também recalcula os cards de métrica — ter os dois
  // faria a mesma coisa duas vezes.
  const hasFilters = Boolean(search || sourceFilter || statusFilter || dateFrom || dateTo);

  const clearFilters = () => {
    setSearch('');
    setSourceFilter('');
    setStatusFilter('');
    setDateFrom('');
    setDateTo('');
  };

  const filteredLeads = useMemo(() => {
    const term = search.trim().toLowerCase();
    return leads.filter(lead => {
      if (term && !lead.name.toLowerCase().includes(term) && !lead.email.toLowerCase().includes(term)) {
        return false;
      }
      if (sourceFilter && lead.source !== sourceFilter) return false;
      if (statusFilter && lead.status !== statusFilter) return false;
      // Comparação por data (created_at é timestamp), não por hora.
      const createdDate = lead.created_at.slice(0, 10);
      if (dateFrom && createdDate < dateFrom) return false;
      if (dateTo && createdDate > dateTo) return false;
      return true;
    });
  }, [leads, search, sourceFilter, statusFilter, dateFrom, dateTo]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/admin/leads/${deleteTarget.id}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json();
        setToast(tCommon('erroPrefixo', { mensagem: data.error ?? t('falhaDeletar') }));
        return;
      }
      setLeads(prev => prev.filter(l => l.id !== deleteTarget.id));
      onLeadDelete(deleteTarget.id);
      setDeleteTarget(null);
      setToast(t('leadDeletado'));
      router.refresh();
    } catch {
      setToast(tCommon('erroRede'));
    } finally {
      setDeleteLoading(false);
    }
  };

  if (leads.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 flex flex-col items-center justify-center py-24 text-center">
        <div className="text-5xl mb-4">📥</div>
        <p className="text-gray-700 font-medium">{t('nenhumLeadEncontrado')}</p>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-wrap items-center gap-3 mb-4">
        {/* Busca */}
        <div className="relative flex-1 min-w-48 max-w-xs">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z"
              clipRule="evenodd"
            />
          </svg>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={t('buscarPlaceholder')}
            className={`w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent`}
          />
        </div>

        {/* Origem */}
        <select value={sourceFilter} onChange={e => setSourceFilter(e.target.value)} className={FIELD_CLS}>
          <option value="">{tCommon('todas')}</option>
          {SOURCE_VALUES.map(value => (
            <option key={value} value={value}>
              {tSource(value)}
            </option>
          ))}
        </select>

        {/* Status */}
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className={FIELD_CLS}>
          <option value="">{tCommon('todos')}</option>
          {STATUS_VALUES.map(value => (
            <option key={value} value={value}>
              {tStatus(value)}
            </option>
          ))}
        </select>

        {/* Intervalo de datas (criação do lead) */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-gray-500">{t('filtroDataDe')}</span>
          <input
            type="date"
            value={dateFrom}
            onChange={e => setDateFrom(e.target.value)}
            className={FIELD_CLS}
          />
          <span className="text-xs text-gray-500">{t('filtroDataAte')}</span>
          <input
            type="date"
            value={dateTo}
            onChange={e => setDateTo(e.target.value)}
            className={FIELD_CLS}
          />
        </div>

        {hasFilters && (
          <button
            onClick={clearFilters}
            className="px-3 py-2 text-xs font-medium text-gray-500 hover:text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            {tCommon('limparFiltros')}
          </button>
        )}
      </div>

      {filteredLeads.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 flex flex-col items-center justify-center py-24 text-center">
          <div className="text-5xl mb-4">🔍</div>
          <p className="text-gray-700 font-medium">{t('nenhumResultadoFiltro')}</p>
          <button
            onClick={clearFilters}
            className="mt-4 px-3 py-2 text-xs font-medium text-gray-500 hover:text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            {tCommon('limparFiltros')}
          </button>
        </div>
      ) : (
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{t('colNomeContato')}</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{tCommon('pax')}</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{t('colEstimativa')}</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{tCommon('origem')}</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{tCommon('status')}</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{t('colTour')}</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{tCommon('data')}</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{tCommon('acoes')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredLeads.map(lead => {
                const statusClass = STATUS_CLASS[lead.status] ?? STATUS_CLASS.new;
                return (
                  <tr key={lead.id} className={`hover:bg-gray-50 ${lead.archiveReason ? 'bg-gray-50/60' : ''}`}>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-0.5">
                        <button
                          onClick={() => onLeadClick(lead)}
                          className="text-left font-medium text-gray-900 hover:text-green-700 transition-colors leading-snug"
                        >
                          {lead.name}
                        </button>
                        {lead.archiveReason && (
                          <span
                            className="self-start px-1.5 py-0.5 text-[10px] font-semibold rounded-full bg-gray-200 text-gray-600"
                            title={tReason(lead.archiveReason)}
                          >
                            {t('arquivado')}
                          </span>
                        )}
                        <GroupBadges groups={lead.groups} />
                        <a
                          href={`mailto:${lead.email}`}
                          className="text-xs text-gray-400 hover:text-green-700 transition-colors"
                        >
                          {lead.email}
                        </a>
                      </div>
                    </td>

                    <td className="px-4 py-3 tabular-nums text-gray-700">{lead.pax}</td>

                    <td className="px-4 py-3 tabular-nums text-gray-600 text-xs">
                      {formatEstimate(lead.estimated_min, lead.estimated_max)}
                    </td>

                    <td className="px-4 py-3">
                      <span className="inline-block px-2 py-0.5 text-xs font-semibold rounded-full bg-slate-100 text-slate-600">
                        {tSource.has(lead.source) ? tSource(lead.source) : lead.source}
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-0.5 text-xs font-semibold rounded-full ${statusClass}`}>
                        {tStatus(lead.status)}
                      </span>
                    </td>

                    <td className={`px-4 py-3 text-xs tabular-nums whitespace-nowrap ${
                      lead.tourDatePast ? 'text-gray-400' : 'text-gray-700 font-medium'
                    }`}>
                      {lead.tourDate ? fmtDate(lead.tourDate) : tCommon('vazio')}
                    </td>

                    <td className="px-4 py-3 text-gray-500 text-xs tabular-nums whitespace-nowrap">
                      {fmtDate(lead.created_at)}
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        {/* Ver drawer */}
                        <button
                          onClick={() => onLeadClick(lead)}
                          title={t('verDetalhes')}
                          className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                            <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                          </svg>
                        </button>

                        {/* Proposta */}
                        {lead.proposal_id ? (
                          <Link
                            href={`/admin/propostas/${lead.proposal_id}/output`}
                            title={t('verProposta')}
                            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                              <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                            </svg>
                          </Link>
                        ) : lead.status !== 'closed' && lead.status !== 'lost' ? (
                          <Link
                            href={`/admin/propostas/nova?lead_id=${lead.id}`}
                            title={t('converterProposta')}
                            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                              <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                            </svg>
                          </Link>
                        ) : null}

                        {/* Deletar */}
                        <button
                          onClick={() => setDeleteTarget(lead)}
                          title={tCommon('deletar')}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      )}

      {deleteTarget && (
        <DeleteModal
          lead={deleteTarget}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
          loading={deleteLoading}
        />
      )}

      {toast && <Toast message={toast} onDone={clearToast} />}
    </>
  );
}

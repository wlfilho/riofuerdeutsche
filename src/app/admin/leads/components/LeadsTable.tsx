'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import StatusBadge from './StatusBadge';
import SourceBadge from './SourceBadge';
import CampaignBadge from './CampaignBadge';
import { fmtDate, fmtEur } from '@/lib/adminFormat';
import type { LeadView } from '../page';

function formatEstimate(min: number | null, max: number | null) {
  if (min === null && max === null) return '—';
  if (min !== null && max !== null) return `${fmtEur(min)}–${fmtEur(max)}`;
  return fmtEur(min ?? max);
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
  lead,
  onCancel,
  onConfirm,
  loading,
}: {
  lead: LeadView;
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

export default function LeadsTable({ leads: initialLeads }: { leads: LeadView[] }) {
  const router = useRouter();
  const [leads, setLeads] = useState<LeadView[]>(initialLeads);
  const [deleteTarget, setDeleteTarget] = useState<LeadView | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const clearToast = useCallback(() => setToast(null), []);
  const t = useTranslations('admin.crm');
  const tCommon = useTranslations('admin.common');
  const tReason = useTranslations('admin.crm.motivoArquivo');

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
        <p className="text-gray-700 font-medium mb-1">{t('nenhumLeadEncontrado')}</p>
        <p className="text-gray-400 text-sm mb-6">
          {t('leadsCalculadoraAparecem')}
        </p>
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
              {leads.map(lead => (
                <tr key={lead.id} className={`hover:bg-gray-50 ${lead.archiveReason ? 'bg-gray-50/60' : ''}`}>
                  {/* Nome / Contato */}
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-0.5">
                      <Link
                        href={`/admin/leads/${lead.id}`}
                        className="font-medium text-gray-900 hover:text-green-700 transition-colors leading-snug"
                      >
                        {lead.name}
                      </Link>
                      {lead.archiveReason && (
                        <span
                          className="self-start px-1.5 py-0.5 text-[10px] font-semibold rounded-full bg-gray-200 text-gray-600"
                          title={tReason(lead.archiveReason)}
                        >
                          {t('arquivado')}
                        </span>
                      )}
                      <div className="flex items-center gap-2">
                        <a
                          href={`mailto:${lead.email}`}
                          className="text-xs text-gray-400 hover:text-green-700 transition-colors"
                        >
                          {lead.email}
                        </a>
                        {lead.phone && (
                          <a
                            href={`https://wa.me/${lead.phone.replace(/\D/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-0.5 text-green-600 hover:text-green-700 text-xs"
                          >
                            <svg className="h-3 w-3" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                            </svg>
                            WA
                          </a>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* PAX */}
                  <td className="px-4 py-3 tabular-nums text-gray-700">
                    <span className="inline-flex items-center gap-1">
                      <svg className="h-3.5 w-3.5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M10 9a3 3 0 100-6 3 3 0 000 6zM6 8a2 2 0 11-4 0 2 2 0 014 0zM1.49 15.326a.78.78 0 01-.358-.442 3 3 0 014.308-3.516 6.484 6.484 0 00-1.905 3.959c-.023.222-.014.442.025.654a4.97 4.97 0 01-2.07-.655zM16.44 15.98a4.97 4.97 0 002.07-.654.78.78 0 00.357-.442 3 3 0 00-4.308-3.517 6.484 6.484 0 011.907 3.96 2.32 2.32 0 01-.026.654zM18 8a2 2 0 11-4 0 2 2 0 014 0zM5.304 16.19a.844.844 0 01-.277-.71 5 5 0 019.947 0 .843.843 0 01-.277.71A6.975 6.975 0 0110 18a6.974 6.974 0 01-4.696-1.81z" />
                      </svg>
                      {lead.pax}
                    </span>
                  </td>

                  {/* Estimativa */}
                  <td className="px-4 py-3 tabular-nums text-gray-600 text-xs">
                    {formatEstimate(lead.estimated_min, lead.estimated_max)}
                  </td>

                  {/* Origem */}
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <SourceBadge source={lead.source} />
                      <CampaignBadge campaign={lead.campaign} />
                    </div>
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3">
                    <StatusBadge status={lead.status} />
                  </td>

                  {/* Data */}
                  <td className={`px-4 py-3 text-xs tabular-nums whitespace-nowrap ${
                    lead.tourDatePast ? 'text-gray-400' : 'text-gray-700 font-medium'
                  }`}>
                    {lead.tourDate ? fmtDate(lead.tourDate) : tCommon('vazio')}
                  </td>

                  <td className="px-4 py-3 text-gray-500 text-xs tabular-nums whitespace-nowrap">
                    {fmtDate(lead.created_at)}
                  </td>

                  {/* Ações */}
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      {/* Ver */}
                      <Link
                        href={`/admin/leads/${lead.id}`}
                        title={t('verDetalhes')}
                        className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                          <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                        </svg>
                      </Link>

                      {/* Converter em proposta */}
                      {lead.status !== 'closed' && lead.status !== 'lost' && (
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
                      )}

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
              ))}
            </tbody>
          </table>
        </div>
      </div>

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

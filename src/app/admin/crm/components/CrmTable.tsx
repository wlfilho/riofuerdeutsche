'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { CrmLead } from '../page';

function formatDate(iso: string) {
  const [y, m, d] = iso.split('T')[0].split('-');
  return `${d}.${m}.${y}`;
}

function formatEstimate(min: number | null, max: number | null) {
  if (min === null && max === null) return '—';
  if (min !== null && max !== null) return `${min}–${max} €`;
  return `${min ?? max} €`;
}

const STATUS_MAP: Record<string, { label: string; className: string }> = {
  new: { label: 'Novo', className: 'bg-gray-100 text-gray-700' },
  contacted: { label: 'Em Contato', className: 'bg-blue-100 text-blue-700' },
  proposal_sent: { label: 'Proposta Enviada', className: 'bg-amber-100 text-amber-700' },
  closed: { label: 'Fechado ✓', className: 'bg-green-100 text-green-700' },
  lost: { label: 'Perdido', className: 'bg-red-100 text-red-700' },
};

const SOURCE_LABELS: Record<string, string> = {
  calculator: 'Calculadora',
  email: 'E-Mail',
  whatsapp: 'WhatsApp',
  instagram: 'Instagram',
  referral: 'Indicação',
  other: 'Outro',
};

function DeleteModal({
  lead,
  onCancel,
  onConfirm,
  loading,
}: {
  lead: CrmLead;
  onCancel: () => void;
  onConfirm: () => void;
  loading: boolean;
}) {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-2">Deletar lead?</h2>
        <p className="text-sm text-gray-600 mb-6">
          O lead de <strong>{lead.name}</strong> será excluído permanentemente.
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Deletando...' : 'Deletar'}
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
  leads: CrmLead[];
  onLeadClick: (lead: CrmLead) => void;
  onLeadDelete: (id: string) => void;
}) {
  const router = useRouter();
  const [leads, setLeads] = useState<CrmLead[]>(initialLeads);
  const [deleteTarget, setDeleteTarget] = useState<CrmLead | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const clearToast = useCallback(() => setToast(null), []);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/admin/leads/${deleteTarget.id}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json();
        setToast(`Erro: ${data.error ?? 'Falha ao deletar'}`);
        return;
      }
      setLeads(prev => prev.filter(l => l.id !== deleteTarget.id));
      onLeadDelete(deleteTarget.id);
      setDeleteTarget(null);
      setToast('Lead deletado');
      router.refresh();
    } catch {
      setToast('Erro de rede. Tente novamente.');
    } finally {
      setDeleteLoading(false);
    }
  };

  if (leads.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 flex flex-col items-center justify-center py-24 text-center">
        <div className="text-5xl mb-4">📥</div>
        <p className="text-gray-700 font-medium">Nenhum lead encontrado</p>
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
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Nome / Contato</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">PAX</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Estimativa</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Origem</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Data</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {leads.map(lead => {
                const statusInfo = STATUS_MAP[lead.status] ?? STATUS_MAP.new;
                return (
                  <tr key={lead.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-0.5">
                        <button
                          onClick={() => onLeadClick(lead)}
                          className="text-left font-medium text-gray-900 hover:text-green-700 transition-colors leading-snug"
                        >
                          {lead.name}
                        </button>
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
                        {SOURCE_LABELS[lead.source] ?? lead.source}
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-0.5 text-xs font-semibold rounded-full ${statusInfo.className}`}>
                        {statusInfo.label}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-gray-500 text-xs tabular-nums whitespace-nowrap">
                      {formatDate(lead.created_at)}
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        {/* Ver drawer */}
                        <button
                          onClick={() => onLeadClick(lead)}
                          title="Ver detalhes"
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
                            href={`/admin/propostas/${lead.proposal_id}`}
                            title="Ver proposta"
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
                            title="Converter em proposta"
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
                          title="Deletar"
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

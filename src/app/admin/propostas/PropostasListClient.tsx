'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { fmtEur } from '@/lib/adminFormat';
import type { Proposal, ProposalStatus } from '@/lib/proposals';


// ─── Formatação do texto ALEMÃO enviado ao cliente ────────────────────────────
// Estes dois helpers alimentam buildWhatsAppText(); não usar na UI do admin
// (que formata via @/lib/adminFormat).

function formatDate(iso: string | null): string {
  if (!iso) return '—';
  const [y, m, d] = iso.split('-');
  return `${d}.${m}.${y}`;
}

function formatEur(amount: number | null): string {
  if (amount === null) return '—';
  return `€${amount.toFixed(2).replace('.', ',')}`;
}

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

function buildWhatsAppText(p: Proposal): string {
  const greeting = p.treatment === 'Sie' ? `Guten Tag, ${p.client_name}!` : `Hallo, ${p.client_name}!`;
  const lines: string[] = [greeting, ''];

  // Ankunft/Abreise seriam informação errada pro cliente: são só o primeiro e
  // o último dia de tour. O que importa são os Tourtage.
  const tourDays = getTourDays(p);
  if (tourDays.length > 0) {
    lines.push(`📅 Tourtage: ${tourDays.map(formatDate).join(', ')}`);
  }
  lines.push(`👥 Personen: ${p.pax}`);
  lines.push('');

  if (p.items.length > 0) {
    lines.push('🗓 Ihr Programm:');
    for (const item of p.items) {
      const date = formatDate(item.day);
      const price = `€${item.total_eur.toFixed(2).replace('.', ',')}`;
      lines.push(`• ${date} – ${item.service_name} (${price})`);
      if (item.note) lines.push(`  ↳ ${item.note}`);
    }
    lines.push('');
  }

  if (p.total_amount !== null) {
    lines.push(`💰 Gesamtbetrag: ${formatEur(p.total_amount)}`);
    lines.push('');
  }

  lines.push('Beste Grüße,\nRio für Deutsche');

  return lines.join('\n');
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

export default function PropostasListClient({ initialProposals }: { initialProposals: Proposal[] }) {
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

  const handleCopyWhatsApp = async (p: Proposal) => {
    const text = buildWhatsAppText(p);
    try {
      await navigator.clipboard.writeText(text);
      setToast(t('textoWhatsappCopiado'));
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
                    <div className="flex items-center justify-end gap-1">
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

                      {/* Copiar WhatsApp */}
                      <button
                        onClick={() => handleCopyWhatsApp(p)}
                        title={t('copiarTextoWhatsapp')}
                        className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
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

'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import type { CrmLead, LeadStatus } from '@/app/admin/crm/page';

type Interaction = {
  id: string;
  lead_id: string;
  type: 'whatsapp' | 'email' | 'phone' | 'other';
  direction: 'sent' | 'received';
  note: string | null;
  is_automatic: boolean;
  created_at: string;
};

const STATUS_OPTIONS: { value: LeadStatus; label: string }[] = [
  { value: 'new', label: 'Novo' },
  { value: 'contacted', label: 'Em Contato' },
  { value: 'proposal_sent', label: 'Proposta Enviada' },
  { value: 'closed', label: 'Fechado' },
  { value: 'lost', label: 'Perdido' },
];

const STATUS_CLASS: Record<LeadStatus, string> = {
  new: 'bg-gray-100 text-gray-700',
  contacted: 'bg-blue-100 text-blue-700',
  proposal_sent: 'bg-amber-100 text-amber-700',
  closed: 'bg-green-100 text-green-700',
  lost: 'bg-red-100 text-red-700',
};

const SOURCE_LABELS: Record<string, string> = {
  calculator: 'Calculadora',
  email: 'E-Mail',
  whatsapp: 'WhatsApp',
  instagram: 'Instagram',
  referral: 'Indicação',
  other: 'Outro',
};

const INTERACTION_ICON: Record<string, string> = {
  whatsapp: '💬',
  email: '✉️',
  phone: '📞',
  other: '📝',
};

function formatDate(iso: string) {
  const [y, m, d] = iso.split('T')[0].split('-');
  return `${d}.${m}.${y}`;
}

function formatEstimate(min: number | null, max: number | null) {
  if (min === null && max === null) return null;
  if (min !== null && max !== null) return `${min}–${max} €`;
  return `${min ?? max} €`;
}

export default function LeadDrawer({
  lead: initialLead,
  onClose,
  onLeadUpdate,
}: {
  lead: CrmLead;
  onClose: () => void;
  onLeadUpdate: (updated: CrmLead) => void;
}) {
  const [lead, setLead] = useState<CrmLead>(initialLead);
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [loadingInteractions, setLoadingInteractions] = useState(true);
  const [notes, setNotes] = useState(initialLead.notes ?? '');
  const [savingNotes, setSavingNotes] = useState(false);
  const [savingStatus, setSavingStatus] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const clearToast = useCallback(() => setToast(null), []);

  // Sync when lead changes from parent (e.g. status change via kanban)
  useEffect(() => {
    setLead(initialLead);
    setNotes(initialLead.notes ?? '');
  }, [initialLead.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch interactions on mount
  useEffect(() => {
    setLoadingInteractions(true);
    fetch(`/api/admin/leads/${lead.id}`)
      .then(r => r.json())
      .then(data => {
        if (data.interactions) setInteractions(data.interactions);
      })
      .catch(() => {})
      .finally(() => setLoadingInteractions(false));
  }, [lead.id]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(clearToast, 3000);
    return () => clearTimeout(t);
  }, [toast, clearToast]);

  const handleStatusChange = async (newStatus: LeadStatus) => {
    if (newStatus === lead.status) return;
    setSavingStatus(true);
    try {
      const res = await fetch(`/api/admin/leads/${lead.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) {
        const data = await res.json();
        setToast(`Erro: ${data.error ?? 'Falha ao atualizar status'}`);
        return;
      }
      const updated = { ...lead, status: newStatus };
      setLead(updated);
      onLeadUpdate(updated);
    } catch {
      setToast('Erro de rede. Tente novamente.');
    } finally {
      setSavingStatus(false);
    }
  };

  const handleSaveNotes = async () => {
    setSavingNotes(true);
    try {
      const res = await fetch(`/api/admin/leads/${lead.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: notes.trim() || null }),
      });
      if (!res.ok) {
        const data = await res.json();
        setToast(`Erro: ${data.error ?? 'Falha ao salvar notas'}`);
        return;
      }
      const updated = { ...lead, notes: notes.trim() || null };
      setLead(updated);
      onLeadUpdate(updated);
      setToast('Notas salvas ✓');
    } catch {
      setToast('Erro de rede. Tente novamente.');
    } finally {
      setSavingNotes(false);
    }
  };

  const estimate = formatEstimate(lead.estimated_min, lead.estimated_max);
  const statusInfo = STATUS_CLASS[lead.status] ?? STATUS_CLASS.new;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-30 bg-black/30"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 bottom-0 z-40 w-full max-w-md bg-white shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-5 border-b border-gray-100">
          <div className="min-w-0 flex-1 pr-4">
            <h2 className="text-lg font-bold text-gray-900 leading-snug">{lead.name}</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className={`inline-block px-2 py-0.5 text-xs font-semibold rounded-full ${statusInfo}`}>
                {STATUS_OPTIONS.find(o => o.value === lead.status)?.label}
              </span>
              <span className="text-xs text-gray-400">{formatDate(lead.created_at)}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors text-xl leading-none flex-shrink-0 p-1"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {/* Contact info */}
          <div className="px-6 py-4 space-y-2 border-b border-gray-100">
            <div className="flex items-center gap-3 text-sm">
              <span className="text-gray-400 w-16 shrink-0">E-Mail</span>
              <a href={`mailto:${lead.email}`} className="text-gray-800 hover:text-green-700 transition-colors truncate">
                {lead.email}
              </a>
            </div>
            {lead.phone && (
              <div className="flex items-center gap-3 text-sm">
                <span className="text-gray-400 w-16 shrink-0">Telefon</span>
                <a
                  href={`https://wa.me/${lead.phone.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-800 hover:text-green-700 transition-colors"
                >
                  {lead.phone}
                </a>
              </div>
            )}
            <div className="flex items-center gap-3 text-sm">
              <span className="text-gray-400 w-16 shrink-0">PAX</span>
              <span className="text-gray-800">
                {lead.pax} Personen
                {(lead.children ?? 0) > 0 && (
                  <span className="text-gray-500"> + {lead.children} Kind{lead.children !== 1 ? 'er' : ''}</span>
                )}
              </span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <span className="text-gray-400 w-16 shrink-0">Origem</span>
              <span className="text-gray-800">{SOURCE_LABELS[lead.source] ?? lead.source}</span>
            </div>
            {estimate && (
              <div className="flex items-center gap-3 text-sm">
                <span className="text-gray-400 w-16 shrink-0">Preço</span>
                <span className="text-gray-800 font-medium">{estimate}</span>
              </div>
            )}
            {(lead.requested_days?.length ?? 0) > 0 && (
              <div className="flex items-start gap-3 text-sm">
                <span className="text-gray-400 w-16 shrink-0 pt-0.5">Dias</span>
                <div className="flex flex-wrap gap-1.5">
                  {(lead.requested_days ?? []).map(d => (
                    <span
                      key={d}
                      className="px-2 py-0.5 bg-green-50 border border-green-200 text-green-800 rounded-full text-xs font-medium"
                    >
                      {formatDate(d)}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="px-6 py-4 space-y-3 border-b border-gray-100">
            {/* Status selector */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">Status</label>
              <select
                value={lead.status}
                onChange={e => handleStatusChange(e.target.value as LeadStatus)}
                disabled={savingStatus}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:opacity-50"
              >
                {STATUS_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            {/* Quick links */}
            <div className="flex flex-wrap gap-2">
              {lead.contact_id && (
                <Link
                  href={`/admin/contatos/${lead.contact_id}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                  Ver perfil completo
                </Link>
              )}
              {lead.proposal_id && (
                <Link
                  href={`/admin/propostas/${lead.proposal_id}/output`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                    <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                  </svg>
                  Ver proposta
                </Link>
              )}
              {!lead.proposal_id && lead.status !== 'closed' && lead.status !== 'lost' && (
                <Link
                  href={`/admin/propostas/nova?lead_id=${lead.id}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors"
                >
                  <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  Criar proposta
                </Link>
              )}
            </div>
          </div>

          {/* Notes */}
          <div className="px-6 py-4 border-b border-gray-100">
            <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">Anotações internas</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
              placeholder="Observações sobre este lead..."
            />
            <div className="flex justify-end mt-2">
              <button
                onClick={handleSaveNotes}
                disabled={savingNotes || notes === (lead.notes ?? '')}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {savingNotes ? 'Salvando...' : 'Salvar notas'}
              </button>
            </div>
          </div>

          {/* Interaction history */}
          <div className="px-6 py-4">
            <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">Histórico de interações</h3>
            {loadingInteractions ? (
              <p className="text-sm text-gray-400">Carregando...</p>
            ) : interactions.length === 0 ? (
              <p className="text-sm text-gray-400">Nenhuma interação registrada.</p>
            ) : (
              <div className="space-y-3">
                {interactions.map(interaction => (
                  <div key={interaction.id} className="flex gap-3">
                    <div className="text-lg leading-none mt-0.5">
                      {INTERACTION_ICON[interaction.type] ?? '📝'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-xs font-medium text-gray-700 capitalize">{interaction.type}</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                          interaction.direction === 'sent'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {interaction.direction === 'sent' ? 'enviado' : 'recebido'}
                        </span>
                        {interaction.is_automatic && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-purple-100 text-purple-600 font-medium">auto</span>
                        )}
                        <span className="text-[10px] text-gray-400 ml-auto">{formatDate(interaction.created_at)}</span>
                      </div>
                      {interaction.note && (
                        <p className="text-xs text-gray-600 leading-relaxed">{interaction.note}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-3 bg-gray-900 text-white text-sm rounded-xl shadow-lg whitespace-nowrap">
          {toast}
        </div>
      )}
    </>
  );
}

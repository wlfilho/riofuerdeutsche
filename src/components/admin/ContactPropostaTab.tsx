'use client';

import { useTranslations } from 'next-intl';
import { FileText, ExternalLink, Plus } from 'lucide-react';
import { fmtDate, fmtEur } from '@/lib/adminFormat';

// ── Types ─────────────────────────────────────────────────────────────────────

type LeadStatus = 'new' | 'contacted' | 'proposal_sent' | 'closed' | 'lost';
type ProposalStatus = 'draft' | 'sent' | 'accepted' | 'rejected';

interface Lead {
  id: string;
  pax: number;
  status: LeadStatus;
  proposal_id: string | null;
  estimated_min: number | null;
  estimated_max: number | null;
  created_at: string;
}

interface Proposal {
  id: string;
  client_name: string;
  internal_label: string | null;
  pax: number;
  status: ProposalStatus;
  total_amount: number | null;
  currency?: 'EUR' | 'BRL' | null;
  valid_until: string | null;
  created_at: string;
  updated_at: string;
}

interface ContactPropostaTabProps {
  leads: Lead[];
  proposals: Proposal[];
}

// ── Constants ─────────────────────────────────────────────────────────────────

const STATUS_BADGE_CLASS: Record<ProposalStatus, string> = {
  draft:    'bg-gray-100 text-gray-600',
  sent:     'bg-amber-100 text-amber-700',
  accepted: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
};

// ── StatusBadge ───────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: ProposalStatus }) {
  const tProposal = useTranslations('admin.status.proposal');
  return (
    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${STATUS_BADGE_CLASS[status]}`}>
      {tProposal(status)}
    </span>
  );
}

// ── ProposalCard ──────────────────────────────────────────────────────────────

function ProposalCard({ proposal }: { proposal: Proposal }) {
  const t = useTranslations('admin.contatos');
  return (
    <a
      href={`/admin/propostas/${proposal.id}/output`}
      className="flex items-center gap-3 px-4 py-3.5 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
    >
      <div className="flex-shrink-0 w-9 h-9 rounded-full bg-white flex items-center justify-center">
        <FileText className="w-4 h-4 text-gray-500" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-medium text-gray-800 truncate">
            {proposal.internal_label || proposal.client_name}
          </p>
          <StatusBadge status={proposal.status} />
        </div>
        <p className="text-xs text-gray-400 mt-0.5">
          {proposal.total_amount != null && `${fmtEur(proposal.total_amount)} · `}
          {t('leadEm')} {fmtDate(proposal.created_at)}
        </p>
      </div>
      <ExternalLink className="w-3.5 h-3.5 text-gray-300 flex-shrink-0" />
    </a>
  );
}

// ── PendingLeadCard ───────────────────────────────────────────────────────────

function PendingLeadCard({ lead }: { lead: Lead }) {
  const t = useTranslations('admin.contatos');
  const tProposal = useTranslations('admin.status.proposal');
  return (
    <div className="flex items-center gap-3 px-4 py-3.5 bg-gray-50 border border-dashed border-gray-200 rounded-xl">
      <div className="flex-shrink-0 w-9 h-9 rounded-full bg-white border border-gray-200 flex items-center justify-center">
        <FileText className="w-4 h-4 text-gray-300" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-medium text-gray-500">{t('semPropostaLead')}</p>
          <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-gray-100 text-gray-500">
            {tProposal('draft')}
          </span>
        </div>
        <p className="text-xs text-gray-400 mt-0.5">{t('leadEm')} {fmtDate(lead.created_at)}</p>
      </div>
      <a
        href={`/admin/propostas/nova?lead_id=${lead.id}`}
        className="flex-shrink-0 flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
      >
        <Plus className="w-3.5 h-3.5" />
        {t('criarProposta')}
      </a>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function ContactPropostaTab({ leads, proposals }: ContactPropostaTabProps) {
  const t = useTranslations('admin.contatos');

  const proposalsById = new Map(proposals.map(p => [p.id, p]));
  const leadProposalIds = new Set(leads.map(l => l.proposal_id).filter(Boolean));

  // Uma linha por lead: a proposta vinculada (se houver) ou um CTA pra criar.
  const leadRows = leads.map(lead => ({
    lead,
    proposal: lead.proposal_id ? proposalsById.get(lead.proposal_id) ?? null : null,
  }));

  // Propostas que não estão presas a nenhum lead (ex.: plano B duplicado).
  const orphanProposals = proposals.filter(p => !leadProposalIds.has(p.id));

  if (leadRows.length === 0 && orphanProposals.length === 0) {
    return (
      <div className="p-6">
        <p className="text-sm text-gray-400 italic">{t('nenhumaProposta')}</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {leadRows.length > 0 && (
        <div className="space-y-2">
          {leadRows.map(({ lead, proposal }) =>
            proposal
              ? <ProposalCard key={lead.id} proposal={proposal} />
              : <PendingLeadCard key={lead.id} lead={lead} />
          )}
        </div>
      )}

      {orphanProposals.length > 0 && (
        <div>
          <p className="text-xs text-gray-400 uppercase font-medium mb-3">{t('outrasPropostas')}</p>
          <div className="space-y-2">
            {orphanProposals.map(p => <ProposalCard key={p.id} proposal={p} />)}
          </div>
        </div>
      )}
    </div>
  );
}

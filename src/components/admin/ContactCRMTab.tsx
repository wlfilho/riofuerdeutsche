'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import {
  Check, X, FileText, CircleCheck,
  Pencil, ExternalLink, MessageCircle, Plus,
  Mail, Phone, MessageSquare, HelpCircle, ChevronDown,
} from 'lucide-react';
import { fmtDate, fmtEur } from '@/lib/adminFormat';

// ── Types ─────────────────────────────────────────────────────────────────────

type LeadStatus = 'new' | 'contacted' | 'proposal_sent' | 'closed' | 'completed' | 'lost';

interface Lead {
  id: string;
  name: string;
  email: string;
  pax: number;
  days: number | null;
  source: string;
  status: LeadStatus;
  proposal_id: string | null;
  notes: string | null;
  estimated_min: number | null;
  estimated_max: number | null;
  claude_chat_url: string | null;
  created_at: string;
  updated_at: string;
}

interface LeadContact {
  id: string;
  lead_id: string;
  type: 'whatsapp' | 'email' | 'phone' | 'other';
  direction: 'sent' | 'received';
  note: string | null;
  is_automatic: boolean;
  automatic_label: string | null;
  created_at: string;
}

interface CrmTabProps {
  leads: Lead[];
  lead_contacts: LeadContact[];
}

// ── Constants ─────────────────────────────────────────────────────────────────

const FUNNEL_STEPS: { key: LeadStatus; labelKey: string; icon: React.ReactNode }[] = [
  { key: 'new',           labelKey: 'novo',      icon: null },
  { key: 'contacted',     labelKey: 'emContato', icon: null },
  { key: 'proposal_sent', labelKey: 'proposta',  icon: <FileText className="w-4 h-4" /> },
  { key: 'closed',        labelKey: 'fechado',   icon: <CircleCheck className="w-4 h-4" /> },
];

const PROPOSAL_BADGE_CLASS: Record<string, string> = {
  draft:    'bg-gray-100 text-gray-600',
  sent:     'bg-amber-100 text-amber-700',
  accepted: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
};

const CONTACT_TYPE_VALUES: LeadContact['type'][] = ['email', 'whatsapp', 'phone', 'other'];

// ── Helpers ───────────────────────────────────────────────────────────────────

function parseNotes(notes: string): string[] {
  return notes.split(' | ').map(s => s.trim()).filter(Boolean);
}

function typeIcon(type: LeadContact['type']) {
  if (type === 'email')    return <Mail className="w-3.5 h-3.5" />;
  if (type === 'whatsapp') return <MessageSquare className="w-3.5 h-3.5" />;
  if (type === 'phone')    return <Phone className="w-3.5 h-3.5" />;
  return <HelpCircle className="w-3.5 h-3.5" />;
}

// ── SectionLabel ──────────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-3">
      {children}
    </p>
  );
}

// ── FunnelProgress ────────────────────────────────────────────────────────────

function FunnelProgress({ status }: { status: LeadStatus }) {
  const t = useTranslations('admin.crm');
  const tStatus = useTranslations('admin.status.lead');

  if (status === 'lost') {
    return (
      <div className="flex items-center gap-2 mb-6">
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-100 text-red-700 text-xs font-semibold rounded-full">
          <X className="w-3.5 h-3.5" />
          {tStatus('lost')}
        </span>
      </div>
    );
  }

  // Concluído fica além do fim do funil: todas as etapas pintadas como feitas.
  const currentIdx =
    status === 'completed' ? FUNNEL_STEPS.length : FUNNEL_STEPS.findIndex(s => s.key === status);

  return (
    <div className="flex items-start mb-6">
      {FUNNEL_STEPS.map((step, i) => {
        const isDone    = i < currentIdx;
        const isCurrent = i === currentIdx;

        return (
          <div key={step.key} className="flex-1 flex flex-col items-center relative">
            {/* Left connector */}
            {i > 0 && (
              <div
                className={`absolute left-0 right-1/2 h-0.5 top-[22px] ${
                  isDone || isCurrent ? 'bg-green-500' : 'bg-gray-200'
                }`}
              />
            )}
            {/* Right connector */}
            {i < FUNNEL_STEPS.length - 1 && (
              <div
                className={`absolute left-1/2 right-0 h-0.5 top-[22px] ${
                  isDone ? 'bg-green-500' : 'bg-gray-200'
                }`}
              />
            )}

            {/* Circle */}
            <div
              className={`relative z-10 w-11 h-11 rounded-full border-2 flex items-center justify-center transition-all ${
                isDone
                  ? 'bg-green-500 border-green-500'
                  : isCurrent
                  ? 'bg-white border-green-500'
                  : 'bg-white border-gray-200'
              }`}
            >
              {isDone ? (
                <Check className="w-4.5 h-4.5 text-white" strokeWidth={2.5} />
              ) : isCurrent ? (
                <span className="text-green-600">
                  {step.icon ?? <div className="w-2.5 h-2.5 rounded-full bg-green-500" />}
                </span>
              ) : (
                <span className="text-gray-300">
                  {step.icon ?? <div className="w-2.5 h-2.5 rounded-full bg-gray-200" />}
                </span>
              )}
            </div>

            {/* Label */}
            <span
              className={`mt-2 text-[11px] leading-tight text-center ${
                isCurrent ? 'text-green-600 font-medium' : 'text-gray-400'
              }`}
            >
              {t(step.labelKey)}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ── MetricCard ────────────────────────────────────────────────────────────────

function MetricCard({ label, value, subtitle }: { label: string; value: string; subtitle: string }) {
  return (
    <div className="bg-gray-100 rounded-xl px-4 py-3.5 flex flex-col gap-0.5">
      <p className="text-xs text-gray-400">{label}</p>
      <p className="text-xl font-bold text-gray-900 leading-tight">{value}</p>
      <p className="text-[11px] text-gray-400">{subtitle}</p>
    </div>
  );
}

// ── NotesSection ──────────────────────────────────────────────────────────────

function NotesSection({ lead, onUpdated }: { lead: Lead; onUpdated: (notes: string | null) => void }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(lead.notes ?? '');
  const [saving, setSaving] = useState(false);
  const t = useTranslations('admin.contatos');
  const tCommon = useTranslations('admin.common');

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/leads/${lead.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: draft.trim() || null }),
      });
      if (res.ok) {
        onUpdated(draft.trim() || null);
        setEditing(false);
      }
    } finally {
      setSaving(false);
    }
  };

  const fragments = lead.notes ? parseNotes(lead.notes) : [];

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <SectionLabel>{tCommon('notas')}</SectionLabel>
        {!editing && (
          <button
            onClick={() => { setDraft(lead.notes ?? ''); setEditing(true); }}
            className="p-1 -mt-2 rounded text-gray-300 hover:text-gray-500 hover:bg-gray-100 transition-colors"
          >
            <Pencil className="w-3 h-3" />
          </button>
        )}
      </div>

      {editing ? (
        <div className="bg-gray-100 rounded-xl p-3.5 space-y-2.5">
          <textarea
            value={draft}
            onChange={e => setDraft(e.target.value)}
            rows={4}
            placeholder={t('separarItens')}
            className="w-full text-sm text-gray-800 bg-white border border-gray-200 rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <div className="flex items-center gap-2 justify-end">
            <button
              onClick={() => setEditing(false)}
              className="px-3 py-1.5 text-xs text-gray-600 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
            >
              {tCommon('cancelar')}
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-3 py-1.5 text-xs text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {saving ? tCommon('salvando') : tCommon('salvar')}
            </button>
          </div>
        </div>
      ) : fragments.length > 0 ? (
        <div className="bg-gray-100 rounded-xl px-4 py-3.5 space-y-2">
          {fragments.map((frag, i) => (
            <div key={i} className="flex items-start gap-2.5">
              <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-green-500 mt-[7px]" />
              <p className="text-sm text-gray-700 leading-relaxed">{frag}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-400 italic">
          {t('semNotas')}{' '}
          <button
            onClick={() => { setDraft(''); setEditing(true); }}
            className="text-green-600 hover:underline not-italic"
          >
            {tCommon('adicionar')}
          </button>
        </p>
      )}
    </div>
  );
}

// ── ClaudeSection ─────────────────────────────────────────────────────────────

function ClaudeSection({ lead, onUpdated }: { lead: Lead; onUpdated: (url: string | null) => void }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(lead.claude_chat_url ?? '');
  const [saving, setSaving] = useState(false);
  const t = useTranslations('admin.contatos');
  const tCrm = useTranslations('admin.crm');
  const tCommon = useTranslations('admin.common');

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/leads/${lead.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ claude_chat_url: draft.trim() || null }),
      });
      if (res.ok) {
        onUpdated(draft.trim() || null);
        setEditing(false);
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <SectionLabel>{tCrm('conversaClaude')}</SectionLabel>
        {!editing && (
          <button
            onClick={() => { setDraft(lead.claude_chat_url ?? ''); setEditing(true); }}
            className="p-1 -mt-2 rounded text-gray-300 hover:text-gray-500 hover:bg-gray-100 transition-colors"
          >
            <Pencil className="w-3 h-3" />
          </button>
        )}
      </div>

      {editing ? (
        <div className="bg-gray-100 rounded-xl p-3.5 space-y-2.5">
          <input
            type="url"
            value={draft}
            onChange={e => setDraft(e.target.value)}
            placeholder="https://claude.ai/chat/..."
            className="w-full text-sm text-gray-800 bg-white border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <div className="flex items-center gap-2 justify-end">
            <button
              onClick={() => setEditing(false)}
              className="px-3 py-1.5 text-xs text-gray-600 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
            >
              {tCommon('cancelar')}
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-3 py-1.5 text-xs text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {saving ? tCommon('salvando') : tCommon('salvar')}
            </button>
          </div>
        </div>
      ) : lead.claude_chat_url ? (
        <button
          onClick={() => window.open(lead.claude_chat_url!, '_blank')}
          className="w-full flex items-center gap-3 px-4 py-3 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors text-left"
        >
          <div className="flex-shrink-0 w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center">
            <MessageCircle className="w-4 h-4 text-blue-700" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-800">{t('abrirConversa')}</p>
            <p className="text-xs text-gray-400 truncate">{lead.claude_chat_url}</p>
          </div>
          <ExternalLink className="w-3.5 h-3.5 text-gray-300 flex-shrink-0" />
        </button>
      ) : (
        <p className="text-sm text-gray-400 italic">
          {t('semLink')}{' '}
          <button
            onClick={() => { setDraft(''); setEditing(true); }}
            className="text-green-600 hover:underline not-italic"
          >
            {tCommon('adicionar')}
          </button>
        </p>
      )}
    </div>
  );
}

// ── ProposalLink ──────────────────────────────────────────────────────────────

function ProposalLink({ proposalId }: { proposalId: string }) {
  const [status, setStatus] = useState<string | null>(null);
  const t = useTranslations('admin.contatos');
  const tCrm = useTranslations('admin.crm');
  const tProposal = useTranslations('admin.status.proposal');

  useEffect(() => {
    fetch(`/api/admin/proposals/${proposalId}`)
      .then(r => r.json())
      .then(d => { if (d.proposal?.status) setStatus(d.proposal.status); })
      .catch(() => {});
  }, [proposalId]);

  const badgeClass = status ? (PROPOSAL_BADGE_CLASS[status] ?? null) : null;

  return (
    <div className="flex items-center gap-2.5 mb-5 px-4 py-3 bg-gray-100 rounded-xl">
      <FileText className="w-4 h-4 text-gray-400 flex-shrink-0" />
      <span className="text-sm text-gray-700 flex-1">{t('propostaVinculadaLabel')}</span>
      {badgeClass && status && (
        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${badgeClass}`}>
          {tProposal(status)}
        </span>
      )}
      <a href={`/admin/propostas/${proposalId}/output`} className="text-xs text-green-600 hover:underline font-medium">
        {tCrm('verProposta')}
      </a>
    </div>
  );
}

// ── ContactHistory ────────────────────────────────────────────────────────────

const COLLAPSED_COUNT = 3;

function ContactHistory({
  leadId,
  contacts,
  onAdded,
}: {
  leadId: string;
  contacts: LeadContact[];
  onAdded: (c: LeadContact) => void;
}) {
  const [showForm, setShowForm] = useState(false);
  const [type, setType] = useState<LeadContact['type']>('email');
  const [direction, setDirection] = useState<'sent' | 'received'>('sent');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const t = useTranslations('admin.crm');
  const tCommon = useTranslations('admin.common');
  const tType = useTranslations('admin.status.contactType');
  const tDirection = useTranslations('admin.status.direction');

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/leads/${leadId}/contacts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, direction, note }),
      });
      if (res.ok) {
        const data = await res.json();
        onAdded(data);
        setNote('');
        setShowForm(false);
      }
    } finally {
      setSaving(false);
    }
  };

  const visible = expanded ? contacts : contacts.slice(0, COLLAPSED_COUNT);
  const hasMore = contacts.length > COLLAPSED_COUNT;

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <SectionLabel>{t('historicoContatos')}</SectionLabel>
        <button
          onClick={() => setShowForm(f => !f)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          {tCommon('registrar')}
        </button>
      </div>

      {showForm && (
        <div className="bg-gray-100 rounded-xl p-3.5 space-y-2.5 mb-4">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] text-gray-400 uppercase font-medium mb-1.5">{t('tipo')}</label>
              <select
                value={type}
                onChange={e => setType(e.target.value as LeadContact['type'])}
                className="w-full text-sm border border-gray-200 rounded-lg px-2.5 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                {CONTACT_TYPE_VALUES.map(value => (
                  <option key={value} value={value}>{tType(value)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] text-gray-400 uppercase font-medium mb-1.5">{t('direcao')}</label>
              <select
                value={direction}
                onChange={e => setDirection(e.target.value as 'sent' | 'received')}
                className="w-full text-sm border border-gray-200 rounded-lg px-2.5 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="sent">{tDirection('sent')}</option>
                <option value="received">{tDirection('received')}</option>
              </select>
            </div>
          </div>
          <textarea
            value={note}
            onChange={e => setNote(e.target.value)}
            rows={3}
            placeholder={t('descrevaContato')}
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white resize-none focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <div className="flex items-center justify-end gap-2">
            <button
              onClick={() => setShowForm(false)}
              className="px-3 py-1.5 text-xs text-gray-600 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
            >
              {tCommon('cancelar')}
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-3 py-1.5 text-xs text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {saving ? tCommon('salvando') : tCommon('salvar')}
            </button>
          </div>
        </div>
      )}

      {contacts.length === 0 ? (
        <p className="text-sm text-gray-400 italic">{t('nenhumContatoRegistrado')}</p>
      ) : (
        <div className="bg-gray-100 rounded-xl overflow-hidden">
          <ul>
            {visible.map((c, i) => {
              const isSent = c.direction === 'sent';
              return (
                <li
                  key={c.id}
                  className={`flex items-start gap-3 px-4 py-3.5 ${
                    i < visible.length - 1 ? 'border-b border-gray-200' : ''
                  }`}
                >
                  <div
                    className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mt-0.5 ${
                      isSent ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'
                    }`}
                  >
                    {typeIcon(c.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span
                        className={`text-xs font-medium ${
                          isSent ? 'text-blue-600' : 'text-green-600'
                        }`}
                      >
                        {tDirection(c.direction)}
                      </span>
                      <span className="text-xs text-gray-400">{fmtDate(c.created_at)}</span>
                      {c.is_automatic && (
                        <span className="text-xs text-gray-400 italic">{c.automatic_label ?? t('automatico')}</span>
                      )}
                    </div>
                    {c.note && (
                      <p className="text-sm text-gray-700 leading-relaxed">{c.note}</p>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>

          {hasMore && !expanded && (
            <div className="border-t border-gray-200 flex justify-center py-2">
              <button
                onClick={() => setExpanded(true)}
                className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 transition-colors px-3 py-1.5"
              >
                <div className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center">
                  <ChevronDown className="w-3.5 h-3.5" />
                </div>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function ContactCRMTab({ leads: initialLeads, lead_contacts: initialContacts }: CrmTabProps) {
  const [leads, setLeads] = useState(initialLeads);
  const [allContacts, setAllContacts] = useState(initialContacts);
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(initialLeads[0]?.id ?? null);
  const t = useTranslations('admin.contatos');
  const tCommon = useTranslations('admin.common');
  const tCrm = useTranslations('admin.crm');
  const tSource = useTranslations('admin.status.source');

  if (leads.length === 0) {
    return (
      <div className="p-6">
        <p className="text-sm text-gray-400 italic">{t('nenhumLeadContato')}</p>
      </div>
    );
  }

  const lead = leads.find(l => l.id === selectedLeadId) ?? leads[0];
  const contacts = allContacts.filter(c => c.lead_id === lead.id);

  return (
    <div className="p-6">
      {/* Lead selector */}
      {leads.length > 1 && (
        <div className="flex gap-2 flex-wrap mb-6">
          {leads.map(l => (
            <button
              key={l.id}
              onClick={() => setSelectedLeadId(l.id)}
              className={`px-3 py-1 text-xs font-medium rounded-full border transition-colors ${
                l.id === lead.id
                  ? 'border-green-500 bg-green-50 text-green-700'
                  : 'border-gray-200 text-gray-500 hover:border-gray-300'
              }`}
            >
              {fmtDate(l.created_at)}
            </button>
          ))}
        </div>
      )}

      {/* Funnel */}
      <div className="mb-2">
        <SectionLabel>{t('funilVendas')}</SectionLabel>
        <FunnelProgress status={lead.status} />
      </div>

      {/* Metric cards */}
      <div className={`grid gap-3 mb-6 ${(lead.estimated_min || lead.estimated_max) ? 'grid-cols-2' : 'grid-cols-3'}`}>
        <MetricCard label={tCommon('pax')} value={String(lead.pax)} subtitle={tCommon('pessoas')} />
        <MetricCard label={tCommon('origem')} value={tSource.has(lead.source) ? tSource(lead.source) : lead.source} subtitle={t('primeiroContato')} />
        {(lead.estimated_min || lead.estimated_max)
          ? <>
              <MetricCard
                label={tCrm('colEstimativa')}
                value={`${lead.estimated_min !== null ? fmtEur(lead.estimated_min) : '?'} – ${lead.estimated_max !== null ? fmtEur(lead.estimated_max) : '?'}`}
                subtitle={t('valorPrevisto')}
              />
              <MetricCard label={t('leadEm')} value={fmtDate(lead.created_at)} subtitle={t('dataEntrada')} />
            </>
          : <MetricCard label={t('leadEm')} value={fmtDate(lead.created_at)} subtitle={t('dataEntrada')} />
        }
      </div>

      {/* Proposal link */}
      {lead.proposal_id && <ProposalLink proposalId={lead.proposal_id} />}

      {/* Notes */}
      <NotesSection
        lead={lead}
        onUpdated={notes => setLeads(prev => prev.map(l => l.id === lead.id ? { ...l, notes } : l))}
      />

      {/* Claude chat */}
      <ClaudeSection
        lead={lead}
        onUpdated={url => setLeads(prev => prev.map(l => l.id === lead.id ? { ...l, claude_chat_url: url } : l))}
      />

      {/* Contact history */}
      <ContactHistory
        leadId={lead.id}
        contacts={contacts}
        onAdded={c => setAllContacts(prev => [c, ...prev])}
      />
    </div>
  );
}

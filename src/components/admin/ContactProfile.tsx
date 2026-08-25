'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import ContactCRMTab from '@/components/admin/ContactCRMTab';
import ContactPropostaTab from '@/components/admin/ContactPropostaTab';
import { fmtDate, fmtDateTime, fmtEur } from '@/lib/adminFormat';

type Tab = 'guide' | 'crm' | 'proposta' | 'emails' | 'dokumente';

type LeadStatus = 'new' | 'contacted' | 'proposal_sent' | 'closed' | 'lost';

interface Profile {
  id: string;
  email: string;
  role: 'user' | 'premium' | 'admin';
  first_name: string | null;
  created_at: string;
  premium_since: string | null;
  premium_until: string | null;
  guide_edition: number | null;
}

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

interface TourClient {
  id: string;
  name: string;
  email: string;
  pax: number;
  arrival_date: string;
  departure_date: string;
  status: 'active' | 'completed' | 'cancelled' | 'pending';
  total_amount: number | null;
  deposit_amount: number | null;
  internal_notes: string | null;
  created_at: string;
}

interface Proposal {
  id: string;
  client_name: string;
  internal_label: string | null;
  pax: number;
  status: 'draft' | 'sent' | 'accepted' | 'rejected';
  total_amount: number | null;
  currency?: 'EUR' | 'BRL' | null;
  valid_until: string | null;
  created_at: string;
  updated_at: string;
}

interface EmailLog {
  id: string;
  client_id: string;
  email_number: number;
  email_name: string;
  scheduled_date: string;
  sent_at: string | null;
  status: 'pending' | 'sent' | 'error' | 'skipped';
  phase: 'pre_tour' | 'pos_tour' | null;
  template_slug: string | null;
  email_templates: { name: string; subject: string } | null;
}

interface ContactData {
  contact: { id: string; email: string; name: string | null; phone: string | null; source: string | null; created_at: string };
  profile: Profile | null;
  pages_read: number;
  leads: Lead[];
  lead_contacts: LeadContact[];
  tour_clients: TourClient[];
  email_logs: EmailLog[];
  proposals: Proposal[];
}

interface ContactProfileProps {
  contactId: string;
  contactEmail: string;
  contactName: string | null;
  onEdit?: () => void;
  onDelete?: () => void;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

const ROLE_CLASS: Record<Profile['role'], string> = {
  admin:   'bg-purple-100 text-purple-700',
  premium: 'bg-amber-100 text-amber-700',
  user:    'bg-gray-100 text-gray-600',
};

function RoleBadge({ role }: { role: Profile['role'] }) {
  const t = useTranslations('admin.status.role');
  return <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${ROLE_CLASS[role]}`}>{t(role)}</span>;
}

// ── Guide Tab ─────────────────────────────────────────────────────────────────

function GuideTab({ profile, pages_read, contactEmail }: { profile: Profile | null; pages_read: number; contactEmail: string }) {
  const [upgrading, setUpgrading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const t = useTranslations('admin.contatos');

  const handleUpgrade = async () => {
    if (!profile) return;
    setUpgrading(true);
    try {
      const premiumUntil = new Date();
      premiumUntil.setFullYear(premiumUntil.getFullYear() + 1);

      const res = await fetch(`/api/admin/users/${profile.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: 'premium', guide_edition: 1, premium_until: premiumUntil.toISOString() }),
      });

      if (res.ok) {
        setToast(t('upgradeRealizado'));
        setTimeout(() => window.location.reload(), 1200);
      } else {
        const data = await res.json();
        setToast(data.error ?? t('erroUpgrade'));
      }
    } finally {
      setUpgrading(false);
    }
  };

  if (!profile) {
    return (
      <div className="p-6">
        <p className="text-sm text-gray-400 italic">
          {t.rich('nenhumaContaGuide', {
            nome: contactEmail,
            destaque: chunks => <span className="font-medium text-gray-600">{chunks}</span>,
          })}
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-5">
      {toast && (
        <div className="p-3 rounded-lg text-sm bg-green-50 text-green-800 border border-green-200">{toast}</div>
      )}

      <div className="flex items-center gap-3 flex-wrap">
        <RoleBadge role={profile.role} />
        {profile.first_name && <span className="text-sm text-gray-700 font-medium">{profile.first_name}</span>}
      </div>

      <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
        <div>
          <dt className="text-xs text-gray-400 uppercase font-medium">{t('registrado')}</dt>
          <dd className="text-gray-800 mt-0.5">{fmtDate(profile.created_at)}</dd>
        </div>
        <div>
          <dt className="text-xs text-gray-400 uppercase font-medium">{t('paginasLidas')}</dt>
          <dd className="text-gray-800 mt-0.5">{pages_read}</dd>
        </div>

        {profile.role === 'premium' && (
          <>
            <div>
              <dt className="text-xs text-gray-400 uppercase font-medium">{t('premiumDesde')}</dt>
              <dd className="text-gray-800 mt-0.5">{fmtDate(profile.premium_since)}</dd>
            </div>
            <div>
              <dt className="text-xs text-gray-400 uppercase font-medium">{t('premiumAte')}</dt>
              <dd className="text-gray-800 mt-0.5">{fmtDate(profile.premium_until)}</dd>
            </div>
            {profile.guide_edition && (
              <div>
                <dt className="text-xs text-gray-400 uppercase font-medium">{t('guideEdition')}</dt>
                <dd className="text-gray-800 mt-0.5">{profile.guide_edition}</dd>
              </div>
            )}
          </>
        )}
      </dl>

      {profile.role === 'user' && (
        <button
          onClick={handleUpgrade}
          disabled={upgrading}
          className="mt-2 px-4 py-2 text-sm font-semibold text-white bg-amber-500 rounded-lg hover:bg-amber-600 transition-colors disabled:opacity-50"
        >
          {upgrading ? t('fazendoUpgrade') : t('upgradePremium')}
        </button>
      )}
    </div>
  );
}

// ── CRM Tab ───────────────────────────────────────────────────────────────────

const FUNNEL_STEPS: { key: LeadStatus; labelKey: string }[] = [
  { key: 'new',           labelKey: 'novo' },
  { key: 'contacted',     labelKey: 'emContato' },
  { key: 'proposal_sent', labelKey: 'proposta' },
  { key: 'closed',        labelKey: 'fechado' },
];

function LeadFunnel({ status }: { status: LeadStatus }) {
  const t = useTranslations('admin.crm');
  const tStatus = useTranslations('admin.status.lead');
  const isLost = status === 'lost';
  const currentIdx = isLost ? -1 : FUNNEL_STEPS.findIndex(s => s.key === status);

  return (
    <div className="flex items-start gap-1 flex-wrap">
      {FUNNEL_STEPS.map((step, i) => (
        <div key={step.key} className="flex items-center">
          <div className="flex flex-col items-center">
            <div
              className={`w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-colors ${
                isLost
                  ? 'border-gray-200 text-gray-300'
                  : i < currentIdx
                  ? 'border-green-500 bg-green-500 text-white'
                  : i === currentIdx
                  ? 'border-green-600 bg-green-50 text-green-700'
                  : 'border-gray-200 text-gray-400'
              }`}
            >
              {i < currentIdx && !isLost ? '✓' : i + 1}
            </div>
            <span className={`text-xs mt-1 whitespace-nowrap ${i === currentIdx && !isLost ? 'text-green-700 font-semibold' : 'text-gray-400'}`}>
              {t(step.labelKey)}
            </span>
          </div>
          {i < FUNNEL_STEPS.length - 1 && (
            <div className={`w-5 h-0.5 mb-4 mx-0.5 ${i < currentIdx && !isLost ? 'bg-green-500' : 'bg-gray-200'}`} />
          )}
        </div>
      ))}
      {isLost && (
        <span className="ml-2 self-center px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full font-medium">{tStatus('lost')}</span>
      )}
    </div>
  );
}

const CONTACT_TYPE_ICON: Record<LeadContact['type'], string> = {
  whatsapp: '💬',
  email:    '✉️',
  phone:    '📞',
  other:    '📝',
};

function CrmTab({ leads, lead_contacts }: { leads: Lead[]; lead_contacts: LeadContact[] }) {
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(leads[0]?.id ?? null);
  const t = useTranslations('admin.contatos');
  const tCommon = useTranslations('admin.common');
  const tCrm = useTranslations('admin.crm');
  const tDirection = useTranslations('admin.status.direction');
  const lead = leads.find(l => l.id === selectedLeadId) ?? leads[0] ?? null;
  const timeline = lead_contacts.filter(c => c.lead_id === lead?.id);

  if (leads.length === 0) {
    return (
      <div className="p-6">
        <p className="text-sm text-gray-400 italic">{t('nenhumLeadContato')}</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Lead selector (if multiple) */}
      {leads.length > 1 && (
        <div className="flex gap-2 flex-wrap">
          {leads.map(l => (
            <button
              key={l.id}
              onClick={() => setSelectedLeadId(l.id)}
              className={`px-3 py-1 text-xs font-medium rounded-full border transition-colors ${
                l.id === lead?.id
                  ? 'border-green-500 bg-green-50 text-green-700'
                  : 'border-gray-200 text-gray-500 hover:border-gray-300'
              }`}
            >
              {fmtDate(l.created_at)}
            </button>
          ))}
        </div>
      )}

      {lead && (
        <>
          {/* Funnel */}
          <div>
            <p className="text-xs text-gray-400 uppercase font-medium mb-3">{tCrm('funil')}</p>
            <LeadFunnel status={lead.status} />
          </div>

          {/* Lead details */}
          <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
            <div>
              <dt className="text-xs text-gray-400 uppercase font-medium">{tCommon('pax')}</dt>
              <dd className="text-gray-800 mt-0.5">{lead.pax}</dd>
            </div>
            <div>
              <dt className="text-xs text-gray-400 uppercase font-medium">{tCommon('origem')}</dt>
              <dd className="text-gray-800 mt-0.5 capitalize">{lead.source}</dd>
            </div>
            {(lead.estimated_min || lead.estimated_max) && (
              <div className="col-span-2">
                <dt className="text-xs text-gray-400 uppercase font-medium">{tCrm('colEstimativa')}</dt>
                <dd className="text-gray-800 mt-0.5">
                  {lead.estimated_min !== null ? fmtEur(lead.estimated_min) : '?'} – {lead.estimated_max !== null ? fmtEur(lead.estimated_max) : '?'}
                </dd>
              </div>
            )}
            {lead.notes && (
              <div className="col-span-2">
                <dt className="text-xs text-gray-400 uppercase font-medium">{tCommon('notas')}</dt>
                <dd className="text-gray-700 mt-0.5 whitespace-pre-wrap text-xs leading-relaxed">{lead.notes}</dd>
              </div>
            )}
          </dl>

          {lead.proposal_id && (
            <a
              href={`/admin/propostas/${lead.proposal_id}/output`}
              className="inline-flex items-center gap-1.5 text-sm text-green-700 hover:underline"
            >
              {t('propostaVinculada')}
            </a>
          )}

          {lead.claude_chat_url && (
            <a
              href={lead.claude_chat_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:underline"
            >
              {t('conversaClaude')}
            </a>
          )}

          {/* Contact timeline */}
          {timeline.length > 0 && (
            <div>
              <p className="text-xs text-gray-400 uppercase font-medium mb-3">{tCrm('historicoContatos')}</p>
              <ul className="space-y-2">
                {timeline.map(c => (
                  <li key={c.id} className="flex gap-3 items-start text-sm">
                    <span className="text-base leading-none mt-0.5">{CONTACT_TYPE_ICON[c.type]}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                          c.direction === 'sent' ? 'bg-blue-50 text-blue-700' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {tDirection(c.direction)}
                        </span>
                        <span className="text-xs text-gray-400">{fmtDate(c.created_at)}</span>
                        {c.is_automatic && (
                          <span className="text-xs text-gray-400 italic">{c.automatic_label ?? tCrm('automatico')}</span>
                        )}
                      </div>
                      {c.note && <p className="text-gray-600 mt-0.5 text-xs">{c.note}</p>}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ── Emails Tab ────────────────────────────────────────────────────────────────

function EmailsTab({ tour_clients, email_logs }: { tour_clients: TourClient[]; email_logs: EmailLog[] }) {
  const [selectedClientId, setSelectedClientId] = useState<string | null>(tour_clients[0]?.id ?? null);
  const t = useTranslations('admin.contatos');
  const tCommon = useTranslations('admin.common');
  const tEmailStatus = useTranslations('admin.status.email');
  const tClientStatus = useTranslations('admin.status.client');
  const client = tour_clients.find(c => c.id === selectedClientId) ?? tour_clients[0] ?? null;
  const logs = email_logs.filter(l => l.client_id === client?.id);

  if (tour_clients.length === 0) {
    return (
      <div className="p-6">
        <p className="text-sm text-gray-400 italic">{t('nenhumClienteTour')}</p>
      </div>
    );
  }

  const STATUS_BADGE_CLASS: Record<EmailLog['status'], string> = {
    sent:    'bg-green-100 text-green-700',
    pending: 'bg-gray-100 text-gray-600',
    error:   'bg-red-100 text-red-700',
    skipped: 'bg-gray-100 text-gray-400',
  };

  const CLIENT_STATUS_CLASS: Record<TourClient['status'], string> = {
    active:    'bg-green-100 text-green-700',
    completed: 'bg-blue-100 text-blue-700',
    cancelled: 'bg-gray-100 text-gray-500',
    pending:   'bg-amber-100 text-amber-700',
  };

  return (
    <div className="p-6 space-y-6">
      {/* Client selector */}
      {tour_clients.length > 1 && (
        <div className="flex gap-2 flex-wrap">
          {tour_clients.map(tc => (
            <button
              key={tc.id}
              onClick={() => setSelectedClientId(tc.id)}
              className={`px-3 py-1 text-xs font-medium rounded-full border transition-colors ${
                tc.id === client?.id
                  ? 'border-green-500 bg-green-50 text-green-700'
                  : 'border-gray-200 text-gray-500 hover:border-gray-300'
              }`}
            >
              {fmtDate(tc.arrival_date)}
            </button>
          ))}
        </div>
      )}

      {client && (
        <>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
            <div>
              <dt className="text-xs text-gray-400 uppercase font-medium">{tCommon('status')}</dt>
              <dd className="mt-0.5">
                <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${CLIENT_STATUS_CLASS[client.status]}`}>
                  {tClientStatus(client.status)}
                </span>
              </dd>
            </div>
            <div>
              <dt className="text-xs text-gray-400 uppercase font-medium">{tCommon('pax')}</dt>
              <dd className="text-gray-800 mt-0.5">{client.pax}</dd>
            </div>
            <div>
              <dt className="text-xs text-gray-400 uppercase font-medium">{t('chegada')}</dt>
              <dd className="text-gray-800 mt-0.5">{fmtDate(client.arrival_date)}</dd>
            </div>
            <div>
              <dt className="text-xs text-gray-400 uppercase font-medium">{t('saida')}</dt>
              <dd className="text-gray-800 mt-0.5">{fmtDate(client.departure_date)}</dd>
            </div>
            {client.total_amount && (
              <div>
                <dt className="text-xs text-gray-400 uppercase font-medium">{tCommon('total')}</dt>
                <dd className="text-gray-800 mt-0.5">{fmtEur(client.total_amount)}</dd>
              </div>
            )}
            {client.deposit_amount && (
              <div>
                <dt className="text-xs text-gray-400 uppercase font-medium">{t('sinal')}</dt>
                <dd className="text-gray-800 mt-0.5">{fmtEur(client.deposit_amount)}</dd>
              </div>
            )}
          </dl>

          {/* Email sequence */}
          {logs.length > 0 ? (
            <div>
              <p className="text-xs text-gray-400 uppercase font-medium mb-3">{t('sequenciaEmails')}</p>
              <ul className="space-y-2">
                {logs.map(log => {
                  const badgeClass = STATUS_BADGE_CLASS[log.status];
                  const templateName = log.email_templates?.name ?? log.email_name;

                  return (
                    <li key={log.id} className="flex items-center gap-3 text-sm py-2 border-b border-gray-100 last:border-0">
                      <span className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        log.status === 'sent' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {log.email_number}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-800 truncate">{templateName}</p>
                        <p className="text-xs text-gray-400">
                          {log.phase === 'pre_tour' ? t('preTour') : log.phase === 'pos_tour' ? t('posTour') : ''}
                          {' · '}{fmtDate(log.scheduled_date)}
                          {log.sent_at && t('enviadoEm', { data: fmtDate(log.sent_at) })}
                        </p>
                      </div>
                      <span className={`flex-shrink-0 px-2 py-0.5 text-xs font-medium rounded-full ${badgeClass}`}>
                        {tEmailStatus(log.status)}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          ) : (
            <p className="text-sm text-gray-400 italic">{t('nenhumEmailSequencia')}</p>
          )}
        </>
      )}
    </div>
  );
}

// ── Dokumente Tab ─────────────────────────────────────────────────────────────

interface ContactDocument {
  id: string;
  file_name: string;
  storage_path: string;
  label: string;
  notes: string | null;
  uploaded_at: string;
  signed_url: string | null;
}

function DokumenteTab({ contactId }: { contactId: string }) {
  const [docs, setDocs] = useState<ContactDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [summarizing, setSummarizing] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [label, setLabel] = useState('');
  const [notes, setNotes] = useState('');
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [savingId, setSavingId] = useState<string | null>(null);
  const t = useTranslations('admin.contatos.documentos');
  const tCommon = useTranslations('admin.common');

  useEffect(() => {
    fetch(`/api/admin/contacts/${contactId}/documents`)
      .then(r => r.json())
      .then(d => { setDocs(Array.isArray(d) ? d : []); })
      .catch(() => setError(t('erroCarregar')))
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contactId]);

  const handleFile = async (file: File) => {
    if (file.type !== 'application/pdf') { setError(t('apenasPdf')); return; }
    if (file.size > 20 * 1024 * 1024) { setError(t('arquivoGrande')); return; }
    setError(null);
    setPendingFile(file);
    setLabel(file.name.replace(/\.pdf$/i, '').replace(/[_-]/g, ' '));
    setNotes('');

    // AI summary
    setSummarizing(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/admin/ai/summarize-pdf', { method: 'POST', body: fd });
      const data = await res.json();
      if (res.ok && data.summary) setNotes(data.summary);
    } catch {
      // silently ignore — user can fill manually
    } finally {
      setSummarizing(false);
    }
  };

  const handleUpload = async () => {
    if (!pendingFile) return;
    setUploading(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append('file', pendingFile);
      fd.append('label', label.trim() || pendingFile.name);
      if (notes.trim()) fd.append('notes', notes.trim());

      const res = await fetch(`/api/admin/contacts/${contactId}/documents`, { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? t('erroUpload'));

      setDocs(prev => [data, ...prev]);
      setPendingFile(null);
      setLabel('');
      setNotes('');
    } catch (e) {
      setError(e instanceof Error ? e.message : t('erroUpload'));
    } finally {
      setUploading(false);
    }
  };

  const handleStartEdit = (doc: ContactDocument) => {
    setEditingId(doc.id);
    setEditLabel(doc.label);
    setEditNotes(doc.notes ?? '');
  };

  const handleSaveEdit = async (doc: ContactDocument) => {
    setSavingId(doc.id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/contacts/${contactId}/documents/${doc.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ label: editLabel.trim() || doc.file_name, notes: editNotes.trim() || null }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? t('erroSalvar'));
      setDocs(prev => prev.map(d => d.id === doc.id ? { ...d, label: data.label, notes: data.notes } : d));
      setEditingId(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : t('erroSalvar'));
    } finally {
      setSavingId(null);
    }
  };

  const handleDelete = async (doc: ContactDocument) => {
    if (!confirm(t('confirmarExcluir', { nome: doc.label || doc.file_name }))) return;
    setDeletingId(doc.id);
    try {
      const res = await fetch(`/api/admin/contacts/${contactId}/documents/${doc.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error(t('erroExcluir'));
      setDocs(prev => prev.filter(d => d.id !== doc.id));
    } catch (e) {
      setError(e instanceof Error ? e.message : t('erroExcluir'));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {error && (
        <div className="p-3 rounded-lg text-sm bg-red-50 text-red-800 border border-red-200">{error}</div>
      )}

      {/* Upload area */}
      {!pendingFile ? (
        <div
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={e => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
          className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
            dragOver ? 'border-green-400 bg-green-50' : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <input
            type="file"
            accept="application/pdf"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ''; }}
          />
          <svg className="w-8 h-8 mx-auto mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-sm text-gray-500">{t('soltarPdf')}<span className="text-green-600 font-medium">{t('selecionar')}</span></p>
          <p className="text-xs text-gray-400 mt-1">{t('apenasPdfMax')}</p>
        </div>
      ) : (
        <div className="border border-gray-200 rounded-xl p-4 space-y-3 bg-gray-50">
          <div className="flex items-center gap-3">
            <svg className="w-8 h-8 text-red-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
            </svg>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-800 truncate">{pendingFile.name}</p>
              <p className="text-xs text-gray-400">{(pendingFile.size / 1024).toFixed(0)} KB</p>
            </div>
            <button onClick={() => { setPendingFile(null); setLabel(''); setNotes(''); }} className="p-1 text-gray-400 hover:text-gray-600">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div>
            <label className="block text-xs text-gray-500 font-medium mb-1">{t('designacao')} <span className="text-red-400">*</span></label>
            <input
              type="text"
              value={label}
              onChange={e => setLabel(e.target.value)}
              placeholder={t('designacaoPlaceholder')}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs text-gray-500 font-medium">{tCommon('notas')}</label>
              {summarizing && (
                <span className="flex items-center gap-1 text-xs text-purple-600">
                  <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  {t('iaLendoPdf')}
                </span>
              )}
              {!summarizing && notes && (
                <span className="text-xs text-purple-500">{t('sugeridoPelaIa')}</span>
              )}
            </div>
            <textarea
              value={summarizing ? '' : notes}
              onChange={e => setNotes(e.target.value)}
              disabled={summarizing}
              placeholder={summarizing ? t('analisandoPdf') : t('precoProgramas')}
              rows={5}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 resize-none disabled:bg-gray-50 disabled:text-gray-400"
            />
          </div>

          <button
            onClick={handleUpload}
            disabled={uploading || summarizing || !label.trim()}
            className="w-full py-2 text-sm font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? t('enviando') : summarizing ? t('aguardandoIa') : t('salvarPdf')}
          </button>
        </div>
      )}

      {/* Document list */}
      {loading ? (
        <div className="space-y-2">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="h-14 bg-gray-100 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : docs.length === 0 ? (
        <p className="text-sm text-gray-400 italic text-center py-4">{t('nenhumDocumento')}</p>
      ) : (
        <ul className="space-y-2">
          {docs.map((doc, i) => {
            const uploadedAt = fmtDateTime(doc.uploaded_at);
            const isLatest = i === 0 && docs.length > 1;
            return (
            <li key={doc.id} className={`flex items-start gap-3 p-3 rounded-xl border transition-colors ${isLatest ? 'border-green-200 bg-green-50/40' : 'border-gray-100 bg-white hover:border-gray-200'}`}>
              <svg className="w-8 h-8 text-red-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
              </svg>
              {editingId === doc.id ? (
                <div className="flex-1 min-w-0 space-y-2">
                  <input
                    type="text"
                    value={editLabel}
                    onChange={e => setEditLabel(e.target.value)}
                    placeholder={t('designacao')}
                    className="w-full px-2.5 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                  <textarea
                    value={editNotes}
                    onChange={e => setEditNotes(e.target.value)}
                    placeholder={t('notasPlaceholder')}
                    rows={3}
                    className="w-full px-2.5 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleSaveEdit(doc)}
                      disabled={savingId === doc.id || !editLabel.trim()}
                      className="px-3 py-1.5 text-xs font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                    >
                      {savingId === doc.id ? tCommon('salvando') : tCommon('salvar')}
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      {tCommon('cancelar')}
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-medium text-gray-800 truncate">{doc.label || doc.file_name}</p>
                      {isLatest && (
                        <span className="flex-shrink-0 px-1.5 py-0.5 text-xs font-semibold bg-green-100 text-green-700 rounded-full">{t('atual')}</span>
                      )}
                    </div>
                    {doc.notes && <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{doc.notes}</p>}
                    <p className="text-xs font-medium text-gray-500 mt-1">{uploadedAt}</p>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {doc.signed_url && (
                      <a
                        href={doc.signed_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={t('abrirPdf')}
                        className="p-1.5 text-gray-400 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    )}
                    <button
                      onClick={() => handleStartEdit(doc)}
                      title={tCommon('editar')}
                      className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(doc)}
                      disabled={deletingId === doc.id}
                      title={tCommon('excluir')}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </>
              )}
            </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

const TABS: { key: Tab; labelKey: string }[] = [
  { key: 'guide',      labelKey: 'abaGuide' },
  { key: 'crm',        labelKey: 'abaCrm' },
  { key: 'proposta',   labelKey: 'abaPropostas' },
  { key: 'emails',     labelKey: 'abaEmails' },
  { key: 'dokumente',  labelKey: 'abaDocumentos' },
];

export default function ContactProfile({ contactId, contactEmail, contactName, onEdit, onDelete }: ContactProfileProps) {
  const [tab, setTab] = useState<Tab>('guide');
  const [data, setData] = useState<ContactData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const t = useTranslations('admin.contatos');
  const tCommon = useTranslations('admin.common');

  const copyEmail = () => {
    navigator.clipboard.writeText(contactEmail).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/admin/contacts/${contactId}`)
      .then(r => r.json())
      .then(d => {
        if (cancelled) return;
        if (d.error) setError(d.error);
        else setData(d as ContactData);
      })
      .catch(() => { if (!cancelled) setError(t('erroCarregarPerfil')); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contactId]);

  const displayName = contactName || contactEmail;

  return (
    <div className="flex flex-col min-h-full">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-5">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-base font-bold text-gray-600 select-none">
            {(contactName?.trim() ?? contactEmail).slice(0, 2).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold text-gray-900 truncate">{displayName}</h2>
            <div className="flex items-center gap-1.5 mt-0.5">
              <p className="text-sm text-gray-500 truncate">{contactEmail}</p>
              <button
                onClick={copyEmail}
                title={t('copiarEmail')}
                className="flex-shrink-0 p-1 rounded text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
              >
                {copied ? (
                  <svg className="w-3.5 h-3.5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                )}
              </button>
            </div>
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {onEdit && (
              <button
                onClick={onEdit}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                {tCommon('editar')}
              </button>
            )}
            {onDelete && (
              <button
                onClick={onDelete}
                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title={t('removerContato')}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mt-5 -mb-px">
          {TABS.map(tabItem => (
            <button
              key={tabItem.key}
              onClick={() => setTab(tabItem.key)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                tab === tabItem.key
                  ? 'border-green-600 text-green-700'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {t(tabItem.labelKey)}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="flex-1">
        {tab === 'dokumente' ? (
          <DokumenteTab contactId={contactId} />
        ) : (
          <>
            {loading && (
              <div className="p-6 space-y-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-4 bg-gray-100 rounded animate-pulse" style={{ width: `${60 + i * 10}%` }} />
                ))}
              </div>
            )}
            {error && (
              <div className="m-6 p-3 rounded-lg text-sm bg-red-50 text-red-800 border border-red-200">{error}</div>
            )}
            {!loading && !error && data && (
              <>
                {tab === 'guide' && (
                  <GuideTab
                    profile={data.profile}
                    pages_read={data.pages_read}
                    contactEmail={contactEmail}
                  />
                )}
                {tab === 'crm' && (
                  <ContactCRMTab
                    leads={data.leads}
                    lead_contacts={data.lead_contacts}
                  />
                )}
                {tab === 'proposta' && (
                  <ContactPropostaTab
                    leads={data.leads}
                    proposals={data.proposals}
                  />
                )}
                {tab === 'emails' && (
                  <EmailsTab
                    tour_clients={data.tour_clients}
                    email_logs={data.email_logs}
                  />
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import ContactCRMTab from '@/components/admin/ContactCRMTab';

type Tab = 'guide' | 'crm' | 'emails';

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
}

interface ContactProfileProps {
  contactId: string;
  contactEmail: string;
  contactName: string | null;
  onEdit?: () => void;
  onDelete?: () => void;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function fmt(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function RoleBadge({ role }: { role: Profile['role'] }) {
  const map: Record<Profile['role'], { label: string; cls: string }> = {
    admin:   { label: 'Admin',   cls: 'bg-purple-100 text-purple-700' },
    premium: { label: 'Premium', cls: 'bg-amber-100 text-amber-700' },
    user:    { label: 'Free',    cls: 'bg-gray-100 text-gray-600' },
  };
  const { label, cls } = map[role];
  return <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${cls}`}>{label}</span>;
}

// ── Guide Tab ─────────────────────────────────────────────────────────────────

function GuideTab({ profile, pages_read, contactEmail }: { profile: Profile | null; pages_read: number; contactEmail: string }) {
  const [upgrading, setUpgrading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

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
        setToast('Upgrade para Premium realizado ✓');
        setTimeout(() => window.location.reload(), 1200);
      } else {
        const data = await res.json();
        setToast(data.error ?? 'Erro ao fazer upgrade');
      }
    } finally {
      setUpgrading(false);
    }
  };

  if (!profile) {
    return (
      <div className="p-6">
        <p className="text-sm text-gray-400 italic">
          Nenhuma conta Guide encontrada para <span className="font-medium text-gray-600">{contactEmail}</span>.
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
          <dt className="text-xs text-gray-400 uppercase font-medium">Registriert</dt>
          <dd className="text-gray-800 mt-0.5">{fmt(profile.created_at)}</dd>
        </div>
        <div>
          <dt className="text-xs text-gray-400 uppercase font-medium">Seiten gelesen</dt>
          <dd className="text-gray-800 mt-0.5">{pages_read}</dd>
        </div>

        {profile.role === 'premium' && (
          <>
            <div>
              <dt className="text-xs text-gray-400 uppercase font-medium">Premium seit</dt>
              <dd className="text-gray-800 mt-0.5">{profile.premium_since ? fmt(profile.premium_since) : '—'}</dd>
            </div>
            <div>
              <dt className="text-xs text-gray-400 uppercase font-medium">Premium bis</dt>
              <dd className="text-gray-800 mt-0.5">{profile.premium_until ? fmt(profile.premium_until) : '—'}</dd>
            </div>
            {profile.guide_edition && (
              <div>
                <dt className="text-xs text-gray-400 uppercase font-medium">Guide Edition</dt>
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
          {upgrading ? 'Upgrading…' : 'Upgrade para Premium'}
        </button>
      )}
    </div>
  );
}

// ── CRM Tab ───────────────────────────────────────────────────────────────────

const FUNNEL_STEPS: { key: LeadStatus; label: string }[] = [
  { key: 'new',           label: 'Novo' },
  { key: 'contacted',     label: 'Em Contato' },
  { key: 'proposal_sent', label: 'Proposta' },
  { key: 'closed',        label: 'Fechado' },
];

function LeadFunnel({ status }: { status: LeadStatus }) {
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
              {step.label}
            </span>
          </div>
          {i < FUNNEL_STEPS.length - 1 && (
            <div className={`w-5 h-0.5 mb-4 mx-0.5 ${i < currentIdx && !isLost ? 'bg-green-500' : 'bg-gray-200'}`} />
          )}
        </div>
      ))}
      {isLost && (
        <span className="ml-2 self-center px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full font-medium">Perdido</span>
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
  const lead = leads.find(l => l.id === selectedLeadId) ?? leads[0] ?? null;
  const timeline = lead_contacts.filter(c => c.lead_id === lead?.id);

  if (leads.length === 0) {
    return (
      <div className="p-6">
        <p className="text-sm text-gray-400 italic">Nenhum lead encontrado para este contato.</p>
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
              {fmt(l.created_at)}
            </button>
          ))}
        </div>
      )}

      {lead && (
        <>
          {/* Funnel */}
          <div>
            <p className="text-xs text-gray-400 uppercase font-medium mb-3">Funil</p>
            <LeadFunnel status={lead.status} />
          </div>

          {/* Lead details */}
          <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
            <div>
              <dt className="text-xs text-gray-400 uppercase font-medium">PAX</dt>
              <dd className="text-gray-800 mt-0.5">{lead.pax}</dd>
            </div>
            <div>
              <dt className="text-xs text-gray-400 uppercase font-medium">Origem</dt>
              <dd className="text-gray-800 mt-0.5 capitalize">{lead.source}</dd>
            </div>
            {(lead.estimated_min || lead.estimated_max) && (
              <div className="col-span-2">
                <dt className="text-xs text-gray-400 uppercase font-medium">Estimativa</dt>
                <dd className="text-gray-800 mt-0.5">
                  € {lead.estimated_min ?? '?'} – € {lead.estimated_max ?? '?'}
                </dd>
              </div>
            )}
            {lead.notes && (
              <div className="col-span-2">
                <dt className="text-xs text-gray-400 uppercase font-medium">Notas</dt>
                <dd className="text-gray-700 mt-0.5 whitespace-pre-wrap text-xs leading-relaxed">{lead.notes}</dd>
              </div>
            )}
          </dl>

          {lead.proposal_id && (
            <a
              href={`/admin/propostas/${lead.proposal_id}`}
              className="inline-flex items-center gap-1.5 text-sm text-green-700 hover:underline"
            >
              📋 Ver proposta vinculada
            </a>
          )}

          {lead.claude_chat_url && (
            <a
              href={lead.claude_chat_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:underline"
            >
              🤖 Conversa no Claude
            </a>
          )}

          {/* Contact timeline */}
          {timeline.length > 0 && (
            <div>
              <p className="text-xs text-gray-400 uppercase font-medium mb-3">Histórico de Contatos</p>
              <ul className="space-y-2">
                {timeline.map(c => (
                  <li key={c.id} className="flex gap-3 items-start text-sm">
                    <span className="text-base leading-none mt-0.5">{CONTACT_TYPE_ICON[c.type]}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                          c.direction === 'sent' ? 'bg-blue-50 text-blue-700' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {c.direction === 'sent' ? 'Enviado' : 'Recebido'}
                        </span>
                        <span className="text-xs text-gray-400">{fmt(c.created_at)}</span>
                        {c.is_automatic && (
                          <span className="text-xs text-gray-400 italic">{c.automatic_label ?? 'automático'}</span>
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
  const client = tour_clients.find(c => c.id === selectedClientId) ?? tour_clients[0] ?? null;
  const logs = email_logs.filter(l => l.client_id === client?.id);

  if (tour_clients.length === 0) {
    return (
      <div className="p-6">
        <p className="text-sm text-gray-400 italic">Nenhum cliente com tour encontrado para este contato.</p>
      </div>
    );
  }

  const STATUS_BADGE: Record<EmailLog['status'], { label: string; cls: string }> = {
    sent:    { label: 'Enviado',   cls: 'bg-green-100 text-green-700' },
    pending: { label: 'Agendado',  cls: 'bg-gray-100 text-gray-600' },
    error:   { label: 'Erro',      cls: 'bg-red-100 text-red-700' },
    skipped: { label: 'Ignorado',  cls: 'bg-gray-100 text-gray-400' },
  };

  const CLIENT_STATUS: Record<TourClient['status'], { label: string; cls: string }> = {
    active:    { label: 'Ativo',       cls: 'bg-green-100 text-green-700' },
    completed: { label: 'Concluído',   cls: 'bg-blue-100 text-blue-700' },
    cancelled: { label: 'Cancelado',   cls: 'bg-gray-100 text-gray-500' },
    pending:   { label: 'Pendente',    cls: 'bg-amber-100 text-amber-700' },
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
              {fmt(tc.arrival_date)}
            </button>
          ))}
        </div>
      )}

      {client && (
        <>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
            <div>
              <dt className="text-xs text-gray-400 uppercase font-medium">Status</dt>
              <dd className="mt-0.5">
                <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${CLIENT_STATUS[client.status].cls}`}>
                  {CLIENT_STATUS[client.status].label}
                </span>
              </dd>
            </div>
            <div>
              <dt className="text-xs text-gray-400 uppercase font-medium">PAX</dt>
              <dd className="text-gray-800 mt-0.5">{client.pax}</dd>
            </div>
            <div>
              <dt className="text-xs text-gray-400 uppercase font-medium">Chegada</dt>
              <dd className="text-gray-800 mt-0.5">{fmt(client.arrival_date)}</dd>
            </div>
            <div>
              <dt className="text-xs text-gray-400 uppercase font-medium">Saída</dt>
              <dd className="text-gray-800 mt-0.5">{fmt(client.departure_date)}</dd>
            </div>
            {client.total_amount && (
              <div>
                <dt className="text-xs text-gray-400 uppercase font-medium">Total</dt>
                <dd className="text-gray-800 mt-0.5">€ {client.total_amount}</dd>
              </div>
            )}
            {client.deposit_amount && (
              <div>
                <dt className="text-xs text-gray-400 uppercase font-medium">Sinal</dt>
                <dd className="text-gray-800 mt-0.5">€ {client.deposit_amount}</dd>
              </div>
            )}
          </dl>

          {/* Email sequence */}
          {logs.length > 0 ? (
            <div>
              <p className="text-xs text-gray-400 uppercase font-medium mb-3">Sequência de E-mails</p>
              <ul className="space-y-2">
                {logs.map(log => {
                  const badge = STATUS_BADGE[log.status];
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
                          {log.phase === 'pre_tour' ? 'Pré-tour' : log.phase === 'pos_tour' ? 'Pós-tour' : ''}
                          {' · '}{fmt(log.scheduled_date)}
                          {log.sent_at && ` · enviado ${fmt(log.sent_at)}`}
                        </p>
                      </div>
                      <span className={`flex-shrink-0 px-2 py-0.5 text-xs font-medium rounded-full ${badge.cls}`}>
                        {badge.label}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          ) : (
            <p className="text-sm text-gray-400 italic">Nenhum e-mail na sequência ainda.</p>
          )}
        </>
      )}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

const TABS: { key: Tab; label: string }[] = [
  { key: 'guide',  label: 'Guide' },
  { key: 'crm',    label: 'CRM' },
  { key: 'emails', label: 'E-mails' },
];

export default function ContactProfile({ contactId, contactEmail, contactName, onEdit, onDelete }: ContactProfileProps) {
  const [tab, setTab] = useState<Tab>('guide');
  // Component always mounts fresh (key={contactId} in parent), so initial state is always clean
  const [data, setData] = useState<ContactData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/admin/contacts/${contactId}`)
      .then(r => r.json())
      .then(d => {
        if (cancelled) return;
        if (d.error) setError(d.error);
        else setData(d as ContactData);
      })
      .catch(() => { if (!cancelled) setError('Netzwerkfehler beim Laden des Profils.'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
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
            {contactName && <p className="text-sm text-gray-500 truncate">{contactEmail}</p>}
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
                Editar
              </button>
            )}
            {onDelete && (
              <button
                onClick={onDelete}
                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Remover contato"
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
          {TABS.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                tab === t.key
                  ? 'border-green-600 text-green-700'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="flex-1">
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
            {tab === 'emails' && (
              <EmailsTab
                tour_clients={data.tour_clients}
                email_logs={data.email_logs}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}

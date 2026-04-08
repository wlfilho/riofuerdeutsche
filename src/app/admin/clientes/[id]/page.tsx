'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';

interface Client {
  id: string;
  name: string;
  email: string;
  arrival_date: string;
  departure_date: string;
  tour_details: string | null;
  status: 'active' | 'completed' | 'cancelled';
  total_amount: number | null;
  deposit_amount: number | null;
}

interface EmailLog {
  id: string;
  email_number: number;
  email_name: string;
  scheduled_date: string;
  sent_at: string | null;
  status: 'pending' | 'sent' | 'error' | 'skipped';
  error_message: string | null;
  resend_id: string | null;
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function formatDateTime(date: string) {
  return new Date(date).toLocaleString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function StatusBadge({ status }: { status: Client['status'] }) {
  if (status === 'active') {
    return (
      <span className="inline-block px-2.5 py-0.5 text-xs font-semibold rounded-full bg-green-100 text-green-700">
        Aktiv
      </span>
    );
  }
  if (status === 'completed') {
    return (
      <span className="inline-block px-2.5 py-0.5 text-xs font-semibold rounded-full bg-gray-100 text-gray-600">
        Abgeschlossen
      </span>
    );
  }
  return (
    <span className="inline-block px-2.5 py-0.5 text-xs font-semibold rounded-full bg-red-100 text-red-700">
      Storniert
    </span>
  );
}

const EMAIL_BORDER: Record<EmailLog['status'], string> = {
  sent: 'border-l-green-500',
  pending: 'border-l-yellow-400',
  error: 'border-l-red-500',
  skipped: 'border-l-gray-300',
};

const EMAIL_ICON: Record<EmailLog['status'], string> = {
  sent: '✅',
  pending: '⏳',
  error: '❌',
  skipped: '⏭',
};

function EmailCard({
  log,
  clientId,
  onUpdated,
}: {
  log: EmailLog;
  clientId: string;
  onUpdated: (updated: EmailLog) => void;
}) {
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);

  const handleResend = async () => {
    setSending(true);
    setSendError(null);
    try {
      const res = await fetch(`/api/admin/clients/${clientId}/resend-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email_log_id: log.id }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSendError(data.error ?? 'Fehler beim Senden.');
      } else {
        onUpdated({
          ...log,
          status: 'sent',
          sent_at: new Date().toISOString(),
          resend_id: data.resend_id ?? null,
          error_message: null,
        });
      }
    } catch {
      setSendError('Netzwerkfehler.');
    } finally {
      setSending(false);
    }
  };

  const showResend = log.status === 'error' || log.status === 'sent';

  return (
    <div className={`bg-white rounded-xl border border-gray-200 border-l-4 ${EMAIL_BORDER[log.status]} p-5`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          {/* Title */}
          <p className="text-sm font-semibold text-gray-900">
            {EMAIL_ICON[log.status]}{' '}
            {log.email_number} — {log.email_name}
          </p>

          {/* Status line */}
          <p className="mt-1 text-sm text-gray-500">
            {log.status === 'pending' && `Geplant für ${formatDate(log.scheduled_date)}`}
            {log.status === 'sent' && log.sent_at && `Gesendet am ${formatDateTime(log.sent_at)} Uhr`}
            {log.status === 'error' && `Fehler: ${log.error_message ?? 'Unbekannter Fehler'}`}
            {log.status === 'skipped' && 'Übersprungen (Datum bereits vergangen)'}
          </p>

          {/* Inline send error */}
          {sendError && (
            <p className="mt-1.5 text-xs text-red-600">{sendError}</p>
          )}
        </div>

        {/* Resend button */}
        {showResend && (
          <button
            onClick={handleResend}
            disabled={sending}
            className={`shrink-0 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
              log.status === 'error'
                ? 'bg-red-50 text-red-700 hover:bg-red-100'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {sending ? 'Wird gesendet...' : 'Erneut senden'}
          </button>
        )}
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-2 animate-pulse">
      <div className="h-4 bg-gray-100 rounded w-1/3" />
      <div className="h-3 bg-gray-100 rounded w-1/2" />
    </div>
  );
}

export default function ClienteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const [client, setClient] = useState<Client | null>(null);
  const [emails, setEmails] = useState<EmailLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/admin/clients/${id}`)
      .then(res => res.json())
      .then(data => {
        if (data.client) {
          setClient(data.client);
          setEmails(data.emails ?? []);
        } else {
          setError(data.error ?? 'Fehler beim Laden.');
        }
      })
      .catch(() => setError('Netzwerkfehler.'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleEmailUpdated = (updated: EmailLog) => {
    setEmails(prev => prev.map(e => (e.id === updated.id ? updated : e)));
  };

  return (
    <div className="p-6 md:p-10">
      <div className="max-w-2xl">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
          <Link href="/admin/clientes" className="hover:text-gray-600 transition-colors">
            Clientes
          </Link>
          <span>→</span>
          <span className="text-gray-600 truncate">
            {loading ? '...' : (client?.name ?? 'Nicht gefunden')}
          </span>
        </div>

        {/* Error state */}
        {error && (
          <div className="p-4 rounded-xl text-sm bg-red-50 text-red-800 border border-red-200">
            {error}
          </div>
        )}

        {/* Loading skeleton */}
        {loading && (
          <div className="space-y-6 animate-pulse">
            <div className="h-8 bg-gray-100 rounded w-48" />
            <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-4 bg-gray-100 rounded" style={{ width: `${60 + i * 10}%` }} />
              ))}
            </div>
            <div className="space-y-3">
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </div>
          </div>
        )}

        {/* Content */}
        {!loading && client && (
          <>
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
              <h1 className="text-3xl font-bold text-gray-900">{client.name}</h1>
              <StatusBadge status={client.status} />
            </div>

            {/* Info card */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
              <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">E-Mail</p>
                  <a
                    href={`mailto:${client.email}`}
                    className="text-sm font-medium text-green-700 hover:underline"
                  >
                    {client.email}
                  </a>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Ankunft</p>
                  <p className="text-sm font-medium text-gray-900">
                    {formatDate(client.arrival_date)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Abreise</p>
                  <p className="text-sm font-medium text-gray-900">
                    {formatDate(client.departure_date)}
                  </p>
                </div>
                {client.tour_details && (
                  <div className="col-span-2">
                    <p className="text-xs text-gray-400 mb-0.5">Tour-Details</p>
                    <p className="text-sm text-gray-700">{client.tour_details}</p>
                  </div>
                )}
                {client.total_amount != null && (
                  <>
                    <div>
                      <p className="text-xs text-gray-400 mb-0.5">Gesamtbetrag</p>
                      <p className="text-sm font-medium text-gray-900">
                        {client.total_amount.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 mb-0.5">Anzahlung</p>
                      <p className="text-sm font-medium text-gray-900">
                        {(client.deposit_amount ?? 0).toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 mb-0.5">Restbetrag</p>
                      <p className="text-sm font-medium text-gray-900">
                        {(client.total_amount - (client.deposit_amount ?? 0)).toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Email timeline */}
            <div>
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
                E-Mail Sequenz
              </h2>
              <div className="space-y-3">
                {emails.map(log => (
                  <EmailCard
                    key={log.id}
                    log={log}
                    clientId={id}
                    onUpdated={handleEmailUpdated}
                  />
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

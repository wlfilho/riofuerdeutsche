'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Client {
  id: string;
  name: string;
  email: string;
  arrival_date: string;
  departure_date: string;
  status: 'active' | 'completed' | 'cancelled';
  emails_sent: number;
  emails_total: number;
  created_at: string;
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function StatusBadge({ status }: { status: Client['status'] }) {
  if (status === 'active') {
    return (
      <span className="inline-block px-2 py-0.5 text-xs font-semibold rounded-full bg-green-100 text-green-700">
        Aktiv
      </span>
    );
  }
  if (status === 'completed') {
    return (
      <span className="inline-block px-2 py-0.5 text-xs font-semibold rounded-full bg-gray-100 text-gray-600">
        Abgeschlossen
      </span>
    );
  }
  return (
    <span className="inline-block px-2 py-0.5 text-xs font-semibold rounded-full bg-red-100 text-red-700">
      Storniert
    </span>
  );
}

function EmailProgress({ sent, total }: { sent: number; total: number }) {
  const pct = total > 0 ? (sent / total) * 100 : 0;
  return (
    <div className="flex items-center gap-2">
      <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-green-500 rounded-full transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs text-gray-500 tabular-nums">{sent} / {total}</span>
    </div>
  );
}

function SkeletonRow() {
  return (
    <tr>
      {[...Array(7)].map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-4 bg-gray-100 rounded animate-pulse" style={{ width: i === 1 ? '60%' : '80%' }} />
        </td>
      ))}
    </tr>
  );
}

export default function ClientesPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/admin/clients')
      .then(res => res.json())
      .then(data => {
        if (data.clients) setClients(data.clients);
        else setError(data.error ?? 'Fehler beim Laden.');
      })
      .catch(() => setError('Netzwerkfehler.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-6 md:p-10">
      <div className="max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">🧳 Clientes</h1>
            <p className="text-gray-500 mt-1">Touristen mit aktiver Buchung</p>
          </div>
          <Link
            href="/admin/clientes/novo"
            className="px-4 py-2 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 transition-colors"
          >
            + Neuer Kunde
          </Link>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 p-3 rounded-lg text-sm bg-red-50 text-red-800 border border-red-200">
            {error}
          </div>
        )}

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                    Name
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase hidden sm:table-cell">
                    E-Mail
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                    Chegada
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">
                    Saída
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                    Progresso
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase hidden sm:table-cell">
                    Status
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <>
                    <SkeletonRow />
                    <SkeletonRow />
                    <SkeletonRow />
                  </>
                ) : clients.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-16 text-center">
                      <p className="text-gray-400 text-sm mb-3">Noch keine Kunden</p>
                      <Link
                        href="/admin/clientes/novo"
                        className="inline-block px-4 py-2 text-sm font-semibold bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        + Ersten Kunden anlegen
                      </Link>
                    </td>
                  </tr>
                ) : (
                  clients.map(client => (
                    <tr key={client.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium text-gray-900">{client.name}</p>
                        <p className="text-xs text-gray-400 sm:hidden">{client.email}</p>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 hidden sm:table-cell">
                        {client.email}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 tabular-nums">
                        {formatDate(client.arrival_date)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 tabular-nums hidden md:table-cell">
                        {formatDate(client.departure_date)}
                      </td>
                      <td className="px-4 py-3">
                        <EmailProgress sent={client.emails_sent} total={client.emails_total} />
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <StatusBadge status={client.status} />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          href={`/admin/clientes/${client.id}`}
                          className="px-3 py-1.5 text-xs font-medium bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                          Details
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

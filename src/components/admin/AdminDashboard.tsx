'use client';

import { useState, useEffect, useCallback } from 'react';

interface UserProfile {
  id: string;
  email: string;
  role: 'user' | 'premium' | 'admin';
  created_at: string;
  premium_since: string | null;
  premium_until: string | null;
  payment_id: string | null;
  guide_edition: number | null;
}

export default function AdminDashboard() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [message, setMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const [upgradeModal, setUpgradeModal] = useState<{
    open: boolean;
    user: UserProfile | null;
  }>({ open: false, user: null });
  const [upgradeEdition, setUpgradeEdition] = useState(1);
  const [upgradePremiumUntil, setUpgradePremiumUntil] = useState('');

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (roleFilter) params.set('role', roleFilter);

      const res = await fetch(`/api/admin/users?${params}`);
      const data = await res.json();

      if (data.users) {
        setUsers(data.users);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  }, [search, roleFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers();
    }, 300);
    return () => clearTimeout(timer);
  }, [search, fetchUsers]);

  const updateRole = async (
    userId: string,
    role: string,
    extra?: { premium_until?: string; guide_edition?: number }
  ) => {
    setActionLoading(userId);
    setMessage(null);

    try {
      const res = await fetch(`/api/admin/users/${userId}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role, ...extra }),
      });

      const data = await res.json();

      if (data.success) {
        setMessage({ type: 'success', text: 'Rolle erfolgreich aktualisiert.' });
        fetchUsers();
      } else {
        setMessage({
          type: 'error',
          text: data.error || 'Fehler beim Aktualisieren.',
        });
      }
    } catch {
      setMessage({ type: 'error', text: 'Netzwerkfehler.' });
    } finally {
      setActionLoading(null);
      setUpgradeModal({ open: false, user: null });
    }
  };

  const totalUsers = users.length;
  const premiumUsers = users.filter((u) => u.role === 'premium').length;
  const freeUsers = users.filter((u) => u.role === 'user').length;
  const adminUsers = users.filter((u) => u.role === 'admin').length;

  const formatDate = (date: string | null) => {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-500 mt-1">
            Benutzer verwalten · Rio für Deutsche
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <p className="text-sm text-gray-500">Gesamt</p>
            <p className="text-2xl font-bold text-gray-900">{totalUsers}</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <p className="text-sm text-gray-500">Kostenlos</p>
            <p className="text-2xl font-bold text-blue-600">{freeUsers}</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <p className="text-sm text-gray-500">Premium</p>
            <p className="text-2xl font-bold text-yellow-600">{premiumUsers}</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <p className="text-sm text-gray-500">Admin</p>
            <p className="text-2xl font-bold text-red-600">{adminUsers}</p>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div
            className={`mb-4 p-3 rounded-lg text-sm ${
              message.type === 'success'
                ? 'bg-green-50 text-green-800 border border-green-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <input
            type="text"
            placeholder="E-Mail suchen..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
          >
            <option value="all">Alle Rollen</option>
            <option value="user">Kostenlos</option>
            <option value="premium">Premium</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                    E-Mail
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                    Rolle
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">
                    Registriert
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">
                    Premium seit
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase hidden lg:table-cell">
                    Edition
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                    Aktionen
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                      Laden...
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                      Keine Benutzer gefunden.
                    </td>
                  </tr>
                ) : (
                  users.map((u) => (
                    <tr key={u.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium text-gray-900">
                          {u.email}
                        </p>
                        <p className="text-xs text-gray-400 md:hidden">
                          {formatDate(u.created_at)}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-block px-2 py-0.5 text-xs font-semibold rounded-full ${
                            u.role === 'admin'
                              ? 'bg-red-100 text-red-700'
                              : u.role === 'premium'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {u.role === 'admin'
                            ? 'Admin'
                            : u.role === 'premium'
                            ? 'Premium'
                            : 'Kostenlos'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500 hidden md:table-cell">
                        {formatDate(u.created_at)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500 hidden md:table-cell">
                        {formatDate(u.premium_since)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500 hidden lg:table-cell">
                        {u.guide_edition ? `Ed. ${u.guide_edition}` : '—'}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-2">
                          {u.role === 'user' && (
                            <button
                              onClick={() => {
                                setUpgradeModal({ open: true, user: u });
                                setUpgradeEdition(1);
                                setUpgradePremiumUntil('');
                              }}
                              disabled={actionLoading === u.id}
                              className="px-3 py-1 text-xs font-medium bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition-colors disabled:opacity-50"
                            >
                              {actionLoading === u.id ? '...' : 'Upgrade'}
                            </button>
                          )}
                          {u.role === 'premium' && (
                            <button
                              onClick={() => updateRole(u.id, 'user')}
                              disabled={actionLoading === u.id}
                              className="px-3 py-1 text-xs font-medium bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
                            >
                              {actionLoading === u.id ? '...' : 'Widerrufen'}
                            </button>
                          )}
                          {u.role === 'admin' && (
                            <span className="text-xs text-gray-400 px-3 py-1">
                              —
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Upgrade Modal */}
        {upgradeModal.open && upgradeModal.user && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl">
              <h3 className="text-lg font-bold text-gray-900 mb-1">
                Upgrade zu Premium
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                {upgradeModal.user.email}
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Guide-Edition
                  </label>
                  <select
                    value={upgradeEdition}
                    onChange={(e) => setUpgradeEdition(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
                  >
                    <option value={1}>Edition 1 — O Essencial (9€)</option>
                    <option value={2}>Edition 2 — Viver o Rio (14€)</option>
                    <option value={3}>Edition 3 — Rio como um Local (19€)</option>
                    <option value={4}>Edition 4 — Rio Completo (24€)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ablaufdatum (optional)
                  </label>
                  <input
                    type="date"
                    value={upgradePremiumUntil}
                    onChange={(e) => setUpgradePremiumUntil(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Leer lassen = lebenslanger Zugang
                  </p>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setUpgradeModal({ open: false, user: null })}
                  className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Abbrechen
                </button>
                <button
                  onClick={() =>
                    updateRole(upgradeModal.user!.id, 'premium', {
                      guide_edition: upgradeEdition,
                      premium_until: upgradePremiumUntil
                        ? new Date(upgradePremiumUntil).toISOString()
                        : undefined,
                    })
                  }
                  disabled={actionLoading === upgradeModal.user.id}
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  {actionLoading === upgradeModal.user.id
                    ? 'Laden...'
                    : 'Bestätigen'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

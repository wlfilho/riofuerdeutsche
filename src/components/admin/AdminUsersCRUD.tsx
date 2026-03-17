// src/components/admin/AdminUsersCRUD.tsx
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

type ModalMode = 'closed' | 'create' | 'edit' | 'view';

export default function AdminUsersCRUD() {
  // Lista
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  // Modal
  const [modalMode, setModalMode] = useState<ModalMode>('closed');
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Form fields (para criar e editar)
  const [formEmail, setFormEmail] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formRole, setFormRole] = useState<'user' | 'premium' | 'admin'>('user');
  const [formEdition, setFormEdition] = useState(1);
  const [formPremiumUntil, setFormPremiumUntil] = useState('');
  const [formPaymentId, setFormPaymentId] = useState('');

  // Message
  const [message, setMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  // Fetch users
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (roleFilter && roleFilter !== 'all') params.set('role', roleFilter);

      const res = await fetch(`/api/admin/users?${params}`);
      const data = await res.json();
      if (data.users) setUsers(data.users);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  }, [search, roleFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Debounce busca
  useEffect(() => {
    const timer = setTimeout(() => fetchUsers(), 300);
    return () => clearTimeout(timer);
  }, [search, fetchUsers]);

  // Abrir modal de criação
  const openCreateModal = () => {
    setFormEmail('');
    setFormPassword('');
    setFormRole('user');
    setFormEdition(1);
    setFormPremiumUntil('');
    setFormPaymentId('');
    setSelectedUser(null);
    setModalMode('create');
  };

  // Abrir modal de edição
  const openEditModal = (user: UserProfile) => {
    setSelectedUser(user);
    setFormEmail(user.email);
    setFormRole(user.role);
    setFormEdition(user.guide_edition || 1);
    setFormPremiumUntil(
      user.premium_until
        ? new Date(user.premium_until).toISOString().split('T')[0]
        : ''
    );
    setFormPaymentId(user.payment_id || '');
    setModalMode('edit');
  };

  // Abrir modal de visualização
  const openViewModal = (user: UserProfile) => {
    setSelectedUser(user);
    setModalMode('view');
  };

  // Fechar modal
  const closeModal = () => {
    setModalMode('closed');
    setSelectedUser(null);
    setMessage(null);
  };

  // CRIAR usuário
  const handleCreate = async () => {
    setActionLoading(true);
    setMessage(null);

    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formEmail,
          password: formPassword,
          role: formRole,
          guide_edition: formRole === 'premium' ? formEdition : null,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({ type: 'success', text: `Benutzer "${formEmail}" erstellt.` });
        fetchUsers();
        setTimeout(() => closeModal(), 1500);
      } else {
        setMessage({ type: 'error', text: data.error || 'Fehler beim Erstellen.' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Netzwerkfehler.' });
    } finally {
      setActionLoading(false);
    }
  };

  // ATUALIZAR usuário
  const handleUpdate = async () => {
    if (!selectedUser) return;
    setActionLoading(true);
    setMessage(null);

    try {
      const res = await fetch(`/api/admin/users/${selectedUser.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: formRole,
          guide_edition: formRole === 'premium' ? formEdition : null,
          premium_until: formPremiumUntil
            ? new Date(formPremiumUntil).toISOString()
            : null,
          payment_id: formPaymentId || null,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({ type: 'success', text: 'Benutzer aktualisiert.' });
        fetchUsers();
        setTimeout(() => closeModal(), 1500);
      } else {
        setMessage({ type: 'error', text: data.error || 'Fehler beim Aktualisieren.' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Netzwerkfehler.' });
    } finally {
      setActionLoading(false);
    }
  };

  // DELETAR usuário
  const handleDelete = async (user: UserProfile) => {
    if (
      !confirm(
        `Bist du sicher, dass du "${user.email}" DAUERHAFT löschen möchtest?\n\nDiese Aktion kann não rückgängig gemacht werden.`
      )
    ) {
      return;
    }

    setActionLoading(true);
    setMessage(null);

    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: 'DELETE',
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({ type: 'success', text: `"${user.email}" gelöscht.` });
        fetchUsers();
      } else {
        setMessage({ type: 'error', text: data.error || 'Fehler beim Löschen.' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Netzwerkfehler.' });
    } finally {
      setActionLoading(false);
    }
  };

  // Ação rápida: Upgrade para premium
  const quickUpgrade = (user: UserProfile) => {
    openEditModal(user);
    setFormRole('premium');
  };

  // Ação rápida: Revogar premium
  const quickRevoke = async (user: UserProfile) => {
    if (!confirm(`Premium-Zugang von "${user.email}" widerrufen?`)) return;

    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: 'user' }),
      });

      if (res.ok) {
        setMessage({ type: 'success', text: `Premium von "${user.email}" widerrufen.` });
        fetchUsers();
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Fehler.' });
    }
  };

  // Helpers
  const formatDate = (date: string | null) => {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatDateTime = (date: string | null) => {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const roleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return (
          <span className="inline-block px-2 py-0.5 text-xs font-semibold rounded-full bg-red-100 text-red-700">
            🔑 Admin
          </span>
        );
      case 'premium':
        return (
          <span className="inline-block px-2 py-0.5 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-700">
            ⭐ Premium
          </span>
        );
      default:
        return (
          <span className="inline-block px-2 py-0.5 text-xs font-semibold rounded-full bg-gray-100 text-gray-600">
            Kostenlos
          </span>
        );
    }
  };

  // Stats
  const totalUsers = users.length;
  const premiumUsers = users.filter((u) => u.role === 'premium').length;
  const freeUsers = users.filter((u) => u.role === 'user').length;
  const adminUsers = users.filter((u) => u.role === 'admin').length;

  return (
    <div className="p-6 md:p-10">
      <div className="max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">👥 Benutzer</h1>
            <p className="text-gray-500 mt-1">
              {totalUsers} gesamt · {freeUsers} kostenlos · {premiumUsers} premium · {adminUsers} admin
            </p>
          </div>
          <button
            onClick={openCreateModal}
            className="px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
          >
            + Benutzer erstellen
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <p className="text-xs text-gray-500">Gesamt</p>
            <p className="text-2xl font-bold text-gray-900">{totalUsers}</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <p className="text-xs text-gray-500">Kostenlos</p>
            <p className="text-2xl font-bold text-blue-600">{freeUsers}</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <p className="text-xs text-gray-500">⭐ Premium</p>
            <p className="text-2xl font-bold text-yellow-600">{premiumUsers}</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <p className="text-xs text-gray-500">🔑 Admin</p>
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
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
          />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white text-sm"
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
                        <button
                          onClick={() => openViewModal(u)}
                          className="text-sm font-medium text-gray-900 hover:text-green-700 hover:underline text-left"
                        >
                          {u.email}
                        </button>
                        <p className="text-xs text-gray-400 md:hidden">
                          {formatDate(u.created_at)}
                        </p>
                      </td>
                      <td className="px-4 py-3">{roleBadge(u.role)}</td>
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
                        <div className="flex justify-end gap-1">
                          {/* Editar */}
                          <button
                            onClick={() => openEditModal(u)}
                            className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer"
                            title="Bearbeiten"
                          >
                            ✏️
                          </button>

                          {/* Ações de role */}
                          {u.role === 'user' && (
                            <button
                              onClick={() => quickUpgrade(u)}
                              className="px-2.5 py-1 text-xs font-medium bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition-colors cursor-pointer"
                              title="Upgrade zu Premium"
                            >
                              ⭐ Upgrade
                            </button>
                          )}
                          {u.role === 'premium' && (
                            <button
                              onClick={() => quickRevoke(u)}
                              className="px-2.5 py-1 text-xs font-medium bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors cursor-pointer"
                              title="Premium widerrufen"
                            >
                              ✕ Widerrufen
                            </button>
                          )}

                          {/* Deletar (não para admin) */}
                          {u.role !== 'admin' && (
                            <button
                              onClick={() => handleDelete(u)}
                              className="px-2 py-1 text-xs text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                              title="Löschen"
                            >
                              🗑️
                            </button>
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
      </div>

      {/* ===== MODAL ===== */}
      {modalMode !== 'closed' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">
                {modalMode === 'create' && '+ Neuen Benutzer erstellen'}
                {modalMode === 'edit' && '✏️ Benutzer bearbeiten'}
                {modalMode === 'view' && '👤 Benutzerdetails'}
              </h3>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 text-xl cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4">
              {/* Message inside modal */}
              {message && (
                <div
                  className={`p-3 rounded-lg text-sm ${
                    message.type === 'success'
                      ? 'bg-green-50 text-green-800 border border-green-200'
                      : 'bg-red-50 text-red-800 border border-red-200'
                  }`}
                >
                  {message.text}
                </div>
              )}

              {/* === VIEW MODE === */}
              {modalMode === 'view' && selectedUser && (
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-500">E-Mail</p>
                    <p className="text-sm font-medium">{selectedUser.email}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Rolle</p>
                    <div className="mt-1">{roleBadge(selectedUser.role)}</div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Registriert</p>
                    <p className="text-sm">{formatDateTime(selectedUser.created_at)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Premium seit</p>
                    <p className="text-sm">{formatDateTime(selectedUser.premium_since)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Premium bis</p>
                    <p className="text-sm">
                      {selectedUser.premium_until
                        ? formatDate(selectedUser.premium_until)
                        : selectedUser.role === 'premium'
                        ? 'Lebenslang'
                        : '—'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Guide-Edition</p>
                    <p className="text-sm">
                      {selectedUser.guide_edition
                        ? `Edition ${selectedUser.guide_edition}`
                        : '—'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Payment ID</p>
                    <p className="text-sm font-mono text-xs">
                      {selectedUser.payment_id || '—'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">User ID</p>
                    <p className="text-sm font-mono text-xs text-gray-400">
                      {selectedUser.id}
                    </p>
                  </div>

                  {/* Ação no modal de view */}
                  <div className="pt-3 border-t border-gray-100 flex gap-2">
                    <button
                      onClick={() => openEditModal(selectedUser)}
                      className="flex-1 px-4 py-2 text-sm font-medium bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer"
                    >
                      ✏️ Bearbeiten
                    </button>
                    {selectedUser.role !== 'admin' && (
                      <button
                        onClick={() => {
                          closeModal();
                          handleDelete(selectedUser);
                        }}
                        className="px-4 py-2 text-sm font-medium bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors cursor-pointer"
                      >
                        🗑️ Löschen
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* === CREATE / EDIT MODE === */}
              {(modalMode === 'create' || modalMode === 'edit') && (
                <div className="space-y-4">
                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      E-Mail
                    </label>
                    <input
                      type="email"
                      value={formEmail}
                      onChange={(e) => setFormEmail(e.target.value)}
                      disabled={modalMode === 'edit'}
                      placeholder="name@example.com"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm disabled:bg-gray-50 disabled:text-gray-500"
                    />
                  </div>

                  {/* Password (só na criação) */}
                  {modalMode === 'create' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Passwort
                      </label>
                      <input
                        type="text"
                        value={formPassword}
                        onChange={(e) => setFormPassword(e.target.value)}
                        placeholder="Mindestens 6 Zeichen"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                      />
                    </div>
                  )}

                  {/* Role */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Rolle
                    </label>
                    <select
                      value={formRole}
                      onChange={(e) =>
                        setFormRole(e.target.value as 'user' | 'premium' | 'admin')
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm bg-white"
                    >
                      <option value="user">Kostenlos (user)</option>
                      <option value="premium">⭐ Premium</option>
                      <option value="admin">🔑 Admin</option>
                    </select>
                  </div>

                  {/* Campos premium (só visíveis quando role = premium) */}
                  {formRole === 'premium' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Guide-Edition
                        </label>
                        <select
                          value={formEdition}
                          onChange={(e) => setFormEdition(Number(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm bg-white"
                        >
                          <option value={1}>Edition 1 — O Essencial (9€)</option>
                          <option value={2}>Edition 2 — Viver o Rio (14€)</option>
                          <option value={3}>Edition 3 — Como um Local (19€)</option>
                          <option value={4}>Edition 4 — Rio Completo (24€)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Ablaufdatum (optional)
                        </label>
                        <input
                          type="date"
                          value={formPremiumUntil}
                          onChange={(e) => setFormPremiumUntil(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                        />
                        <p className="text-xs text-gray-400 mt-1">
                          Leer = lebenslanger Zugang
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Payment ID (optional)
                        </label>
                        <input
                          type="text"
                          value={formPaymentId}
                          onChange={(e) => setFormPaymentId(e.target.value)}
                          placeholder="z.B. Stripe pi_xxx oder PayPal TX-xxx"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm font-mono"
                        />
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer (só para create/edit) */}
            {(modalMode === 'create' || modalMode === 'edit') && (
              <div className="flex gap-3 p-5 border-t border-gray-100">
                <button
                  onClick={closeModal}
                  className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer"
                >
                  Abbrechen
                </button>
                <button
                  onClick={modalMode === 'create' ? handleCreate : handleUpdate}
                  disabled={actionLoading}
                  className="flex-1 px-4 py-2 text-sm font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {actionLoading
                    ? 'Laden...'
                    : modalMode === 'create'
                    ? 'Erstellen'
                    : 'Speichern'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

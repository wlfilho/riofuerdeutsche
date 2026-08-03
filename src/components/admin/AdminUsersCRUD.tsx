// src/components/admin/AdminUsersCRUD.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { fmtDate, fmtDateTime, fmtEur } from '@/lib/adminFormat';

interface UserProfile {
  id: string;
  email: string;
  first_name: string | null;
  role: 'user' | 'premium' | 'admin';
  created_at: string;
  premium_since: string | null;
  premium_until: string | null;
  payment_id: string | null;
  guide_edition: number | null;
}

type ModalMode = 'closed' | 'create' | 'edit' | 'view';

/** Preços por edição do Guide, em euros — exibidos junto ao nome no select. */
const EDITION_PRICES_EUR: Record<number, number> = { 1: 9, 2: 14, 3: 19, 4: 24 };
const EDITIONS = [1, 2, 3, 4] as const;

export default function AdminUsersCRUD() {
  const t = useTranslations('admin.usuarios');
  const tCommon = useTranslations('admin.common');
  const tRole = useTranslations('admin.status.role');
  const tEdicoes = useTranslations('admin.guide.edicoes');

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
  const [formFirstName, setFormFirstName] = useState('');
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
    setFormFirstName('');
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
    setFormFirstName(user.first_name || '');
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
          first_name: formFirstName,
          email: formEmail,
          password: formPassword,
          role: formRole,
          guide_edition: formRole === 'premium' ? formEdition : null,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({ type: 'success', text: t('usuarioCriado', { email: formEmail }) });
        fetchUsers();
        setTimeout(() => closeModal(), 1500);
      } else {
        setMessage({ type: 'error', text: data.error || t('erroCriar') });
      }
    } catch (error) {
      setMessage({ type: 'error', text: tCommon('erroRede') });
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
          first_name: formFirstName,
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
        setMessage({ type: 'success', text: t('usuarioAtualizado') });
        fetchUsers();
        setTimeout(() => closeModal(), 1500);
      } else {
        setMessage({ type: 'error', text: data.error || t('erroAtualizar') });
      }
    } catch (error) {
      setMessage({ type: 'error', text: tCommon('erroRede') });
    } finally {
      setActionLoading(false);
    }
  };

  // DELETAR usuário
  const handleDelete = async (user: UserProfile) => {
    if (!confirm(t('confirmarExcluir', { email: user.email }))) {
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
        setMessage({ type: 'success', text: t('usuarioExcluido', { email: user.email }) });
        fetchUsers();
      } else {
        setMessage({ type: 'error', text: data.error || t('erroExcluir') });
      }
    } catch (error) {
      setMessage({ type: 'error', text: tCommon('erroRede') });
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
    if (!confirm(t('confirmarRevogar', { email: user.email }))) return;

    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: 'user' }),
      });

      if (res.ok) {
        setMessage({ type: 'success', text: t('premiumRevogado', { email: user.email }) });
        fetchUsers();
      }
    } catch (error) {
      setMessage({ type: 'error', text: t('erro') });
    }
  };

  // Helpers
  const roleLabel = (role: string) => (tRole.has(role) ? tRole(role) : role);

  const roleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return (
          <span className="inline-block px-2 py-0.5 text-xs font-semibold rounded-full bg-red-100 text-red-700">
            {t('papelAdmin')}
          </span>
        );
      case 'premium':
        return (
          <span className="inline-block px-2 py-0.5 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-700">
            {t('papelPremium')}
          </span>
        );
      default:
        return (
          <span className="inline-block px-2 py-0.5 text-xs font-semibold rounded-full bg-gray-100 text-gray-600">
            {roleLabel('user')}
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
    <div className="p-4 sm:p-6 md:p-10">
      <div className="max-w-6xl">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{t('titulo')}</h1>
            <p className="text-gray-500 mt-1">
              {t('resumoContagem', {
                total: totalUsers,
                gratuitos: freeUsers,
                premium: premiumUsers,
                admins: adminUsers,
              })}
            </p>
          </div>
          <button
            onClick={openCreateModal}
            className="px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
          >
            {t('criarUsuario')}
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <p className="text-xs text-gray-500">{t('cardTotal')}</p>
            <p className="text-2xl font-bold text-gray-900">{totalUsers}</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <p className="text-xs text-gray-500">{t('cardGratuitos')}</p>
            <p className="text-2xl font-bold text-blue-600">{freeUsers}</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <p className="text-xs text-gray-500">{t('cardPremium')}</p>
            <p className="text-2xl font-bold text-yellow-600">{premiumUsers}</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <p className="text-xs text-gray-500">{t('cardAdmin')}</p>
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
            placeholder={t('buscarEmail')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
          />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white text-sm"
          >
            <option value="all">{t('todosPapeis')}</option>
            <option value="user">{tRole('user')}</option>
            <option value="premium">{tRole('premium')}</option>
            <option value="admin">{tRole('admin')}</option>
          </select>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                    {tCommon('email')}
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                    {tCommon('nome')}
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                    {t('colPapel')}
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">
                    {t('colRegistrado')}
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">
                    {t('colPremiumDesde')}
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase hidden lg:table-cell">
                    {t('colEdicao')}
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                    {tCommon('acoes')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                      {tCommon('carregando')}
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                      {t('nenhumUsuario')}
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
                          {fmtDate(u.created_at)}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {u.first_name || '—'}
                      </td>
                      <td className="px-4 py-3">{roleBadge(u.role)}</td>
                      <td className="px-4 py-3 text-sm text-gray-500 hidden md:table-cell">
                        {fmtDate(u.created_at)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500 hidden md:table-cell">
                        {fmtDate(u.premium_since)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500 hidden lg:table-cell">
                        {u.guide_edition ? t('edicaoAbrev', { n: u.guide_edition }) : tCommon('vazio')}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-1">
                          {/* Editar */}
                          <button
                            onClick={() => openEditModal(u)}
                            className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer"
                            title={t('editarTitle')}
                          >
                            ✏️
                          </button>

                          {/* Ações de role */}
                          {u.role === 'user' && (
                            <button
                              onClick={() => quickUpgrade(u)}
                              className="px-2.5 py-1 text-xs font-medium bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition-colors cursor-pointer"
                              title={t('upgradePremium')}
                            >
                              {t('upgrade')}
                            </button>
                          )}
                          {u.role === 'premium' && (
                            <button
                              onClick={() => quickRevoke(u)}
                              className="px-2.5 py-1 text-xs font-medium bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors cursor-pointer"
                              title={t('revogarPremium')}
                            >
                              {t('revogar')}
                            </button>
                          )}

                          {/* Deletar (não para admin) */}
                          {u.role !== 'admin' && (
                            <button
                              onClick={() => handleDelete(u)}
                              className="px-2 py-1 text-xs text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                              title={t('excluirTitle')}
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
                {modalMode === 'create' && t('criarNovoUsuario')}
                {modalMode === 'edit' && t('editarUsuario')}
                {modalMode === 'view' && t('detalhesUsuario')}
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
                    <p className="text-xs text-gray-500">{t('primeiroNome')}</p>
                    <p className="text-sm font-medium">{selectedUser.first_name || '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">{t('papel')}</p>
                    <div className="mt-1">{roleBadge(selectedUser.role)}</div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">{t('colRegistrado')}</p>
                    <p className="text-sm">{fmtDateTime(selectedUser.created_at)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">{t('colPremiumDesde')}</p>
                    <p className="text-sm">{fmtDateTime(selectedUser.premium_since)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">{t('premiumAte')}</p>
                    <p className="text-sm">
                      {selectedUser.premium_until
                        ? fmtDate(selectedUser.premium_until)
                        : selectedUser.role === 'premium'
                        ? t('vitalicio')
                        : '—'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">{t('edicaoGuide')}</p>
                    <p className="text-sm">
                      {selectedUser.guide_edition
                        ? t('edicao', { n: selectedUser.guide_edition })
                        : '—'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">{t('paymentId')}</p>
                    <p className="text-sm font-mono text-xs">
                      {selectedUser.payment_id || '—'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">{t('userId')}</p>
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
                      {t('editarUsuario')}
                    </button>
                    {selectedUser.role !== 'admin' && (
                      <button
                        onClick={() => {
                          closeModal();
                          handleDelete(selectedUser);
                        }}
                        className="px-4 py-2 text-sm font-medium bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors cursor-pointer"
                      >
                        🗑️ {tCommon('excluir')}
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* === CREATE / EDIT MODE === */}
              {(modalMode === 'create' || modalMode === 'edit') && (
                <div className="space-y-4">
                  {/* Primeiro nome */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('primeiroNome')}
                    </label>
                    <input
                      type="text"
                      value={formFirstName}
                      onChange={(e) => setFormFirstName(e.target.value)}
                      placeholder={t('primeiroNomePlaceholder')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {tCommon('email')}
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
                        {t('senha')}
                      </label>
                      <input
                        type="text"
                        value={formPassword}
                        onChange={(e) => setFormPassword(e.target.value)}
                        placeholder={t('senhaHint')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                      />
                    </div>
                  )}

                  {/* Role */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('papel')}
                    </label>
                    <select
                      value={formRole}
                      onChange={(e) =>
                        setFormRole(e.target.value as 'user' | 'premium' | 'admin')
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm bg-white"
                    >
                      <option value="user">{t('opcaoUser')}</option>
                      <option value="premium">{t('papelPremium')}</option>
                      <option value="admin">{t('papelAdmin')}</option>
                    </select>
                  </div>

                  {/* Campos premium (só visíveis quando role = premium) */}
                  {formRole === 'premium' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {t('edicaoGuide')}
                        </label>
                        <select
                          value={formEdition}
                          onChange={(e) => setFormEdition(Number(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm bg-white"
                        >
                          {[1, 2, 3, 4].map((ed) => (
                            <option key={ed} value={ed}>
                              {t('edicaoComPreco', {
                                nome: tEdicoes(String(ed)),
                                preco: fmtEur(EDITION_PRICES_EUR[ed]),
                              })}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {t('dataExpiracao')}
                        </label>
                        <input
                          type="date"
                          value={formPremiumUntil}
                          onChange={(e) => setFormPremiumUntil(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                        />
                        <p className="text-xs text-gray-400 mt-1">
                          {t('dataExpiracaoHint')}
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {t('paymentId')}
                        </label>
                        <input
                          type="text"
                          value={formPaymentId}
                          onChange={(e) => setFormPaymentId(e.target.value)}
                          placeholder={t('paymentIdPlaceholder')}
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
                  {tCommon('cancelar')}
                </button>
                <button
                  onClick={modalMode === 'create' ? handleCreate : handleUpdate}
                  disabled={actionLoading}
                  className="flex-1 px-4 py-2 text-sm font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {actionLoading
                    ? tCommon('carregando')
                    : modalMode === 'create'
                    ? tCommon('criar')
                    : tCommon('salvar')}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import type { ProposalServiceCategory, ProposalServiceGroup } from '@/lib/proposals';

// Visão mínima de uma atividade que o gerenciador de grupos precisa: a página
// pai já resolveu nome de exibição e duração total, então aqui não há nada de
// traduções nem de custos.
export type GroupServiceOption = {
  id: string;
  name: string;
  category: ProposalServiceCategory;
  totalHours: number;
  isActive: boolean;
};

const INPUT_CLS =
  'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent';

function normalizeSearch(s: string): string {
  return s.toLocaleLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '');
}

function formatHours(h: number): string {
  const totalMin = Math.round(h * 60);
  const hh = Math.floor(totalMin / 60);
  const mm = totalMin % 60;
  if (hh === 0) return `${mm}min`;
  if (mm === 0) return `${hh}h`;
  return `${hh}h ${mm}min`;
}

// ─── GroupModal ───────────────────────────────────────────────────────────────

function GroupModal({
  group,
  services,
  onClose,
  onSaved,
}: {
  group: ProposalServiceGroup | null; // null = create mode
  services: GroupServiceOption[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const t = useTranslations('admin.atividades.grupos');
  const tCommon = useTranslations('admin.common');
  const [name, setName] = useState(group?.name ?? '');
  const [isActive, setIsActive] = useState(group?.is_active ?? true);
  // Ordem do array = ordem em que as atividades entram no dia ao usar o grupo.
  // Membros que apontem para atividade já excluída do catálogo são descartados.
  const [selectedIds, setSelectedIds] = useState<string[]>(() =>
    (group?.service_ids ?? []).filter(id => services.some(s => s.id === id)),
  );
  const [query, setQuery] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const byId = useMemo(() => new Map(services.map(s => [s.id, s])), [services]);
  const selected = selectedIds.map(id => byId.get(id)!).filter(Boolean);
  const totalHours = selected.reduce((sum, s) => sum + s.totalHours, 0);

  const q = normalizeSearch(query.trim());
  const available = services.filter(
    s => !selectedIds.includes(s.id) && (!q || normalizeSearch(s.name).includes(q)),
  );

  const add = (id: string) => setSelectedIds(prev => [...prev, id]);
  const remove = (id: string) => setSelectedIds(prev => prev.filter(x => x !== id));
  const move = (id: string, dir: -1 | 1) =>
    setSelectedIds(prev => {
      const idx = prev.indexOf(id);
      const target = idx + dir;
      if (idx < 0 || target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      [next[idx], next[target]] = [next[target], next[idx]];
      return next;
    });

  const handleSave = async () => {
    setError(null);
    if (!name.trim()) { setError(t('nomeObrigatorio')); return; }
    if (selectedIds.length === 0) { setError(t('semAtividades')); return; }

    setSaving(true);
    try {
      const payload = { name: name.trim(), is_active: isActive, service_ids: selectedIds };
      const url = group
        ? `/api/admin/proposals/service-groups/${group.id}`
        : '/api/admin/proposals/service-groups';
      const res = await fetch(url, {
        method: group ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? tCommon('erroSalvar')); return; }
      onSaved();
    } catch {
      setError(tCommon('erroRede'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">

        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100 shrink-0">
          <h2 className="text-lg font-bold text-gray-900">
            {group ? t('editarGrupo') : t('novoGrupoTitulo')}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">✕</button>
        </div>

        <div className="overflow-y-auto px-6 py-5 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('nomeCampo')} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder={t('nomePlaceholder')}
              className={INPUT_CLS}
            />
          </div>

          <label className="flex items-center gap-3 cursor-pointer select-none">
            <button
              type="button"
              onClick={() => setIsActive(prev => !prev)}
              className={`relative w-10 h-6 rounded-full transition-colors ${isActive ? 'bg-green-500' : 'bg-gray-300'}`}
            >
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${isActive ? 'translate-x-4' : 'translate-x-0'}`} />
            </button>
            <span className="text-sm font-medium text-gray-700">{tCommon('ativo')}</span>
          </label>

          {/* Selecionadas, na ordem em que entram no dia */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                {t('atividadesDoGrupo')}
              </h3>
              {selected.length > 0 && (
                <span className="text-xs text-gray-400 tabular-nums">
                  {t('atividadesCount', { count: selected.length })}
                  {totalHours > 0 && ` · ${formatHours(totalHours)}`}
                </span>
              )}
            </div>
            {selected.length === 0 ? (
              <p className="text-sm text-gray-400 italic">{t('semAtividadesDica')}</p>
            ) : (
              <ul className="space-y-1">
                {selected.map((s, i) => (
                  <li
                    key={s.id}
                    className="flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
                  >
                    <span className="w-5 text-xs text-gray-400 tabular-nums shrink-0">{i + 1}.</span>
                    <span className="flex-1 font-medium text-gray-800 truncate">
                      {s.name}
                      {!s.isActive && (
                        <span className="ml-2 px-1.5 py-0.5 text-[10px] font-semibold rounded bg-amber-50 text-amber-600 align-middle">
                          {t('atividadeInativa')}
                        </span>
                      )}
                    </span>
                    {s.totalHours > 0 && (
                      <span className="text-xs text-gray-400 tabular-nums shrink-0">{formatHours(s.totalHours)}</span>
                    )}
                    <span className="flex items-center shrink-0">
                      <button
                        onClick={() => move(s.id, -1)}
                        disabled={i === 0}
                        title={t('moverCima')}
                        className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-30 disabled:hover:text-gray-400 rounded"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                      <button
                        onClick={() => move(s.id, 1)}
                        disabled={i === selected.length - 1}
                        title={t('moverBaixo')}
                        className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-30 disabled:hover:text-gray-400 rounded"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                      <button
                        onClick={() => remove(s.id)}
                        title={tCommon('remover')}
                        className="p-1 text-gray-300 hover:text-red-500 rounded"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Catálogo para adicionar */}
          <div>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
              {t('adicionarAtividades')}
            </h3>
            <input
              type="search"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder={t('buscarAtividade')}
              className={INPUT_CLS}
            />
            <div className="mt-2 max-h-52 overflow-y-auto border border-gray-200 rounded-lg divide-y divide-gray-100">
              {available.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-5">{t('nenhumaEncontrada')}</p>
              ) : (
                available.map(s => (
                  <button
                    key={s.id}
                    onClick={() => add(s.id)}
                    className="w-full flex items-center justify-between px-3 py-2 text-sm text-left hover:bg-green-50 group transition-colors"
                  >
                    <span className="font-medium text-gray-800 group-hover:text-green-800 truncate">
                      {s.name}
                    </span>
                    <span className="flex items-center gap-2 ml-3 shrink-0 text-xs text-gray-400">
                      {s.totalHours > 0 && <span className="tabular-nums">{formatHours(s.totalHours)}</span>}
                      <span className="w-5 h-5 flex items-center justify-center rounded-full text-sm font-bold bg-green-50 text-green-600">+</span>
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-lg text-sm bg-red-50 text-red-800 border border-red-200">{error}</div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 shrink-0">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
            {tCommon('cancelar')}
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2 text-sm font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            {saving ? tCommon('salvando') : tCommon('salvar')}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── GroupsSection ────────────────────────────────────────────────────────────

export default function GroupsSection({ services }: { services: GroupServiceOption[] }) {
  const t = useTranslations('admin.atividades.grupos');
  const tCommon = useTranslations('admin.common');
  const [groups, setGroups] = useState<ProposalServiceGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalGroup, setModalGroup] = useState<ProposalServiceGroup | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ProposalServiceGroup | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const byId = useMemo(() => new Map(services.map(s => [s.id, s])), [services]);

  const fetchGroups = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/proposals/service-groups');
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? tCommon('erroCarregar')); return; }
      setGroups(data.groups ?? []);
    } catch {
      setError(tCommon('erroRede'));
    } finally {
      setLoading(false);
    }
  }, [tCommon]);

  useEffect(() => { fetchGroups(); }, [fetchGroups]);

  const handleToggle = async (group: ProposalServiceGroup) => {
    const newValue = !group.is_active;
    setGroups(prev => prev.map(g => g.id === group.id ? { ...g, is_active: newValue } : g));
    const res = await fetch(`/api/admin/proposals/service-groups/${group.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: newValue }),
    });
    if (!res.ok) {
      setGroups(prev => prev.map(g => g.id === group.id ? { ...g, is_active: !newValue } : g));
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/admin/proposals/service-groups/${deleteTarget.id}`, { method: 'DELETE' });
      if (!res.ok) { const d = await res.json(); alert(d.error ?? tCommon('erroDeletar')); return; }
      setGroups(prev => prev.filter(g => g.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch {
      alert(tCommon('erroRede'));
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="mt-10">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-1">
        <h2 className="text-lg font-bold text-gray-900">📦 {t('titulo')}</h2>
        <button
          onClick={() => { setModalGroup(null); setModalOpen(true); }}
          className="px-4 py-2 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 transition-colors"
        >
          {t('novoGrupo')}
        </button>
      </div>
      <p className="text-sm text-gray-500 mb-4">{t('hint')}</p>

      {error && (
        <div className="mb-4 p-3 rounded-lg text-sm bg-red-50 text-red-800 border border-red-200">{error}</div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-4 space-y-3">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="h-5 bg-gray-100 rounded animate-pulse" style={{ width: i === 0 ? '40%' : '55%' }} />
            ))}
          </div>
        ) : groups.length === 0 ? (
          <div className="px-4 py-12 text-center">
            <p className="text-gray-400 text-sm mb-3">{t('nenhumGrupo')}</p>
            <button
              onClick={() => { setModalGroup(null); setModalOpen(true); }}
              className="inline-block px-4 py-2 text-sm font-semibold bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              {t('criarPrimeiro')}
            </button>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {groups.map(g => {
              const members = g.service_ids.map(id => byId.get(id)).filter(Boolean) as GroupServiceOption[];
              const totalHours = members.reduce((sum, s) => sum + s.totalHours, 0);
              return (
                <li key={g.id} className="flex items-center gap-4 px-4 py-3 hover:bg-gray-50">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 text-sm">{g.name}</p>
                    <p className="text-xs text-gray-400 truncate">
                      {t('atividadesCount', { count: members.length })}
                      {totalHours > 0 && ` · ${formatHours(totalHours)}`}
                      {members.length > 0 && ` — ${members.map(m => m.name).join(', ')}`}
                    </p>
                  </div>
                  <button
                    onClick={() => handleToggle(g)}
                    title={tCommon('ativo')}
                    className={`relative w-9 h-5 rounded-full transition-colors shrink-0 ${g.is_active ? 'bg-green-500' : 'bg-gray-300'}`}
                  >
                    <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${g.is_active ? 'translate-x-4' : 'translate-x-0'}`} />
                  </button>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => { setModalGroup(g); setModalOpen(true); }}
                      title={tCommon('editar')}
                      className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setDeleteTarget(g)}
                      title={tCommon('excluir')}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {modalOpen && (
        <GroupModal
          group={modalGroup}
          services={services}
          onClose={() => setModalOpen(false)}
          onSaved={() => { setModalOpen(false); setLoading(true); fetchGroups(); }}
        />
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setDeleteTarget(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-2">{t('excluirGrupo')}</h2>
            <p className="text-sm text-gray-600 mb-6">
              {t.rich('temCertezaGrupo', {
                nome: deleteTarget.name,
                strong: chunks => <strong>{chunks}</strong>,
              })}
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={deleteLoading}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                {tCommon('cancelar')}
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteLoading}
                className="px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {deleteLoading ? tCommon('deletando') : tCommon('excluir')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

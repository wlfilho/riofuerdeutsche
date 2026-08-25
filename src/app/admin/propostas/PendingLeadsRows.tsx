'use client';

import { useState, type ReactNode } from 'react';
import { useTranslations } from 'next-intl';

/**
 * Casca interativa da faixa de leads pendentes: as linhas em si (com badges,
 * grupos, link "criar proposta") são renderizadas no servidor por
 * PendingLeadsStrip e chegam aqui como nós já prontos — este componente só
 * decide quantas mostrar e em que ordem, sem precisar reformatar nada.
 *
 * `rows` chega ordenado do mais antigo pro mais recente (quem espera há mais
 * tempo primeiro); o toggle de ordenação só inverte esse array.
 */
export default function PendingLeadsRows({
  rows,
  defaultVisible = 5,
}: {
  rows: ReactNode[];
  defaultVisible?: number;
}) {
  const t = useTranslations('admin.propostas');
  const [expanded, setExpanded] = useState(false);
  const [mostRecentFirst, setMostRecentFirst] = useState(false);

  const ordered = mostRecentFirst ? [...rows].reverse() : rows;
  const visible = expanded ? ordered : ordered.slice(0, defaultVisible);
  const hasMore = rows.length > defaultVisible;

  return (
    <>
      {rows.length > 1 && (
        <div className="flex justify-end mb-2">
          <select
            value={mostRecentFirst ? 'recent' : 'oldest'}
            onChange={e => setMostRecentFirst(e.target.value === 'recent')}
            aria-label={t('ordenarPendentes')}
            className="text-xs border border-amber-200 rounded-lg px-2 py-1 bg-white text-amber-800 focus:outline-none focus:ring-2 focus:ring-amber-400"
          >
            <option value="oldest">{t('ordenarMaisAntigo')}</option>
            <option value="recent">{t('ordenarMaisRecente')}</option>
          </select>
        </div>
      )}

      <div className="space-y-2">{visible}</div>

      {hasMore && (
        <div className="mt-2 text-xs text-amber-700">
          {t('mostrandoDeTotal', { shown: visible.length, total: rows.length })}
          {' · '}
          <button
            type="button"
            onClick={() => setExpanded(e => !e)}
            className="font-semibold underline hover:no-underline"
          >
            {expanded ? t('verMenos') : t('verTodos')}
          </button>
        </div>
      )}
    </>
  );
}

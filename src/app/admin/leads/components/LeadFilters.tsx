'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useCallback, useTransition, useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import GroupFilter from '@/components/admin/GroupFilter';

type Props = {
  currentStatus?: string;
  currentSource?: string;
  currentGroup?: string;
  currentQ?: string;
  hideStatus?: boolean;
};

const STATUS_VALUES = ['new', 'contacted', 'proposal_sent', 'closed', 'lost'] as const;

const SOURCE_VALUES = ['form', 'calculator', 'email', 'whatsapp', 'instagram', 'referral', 'other'] as const;

const SELECT_CLS =
  'px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent';

export default function LeadFilters({
  currentStatus = '',
  currentSource = '',
  currentGroup = '',
  currentQ = '',
  hideStatus = false,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();
  const [q, setQ] = useState(currentQ);
  const t = useTranslations('admin.crm');
  const tCommon = useTranslations('admin.common');
  const tStatus = useTranslations('admin.status.lead');
  const tSource = useTranslations('admin.status.source');

  const push = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value) params.set(key, value);
        else params.delete(key);
      }
      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`);
      });
    },
    [router, pathname, searchParams]
  );

  // Debounce text search
  useEffect(() => {
    const timer = setTimeout(() => {
      push({ q });
    }, 300);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  const hasFilters = (!hideStatus && currentStatus) || currentSource || currentGroup || currentQ;

  return (
    <div className="flex flex-wrap items-center gap-3 mb-4">
      {/* Search */}
      <div className="relative flex-1 min-w-48 max-w-xs">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z"
            clipRule="evenodd"
          />
        </svg>
        <input
          type="text"
          value={q}
          onChange={e => setQ(e.target.value)}
          placeholder={t('buscarPlaceholder')}
          className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
        />
      </div>

      {/* Status */}
      {!hideStatus && (
        <select
          value={currentStatus}
          onChange={e => push({ status: e.target.value })}
          className={SELECT_CLS}
        >
          <option value="">{tCommon('todos')}</option>
          {STATUS_VALUES.map(value => (
            <option key={value} value={value}>
              {tStatus(value)}
            </option>
          ))}
        </select>
      )}

      {/* Source */}
      <select
        value={currentSource}
        onChange={e => push({ source: e.target.value })}
        className={SELECT_CLS}
      >
        <option value="">{tCommon('todas')}</option>
        {SOURCE_VALUES.map(value => (
          <option key={value} value={value}>
            {tSource(value)}
          </option>
        ))}
      </select>

      {/* Etiqueta */}
      <GroupFilter value={currentGroup} />

      {/* Clear filters */}
      {hasFilters && (
        <button
          onClick={() => {
            setQ('');
            router.push(pathname);
          }}
          className="px-3 py-2 text-xs font-medium text-gray-500 hover:text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          {tCommon('limparFiltros')}
        </button>
      )}
    </div>
  );
}

'use client';

import { useCallback, useEffect, useState, useTransition } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import type { LeadGroup } from '@/lib/leadGroups';

/**
 * Filtro de etiqueta compartilhado por CRM, leads e propostas — sucessor do
 * antigo CampaignFilter agora que toda campanha também é uma `lead_group`.
 *
 * O valor mora na URL (`?group=`) e não em estado local: o filtro precisa
 * sobreviver ao refresh depois de mexer num lead, e as três telas filtram no
 * servidor. 'none' seleciona quem não está em etiqueta nenhuma.
 */
export default function GroupFilter({ value = '' }: { value?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();
  const [groups, setGroups] = useState<LeadGroup[]>([]);
  const t = useTranslations('admin.crm');

  useEffect(() => {
    fetch('/api/admin/lead-groups')
      .then(r => r.json())
      .then(data => { if (data.groups) setGroups(data.groups); })
      .catch(() => {});
  }, []);

  const onChange = useCallback(
    (next: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (next) params.set('group', next);
      else params.delete('group');
      const qs = params.toString();
      startTransition(() => router.push(qs ? `${pathname}?${qs}` : pathname));
    },
    [router, pathname, searchParams],
  );

  // Sem etiqueta nenhuma cadastrada, o filtro não tem o que oferecer.
  if (groups.length === 0 && !value) return null;

  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      aria-label={t('grupos')}
      className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
    >
      <option value="">{t('todosGrupos')}</option>
      {groups.map(group => (
        <option key={group.id} value={group.id}>
          {group.name}
        </option>
      ))}
      <option value="none">{t('semGrupo')}</option>
    </select>
  );
}

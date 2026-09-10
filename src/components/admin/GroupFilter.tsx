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
 *
 * `defaultValue` é o que a página entende por "sem parâmetro na URL". CRM e
 * leads abrem em tudo (''); propostas abrem em 'none'. Por isso "todos os
 * grupos" tem o valor explícito 'all': onde o padrão não é tudo, apagar o
 * parâmetro voltaria pro padrão, não pra lista inteira. O parâmetro só some
 * da URL quando a escolha coincide com o padrão daquela página.
 */
export default function GroupFilter({
  value = '',
  defaultValue = '',
}: {
  value?: string;
  defaultValue?: string;
}) {
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
      const isDefault = next === defaultValue || (next === 'all' && defaultValue === '');
      if (isDefault) params.delete('group');
      else params.set('group', next);
      const qs = params.toString();
      startTransition(() => router.push(qs ? `${pathname}?${qs}` : pathname));
    },
    [router, pathname, searchParams, defaultValue],
  );

  // Sem etiqueta nenhuma cadastrada, o filtro não tem o que oferecer — nem
  // "sem etiqueta", que aí seria a lista inteira com outro nome.
  if (groups.length === 0 && (value === '' || value === 'all' || value === 'none')) return null;

  return (
    <select
      value={value === '' ? 'all' : value}
      onChange={e => onChange(e.target.value)}
      aria-label={t('grupos')}
      className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
    >
      <option value="all">{t('todosGrupos')}</option>
      {groups.map(group => (
        <option key={group.id} value={group.id}>
          {group.name}
        </option>
      ))}
      <option value="none">{t('semGrupo')}</option>
    </select>
  );
}

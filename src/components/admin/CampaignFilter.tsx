'use client';

import { useCallback, useTransition } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { CAMPAIGN_LIST } from '@/lib/campaigns';

/**
 * Filtro de campanha compartilhado por CRM, leads e propostas.
 *
 * O valor mora na URL (`?campaign=`) e não em estado local: o filtro precisa
 * sobreviver ao refresh depois de mexer num lead, e as três telas filtram no
 * servidor. 'none' seleciona quem não pertence a campanha nenhuma — é o
 * complemento que separa "os do carnaval" de "os demais".
 */
export default function CampaignFilter({ value = '' }: { value?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();
  const t = useTranslations('admin.crm');

  const onChange = useCallback(
    (next: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (next) params.set('campaign', next);
      else params.delete('campaign');
      const qs = params.toString();
      startTransition(() => router.push(qs ? `${pathname}?${qs}` : pathname));
    },
    [router, pathname, searchParams],
  );

  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      aria-label={t('campanha')}
      className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
    >
      <option value="">{t('todasCampanhas')}</option>
      {CAMPAIGN_LIST.map(campaign => (
        <option key={campaign.slug} value={campaign.slug}>
          {campaign.label}
        </option>
      ))}
      <option value="none">{t('semCampanha')}</option>
    </select>
  );
}

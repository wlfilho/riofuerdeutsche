import { Metadata } from 'next';
import { Suspense } from 'react';
import { getTranslations } from 'next-intl/server';
import { buildContactUrls, getSettings } from '@/lib/settings';
import AnfrageForm from './AnfrageForm';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('public.anfrage');
  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
    robots: { index: false, follow: false },
  };
}

export default async function AnfragePage() {
  const settings = await getSettings();
  const { whatsappHref, instagramHref } = buildContactUrls(settings);

  return (
    <Suspense>
      <AnfrageForm
        whatsappHref={whatsappHref}
        instagramHref={instagramHref}
        instagramHandle={settings.business_instagram.replace(/^@/, '')}
      />
    </Suspense>
  );
}

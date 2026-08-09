import { Metadata } from 'next';
import { Suspense } from 'react';
import { getTranslations } from 'next-intl/server';
import { buildContactUrls, getSettings } from '@/lib/settings';
import AidaAnfrageForm from './AidaAnfrageForm';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('public.anfrageAida');
  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
    // Link enviado a quem já entrou em contato. A landing page pública e
    // indexável vem depois, quando o programa do grupo estiver fechado.
    robots: { index: false, follow: false },
  };
}

export default async function AidaAnfragePage() {
  const settings = await getSettings();
  const { whatsappHref, instagramHref } = buildContactUrls(settings);

  return (
    <Suspense>
      <AidaAnfrageForm
        whatsappHref={whatsappHref}
        instagramHref={instagramHref}
        instagramHandle={settings.business_instagram.replace(/^@/, '')}
      />
    </Suspense>
  );
}

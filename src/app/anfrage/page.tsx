import { Metadata } from 'next';
import { Suspense } from 'react';
import { getTranslations } from 'next-intl/server';
import AnfrageForm from './AnfrageForm';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('public.anfrage');
  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
    robots: { index: false, follow: false },
  };
}

export default function AnfragePage() {
  return (
    <Suspense>
      <AnfrageForm />
    </Suspense>
  );
}

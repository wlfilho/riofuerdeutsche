import { getTranslations } from 'next-intl/server';
import ReviewsModeration from '@/app/admin/ReviewsModeration';

export async function generateMetadata() {
  const t = await getTranslations('admin.avaliacoes');
  return { title: t('metaTitle') };
}

export default async function BewertungenPage() {
  const t = await getTranslations('admin.avaliacoes');
  return (
    <div className="p-4 sm:p-6 md:p-10 max-w-4xl">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">{t('titulo')}</h1>
      <p className="text-gray-500 mb-8">{t('subtitulo')}</p>
      <ReviewsModeration />
    </div>
  );
}

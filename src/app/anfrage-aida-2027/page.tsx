import { Metadata } from 'next';
import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { buildContactUrls, getSettings } from '@/lib/settings';
import AidaAnfrageForm from './AidaAnfrageForm';

// Despublicada a pedido do Will (23/08/2026): as datas do navio em 2027 ainda
// não foram confirmadas pela AIDA nem por nenhum cliente — só um placeholder
// em src/lib/campaigns.ts. Página e formulário já estão prontos por trás
// disso; assim que a data vier confirmada, é só apagar este bloco (e o
// import de notFound) para reabrir a rota.
const PUBLISHED = false;

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('public.anfrageAida2027');
  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
    // Link enviado a quem já entrou em contato. A landing page pública e
    // indexável vem depois, quando o programa do grupo estiver fechado.
    robots: { index: false, follow: false },
  };
}

export default async function AidaAnfrage2027Page() {
  if (!PUBLISHED) notFound();

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

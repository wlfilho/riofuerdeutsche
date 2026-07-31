import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import NavbarServer from '@/components/NavbarServer'
import FooterServer from '@/components/FooterServer'
import BewertungenClient from './BewertungenClient'
import { getSettings, buildContactUrls } from '@/lib/settings'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('public.bewertungen')
  return {
    title: t('metaTitle'),
    description: 'Was unsere Gäste über Rio für Deutsche sagen — echte Erfahrungen von deutschen Reisenden.',
    alternates: {
      canonical: 'https://riofuerdeutsche.de/bewertungen',
    },
    openGraph: {
      url: 'https://riofuerdeutsche.de/bewertungen',
    },
  }
}

export default async function BewertungenPage() {
  const settings = await getSettings()
  const { whatsappHref } = buildContactUrls(settings)

  return (
    <div className="min-h-screen bg-gray-50 font-sans relative">
      <NavbarServer />
      <BewertungenClient whatsappHref={whatsappHref} />
      <FooterServer />
    </div>
  )
}

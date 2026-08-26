import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import NavbarServer from '@/components/NavbarServer'
import FooterServer from '@/components/FooterServer'
import BewertungenClient from './BewertungenClient'
import { getSettings, buildContactUrls } from '@/lib/settings'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('public.bewertungen')
  const title = t('metaTitle')
  const description = 'Was unsere Gäste über Rio für Deutsche sagen — echte Erfahrungen von deutschen Reisenden.'
  return {
    title,
    description,
    alternates: {
      canonical: 'https://riofuerdeutsche.de/bewertungen',
    },
    // Definir openGraph aqui substitui o objeto inteiro do layout raiz (que
    // tem type/title/image próprios) em vez de completar — por isso title,
    // description, type e image precisam ser repetidos, não só url.
    openGraph: {
      type: 'website',
      title,
      description,
      url: 'https://riofuerdeutsche.de/bewertungen',
      siteName: 'Rio für Deutsche',
      images: [{ url: '/og/og-propostas.jpg', width: 1280, height: 670 }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['/og/og-propostas.jpg'],
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

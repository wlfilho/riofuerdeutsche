import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import NavbarServer from '@/components/NavbarServer'
import FooterServer from '@/components/FooterServer'
import BewertungenClient from '../BewertungenClient'
import { getSettings, buildContactUrls } from '@/lib/settings'
import { getApprovedReviewById } from '@/lib/reviews'
import { getPublicReviewPhotos } from '@/lib/reviewPhotos'

type Params = { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { id } = await params
  const review = await getApprovedReviewById(id)
  const t = await getTranslations('public.bewertungen')
  const canonicalUrl = `https://riofuerdeutsche.de/bewertungen/${id}`

  if (!review) {
    return {
      title: t('metaTitle'),
      alternates: { canonical: 'https://riofuerdeutsche.de/bewertungen' },
    }
  }

  const title = `${review.nickname}: „${review.title}“`
  const description = review.body.length > 155 ? `${review.body.slice(0, 155)}…` : review.body

  // Fotos de review são sempre WebP (ver /api/reviews/upload-photo) — WhatsApp/
  // Facebook não renderizam WebP em og:image, então passa pela conversão pra
  // JPEG sob demanda em /api/og/review-photo antes de virar og:image.
  const ogPhoto = getPublicReviewPhotos(review)[0]
  const ogImage = ogPhoto
    ? { url: `https://riofuerdeutsche.de/api/og/review-photo?url=${encodeURIComponent(ogPhoto)}`, width: 1200, height: 900 }
    : { url: '/og/og-propostas.jpg', width: 1280, height: 670 }

  return {
    // `absolute`: já tem o nome da pessoa no título, sem precisar do sufixo do template.
    title: { absolute: `${title} | Rio für Deutsche` },
    description,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: 'Rio für Deutsche',
      images: [ogImage],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage.url],
    },
  }
}

export default async function BewertungPage({ params }: Params) {
  const { id } = await params
  const settings = await getSettings()
  const { whatsappHref } = buildContactUrls(settings)

  return (
    <div className="min-h-screen bg-gray-50 font-sans relative">
      <NavbarServer />
      <BewertungenClient whatsappHref={whatsappHref} highlightId={id} />
      <FooterServer />
    </div>
  )
}

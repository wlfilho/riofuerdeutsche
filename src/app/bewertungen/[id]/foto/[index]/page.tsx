import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import NavbarServer from '@/components/NavbarServer'
import FooterServer from '@/components/FooterServer'
import ShareButtons from '@/components/ShareButtons'
import PhotoPageKeys from '@/components/PhotoPageKeys'
import { getApprovedReviewById } from '@/lib/reviews'
import { getPublicReviewPhotos, getReviewAvatarUrl } from '@/lib/reviewPhotos'

type Params = { params: Promise<{ id: string; index: string }> }

// Índice na URL é 1-based (mais legível pra gente que 0-based) — só na
// leitura do array que volta pra 0-based.
async function loadPhoto(id: string, index: string) {
  const n = Number(index)
  if (!Number.isInteger(n) || n < 1) return null
  const review = await getApprovedReviewById(id)
  if (!review) return null
  const photos = getPublicReviewPhotos(review)
  const photoUrl = photos[n - 1]
  if (!photoUrl) return null
  return { review, photos, n, photoUrl }
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { id, index } = await params
  const t = await getTranslations('public.bewertungen')
  const loaded = await loadPhoto(id, index)

  if (!loaded) {
    return {
      title: t('metaTitle'),
      alternates: { canonical: 'https://riofuerdeutsche.de/bewertungen' },
    }
  }

  const { review, photos, n, photoUrl } = loaded
  const canonicalUrl = `https://riofuerdeutsche.de/bewertungen/${id}/foto/${n}`
  const title = `${review.nickname}: „${review.title}“`
  const description = t('shareText', { title: review.title, nickname: review.nickname })

  // Fotos de review são sempre WebP — WhatsApp/Facebook não renderizam WebP
  // em og:image, então passa pela conversão pra JPEG sob demanda.
  const ogImage = {
    url: `https://riofuerdeutsche.de/api/og/review-photo?url=${encodeURIComponent(photoUrl)}`,
    width: 1200,
    height: 900,
  }

  return {
    title: { absolute: `${title} (${n}/${photos.length}) | Rio für Deutsche` },
    description,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      // `type` some se não for repetido aqui: definir openGraph num
      // generateMetadata substitui o objeto inteiro do layout raiz (que tem
      // type: "website"), não faz merge campo a campo. Sem isso, og:type
      // desaparece — e é uma das 4 propriedades obrigatórias do Open Graph
      // (junto com title, image, url); sem ela o Facebook pode não
      // reconhecer o conteúdo como compartilhável.
      type: 'website',
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

export default async function FotoPage({ params }: Params) {
  const { id, index } = await params
  const t = await getTranslations('public.bewertungen')
  const loaded = await loadPhoto(id, index)
  if (!loaded) notFound()

  const { review, photos, n, photoUrl } = loaded
  const reviewHref = `/bewertungen/${id}`
  // Com mais de uma foto, as setas dão a volta: da última pra primeira e vice-versa.
  const hasMultiple = photos.length > 1
  const prevN = n > 1 ? n - 1 : photos.length
  const nextN = n < photos.length ? n + 1 : 1
  const prevHref = hasMultiple ? `/bewertungen/${id}/foto/${prevN}` : undefined
  const nextHref = hasMultiple ? `/bewertungen/${id}/foto/${nextN}` : undefined
  const avatarUrl = getReviewAvatarUrl(review)
  const canonicalUrl = `https://riofuerdeutsche.de/bewertungen/${id}/foto/${n}`

  return (
    <div className="min-h-screen bg-black font-sans flex flex-col">
      <NavbarServer />
      <PhotoPageKeys prevHref={prevHref} nextHref={nextHref} backHref={reviewHref} />

      <main className="flex-1 flex flex-col">
        {/* Área da foto */}
        <div className="relative flex-1 min-h-0 flex items-center justify-center px-4 pt-24 pb-6">
          {/* eslint-disable-next-line @next/next/no-img-element -- tamanho variável por foto, ver nota no upload-photo */}
          <img
            src={photoUrl}
            alt={t('photoAlt', { n: String(n) })}
            className="max-h-[65vh] max-w-full object-contain rounded-lg shadow-2xl"
          />

          {hasMultiple && (
            <Link href={prevHref!} aria-label={t('prevPhoto')} title={t('prevPhoto')}
              className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2
                bg-white/10 hover:bg-white/20 backdrop-blur-md text-white rounded-full
                w-11 h-11 sm:w-12 sm:h-12 flex items-center justify-center transition-all border border-white/20 hover:scale-110 active:scale-95">
              <ChevronLeft className="w-6 h-6" />
            </Link>
          )}
          {hasMultiple && (
            <Link href={nextHref!} aria-label={t('nextPhoto')} title={t('nextPhoto')}
              className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2
                bg-white/10 hover:bg-white/20 backdrop-blur-md text-white rounded-full
                w-11 h-11 sm:w-12 sm:h-12 flex items-center justify-center transition-all border border-white/20 hover:scale-110 active:scale-95">
              <ChevronRight className="w-6 h-6" />
            </Link>
          )}

          <Link href={reviewHref} aria-label={t('closeGallery')} title={t('closeGallery')}
            className="absolute top-4 right-4 sm:top-6 sm:right-6
              bg-white/10 hover:bg-white/20 backdrop-blur-md text-white rounded-full
              w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center transition-all border border-white/20 hover:scale-110 active:scale-95">
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </Link>

          <p className="hidden sm:block absolute top-6 left-6 text-white/30 text-[10px] uppercase font-bold tracking-[2px]">
            {t('galleryLabel')}
          </p>
        </div>

        {/* Contexto da review + compartilhar */}
        <div className="shrink-0 bg-black/90 backdrop-blur-md border-t border-white/10 px-4 py-5 flex flex-col items-center gap-4">
          <div className="text-white/70 text-xs font-bold tracking-wide">
            {n} / {photos.length}
          </div>

          <Link href={reviewHref} className="flex items-center gap-3 max-w-full hover:opacity-80 transition-opacity">
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element -- 40px, já é WebP pequeno; next/image exigiria mais um wrapper aqui
              <img src={avatarUrl} alt={review.nickname} className="w-10 h-10 rounded-full object-cover shrink-0" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                <span className="text-white font-bold text-sm">{review.nickname?.charAt(0).toUpperCase()}</span>
              </div>
            )}
            <div className="min-w-0 text-left">
              <p className="text-white font-bold text-sm leading-tight truncate">{review.nickname}</p>
              <p className="text-white/50 text-xs truncate">„{review.title}“</p>
            </div>
          </Link>

          <ShareButtons
            url={canonicalUrl}
            text={t('shareText', { title: review.title, nickname: review.nickname })}
          />
        </div>
      </main>

      <FooterServer />
    </div>
  )
}

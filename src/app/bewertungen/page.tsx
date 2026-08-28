import type { Metadata } from 'next'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import NavbarServer from '@/components/NavbarServer'
import FooterServer from '@/components/FooterServer'
import BewertungenClient from './BewertungenClient'
import { getSettings, buildContactUrls } from '@/lib/settings'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('public.bewertungen')
  const title = t('metaTitle')
  const description = 'Was unsere Gäste über Rio für Deutsche sagen: echte Erfahrungen von deutschen Reisenden.'
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

      {/* Quem acabou de ler as avaliações é o visitante mais quente do site: já
          sabe o que é o serviço e já viu prova social. Antes desta seção a
          página terminava sem nenhum pedido. Fica aqui na page (server) e não
          dentro do client porque não depende de nenhum estado da lista. */}
      <section className="bg-rio-green">
        <div className="max-w-3xl mx-auto px-5 py-16 text-center">
          <h2 className="text-2xl sm:text-3xl font-heading font-black text-white mb-4">
            Klingt nach deiner Art zu reisen?
          </h2>
          <p className="text-base sm:text-lg text-rio-sand/90 mb-8 leading-relaxed">
            Erzähl mir, wann du kommst und was dich interessiert. Du bekommst meistens innerhalb von 48 Stunden einen Vorschlag mit Ablauf und Preis, kostenlos und unverbindlich.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href="/anfrage?von=site"
              className="inline-flex items-center justify-center px-8 py-4 bg-rio-yellow text-gray-900 rounded-full font-bold text-lg hover:bg-yellow-400 hover:scale-[1.02] transition-all shadow-xl shadow-black/10"
            >
              Tour anfragen
            </Link>
            {whatsappHref && (
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-8 py-4 bg-white/10 backdrop-blur-md border border-white/30 text-white rounded-full font-medium text-lg hover:bg-white/20 transition-all"
              >
                Auf WhatsApp schreiben
              </a>
            )}
          </div>
        </div>
      </section>

      <FooterServer />
    </div>
  )
}

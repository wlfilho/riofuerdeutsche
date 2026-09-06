import { getSettings, buildContactUrls } from '@/lib/settings'
import Footer from './Footer'

export default async function FooterServer() {
  const settings = await getSettings()
  const contact = buildContactUrls(settings)

  // E.164 para o JSON-LD (sem espaços), casando com o Google Business Profile.
  const phoneDigits = (settings.business_phone || settings.business_whatsapp).replace(/\D/g, '')

  // Nó de organização do site, um por página (o FooterServer aparece uma vez
  // por página). Era o LocalBusiness da home; TravelAgency é subtipo de
  // LocalBusiness e o @id continua o mesmo, então os TouristTrip da home
  // seguem referenciando este nó.
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'TravelAgency',
    '@id': 'https://riofuerdeutsche.de/#business',
    name: 'Rio für Deutsche',
    description:
      'Deutschsprachige Stadtführungen und Ausflüge in Rio de Janeiro. Maßgeschneidert, sicher und unvergesslich.',
    url: 'https://riofuerdeutsche.de',
    telephone: phoneDigits ? `+${phoneDigits}` : '',
    email: settings.business_email,
    image: '/images/rio-background.webp',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Rio de Janeiro',
      addressCountry: 'BR',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: -22.9068,
      longitude: -43.1729,
    },
    priceRange: '$$',
    areaServed: { '@type': 'City', name: 'Rio de Janeiro' },
    availableLanguage: ['de', 'pt', 'en'],
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '5.0',
      reviewCount: '3',
      bestRating: '5',
    },
    knowsLanguage: [
      { '@type': 'Language', name: 'German', alternateName: 'de' },
      { '@type': 'Language', name: 'Portuguese', alternateName: 'pt' },
    ],
    sameAs: [contact.instagramHref, contact.youtubeHref].filter(Boolean),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Footer contact={contact} />
    </>
  )
}

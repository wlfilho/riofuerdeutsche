import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FadeIn from "@/components/FadeIn";
import {
  ArrowRight,
  MapPin,
  Camera,
  Star,
  HeartHandshake,
  Phone,
  User,
} from "lucide-react";

// JSON-LD structured data for Google rich results
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "LocalBusiness",
      "@id": "https://riofuerdeutsche.de/#business",
      name: "Rio für Deutsche",
      description:
        "Deutschsprachige Privattouren durch Rio de Janeiro. Maßgeschneidert, sicher und unvergesslich.",
      url: "https://riofuerdeutsche.de",
      telephone: "+573148704374",
      email: "lantelmew@gmail.com",
      image: "/images/rio-background.webp",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Rio de Janeiro",
        addressCountry: "BR",
      },
      geo: {
        "@type": "GeoCoordinates",
        latitude: -22.9068,
        longitude: -43.1729,
      },
      priceRange: "$$",
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: "5.0",
        reviewCount: "3",
        bestRating: "5",
      },
      sameAs: [
        "https://instagram.com/riofuerdeutsche",
        "https://youtube.com/@riofuerdeutsche",
      ],
      availableLanguage: [
        {
          "@type": "Language",
          name: "German",
          alternateName: "de",
        },
        {
          "@type": "Language",
          name: "Portuguese",
          alternateName: "pt",
        },
      ],
    },
    {
      "@type": "TouristTrip",
      name: "Die Klassiker in Rio",
      description:
        "Christusstatue, Zuckerhut, Selarón-Treppe & das historische Zentrum an einem Tag.",
      touristType: "Deutschsprachige Touristen",
      provider: { "@id": "https://riofuerdeutsche.de/#business" },
    },
    {
      "@type": "TouristTrip",
      name: "Favela Tour in Rio de Janeiro",
      description:
        "Ein respektvoller Einblick in die Kultur und den Alltag der Favelas — Rocinha und The Maze.",
      touristType: "Deutschsprachige Touristen",
      provider: { "@id": "https://riofuerdeutsche.de/#business" },
    },
    {
      "@type": "TouristTrip",
      name: "Natur & Strände in Rio",
      description:
        "Tijuca-Nationalpark mit Wasserfällen und versteckte Traumstrände Rios.",
      touristType: "Deutschsprachige Touristen",
      provider: { "@id": "https://riofuerdeutsche.de/#business" },
    },
    {
      "@type": "TouristTrip",
      name: "Kultur & Geschichte in Rio",
      description: "Museen, historische Gebäude und die faszinierende Geschichte Rios — vom kolonialen Zentrum bis zur Praça Mauá.",
      touristType: "Deutschsprachige Touristen",
      provider: { "@id": "https://riofuerdeutsche.de/#business" },
    },
    {
      "@type": "TouristTrip",
      name: "Karneval in Rio de Janeiro",
      description: "Sambódromo, Blocos de Rua und Samba-Ensaios — das größte Fest der Welt hautnah erleben.",
      touristType: "Deutschsprachige Touristen",
      provider: { "@id": "https://riofuerdeutsche.de/#business" },
    },
    {
      "@type": "TouristTrip",
      name: "Tagesausflüge ab Rio de Janeiro",
      description: "Búzios, Ilha Grande, Paraty, Petrópolis und Arraial do Cabo — traumhafte Ausflüge rund um Rio.",
      touristType: "Deutschsprachige Touristen",
      provider: { "@id": "https://riofuerdeutsche.de/#business" },
    },
  ],
};

const tours = [
  {
    title: "Die Klassiker in Rio",
    duration: "~8 Stunden",
    highlights: "13 Highlights",
    desc: "Christusstatue, Zuckerhut, Selarón-Treppe & das historische Zentrum an einem Tag.",
    img: "/images/home-pao-de-acucar.webp",
    alt: "Die Klassiker Tour in Rio de Janeiro",
    link: "/touren/klassiker",
  },
  {
    title: "Favela Tour in Rio de Janeiro",
    duration: "2–3 Stunden",
    highlights: "2 Highlights",
    desc: "Ein respektvoller Einblick in die Kultur und den Alltag der Favelas — Rocinha und The Maze.",
    img: "/images/rio-favela.webp",
    alt: "Authentische Favela Tour in Rio de Janeiro",
    link: "/touren/favela-tour",
  },
  {
    title: "Natur & Strände in Rio",
    duration: "3–8 Stunden",
    highlights: "9 Highlights",
    desc: "Tijuca-Nationalpark mit Wasserfällen und versteckte Traumstrände Rios.",
    img: "/images/rio-natur.webp",
    alt: "Natur und Strände Tour in Rio de Janeiro",
    link: "/touren/natur-und-straende",
  },
  {
    title: "Kultur & Geschichte in Rio",
    duration: "4–6 Stunden",
    highlights: "14 Highlights",
    desc: "Museen, historische Gebäude und die faszinierende Geschichte Rios — vom kolonialen Zentrum bis zur Praça Mauá.",
    img: "/images/kultur-und-geschichte-bg.webp",
    alt: "Kultur und Geschichte Tour in Rio de Janeiro",
    link: "/touren/kultur-und-geschichte",
  },
  {
    title: "Karneval in Rio de Janeiro",
    duration: "Saisonale Tour",
    highlights: "3 Erlebnisse",
    desc: "Sambódromo, Blocos de Rua und Samba-Ensaios — das größte Fest der Welt hautnah erleben.",
    img: "/images/bloco-background.webp",
    alt: "Karneval Tour in Rio de Janeiro",
    link: "/touren/karneval-tour",
  },
  {
    title: "Tagesausflüge ab Rio de Janeiro",
    duration: "Ganztägig",
    highlights: "5 Highlights",
    desc: "Búzios, Ilha Grande, Paraty, Petrópolis und Arraial do Cabo — traumhafte Ausflüge rund um Rio.",
    img: "/images/ilha-grande-bg.webp",
    alt: "Tagesausflüge ab Rio de Janeiro",
    link: "/touren/tagesausfluege",
  },
];

const reviews = [
  {
    text: "Beste Entscheidung unseres Rio Urlaubs! Super sicher und extrem informativ. Danke an das tolle Team!",
    name: "Michael & Sarah",
    rating: 5,
  },
  {
    text: "Wir haben uns zu jeder Zeit absolut sicher gefühlt. Die Tour zur Christusstatue war perfekt organisiert.",
    name: "Thomas M.",
    rating: 5,
  },
  {
    text: "Tolle Insidertipps und ein fantastischer Tag. Ohne unseren Guide hätten wir das wahre Rio nie so erlebt.",
    name: "Familie Weber",
    rating: 5,
  },
];


export default function Home() {
  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="flex flex-col min-h-screen bg-rio-sand selection:bg-rio-green selection:text-white pb-0 font-sans">
        {/* Client Component: Navbar with mobile menu state */}
        <Navbar />

        <main>
          {/* HERO SECTION */}
          <section className="relative h-screen min-h-[600px] flex items-center pt-20 overflow-hidden">
            {/* Background Image with next/image for optimization */}
            <div className="absolute inset-0">
              <Image
                src="/images/rio-background.webp"
                alt="Panoramablick auf Rio de Janeiro mit Zuckerhut und Guanabara-Bucht"
                fill
                priority
                quality={80}
                sizes="100vw"
                className="object-cover object-center"
              />
              {/* Gradient Overlay for Text Readability */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent"></div>
              <div className="absolute inset-0 bg-gradient-to-t from-rio-sand via-transparent to-transparent opacity-90"></div>
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-5 lg:px-8 w-full">
              <FadeIn direction="up">
                <div className="max-w-2xl space-y-6">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white text-sm font-medium">
                    <HeartHandshake className="w-4 h-4 text-rio-yellow" />
                    <span>Dein deutschsprachiger Guide in Rio</span>
                  </div>

                  <h1 className="text-5xl lg:text-7xl font-heading font-bold text-white leading-[1.1] tracking-tight text-shadow-hero">
                    Entdecke Rio <br />
                    <span className="text-rio-yellow">wie ein Einheimischer</span>
                  </h1>

                  <p className="text-lg lg:text-xl text-gray-200 max-w-xl font-light leading-relaxed">
                    Deutschsprachige Privattouren durch Rio de Janeiro. Maßgeschneidert, sicher und unvergesslich – erlebe die Marvelous City aus der besten Perspektive.
                  </p>

                  <div className="flex flex-col sm:flex-row gap-4 pt-4">
                    <Link
                      href="#touren"
                      className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-rio-yellow text-gray-900 rounded-full font-semibold text-lg hover:bg-yellow-400 hover:scale-[1.02] transition-all shadow-xl shadow-rio-yellow/20"
                    >
                      <Camera className="w-5 h-5" />
                      Touren ansehen
                    </Link>
                    <Link
                      href="/kontakt"
                      className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-md border border-white/30 text-white rounded-full font-medium text-lg hover:bg-white/20 transition-all"
                    >
                      Kostenlos anfragen
                    </Link>
                  </div>
                </div>
              </FadeIn>
            </div>
          </section>

          {/* WHY US SECTION */}
          <section id="vorteile" className="py-24 bg-white" aria-labelledby="vorteile-heading">
            <div className="max-w-5xl mx-auto px-5 lg:px-8">
              <FadeIn direction="up" className="text-center mb-12">
                <h2 id="vorteile-heading" className="text-4xl md:text-5xl font-heading font-bold text-gray-900 tracking-tight mb-3">
                  WARUM RIOFÜRDEUTSCHE?
                </h2>
                <p className="text-xl md:text-2xl font-heading font-semibold text-rio-green mb-6">
                  Dein Rio-Urlaub in den besten Händen
                </p>
                <p className="text-lg text-gray-600 leading-relaxed max-w-3xl mx-auto">
                  Persönliche deutschsprachige Begleitung, eigene Fahrzeuge mit Fahrer, flexible Routen und ein Service, der keine Wünsche offen lässt. Wir planen deinen Rio-Urlaub bis ins kleinste Detail, damit du ihn sicher und sorgenfrei genießen kannst. Bei uns bekommst du nicht nur einen erstklassigen Service, sondern ein unvergessliches Rio-Erlebnis.
                </p>
              </FadeIn>

              <FadeIn direction="up" delay={0.1}>
                <div className="grid sm:grid-cols-2 gap-x-12 gap-y-6 mb-12">
                  {[
                    { emoji: "🎯", text: "100 % auf Rio de Janeiro spezialisiert" },
                    { emoji: "🇩🇪", text: "Deutschsprachige Begleitung durch einen echten Carioca" },
                    { emoji: "🚗", text: "Eigene Fahrzeuge mit Fahrer für maximalen Komfort" },
                    { emoji: "🛡️", text: "Sicherheit an erster Stelle – sichere Routen und beste Zeiten" },
                    { emoji: "✨", text: "Individueller Service, von der Beratung bis zur Tour" },
                    { emoji: "💬", text: "Schnelle Erreichbarkeit per WhatsApp und E-Mail" },
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-4">
                      <span className="text-2xl leading-none mt-0.5 shrink-0">{item.emoji}</span>
                      <span className="text-gray-900 font-bold text-base leading-snug">{item.text}</span>
                    </div>
                  ))}
                </div>
              </FadeIn>

              <FadeIn direction="up" delay={0.2}>
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                  <Link
                    href="/touren"
                    className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-rio-green text-white rounded-full font-bold text-base hover:bg-rio-green/90 hover:scale-[1.02] transition-all shadow-lg"
                  >
                    TOUREN ANSEHEN
                  </Link>
                  <Link
                    href="/unterkunft/beratung"
                    className="inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-rio-green text-rio-green rounded-full font-bold text-base hover:bg-rio-green/5 transition-all"
                  >
                    BERATUNG BUCHEN
                  </Link>
                </div>
              </FadeIn>
            </div>
          </section>

          {/* TOP TOURS SECTION */}
          <section id="touren" className="py-24 bg-gray-50" aria-labelledby="touren-heading">
            <div className="max-w-7xl mx-auto px-5 lg:px-8">
              <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
                <FadeIn direction="left" className="max-w-2xl">
                  <h2 id="touren-heading" className="text-rio-green font-semibold tracking-wide uppercase text-sm mb-3">Touren & Ausflüge in Rio de Janeiro</h2>
                  <p className="text-3xl md:text-4xl font-heading font-bold text-gray-900 leading-tight">
                    Geführte Touren in Rio de Janeiro
                  </p>
                </FadeIn>
                <FadeIn direction="right">
                  <Link href="/touren/klassiker" className="group inline-flex items-center gap-2 text-rio-blue font-medium hover:text-rio-blue/80 transition-colors">
                    Alle Touren ansehen
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </FadeIn>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {tours.map((tour, i) => {
                  const isComingSoon = (tour as any).isComingSoon;
                  const CardWrapper = isComingSoon ? 'a' : Link;
                  const wrapperProps = isComingSoon
                    ? { href: tour.link, target: "_blank", rel: "noopener noreferrer" }
                    : { href: tour.link };

                  return (
                    <FadeIn key={i} delay={i * 0.15} direction="up">
                      <CardWrapper
                        {...(wrapperProps as any)}
                        className={`group flex flex-col rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl border transition-all duration-300 h-full ${isComingSoon ? 'bg-gray-100/50 border-gray-200 opacity-90' : 'bg-white border-gray-100'
                          }`}
                      >
                        <div className={`relative h-64 overflow-hidden ${isComingSoon ? 'bg-gray-200/50 flex items-center justify-center' : ''}`}>
                          {!isComingSoon && (
                            <div className="absolute inset-0 bg-gray-900 group-hover:bg-opacity-20 transition-all z-10 opacity-0"></div>
                          )}
                          {tour.img ? (
                            <Image
                              src={tour.img}
                              alt={tour.alt}
                              fill
                              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                              className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                            />
                          ) : (
                            <span className="text-5xl grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500">🏛️</span>
                          )}
                          <div className="absolute top-4 right-4 z-20 flex flex-wrap gap-2 justify-end">
                            {isComingSoon && (
                              <div className="bg-gray-500/80 backdrop-blur px-3 py-1 rounded-full text-[10px] font-bold text-white border border-gray-400/30 uppercase tracking-wider">
                                In Kürze
                              </div>
                            )}
                            {[tour.duration, tour.highlights].map((badge) => (
                              <div key={badge} className="bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[10px] font-bold text-rio-green border border-gray-100 uppercase tracking-wider">
                                {badge}
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="p-8 flex flex-col flex-grow">
                          <h3 className="text-xl font-bold font-heading text-gray-900 mb-3 line-clamp-2">{tour.title}</h3>
                          <p className="text-gray-600 mb-6 flex-grow">{tour.desc}</p>
                          <div className="inline-flex items-center gap-2 text-rio-green font-semibold group-hover:-translate-y-0.5 transition-transform mt-auto">
                            {isComingSoon ? "Details anfragen" : "Zur Tour"}
                            <ArrowRight className="w-4 h-4" />
                          </div>
                        </div>
                      </CardWrapper>
                    </FadeIn>
                  );
                })}
              </div>
            </div>
          </section>

          {/* ABOUT US / GUIDE TEASER */}
          <section id="ueber-uns" className="py-24 bg-white overflow-hidden" aria-labelledby="ueber-uns-heading">
            <div className="max-w-7xl mx-auto px-5 lg:px-8">
              <div className="flex flex-col lg:flex-row items-center gap-16">
                <FadeIn direction="left" className="lg:w-1/2 relative">
                  <div className="absolute -top-6 -left-6 w-32 h-32 bg-rio-yellow/20 rounded-full blur-2xl"></div>
                  <div className="absolute -bottom-6 -right-6 w-48 h-48 bg-rio-green/10 rounded-full blur-3xl"></div>
                  <Image
                    src="/images/rio-cristo.webp"
                    alt="Christusstatue in Rio de Janeiro – Sicht aus der Nähe während einer Tour"
                    width={600}
                    height={600}
                    className="relative z-10 w-full aspect-square object-cover object-left rounded-tr-[80px] rounded-bl-[80px] rounded-tl-3xl rounded-br-3xl shadow-2xl"
                    style={{ objectPosition: "0% 80%" }}
                  />
                </FadeIn>

                <FadeIn direction="right" className="lg:w-1/2 space-y-6">
                  <h2 id="ueber-uns-heading" className="text-rio-green font-semibold tracking-wide uppercase text-sm mb-2">Über Mich</h2>
                  <p className="text-3xl md:text-5xl font-heading font-bold text-gray-900 leading-tight">
                    Hallo, ich bin <span className="text-rio-blue">Will!</span>
                  </p>
                  <p className="text-lg text-gray-600 leading-relaxed">
                    Geboren und aufgewachsen in Rio, habe ich an der Köln International School of Design studiert und spreche fließend Deutsch. Ich kenne beide Welten: die deutsche Mentalität und das Leben als Carioca. Und genau das macht den Unterschied.
                  </p>
                  <p className="text-lg text-gray-600 leading-relaxed">
                    In den meisten Fällen begleite ich dich persönlich. Wenn ich bereits mit einer Gruppe unterwegs bin, übernehmen erfahrene Partner-Guides meines Vertrauens – mit der gleichen Leidenschaft für Rio und dem gleichen Anspruch an Sicherheit.
                  </p>

                  <blockquote className="border-l-4 border-rio-yellow pl-4 py-2 my-6">
                    <p className="text-xl italic font-medium text-gray-800">
                      &quot;Kein Vermittler, keine Agentur dazwischen. Du buchst direkt bei einem Carioca, der deine Sprache spricht und deine Stadt kennt.&quot;
                    </p>
                  </blockquote>

                  <div className="flex flex-wrap gap-3 pt-4">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100/80 text-gray-800 text-sm font-medium">
                      <MapPin className="w-4 h-4 text-rio-blue" />
                      <span>Lokaler Guide</span>
                    </div>
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100/80 text-gray-800 text-sm font-medium">
                      <HeartHandshake className="w-4 h-4 text-rio-blue" />
                      <span>Deutschsprachig</span>
                    </div>
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100/80 text-gray-800 text-sm font-medium">
                      <User className="w-4 h-4 text-rio-blue" />
                      <span>Carioca</span>
                    </div>
                  </div>
                </FadeIn>
              </div>
            </div>
          </section>

          {/* RIO ERLEBEN SECTION */}
          <section id="rio-erleben" className="py-24 bg-gray-50" aria-labelledby="rio-erleben-heading">
            <div className="max-w-4xl mx-auto px-5 lg:px-8">
              <FadeIn direction="up" className="text-center mb-14">
                <h2 id="rio-erleben-heading" className="text-3xl md:text-4xl font-heading font-bold text-gray-900 leading-tight mb-4">
                  Rio de Janeiro erleben –{" "}
                  <span className="text-rio-green">sicher, authentisch und auf Deutsch</span>
                </h2>
              </FadeIn>

              <div className="space-y-6">
                <FadeIn direction="up" delay={0.1}>
                  <p className="text-lg text-gray-700 leading-relaxed">
                    Du träumst von Rio de Janeiro? Vom Blick auf die Stadt vom Zuckerhut, dem Cristo Redentor bei Sonnenaufgang, den legendären Stränden von Ipanema und Copacabana oder einem echten Fußballspiel im Maracanã? Dann bist du bei RioFürDeutsche genau richtig.
                  </p>
                </FadeIn>

                <FadeIn direction="up" delay={0.15}>
                  <p className="text-lg text-gray-700 leading-relaxed">
                    Bei uns erlebst du Rio so, wie es nur ein Einheimischer zeigen kann – ob auf unserer Klassiker Tour zu den großen Sehenswürdigkeiten, einer Favela Tour mit echtem Einblick, einer Natur- und Strandtour zu den schönsten Küsten, einer Kultur- und Geschichtstour durch die Seele der Stadt, einer unvergesslichen Karneval Tour, beim Rio by Night oder bei einem Fußballerlebnis im Stadion. Du kannst aus unseren Touren wählen oder dir eine komplett individuelle Tour zusammenstellen – ganz nach deinen Wünschen.
                  </p>
                </FadeIn>

                <FadeIn direction="up" delay={0.2}>
                  <p className="text-lg text-gray-700 leading-relaxed">
                    Alle Touren finden in unseren eigenen Fahrzeugen mit Fahrer statt – bequem, sicher und ohne Stress. Wir bieten außerdem einen Flughafen-Transfer direkt zu deiner Unterkunft an, damit deine Reise entspannt beginnt.
                  </p>
                </FadeIn>

                <FadeIn direction="up" delay={0.25}>
                  <p className="text-lg text-gray-700 leading-relaxed">
                    Sicherheit ist uns besonders wichtig. Wir wissen, dass viele deutsche Reisende sich Sorgen machen, wenn es um Rio geht. Deshalb begleiten wir dich nicht nur vor Ort, sondern beraten dich auch vorab – zum Beispiel mit unserer persönlichen Unterkunftsberatung per Videocall, damit du von Anfang an im richtigen und sicheren Viertel landest.
                  </p>
                </FadeIn>

                <FadeIn direction="up" delay={0.3}>
                  <p className="text-lg text-gray-700 leading-relaxed">
                    In den meisten Fällen begleite ich dich persönlich. Wenn ich bereits mit einer Gruppe unterwegs bin, übernehmen erfahrene Partner-Guides meines Vertrauens – mit der gleichen Leidenschaft für Rio und dem gleichen Anspruch an Sicherheit.
                  </p>
                </FadeIn>

                <FadeIn direction="up" delay={0.35}>
                  <p className="text-lg text-gray-700 leading-relaxed">
                    Kein Vermittler, keine Agentur dazwischen. Bei RioFürDeutsche buchst du direkt bei einem Carioca, der deine Sprache spricht und deine Stadt kennt.
                  </p>
                </FadeIn>
              </div>
            </div>
          </section>

          {/* BEWERTUNGEN SECTION */}
          <section id="bewertungen" className="py-24 bg-rio-sand/30" aria-labelledby="bewertungen-heading">
            <div className="max-w-7xl mx-auto px-5 lg:px-8">
              <FadeIn direction="up" className="text-center max-w-2xl mx-auto mb-16">
                <h2 id="bewertungen-heading" className="text-rio-green font-semibold tracking-wide uppercase text-sm mb-3">Erfahrungen</h2>
                <p className="text-3xl md:text-4xl font-heading font-bold text-gray-900">Was unsere Gäste sagen</p>
              </FadeIn>

              <div className="grid md:grid-cols-3 gap-8">
                {reviews.map((review, i) => (
                  <FadeIn key={i} delay={i * 0.15} direction="up" className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col h-full">
                    <div className="flex gap-1 mb-4" aria-label={`${review.rating} von 5 Sternen`}>
                      {[...Array(review.rating)].map((_, j) => (
                        <Star key={j} className="w-5 h-5 fill-rio-yellow text-rio-yellow" />
                      ))}
                    </div>
                    <p className="text-gray-600 mb-6 flex-grow italic">&ldquo;{review.text}&rdquo;</p>
                    <p className="font-bold text-gray-900 border-t border-gray-100 pt-4">{review.name}</p>
                  </FadeIn>
                ))}
              </div>
            </div>
          </section>

          {/* CALL TO ACTION */}
          <section id="kontakt" className="py-24 relative overflow-hidden bg-rio-green" aria-labelledby="kontakt-heading">
            <div className="absolute inset-0 bg-[url('/images/rio-background.webp')] bg-cover bg-center mix-blend-overlay opacity-10"></div>
            <div className="relative max-w-4xl mx-auto px-5 text-center">
              <FadeIn direction="up">
                <h2 id="kontakt-heading" className="text-3xl md:text-5xl font-heading font-bold text-white mb-6">Lust auf Rio bekommen?</h2>
                <p className="text-lg text-rio-sand/90 mb-10 max-w-2xl mx-auto">
                  Lass uns unverbindlich über deine Pläne sprechen. Wir erstellen dir gerne ein auf dich zugeschnittenes Angebot für deinen Traumurlaub in Brasilien.
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                  <a
                    href="https://wa.me/573148704374"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-rio-yellow text-gray-900 rounded-full font-bold text-lg hover:bg-yellow-400 hover:scale-[1.02] transition-all shadow-xl shadow-black/10"
                  >
                    <Phone className="w-5 h-5" />
                    WhatsApp an uns
                  </a>
                  <Link
                    href="/kontakt"
                    className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-md border border-white/30 text-white rounded-full font-medium text-lg hover:bg-white/20 transition-all"
                  >
                    Zum Kontakt
                  </Link>
                </div>
              </FadeIn>
            </div>
          </section>
        </main>

        {/* FOOTER */}
        <Footer />
      </div>
    </>
  );
}

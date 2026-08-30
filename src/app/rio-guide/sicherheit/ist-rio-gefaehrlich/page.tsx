import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import NavbarServer from "@/components/NavbarServer";
import FooterServer from "@/components/FooterServer";
import ShareButtons from "@/components/ShareButtons";
import { ShieldCheck, AlertTriangle, AlertCircle, XCircle, Info, ChevronRight } from "lucide-react";

export const metadata: Metadata = {
  // `absolute` para escapar do template "%s | Rio für Deutsche": com o sufixo
  // o title ia a 87 caracteres e o Google cortava justamente o diferencial.
  title: {
    absolute: "Ist Rio de Janeiro gefährlich? Ehrliche Antwort vom Carioca",
  },
  description:
    "Ein Carioca, der in Köln gelebt hat, erklärt ehrlich, wie sicher Rio wirklich ist: welche Viertel, welche typischen Fehler und welche Regeln zählen.",
  // Depois da migração de /ist-rio-gefaehrlich para cá, o canonical é o que
  // diz ao Google qual URL é a definitiva, junto com o 308 do next.config.
  alternates: {
    canonical: "https://riofuerdeutsche.de/rio-guide/sicherheit/ist-rio-gefaehrlich",
  },
  openGraph: {
    // Declarar `openGraph` aqui substitui o objeto inteiro do layout raiz: o
    // Next não faz merge campo a campo. Por isso type, locale, siteName, url e
    // images precisam ser repetidos — sem eles a página saía com apenas
    // og:title e og:description, e compartilhar o link não gerava imagem
    // nenhuma. Mesma armadilha documentada em bewertungen/[id]/page.tsx.
    type: "website",
    locale: "de_DE",
    siteName: "Rio für Deutsche",
    url: "/rio-guide/sicherheit/ist-rio-gefaehrlich",
    title: "Ist Rio de Janeiro gefährlich? Ehrliche Antwort vom Carioca",
    description:
      "Welche Viertel sind sicher, welche Fehler machen Touristen und was tust du im Ernstfall.",
    images: [
      {
        // JPEG, não WebP: o WhatsApp não renderiza WebP no preview do link.
        url: "/images/og-sicherheit.jpg",
        width: 1200,
        height: 630,
        alt: "Rio de Janeiro Panorama, Rio für Deutsche",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Ist Rio de Janeiro gefährlich? Ehrliche Antwort vom Carioca",
    description:
      "Welche Viertel sind sicher, welche Fehler machen Touristen und was tust du im Ernstfall.",
    images: ["/images/og-sicherheit.jpg"],
  },
};

const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Ist Rio de Janeiro gefährlicher als São Paulo?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Rio hat spezifische Herausforderungen, oft im Zusammenhang mit Favelas auf Hügeln, was Kriminalität sichtbarer macht. Die Kriminalitätsraten variieren jedoch stark je nach Viertel. Mit gesundem Menschenverstand und den richtigen Verhaltensregeln ist das Risiko für Touristen in beiden Städten vergleichbar."
        }
      },
      {
        "@type": "Question",
        "name": "Welche Viertel in Rio sind am sichersten für Touristen?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Die Südzone (Zona Sul) gilt als am sichersten. Dazu gehören Ipanema, Leblon, Urca, Jardim Botânico und Botafogo. Copacabana ist ebenfalls beliebt, erfordert aber besonders nachts etwas mehr Aufmerksamkeit."
        }
      },
      {
        "@type": "Question",
        "name": "Kann man in Rio alleine reisen?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Ja, absolut. Wer sich an die lokalen Regeln hält, nicht nachts alleine durch einsame Straßen wandert und Apps wie Uber nutzt, kann die Stadt wunderbar alleine entdecken. Tausende Alleinreisende besuchen Rio jedes Jahr und haben eine sichere Reise."
        }
      },
      {
        "@type": "Question",
        "name": "Ist Copacabana sicher?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Tagsüber ist der Strand und die Promenade voll und sicher, auch wenn Taschendiebstahl passieren kann. Nachts sollte man die beleuchteten Hauptstraßen nutzen und dunkle Ecken oder den leeren Sandstrand meiden. Es ist ein lebendiges, sicheres Viertel bei richtiger Vorsicht."
        }
      },
      {
        "@type": "Question",
        "name": "Wie gefährlich ist Lapa in Rio?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Lapa ist das Ausgehzentrum Rios. Es ist nachts sehr voll, was vor Taschendieben schützt, aber man sollte immer Uber für die Hin- und Rückfahrt nutzen und nicht durch dunkle Seitenstraßen laufen. Für eine sichere Erfahrung am besten am frühen Abend oder in Gruppen gehen."
        }
      },
      {
        "@type": "Question",
        "name": "Ist Rio sicher für Frauen allein?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Frauen können sicher alleine nach Rio reisen, sollten aber grundlegende Vorsichtsmaßnahmen beachten: Nimm ein Uber, lauf nachts nicht allein durch leere Straßen, trinke verantwortungsvoll und folge deinem Bauchgefühl. Sichere Viertel in der Südzone sind der beste Ausgangspunkt."
        }
      },
      {
        "@type": "Question",
        "name": "Wie sicher ist Rio im Vergleich zu anderen Städten Südamerikas?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Rio liegt bei der Sicherheit im Mittelfeld der großen südamerikanischen Metropolen. Orte wie Buenos Aires oder Santiago gelten statistisch oft als sicherer, während andere Metropolen risikoreicher sind. Die meisten touristischen Zonen in Rio sind durch starke Polizeipräsenz gesichert."
        }
      }
    ]
  },
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Startseite",
        "item": "https://riofuerdeutsche.de/"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Rio-Guide",
        "item": "https://riofuerdeutsche.de/rio-guide"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": "Ist Rio gefährlich?",
        "item": "https://riofuerdeutsche.de/rio-guide/sicherheit/ist-rio-gefaehrlich"
      }
    ]
  },
  {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "Ist Rio de Janeiro gefährlich? Die Wahrheit von einem Carioca (2026)",
    "description": "Ein Carioca, der in Deutschland lebte, erklärt die Wahrheit über Sicherheit in Rio. Welche Viertel sind sicher? Was musst du wissen? Alles hier.",
    "author": {
      "@type": "Person",
      "name": "Will",
      "url": "https://riofuerdeutsche.de/ueber-will"
    }
  },
  {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": "Will",
    "url": "https://riofuerdeutsche.de/ueber-will",
    "jobTitle": "Lokaler Guide und Rio Experte",
    "description": "Carioca, der fließend Deutsch spricht und Touristen in Rio begleitet. Ehemaliger Student in Köln."
  }
];

export default function IstRioGefaehrlich() {
  return (
    <>
      {/* JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      <div className="flex flex-col min-h-screen bg-[#f8f5f0] font-sans">
        <NavbarServer />

        <main className="flex-grow pb-16">
          {/* 1. HERO SECTION FULL WIDTH */}
          <section className="w-full bg-[#0d1f15] pt-32 pb-20 px-5 lg:px-8 text-white">
            <div className="max-w-3xl mx-auto">
              <nav className="flex items-center justify-center md:justify-start text-xs sm:text-sm font-medium text-white/60 mb-6" aria-label="Breadcrumb">
                <Link href="/" className="hover:text-rio-yellow transition-colors">Startseite</Link>
                <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 mx-1.5 sm:mx-2 text-white/30 shrink-0" />
                <Link href="/rio-guide" className="hover:text-rio-yellow transition-colors">Rio-Guide</Link>
                <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 mx-1.5 sm:mx-2 text-white/30 shrink-0" />
                <span className="text-rio-yellow" aria-current="page">Ist Rio gefährlich?</span>
              </nav>

              <div className="flex flex-wrap gap-3 justify-center md:justify-start mb-8">
                <span className="bg-white/10 backdrop-blur-md text-white border border-white/20 px-4 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase">
                  Sicherheit
                </span>
                <span className="bg-rio-yellow text-[#0d1f15] px-4 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase">
                  Rio Guide
                </span>
              </div>

              <h1 className="text-[34px] sm:text-4xl md:text-5xl lg:text-6xl font-black text-white mb-5 tracking-tight text-center md:text-left leading-[1.1] text-balance text-shadow-hero">
                Ist Rio de Janeiro gefährlich?
              </h1>
              
              <p className="text-xl md:text-2xl lg:text-3xl text-rio-yellow mb-10 md:mb-12 text-center md:text-left font-medium leading-snug text-balance max-w-3xl">
                Die Wahrheit von einem Carioca, nicht von einer Zeitung
              </p>
              
              {/* Mesmo arranjo em todas as larguras: três colunas separadas por
                  barra vertical. No mobile ele só encolhe (avatar menor, texto
                  menor, barras mais curtas) em vez de empilhar, o que economiza
                  uns 160px de altura logo abaixo do título. */}
              <div className="flex flex-row items-center justify-center md:justify-start gap-1.5 sm:gap-6 text-gray-300 border-t border-b border-white/10 py-4 sm:py-6 mb-2">
                {/* Author Info */}
                <div className="flex items-center gap-2 sm:gap-4">
                  <div className="w-9 h-9 sm:w-14 sm:h-14 rounded-full overflow-hidden relative bg-gray-800 border-2 border-rio-yellow shadow-sm shrink-0">
                    <Image src="/images/rio-cristo.webp" alt="Will - Rio Guide" fill className="object-cover" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-white text-[13px] sm:text-base leading-tight">Will</span>
                    <Link href="/ueber-will" className="text-white/70 text-[11px] sm:text-sm leading-tight hover:text-white hover:underline transition-colors whitespace-nowrap">Rio Guide</Link>
                  </div>
                </div>

                <div className="w-px h-10 sm:h-14 bg-white/10 sm:mx-2 shrink-0"></div>

                {/* Post Date */}
                <div className="flex flex-col items-center justify-center h-10 sm:h-14">
                  <span className="font-semibold text-white/60 text-[10px] sm:text-sm mb-0.5 leading-tight whitespace-nowrap">Veröffentlicht</span>
                  <span className="text-white font-medium text-[11px] sm:text-sm leading-tight whitespace-nowrap">03/2026</span>
                </div>

                <div className="w-px h-10 sm:h-14 bg-white/10 sm:mx-2 shrink-0"></div>

                {/* Last Updated */}
                <div className="flex flex-col items-center justify-center h-10 sm:h-14">
                  {/* "Zuletzt aktualisiert" é o item mais largo da linha e
                      estoura abaixo de 390px; no mobile fica só "Aktualisiert". */}
                  <span className="font-semibold text-white/60 text-[10px] sm:text-sm mb-0.5 leading-tight whitespace-nowrap">
                    <span className="sm:hidden">Aktualisiert</span>
                    <span className="hidden sm:inline">Zuletzt aktualisiert</span>
                  </span>
                  <span className="text-white font-medium text-[11px] sm:text-sm leading-tight whitespace-nowrap">03/2026</span>
                </div>
                {/* Só no desktop: ocupa o vazio à direita da barra. No mobile a
                    linha já está no limite da largura, então lá os ícones ficam
                    na instância logo abaixo. */}
                <div className="hidden sm:block w-px h-14 bg-white/10 mx-2 shrink-0"></div>

                <div className="hidden sm:flex text-white/50 [&_a:hover]:text-white">
                  <ShareButtons
                    url="https://riofuerdeutsche.de/rio-guide/sicherheit/ist-rio-gefaehrlich"
                    text="Ist Rio de Janeiro gefährlich? Die Wahrheit von einem Carioca"
                    networks={['whatsapp', 'telegram', 'facebook', 'x']}
                    tone="plain"
                    className="gap-4"
                  />
                </div>
              </div>

              <div className="sm:hidden mt-3 text-white/50 [&_a:hover]:text-white">
                <ShareButtons
                  url="https://riofuerdeutsche.de/rio-guide/sicherheit/ist-rio-gefaehrlich"
                  text="Ist Rio de Janeiro gefährlich? Die Wahrheit von einem Carioca"
                  networks={['whatsapp', 'telegram', 'facebook', 'x']}
                  size="sm"
                  tone="plain"
                  className="justify-center gap-4"
                />
              </div>

            </div>
          </section>

          <article className="max-w-3xl mx-auto px-5 lg:px-8 mt-12 md:mt-16 mb-16 text-[17px] md:text-lg leading-[1.75] text-gray-800 [&_p]:hyphens-auto [&_p]:break-words">
            <div className="text-lg md:text-xl text-gray-800 leading-[1.7] font-medium mb-12 md:mb-14">
              <p>
                Hallo! Ich bin Will, geboren und aufgewachsen in Rio de Janeiro. Ich habe einige Jahre im Rheinland, genauer gesagt in Köln, gelebt und studiert. Ich kenne die deutsche Sicherheitsliebe und ich verstehe genau, warum die Frage nach der Sicherheit in Rio so oft gestellt wird. Hier bekommst du eine ehrliche Antwort, ganz ohne Panikmache, aber auch ohne Filter.
              </p>
            </div>

            {/* 2. QUICK ANSWER */}
            <div className="bg-[#0d1f15] text-white p-6 sm:p-8 md:p-10 rounded-3xl shadow-xl mb-14 md:mb-16">
              <p className="text-lg sm:text-xl md:text-2xl font-medium leading-[1.6] mb-0">
                &ldquo;Rio ist für informierte Reisende sicher. Die Stadt hat Risiken, aber die meisten Probleme passieren, weil Touristen einfache Fehler machen. Wenn du weißt, was du tust, wirst du eine fantastische Zeit haben.&rdquo;
              </p>
            </div>

            {/* 3. ESTATÍSTICAS + CONTEXTO */}
            <section className="text-gray-800 mb-14 md:mb-16 [&>p]:mb-6 [&>p]:leading-[1.8] [&>p:last-child]:mb-0">
              <h2 className="text-[26px] md:text-3xl font-bold text-[#0d1f15] leading-tight text-balance mb-4 md:mb-6">
                Zahlen und Kontext: Ein Blick hinter die Schlagzeilen
              </h2>
              <p>
                Rund 2,1 Millionen ausländische Touristen besuchen Rio de Janeiro jedes Jahr. Die überwiegende Mehrheit dieser Besucher erlebt eine traumhafte, problemlose Reise ohne jegliche Sicherheitsprobleme.
              </p>
              <p>
                Natürlich solltest du die Warnungen des Auswärtigen Amtes ernst nehmen, aber lass dich nicht durch sensationslüsterne TV-Berichte abschrecken. Rio ist kein Kriegsgebiet. Es ist eine riesige, pulsierende Metropole. Genau wie in europäischen Großstädten, in Paris, Rom oder Berlin, gibt es Zonen, in denen Touristendiebstahl vorkommt. Der wesentliche Unterschied ist die ausgeprägte soziale Ungleichheit, die sich oft sehr stark zeigt.
              </p>
              <p>
                Sicherheit in Rio bedeutet nicht, dass du dich einschließen musst. Die touristischen Zonen der Stadt werden stark überwacht und sind hervorragend auf Besucher eingestellt. Es geht vielmehr um das Bewusstsein für die eigene Umgebung und die Vermeidung klassischer Touristenfehler.
              </p>
            </section>

            {/* 4. DIE 7 HÄUFIGSTEN FEHLER */}
            <section className="mb-16">
              <h2 className="text-[26px] md:text-3xl font-bold text-[#0d1f15] leading-tight text-balance mb-6 md:mb-8">
                Die 7 häufigsten Fehler, die Touristen machen
              </h2>
              <div className="[&>div+div]:mt-8 [&>div+div]:border-t [&>div+div]:border-gray-200 [&>div+div]:pt-8">
                <div>
                  <h3 className="text-xl md:text-[22px] font-bold text-[#0d1f15] mb-3 flex items-start gap-3 leading-snug">
                    <span className="flex items-center justify-center bg-gray-200 text-gray-800 rounded-full w-8 h-8 text-sm shrink-0 mt-0.5">1</span>
                    Du buchst in der falschen Gegend
                  </h3>
                  <div className="flex flex-col sm:flex-row gap-5 sm:gap-7 sm:items-start pl-0 sm:pl-11">
                    <Image
                      src="/images/sicherheit/fehler-1-viertel.webp"
                      alt="Wohnhaus mit geschlossenen Rollläden bei Nacht neben derselben Straße mit beleuchtetem Café und Passanten"
                      width={560}
                      height={560}
                      loading="lazy"
                      quality={50}
                      sizes="(min-width: 640px) 260px, 100vw"
                      className="w-full sm:w-[260px] sm:shrink-0 h-auto rounded-2xl border border-gray-100 bg-white"
                    />
                    <p className="text-gray-700 leading-[1.8] min-w-0">
                    Lapa, Centro nachts, bestimmte Zonen der Zona Norte: das sind keine Wohnviertel für Touristen, egal wie günstig das Airbnb sein mag. Die Wahl deines Viertels ist die wichtigste Entscheidung noch vor dem Flug. Eine Fehlentscheidung hier erschwert deine gesamte Reise.
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl md:text-[22px] font-bold text-[#0d1f15] mb-3 flex items-start gap-3 leading-snug">
                    <span className="flex items-center justify-center bg-gray-200 text-gray-800 rounded-full w-8 h-8 text-sm shrink-0 mt-0.5">2</span>
                    Du nutzt dein Handy falsch auf der Straße
                  </h3>
                  <div className="flex flex-col sm:flex-row-reverse gap-5 sm:gap-7 sm:items-start pl-0 sm:pl-11">
                    <Image
                      src="/images/sicherheit/fehler-2-handy.webp"
                      alt="Reisender mit Handy offen in der Hand auf der Straße neben demselben Reisenden mit Handy in der Hosentasche"
                      width={560}
                      height={560}
                      loading="lazy"
                      quality={50}
                      sizes="(min-width: 640px) 260px, 100vw"
                      className="w-full sm:w-[260px] sm:shrink-0 h-auto rounded-2xl border border-gray-100 bg-white"
                    />
                    <p className="text-gray-700 leading-[1.8] min-w-0">
                    Ein neues Smartphone lässig in der Hand beim Spazierengehen am Gehsteig? Das ist das häufigste Ziel für Taschendiebe auf Fahrrädern. Es geht nicht darum, in Rio gar kein Handy dabei zu haben. Es geht darum, <em>wann</em> und <em>wie</em> du es sicher benutzt.
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl md:text-[22px] font-bold text-[#0d1f15] mb-3 flex items-start gap-3 leading-snug">
                    <span className="flex items-center justify-center bg-gray-200 text-gray-800 rounded-full w-8 h-8 text-sm shrink-0 mt-0.5">3</span>
                    Du fährst mit dem falschen Taxi
                  </h3>
                  <div className="flex flex-col sm:flex-row gap-5 sm:gap-7 sm:items-start pl-0 sm:pl-11">
                    <Image
                      src="/images/sicherheit/fehler-3-taxi.webp"
                      alt="Reisender winkt ein Taxi auf der Straße heran neben demselben Reisenden, der per App ein Auto am Bordstein bestellt"
                      width={560}
                      height={560}
                      loading="lazy"
                      quality={50}
                      sizes="(min-width: 640px) 260px, 100vw"
                      className="w-full sm:w-[260px] sm:shrink-0 h-auto rounded-2xl border border-gray-100 bg-white"
                    />
                    <p className="text-gray-700 leading-[1.8] min-w-0">
                    Die gelben Taxis der Straße sind in Rio nicht so extrem reguliert wie in Deutschland. Einfach am Flughafen einsteigen? Lieber nicht. Es gibt deutlich bessere, sicherere und auch günstigere Alternativen für Touristen. Deine Transport-Apps solltest du schon zu Hause installieren.
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl md:text-[22px] font-bold text-[#0d1f15] mb-3 flex items-start gap-3 leading-snug">
                    <span className="flex items-center justify-center bg-gray-200 text-gray-800 rounded-full w-8 h-8 text-sm shrink-0 mt-0.5">4</span>
                    Du gehst nachts zu Fuß
                  </h3>
                  <div className="flex flex-col sm:flex-row-reverse gap-5 sm:gap-7 sm:items-start pl-0 sm:pl-11">
                    <Image
                      src="/images/sicherheit/fehler-4-nachts.webp"
                      alt="Leere unbeleuchtete Straße bei Nacht neben derselben Straße mit geöffneten Läden, Kiosk und Passanten"
                      width={560}
                      height={560}
                      loading="lazy"
                      quality={50}
                      sizes="(min-width: 640px) 260px, 100vw"
                      className="w-full sm:w-[260px] sm:shrink-0 h-auto rounded-2xl border border-gray-100 bg-white"
                    />
                    <p className="text-gray-700 leading-[1.8] min-w-0">
                    Was in Berlin, München oder Köln völlig normal ist, funktioniert in Rio in vielen Ecken einfach anders. Nach Einbruch der Dunkelheit zu Fuß durch unbekannte oder kaum beleuchtete Straßen zu navigieren, ist das Risikoverhalten Nummer eins von Fremden.
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl md:text-[22px] font-bold text-[#0d1f15] mb-3 flex items-start gap-3 leading-snug">
                    <span className="flex items-center justify-center bg-gray-200 text-gray-800 rounded-full w-8 h-8 text-sm shrink-0 mt-0.5">5</span>
                    Du nimmst zu viel an den Strand mit
                  </h3>
                  <div className="flex flex-col sm:flex-row gap-5 sm:gap-7 sm:items-start pl-0 sm:pl-11">
                    <Image
                      src="/images/sicherheit/fehler-5-strand.webp"
                      alt="Strandtuch überladen mit Rucksack, Kamera und Portemonnaie neben demselben Tuch mit nur Handy, Sonnencreme und etwas Bargeld"
                      width={560}
                      height={560}
                      loading="lazy"
                      quality={50}
                      sizes="(min-width: 640px) 260px, 100vw"
                      className="w-full sm:w-[260px] sm:shrink-0 h-auto rounded-2xl border border-gray-100 bg-white"
                    />
                    <p className="text-gray-700 leading-[1.8] min-w-0">
                    Rios Strände sind wunderschön und in den Touristenvierteln meistens sicher polizeilich überwacht. Aber der Sand ist riesig, es gibt viele Menschen, und kurz ins Wasser gehen mit dem Rucksack unbeaufsichtigt am Handtuch? Das ist fahrlässig. Was du an den Strand mitnimmst, bestimmt, ob du einen schönen oder sehr schlechten Tag hast.
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl md:text-[22px] font-bold text-[#0d1f15] mb-3 flex items-start gap-3 leading-snug">
                    <span className="flex items-center justify-center bg-gray-200 text-gray-800 rounded-full w-8 h-8 text-sm shrink-0 mt-0.5">6</span>
                    Du zeigst Wohlstand
                  </h3>
                  <div className="flex flex-col sm:flex-row-reverse gap-5 sm:gap-7 sm:items-start pl-0 sm:pl-11">
                    <Image
                      src="/images/sicherheit/fehler-6-wohlstand.webp"
                      alt="Reisender mit Uhr, Kette und großer Kamera neben demselben Reisenden in einfachem T-Shirt ohne Schmuck"
                      width={560}
                      height={560}
                      loading="lazy"
                      quality={50}
                      sizes="(min-width: 640px) 260px, 100vw"
                      className="w-full sm:w-[260px] sm:shrink-0 h-auto rounded-2xl border border-gray-100 bg-white"
                    />
                    <p className="text-gray-700 leading-[1.8] min-w-0">
                    Die dicke Spiegelreflexkamera um den Hals, eine teure Uhr, sichtbarer Schmuck: das sind klare Signale in einer Stadt, in der ein Großteil der Bevölkerung mit dem Mindestlohn kämpft. Rio hat leider eine extrem ausgeprägte soziale Ungleichheit, und Touristen, die Reichtum signalisieren, fallen sofort in das Raster aufmerksamer Augen.
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl md:text-[22px] font-bold text-[#0d1f15] mb-3 flex items-start gap-3 leading-snug">
                    <span className="flex items-center justify-center bg-gray-200 text-gray-800 rounded-full w-8 h-8 text-sm shrink-0 mt-0.5">7</span>
                    Du bist nicht vorbereitet auf den Notfall
                  </h3>
                  <div className="flex flex-col sm:flex-row gap-5 sm:gap-7 sm:items-start pl-0 sm:pl-11">
                    <Image
                      src="/images/sicherheit/fehler-7-notfall.webp"
                      alt="Handy ohne installierte Apps neben demselben Handy mit Fahr-Apps, Passkopie und Karte griffbereit"
                      width={560}
                      height={560}
                      loading="lazy"
                      quality={50}
                      sizes="(min-width: 640px) 260px, 100vw"
                      className="w-full sm:w-[260px] sm:shrink-0 h-auto rounded-2xl border border-gray-100 bg-white"
                    />
                    <p className="text-gray-700 leading-[1.8] min-w-0">
                    Die meisten Reisenden kommen ohne vorbereitete Apps (Wie bestelle ich mir ein alternatives Taxi?), ohne gespeicherte lokale Notfallnummern, ohne gesicherte Dokumentenkopien und ohne einen Backup-Plan für ihre Kreditkarten. Wenn wirklich etwas passiert, kostet Vorbereitung keine einzige Sekunde, absolute Unvorbereitung kostet dich den Urlaub.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* 6. DIE SICHEREN VIERTEL */}
            <section className="mb-16">
              <h2 className="text-[26px] md:text-3xl font-bold text-[#0d1f15] leading-tight text-balance mb-6 md:mb-8">
                Wo kann ich sicher wohnen? Eine Kurzübersicht
              </h2>

              <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
                {/* 1. Card */}
                <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden border border-gray-100 flex flex-col h-full group">
                  <div className="absolute top-0 left-0 right-0 h-1.5 bg-green-500 transition-all group-hover:h-2"></div>
                  
                  <div className="flex items-start gap-4 mb-4 mt-2">
                    <div className="bg-green-50 text-green-600 p-3 rounded-2xl shrink-0 border border-green-100/50">
                      <ShieldCheck className="w-7 h-7" strokeWidth={2.5} />
                    </div>
                    <div className="pt-1">
                      <h4 className="font-black text-gray-900 text-lg md:text-xl">Sehr sicher (empfohlen)</h4>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 leading-[1.7] mb-6 flex-grow pl-0 sm:pl-[68px]">
                    Hier kannst du als Tourist am wenigsten falsch machen. Exzellente Infrastruktur und dichte Überwachung.
                  </p>
                  
                  <div className="bg-gray-50 p-4 sm:p-5 rounded-2xl border border-gray-100 mt-auto">
                    <p className="text-[#0d1f15] font-semibold text-[15px] leading-[1.7]">
                      Ipanema, Leblon, Botafogo, Humaitá, Jardim Botânico, Gávea, Urca.
                    </p>
                  </div>
                </div>

                {/* 2. Card */}
                <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden border border-gray-100 flex flex-col h-full group">
                  <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#facc15] transition-all group-hover:h-2"></div>
                  
                  <div className="flex items-start gap-4 mb-4 mt-2">
                    <div className="bg-yellow-50 text-yellow-600 p-3 rounded-2xl shrink-0 border border-yellow-100/50">
                      <AlertTriangle className="w-7 h-7" strokeWidth={2.5} />
                    </div>
                    <div className="pt-1">
                      <h4 className="font-black text-gray-900 text-lg md:text-xl leading-tight">Sicher mit gesundem Menschenverstand</h4>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 leading-[1.7] mb-6 flex-grow pl-0 sm:pl-[68px]">
                    Klassische Touristengebiete oder traditionelle Viertel. Sicher, erfordern aber normales städtisches Bewusstsein, um nicht aufzufallen.
                  </p>
                  
                  <div className="bg-gray-50 p-4 sm:p-5 rounded-2xl border border-gray-100 mt-auto">
                    <p className="text-[#0d1f15] font-semibold text-[15px] leading-[1.7]">
                      <Link href="/touren/klassiker" className="text-rio-green underline underline-offset-2 hover:text-[#1a4a35] transition-colors">Copacabana</Link>, Flamengo, Laranjeiras, Catete, Glória.
                    </p>
                  </div>
                </div>

                {/* 3. Card */}
                <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden border border-gray-100 flex flex-col h-full group">
                  <div className="absolute top-0 left-0 right-0 h-1.5 bg-orange-500 transition-all group-hover:h-2"></div>
                  
                  <div className="flex items-start gap-4 mb-4 mt-2">
                    <div className="bg-orange-50 text-orange-600 p-3 rounded-2xl shrink-0 border border-orange-100/50">
                      <AlertCircle className="w-7 h-7" strokeWidth={2.5} />
                    </div>
                    <div className="pt-1">
                      <h4 className="font-black text-gray-900 text-lg md:text-xl">Mit Vorsicht / Guide</h4>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 leading-[1.7] mb-6 flex-grow pl-0 sm:pl-[68px]">
                    Tagsüber belebt, nachts erfordert es Vorwissen. Oft steilere Gegenden oder reine Partyviertel.
                  </p>
                  
                  <div className="bg-gray-50 p-4 sm:p-5 rounded-2xl border border-gray-100 mt-auto">
                    <p className="text-[#0d1f15] font-semibold text-[15px] leading-[1.7]">
                      Santa Teresa (nachts aufpassen), Lapa (nur in Gruppen oder am frühen Abend), <Link href="/rio-guide/sehenswuerdigkeiten/rocinha" className="text-rio-green underline underline-offset-2 hover:text-[#1a4a35] transition-colors">Favelas mit Guide</Link>.
                    </p>
                  </div>
                </div>

                {/* 4. Card */}
                <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden border border-gray-100 flex flex-col h-full group">
                  <div className="absolute top-0 left-0 right-0 h-1.5 bg-red-500 transition-all group-hover:h-2"></div>
                  
                  <div className="flex items-start gap-4 mb-4 mt-2">
                    <div className="bg-red-50 text-red-600 p-3 rounded-2xl shrink-0 border border-red-100/50">
                      <XCircle className="w-7 h-7" strokeWidth={2.5} />
                    </div>
                    <div className="pt-1">
                      <h4 className="font-black text-gray-900 text-lg md:text-xl leading-tight">Für Touristen nicht geeignet</h4>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 leading-[1.7] mb-6 flex-grow pl-0 sm:pl-[68px]">
                    Entweder reine Geschäftsviertel, die abends völlig leer sind, oder Gebiete ohne touristische Absicherung.
                  </p>
                  
                  <div className="bg-gray-50 p-4 sm:p-5 rounded-2xl border border-gray-100 mt-auto">
                    <p className="text-[#0d1f15] font-semibold text-[15px] leading-[1.7]">
                      Centro (nachts), Zona Norte (die Nordzone) und bestimmte Bereiche der fernen Zona Oeste.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 p-6 bg-[#facc15]/10 border border-[#facc15]/30 rounded-3xl flex flex-col sm:flex-row gap-4 items-start shadow-sm mb-16">
                <div className="bg-white/50 p-2 rounded-full shrink-0">
                  <Info className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <strong className="text-gray-900 block mb-1">Wichtig:</strong>
                  <span className="text-gray-700 leading-[1.8]">
                    Diese Liste ist nur ein Ausgangspunkt. Jedes Viertel hat Nuancen, eine Querstraße kann den Unterschied machen. Wer die Stadt kennt, liest diese Unterschiede sofort.
                  </span>
                </div>
              </div>
            </section>

            {/* 7. 5 DER 15 GOLDENEN REGELN */}
            <section className="mb-16">
              <h2 className="text-[26px] md:text-3xl font-bold text-[#0d1f15] leading-tight text-balance mb-4 md:mb-6">
                Teaser: Einige der wichtigsten Überlebensregeln
              </h2>
              <p className="text-lg text-gray-700 leading-[1.8] mb-8">
                Über die Jahre habe ich 15 goldene Regeln zusammengestellt, die ich jedem meiner deutschen Touristen vorab in unserem Guide mitgebe. Sie sind pragmatisch, ehrlich und ohne Panik. Hier sind 5 davon für dich als Vorgeschmack:
              </p>

              <ul className="space-y-7 sm:space-y-8 list-none p-0 text-gray-800">
                <li>
                  <div className="flex gap-4 items-start mb-3">
                    <div className="bg-[#0d1f15] text-white w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-1 pb-[1px]">✓</div>
                    <strong className="text-lg text-[#0d1f15] leading-snug">Nicht ostentieren</strong>
                  </div>
                  {/* pl-0 no mobile: imagem e texto vão até a margem, alinhados com o ✓,
                      igual aos 7 erros. A partir do sm recuam para debaixo do título. */}
                  <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 sm:items-start leading-[1.8] pl-0 sm:pl-10">
                      <Image
                        src="/images/sicherheit/regel-1-schmuck.webp"
                        alt="Geöffneter Koffer, Uhr und Schmuck bleiben zu Hause daneben liegen"
                        width={480}
                        height={480}
                        loading="lazy"
                        quality={50}
                        sizes="(min-width: 640px) 240px, 100vw"
                        className="w-full sm:w-[240px] sm:shrink-0 h-auto rounded-2xl border border-gray-100 bg-white"
                      />
                      <p className="min-w-0">
                        Trage keine Rolex, lass die offensichtlichen Ketten und Ringe im Safe in Deutschland, halte das iPhone in der Tasche, solange du es nicht brauchst. Je gewöhnlicher du aussiehst, desto langweiliger bist du für potenziellen Ärger.
                      </p>
                  </div>
                </li>
                <li>
                  <div className="flex gap-4 items-start mb-3">
                    <div className="bg-[#0d1f15] text-white w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-1 pb-[1px]">✓</div>
                    <strong className="text-lg text-[#0d1f15] leading-snug">Uber und 99, immer</strong>
                  </div>
                  {/* pl-0 no mobile: imagem e texto vão até a margem, alinhados com o ✓,
                      igual aos 7 erros. A partir do sm recuam para debaixo do título. */}
                  <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 sm:items-start leading-[1.8] pl-0 sm:pl-10">
                      <Image
                        src="/images/sicherheit/regel-2-app.webp"
                        alt="Handy mit Fahr-App und eingezeichneter Route zum Ziel"
                        width={480}
                        height={480}
                        loading="lazy"
                        quality={50}
                        sizes="(min-width: 640px) 240px, 100vw"
                        className="w-full sm:w-[240px] sm:shrink-0 h-auto rounded-2xl border border-gray-100 bg-white"
                      />
                      <p className="min-w-0">
                        Vergiss die normalen gelben Straßentaxis, insbesondere am Flughafen oder nachts nach einer Party. Nutzen per App fahrende private Fahrer gibt dir den exakten Preis, eine nachvollziehbare Route und absolute Datensicherheit. Punkt.
                      </p>
                  </div>
                </li>
                <li>
                  <div className="flex gap-4 items-start mb-3">
                    <div className="bg-[#0d1f15] text-white w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-1 pb-[1px]">✓</div>
                    <strong className="text-lg text-[#0d1f15] leading-snug">Deserte Straßen konsequent meiden</strong>
                  </div>
                  {/* pl-0 no mobile: imagem e texto vão até a margem, alinhados com o ✓,
                      igual aos 7 erros. A partir do sm recuam para debaixo do título. */}
                  <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 sm:items-start leading-[1.8] pl-0 sm:pl-10">
                      <Image
                        src="/images/sicherheit/regel-3-strasse.webp"
                        alt="Straßenecke bei Nacht, beleuchtete belebte Seite und leere dunkle Gasse"
                        width={480}
                        height={480}
                        loading="lazy"
                        quality={50}
                        sizes="(min-width: 640px) 240px, 100vw"
                        className="w-full sm:w-[240px] sm:shrink-0 h-auto rounded-2xl border border-gray-100 bg-white"
                      />
                      <p className="min-w-0">
                        Wenn du nachts in eine Straße schaust und dort sind keine Autos, keine Straßenhändler, keine Fußgänger, keine geöffneten Kioske. Dann gehst du dort <em>nicht</em> hin. Wenn die Straße leer ist, gibt es in Rio fast immer einen guten Grund dafür.
                      </p>
                  </div>
                </li>
                <li>
                  <div className="flex gap-4 items-start mb-3">
                    <div className="bg-[#0d1f15] text-white w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-1 pb-[1px]">✓</div>
                    <strong className="text-lg text-[#0d1f15] leading-snug">Bei einem Überfall: Nicht reagieren</strong>
                  </div>
                  {/* pl-0 no mobile: imagem e texto vão até a margem, alinhados com o ✓,
                      igual aos 7 erros. A partir do sm recuam para debaixo do título. */}
                  <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 sm:items-start leading-[1.8] pl-0 sm:pl-10">
                      <Image
                        src="/images/sicherheit/regel-4-ueberfall.webp"
                        alt="Zwei geöffnete Hände, die ruhig Handy und Geld herausgeben"
                        width={480}
                        height={480}
                        loading="lazy"
                        quality={50}
                        sizes="(min-width: 640px) 240px, 100vw"
                        className="w-full sm:w-[240px] sm:shrink-0 h-auto rounded-2xl border border-gray-100 bg-white"
                      />
                      <p className="min-w-0">
                        Sollte das absolut Unwahrscheinliche eintreten und man zwingt dich zur Herausgabe deiner Wertsachen: Ruhig bleiben. Keine schnellen Handbewegungen. Augen nach unten. Keine Diskussion, kein Heldentum. Gebe alles sofort und widerstandslos heraus. Das Leben und die körperliche Unversehrtheit sind endlos viel mehr wert als jedes verdammte Smartphone.
                      </p>
                  </div>
                </li>
                <li>
                  <div className="flex gap-4 items-start mb-3">
                    <div className="bg-[#0d1f15] text-white w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-1 pb-[1px]">✓</div>
                    <strong className="text-lg text-[#0d1f15] leading-snug">Situational Awareness (Situationsbewusstsein)</strong>
                  </div>
                  {/* pl-0 no mobile: imagem e texto vão até a margem, alinhados com o ✓,
                      igual aos 7 erros. A partir do sm recuam para debaixo do título. */}
                  <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 sm:items-start leading-[1.8] pl-0 sm:pl-10">
                      <Image
                        src="/images/sicherheit/regel-5-aufmerksamkeit.webp"
                        alt="Person von oben mit Aufmerksamkeitsradius um sich herum"
                        width={480}
                        height={480}
                        loading="lazy"
                        quality={50}
                        sizes="(min-width: 640px) 240px, 100vw"
                        className="w-full sm:w-[240px] sm:shrink-0 h-auto rounded-2xl border border-gray-100 bg-white"
                      />
                      <p className="min-w-0">
                        Habe die gleiche Aufmerksamkeit wie an einem Freitagabend um 2 Uhr nachts am Bahnhof von Frankfurt oder am Kölner Hauptbahnhof. Nicht mehr (wer paranoid ist, hat keinen Spaß), aber definitiv auch nicht weniger. Sei stets bewusst, wer und was sich um dich herum befindet.
                      </p>
                  </div>
                </li>
              </ul>

              <div className="mt-8 p-6 bg-white border border-gray-100 rounded-2xl shadow-sm italic text-gray-700">
                Diese fünf Regeln tragen dich durch die meisten Situationen. Die restlichen zehn wachsen aus der Erfahrung vor Ort, nicht aus einer Liste.
              </div>
            </section>

            {/* 8. CTA TOUR (era o form do lead magnet, trocado porque o guia
                gratuito prometido ali ainda nao existe) */}
            <section className="bg-white border border-gray-100 rounded-3xl shadow-sm p-6 sm:p-8 md:p-10 my-16">
              <h2 className="text-[22px] sm:text-2xl md:text-3xl font-bold text-[#0d1f15] leading-snug text-balance mb-3">
                Jede Straße hat ihre Nuancen
              </h2>
              <p className="text-lg text-gray-700 leading-[1.8] mb-8">
                Welches Viertel für dich passt, hängt von deiner Reise ab. Als Carioca kenne ich die Unterschiede, die keine Karte zeigt.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/touren"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-rio-green text-white rounded-full font-semibold text-lg hover:bg-rio-green/90 hover:scale-[1.02] transition-all shadow-xl shadow-rio-green/20"
                >
                  Touren ansehen
                </Link>
                <Link
                  href="/anfrage?von=site"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-[#0d1f15]/20 text-[#0d1f15] rounded-full font-medium text-lg hover:bg-[#0d1f15]/5 transition-all"
                >
                  Direkt anfragen
                </Link>
              </div>
            </section>

            {/* 9. FAQ SEO */}
            <section className="mb-16">
              <h2 className="text-[26px] md:text-3xl font-bold text-[#0d1f15] leading-tight text-balance mb-6 md:mb-8">
                Häufige Fragen (FAQ) zur Sicherheit in Brasilien
              </h2>

              <div className="[&>div+div]:mt-8 [&>div+div]:border-t [&>div+div]:border-gray-200 [&>div+div]:pt-8">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2.5 leading-snug">Ist Rio de Janeiro gefährlicher als São Paulo?</h3>
                  <p className="text-gray-700 leading-[1.8]">
                    Rio hat spezifische Herausforderungen, oft im Zusammenhang mit <Link href="/touren/favela-tour" className="text-rio-green underline hover:text-[#0d1f15]">Favelas</Link> auf Hügeln neben wohlhabenden Zonen, was Kriminalität sichtbarer machen kann. Die Kriminalitätsraten und die reale Gefahr für dich variieren jedoch stark je nach Stadtteil. Mit gesundem Menschenverstand ist das tägliche Risiko für informierte Touristen in beiden Mega-Städten absolut vergleichbar und handhabbar.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2.5 leading-snug">Welche Viertel in Rio sind am sichersten für Touristen?</h3>
                  <p className="text-gray-700 leading-[1.8]">
                    Die Südzone (<span className="italic">Zona Sul</span>) gilt als der am stärksten gesicherte und sicherste Bereich für Urlauber und Expats. Dazu gehören neben Ipanema und Leblon auch Botafogo, Humaitá und Urca (die oft als die sicherste Nachbarschaft Rios gilt). Copacabana ist sehr beliebt, bedarf aber wegen der schieren Masse an Touristen in bestimmten Ecken nachts mehr Aufmerksamkeit für Taschendiebe.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2.5 leading-snug">Kann man in Rio alleine reisen?</h3>
                  <p className="text-gray-700 leading-[1.8]">
                    Ja, absolut. Wer sich selbstbewusst bewegt, grundlegende Sicherheitsregeln verinnerlicht, abends nicht alleine durch schwach beleuchtete Gassen spaziert und sichere Fahr-Apps konsequent einsetzt, kann die Stadt alleine hervorragend und gefahrlos entdecken. Tausende Backpacker und Alleinreisende tun dies reibungslos jedes Jahr.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2.5 leading-snug">Ist Copacabana sicher?</h3>
                  <p className="text-gray-700 leading-[1.8]">
                    Tagsüber ist der Strand oft voll, stark frequentiert, gut polizeilich überwacht und absolut sicher (dennoch: Sachen auf dem Sand nicht unbewacht lassen). Sobald es Nacht wird, solltest du dich auf den stark beleuchteten Hautpstraßen halten, das ruhige Sandareal direkt am Wasser meiden und dunklen Straßenecken aus dem Weg gehen.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2.5 leading-snug">Wie gefährlich ist Lapa in Rio?</h3>
                  <p className="text-gray-700 leading-[1.8]">
                    Lapa, nahe am Zentrum, ist das Herzstück des <Link href="/touren/by-night" className="text-rio-green underline hover:text-[#0d1f15]">Nachtlebens in Rio</Link> (Ausgehviertel). Freitagabends und am Wochenende platzt das Viertel aus allen Nähten, was dich vor der Leere der Nacht schützt. Dennoch rate ich: Fahre direkt mit einem Uber von A nach B ins Viertel hinein und direkt wieder hinaus. Mach dort nachts keine Spaziergänge in dunkle Nebenstraßen. Gruppen sind besser.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2.5 leading-snug">Ist Rio sicher für Frauen allein?</h3>
                  <p className="text-gray-700 leading-[1.8]">
                    Frauen können sicher und problemlos alleine nach Rio reisen. Vorsicht ist jedoch geboten: Wie in fast jeder Metrople verlässt man sich besser auf geprüfte Uber anstatt Taxis zu winken, meidet unbelebte oder unbeleuchtete Strecken und schützt sein Getränk beim Feiern. Nutze primär sichere Viertel der <em>Zona Sul</em> als feste Basis. Brasilianische Frauen verhalten sich übrigens ähnlich achtsam in den Straßen. Vertraue deinem Bauchgefühl.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2.5 leading-snug">Wie sicher ist Rio im Vergleich zu anderen Städten Südamerikas?</h3>
                  <p className="text-gray-700 leading-[1.8]">
                    Rio tendiert im Rahmen der großen südamerikanischen Metropolen ins Mittelfeld. Städte wie Buenos Aires (Argentinien) oder Santiago (Chile) gelten statistisch als etwas sicherer. Andere Metropolen im nördlichen Südamerika können deutlich heikler sein. In den touristenstarken und wirtschaftlichen Epizentren von Rio ist die Straßenpräsenz der Polizei enorm und bietet meist eine stabile Barriere gegen offene Bandenkriminalität für dich als Gast.
                  </p>
                </div>
              </div>
            </section>

            {/* 10. ÜBER WILL */}
            <section className="bg-white border text-gray-800 border-gray-200 rounded-3xl p-6 sm:p-8 mb-16 flex flex-col md:flex-row gap-6 md:gap-8 items-center shadow-lg">
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden shrink-0 relative bg-gray-100 ring-4 ring-green-50 shadow-inner">
                {/* Fallback color/icon in case image not available */}
                <Image 
                  src="/images/rio-cristo.webp" 
                  alt="Will - Rio Guide"
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-[#0d1f15] mb-2">Warum solltest du mir vertrauen?</h3>
                <p className="text-gray-700 leading-[1.8] mb-4">
                  Ich bin kein anonymer Redakteur hinter einem Schreibtisch. Ich bin ein Carioca. Ich besuche nicht bloß diese magische Stadt für Urlaube, sondern ich habe mein Leben hier gelernt, gelacht, und bin auch achtsam durch die schwierigen Ecken navigiert.
                </p>
                <p className="text-gray-700 leading-[1.8] font-medium">
                  Deutsche Schule im Rio, 4 Jahre Student in Köln, und nun hier als mehrsprachiger Guide: Ich kenne beide Welten. Ich kenne die deutsche Rationalität und das improvisierte Talent Brasiliens. Ich garantiere dir: Mit guter Vorbereitung fühlst du dich bei deiner <Link href="/touren" className="text-rio-green underline hover:text-[#0d1f15]">Tour durch Rio</Link> sicherer, als du dir gerade vorstellen kannst. Viel Spaß am Zuckerhut!
                </p>
                <div className="mt-4">
                  <Link href="/ueber-will" className="text-rio-blue font-bold hover:underline inline-flex items-center gap-1 group">
                    Mehr über Will lesen
                  </Link>
                </div>
              </div>
            </section>

            {/* 12. CTA TOURS */}
            <section className="bg-[#0d1f15] text-white p-6 sm:p-8 md:p-12 rounded-3xl shadow-xl mb-16">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">
                Rio sicher erleben, mit einem Guide, der diese Regeln täglich lebt
              </h2>
              <p className="text-lg text-gray-300 leading-relaxed mb-4">
                Das Wissen ist das eine. Die Erfahrung ist das andere.
              </p>
              <p className="text-lg text-gray-300 leading-relaxed mb-8">
                Ich begleite dich persönlich durch Rio, mit denselben Regeln, die ich dir hier erklärt habe, als tägliche Praxis. Du weißt immer, wo du bist, was sicher ist und wie du das Beste aus deinem Tag machst.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/touren"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-rio-green text-white rounded-full font-semibold text-lg hover:bg-rio-green/90 hover:scale-[1.02] transition-all shadow-xl shadow-rio-green/20"
                >
                  Touren ansehen
                </Link>
                {/* Única página do site onde o guia grátis segue como CTA primário:
                    aqui o tráfego é de topo de funil de verdade — a pessoa pesquisou
                    se o Rio é perigoso, não um passeio. Só este secundário sai do
                    /kontakt para a Anfrage. */}
                <Link
                  href="/anfrage?von=site"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-white/30 text-white rounded-full font-medium text-lg hover:bg-white/10 transition-all"
                >
                  Direkt anfragen
                </Link>
              </div>
            </section>

          </article>
        </main>
        
        <FooterServer />
      </div>
    </>
  );
}

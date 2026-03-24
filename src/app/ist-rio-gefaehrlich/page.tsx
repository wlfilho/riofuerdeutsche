import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MagicLinkForm from "@/components/MagicLinkForm";
import { ShieldCheck, AlertTriangle, AlertCircle, XCircle, Info } from "lucide-react";

export const metadata: Metadata = {
  title: "Ist Rio de Janeiro gefährlich? Die Wahrheit von einem Carioca (2026)",
  description:
    "Ein Carioca, der in Deutschland lebte, erklärt die Wahrheit über Sicherheit in Rio. Welche Viertel sind sicher? Was musst du wissen? Alles hier.",
  openGraph: {
    title: "Ist Rio de Janeiro gefährlich?",
    description:
      "Die Wahrheit über Sicherheit in Rio — von einem Carioca der fließend Deutsch spricht.",
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
        <Navbar />

        <main className="flex-grow pb-16">
          {/* 1. HERO SECTION FULL WIDTH */}
          <section className="w-full bg-[#0d1f15] pt-32 pb-20 px-5 lg:px-8 text-white">
            <div className="max-w-5xl mx-auto">
              <div className="flex flex-wrap gap-3 justify-center md:justify-start mb-8">
                <span className="bg-white/10 backdrop-blur-md text-white border border-white/20 px-4 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase">
                  Sicherheit
                </span>
                <span className="bg-rio-yellow text-[#0d1f15] px-4 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase">
                  Rio Guide
                </span>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-7xl font-black text-white mb-6 tracking-tight text-center md:text-left leading-tight text-shadow-hero">
                Ist Rio de Janeiro gefährlich?
              </h1>
              
              <p className="text-2xl md:text-3xl text-rio-yellow mb-12 text-center md:text-left font-medium max-w-3xl">
                Die Wahrheit von einem Carioca — nicht von einer Zeitung
              </p>
              
              <div className="flex flex-col sm:flex-row items-center sm:items-start justify-center md:justify-start gap-6 text-gray-300 border-t border-b border-white/10 py-6 mb-12">
                {/* Author Info */}
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full overflow-hidden relative bg-gray-800 border-2 border-rio-yellow shadow-sm shrink-0">
                    <Image src="/images/rio-cristo.webp" alt="Will - Lokaler Guide" fill className="object-cover" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-white text-base">Will</span>
                    <Link href="/ueber-will" className="text-white/70 text-sm hover:text-white hover:underline transition-colors">Lokaler Guide</Link>
                  </div>
                </div>
                
                <div className="hidden sm:block w-px h-14 bg-white/10 mx-2"></div>
                
                {/* Post Date */}
                <div className="flex flex-col items-center justify-center h-14">
                  <span className="font-semibold text-white/60 text-sm mb-0.5">Veröffentlicht</span>
                  <span className="text-white font-medium text-sm">24. März 2026</span>
                </div>
                
                <div className="hidden sm:block w-px h-14 bg-white/10 mx-2"></div>
                
                {/* Last Updated */}
                <div className="flex flex-col items-center justify-center h-14">
                  <span className="font-semibold text-white/60 text-sm mb-0.5">Zuletzt aktualisiert</span>
                  <span className="text-white font-medium text-sm">März 2026</span>
                </div>
              </div>

            </div>
          </section>

          <article className="max-w-4xl mx-auto px-5 lg:px-8 mt-16 mb-16">
            <div className="text-xl text-gray-800 leading-relaxed font-medium mb-12">
              <p>
                Hallo! Ich bin Will, geboren und aufgewachsen in Rio de Janeiro. Ich habe einige Jahre im Rheinland, genauer gesagt in Köln, gelebt und studiert. Ich kenne die deutsche Sicherheitsliebe und ich verstehe genau, warum die Frage nach der Sicherheit in Rio so oft gestellt wird. Hier bekommst du eine ehrliche Antwort — ganz ohne Panikmache, aber auch ohne Filter.
              </p>
            </div>

            {/* 2. QUICK ANSWER */}
            <div className="bg-[#0d1f15] text-white p-8 md:p-10 rounded-3xl shadow-xl mb-16">
              <p className="text-xl md:text-2xl font-medium leading-relaxed mb-0">
                &ldquo;Rio ist für informierte Reisende sicher. Die Stadt hat Risiken — aber die meisten Probleme passieren, weil Touristen einfache Fehler machen. Wenn du weißt, was du tust, wirst du eine fantastische Zeit haben.&rdquo;
              </p>
            </div>

            {/* 3. ESTATÍSTICAS + CONTEXTO */}
            <section className="prose prose-lg prose-green max-w-none text-gray-800 mb-16">
              <h2 className="text-3xl font-bold text-[#0d1f15] mb-6">
                Zahlen und Kontext: Ein Blick hinter die Schlagzeilen
              </h2>
              <p>
                Rund 2,1 Millionen ausländische Touristen besuchen Rio de Janeiro jedes Jahr. Die überwiegende Mehrheit dieser Besucher erlebt eine traumhafte, problemlose Reise ohne jegliche Sicherheitsprobleme.
              </p>
              <p>
                Natürlich solltest du die Warnungen des Auswärtigen Amtes ernst nehmen, aber lass dich nicht durch sensationslüsterne TV-Berichte abschrecken. Rio ist kein Kriegsgebiet — es ist eine riesige, pulsierende Metropole. Genau wie in europäischen Großstädten, in Paris, Rom oder Berlin, gibt es Zonen, in denen Touristendiebstahl vorkommt. Der wesentliche Unterschied ist die ausgeprägte soziale Ungleichheit, die sich oft sehr stark zeigt.
              </p>
              <p>
                Sicherheit in Rio bedeutet nicht, dass du dich einschließen musst. Die touristischen Zonen der Stadt werden stark überwacht und sind hervorragend auf Besucher eingestellt. Es geht vielmehr um das Bewusstsein für die eigene Umgebung und die Vermeidung klassischer Touristenfehler.
              </p>
            </section>

            {/* 4. DIE 7 HÄUFIGSTEN FEHLER */}
            <section className="mb-16">
              <h2 className="text-3xl font-bold text-[#0d1f15] mb-8">
                Die 7 häufigsten Fehler, die Touristen machen
              </h2>
              <div className="space-y-8">
                <div>
                  <h3 className="text-xl font-bold text-[#0d1f15] mb-2 flex items-center gap-2">
                    <span className="flex items-center justify-center bg-gray-200 text-gray-800 rounded-full w-8 h-8 text-sm shrink-0">1</span>
                    Du buchst in der falschen Gegend
                  </h3>
                  <p className="text-gray-700 pl-10">
                    Lapa, Centro nachts, bestimmte Zonen der Zona Norte — das sind keine Wohnviertel für Touristen, egal wie günstig das Airbnb sein mag. Die Wahl deines Viertels ist die wichtigste Entscheidung noch vor dem Flug. Eine Fehlentscheidung hier erschwert deine gesamte Reise.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-[#0d1f15] mb-2 flex items-center gap-2">
                    <span className="flex items-center justify-center bg-gray-200 text-gray-800 rounded-full w-8 h-8 text-sm shrink-0">2</span>
                    Du nutzt dein Handy falsch auf der Straße
                  </h3>
                  <p className="text-gray-700 pl-10">
                    Ein neues Smartphone lässig in der Hand beim Spazierengehen am Gehsteig? Das ist das häufigste Ziel für Taschendiebe auf Fahrrädern. Es geht nicht darum, in Rio gar kein Handy dabei zu haben — es geht darum, <em>wann</em> und <em>wie</em> du es sicher benutzt.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-[#0d1f15] mb-2 flex items-center gap-2">
                    <span className="flex items-center justify-center bg-gray-200 text-gray-800 rounded-full w-8 h-8 text-sm shrink-0">3</span>
                    Du fährst mit dem falschen Taxi
                  </h3>
                  <p className="text-gray-700 pl-10">
                    Die gelben Taxis der Straße sind in Rio nicht so extrem reguliert wie in Deutschland. Einfach am Flughafen einsteigen? Lieber nicht. Es gibt deutlich bessere, sicherere und auch günstigere Alternativen für Touristen. Deine Transport-Apps solltest du schon zu Hause installieren.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-[#0d1f15] mb-2 flex items-center gap-2">
                    <span className="flex items-center justify-center bg-gray-200 text-gray-800 rounded-full w-8 h-8 text-sm shrink-0">4</span>
                    Du gehst nachts zu Fuß
                  </h3>
                  <p className="text-gray-700 pl-10">
                    Was in Berlin, München oder Köln völlig normal ist, funktioniert in Rio in vielen Ecken einfach anders. Nach Einbruch der Dunkelheit zu Fuß durch unbekannte oder kaum beleuchtete Straßen zu navigieren, ist das Risikoverhalten Nummer eins von Fremden.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-[#0d1f15] mb-2 flex items-center gap-2">
                    <span className="flex items-center justify-center bg-gray-200 text-gray-800 rounded-full w-8 h-8 text-sm shrink-0">5</span>
                    Du nimmst zu viel an den Strand mit
                  </h3>
                  <p className="text-gray-700 pl-10">
                    Rios Strände sind wunderschön und in den Touristenvierteln meistens sicher polizeilich überwacht. Aber der Sand ist riesig, es gibt viele Menschen, und kurz ins Wasser gehen mit dem Rucksack unbeaufsichtigt am Handtuch? Das ist fahrlässig. Was du an den Strand mitnimmst, bestimmt, ob du einen schönen oder sehr schlechten Tag hast.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-[#0d1f15] mb-2 flex items-center gap-2">
                    <span className="flex items-center justify-center bg-gray-200 text-gray-800 rounded-full w-8 h-8 text-sm shrink-0">6</span>
                    Du zeigst Wohlstand
                  </h3>
                  <p className="text-gray-700 pl-10">
                    Die dicke Spiegelreflexkamera um den Hals, eine teure Uhr, sichtbarer Schmuck — das sind klare Signale in einer Stadt, in der ein Großteil der Bevölkerung mit dem Mindestlohn kämpft. Rio hat leider eine extrem ausgeprägte soziale Ungleichheit, und Touristen, die Reichtum signalisieren, fallen sofort in das Raster aufmerksamer Augen.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-[#0d1f15] mb-2 flex items-center gap-2">
                    <span className="flex items-center justify-center bg-gray-200 text-gray-800 rounded-full w-8 h-8 text-sm shrink-0">7</span>
                    Du bist nicht vorbereitet auf den Notfall
                  </h3>
                  <p className="text-gray-700 pl-10">
                    Die meisten Reisenden kommen ohne vorbereitete Apps (Wie bestelle ich mir ein alternatives Taxi?), ohne gespeicherte lokale Notfallnummern, ohne gesicherte Dokumentenkopien und ohne einen Backup-Plan für ihre Kreditkarten. Wenn wirklich etwas passiert, kostet Vorbereitung keine einzige Sekunde — absolute Unvorbereitung kostet dich den Urlaub.
                  </p>
                </div>
              </div>
            </section>

            {/* 5. FORM CARD #1 */}
            <div className="my-16">
              <MagicLinkForm variant="inline1" />
            </div>

            {/* 6. DIE SICHEREN VIERTEL */}
            <section className="mb-16">
              <h2 className="text-3xl font-bold text-[#0d1f15] mb-8">
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
                  
                  <p className="text-gray-600 leading-relaxed mb-6 flex-grow pl-[68px] mt--2">
                    Hier kannst du als Tourist am wenigsten falsch machen. Exzellente Infrastruktur und dichte Überwachung.
                  </p>
                  
                  <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100 mt-auto">
                    <p className="text-[#0d1f15] font-semibold text-[15px] leading-relaxed">
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
                  
                  <p className="text-gray-600 leading-relaxed mb-6 flex-grow pl-[68px] mt--2">
                    Klassische Touristengebiete oder traditionelle Viertel. Sicher, erfordern aber normales städtisches Bewusstsein, um nicht aufzufallen.
                  </p>
                  
                  <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100 mt-auto">
                    <p className="text-[#0d1f15] font-semibold text-[15px] leading-relaxed">
                      Copacabana, Flamengo, Laranjeiras, Catete, Glória.
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
                  
                  <p className="text-gray-600 leading-relaxed mb-6 flex-grow pl-[68px] mt--2">
                    Tagsüber belebt, nachts erfordert es Vorwissen. Oft steilere Gegenden oder reine Partyviertel.
                  </p>
                  
                  <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100 mt-auto">
                    <p className="text-[#0d1f15] font-semibold text-[15px] leading-relaxed">
                      Santa Teresa (nachts aufpassen), Lapa (nur in Gruppen oder am frühen Abend).
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
                  
                  <p className="text-gray-600 leading-relaxed mb-6 flex-grow pl-[68px] mt--2">
                    Entweder reine Geschäftsviertel, die abends völlig leer sind, oder Gebiete ohne touristische Absicherung.
                  </p>
                  
                  <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100 mt-auto">
                    <p className="text-[#0d1f15] font-semibold text-[15px] leading-relaxed">
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
                  <span className="text-gray-700 leading-relaxed">
                    Diese Liste ist nur ein Ausgangspunkt. Jedes Viertel hat Nuancen — eine Querstraße kann den Unterschied machen. Im vollständigen Guide erfährst du, worauf du genau achten musst, um deinen Aufenthalt absolut sicher zu genießen.
                  </span>
                </div>
              </div>
            </section>

            {/* 7. 5 DER 15 GOLDENEN REGELN */}
            <section className="mb-16">
              <h2 className="text-3xl font-bold text-[#0d1f15] mb-6">
                Teaser: Einige der wichtigsten Überlebensregeln
              </h2>
              <p className="text-lg text-gray-700 mb-8">
                Über die Jahre habe ich 15 goldene Regeln zusammengestellt, die ich jedem meiner deutschen Touristen vorab in unserem Guide mitgebe. Sie sind pragmatisch, ehrlich und ohne Panik. Hier sind 5 davon für dich als Vorgeschmack:
              </p>

              <ul className="space-y-6 list-none p-0 text-gray-800">
                <li className="flex gap-4 items-start">
                  <div className="bg-[#0d1f15] text-white w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-1 pb-[1px]">✓</div>
                  <div>
                    <strong className="text-lg text-[#0d1f15] block mb-1">Nicht ostentieren</strong>
                    Trage keine Rolex, lass die offensichtlichen Ketten und Ringe im Safe in Deutschland, halte das iPhone in der Tasche, solange du es nicht brauchst. Je gewöhnlicher du aussiehst, desto langweiliger bist du für potenziellen Ärger.
                  </div>
                </li>
                <li className="flex gap-4 items-start">
                  <div className="bg-[#0d1f15] text-white w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-1 pb-[1px]">✓</div>
                  <div>
                    <strong className="text-lg text-[#0d1f15] block mb-1">Uber und 99, immer</strong>
                    Vergiss die normalen gelben Straßentaxis, insbesondere am Flughafen oder nachts nach einer Party. Nutzen per App fahrende private Fahrer gibt dir den exakten Preis, eine nachvollziehbare Route und absolute Datensicherheit. Punkt.
                  </div>
                </li>
                <li className="flex gap-4 items-start">
                  <div className="bg-[#0d1f15] text-white w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-1 pb-[1px]">✓</div>
                  <div>
                    <strong className="text-lg text-[#0d1f15] block mb-1">Deserte Straßen konsequent meiden</strong>
                    Wenn du nachts in eine Straße schaust und dort sind keine Autos, keine Straßenhändler, keine Fußgänger, keine geöffneten Kioske — dann gehst du dort <em>nicht</em> hin. Wenn die Straße leer ist, gibt es in Rio fast immer einen guten Grund dafür.
                  </div>
                </li>
                <li className="flex gap-4 items-start">
                  <div className="bg-[#0d1f15] text-white w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-1 pb-[1px]">✓</div>
                  <div>
                    <strong className="text-lg text-[#0d1f15] block mb-1">Bei einem Überfall: Nicht reagieren</strong>
                    Sollte das absolut Unwahrscheinliche eintreten und man zwingt dich zur Herausgabe deiner Wertsachen: Ruhig bleiben. Keine schnellen Handbewegungen. Augen nach unten. Keine Diskussion, kein Heldentum. Gebe alles sofort und widerstandslos heraus. Das Leben und die körperliche Unversehrtheit sind endlos viel mehr wert als jedes verdammte Smartphone.
                  </div>
                </li>
                <li className="flex gap-4 items-start">
                  <div className="bg-[#0d1f15] text-white w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-1 pb-[1px]">✓</div>
                  <div>
                    <strong className="text-lg text-[#0d1f15] block mb-1">Situational Awareness (Situationsbewusstsein)</strong>
                    Habe die gleiche Aufmerksamkeit wie an einem Freitagabend um 2 Uhr nachts am Bahnhof von Frankfurt oder am Kölner Hauptbahnhof. Nicht mehr (wer paranoid ist, hat keinen Spaß), aber definitiv auch nicht weniger. Sei stets bewusst, wer und was sich um dich herum befindet.
                  </div>
                </li>
              </ul>

              <div className="mt-8 p-6 bg-white border border-gray-100 rounded-2xl shadow-sm italic text-gray-700">
                Die anderen 10 essenziellen Regeln — sowie detaillierte Erklärungen, Beispiele auf der Straße, Maps mit Safe Zones und exklusive Geheimtipps — findest du im vollständigen und absolut kostenlosen Guide.
              </div>
            </section>

            {/* 8. FORM CARD #2 */}
            <div className="my-16">
              <MagicLinkForm variant="inline2" />
            </div>

            {/* 9. FAQ SEO */}
            <section className="mb-16">
              <h2 className="text-3xl font-bold text-[#0d1f15] mb-8">
                Häufige Fragen (FAQ) zur Sicherheit in Brasilien
              </h2>

              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Ist Rio de Janeiro gefährlicher als São Paulo?</h3>
                  <p className="text-gray-700">
                    Rio hat spezifische Herausforderungen, oft im Zusammenhang mit Favelas auf Hügeln neben wohlhabenden Zonen, was Kriminalität sichtbarer machen kann. Die Kriminalitätsraten und die reale Gefahr für dich variieren jedoch stark je nach Stadtteil. Mit gesundem Menschenverstand ist das tägliche Risiko für informierte Touristen in beiden Mega-Städten absolut vergleichbar und handhabbar.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Welche Viertel in Rio sind am sichersten für Touristen?</h3>
                  <p className="text-gray-700">
                    Die Südzone (<span className="italic">Zona Sul</span>) gilt als der am stärksten gesicherte und sicherste Bereich für Urlauber und Expats. Dazu gehören neben Ipanema und Leblon auch Botafogo, Humaitá und Urca (die oft als die sicherste Nachbarschaft Rios gilt). Copacabana ist sehr beliebt, bedarf aber wegen der schieren Masse an Touristen in bestimmten Ecken nachts mehr Aufmerksamkeit für Taschendiebe.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Kann man in Rio alleine reisen?</h3>
                  <p className="text-gray-700">
                    Ja, absolut. Wer sich selbstbewusst bewegt, grundlegende Sicherheitsregeln verinnerlicht, abends nicht alleine durch schwach beleuchtete Gassen spaziert und sichere Fahr-Apps konsequent einsetzt, kann die Stadt alleine hervorragend und gefahrlos entdecken. Tausende Backpacker und Alleinreisende tun dies reibungslos jedes Jahr.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Ist Copacabana sicher?</h3>
                  <p className="text-gray-700">
                    Tagsüber ist der Strand oft voll, stark frequentiert, gut polizeilich überwacht und absolut sicher (dennoch: Sachen auf dem Sand nicht unbewacht lassen). Sobald es Nacht wird, solltest du dich auf den stark beleuchteten Hautpstraßen halten, das ruhige Sandareal direkt am Wasser meiden und dunklen Straßenecken aus dem Weg gehen.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Wie gefährlich ist Lapa in Rio?</h3>
                  <p className="text-gray-700">
                    Lapa, nahe am Zentrum, ist das Herzstück des Nachtlebens in Rio (Ausgehviertel). Freitagabends und am Wochenende platzt das Viertel aus allen Nähten, was dich vor der Leere der Nacht schützt. Dennoch rate ich: Fahre direkt mit einem Uber von A nach B ins Viertel hinein und direkt wieder hinaus — mach dort nachts keine Spaziergänge in dunkle Nebenstraßen. Gruppen sind besser.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Ist Rio sicher für Frauen allein?</h3>
                  <p className="text-gray-700">
                    Frauen können sicher und problemlos alleine nach Rio reisen. Vorsicht ist jedoch geboten: Wie in fast jeder Metrople verlässt man sich besser auf geprüfte Uber anstatt Taxis zu winken, meidet unbelebte oder unbeleuchtete Strecken und schützt sein Getränk beim Feiern. Nutze primär sichere Viertel der <em>Zona Sul</em> als feste Basis. Brasilianische Frauen verhalten sich übrigens ähnlich achtsam in den Straßen. Vertraue deinem Bauchgefühl.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Wie sicher ist Rio im Vergleich zu anderen Städten Südamerikas?</h3>
                  <p className="text-gray-700">
                    Rio tendiert im Rahmen der großen südamerikanischen Metropolen ins Mittelfeld. Städte wie Buenos Aires (Argentinien) oder Santiago (Chile) gelten statistisch als etwas sicherer. Andere Metropolen im nördlichen Südamerika können deutlich heikler sein. In den touristenstarken und wirtschaftlichen Epizentren von Rio ist die Straßenpräsenz der Polizei enorm und bietet meist eine stabile Barriere gegen offene Bandenkriminalität für dich als Gast.
                  </p>
                </div>
              </div>
            </section>

            {/* 10. ÜBER WILL */}
            <section className="bg-white border text-gray-800 border-gray-200 rounded-3xl p-8 mb-16 flex flex-col md:flex-row gap-8 items-center shadow-lg">
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
                <p className="text-gray-700 mb-4">
                  Ich bin kein anonymer Redakteur hinter einem Schreibtisch. Ich bin ein Carioca. Ich besuche nicht bloß diese magische Stadt für Urlaube, sondern ich habe mein Leben hier gelernt, gelacht — und bin auch achtsam durch die schwierigen Ecken navigiert.
                </p>
                <p className="text-gray-700 font-medium">
                  Deutsche Schule im Rio, 4 Jahre Student in Köln, und nun hier als mehrsprachiger Guide: Ich kenne beide Welten. Ich kenne die deutsche Rationalität und das improvisierte Talent Brasiliens. Ich garantiere dir: Mit guter Vorbereitung fühlst du dich bei deiner <Link href="/touren" className="text-rio-green underline hover:text-[#0d1f15]">Tour durch Rio</Link> sicherer, als du dir gerade vorstellen kannst. Viel Spaß am Zuckerhut!
                </p>
                <div className="mt-4">
                  <Link href="/ueber-will" className="text-rio-blue font-bold hover:underline inline-flex items-center gap-1 group">
                    Mehr über Will lesen
                  </Link>
                </div>
              </div>
            </section>

            {/* 11. FORM CARD FINAL */}
            <div className="my-16">
              <MagicLinkForm variant="final" />
            </div>

          </article>
        </main>
        
        <Footer />
      </div>
    </>
  );
}

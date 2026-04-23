import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FadeIn from "@/components/FadeIn";
import AndereTouren from "@/components/AndereTouren";
import { ChevronRight, MapPin, ArrowRight, Phone } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Escadaria Selarón Rio de Janeiro — Tipps, Geschichte & Insider-Wissen | Rio für Deutsche",
    description:
        "Die berühmte Fliesentreppe zwischen Lapa und Santa Teresa — kostenlos, farbenprächtig und voller Geschichte. Alles, was du als deutscher Tourist wissen musst, erklärt von einem Carioca.",
    openGraph: {
        title: "Escadaria Selarón — Tipps vom Carioca auf Deutsch",
        description:
            "215 Stufen, 2.000 Fliesen aus 60 Ländern — und eine Geschichte, die kaum jemand kennt. Insider-Tipps vom lokalen Guide auf Deutsch.",
        url: "https://riofuerdeutsche.de/rio-guide/sehenswuerdigkeiten/escadaria-selaron",
    },
    alternates: {
        canonical:
            "https://riofuerdeutsche.de/rio-guide/sehenswuerdigkeiten/escadaria-selaron",
    },
};

const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TouristAttraction",
    name: "Escadaria Selarón",
    description:
        "Die berühmte Fliesentreppe zwischen Lapa und Santa Teresa in Rio de Janeiro — 215 Stufen, über 2.000 Fliesen aus 60 Ländern, kostenloser Eintritt.",
    url: "https://riofuerdeutsche.de/rio-guide/sehenswuerdigkeiten/escadaria-selaron",
    image: "https://riofuerdeutsche.de/images/selaron-bg.webp",
    touristType: "Cultural tourism",
    isAccessibleForFree: true,
    address: {
        "@type": "PostalAddress",
        streetAddress: "Rua Manuel Carneiro",
        addressLocality: "Rio de Janeiro",
        addressRegion: "RJ",
        addressCountry: "BR",
    },
    geo: {
        "@type": "GeoCoordinates",
        latitude: -22.9122,
        longitude: -43.1801,
    },
    inLanguage: "de",
    knowsAbout: ["Escadaria Selarón", "Jorge Selarón", "Lapa", "Santa Teresa", "Rio de Janeiro"],
};

export default function EscadariaSelaronPage() {
    return (
        <>
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <div className="flex flex-col min-h-screen bg-rio-sand selection:bg-rio-green selection:text-white font-sans">
            <Navbar />

            <main className="flex-grow">
                {/* ── HERO ─────────────────────────────────────────── */}
                <section className="relative pt-32 pb-28 lg:pt-44 lg:pb-36 overflow-hidden">
                    {/* Photo background */}
                    <div
                        className="absolute inset-0 z-0 bg-cover bg-center"
                        style={{ backgroundImage: "url('/images/selaron-bg.webp')" }}
                        role="img"
                        aria-label="Escadaria Selarón — die bunte Fliesentreppe zwischen Lapa und Santa Teresa in Rio de Janeiro"
                    />

                    {/* Dark overlay */}
                    <div className="absolute inset-0 z-0 bg-[#071a0e]/70" />

                    {/* Subtle texture overlay */}
                    <div
                        className="absolute inset-0 z-0 opacity-[0.03]"
                        style={{
                            backgroundImage:
                                "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.8) 1px, transparent 0)",
                            backgroundSize: "32px 32px",
                        }}
                    />

                    {/* Green glow accent */}
                    <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-[#22a262]/10 blur-3xl z-0 -translate-y-1/2 translate-x-1/4" />
                    <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-[#22a262]/8 blur-3xl z-0 translate-y-1/2 -translate-x-1/4" />

                    <div className="relative z-10 max-w-7xl mx-auto px-5 lg:px-8">
                        <FadeIn direction="up">
                            {/* Breadcrumb */}
                            <nav
                                className="flex items-center flex-wrap gap-y-1 text-sm font-medium text-white/50 mb-10"
                                aria-label="Breadcrumb"
                            >
                                <Link
                                    href="/"
                                    className="hover:text-white transition-colors"
                                >
                                    Startseite
                                </Link>
                                <ChevronRight className="w-4 h-4 mx-2 text-white/25 shrink-0" />
                                <Link
                                    href="/rio-guide"
                                    className="hover:text-white transition-colors"
                                >
                                    Rio-Guide
                                </Link>
                                <ChevronRight className="w-4 h-4 mx-2 text-white/25 shrink-0" />
                                <Link
                                    href="/rio-guide/sehenswuerdigkeiten"
                                    className="hover:text-white transition-colors"
                                >
                                    Sehenswürdigkeiten
                                </Link>
                                <ChevronRight className="w-4 h-4 mx-2 text-white/25 shrink-0" />
                                <span className="text-[#22a262] font-semibold">
                                    Escadaria Selarón
                                </span>
                            </nav>

                            {/* Supertítulo */}
                            <p className="text-xs font-bold tracking-widest uppercase text-[#22a262] mb-4 flex items-center gap-2">
                                <MapPin className="w-3.5 h-3.5" />
                                Rio-Guide · Sehenswürdigkeiten
                            </p>

                            {/* H1 */}
                            <div className="max-w-4xl">
                                <h1 className="text-5xl lg:text-[clamp(40px,5vw,72px)] font-heading font-black text-white leading-[1.08] tracking-tight mb-6">
                                    Escadaria Selarón
                                </h1>

                                {/* Tagline */}
                                <p className="text-xl lg:text-2xl text-white/70 font-medium leading-snug max-w-2xl mb-10">
                                    215 Stufen Kunst, die ein ganzes Leben gedauert hat.
                                </p>

                                {/* CTA Buttons */}
                                <div className="flex flex-col sm:flex-row gap-4">
                                    {/* CTA primário */}
                                    <Link
                                        href="/touren/klassiker-tour"
                                        className="inline-flex items-center justify-center gap-2.5 px-8 py-4 bg-[#22a262] text-white rounded-full font-bold text-base hover:bg-[#1a8a52] hover:scale-[1.02] transition-all shadow-xl shadow-[#22a262]/25"
                                    >
                                        Klassiker Tour buchen
                                        <ArrowRight className="w-4 h-4" />
                                    </Link>

                                    {/* CTA secundário */}
                                    <Link
                                        href="/rio-guide/sehenswuerdigkeiten"
                                        className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/8 backdrop-blur-md border border-white/20 text-white/80 rounded-full font-medium text-base hover:bg-white/15 hover:text-white transition-all"
                                    >
                                        Alle Sehenswürdigkeiten
                                    </Link>
                                </div>
                            </div>
                        </FadeIn>
                    </div>
                </section>

                {/* ── SECÇÃO 2 — Informações Práticas ─────────────── */}
                <section className="py-16 lg:py-20 bg-gray-50 border-t border-gray-100">
                    <div className="max-w-7xl mx-auto px-5 lg:px-8">
                        <FadeIn direction="up">
                            <h2 className="text-xs font-bold tracking-widest uppercase text-rio-green mb-8">
                                Praktische Infos auf einen Blick
                            </h2>
                        </FadeIn>
                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">

                            {/* Card 1 — Eintritt */}
                            <FadeIn delay={0} direction="up" className="bg-white border border-gray-100 rounded-2xl p-5 flex flex-col gap-3 hover:border-rio-green/30 hover:shadow-sm transition-all duration-300">
                                <span className="text-2xl" role="img" aria-label="Kostenlos">🎫</span>
                                <div>
                                    <p className="text-[11px] font-bold tracking-widest uppercase text-gray-400 mb-1">Eintritt</p>
                                    <p className="text-gray-900 font-semibold text-[15px] leading-snug">Kostenlos</p>
                                </div>
                            </FadeIn>

                            {/* Card 2 — Stufen */}
                            <FadeIn delay={0.05} direction="up" className="bg-white border border-gray-100 rounded-2xl p-5 flex flex-col gap-3 hover:border-rio-green/30 hover:shadow-sm transition-all duration-300">
                                <span className="text-2xl" role="img" aria-label="Treppe">🪜</span>
                                <div>
                                    <p className="text-[11px] font-bold tracking-widest uppercase text-gray-400 mb-1">Stufen</p>
                                    <p className="text-gray-900 font-semibold text-[15px] leading-snug">215 Stufen <span className="text-gray-400 font-normal">· 125 m lang</span></p>
                                </div>
                            </FadeIn>

                            {/* Card 3 — Lage */}
                            <FadeIn delay={0.1} direction="up" className="bg-white border border-gray-100 rounded-2xl p-5 flex flex-col gap-3 hover:border-rio-green/30 hover:shadow-sm transition-all duration-300">
                                <span className="text-2xl" role="img" aria-label="Standort">📍</span>
                                <div>
                                    <p className="text-[11px] font-bold tracking-widest uppercase text-gray-400 mb-1">Lage</p>
                                    <p className="text-gray-900 font-semibold text-[15px] leading-snug">Rua Manuel Carneiro <span className="text-gray-400 font-normal">· Lapa / Santa Teresa</span></p>
                                </div>
                            </FadeIn>

                            {/* Card 4 — Beste Zeit */}
                            <FadeIn delay={0.15} direction="up" className="bg-white border border-gray-100 rounded-2xl p-5 flex flex-col gap-3 hover:border-rio-green/30 hover:shadow-sm transition-all duration-300">
                                <span className="text-2xl" role="img" aria-label="Kalender">📅</span>
                                <div>
                                    <p className="text-[11px] font-bold tracking-widest uppercase text-gray-400 mb-1">Beste Zeit</p>
                                    <p className="text-gray-900 font-semibold text-[15px] leading-snug">Früh morgens <span className="text-gray-400 font-normal">(vor 9 Uhr)</span> oder spätnachmittags</p>
                                </div>
                            </FadeIn>

                            {/* Card 5 — Schwierigkeit */}
                            <FadeIn delay={0.2} direction="up" className="bg-white border border-gray-100 rounded-2xl p-5 flex flex-col gap-3 hover:border-rio-green/30 hover:shadow-sm transition-all duration-300">
                                <span className="text-2xl" role="img" aria-label="Wandern">🥾</span>
                                <div>
                                    <p className="text-[11px] font-bold tracking-widest uppercase text-gray-400 mb-1">Schwierigkeit</p>
                                    <p className="text-gray-900 font-semibold text-[15px] leading-snug">Leicht</p>
                                </div>
                            </FadeIn>

                            {/* Card 6 — Mit Will */}
                            <FadeIn delay={0.25} direction="up" className="bg-white border border-rio-green/20 rounded-2xl p-5 flex flex-col gap-3 hover:border-rio-green/50 hover:shadow-sm transition-all duration-300">
                                <span className="text-2xl" role="img" aria-label="Auto">🚗</span>
                                <div>
                                    <p className="text-[11px] font-bold tracking-widest uppercase text-rio-green mb-1">Mit Will</p>
                                    <p className="text-gray-900 font-semibold text-[15px] leading-snug">Privattransfer inklusive — kein Stress</p>
                                </div>
                            </FadeIn>

                        </div>

                        {/* ── Wetter & Besuchszeiten — Card destacado ──── */}
                        <FadeIn direction="up" className="mt-6">
                            <div className="relative bg-[#0d1f15] rounded-2xl overflow-hidden border border-amber-500/40 shadow-lg shadow-black/10">

                                {/* Glow accent */}
                                <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-amber-500/8 blur-3xl pointer-events-none" />

                                <div className="relative p-7 lg:p-8">
                                    {/* Icon + label */}
                                    <div className="flex items-center gap-3 mb-5">
                                        <span className="text-3xl" role="img" aria-label="Wetter">⛅</span>
                                        <span className="text-xs font-bold tracking-widest uppercase text-amber-400">
                                            Wetter &amp; Besuchszeiten
                                        </span>
                                    </div>

                                    {/* Título */}
                                    <h3 className="text-xl lg:text-2xl font-heading font-bold text-white mb-5 leading-tight">
                                        Wann ist die beste Zeit für einen Besuch?
                                    </h3>

                                    {/* Conteúdo */}
                                    <div className="space-y-4">
                                        <p className="text-white/75 text-base leading-relaxed">
                                            <span className="text-amber-400 font-semibold">Beste Reisezeit:</span>{" "}
                                            Ganzjährig geöffnet — Rio hat kein echtes Saison-Problem
                                            bei dieser Attraktion, aber Regen macht die Mosaikfliesen rutschig. Vorsicht!
                                        </p>

                                        <p className="text-white/75 text-base leading-relaxed">
                                            <span className="text-amber-400 font-semibold">Wann hingehen:</span>{" "}
                                            Vor 9 Uhr morgens oder ab 17 Uhr nachmittags — dann sind
                                            die Gruppenreisen weg, das Licht ist perfekt für Fotos und die Atmosphäre
                                            ist entspannt.
                                        </p>

                                        <p className="text-white/75 text-base leading-relaxed">
                                            <span className="text-amber-400 font-semibold">Mittags meiden:</span>{" "}
                                            Zwischen 11 und 15 Uhr kommen die Touristenbusse.
                                            Eng, heiß und kaum Platz für ein gutes Foto.
                                        </p>

                                        <p className="text-white/75 text-base leading-relaxed">
                                            <span className="text-amber-400 font-semibold">Abends:</span>{" "}
                                            Die Treppe liegt am Rand von Lapa — ein Viertel, das nachts
                                            Charme hat, aber auch Aufmerksamkeit verlangt. Ich empfehle, abends mit
                                            mir oder in einer Gruppe zu kommen.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </FadeIn>

                    </div>
                </section>

                {/* ── SECÇÃO 3 — Texto Introdutório ───────────────── */}
                <section className="pt-20 lg:pt-28 pb-8 bg-white">
                    <div className="max-w-7xl mx-auto px-5 lg:px-8">
                        <FadeIn direction="up">
                            <div className="max-w-[800px] mx-auto space-y-7 text-left">

                                {/* Parágrafo 1 */}
                                <p className="text-xl lg:text-2xl font-semibold text-gray-900 leading-snug">
                                    Stell dir vor: Ein chilenischer Künstler kommt in den 80er Jahren nach Rio,
                                    verliebt sich in die Stadt und beschließt, die kaputte Treppe vor seinem Haus
                                    zu renovieren — einfach so, aus einer Laune heraus. Was als persönliches
                                    Projekt begann, wurde über 23 Jahre zu einem der bekanntesten Kunstwerke
                                    Lateinamerikas. Die Escadaria Selarón ist heute ein UNESCO-anerkanntes
                                    Kulturdenkmal, das täglich Tausende aus aller Welt anzieht. Und der Eintritt?
                                    Kostenlos.
                                </p>

                                {/* Parágrafo 2 */}
                                <p className="text-lg text-gray-600 leading-relaxed">
                                    Über 2.000 Fliesen aus mehr als 60 Ländern bedecken die 215 Stufen —
                                    darunter auch deutsche. Wenn du genau hinschaust, wirst du Motive aus
                                    München, Heidelberg und Berlin finden, die Selarón von Besuchern geschenkt
                                    bekam. Die Treppe verbindet die beiden Bohème-Viertel Lapa und Santa Teresa,
                                    und genau dieses Nebeneinander aus Nachtleben und Künstlerkultur macht den
                                    Besuch besonders. Du stehst buchstäblich zwischen zwei Welten.
                                </p>

                                {/* Parágrafo 3 */}
                                <p className="text-lg text-gray-600 leading-relaxed pt-2 border-t border-gray-100">
                                    Ich bin hier aufgewachsen und kenne diese Treppe seit Jahrzehnten. Als ich
                                    das erste Mal einem deutschen Gast die Geschichte von Jorge Selarón erzählt
                                    habe — die ganze Geschichte, nicht die Version der Reiseführer — war die
                                    Reaktion immer dieselbe: Stille, dann Gänsehaut. Was hinter diesen Fliesen
                                    steckt, ist viel mehr als bunte Keramik. Lass mich es dir erzählen.
                                </p>

                            </div>
                        </FadeIn>
                    </div>
                </section>

                {/* ── IMAGEM 01 ───────────────────────────────────── */}
                <section className="pt-2 pb-10 bg-white">
                    <div className="max-w-7xl mx-auto px-5 lg:px-8">
                        <FadeIn direction="up">
                            <figure className="max-w-[800px] mx-auto">
                                <div className="rounded-2xl overflow-hidden shadow-sm">
                                    <Image
                                        src="/images/buntes-fliesend-01.webp"
                                        alt="Bunte Mosaikfliesen der Escadaria Selarón — Detailansicht der farbenprächtigen Keramik aus aller Welt"
                                        width={1200}
                                        height={800}
                                        className="w-full h-auto"
                                        loading="lazy"
                                    />
                                </div>
                                <figcaption className="mt-3 text-sm text-gray-400 text-center leading-snug">
                                    Über 2.000 Fliesen aus mehr als 60 Ländern — jede ein Geschenk, jede eine Geschichte.
                                </figcaption>
                            </figure>
                        </FadeIn>
                    </div>
                </section>

                {/* ── SECÇÃO 4 — Geschichte & Wissenswertes ───────── */}
                <section className="pt-20 lg:pt-28 pb-8 lg:pb-10 bg-gray-50 border-t border-gray-100">
                    <div className="max-w-7xl mx-auto px-5 lg:px-8">
                        <FadeIn direction="up" className="mb-10">
                            <div className="max-w-[800px] mx-auto">
                                <h2 className="text-3xl lg:text-4xl font-heading font-bold text-gray-900 leading-tight">
                                    Geschichte &amp;{" "}
                                    <span className="text-rio-green">Wissenswertes</span>
                                </h2>
                            </div>
                        </FadeIn>

                        <FadeIn direction="up">
                            <div className="max-w-[800px] mx-auto space-y-7 text-left">

                                {/* P1 — Origem */}
                                <p className="text-lg text-gray-600 leading-relaxed">
                                    Jorge Selarón wurde 1947 in Chile geboren. Nach Reisen durch mehr als
                                    50 Länder als Maler und Bildhauer kam er 1983 nach Rio de Janeiro —
                                    und blieb für immer. Er ließ sich in einem Haus am oberen Ende einer
                                    heruntergekommenen Treppe zwischen Lapa und Santa Teresa nieder, und
                                    1990 begann er aus einem Impuls heraus, die Stufen mit Fliesen zu
                                    bedecken. Die Nachbarn fanden es seltsam. Die Stadt ignorierte ihn.
                                    Selarón machte weiter.
                                </p>

                                {/* P2 — O crescimento do projeto */}
                                <p className="text-lg text-gray-600 leading-relaxed">
                                    Mit der Zeit wuchs der Ruhm. Touristen aus aller Welt brachten Fliesen
                                    aus ihren Heimatländern als Geschenk. Deutschland, Frankreich, Portugal,
                                    Japan, Australien — jede von einem Besucher hinzugefügte Kachel machte
                                    die Treppe universeller. Heute sind es mehr als 2.000 Fliesen aus über
                                    60 Ländern — manche Quellen sprechen sogar von 120. Der Künstler sagte,
                                    das Werk werde nie fertig sein: Es sei ein{" "}
                                    <em>„verrückter und unvollendeter Traum"</em>.
                                </p>

                                {/* P3 — Os factos que impressionam os alemães */}
                                <p className="text-lg text-gray-600 leading-relaxed">
                                    Die Treppe hat 215 Stufen und ist 125 Meter lang. Oben befindet sich
                                    ein großes Mosaik der brasilianischen Flagge. Unten, an der pyramidenförmigen
                                    Wand in Rottönen, steht Selaróns Inschrift:{" "}
                                    <em>„Brasilien, ich liebe Dich. Selarón."</em>{" "}
                                    2005 erkannte die Stadt Rio die Treppe offiziell als historisches Monument an.
                                    Sie erschien in Musikvideos von U2 und Snoop Dogg, in Kampagnen von
                                    Coca-Cola und American Express — und im Bewerbungsvideo Rios für die
                                    Olympischen Spiele 2016.
                                </p>

                                {/* Imagem — Jorge Selarón */}
                                <figure className="my-2 mb-8">
                                    <div className="rounded-2xl overflow-hidden shadow-sm">
                                        <Image
                                            src="/images/jorge-selaron.webp"
                                            alt="Jorge Selarón — der chilenische Künstler vor seiner berühmten Fliesentreppe in Rio de Janeiro"
                                            width={1200}
                                            height={800}
                                            className="w-full h-auto"
                                            loading="lazy"
                                        />
                                    </div>
                                    <figcaption className="mt-3 text-sm text-gray-400 text-center leading-snug">
                                        Jorge Selarón (1947–2013) — der chilenische Künstler, der Rio sein Lebenswerk schenkte.
                                    </figcaption>
                                </figure>

                                {/* P4 — O motivo da mulher grávida */}
                                <p className="text-lg text-gray-600 leading-relaxed">
                                    Es gibt ein Detail, das kaum ein Reiseführer erzählt. Selarón malte
                                    obsessiv immer dasselbe Bild: eine schwangere schwarze Frau. Tausende
                                    Male, jeden Tag. Manchmal mit seinem eigenen Gesicht. Der Grund ist
                                    schmerzhaft: Als Selarón in den 70er Jahren aus politischen Gründen aus
                                    Chile floh, ließ er seine schwangere Frau zurück. Später erfuhr er, dass
                                    sie und das Kind gestorben waren. Die schwangere Frau, die er jahrzehntelang
                                    malte, war eine Art, sie nicht zu vergessen. Wenn ich das meinen deutschen
                                    Gästen erzähle, sagt die Stille danach alles.
                                </p>

                                {/* P5 — O legado e a morte */}
                                <p className="text-lg text-gray-600 leading-relaxed">
                                    Selarón lebte bis zum Ende an der Treppe. Man konnte ihn dort häufig
                                    antreffen — roten Hut auf dem Kopf, an den Fliesen arbeitend oder
                                    bis tief in die Nacht Geschichten mit Besuchern austauschend. Am
                                    10. Januar 2013 wurde er leblos auf seiner eigenen Treppe gefunden,
                                    mit Brandspuren am Körper. Die Umstände sind bis heute ungeklärt.
                                    Die Stadt übernahm die Pflege des Werks — das heute Kulturerbe
                                    von Rio de Janeiro ist.
                                </p>

                                {/* P6 — Conexão com a cultura carioca */}
                                <p className="text-lg text-gray-600 leading-relaxed">
                                    Was die Selarón so carioca macht, ist nicht ihr Standort, sondern ihr
                                    Geist: Sie entstand aus einem Impuls, wuchs ohne Plan, wurde durch die
                                    Großzügigkeit anderer finanziert und hat sich selbst nie allzu ernst
                                    genommen. Genau so funktioniert Rio. Und genau deshalb ist diese Treppe —
                                    von einem Chilenen gebaut, mit Fliesen aus aller Welt — heute eines der
                                    authentischsten Symbole der Stadt.
                                </p>

                            </div>
                        </FadeIn>
                    </div>
                </section>

                {/* ── INFOGRÁFICO ─────────────────────────────────── */}
                <section className="pb-12 lg:pb-16 bg-gray-50">
                    <div className="max-w-7xl mx-auto px-5 lg:px-8">
                        <FadeIn direction="up">
                            <figure className="max-w-[800px] mx-auto">
                                <div className="rounded-2xl shadow-md">
                                    <div className="rounded-2xl overflow-hidden border border-gray-100">
                                    <Image
                                        src="/images/rio-guide/sehenswuerdigkeiten/infografik-selaron-01.webp"
                                        alt="Infografik zur Escadaria Selarón: 215 Stufen, 125 m lang, über 2.000 Fliesen aus 60 Ländern, kostenloser Eintritt, erbaut 1990–2013"
                                        width={1200}
                                        height={900}
                                        className="w-full h-auto block"
                                        loading="lazy"
                                    />
                                    </div>
                                </div>
                                <figcaption className="mt-3 text-sm text-gray-400 text-center leading-snug">
                                    Zahlen &amp; Fakten zur Escadaria Selarón — 23 Jahre Arbeit, 215 Stufen, über 2.000 Fliesen aus aller Welt.
                                </figcaption>
                            </figure>
                        </FadeIn>
                    </div>
                </section>

                {/* ── SECÇÃO 5 — Wills Insider-Tipp ───────────────── */}
                <section className="py-16 lg:py-20 bg-white border-t border-gray-100">
                    <div className="max-w-7xl mx-auto px-5 lg:px-8">
                        <FadeIn direction="up">
                            <div className="max-w-[800px] mx-auto">
                                <div className="relative bg-[#0d1f15] rounded-3xl overflow-hidden border-l-4 border-[#22a262] shadow-xl shadow-black/10">

                                    {/* Subtle glow inside the card */}
                                    <div className="absolute top-0 right-0 w-72 h-72 rounded-full bg-[#22a262]/8 blur-3xl pointer-events-none" />

                                    <div className="relative p-8 lg:p-10">
                                        {/* Icon + label */}
                                        <div className="flex items-center gap-3 mb-6">
                                            <span className="text-3xl" role="img" aria-label="Glühbirne">💡</span>
                                            <span className="text-xs font-bold tracking-widest uppercase text-[#22a262]">
                                                Wills Insider-Tipp
                                            </span>
                                        </div>

                                        {/* Texto */}
                                        <p className="text-white/75 text-lg leading-relaxed mb-5">
                                            Komm vor 8 Uhr morgens. Wirklich. Um 8:15 Uhr hast du die Treppe
                                            noch fast für dich allein, das Morgenlicht fällt von oben nach unten
                                            und die Farben der Fliesen leuchten in einer Intensität, die es
                                            nachmittags so nicht gibt. Und unten an der Treppe, rechts,
                                            gibt es eine kleine Bar, die seit früh morgens Kaffee und{" "}
                                            <span className="text-white font-semibold italic">Pão de Queijo</span>{" "}
                                            serviert — das beste Frühstück in Lapa, ohne Touristen, ohne Schlange.
                                        </p>

                                        <p className="text-white/60 text-base leading-relaxed">
                                            Und noch etwas — such die Fliese mit der Baía de Guanabara, in Rot
                                            gezeichnet, an der pyramidenförmigen Wand unten. Sie ist der
                                            Liebling aller, die ich je dorthin mitgenommen habe.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </FadeIn>
                    </div>
                </section>

                {/* ── SECÇÃO 6 — Passt gut dazu ───────────────────── */}
                <section className="py-20 lg:py-24 bg-gray-50 border-t border-gray-100">
                    <div className="max-w-7xl mx-auto px-5 lg:px-8">
                        <FadeIn direction="up" className="mb-10">
                            <h2 className="text-3xl lg:text-4xl font-heading font-bold text-gray-900 leading-tight">
                                Passt gut dazu…
                            </h2>
                            <p className="text-gray-500 mt-2 text-lg">
                                Drei Orte, die du nicht verpassen solltest, wenn du schon an der Selarón bist.
                            </p>
                        </FadeIn>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                            {/* Card 1 — Arcos da Lapa */}
                            <FadeIn delay={0} direction="up" className="flex">
                                <Link
                                    href="/rio-guide/sehenswuerdigkeiten/arcos-da-lapa"
                                    className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col overflow-hidden w-full"
                                >
                                    <div className="relative h-48 overflow-hidden">
                                        <Image
                                            src="/images/arcos-da-lapa.jpg"
                                            alt="Arcos da Lapa — das Aquädukt aus dem 18. Jahrhundert in Rio de Janeiro"
                                            fill
                                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                        <span className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2.5 py-0.5 rounded-full text-[9px] font-bold text-rio-green uppercase tracking-wider">
                                            Klassiker
                                        </span>
                                    </div>
                                    <div className="p-5 flex flex-col flex-grow">
                                        <h3 className="text-lg font-bold font-heading text-gray-900 mb-2">Arcos da Lapa</h3>
                                        <p className="text-gray-500 text-sm leading-relaxed flex-grow">
                                            Das Aquädukt aus dem 18. Jahrhundert liegt nur 2 Minuten zu Fuß entfernt — perfekt zu kombinieren.
                                        </p>
                                        <div className="flex items-center gap-1.5 text-sm font-bold text-rio-green group-hover:text-rio-yellow transition-colors mt-4">
                                            Mehr erfahren <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                                        </div>
                                    </div>
                                </Link>
                            </FadeIn>

                            {/* Card 2 — Santa Teresa */}
                            <FadeIn delay={0.08} direction="up" className="flex">
                                <Link
                                    href="/rio-guide/sehenswuerdigkeiten/santa-teresa"
                                    className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col overflow-hidden w-full"
                                >
                                    <div className="relative h-48 overflow-hidden">
                                        <Image
                                            src="/images/santa-teresa.webp"
                                            alt="Santa Teresa — das Künstlerviertel von Rio de Janeiro"
                                            fill
                                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                        <span className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2.5 py-0.5 rounded-full text-[9px] font-bold text-rio-green uppercase tracking-wider">
                                            Künstlerviertel
                                        </span>
                                    </div>
                                    <div className="p-5 flex flex-col flex-grow">
                                        <h3 className="text-lg font-bold font-heading text-gray-900 mb-2">Santa Teresa</h3>
                                        <p className="text-gray-500 text-sm leading-relaxed flex-grow">
                                            Das Bohème-Viertel direkt über der Treppe — Straßenkunst, Galerien und die besten lokalen Bars.
                                        </p>
                                        <div className="flex items-center gap-1.5 text-sm font-bold text-rio-green group-hover:text-rio-yellow transition-colors mt-4">
                                            Mehr erfahren <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                                        </div>
                                    </div>
                                </Link>
                            </FadeIn>

                            {/* Card 3 — Christus Erlöser */}
                            <FadeIn delay={0.16} direction="up" className="flex">
                                <Link
                                    href="/rio-guide/sehenswuerdigkeiten/christus-erloeser"
                                    className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col overflow-hidden w-full"
                                >
                                    <div className="relative h-48 overflow-hidden">
                                        <Image
                                            src="/images/cristo-bg.webp"
                                            alt="Christus Erlöser auf dem Corcovado in Rio de Janeiro"
                                            fill
                                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                        <span className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2.5 py-0.5 rounded-full text-[9px] font-bold text-rio-green uppercase tracking-wider">
                                            Weltwunder
                                        </span>
                                    </div>
                                    <div className="p-5 flex flex-col flex-grow">
                                        <h3 className="text-lg font-bold font-heading text-gray-900 mb-2">Christus Erlöser</h3>
                                        <p className="text-gray-500 text-sm leading-relaxed flex-grow">
                                            Beide Highlights in einem Tag — Selarón am Morgen, Christus am Nachmittag.
                                        </p>
                                        <div className="flex items-center gap-1.5 text-sm font-bold text-rio-green group-hover:text-rio-yellow transition-colors mt-4">
                                            Mehr erfahren <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                                        </div>
                                    </div>
                                </Link>
                            </FadeIn>

                        </div>
                    </div>
                </section>

                {/* ── SECÇÃO 7 — CTA Final ─────────────────────────── */}
                <section className="py-24 relative overflow-hidden bg-[#0d1f15] border-t-4 border-rio-yellow">
                    <div className="absolute inset-0 bg-[url('/images/rio-background.webp')] bg-cover bg-center mix-blend-overlay opacity-10" />
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-[#22a262]/10 blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/4" />
                    <div className="relative max-w-4xl mx-auto px-5 text-center">
                        <FadeIn direction="up">
                            <h2 className="text-3xl lg:text-5xl font-heading font-black text-white mb-6 leading-tight">
                                Die Escadaria Selarón{" "}
                                <br className="hidden sm:block" />
                                <span className="text-rio-yellow">mit Will erleben</span>
                            </h2>
                            <p className="text-lg text-white/70 mb-10 max-w-2xl mx-auto leading-relaxed">
                                Ich erzähle dir die Geschichte, die kein Reiseführer kennt — und bringe dich
                                dorthin, wenn das Licht und die Stimmung perfekt sind. Mit Privattransfer,
                                ohne Stress.
                            </p>
                            <div className="flex flex-col sm:flex-row justify-center gap-4">
                                <Link
                                    href="/touren/klassiker-tour"
                                    className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-rio-yellow text-gray-900 rounded-full font-bold text-lg hover:bg-yellow-400 hover:scale-[1.02] transition-all shadow-xl shadow-rio-yellow/20"
                                >
                                    <Phone className="w-5 h-5" />
                                    Klassiker Tour buchen
                                </Link>
                                <Link
                                    href="/kontakt"
                                    className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-md border border-white/30 text-white rounded-full font-medium text-lg hover:bg-white/20 transition-all"
                                >
                                    Kontakt aufnehmen
                                </Link>
                            </div>
                        </FadeIn>
                    </div>
                </section>

                {/* ── SECÇÃO 8 — Andere Touren ─────────────────────── */}
                <AndereTouren currentSlug="__escadaria-selaron__" />

            </main>

            <Footer />
        </div>
        </>
    );
}

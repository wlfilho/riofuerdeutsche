import Link from "next/link";
import Image from "next/image";
import NavbarServer from "@/components/NavbarServer";
import FooterServer from "@/components/FooterServer";
import FadeIn from "@/components/FadeIn";
import AndereTouren from "@/components/AndereTouren";
import { ChevronRight, Home, ArrowRight, Phone } from "lucide-react";
import Faq from "@/components/Faq";

export const metadata = {
    title: {
        absolute: "Maracanã Stadion Rio: Tour, Tickets & Tipps auf Deutsch | Rio für Deutsche",
    },
    description:
        "Das Maracanã in Rio besuchen: Stadionrundgang, Tickets, Anfahrt und wie du ein Spiel live erlebst, mit Transfer und Platz in der Cadeira Cativa. 2027 steigen hier Eröffnungsspiel und Finale der Frauen-WM. Vom deutschsprachigen Guide vor Ort.",
    openGraph: {
        title: "Maracanã Stadion Rio: Tour, Tickets und Tipps vom Carioca",
        description:
            "Stadionrundgang, Tickets, Anfahrt und Live-Spiele im Maracanã. Alles auf Deutsch, von einem Carioca, der hier aufgewachsen ist.",
        url: "https://riofuerdeutsche.de/rio-guide/sehenswuerdigkeiten/maracana",
    },
    alternates: {
        canonical: "https://riofuerdeutsche.de/rio-guide/sehenswuerdigkeiten/maracana",
    },
};

const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TouristAttraction",
    name: "Maracanã",
    alternateName: "Estádio Jornalista Mário Filho",
    description:
        "Das Maracanã in Rio de Janeiro, eröffnet 1950, ist das bekannteste Fußballstadion der Welt. Heute fasst es 78.838 Zuschauer. Hier fanden die WM-Finals 1950 und 2014 statt, hier schoss Pelé sein tausendstes Tor, und 2027 werden hier Eröffnungsspiel und Finale der FIFA Frauen-Weltmeisterschaft ausgetragen. Täglich ist ein Stadionrundgang möglich, Flamengo und Fluminense tragen hier ihre Heimspiele aus.",
    url: "https://riofuerdeutsche.de/rio-guide/sehenswuerdigkeiten/maracana",
    image: "https://riofuerdeutsche.de/images/maracana-bg.webp",
    touristType: "Sports tourism",
    isAccessibleForFree: false,
    address: {
        "@type": "PostalAddress",
        streetAddress: "Av. Presidente Castelo Branco, Portão 2, Maracanã",
        addressLocality: "Rio de Janeiro",
        addressRegion: "RJ",
        postalCode: "20271-130",
        addressCountry: "BR",
    },
    geo: {
        "@type": "GeoCoordinates",
        latitude: -22.9121,
        longitude: -43.2302,
    },
    openingHours: "Mo-Su 09:00-17:00",
    maximumAttendeeCapacity: 78838,
    inLanguage: "de",
    knowsAbout: [
        "Maracanã",
        "Maracanã Stadion",
        "Stadiontour Rio de Janeiro",
        "Flamengo",
        "Fluminense",
        "Frauen-WM 2027",
        "Rio de Janeiro",
    ],
};

const videoJsonLd = {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: "So klingt ein Spiel im Maracanã, Rio de Janeiro",
    description:
        "Aufgenommen von der Cadeira Cativa im Maracanã in Rio de Janeiro: der Moment, in dem die Mannschaft einläuft, mit Feuerwerk und rotem Rauch über der Tribüne.",
    thumbnailUrl: "https://i.ytimg.com/vi/YW1a2hA6sQk/maxresdefault.jpg",
    uploadDate: "2026-08-29",
    embedUrl: "https://www.youtube-nocookie.com/embed/YW1a2hA6sQk",
    contentUrl: "https://www.youtube.com/watch?v=YW1a2hA6sQk",
    inLanguage: "de",
};

const faqItems = [
    {
        q: "Was kostet ein Besuch im Maracanã?",
        a: "Der reine Stadionrundgang kostet R$ 94, ermäßigt R$ 47 ab 60 Jahren und für Kinder von 3 bis 11 Jahren. Dafür siehst du ein leeres Stadion, mit Beschilderung auf Portugiesisch und Englisch. Wenn ich dich begleite, kommt der Privattransfer ab deinem Hotel dazu, die Erklärung auf Deutsch und, an Spieltagen, das Ticket in der Cadeira Cativa. Was das für dein Datum und deine Gruppengröße kostet, sage ich dir auf Anfrage.",
    },
    {
        q: "Wie komme ich an Tickets für ein Spiel im Maracanã?",
        a: "Der offizielle Verkauf läuft über die Club-Apps von Flamengo und Fluminense, auf Portugiesisch und meist mit brasilianischer Steuernummer. Für Besucher ist das der schwierigste Teil. Ich übernehme das komplett: Ich buche Plätze in der Cadeira Cativa, dem nummerierten und überdachten Bereich, hole dich am Hotel ab und bringe dich nach dem Spiel wieder zurück. Kauf niemals ein Ticket vor dem Stadion, das ist die häufigste Falle in Rio.",
    },
    {
        q: "Was ist eine Cadeira Cativa im Maracanã?",
        a: "Das ist der ruhigere Sitzplatzbereich an der Seitenlinie, nummeriert, überdacht und getrennt von den Fankurven. Du hast deinen festen Platz, siehst das ganze Spielfeld und bist trotzdem mitten in der Atmosphäre. Genau dort buche ich, wenn ich mit Gästen zu einem Spiel gehe. In den Kurven singt es lauter, aber dort willst du als Besucher beim ersten Mal nicht sitzen.",
    },
    {
        q: "Kann man das Maracanã auch ohne Spiel besichtigen?",
        a: "Ja. Der Stadionrundgang läuft täglich von 9 bis 17 Uhr, letzter Einlass um 16:30 Uhr. Du gehst durch die Sammlung, die Umkleidekabine, die Mixed Zone, an den Spielertunnel und bis an den Rasen, das dauert etwa eine Stunde. An Spieltagen ist der Rundgang verkürzt oder fällt aus. Bei mir ist er Teil der Fußball Tour, zusammen mit dem Museu do Flamengo.",
    },
    {
        q: "Wie kommt man sicher zum Maracanã?",
        a: "Mit der Metro Linie 2 fährst du direkt bis zur Station Maracanã, der Ausgang führt auf die Rampe zum Stadion. Bei Tageslicht und ohne Handy in der offenen Hand funktioniert das gut. Der Punkt ist der Rückweg: Das Stadion liegt in der Zona Norte, nicht in der Zona Sul, wo du wohnst, und nach einem Abendspiel drängen Zehntausende Menschen gleichzeitig in dieselbe Metro. Deshalb ist der Transfer hin und zurück bei mir immer dabei.",
    },
    {
        q: "Ist ein Fußballspiel im Maracanã für Touristen sicher?",
        a: "Ja, mit den richtigen Entscheidungen. Wir sitzen in der Cadeira Cativa statt in der Fankurve, kommen früh an und gehen zusammen wieder raus. Du trägst kein Trikot der Gastmannschaft und lässt Kamera und Schmuck im Hotel. So ist ein Spiel in Rio eines der intensivsten Erlebnisse, die du hier haben kannst, und keine riskante Sache.",
    },
    {
        q: "Wie viele Zuschauer passen ins Maracanã?",
        a: "Heute fasst das Stadion 78.838 Zuschauer, alle auf Sitzplätzen. Beim WM-Finale 1950 zwischen Brasilien und Uruguay waren offiziell 199.854 Menschen im Stadion, mit Stehplätzen, es waren wahrscheinlich über 200.000. Dieser Zuschauerrekord steht bis heute.",
    },
    {
        q: "Wann spielen Flamengo und Fluminense im Maracanã?",
        a: "Beide Clubs tragen ihre Heimspiele hier aus, deshalb gibt es fast jede Woche Fußball. Das größte Spiel ist der Fla-Flu, das Derby der beiden. Die Termine stehen meist erst zwei bis drei Wochen vorher fest. Schreib mir dein Reisedatum, dann prüfe ich den Spielplan und sage dir, ob in deinem Zeitraum ein Spiel läuft.",
    },
    {
        q: "Welche Spiele der Frauen-WM 2027 finden im Maracanã statt?",
        a: "Die FIFA hat den Spielplan im August 2026 veröffentlicht: Das Eröffnungsspiel am 24. Juni 2027 und das Finale am 25. Juli 2027 finden beide im Maracanã statt, dazu ein Halbfinale und ein Viertelfinale. Damit ist das Maracanã erst das dritte Stadion der Welt, in dem sowohl ein Männer- als auch ein Frauen-WM-Finale gespielt wird.",
    },
];


const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((item) => ({
        "@type": "Question",
        name: item.q,
        acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
};

export default function MaracanaPage() {
    return (
        <>
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(videoJsonLd) }}
        />
        <div className="flex flex-col min-h-screen bg-rio-sand selection:bg-rio-green selection:text-white font-sans">
            <NavbarServer />

            <main className="flex-grow">
                {/* ── HERO ─────────────────────────────────────────── */}
                <section className="relative pt-32 pb-28 lg:pt-44 lg:pb-36 overflow-hidden">
                    {/* Photo background */}
                    {/* next/image em vez de background-image de CSS: o `priority` faz o
                        Next emitir um <link rel="preload"> no <head>, então o navegador
                        começa a baixar o hero antes de processar o resto da página. Esta
                        é a imagem LCP. As outras seis páginas de Sehenswürdigkeiten ainda
                        usam background-image; ao migrá-las, este é o padrão a seguir. */}
                    <div className="absolute inset-0 z-0">
                        <Image
                            src="/images/maracana-bg.webp"
                            alt="Das Maracanã-Stadion aus der Luft, umgeben von der Zona Norte von Rio de Janeiro"
                            fill
                            priority
                            fetchPriority="high"
                            quality={90}
                            sizes="100vw"
                            className="object-cover object-center"
                        />
                    </div>
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
                                    aria-label="Startseite"
                                >
                                    <Home className="w-4 h-4" />
                                </Link>
                                <ChevronRight className="w-4 h-4 mx-2 text-white/25 shrink-0" />
                                <Link
                                    href="/rio-guide/sehenswuerdigkeiten"
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
                                    Maracanã
                                </span>
                            </nav>

                            {/* H1 */}
                            <div className="max-w-4xl">
                                <h1 className="text-5xl lg:text-[clamp(40px,5vw,72px)] font-heading font-black text-white leading-[1.08] tracking-tight mb-6">
                                    Maracanã
                                </h1>

                                {/* Tagline */}
                                <p className="text-xl lg:text-2xl text-white/70 font-medium leading-snug max-w-2xl mb-10">
                                    Der Tempel des Fußballs, in dem Deutschland 2014 Weltmeister wurde
                                </p>

                                {/* CTA Buttons */}
                                <div className="flex flex-col sm:flex-row gap-4">
                                    {/* CTA primário */}
                                    <Link
                                        href="/touren/fussball"
                                        className="inline-flex items-center justify-center gap-2.5 px-8 py-4 bg-[#22a262] text-white rounded-full font-bold text-base hover:bg-[#1a8a52] hover:scale-[1.02] transition-all shadow-xl shadow-[#22a262]/25"
                                    >
                                        Fußball Tour anfragen
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

                            {/* Card 1 — Dauer */}
                            <FadeIn delay={0} direction="up" className="bg-white border border-gray-100 rounded-2xl p-5 flex flex-col gap-3 hover:border-rio-green/30 hover:shadow-sm transition-all duration-300">
                                <span className="text-2xl" role="img" aria-label="Uhr">⏱️</span>
                                <div>
                                    <p className="text-[11px] font-bold tracking-widest uppercase text-gray-400 mb-1">Dauer</p>
                                    <p className="text-gray-900 font-semibold text-[15px] leading-snug">Stadiontour ca. 1 Stunde</p>
                                </div>
                            </FadeIn>

                            {/* Card 2 — Eintritt */}
                            <FadeIn delay={0.05} direction="up" className="bg-white border border-gray-100 rounded-2xl p-5 flex flex-col gap-3 hover:border-rio-green/30 hover:shadow-sm transition-all duration-300">
                                <span className="text-2xl" role="img" aria-label="Ticket">🎟️</span>
                                <div>
                                    <p className="text-[11px] font-bold tracking-widest uppercase text-gray-400 mb-1">Stadionrundgang</p>
                                    <p className="text-gray-900 font-semibold text-[15px] leading-snug">R$ 94 <span className="text-gray-400 font-normal">(ermäßigt R$ 47), nur der Rundgang</span></p>
                                </div>
                            </FadeIn>

                            {/* Card 3 — Öffnungszeiten */}
                            <FadeIn delay={0.1} direction="up" className="bg-white border border-gray-100 rounded-2xl p-5 flex flex-col gap-3 hover:border-rio-green/30 hover:shadow-sm transition-all duration-300">
                                <span className="text-2xl" role="img" aria-label="Uhr">🕗</span>
                                <div>
                                    <p className="text-[11px] font-bold tracking-widest uppercase text-gray-400 mb-1">Öffnungszeiten</p>
                                    <p className="text-gray-900 font-semibold text-[15px] leading-snug">Täglich 09:00–17:00 Uhr <span className="text-gray-400 font-normal">(letzter Einlass 16:30)</span></p>
                                </div>
                            </FadeIn>

                            {/* Card 4 — Kapazität */}
                            <FadeIn delay={0.15} direction="up" className="bg-white border border-gray-100 rounded-2xl p-5 flex flex-col gap-3 hover:border-rio-green/30 hover:shadow-sm transition-all duration-300">
                                <span className="text-2xl" role="img" aria-label="Stadion">🏟️</span>
                                <div>
                                    <p className="text-[11px] font-bold tracking-widest uppercase text-gray-400 mb-1">Kapazität</p>
                                    <p className="text-gray-900 font-semibold text-[15px] leading-snug">78.838 Plätze</p>
                                </div>
                            </FadeIn>

                            {/* Card 5 — Anfahrt */}
                            <FadeIn delay={0.2} direction="up" className="bg-white border border-gray-100 rounded-2xl p-5 flex flex-col gap-3 hover:border-rio-green/30 hover:shadow-sm transition-all duration-300">
                                <span className="text-2xl" role="img" aria-label="Metro">🚇</span>
                                <div>
                                    <p className="text-[11px] font-bold tracking-widest uppercase text-gray-400 mb-1">Anfahrt</p>
                                    <p className="text-gray-900 font-semibold text-[15px] leading-snug">Metro Linie 2, Station Maracanã</p>
                                </div>
                            </FadeIn>

                            {/* Card 6 — Mit Will */}
                            <FadeIn delay={0.25} direction="up" className="bg-white border border-rio-green/20 rounded-2xl p-5 flex flex-col gap-3 hover:border-rio-green/50 hover:shadow-sm transition-all duration-300">
                                <span className="text-2xl" role="img" aria-label="Auto">🚗</span>
                                <div>
                                    <p className="text-[11px] font-bold tracking-widest uppercase text-rio-green mb-1">Spieltag mit Will</p>
                                    <p className="text-gray-900 font-semibold text-[15px] leading-snug">Transfer hin und zurück, Sitzplatz in der Cadeira Cativa</p>
                                </div>
                            </FadeIn>

                            {/* Card 7 — Wann hin? */}
                            <FadeIn delay={0.3} direction="up" className="bg-white border border-gray-100 rounded-2xl p-5 flex flex-col gap-3 hover:border-rio-green/30 hover:shadow-sm transition-all duration-300 col-span-2 lg:col-span-2">
                                <span className="text-2xl" role="img" aria-label="Menschenmenge">👥</span>
                                <div>
                                    <p className="text-[11px] font-bold tracking-widest uppercase text-gray-400 mb-1">Wann hin?</p>
                                    <p className="text-gray-900 font-semibold text-[15px] leading-snug">Der Rundgang lohnt sich vormittags an einem spielfreien Tag. Wer die Wahl hat, kommt zu einem echten Spiel</p>
                                </div>
                            </FadeIn>

                            {/* Card 8 — Schwierigkeit */}
                            <FadeIn delay={0.35} direction="up" className="bg-white border border-gray-100 rounded-2xl p-5 flex flex-col gap-3 hover:border-rio-green/30 hover:shadow-sm transition-all duration-300">
                                <span className="text-2xl" role="img" aria-label="Stern">🌟</span>
                                <div>
                                    <p className="text-[11px] font-bold tracking-widest uppercase text-gray-400 mb-1">Schwierigkeit</p>
                                    <p className="text-gray-900 font-semibold text-[15px] leading-snug">Leicht</p>
                                </div>
                            </FadeIn>

                        </div>

                        {/* ── Frauen-WM 2027 — Card destacado ─────────── */}
                        <FadeIn direction="up" className="mt-6">
                            <div className="relative bg-[#0d1f15] rounded-2xl overflow-hidden border border-amber-500/40 shadow-lg shadow-black/10">

                                {/* Glow accent */}
                                <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-amber-500/8 blur-3xl pointer-events-none" />

                                <div className="relative p-7 lg:p-8">
                                    {/* Icon + label */}
                                    <div className="flex items-center gap-3 mb-5">
                                        <span className="text-3xl" role="img" aria-label="Pokal">🏆</span>
                                        <span className="text-xs font-bold tracking-widest uppercase text-amber-400">
                                            Frauen-WM 2027
                                        </span>
                                    </div>

                                    {/* Título */}
                                    <h3 className="text-xl lg:text-2xl font-heading font-bold text-white mb-4 leading-tight">
                                        Eröffnungsspiel und Finale finden hier statt
                                    </h3>

                                    {/* Texto */}
                                    <p className="text-white/75 text-base leading-relaxed mb-6">
                                        Die FIFA hat den Spielplan im August 2026 veröffentlicht. Das
                                        Eröffnungsspiel der Frauen-Weltmeisterschaft steigt am 24. Juni 2027
                                        im Maracanã, das Finale am 25. Juli 2027 ebenfalls. Dazu kommen ein
                                        Viertel- und ein Halbfinale. Das Maracanã ist damit erst das dritte
                                        Stadion der Welt, in dem ein Männer- und ein Frauen-WM-Finale
                                        gespielt werden.
                                    </p>

                                    <Link
                                        href="/frauen-wm-2027"
                                        className="inline-flex items-center gap-2 text-sm font-bold text-amber-400 hover:text-amber-300 transition-colors"
                                    >
                                        Alles zur Frauen-WM 2027 in Rio
                                        <ArrowRight className="w-4 h-4" />
                                    </Link>
                                </div>
                            </div>
                        </FadeIn>

                    </div>
                </section>

                {/* ── SECÇÃO 3 — Texto Introdutório ───────────────── */}
                <section className="py-20 lg:py-28 bg-white">
                    <div className="max-w-7xl mx-auto px-5 lg:px-8">
                        <FadeIn direction="up">
                            <div className="max-w-[800px] mx-auto space-y-7 text-left">

                                {/* Parágrafo 1 */}
                                <p className="text-xl lg:text-2xl font-semibold text-gray-900 leading-snug">
                                    Für einen Carioca ist das Maracanã kein Stadion, sondern ein Ort, an dem
                                    man aufwächst. Mein erstes Spiel habe ich als Kind von der Rampe aus
                                    gesehen, zwischen Trommeln und Rauch. Wenn ich heute deutsche Gäste
                                    hierher bringe, merke ich immer wieder: Der Moment, in dem man aus dem
                                    Tunnel kommt und das Oval sich öffnet, funktioniert bei jedem.
                                </p>

                                {/* Parágrafo 2 */}
                                <p className="text-lg text-gray-600 leading-relaxed">
                                    Es gibt zwei völlig verschiedene Arten, das Maracanã zu erleben. Der
                                    Stadionrundgang läuft täglich und führt dich durch Umkleidekabine,
                                    Pressekonferenzraum, Spielertunnel und bis an den Rasen. Er dauert etwa
                                    eine Stunde, die Beschilderung ist allerdings auf Portugiesisch und
                                    Englisch, und was du siehst, ist ein leeres Stadion. Die zweite Art ist
                                    ein echtes Spiel, mit Zehntausenden singenden Menschen um dich herum.
                                    Wenn dein Reisedatum es zulässt, ist das die Variante, die du dein
                                    Leben lang erzählst.
                                </p>

                                {/* Parágrafo 3 */}
                                <p className="text-lg text-gray-600 leading-relaxed pt-2 border-t border-gray-100">
                                    Für deutsche Besucher hat dieser Ort eine besondere Bedeutung. Am
                                    13. Juli 2014 wurde Deutschland genau hier Weltmeister, durch das Tor von
                                    Mario Götze in der Verlängerung gegen Argentinien. Ich stehe mit meinen
                                    Gästen oft an der Stelle, von der aus die deutschen Fans damals gefeiert
                                    haben, und erzähle, wie diese Nacht in Rio aussah. Das ist die Art
                                    Geschichte, die auf keiner Infotafel steht.
                                </p>

                            </div>
                        </FadeIn>
                    </div>
                </section>

                {/* ── Foto 01 ─────────────────────────────────────── */}
                <section className="pb-16 lg:pb-20 bg-white">
                    <div className="max-w-7xl mx-auto px-5 lg:px-8">
                        <FadeIn direction="up">
                            <div className="max-w-[800px] mx-auto">
                                <figure>
                                    <img
                                        src="/images/maracana-rio-de-janeiro.webp"
                                        alt="Luftaufnahme des Maracanã-Stadions in Rio de Janeiro"
                                        className="w-full rounded-2xl shadow-md"
                                    />
                                    <figcaption className="mt-3 text-sm text-gray-400 text-center">
                                        Das Maracanã liegt mitten in der Zona Norte, umgeben von Wohnhäusern und der Metro-Station gleichen Namens.
                                    </figcaption>
                                </figure>
                            </div>
                        </FadeIn>
                    </div>
                </section>

                {/* ── SECÇÃO 3b — Mit Will erleben ─────────────────── */}
                {/* Esta seção existe porque a versão anterior da página só dava a
                    informação pública (R$ 94, metrô, 1 hora) e o pax concluía que não
                    precisava de guia. Aqui os dois produtos reais aparecem: a Fußball
                    Tour e o pacote de dia de jogo. Preço não vai na página, segue a
                    convenção das outras /touren/*: o valor vem na proposta. */}
                <section className="py-20 lg:py-28 bg-white border-t border-gray-100">
                    <div className="max-w-7xl mx-auto px-5 lg:px-8">
                        <FadeIn direction="up" className="mb-10">
                            <div className="max-w-[800px] mx-auto">
                                <h2 className="text-3xl lg:text-4xl font-heading font-bold text-gray-900 leading-tight">
                                    Das Maracanã{" "}
                                    <span className="text-rio-green">mit Will erleben</span>
                                </h2>
                                <p className="text-gray-500 mt-3 text-lg leading-relaxed">
                                    Den Rundgang kannst du selbst buchen. Die beiden Varianten hier sind
                                    das, was ich anbiete, und der Unterschied ist nicht das Ticket, sondern
                                    alles drumherum.
                                </p>
                            </div>
                        </FadeIn>

                        <div className="max-w-[800px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">

                            {/* Variante 1 — Fußball Tour */}
                            <FadeIn delay={0} direction="up" className="flex">
                                <div className="bg-gray-50 rounded-2xl border border-gray-100 p-7 flex flex-col w-full">
                                    <span className="text-3xl mb-4" role="img" aria-label="Stadion">🏟️</span>
                                    <h3 className="text-xl font-bold font-heading text-gray-900 mb-3">
                                        Fußball Tour
                                    </h3>
                                    <p className="text-gray-600 leading-relaxed mb-5 flex-grow">
                                        Der Klassiker an spielfreien Tagen: Stadionrundgang im Maracanã plus
                                        Museu do Flamengo, mit Privattransfer und allem auf Deutsch erklärt.
                                        Rechne mit 3 bis 4 Stunden.
                                    </p>
                                    <ul className="space-y-2.5 mb-6">
                                        <li className="flex gap-2.5 text-[15px] text-gray-600">
                                            <span className="text-rio-green font-bold shrink-0">✓</span>
                                            Privattransfer ab deinem Hotel in der Zona Sul
                                        </li>
                                        <li className="flex gap-2.5 text-[15px] text-gray-600">
                                            <span className="text-rio-green font-bold shrink-0">✓</span>
                                            Rundgang und Museum, erklärt von einem Carioca
                                        </li>
                                        <li className="flex gap-2.5 text-[15px] text-gray-600">
                                            <span className="text-rio-green font-bold shrink-0">✓</span>
                                            Museu do Flamengo in Gávea als zweite Station
                                        </li>
                                    </ul>
                                    <Link
                                        href="/touren/fussball"
                                        className="inline-flex items-center gap-1.5 text-sm font-bold text-rio-green hover:text-rio-yellow transition-colors mt-auto"
                                    >
                                        Zur Fußball Tour
                                        <ArrowRight className="w-4 h-4" />
                                    </Link>
                                </div>
                            </FadeIn>

                            {/* Variante 2 — Spieltag-Paket */}
                            <FadeIn delay={0.08} direction="up" className="flex">
                                <div className="relative bg-[#0d1f15] rounded-2xl border-l-4 border-rio-yellow p-7 flex flex-col w-full overflow-hidden">
                                    <div className="absolute top-0 right-0 w-56 h-56 rounded-full bg-[#22a262]/10 blur-3xl pointer-events-none" />
                                    <div className="relative flex flex-col flex-grow">
                                        <span className="text-3xl mb-4" role="img" aria-label="Ticket">🎫</span>
                                        <h3 className="text-xl font-bold font-heading text-white mb-3">
                                            Spieltag-Paket
                                        </h3>
                                        <p className="text-white/70 leading-relaxed mb-5 flex-grow">
                                            Wenn während deiner Reise gespielt wird: Ich hole dich am Hotel ab,
                                            wir sitzen in der Cadeira Cativa, und nach dem Abpfiff fahren wir
                                            zusammen zurück, ohne im Gedränge zur Metro zu stehen.
                                        </p>
                                        <ul className="space-y-2.5 mb-6">
                                            <li className="flex gap-2.5 text-[15px] text-white/70">
                                                <span className="text-rio-yellow font-bold shrink-0">✓</span>
                                                Transfer hin und zurück, Hotel bis Stadion
                                            </li>
                                            <li className="flex gap-2.5 text-[15px] text-white/70">
                                                <span className="text-rio-yellow font-bold shrink-0">✓</span>
                                                Ticket in der Cadeira Cativa, nummeriert und überdacht
                                            </li>
                                            <li className="flex gap-2.5 text-[15px] text-white/70">
                                                <span className="text-rio-yellow font-bold shrink-0">✓</span>
                                                Begleitung im Stadion, auf Deutsch
                                            </li>
                                        </ul>
                                        <Link
                                            href="/anfrage?von=site&tour=fussball"
                                            className="inline-flex items-center gap-1.5 text-sm font-bold text-rio-yellow hover:text-yellow-300 transition-colors mt-auto"
                                        >
                                            Spieltermin anfragen
                                            <ArrowRight className="w-4 h-4" />
                                        </Link>
                                    </div>
                                </div>
                            </FadeIn>

                        </div>

                        <FadeIn direction="up">
                            <p className="max-w-[800px] mx-auto mt-8 text-sm text-gray-400 leading-relaxed">
                                Die Spieltermine von Flamengo und Fluminense stehen meist erst zwei bis drei
                                Wochen vorher fest. Schreib mir dein Reisedatum, dann sage ich dir, ob in
                                deinem Zeitraum gespielt wird, und nenne dir den Preis für dein Datum und
                                deine Gruppengröße.
                            </p>
                        </FadeIn>
                    </div>
                </section>

                {/* ── Foto 02 — a vista da Cadeira Cativa ──────────── */}
                {/* Fica logo depois dos dois cards de oferta de propósito: é a prova
                    visual do que o card do Spieltag-Paket promete. */}
                <section className="pb-20 lg:pb-28 bg-white">
                    <div className="max-w-7xl mx-auto px-5 lg:px-8">
                        <FadeIn direction="up">
                            <div className="max-w-[800px] mx-auto">
                                <figure>
                                    <Image
                                        src="/images/spiel-am-maracana-02.webp"
                                        alt="Blick von der Cadeira Cativa im Maracanã auf das Spielfeld und die gefüllten Ränge"
                                        width={1599}
                                        height={899}
                                        className="w-full h-auto rounded-2xl shadow-md"
                                        loading="lazy"
                                    />
                                    <figcaption className="mt-3 text-sm text-gray-400 text-center">
                                        So sitzt du in der Cadeira Cativa: das ganze Spielfeld im Blick, überdacht, und die Kurven weit genug weg.
                                    </figcaption>
                                </figure>
                            </div>
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

                                {/* P1 — O nome */}
                                <p className="text-lg text-gray-600 leading-relaxed">
                                    Offiziell heißt das Stadion „Estádio Jornalista Mário Filho&ldquo;, nach dem
                                    Sportjournalisten, der maßgeblich für den Bau gekämpft hat. Kein Mensch in
                                    Rio nennt es so. „Maracanã&ldquo; kommt vom gleichnamigen Fluss und Stadtviertel,
                                    und das Wort stammt aus dem Tupi und bezeichnet eine Papageienart.
                                </p>

                                {/* P2 — 1950 e o Maracanaço */}
                                <p className="text-lg text-gray-600 leading-relaxed">
                                    Gebaut wurde es ab 1948 für die WM 1950, eröffnet am 16. Juni 1950. Das
                                    entscheidende Spiel dieser WM ist bis heute die größte Wunde des
                                    brasilianischen Fußballs: Brasilien brauchte gegen Uruguay nur ein
                                    Unentschieden und verlor 1:2, vor offiziell 199.854 Zuschauern. In
                                    Brasilien heißt dieser Tag „Maracanaço&ldquo;, und der Zuschauerrekord steht
                                    bis heute.
                                </p>

                                {/* P3 — Pelé */}
                                <p className="text-lg text-gray-600 leading-relaxed">
                                    Am 19. November 1969 schoss Pelé hier sein tausendstes Tor, per Elfmeter
                                    für den FC Santos gegen Vasco da Gama. Das Spiel wurde danach minutenlang
                                    unterbrochen, weil Fotografen und Reporter auf den Rasen liefen. Bei der
                                    Stadiontour kommst du an der Stelle vorbei, an der dieses Tor fiel.
                                </p>

                                {/* Foto 02 */}
                                <figure className="my-2">
                                    <img
                                        src="/images/spiel-am-maracana.webp"
                                        alt="Flamengo-Fans mit Fahnen auf den Rängen des Maracanã"
                                        className="w-full rounded-2xl shadow-md"
                                    />
                                    <figcaption className="mt-3 mb-6 text-sm text-gray-400 text-center">
                                        Die Torcida von Flamengo im Maracanã. Fahnen, Trommeln und 90 Minuten Gesang, das ist der Unterschied zur leeren Stadiontour.
                                    </figcaption>
                                </figure>

                                {/* P4 — 2014 */}
                                <p className="text-lg text-gray-600 leading-relaxed">
                                    Für die WM 2014 wurde das Maracanã komplett umgebaut. Die Stehplätze
                                    verschwanden, ein neues Dach kam dazu, und die Kapazität sank von einst
                                    fast 200.000 auf heute 78.838 Sitzplätze. Am 13. Juli 2014 fand hier das
                                    Finale statt, Deutschland gegen Argentinien, 1:0 nach Verlängerung durch
                                    Mario Götze. Zwei Jahre später wurden im selben Stadion die Olympischen
                                    Spiele 2016 eröffnet und beendet.
                                </p>

                                {/* P5 — Fla-Flu */}
                                <p className="text-lg text-gray-600 leading-relaxed">
                                    Heute ist das Maracanã die Heimat von Flamengo und Fluminense, zwei Clubs
                                    aus derselben Stadt, die sich seit 1912 gegenüberstehen. Flamengo hat die
                                    größte Fanbasis Brasiliens, geschätzt über 40 Millionen Menschen. Wenn
                                    beide gegeneinander spielen, heißt das Fla-Flu, und die Stimmung im
                                    Stadion ist auch dann besonders, wenn dir beide Vereine vorher nichts
                                    gesagt haben.
                                </p>

                                {/* P6 — WM 2027 */}
                                <p className="text-lg text-gray-600 leading-relaxed">
                                    Und die Geschichte geht weiter. Vom 24. Juni bis 25. Juli 2027 findet die
                                    FIFA Frauen-Weltmeisterschaft in Brasilien statt, mit 32 Mannschaften in
                                    acht Städten. Eröffnungsspiel und Finale steigen im Maracanã, dazu je
                                    ein Viertel- und ein Halbfinale. Für das Stadion ist es die dritte
                                    Weltmeisterschaft nach 1950 und 2014.
                                </p>

                                {/* P7 — ponte para a seção da Copa. Link em texto corrido, com
                                    âncora diferente da do card âmbar lá em cima, para as duas
                                    ligações não lerem como repetição. */}
                                <p className="text-lg text-gray-600 leading-relaxed">
                                    Die deutsche Mannschaft ist qualifiziert. In welchen Städten sie spielt,
                                    entscheidet die Auslosung Ende 2026. Wenn du planst, im Sommer 2027 hier
                                    zu sein, findest du Termine, Spielorte und alles, was du für die Reise
                                    wissen musst, auf meiner Seite zur{" "}
                                    <Link
                                        href="/frauen-wm-2027"
                                        className="text-rio-green font-semibold underline underline-offset-4 hover:text-rio-yellow transition-colors"
                                    >
                                        Frauen-WM 2027 in Brasilien
                                    </Link>
                                    . Ich aktualisiere sie laufend, sobald die FIFA neue Details bekannt gibt.
                                </p>

                            </div>
                        </FadeIn>
                    </div>
                </section>

                {/* ── Infografik Maracanã ──────────────────────────── */}
                <section className="pb-16 lg:pb-20 bg-gray-50">
                    <div className="max-w-7xl mx-auto px-5 lg:px-8">
                        <FadeIn direction="up">
                            <div className="max-w-[800px] mx-auto">
                                <figure>
                                    <div className="rounded-2xl shadow-md">
                                        <div className="rounded-2xl overflow-hidden border border-gray-100">
                                            <Image
                                                src="/images/rio-guide/sehenswuerdigkeiten/infografik-maracana-01.webp"
                                                alt="Infografik: Maracanã, Zahlen, Geschichte und Besuch auf einen Blick"
                                                width={960}
                                                height={1685}
                                                className="w-full h-auto block"
                                                loading="lazy"
                                            />
                                        </div>
                                    </div>
                                    <figcaption className="mt-3 text-sm text-gray-400 text-center">
                                        Maracanã auf einen Blick: Kapazität, die großen Momente, Öffnungszeiten und Anfahrt zusammengefasst.
                                    </figcaption>
                                </figure>
                            </div>
                        </FadeIn>
                    </div>
                </section>

                {/* ── SECÇÃO 5 — Dica do Will (Insider-Tipp card) ─── */}
                <section className="pt-16 lg:pt-20 pb-10 lg:pb-12 bg-white border-t border-gray-100">
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

                                        {/* Título */}
                                        <h3 className="text-2xl lg:text-3xl font-heading font-bold text-white mb-5 leading-tight">
                                            Die Tour ist gut. Ein Spiel ist unvergesslich.
                                        </h3>

                                        {/* Texto */}
                                        <p className="text-white/75 text-lg leading-relaxed">
                                            Wenn in deinem Reisezeitraum ein Spiel läuft, nimm das Spiel. Ein
                                            leeres Stadion erklärt dir die Geschichte, ein volles erklärt dir
                                            das Land. Ich buche die Cadeira Cativa statt der Fankurve, wir
                                            kommen eine Stunde vorher an und fahren nach dem Abpfiff zusammen
                                            zurück, statt mit Zehntausenden gleichzeitig zur Metro zu laufen.
                                            Trikot der Gastmannschaft bleibt im Hotel, Kamera auch. So
                                            bekommst du die volle Intensität ohne die Situationen, in die
                                            Touristen hier sonst geraten.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </FadeIn>
                    </div>
                </section>

                {/* ── Vídeo do YouTube ─────────────────────────────── */}
                {/* Vem logo depois do Insider-Tipp: o card diz que um jogo de verdade
                    é outra coisa, e o vídeo mostra. youtube-nocookie porque o público
                    é alemão e o domínio padrão grava cookie antes do play. */}
                <section className="pb-20 lg:pb-24 bg-white">
                    <div className="max-w-7xl mx-auto px-5 lg:px-8">
                        <FadeIn direction="up">
                            <div className="max-w-[800px] mx-auto">
                                <div className="relative w-full overflow-hidden rounded-2xl shadow-md bg-black" style={{ aspectRatio: "16 / 9" }}>
                                    <iframe
                                        src="https://www.youtube-nocookie.com/embed/YW1a2hA6sQk?rel=0"
                                        title="So klingt ein Spiel im Maracanã, Rio de Janeiro"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                        referrerPolicy="strict-origin-when-cross-origin"
                                        allowFullScreen
                                        loading="lazy"
                                        className="absolute inset-0 w-full h-full border-0"
                                    />
                                </div>
                                <p className="mt-3 text-sm text-gray-400 text-center">
                                    Der Einlauf der Mannschaft, gefilmt von der Cadeira Cativa. Ton an.
                                </p>
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
                                Zwei Orte, die sich gut mit einem Maracanã-Besuch verbinden lassen.
                            </p>
                        </FadeIn>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl">

                            {/* Card 1 — Christus Erlöser */}
                            <FadeIn delay={0} direction="up" className="flex">
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
                                            Klassiker
                                        </span>
                                    </div>
                                    <div className="p-5 flex flex-col flex-grow">
                                        <h3 className="text-lg font-bold font-heading text-gray-900 mb-2">Christus Erlöser</h3>
                                        <p className="text-gray-500 text-sm leading-relaxed flex-grow">
                                            Vom Corcovado siehst du das Maracanã unten in der Zona Norte liegen, beide passen gut in einen Vormittag.
                                        </p>
                                        <div className="flex items-center gap-1.5 text-sm font-bold text-rio-green group-hover:text-rio-yellow transition-colors mt-4">
                                            Mehr erfahren <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                                        </div>
                                    </div>
                                </Link>
                            </FadeIn>

                            {/* Card 2 — Zuckerhut */}
                            <FadeIn delay={0.08} direction="up" className="flex">
                                <Link
                                    href="/rio-guide/sehenswuerdigkeiten/zuckerhut"
                                    className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col overflow-hidden w-full"
                                >
                                    <div className="relative h-48 overflow-hidden">
                                        <Image
                                            src="/images/zuckerhut-pao-de-acucar-bg.webp"
                                            alt="Der Zuckerhut über der Guanabara-Bucht in Rio de Janeiro"
                                            fill
                                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                        <span className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2.5 py-0.5 rounded-full text-[9px] font-bold text-rio-green uppercase tracking-wider">
                                            Klassiker
                                        </span>
                                    </div>
                                    <div className="p-5 flex flex-col flex-grow">
                                        <h3 className="text-lg font-bold font-heading text-gray-900 mb-2">Zuckerhut</h3>
                                        <p className="text-gray-500 text-sm leading-relaxed flex-grow">
                                            Der beste Sonnenuntergang der Stadt, ideal für den Nachmittag vor einem Abendspiel.
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

                {/* ── FAQ ─────────────────────────────────────────── */}
                <section className="py-20 lg:py-24 bg-white border-t border-gray-100">
                    <div className="max-w-7xl mx-auto px-5 lg:px-8">
                        <FadeIn direction="up" className="mb-10">
                            <div className="max-w-[800px] mx-auto">
                                <h2 className="text-3xl lg:text-4xl font-heading font-bold text-gray-900 leading-tight">
                                    Häufige Fragen zum Maracanã
                                </h2>
                            </div>
                        </FadeIn>
                        <FadeIn direction="up">
                            <div className="max-w-[800px] mx-auto">
                                <Faq items={faqItems} />
                            </div>
                        </FadeIn>
                    </div>
                </section>

                {/* ── SECÇÃO 7 — CTA Final ─────────────────────────── */}
                <section className="py-24 relative overflow-hidden bg-[#0d1f15] border-t-4 border-rio-yellow">
                    <div className="absolute inset-0 bg-[url('/images/rio-background.webp')] bg-cover bg-center mix-blend-overlay opacity-10" />
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-[#22a262]/10 blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/4" />
                    <div className="relative max-w-4xl mx-auto px-5 text-center">
                        <FadeIn direction="up">
                            <h2 className="text-3xl lg:text-5xl font-heading font-black text-white mb-6 leading-tight">
                                Das Maracanã{" "}
                                <br className="hidden sm:block" />
                                <span className="text-rio-yellow">mit deinem deutschsprachigen Tourguide erleben</span>
                            </h2>
                            <p className="text-lg text-white/70 mb-10 max-w-2xl mx-auto leading-relaxed">
                                Stadionrundgang, Museu do Flamengo oder ein Spiel in der Cadeira Cativa:
                                Ich kümmere mich um Tickets und Transfer und erkläre dir alles auf Deutsch,
                                als Carioca, der hier groß geworden ist.
                            </p>
                            <div className="flex flex-col sm:flex-row justify-center gap-4">
                                <Link
                                    href="/touren/fussball"
                                    className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-rio-yellow text-gray-900 rounded-full font-bold text-lg hover:bg-yellow-400 hover:scale-[1.02] transition-all shadow-xl shadow-rio-yellow/20"
                                >
                                    <Phone className="w-5 h-5" />
                                    Fußball Tour ansehen
                                </Link>
                                {/* Mesmo padrão das outras 6 páginas de SEO: quem chega aqui pesquisou
                                    o ponto turístico, não a marca. O pedido vai pra Anfrage já com
                                    tour=fussball, o passeio que cobre este ponto. */}
                                <Link
                                    href="/anfrage?von=site&tour=fussball"
                                    className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-md border border-white/30 text-white rounded-full font-medium text-lg hover:bg-white/20 transition-all"
                                >
                                    Diese Sehenswürdigkeit anfragen
                                </Link>
                            </div>
                        </FadeIn>
                    </div>
                </section>

                {/* ── SECÇÃO 8 — Andere Touren ─────────────────────── */}
                <AndereTouren currentSlug="__maracana__" />

            </main>

            <FooterServer />
        </div>
        </>
    );
}

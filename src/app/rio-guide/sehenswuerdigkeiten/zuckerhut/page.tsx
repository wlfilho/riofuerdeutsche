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
        absolute: "Zuckerhut Rio de Janeiro (Pão de Açúcar): Tickets & Tipps | Rio für Deutsche",
    },
    description:
        "Alles über den Zuckerhut in Rio: Tickets, beste Reisezeit, Insider-Tipps vom Carioca. Sugarloaf Mountain Rio — so erlebst du ihn richtig. Auf Deutsch, mit lokalem Wissen.",
    openGraph: {
        title: "Zuckerhut Rio de Janeiro — Tipps vom Carioca",
        description:
            "Tickets, Anfahrt, Insider-Tipps und Geschichte — alles was du über den Zuckerhut wissen musst. Auf Deutsch, von einem Carioca.",
        url: "https://riofuerdeutsche.de/rio-guide/sehenswuerdigkeiten/zuckerhut",
    },
    alternates: {
        canonical: "https://riofuerdeutsche.de/rio-guide/sehenswuerdigkeiten/zuckerhut",
    },
};

const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TouristAttraction",
    name: "Zuckerhut",
    description:
        "Der Zuckerhut (Pão de Açúcar) in Rio de Janeiro — 396 Meter hoch, erreichbar per Seilbahn in zwei Etappen, mit spektakulärem Blick auf die Guanabara-Bucht und den Sonnenuntergang.",
    url: "https://riofuerdeutsche.de/rio-guide/sehenswuerdigkeiten/zuckerhut",
    image: "https://riofuerdeutsche.de/images/zuckerhut-pao-de-acucar-bg.webp",
    touristType: "Cultural tourism",
    isAccessibleForFree: false,
    address: {
        "@type": "PostalAddress",
        streetAddress: "Praça General Tibúrcio, 85 — Urca",
        addressLocality: "Rio de Janeiro",
        addressRegion: "RJ",
        addressCountry: "BR",
    },
    geo: {
        "@type": "GeoCoordinates",
        latitude: -22.9489,
        longitude: -43.1545,
    },
    inLanguage: "de",
    knowsAbout: ["Zuckerhut", "Pão de Açúcar", "Seilbahn", "Rio de Janeiro", "Urca"],
};

const faqItems = [
    {
        q: "Was kostet die Seilbahn zum Zuckerhut?",
        a: "Das Ticket kostet rund 25 € (R$ 130 bis 150) für beide Seilbahn-Etappen. Mit Will ist der Transfer zur Talstation inklusive.",
    },
    {
        q: "Wann ist die beste Zeit für den Zuckerhut?",
        a: "Zum Sonnenuntergang zwischen 17 und 19 Uhr für die schönste Aussicht, oder früh morgens für kurze Wartezeiten. Klare Tage gibt es vor allem von Juni bis August.",
    },
    {
        q: "Wie funktioniert die Seilbahn?",
        a: "In zwei Etappen. Die erste bringt dich auf den Morro da Urca, die zweite auf den Gipfel in 396 Metern Höhe. Plane Zeit für den Zwischenstopp ein, die meisten Touristen lassen ihn aus.",
    },
    {
        q: "Lohnt sich der Morro da Urca als Zwischenstopp?",
        a: "Absolut. Dort hast du fast keine Menschenmassen, eine fantastische Aussicht und eine Bar mit Caipirinha und Blick auf den Corcovado. Bleib 30 bis 40 Minuten, bevor du weiter nach oben fährst.",
    },
    {
        q: "Fährt die Seilbahn bei schlechtem Wetter?",
        a: "Bei starkem Wind oder Gewitter wird der Betrieb gestoppt. An klaren Tagen ist die Sicht auf Niterói, die Zona Sul und den Corcovado unschlagbar.",
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

export default function ZuckerhutPage() {
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
        <div className="flex flex-col min-h-screen bg-rio-sand selection:bg-rio-green selection:text-white font-sans">
            <NavbarServer />

            <main className="flex-grow">
                {/* ── HERO ─────────────────────────────────────────── */}
                <section className="relative pt-32 pb-28 lg:pt-44 lg:pb-36 overflow-hidden">
                    {/* Photo background */}
                    <div
                        className="absolute inset-0 z-0 bg-cover bg-center"
                        style={{ backgroundImage: "url('/images/zuckerhut-pao-de-acucar-bg.webp')" }}
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
                                    Zuckerhut
                                </span>
                            </nav>

                            {/* H1 */}
                            <div className="max-w-4xl">
                                <h1 className="text-5xl lg:text-[clamp(40px,5vw,72px)] font-heading font-black text-white leading-[1.08] tracking-tight mb-6">
                                    Zuckerhut
                                </h1>

                                {/* Tagline */}
                                <p className="text-xl lg:text-2xl text-white/70 font-medium leading-snug max-w-2xl mb-10">
                                    Zwei Seilbahnen, 396 Meter — und der schönste Sonnenuntergang Rios
                                </p>

                                {/* CTA Buttons */}
                                <div className="flex flex-col sm:flex-row gap-4">
                                    {/* CTA primário */}
                                    <Link
                                        href="/touren/klassiker"
                                        className="inline-flex items-center justify-center gap-2.5 px-8 py-4 bg-[#22a262] text-white rounded-full font-bold text-base hover:bg-[#1a8a52] hover:scale-[1.02] transition-all shadow-xl shadow-[#22a262]/25"
                                    >
                                        Klassiker Tour anfragen
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
                                    <p className="text-gray-900 font-semibold text-[15px] leading-snug">ca. 2,5 Stunden</p>
                                </div>
                            </FadeIn>

                            {/* Card 2 — Eintritt */}
                            <FadeIn delay={0.05} direction="up" className="bg-white border border-gray-100 rounded-2xl p-5 flex flex-col gap-3 hover:border-rio-green/30 hover:shadow-sm transition-all duration-300">
                                <span className="text-2xl" role="img" aria-label="Ticket">🎟️</span>
                                <div>
                                    <p className="text-[11px] font-bold tracking-widest uppercase text-gray-400 mb-1">Eintritt</p>
                                    <p className="text-gray-900 font-semibold text-[15px] leading-snug">ca. 25 € <span className="text-gray-400 font-normal">(R$ 130–150)</span></p>
                                </div>
                            </FadeIn>

                            {/* Card 3 — Öffnungszeiten */}
                            <FadeIn delay={0.1} direction="up" className="bg-white border border-gray-100 rounded-2xl p-5 flex flex-col gap-3 hover:border-rio-green/30 hover:shadow-sm transition-all duration-300">
                                <span className="text-2xl" role="img" aria-label="Uhr">🕗</span>
                                <div>
                                    <p className="text-[11px] font-bold tracking-widest uppercase text-gray-400 mb-1">Öffnungszeiten</p>
                                    <p className="text-gray-900 font-semibold text-[15px] leading-snug">Täglich 08:00–21:00 Uhr</p>
                                </div>
                            </FadeIn>

                            {/* Card 4 — Beste Zeit */}
                            <FadeIn delay={0.15} direction="up" className="bg-white border border-gray-100 rounded-2xl p-5 flex flex-col gap-3 hover:border-rio-green/30 hover:shadow-sm transition-all duration-300">
                                <span className="text-2xl" role="img" aria-label="Kalender">📅</span>
                                <div>
                                    <p className="text-[11px] font-bold tracking-widest uppercase text-gray-400 mb-1">Beste Zeit</p>
                                    <p className="text-gray-900 font-semibold text-[15px] leading-snug">Juni bis August</p>
                                </div>
                            </FadeIn>

                            {/* Card 5 — Zugang */}
                            <FadeIn delay={0.2} direction="up" className="bg-white border border-gray-100 rounded-2xl p-5 flex flex-col gap-3 hover:border-rio-green/30 hover:shadow-sm transition-all duration-300">
                                <span className="text-2xl" role="img" aria-label="Seilbahn">🚠</span>
                                <div>
                                    <p className="text-[11px] font-bold tracking-widest uppercase text-gray-400 mb-1">Zugang</p>
                                    <p className="text-gray-900 font-semibold text-[15px] leading-snug">Seilbahn in zwei Etappen</p>
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

                            {/* Card 7 — Wann hin? */}
                            <FadeIn delay={0.3} direction="up" className="bg-white border border-gray-100 rounded-2xl p-5 flex flex-col gap-3 hover:border-rio-green/30 hover:shadow-sm transition-all duration-300 col-span-2 lg:col-span-2">
                                <span className="text-2xl" role="img" aria-label="Menschenmenge">👥</span>
                                <div>
                                    <p className="text-[11px] font-bold tracking-widest uppercase text-gray-400 mb-1">Wann hin?</p>
                                    <p className="text-gray-900 font-semibold text-[15px] leading-snug">Sonnenuntergang (17–19 Uhr) für die schönste Aussicht — oder früh morgens für kurze Wartezeiten</p>
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

                        {/* ── Wetter & Sicht — Card destacado ─────────── */}
                        <FadeIn direction="up" className="mt-6">
                            <div className="relative bg-[#0d1f15] rounded-2xl overflow-hidden border border-amber-500/40 shadow-lg shadow-black/10">

                                {/* Glow accent */}
                                <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-amber-500/8 blur-3xl pointer-events-none" />

                                <div className="relative p-7 lg:p-8">
                                    {/* Icon + label */}
                                    <div className="flex items-center gap-3 mb-5">
                                        <span className="text-3xl" role="img" aria-label="Wetter">⛅</span>
                                        <span className="text-xs font-bold tracking-widest uppercase text-amber-400">
                                            Wetter &amp; Sicht
                                        </span>
                                    </div>

                                    {/* Título */}
                                    <h3 className="text-xl lg:text-2xl font-heading font-bold text-white mb-4 leading-tight">
                                        Das Wetter entscheidet alles
                                    </h3>

                                    {/* Texto */}
                                    <p className="text-white/75 text-base leading-relaxed">
                                        Die Seilbahn zum Zuckerhut hält bei starkem Wind oder Gewitter. An klaren
                                        Tagen — besonders Juni bis August — ist die Sicht auf Niterói, die Zona Sul
                                        und den Corcovado unschlagbar. Bei Sonnenuntergang sind die Warteschlangen
                                        länger, aber der Moment ist es absolut wert.
                                    </p>
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
                                    Der Zuckerhut ist für mich das stärkste Symbol von Rio — und das sage ich
                                    als Carioca, der hier aufgewachsen ist. Von oben siehst du alles auf einmal:
                                    die Bucht, die Strände, den Corcovado in der Ferne, und das Meer, das sich
                                    bis zum Horizont erstreckt. Es gibt keinen anderen Ort in Rio, der dir
                                    dieses Gefühl gibt.
                                </p>

                                {/* Parágrafo 2 */}
                                <p className="text-lg text-gray-600 leading-relaxed">
                                    Das Besondere am Zuckerhut sind die zwei Seilbahnen. Die erste bringt dich
                                    auf den Morro da Urca — ein Zwischenstopp, den die meisten Touristen
                                    ignorieren und damit einen der besten Aussichtspunkte Rios verpassen. Die
                                    zweite Seilbahn führt dann weiter auf den Gipfel, 396 Meter über dem
                                    Meeresspiegel.
                                </p>

                                {/* Parágrafo 3 */}
                                <p className="text-lg text-gray-600 leading-relaxed pt-2 border-t border-gray-100">
                                    Als die Seilbahn 1912 eröffnet wurde, war sie eine der ersten der Welt.
                                    Heute fahren die modernen Kabinen mit Panorama-Glaswänden — du siehst in
                                    alle Richtungen gleichzeitig. Der beste Moment: wenn die Sonne hinter dem
                                    Corcovado untergeht und der Christus golden leuchtet. Den solltest du
                                    nicht verpassen.
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
                                        src="/images/zuckerhut-pao-de-acucar-01.webp"
                                        alt="Blick auf den Zuckerhut von der Guanabara-Bucht aus"
                                        className="w-full rounded-2xl shadow-md"
                                    />
                                    <figcaption className="mt-3 text-sm text-gray-400 text-center">
                                        Der Zuckerhut erhebt sich 396 Meter über die Guanabara-Bucht — eines der bekanntesten Naturwahrzeichen der Welt.
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
                                    Der Name „Pão de Açúcar" — auf Deutsch wörtlich „Zuckerbrot" — kommt von
                                    der charakteristischen Form des Berges, die an die konischen Zuckerformen
                                    erinnert, die im kolonialen Brasilien zur Raffination verwendet wurden. Im
                                    Englischen heißt er „Sugarloaf Mountain" — ein Name, der weltweit bekannt ist.
                                </p>

                                {/* P2 — Primeira subida */}
                                <p className="text-lg text-gray-600 leading-relaxed">
                                    Die erste dokumentierte Besteigung des Zuckerhuts war 1817 — von der
                                    Engländerin Henrietta Carstairs. Zu Fuß, ohne Seilbahn, über die Felsen.
                                    Heute ist das auch noch möglich: Es gibt Kletterrouten für Erfahrene,
                                    die direkt auf den Gipfel führen.
                                </p>

                                {/* P3 — Teleférico */}
                                <p className="text-lg text-gray-600 leading-relaxed">
                                    Die Seilbahn wurde 1912 eingeweiht — eine der ersten der Welt überhaupt.
                                    Die heutigen Kabinen wurden 2008 erneuert und haben vollständige
                                    Panorama-Glaswände. Jede Kabine fasst bis zu 65 Personen. Die Fahrt von
                                    der Talstation bis zum Gipfel dauert insgesamt etwa 10 Minuten.
                                </p>

                                {/* Foto 02 */}
                                <figure className="my-2">
                                    <img
                                        src="/images/zuckerhut-pao-de-acucar-02.webp"
                                        alt="Aussicht vom Gipfel des Zuckerhuts auf Rio de Janeiro"
                                        className="w-full rounded-2xl shadow-md"
                                    />
                                    <figcaption className="mt-3 mb-6 text-sm text-gray-400 text-center">
                                        Blick vom Gipfel auf die Zona Sul: unten die Praia Vermelha am Fuß des Morro da Urca, dahinter der geschwungene Strand von Copacabana.
                                    </figcaption>
                                </figure>

                                {/* P4 — James Bond */}
                                <p className="text-lg text-gray-600 leading-relaxed">
                                    Für das deutsche Publikum gibt es eine besondere Verbindung: Im
                                    James-Bond-Film „Moonraker" von 1979 findet eine spektakuläre Kampfszene
                                    genau hier statt — auf der Seilbahn des Zuckerhuts. Der Film war ein
                                    großer Erfolg in Deutschland, und viele deutsche Besucher kennen den
                                    Zuckerhut genau deswegen.
                                </p>

                                {/* P5 — Vista do topo */}
                                <p className="text-lg text-gray-600 leading-relaxed">
                                    Vom Gipfel aus hat man einen 360°-Panoramablick: die Bucht von Guanabara,
                                    Niterói auf der anderen Seite, die Strände der Zona Sul, und der Christus
                                    Erlöser auf dem Corcovado. Bei guter Sicht kann man mit einem Fernglas
                                    sogar Flugzeuge beim Landen auf dem Flughafen Santos Dumont beobachten.
                                </p>

                                {/* P6 — Copa do Mundo */}
                                <p className="text-lg text-gray-600 leading-relaxed">
                                    Während der Fußball-Weltmeisterschaft 2014 wurde der Zuckerhut jeden
                                    Abend in den Farben der spielenden Nationalmannschaften beleuchtet —
                                    auch in Schwarz-Rot-Gold, als Deutschland spielte. Ein unvergesslicher
                                    Anblick für alle, die damals in Rio waren.
                                </p>

                            </div>
                        </FadeIn>
                    </div>
                </section>

                {/* ── Infografik Zuckerhut ─────────────────────────── */}
                <section className="pb-16 lg:pb-20 bg-gray-50">
                    <div className="max-w-7xl mx-auto px-5 lg:px-8">
                        <FadeIn direction="up">
                            <div className="max-w-[800px] mx-auto">
                                <figure>
                                    <div className="rounded-2xl shadow-md">
                                        <div className="rounded-2xl overflow-hidden border border-gray-100">
                                            <Image
                                                src="/images/rio-guide/sehenswuerdigkeiten/infografik-zuckerhut-01.webp"
                                                alt="Infografik: Zuckerhut – Alle wichtigen Infos auf einen Blick"
                                                width={1200}
                                                height={900}
                                                className="w-full h-auto block"
                                                loading="lazy"
                                            />
                                        </div>
                                    </div>
                                    <figcaption className="mt-3 text-sm text-gray-400 text-center">
                                        Zuckerhut auf einen Blick — Tickets, Öffnungszeiten, Anfahrt und Insider-Tipps zusammengefasst.
                                    </figcaption>
                                </figure>
                            </div>
                        </FadeIn>
                    </div>
                </section>

                {/* ── SECÇÃO 5 — Dica do Will (Insider-Tipp card) ─── */}
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

                                        {/* Título */}
                                        <h3 className="text-2xl lg:text-3xl font-heading font-bold text-white mb-5 leading-tight">
                                            Morro da Urca — der unterschätzte Stopp
                                        </h3>

                                        {/* Texto */}
                                        <p className="text-white/75 text-lg leading-relaxed">
                                            Die meisten Touristen fahren direkt durch bis zum Gipfel — und
                                            verpassen dabei den Morro da Urca, die erste Seilbahn-Station.
                                            Bleib dort 30 bis 40 Minuten. Du hast eine fantastische Aussicht,
                                            fast keine Menschenmassen, und es gibt eine Bar mit Caipirinha und
                                            direktem Blick auf den Corcovado. Danach erst weiter nach oben.
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
                                Drei Orte, die du nicht verpassen solltest, wenn du schon am Zuckerhut bist.
                            </p>
                        </FadeIn>

                        {/* Colunas seguem o número de cards. Eram 3 quando a seção linkava
                            pontos que nunca foram construídos (urca, santa-teresa e outros:
                            404 desde sempre). Ao criar essas páginas, devolver os cards e o
                            md:grid-cols-3. */}
                        <div className="grid grid-cols-1 gap-6 max-w-md">

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
                                            Vom Zuckerhut siehst du ihn perfekt — der nächste logische Schritt auf deiner Rio-Tour.
                                        </p>
                                        <div className="flex items-center gap-1.5 text-sm font-bold text-rio-green group-hover:text-rio-yellow transition-colors mt-4">
                                            Mehr erfahren <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                                        </div>
                                    </div>
                                </Link>
                            </FadeIn>

                            {/* Card 2 — Urca */}

                            {/* Card 3 — Pedra do Arpoador */}

                        </div>
                    </div>
                </section>

                {/* ── FAQ ─────────────────────────────────────────── */}
                <section className="py-20 lg:py-24 bg-white border-t border-gray-100">
                    <div className="max-w-7xl mx-auto px-5 lg:px-8">
                        <FadeIn direction="up" className="mb-10">
                            <div className="max-w-[800px] mx-auto">
                                <h2 className="text-3xl lg:text-4xl font-heading font-bold text-gray-900 leading-tight">
                                    Häufige Fragen zum Zuckerhut
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
                                Den Zuckerhut{" "}
                                <br className="hidden sm:block" />
                                <span className="text-rio-yellow">mit deinem deutschsprachigen Tourguide erleben</span>
                            </h2>
                            <p className="text-lg text-white/70 mb-10 max-w-2xl mx-auto leading-relaxed">
                                Als Carioca zeige ich dir nicht nur die Aussicht — ich zeige dir den Moment,
                                den du nie vergisst. Auf Deutsch, ohne Touristenfalle.
                            </p>
                            <div className="flex flex-col sm:flex-row justify-center gap-4">
                                <Link
                                    href="/touren/klassiker"
                                    className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-rio-yellow text-gray-900 rounded-full font-bold text-lg hover:bg-yellow-400 hover:scale-[1.02] transition-all shadow-xl shadow-rio-yellow/20"
                                >
                                    <Phone className="w-5 h-5" />
                                    Klassiker Tour anfragen
                                </Link>
                                    {/* Era "Kontakt aufnehmen" -> /kontakt. Estas 6 páginas são as de SEO e de
                                        citação por IA: quem chega aqui pesquisou o ponto turístico, não a marca.
                                        O pedido vai pra Anfrage já com tour=klassiker, o passeio que cobre este ponto. */}
                                <Link
                                    href="/anfrage?von=site&tour=klassiker"
                                    className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-md border border-white/30 text-white rounded-full font-medium text-lg hover:bg-white/20 transition-all"
                                >
                                    Diese Sehenswürdigkeit anfragen
                                </Link>
                            </div>
                        </FadeIn>
                    </div>
                </section>

                {/* ── SECÇÃO 8 — Andere Touren ─────────────────────── */}
                <AndereTouren currentSlug="__zuckerhut__" />

            </main>

            <FooterServer />
        </div>
        </>
    );
}

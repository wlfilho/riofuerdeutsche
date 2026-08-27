import Link from "next/link";
import Image from "next/image";
import NavbarServer from "@/components/NavbarServer";
import FooterServer from "@/components/FooterServer";
import FadeIn from "@/components/FadeIn";
import AndereTouren from "@/components/AndereTouren";
import RocinhaFaq from "@/components/RocinhaFaq";
import { ChevronRight, Home, ArrowRight, Phone } from "lucide-react";

export const metadata = {
    title: {
        absolute: "Favela Tour Rocinha Rio de Janeiro auf Deutsch — mit echtem Carioca | Rio für Deutsche",
    },
    description:
        "Die Rocinha in Rio de Janeiro: Geschichte, Kultur und was du wirklich sehen solltest. Favela tour rio de janeiro — aber richtig, auf Deutsch, mit einem Carioca. Kein Touristen-Klischee.",
    keywords: [
        "Favela Tour Rocinha",
        "Rocinha besuchen",
        "Drohnen Video Favela",
        "Rocinha Karneval",
    ],
    alternates: {
        canonical: "https://riofuerdeutsche.de/rio-guide/sehenswuerdigkeiten/rocinha",
    },
    openGraph: {
        title: "Rocinha Rio de Janeiro — Favela besuchen mit lokalem Guide",
        description:
            "Größte Favela Brasiliens, echte Kultur, keine Klischees. Alles über die Rocinha in Rio — und wie man sie richtig besucht. Auf Deutsch.",
        url: "https://riofuerdeutsche.de/rio-guide/sehenswuerdigkeiten/rocinha",
    },
};

const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TouristAttraction",
    name: "Rocinha",
    description:
        "Rocinha ist die größte Favela Brasiliens — eine lebendige Gemeinschaft mit über 100.000 Einwohnern zwischen São Conrado und Gávea in Rio de Janeiro.",
    url: "https://riofuerdeutsche.de/rio-guide/sehenswuerdigkeiten/rocinha",
    touristType: "Cultural tourism",
    isAccessibleForFree: true,
    address: {
        "@type": "PostalAddress",
        addressLocality: "Rio de Janeiro",
        addressRegion: "RJ",
        addressCountry: "BR",
    },
    geo: {
        "@type": "GeoCoordinates",
        latitude: -22.9874,
        longitude: -43.2476,
    },
    inLanguage: "de",
};

const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
        { "@type": "ListItem", position: 1, name: "Startseite", item: "https://riofuerdeutsche.de" },
        { "@type": "ListItem", position: 2, name: "Rio-Guide", item: "https://riofuerdeutsche.de/rio-guide/sehenswuerdigkeiten" },
        { "@type": "ListItem", position: 3, name: "Sehenswürdigkeiten", item: "https://riofuerdeutsche.de/rio-guide/sehenswuerdigkeiten" },
        { "@type": "ListItem", position: 4, name: "Rocinha", item: "https://riofuerdeutsche.de/rio-guide/sehenswuerdigkeiten/rocinha" },
    ],
};

const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
        {
            "@type": "Question",
            name: "Ist die Rocinha sicher für Touristen?",
            acceptedAnswer: {
                "@type": "Answer",
                text: "Mit einem ortskundigen Guide ist ein Besuch der Rocinha sicher. Will ist in der Nähe aufgewachsen, kennt die Gemeinschaft seit Jahren und bewegt sich dort mit Respekt und Lokalkenntnis. Allein und ohne Begleitung wird ein Besuch nicht empfohlen.",
            },
        },
        {
            "@type": "Question",
            name: "Kann man die Rocinha alleine besuchen?",
            acceptedAnswer: {
                "@type": "Answer",
                text: "Technisch ja, aber ohne Begleitung verpasst du das Wesentliche — und bewegst dich in einem Ort, dessen Codes du nicht kennst. Mit Will bekommst du Zugang zu Familien, Aussichten und Geschichten, die man allein nie findet.",
            },
        },
        {
            "@type": "Question",
            name: "Was kostet eine Favela Tour in der Rocinha?",
            acceptedAnswer: {
                "@type": "Answer",
                text: "Die Favela Tour mit Will startet ab ca. 80 €. Der Eintritt in die Rocinha selbst ist kostenlos — bezahlt wird die Begleitung, die Lokalkenntnis und die Verbindung zur Community.",
            },
        },
        {
            "@type": "Question",
            name: "Wie macht man das berühmte Drohnen-Video in der Rocinha?",
            acceptedAnswer: {
                "@type": "Answer",
                text: "Das Drohnen-Video wird von lokalen Anbietern direkt in der Rocinha angeboten und kostet rund 200 Reais pro Person. Will zeigt dir, wo und wann du es am besten machst — ohne lange Schlange.",
            },
        },
        {
            "@type": "Question",
            name: "Wie lange dauert ein Besuch der Rocinha?",
            acceptedAnswer: {
                "@type": "Answer",
                text: "Ein Besuch mit Will dauert in der Regel etwa 3 Stunden. Beste Zeit ist tagsüber zwischen 10:00 und 16:00 Uhr.",
            },
        },
    ],
};

export default function RocinhaPage() {
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
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
            />
            <div className="flex flex-col min-h-screen bg-rio-sand selection:bg-rio-green selection:text-white font-sans">
                <NavbarServer />

                <main className="flex-grow">
                    {/* ── HERO ─────────────────────────────────────────── */}
                    <section className="relative pt-32 pb-28 lg:pt-44 lg:pb-36 overflow-hidden">
                        {/* Background image */}
                        <Image
                            src="/images/rocinha.webp"
                            alt="Rocinha — die größte Favela Brasiliens in Rio de Janeiro"
                            fill
                            className="object-cover object-center z-0"
                            priority
                        />

                        {/* Dark overlay */}
                        <div className="absolute inset-0 z-0 bg-[#071a0e]/75" />

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
                                        Rocinha
                                    </span>
                                </nav>

                                {/* H1 */}
                                <div className="max-w-4xl">
                                    <h1 className="text-5xl lg:text-[clamp(40px,5vw,72px)] font-heading font-black text-white leading-[1.08] tracking-tight mb-6">
                                        Favela besuchen: Rocinha, die größte Favela in Rio de Janeiro
                                    </h1>

                                    {/* Tagline */}
                                    <p className="text-xl lg:text-2xl text-white/70 font-medium leading-snug max-w-2xl mb-10">
                                        Die größte Favela Brasiliens — und ein Ort,
                                        den du nicht aus dem Fenster eines Taxis
                                        sehen solltest
                                    </p>

                                    {/* CTA Buttons */}
                                    <div className="flex flex-col sm:flex-row gap-4">
                                        {/* CTA primário */}
                                        <Link
                                            href="/touren/favela-tour"
                                            className="inline-flex items-center justify-center gap-2.5 px-8 py-4 bg-[#22a262] text-white rounded-full font-bold text-base hover:bg-[#1a8a52] hover:scale-[1.02] transition-all shadow-xl shadow-[#22a262]/25"
                                        >
                                            Favela Tour anfragen
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

                {/* ── SECÇÃO 3 — Informações Práticas ─────────────── */}
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
                                <span className="text-2xl" role="img" aria-label="Uhr">⏱</span>
                                <div>
                                    <p className="text-[11px] font-bold tracking-widest uppercase text-gray-400 mb-1">Dauer</p>
                                    <p className="text-gray-900 font-semibold text-[15px] leading-snug">ca. 3 Stunden <span className="text-gray-400 font-normal">(mit Will)</span></p>
                                </div>
                            </FadeIn>

                            {/* Card 2 — Beste Zeit */}
                            <FadeIn delay={0.05} direction="up" className="bg-white border border-gray-100 rounded-2xl p-5 flex flex-col gap-3 hover:border-rio-green/30 hover:shadow-sm transition-all duration-300">
                                <span className="text-2xl" role="img" aria-label="Auge">👁️</span>
                                <div>
                                    <p className="text-[11px] font-bold tracking-widest uppercase text-gray-400 mb-1">Beste Zeit</p>
                                    <p className="text-gray-900 font-semibold text-[15px] leading-snug">Tagsüber <span className="text-gray-400 font-normal">(10:00–16:00 Uhr)</span></p>
                                </div>
                            </FadeIn>

                            {/* Card 3 — Eintritt */}
                            <FadeIn delay={0.1} direction="up" className="bg-white border border-gray-100 rounded-2xl p-5 flex flex-col gap-3 hover:border-rio-green/30 hover:shadow-sm transition-all duration-300">
                                <span className="text-2xl" role="img" aria-label="Geld">💰</span>
                                <div>
                                    <p className="text-[11px] font-bold tracking-widest uppercase text-gray-400 mb-1">Eintritt</p>
                                    <p className="text-gray-900 font-semibold text-[15px] leading-snug">Kostenlos <span className="text-gray-400 font-normal">— Tour ab ca. 80 €</span></p>
                                </div>
                            </FadeIn>

                            {/* Card 4 — Mit Will */}
                            <FadeIn delay={0.15} direction="up" className="bg-white border border-rio-green/20 rounded-2xl p-5 flex flex-col gap-3 hover:border-rio-green/50 hover:shadow-sm transition-all duration-300">
                                <span className="text-2xl" role="img" aria-label="Handschlag">🤝</span>
                                <div>
                                    <p className="text-[11px] font-bold tracking-widest uppercase text-rio-green mb-1">Mit Will</p>
                                    <p className="text-gray-900 font-semibold text-[15px] leading-snug">Einzige Art, wie du wirklich eintauchst</p>
                                </div>
                            </FadeIn>

                            {/* Card 5 — Lage */}
                            <FadeIn delay={0.2} direction="up" className="bg-white border border-gray-100 rounded-2xl p-5 flex flex-col gap-3 hover:border-rio-green/30 hover:shadow-sm transition-all duration-300">
                                <span className="text-2xl" role="img" aria-label="Standort">📍</span>
                                <div>
                                    <p className="text-[11px] font-bold tracking-widest uppercase text-gray-400 mb-1">Lage</p>
                                    <p className="text-gray-900 font-semibold text-[15px] leading-snug">São Conrado / Gávea <span className="text-gray-400 font-normal">— 15 min von Ipanema</span></p>
                                </div>
                            </FadeIn>

                            {/* Card 6 — Sprache */}
                            <FadeIn delay={0.25} direction="up" className="bg-white border border-rio-green/20 rounded-2xl p-5 flex flex-col gap-3 hover:border-rio-green/50 hover:shadow-sm transition-all duration-300">
                                <span className="text-2xl" role="img" aria-label="Sprechen">🗣️</span>
                                <div>
                                    <p className="text-[11px] font-bold tracking-widest uppercase text-rio-green mb-1">Sprache</p>
                                    <p className="text-gray-900 font-semibold text-[15px] leading-snug">Auf Deutsch erklärt — mit Lokalkenntnissen</p>
                                </div>
                            </FadeIn>

                        </div>

                        {/* ── Tourismus & Gemeinschaft — Card destacado ── */}
                        <FadeIn direction="up" className="mt-6">
                            <div className="relative bg-[#0d1f15] rounded-2xl overflow-hidden border border-[#22a262]/40 shadow-lg shadow-black/10">

                                {/* Glow accent */}
                                <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-[#22a262]/8 blur-3xl pointer-events-none" />

                                <div className="relative p-7 lg:p-8">
                                    {/* Icon + label */}
                                    <div className="flex items-center gap-3 mb-5">
                                        <span className="text-3xl" role="img" aria-label="Pflanze">🌱</span>
                                        <span className="text-xs font-bold tracking-widest uppercase text-[#22a262]">
                                            Tourismus &amp; Gemeinschaft
                                        </span>
                                    </div>

                                    {/* Título */}
                                    <h2 className="text-xl lg:text-2xl font-heading font-bold text-white mb-4 leading-tight">
                                        Favela Tour Rocinha — Tourismus, der der Gemeinschaft hilft
                                    </h2>

                                    {/* Texto */}
                                    <p className="text-white/75 text-base leading-relaxed">
                                        Tourismus ist heute ein wichtiger Teil der Wirtschaft in der
                                        Rocinha. Kleine Cafés, Bäckereien, Kunsthandwerker,
                                        lokale Guides — sie alle profitieren direkt von Besuchern,
                                        die mit echtem Interesse kommen. Wenn du mit Will die Rocinha
                                        besuchst, kaufst du beim Bäcker um die Ecke, trinkst deinen
                                        Kaffee bei einer Familie, die sich Zeit für dich nimmt. Das
                                        Geld bleibt in der Gemeinschaft. Und du nimmst eine Geschichte
                                        mit, die kein Hotel dir erzählen kann.
                                    </p>
                                </div>
                            </div>
                        </FadeIn>

                    </div>
                </section>

                {/* ── SECÇÃO 4 — Texto Introdutório ───────────────── */}
                <section className="pt-20 lg:pt-28 pb-8 bg-white">
                    <div className="max-w-7xl mx-auto px-5 lg:px-8">
                        <FadeIn direction="up">
                            <div className="max-w-[800px] mx-auto space-y-7 text-left">

                                <h2 className="text-3xl lg:text-4xl font-heading font-bold text-gray-900 leading-tight">
                                    Die Rocinha besuchen — eine Stadt in der Stadt
                                </h2>

                                {/* Parágrafo 1 — O primeiro contato */}
                                <p className="text-xl lg:text-2xl font-semibold text-gray-900 leading-snug">
                                    Es gibt in Rio zwei Arten, die Rocinha zu sehen. Die erste:
                                    aus dem Taxi, beim Vorbeifahren auf der Autoestrada, ein
                                    kurzer Blick auf die Hänge, vollgebaut bis ganz oben —
                                    und dann weiter. Die zweite: du gehst rein. Ich bin in Rio
                                    aufgewachsen, habe in Gávea Fußball gespielt und Freunde in
                                    der Rocinha gehabt, seit ich ein Kind war. Und ich kann dir
                                    sagen: wer die zweite Version wählt, sieht eine andere Stadt.
                                </p>

                                {/* Parágrafo 2 — O que é a Rocinha */}
                                <p className="text-lg text-gray-600 leading-relaxed">
                                    Mehr als 100.000 Menschen leben auf einem einzigen Berghang
                                    zwischen São Conrado und Gávea — die größte Favela Brasiliens,
                                    vielleicht Südamerikas. Die Rocinha hat Supermärkte, Banken,
                                    Schulen, Apotheken, Restaurants. Bäckereien, die seit Generationen
                                    in der gleichen Familie sind. Friseure, Mechaniker, Schneider,
                                    Künstler. Eine eigene Gemeinschaftsradio. Eine Architektur, die
                                    über 80 Jahre gewachsen ist, Schicht für Schicht, mit Blick aufs
                                    Meer. Die <em>Favela Rocinha Rio de Janeiro</em> ist eine lebendige,
                                    pulsierende Gemeinschaft — eine Stadt in der Stadt, voller
                                    Kreativität und Energie, die man von der ersten Minute an spürt.
                                </p>

                                {/* Parágrafo 3 — O ponto de vista do Will */}
                                <p className="text-lg text-gray-600 leading-relaxed pt-2 border-t border-gray-100">
                                    Wenn ich mit meinen deutschen Gästen durch die Rocinha gehe,
                                    merke ich immer dasselbe: die Überraschung. Nicht weil es so
                                    anders wäre — sondern weil es so voll ist. Voll von Menschen,
                                    die arbeiten, lachen, kochen, ihr Leben leben. Wir besuchen
                                    Familien, die mich seit Jahren kennen. Wir trinken Kaffee,
                                    schauen uns Aussichten von Terrassen an, die kein Reiseführer
                                    kennt, hören Geschichten, die man nirgendwo lesen kann. Die{" "}
                                    <Link href="/touren/favela-tour" className="text-[#2D6A4F] underline underline-offset-2 hover:text-[#1a4a35] transition-colors">Favela Tour auf Deutsch</Link>{" "}
                                    mit mir ist kein Ausflug in
                                    eine fremde Welt — es ist ein Einblick in einen Teil von Rio,
                                    der genauso zur Stadt gehört wie Ipanema und Copacabana.
                                </p>

                            </div>
                        </FadeIn>
                    </div>
                </section>

                {/* ── IMAGEM — Rocinha Tour ────────────────────────── */}
                <section className="pt-2 pb-10 bg-white">
                    <div className="max-w-7xl mx-auto px-5 lg:px-8">
                        <FadeIn direction="up">
                            <figure className="max-w-[800px] mx-auto">
                                <div className="rounded-2xl overflow-hidden shadow-sm">
                                    <Image
                                        src="/images/rocinha-tour.webp"
                                        alt="Blick auf die Rocinha — die größte Favela Brasiliens zwischen den Bergen und dem Meer von Rio de Janeiro"
                                        width={1200}
                                        height={800}
                                        className="w-full h-auto"
                                        loading="lazy"
                                    />
                                </div>
                                <figcaption className="mt-3 text-sm text-gray-400 text-center leading-snug">
                                    Die Rocinha zwischen Pedra da Gávea und São Conrado — über 100.000 Menschen, eine eigene Wirtschaft, eine eigene Kultur. Alles auf einem einzigen Berghang.
                                </figcaption>
                            </figure>
                        </FadeIn>
                    </div>
                </section>

                {/* ── SECÇÃO 4b — Das Drohnen-Video ───────────────── */}
                <section className="py-16 lg:py-20 bg-white border-t border-gray-100">
                    <div className="max-w-7xl mx-auto px-5 lg:px-8">
                        <FadeIn direction="up">
                            <div className="max-w-[800px] mx-auto">
                                <div className="relative rounded-3xl overflow-hidden shadow-xl shadow-black/10">

                                    {/* Background gradient */}
                                    <div className="absolute inset-0 bg-gradient-to-br from-[#071a0e] via-[#0d2a1a] to-[#1a1a2e]" />

                                    {/* Decorative glow */}
                                    <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-[#22a262]/15 blur-3xl pointer-events-none" />
                                    <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-blue-500/8 blur-3xl pointer-events-none" />

                                    <div className="relative p-8 lg:p-10">
                                        {/* Label */}
                                        <div className="flex items-center gap-3 mb-6">
                                            <span className="text-3xl" role="img" aria-label="Drohne">🎬</span>
                                            <span className="text-xs font-bold tracking-widest uppercase text-[#22a262]">
                                                Viral auf TikTok &amp; Instagram
                                            </span>
                                        </div>

                                        {/* Título */}
                                        <h2 className="text-2xl lg:text-3xl font-heading font-bold text-white mb-5 leading-tight">
                                            Das Drohnen-Video in der Rocinha — der virale TikTok-Hype
                                        </h2>

                                        {/* Texto */}
                                        <div className="space-y-4 text-white/75 text-base leading-relaxed">
                                            <p>
                                                Hast du diese Videos schon gesehen? Ein Tourist steht oben
                                                auf einer Laje — einer Dachterrasse in der Rocinha. Eine
                                                Drohne filmt ihn aus der Nähe. Dann fährt sie zurück. Langsam,
                                                Meter für Meter. Der Mensch wird kleiner. Kleiner. Und während
                                                er kleiner wird, wächst die Rocinha — Haus für Haus, Gasse für
                                                Gasse, Hügel für Hügel, bis der Blick die ganze Gemeinschaft
                                                auf einmal erfasst. Ein kleiner Punkt in einem Meer aus
                                                Ziegeln und Leben.
                                            </p>
                                            <p>
                                                Dann schwenkt die Drohne. Hinter der Rocinha: die Pedra da
                                                Gávea, die Berge, der Regenwald, das Meer von São Conrado.
                                                Brasilianische Musik im Hintergrund. Und der Moment, in dem
                                                man begreift, wie dieser Ort wirklich aussieht — von oben,
                                                in seiner ganzen Dimension.
                                            </p>
                                            <p>
                                                Diese Videos sind ein Hype — und das verdient die Rocinha.
                                                Was die meisten nicht wissen: Sie wurden von den Bewohnern
                                                selbst erfunden. Locals mit Drohnen, die eine Idee hatten
                                                und daraus ein Angebot gemacht haben. Heute stehen Touristen
                                                manchmal bis zu zwei Stunden Schlange, um dieses Video zu
                                                machen. Es kostet rund{" "}
                                                <span className="text-white font-semibold">
                                                    200 Reais pro Person
                                                </span>{" "}
                                                — und das Geld geht direkt an die Menschen, die hier leben
                                                und arbeiten. Eine kreative Idee der Community, die der
                                                Community nützt.
                                            </p>
                                        </div>

                                        {/* H3 — Drohnen keyword anchor */}
                                        <h3 className="text-lg font-heading font-bold text-white mt-6 mb-3 leading-tight">
                                            Wie und wo du das Rocinha-Drohnenvideo machst
                                        </h3>

                                        {/* Divider */}
                                        <div className="pt-4 border-t border-white/10">
                                            <p className="text-white/50 text-sm italic">
                                                💡 Mit Will erfährst du, wo und wann du das Video am besten
                                                machen kannst — ohne zwei Stunden in der Schlange zu stehen.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </FadeIn>
                    </div>
                </section>

                {/* ── SECÇÃO 5 — Geschichte & Wissenswertes ───────── */}
                <section className="pt-20 lg:pt-28 pb-8 lg:pb-10 bg-gray-50 border-t border-gray-100">
                    <div className="max-w-7xl mx-auto px-5 lg:px-8">
                        <FadeIn direction="up" className="mb-10">
                            <div className="max-w-[800px] mx-auto">
                                <h2 className="text-3xl lg:text-4xl font-heading font-bold text-gray-900 leading-tight">
                                    Favela Rocinha — Geschichte, Kultur und{" "}
                                    <span className="text-rio-green">Wissenswertes</span>
                                </h2>
                            </div>
                        </FadeIn>

                        <FadeIn direction="up">
                            <div className="max-w-[800px] mx-auto space-y-7 text-left">

                                {/* P1 — As origens */}
                                <p className="text-lg text-gray-600 leading-relaxed">
                                    Die Rocinha begann in den 1930er Jahren als kleine ländliche
                                    Siedlung — der Name kommt vom portugiesischen Wort{" "}
                                    <em>roça</em>, so viel wie Kleingarten oder Anbaufläche.
                                    Landwirte, die die wohlhabenden Viertel der Zona Sul mit
                                    Lebensmitteln versorgten, waren die Ersten, die sich hier
                                    ansiedelten. Mit dem explosiven Wachstum Rio de Janeiros
                                    in den 1940er und 1950er Jahren kamen Arbeiter aus dem
                                    Nordosten Brasiliens — angezogen von den Baustellen der
                                    Stadt und den Haushalten in São Conrado und Gávea. Die
                                    Gemeinschaft wuchs mit der Stadt — selbstorganisiert,
                                    Schicht für Schicht, ohne staatliche Unterstützung.
                                </p>

                                {/* P2 — O crescimento */}
                                <p className="text-lg text-gray-600 leading-relaxed">
                                    In den 1970er und 1980er Jahren wurde die Rocinha zur
                                    größten Favela Brasiliens. Die genaue Einwohnerzahl war
                                    dem Staat nie bekannt — offizielle Schätzungen schwankten
                                    zwischen 70.000 und 180.000. Die Wahrheit liegt wohl
                                    irgendwo dazwischen. Was feststeht: Die{" "}
                                    <em>Rocinha Rio de Janeiro</em> ist eine Stadt in der Stadt,
                                    mit eigener Infrastruktur, eigener Wirtschaft und einer
                                    kulturellen Identität, die kein anderes Viertel Rios hat.
                                    Wenn du verstehen willst, wie Rio wirklich funktioniert,
                                    führt kein Weg an diesem Ort vorbei.
                                </p>

                                {/* P3 — Resiliência e autoorganização */}
                                <p className="text-lg text-gray-600 leading-relaxed">
                                    Was die Rocinha auszeichnet, ist die Kraft ihrer Gemeinschaft.
                                    Was anderswo vom Staat gebaut wird — Wasserleitungen,
                                    Stromversorgung, Straßen, Schulen — wurde hier von den
                                    Bewohnern selbst errichtet, Generation für Generation, mit
                                    den Mitteln, die vorhanden waren. Diese Fähigkeit zur
                                    Selbstorganisation ist bis heute spürbar: in den kleinen
                                    Geschäften, den Familienbetrieben, den Handwerkern und
                                    Unternehmern, die ihre eigene Wirtschaft aufgebaut haben.
                                    Tourismus ist heute ein natürlicher Teil davon — und wenn
                                    er mit Respekt betrieben wird, stärkt er genau diese
                                    lokale Wirtschaft direkt.
                                </p>

                                {/* P4 — Cultura e identidade */}
                                <p className="text-lg text-gray-600 leading-relaxed">
                                    Was viele Besucher nicht erwarten, ist die kulturelle Dichte.
                                    Die Rocinha hat eine eigene Sambaschule — die GRES Unidos da
                                    Rocinha — die beim{" "}
                                    <Link href="/touren/karneval-tour" className="text-[#2D6A4F] underline underline-offset-2 hover:text-[#1a4a35] transition-colors"><em>Rocinha Karneval</em></Link> in Rio de Janeiro antritt. Es gibt
                                    Kinos, Gemeinschaftstheater, bildende Künstler, Musiker, die
                                    in der ganzen Stadt bekannt sind. Der Funk Carioca, der heute
                                    in Playlists weltweit zu finden ist, hat seine Wurzeln zu
                                    einem großen Teil hier. Die{" "}
                                    <em>Rocinha Kultur</em> ist kein Randphänomen — sie ist ein
                                    zentraler Teil dessen, was Rio zu Rio macht.
                                </p>

                                {/* P5 — A vista que ninguém menciona */}
                                <p className="text-lg text-gray-600 leading-relaxed">
                                    Es gibt etwas, das alle Reiseführer ignorieren: Die Aussicht
                                    von der Rocinha ist außergewöhnlich. Von ganz oben, vom Gipfel
                                    der Gemeinschaft, sieht man São Conrado, die Lagoa Rodrigo de
                                    Freitas, den Dois Irmãos, und in der Ferne den{" "}
                                    <Link href="/rio-guide/sehenswuerdigkeiten/christus-erloeser" className="text-[#2D6A4F] underline underline-offset-2 hover:text-[#1a4a35] transition-colors">Corcovado mit dem Christus</Link>. Es ist eine der besten Aussichten in Rio — und
                                    sie gehört den Menschen, die ihre Häuser hier Stein für Stein
                                    über Jahrzehnte aufgebaut haben. Kein offizieller Aussichtspunkt,
                                    kein Eintrittsgeld. Nur die ganze Stadt, für den, der weiß,
                                    wie man hinkommt.
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
                                            src="/images/rio-guide/sehenswuerdigkeiten/infografik-rocinha.webp"
                                            alt="Infografik zur Rocinha in Rio de Janeiro: Einwohner, Fläche, Gründung und kulturelle Highlights der größten Favela Brasiliens"
                                            width={1200}
                                            height={900}
                                            className="w-full h-auto block"
                                            loading="lazy"
                                        />
                                    </div>
                                </div>
                                <figcaption className="mt-3 text-sm text-gray-400 text-center leading-snug">
                                    Zahlen &amp; Fakten zur Rocinha — die größte Favela Brasiliens, eine lebendige Gemeinschaft mit über 100.000 Einwohnern zwischen den Bergen und dem Meer von Rio de Janeiro.
                                </figcaption>
                            </figure>
                        </FadeIn>
                    </div>
                </section>

                {/* ── SECÇÃO 6 — Dica do Will (Insider-Tipp card) ─── */}
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
                                        <h2 className="text-sm font-heading font-bold text-[#22a262] mb-2 leading-tight tracking-wide uppercase">
                                            Wills Tipp für deinen Rocinha-Besuch
                                        </h2>
                                        <h3 className="text-2xl lg:text-3xl font-heading font-bold text-white mb-5 leading-tight">
                                            Das Viertel, das du nach dem Besuch anders siehst
                                        </h3>

                                        {/* Texto */}
                                        <p className="text-white/75 text-lg leading-relaxed">
                                            Die meisten meiner deutschen Gäste kommen mit einer
                                            Vorstellung von Favela im Kopf — geprägt von
                                            Nachrichtenbildern und Filmen wie{" "}
                                            <span className="text-white font-semibold italic">
                                                Cidade de Deus
                                            </span>
                                            . Und fast alle gehen anders raus, als sie reinkommen.
                                            Nicht weil es idyllischer ist, als sie dachten — sondern
                                            weil es menschlicher ist. Weil du Augen gesehen hast,
                                            eine Küche gerochen hast, eine Geschichte gehört hast.
                                            Mein Tipp: Lass dir nach dem Besuch Zeit. Setz dich ins
                                            Café am Mirante 360° in São Conrado, bestell einen
                                            Guaraná, und schau auf die Hänge. Du wirst die Stadt
                                            danach anders sehen — versprochen.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </FadeIn>
                    </div>
                </section>

                {/* ── FAQ ─────────────────────────────────────────── */}
                <section className="py-20 lg:py-24 bg-white border-t border-gray-100">
                    <div className="max-w-7xl mx-auto px-5 lg:px-8">
                        <FadeIn direction="up" className="mb-10">
                            <div className="max-w-[800px] mx-auto">
                                <h2 className="text-3xl lg:text-4xl font-heading font-bold text-gray-900 leading-tight">
                                    Häufige Fragen zur Rocinha
                                </h2>
                            </div>
                        </FadeIn>
                        <FadeIn direction="up">
                            <div className="max-w-[800px] mx-auto">
                                <RocinhaFaq />
                            </div>
                        </FadeIn>
                    </div>
                </section>

                {/* ── SECÇÃO 7 — Passt gut dazu ───────────────────── */}
                <section className="py-20 lg:py-24 bg-gray-50 border-t border-gray-100">
                    <div className="max-w-7xl mx-auto px-5 lg:px-8">
                        <FadeIn direction="up" className="mb-10">
                            <h2 className="text-3xl lg:text-4xl font-heading font-bold text-gray-900 leading-tight">
                                Passt gut dazu…
                            </h2>
                            <p className="text-gray-500 mt-2 text-lg">
                                Orte, die du nach der Rocinha mit anderen Augen siehst.
                            </p>
                        </FadeIn>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

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
                                            Vom Gipfel des Corcovado siehst du die Rocinha von oben — ein völlig anderer Blickwinkel auf denselben Ort.
                                        </p>
                                        <div className="flex items-center gap-1.5 text-sm font-bold text-rio-green group-hover:text-rio-yellow transition-colors mt-4">
                                            Mehr erfahren <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                                        </div>
                                    </div>
                                </Link>
                            </FadeIn>

                            {/* Card 2 — Favela Santa Marta */}
                            <FadeIn delay={0.08} direction="up" className="flex">
                                <Link
                                    href="/rio-guide/sehenswuerdigkeiten/santa-marta"
                                    className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col overflow-hidden w-full"
                                >
                                    <div className="relative h-48 overflow-hidden">
                                        <Image
                                            src="/images/rio-favela.webp"
                                            alt="Favela Santa Marta in Botafogo, Rio de Janeiro"
                                            fill
                                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                        <span className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2.5 py-0.5 rounded-full text-[9px] font-bold text-rio-green uppercase tracking-wider">
                                            Botafogo
                                        </span>
                                    </div>
                                    <div className="p-5 flex flex-col flex-grow">
                                        <h3 className="text-lg font-bold font-heading text-gray-900 mb-2">Favela Santa Marta</h3>
                                        <p className="text-gray-500 text-sm leading-relaxed flex-grow">
                                            Die kleinere Schwester der Rocinha. Erste befriedete Favela Rios, Michael Jackson Video, Cristo-Blick vom Teleférico.
                                        </p>
                                        <div className="flex items-center gap-1.5 text-sm font-bold text-rio-green group-hover:text-rio-yellow transition-colors mt-4">
                                            Mehr erfahren <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                                        </div>
                                    </div>
                                </Link>
                            </FadeIn>

                            {/* Card 3 — Zuckerhut */}
                            <FadeIn delay={0.16} direction="up" className="flex">
                                <Link
                                    href="/rio-guide/sehenswuerdigkeiten/zuckerhut"
                                    className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col overflow-hidden w-full"
                                >
                                    <div className="relative h-48 overflow-hidden">
                                        <Image
                                            src="/images/zuckerhut-pao-de-acucar-01.webp"
                                            alt="Zuckerhut — Pão de Açúcar in Rio de Janeiro"
                                            fill
                                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                        <span className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2.5 py-0.5 rounded-full text-[9px] font-bold text-rio-green uppercase tracking-wider">
                                            Aussicht
                                        </span>
                                    </div>
                                    <div className="p-5 flex flex-col flex-grow">
                                        <h3 className="text-lg font-bold font-heading text-gray-900 mb-2">Zuckerhut</h3>
                                        <p className="text-gray-500 text-sm leading-relaxed flex-grow">
                                            Zwei Seilbahnen, 396 Meter Höhe — und vom Gipfel aus siehst du die ganze Zona Sul auf einmal, von Ipanema bis zur Guanabara-Bucht.
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

                {/* ── SECÇÃO 8 — CTA Final ─────────────────────────── */}
                <section className="py-24 relative overflow-hidden bg-[#0d1f15] border-t-4 border-rio-yellow">
                    <div className="absolute inset-0 bg-[url('/images/rio-background.webp')] bg-cover bg-center mix-blend-overlay opacity-10" />
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-[#22a262]/10 blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/4" />
                    <div className="relative max-w-4xl mx-auto px-5 text-center">
                        <FadeIn direction="up">
                            <h2 className="text-3xl lg:text-5xl font-heading font-black text-white mb-6 leading-tight">
                                Die Rocinha{" "}
                                <br className="hidden sm:block" />
                                <span className="text-rio-yellow">mit deutschsprachigem Guide besuchen</span>
                            </h2>
                            <p className="text-lg text-white/70 mb-10 max-w-2xl mx-auto leading-relaxed">
                                Ich zeige dir nicht die Armut — ich stelle dir die Menschen vor.
                                Auf Deutsch, mit echten Lokalkenntnissen,
                                mit Respekt für die Community.
                            </p>
                            <div className="flex flex-col sm:flex-row justify-center gap-4">
                                <Link
                                    href="/touren/favela-tour"
                                    className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-rio-yellow text-gray-900 rounded-full font-bold text-lg hover:bg-yellow-400 hover:scale-[1.02] transition-all shadow-xl shadow-rio-yellow/20"
                                >
                                    <Phone className="w-5 h-5" />
                                    Favela Tour anfragen
                                </Link>
                                    {/* Era "Kontakt aufnehmen" -> /kontakt. Estas 6 páginas são as de SEO e de
                                        citação por IA: quem chega aqui pesquisou o ponto turístico, não a marca.
                                        O pedido vai pra Anfrage já com tour=favela-tour, o passeio que cobre este ponto. */}
                                <Link
                                    href="/anfrage?von=site&tour=favela-tour"
                                    className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-md border border-white/30 text-white rounded-full font-medium text-lg hover:bg-white/20 transition-all"
                                >
                                    Diese Sehenswürdigkeit anfragen
                                </Link>
                            </div>
                        </FadeIn>
                    </div>
                </section>

                {/* ── SECÇÃO 9 — Andere Touren ─────────────────────── */}
                <AndereTouren
                    currentSlug="__rocinha__"
                    prioritySlugs={["favela-tour", "klassiker", "kultur-geschichte", "sport-und-abenteuer"]}
                />

                </main>

                <FooterServer />
            </div>
        </>
    );
}

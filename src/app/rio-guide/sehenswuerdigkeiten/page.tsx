import Link from "next/link";
import NavbarServer from "@/components/NavbarServer";
import FooterServer from "@/components/FooterServer";
import FadeIn from "@/components/FadeIn";
import { ChevronRight, MapPin, ArrowRight } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: {
        absolute: "Sehenswürdigkeiten Rio de Janeiro, Tipps vom Carioca auf Deutsch | Rio für Deutsche",
    },
    description:
        "Die besten Sehenswürdigkeiten in Rio de Janeiro: Christus Erlöser, Zuckerhut, Maracanã, Escadaria Selarón und mehr. Insider-Tipps vom lokalen Guide, auf Deutsch.",
    alternates: {
        canonical: "https://riofuerdeutsche.de/rio-guide/sehenswuerdigkeiten",
    },
    openGraph: {
        title: "Sehenswürdigkeiten Rio de Janeiro: Tipps vom Carioca",
        description:
            "Christus Erlöser, Zuckerhut, Maracanã, Escadaria Selarón und mehr: alle Infos auf Deutsch, von einem Carioca.",
        url: "https://riofuerdeutsche.de/rio-guide/sehenswuerdigkeiten",
    },
};

const sehenswuerdigkeiten = [
    {
        name: "Christus Erlöser",
        badge: "Weltwunder",
        tagline: "Das Wahrzeichen von Rio, und der Moment, der jeden sprachlos macht.",
        href: "/rio-guide/sehenswuerdigkeiten/christus-erloeser",
        emoji: "✝️",
    },
    {
        name: "Zuckerhut",
        badge: "Klassiker",
        tagline: "Zwei Seilbahnen, 396 Meter, und der schönste Sonnenuntergang Rios.",
        href: "/rio-guide/sehenswuerdigkeiten/zuckerhut",
        emoji: "🚡",
    },
    {
        name: "Maracanã",
        badge: "Fußball",
        tagline: "Der Tempel des Fußballs, in dem Deutschland 2014 Weltmeister wurde.",
        href: "/rio-guide/sehenswuerdigkeiten/maracana",
        emoji: "⚽",
    },
    {
        name: "Escadaria Selarón",
        badge: "Kostenlos",
        tagline: "215 Stufen Kunst, die ein ganzes Leben gedauert hat.",
        href: "/rio-guide/sehenswuerdigkeiten/escadaria-selaron",
        emoji: "🪜",
    },
    {
        name: "Rocinha",
        badge: "Favela-Tour",
        tagline: "Die größte Favela Brasiliens, und ein Ort, den du nicht aus dem Taxi sehen solltest.",
        href: "/rio-guide/sehenswuerdigkeiten/rocinha",
        emoji: "🏘️",
    },
    {
        name: "Favela Santa Marta",
        badge: "Botafogo",
        tagline: "Die erste befriedete Favela Rios, Michael Jackson Video und atemberaubende Aussicht.",
        href: "/rio-guide/sehenswuerdigkeiten/santa-marta",
        emoji: "🎤",
    },
    {
        name: "The Maze",
        badge: "Versteckt",
        tagline: "Bob Nadkarnis Kulturzentrum in Tavares Bastos, mit Blick auf die ganze Guanabara-Bucht.",
        href: "/rio-guide/sehenswuerdigkeiten/the-maze",
        emoji: "🎷",
    },
];

export default function SehenswuerdigkeitenPage() {
    return (
        <div className="flex flex-col min-h-screen bg-rio-sand selection:bg-rio-green selection:text-white font-sans">
            <NavbarServer />

            <main className="flex-grow">
                {/* ── HERO ─────────────────────────────────────────── */}
                <section className="relative pt-32 pb-24 lg:pt-44 lg:pb-32 overflow-hidden">
                    {/* Dark background */}
                    <div className="absolute inset-0 z-0 bg-[#071a0e]" />

                    {/* Green glow accents */}
                    <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-[#22a262]/10 blur-3xl z-0 -translate-y-1/2 translate-x-1/4" />
                    <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-[#22a262]/8 blur-3xl z-0 translate-y-1/2 -translate-x-1/4" />

                    <div className="relative z-10 max-w-7xl mx-auto px-5 lg:px-8">
                        <FadeIn direction="up">
                            {/* Breadcrumb */}
                            <nav
                                className="flex items-center flex-wrap gap-y-1 text-sm font-medium text-white/50 mb-10"
                                aria-label="Breadcrumb"
                            >
                                <Link href="/" className="hover:text-white transition-colors">
                                    Startseite
                                </Link>
                                <ChevronRight className="w-4 h-4 mx-2 text-white/25 shrink-0" />
                                {/* Texto, não link: esta É a página do Rio-Guide, e um
                                    breadcrumb que aponta pra si mesmo confunde leitor e
                                    rastreador. */}
                                <span className="text-white/60">Rio-Guide</span>
                                <ChevronRight className="w-4 h-4 mx-2 text-white/25 shrink-0" />
                                <span className="text-[#22a262] font-semibold">Sehenswürdigkeiten</span>
                            </nav>

                            {/* Supertítulo */}
                            <p className="text-xs font-bold tracking-widest uppercase text-[#22a262] mb-4 flex items-center gap-2">
                                <MapPin className="w-3.5 h-3.5" />
                                Rio-Guide
                            </p>

                            {/* H1 */}
                            <div className="max-w-4xl">
                                <h1 className="text-5xl lg:text-[clamp(40px,5vw,72px)] font-heading font-black text-white leading-[1.08] tracking-tight mb-6">
                                    Sehenswürdigkeiten
                                </h1>

                                <p className="text-xl lg:text-2xl text-white/70 font-medium leading-snug max-w-2xl">
                                    Die besten Orte Rios, erklärt von einem Carioca, auf Deutsch.
                                </p>
                            </div>
                        </FadeIn>
                    </div>
                </section>

                {/* ── GRELHA DE CARDS ──────────────────────────────── */}
                <section className="py-20 lg:py-28 bg-white">
                    <div className="max-w-7xl mx-auto px-5 lg:px-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {sehenswuerdigkeiten.map((s, i) => (
                                <FadeIn key={s.href} delay={i * 0.08} direction="up">
                                    <Link
                                        href={s.href}
                                        className="group p-6 bg-white rounded-2xl border border-gray-100 shadow-sm hover:border-rio-yellow hover:shadow-md transition-all duration-300 flex flex-col h-full"
                                    >
                                        <div className="flex justify-between items-start mb-4">
                                            <span className="text-3xl" role="img" aria-label={s.name}>
                                                {s.emoji}
                                            </span>
                                            <span className="bg-white/90 px-2.5 py-0.5 rounded-full text-[9px] font-bold text-rio-green border border-gray-100 uppercase tracking-wider">
                                                {s.badge}
                                            </span>
                                        </div>
                                        <h2 className="text-xl font-bold font-heading text-gray-900 mb-2">
                                            {s.name}
                                        </h2>
                                        <p className="text-gray-500 text-sm leading-relaxed mb-6 flex-grow">
                                            {s.tagline}
                                        </p>
                                        <div className="flex items-center gap-1.5 text-sm font-bold text-rio-green group-hover:text-rio-yellow transition-colors">
                                            Mehr erfahren{" "}
                                            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                                        </div>
                                    </Link>
                                </FadeIn>
                            ))}
                        </div>
                    </div>
                </section>
            </main>

            <FooterServer />
        </div>
    );
}

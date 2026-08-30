import Link from "next/link";
import NavbarServer from "@/components/NavbarServer";
import FooterServer from "@/components/FooterServer";
import FadeIn from "@/components/FadeIn";
import { ChevronRight, MapPin, ArrowRight } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: {
        absolute: "Rio-Guide: Rio de Janeiro verstehen, auf Deutsch | Rio für Deutsche",
    },
    description:
        "Der Rio-Guide von einem Carioca, der fließend Deutsch spricht: Sehenswürdigkeiten mit Insider-Tipps und ehrliche Antworten zur Sicherheit in Rio de Janeiro.",
    alternates: {
        canonical: "https://riofuerdeutsche.de/rio-guide",
    },
    openGraph: {
        // Declarar `openGraph` aqui substitui o objeto inteiro do layout raiz:
        // o Next não faz merge campo a campo. Sem repetir type, locale,
        // siteName e images, a página sai só com og:title e og:description e o
        // link compartilhado não gera imagem nenhuma.
        type: "website",
        locale: "de_DE",
        siteName: "Rio für Deutsche",
        url: "/rio-guide",
        title: "Rio-Guide: Rio de Janeiro verstehen, auf Deutsch",
        description:
            "Sehenswürdigkeiten mit Insider-Tipps und ehrliche Antworten zur Sicherheit, von einem Carioca.",
        images: [
            {
                // JPEG, não WebP: o WhatsApp não renderiza WebP no preview do link.
                url: "/images/og-rio-guide.jpg",
                width: 1200,
                height: 630,
                alt: "Christus Erlöser über Rio de Janeiro, Rio für Deutsche",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: "Rio-Guide: Rio de Janeiro verstehen, auf Deutsch",
        description:
            "Sehenswürdigkeiten mit Insider-Tipps und ehrliche Antworten zur Sicherheit, von einem Carioca.",
        images: ["/images/og-rio-guide.jpg"],
    },
};

const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
        {
            "@type": "ListItem",
            "position": 1,
            "name": "Startseite",
            "item": "https://riofuerdeutsche.de/",
        },
        {
            "@type": "ListItem",
            "position": 2,
            "name": "Rio-Guide",
            "item": "https://riofuerdeutsche.de/rio-guide",
        },
    ],
};

const bereiche = [
    {
        name: "Sehenswürdigkeiten",
        badge: "7 Orte",
        tagline:
            "Christus Erlöser, Zuckerhut, Maracanã, Escadaria Selarón und mehr. Was sich lohnt, wann du hingehst und was du dir sparen kannst.",
        href: "/rio-guide/sehenswuerdigkeiten",
        emoji: "📍",
    },
    {
        name: "Sicherheit",
        badge: "Ehrlich",
        tagline:
            "Ist Rio gefährlich? Die Antwort eines Cariocas, ohne Panikmache und ohne Beschönigung: welche Viertel, welche Fehler, welche Regeln.",
        href: "/rio-guide/sicherheit/ist-rio-gefaehrlich",
        emoji: "🛡️",
    },
];

export default function RioGuidePage() {
    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            <div className="flex flex-col min-h-screen bg-rio-sand selection:bg-rio-green selection:text-white font-sans">
                <NavbarServer />

                <main className="flex-grow">
                    {/* ── HERO ─────────────────────────────────────────── */}
                    <section className="relative pt-32 pb-24 lg:pt-44 lg:pb-32 overflow-hidden">
                        <div className="absolute inset-0 z-0 bg-[#071a0e]" />

                        <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-[#22a262]/10 blur-3xl z-0 -translate-y-1/2 translate-x-1/4" />
                        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-[#22a262]/8 blur-3xl z-0 translate-y-1/2 -translate-x-1/4" />

                        <div className="relative z-10 max-w-7xl mx-auto px-5 lg:px-8">
                            <FadeIn direction="up">
                                <nav
                                    className="flex items-center flex-wrap gap-y-1 text-sm font-medium text-white/50 mb-10"
                                    aria-label="Breadcrumb"
                                >
                                    <Link href="/" className="hover:text-white transition-colors">
                                        Startseite
                                    </Link>
                                    <ChevronRight className="w-4 h-4 mx-2 text-white/25 shrink-0" />
                                    <span className="text-[#22a262] font-semibold" aria-current="page">
                                        Rio-Guide
                                    </span>
                                </nav>

                                <p className="text-xs font-bold tracking-widest uppercase text-[#22a262] mb-4 flex items-center gap-2">
                                    <MapPin className="w-3.5 h-3.5" />
                                    Rio für Deutsche
                                </p>

                                <div className="max-w-4xl">
                                    <h1 className="text-5xl lg:text-[clamp(40px,5vw,72px)] font-heading font-black text-white leading-[1.08] tracking-tight mb-6">
                                        Rio-Guide
                                    </h1>

                                    <p className="text-xl lg:text-2xl text-white/70 font-medium leading-snug max-w-2xl">
                                        Alles, was du über Rio wissen solltest, bevor du kommst. Von einem Carioca, der in Köln gelebt hat.
                                    </p>
                                </div>
                            </FadeIn>
                        </div>
                    </section>

                    {/* ── GRELHA DE SEÇÕES ─────────────────────────────── */}
                    <section className="py-20 lg:py-28 bg-white">
                        <div className="max-w-7xl mx-auto px-5 lg:px-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {bereiche.map((b, i) => (
                                    <FadeIn key={b.href} delay={i * 0.08} direction="up">
                                        <Link
                                            href={b.href}
                                            className="group p-6 bg-white rounded-2xl border border-gray-100 shadow-sm hover:border-rio-yellow hover:shadow-md transition-all duration-300 flex flex-col h-full"
                                        >
                                            <div className="flex justify-between items-start mb-4">
                                                <span className="text-3xl" role="img" aria-label={b.name}>
                                                    {b.emoji}
                                                </span>
                                                <span className="bg-white/90 px-2.5 py-0.5 rounded-full text-[9px] font-bold text-rio-green border border-gray-100 uppercase tracking-wider">
                                                    {b.badge}
                                                </span>
                                            </div>
                                            <h2 className="text-xl font-bold font-heading text-gray-900 mb-2">
                                                {b.name}
                                            </h2>
                                            <p className="text-gray-500 text-sm leading-relaxed mb-6 flex-grow">
                                                {b.tagline}
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
        </>
    );
}

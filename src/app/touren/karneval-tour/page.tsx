import Link from "next/link";
import Image from "next/image";
import NavbarServer from "@/components/NavbarServer";
import FooterServer from "@/components/FooterServer";
import FadeIn from "@/components/FadeIn";
import {
    ChevronRight,
    Phone,
    CalendarDays,
} from "lucide-react";
import AndereTouren from "@/components/AndereTouren";
import { getSettings, buildContactUrls } from "@/lib/settings";

export const metadata = {
    title: "Karneval Tour in Rio — Sambódromo, Blocos & mehr",
    description: "Erlebe den Karneval in Rio de Janeiro mit einem echten Carioca als Guide. Sambódromo, Blocos de Rua und Samba-Ensaios — sicher, authentisch und komplett auf Deutsch.",
    alternates: {
        canonical: "https://riofuerdeutsche.de/touren/karneval-tour",
    },
    openGraph: {
        url: "https://riofuerdeutsche.de/touren/karneval-tour",
    },
};

const estimatedTourDuration = "Nur während des Karnevals";

const karnevalExperiences = [
    {
        name: "Sambódromo",
        image: "/images/carnival Sambodramo 2026.webp",
        desc: "Das Sambódromo ist die Hauptbühne des Karnevals in Rio — hier treten die besten Samba-Schulen der Stadt in einem spektakulären Wettbewerb gegeneinander an. Tausende Tänzer, aufwendige Kostüme, riesige Festwagen und Samba-Musik, die durch die ganze Arena hallt. Ein Erlebnis, das man einmal im Leben gesehen haben muss.",
        tip: "Die Desfiles der Grupo Especial (Sonntag und Montag) sind die Highlights, aber die Grupo de Acesso am Freitag und Samstag ist günstiger und fast genauso beeindruckend. Ich helfe dir bei den Tickets und erkläre dir alles vor Ort.",
        badges: ["Sonntag & Montag", "Hauptevent"]
    },
    {
        name: "Blocos de Rua",
        image: "/images/bloco-de-rua.webp",
        desc: "Die Blocos de Rua sind das Herz und die Seele des Karnevals für die Cariocas. Hunderte Straßenfeste verteilt über die ganze Stadt — von riesigen Blocos mit hunderttausenden Teilnehmern bis zu kleinen, lokalen Feiern in den Vierteln. Hier erlebst du den echten, ungefilterten Karneval, gemeinsam mit den Einheimischen.",
        tip: "Die großen Blocos wie Cordão do Bola Preta sind legendär, aber die kleinen Blocos in den Vierteln sind oft entspannter und sicherer. Ich zeige dir die besten für deinen Geschmack — und sorge dafür, dass du sicher feierst.",
        badges: ["Tagsüber", "Kostenlos & offen"]
    },
    {
        name: "Ensaios — Proben der Samba-Schulen",
        image: "/images/ensaio-escola-de-samba.webp",
        desc: "Wochen vor dem offiziellen Karneval öffnen die großen Samba-Schulen ihre Tore für öffentliche Proben — die Ensaios. Hier erlebst du die Energie des Karnevals hautnah, tanzt mitten unter den Sambistas und spürst den Rhythmus der Bateria. Weniger Touristen, mehr Authentizität und eine Atmosphäre, die viele Besucher als noch intensiver als den Karneval selbst beschreiben.",
        tip: "Die Ensaios der Mangueira und der Salgueiro sind besonders mitreißend. Der Eintritt kostet meist nur R$ 30–50 und die Stimmung ist unglaublich. Ich begleite dich hin und sorge dafür, dass du das volle Erlebnis genießen kannst.",
        badges: ["Wochen vor Karneval", "Ab R$ 30"]
    }
];

export default async function KarnevalTourPage() {
    const settings = await getSettings()

    const { whatsappHref: whatsappLink } = buildContactUrls(settings)
    const customWhatsappMsg = encodeURIComponent("Hallo! Ich interessiere mich für eine Karneval Tour in Rio. Kannst du mir mehr erzählen?");

    return (
        <div className="flex flex-col min-h-screen bg-rio-sand selection:bg-rio-green selection:text-white font-sans">
            <NavbarServer />

            <main className="flex-grow">
                {/* SEÇÃO A — Hero */}
                <section className="relative pt-32 pb-24 lg:pt-40 lg:pb-32 overflow-hidden bg-gray-900 border-b-4 border-rio-yellow">
                    <div className="absolute inset-0 z-0">
                        <Image
                            src="/images/bloco-background.webp"
                            alt="Karneval Tour in Rio de Janeiro — Sambódromo und Blocos de Rua"
                            fill
                            priority
                            fetchPriority="high"
                            quality={90}
                            className="object-cover object-[center_30%]"
                        />
                        <div className="absolute inset-0 bg-black/60"></div>
                    </div>

                    <div className="relative z-10 max-w-7xl mx-auto px-5 lg:px-8">
                        <FadeIn direction="up">
                            <nav className="flex items-center text-sm font-medium text-white/60 mb-8" aria-label="Breadcrumb">
                                <Link href="/" className="hover:text-rio-yellow transition-colors">Startseite</Link>
                                <ChevronRight className="w-4 h-4 mx-2 text-white/30" />
                                <Link href="/touren" className="hover:text-rio-yellow transition-colors">Touren & Ausflüge</Link>
                                <ChevronRight className="w-4 h-4 mx-2 text-white/30" />
                                <span className="text-rio-yellow">Karneval Tour</span>
                            </nav>

                            <div className="max-w-3xl space-y-6">
                                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-sm font-medium">
                                    <CalendarDays className="w-4 h-4 text-rio-yellow" />
                                    <span>Privattouren auf Deutsch · {estimatedTourDuration} · {karnevalExperiences.length} Highlights</span>
                                </div>

                                <h1 className="text-4xl lg:text-[clamp(32px,3.5vw,52px)] font-heading font-black text-white leading-[1.15] tracking-tight whitespace-normal lg:whitespace-nowrap">
                                    Karneval Tour in Rio de Janeiro
                                </h1>
                                <p className="text-xl lg:text-2xl xl:text-3xl font-bold text-rio-yellow mt-4">
                                    Das größte Fest der Welt mit einem echten Carioca
                                </p>

                                <div className="pt-6 flex flex-col sm:flex-row gap-4">
                                    {/* Primário passa a ser a Anfrage, com o slug da própria rota:
                                        assim dá pra saber qual página de tour converte. O WhatsApp
                                        continua visível ao lado, nunca escondido. */}
                                    <Link
                                        href="/anfrage?von=site&tour=karneval-tour"
                                        className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-rio-yellow text-gray-900 rounded-full font-bold text-lg hover:bg-yellow-400 hover:scale-[1.02] transition-all shadow-xl shadow-rio-yellow/20"
                                    >
                                        Tour anfragen
                                    </Link>
                                    <a
                                        href={`${whatsappLink}?text=${customWhatsappMsg}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-md border border-white/30 text-white rounded-full font-medium text-lg hover:bg-white/20 transition-all"
                                    >
                                        <Phone className="w-5 h-5" />
                                        Auf WhatsApp schreiben
                                    </a>
                                </div>
                            </div>
                        </FadeIn>
                    </div>
                </section>

                {/* Banner Sazonalidade */}
                <div className="bg-rio-yellow/10 border-b border-rio-yellow/30">
                    <div className="max-w-7xl mx-auto px-5 lg:px-8 py-3">
                        <p className="text-sm font-medium text-gray-700 text-center">
                            📅 <span className="font-bold">Diese Tour ist nur während der Karnevalszeit verfügbar</span> — Februar/März 2027
                        </p>
                    </div>
                </div>

                {/* SEÇÃO B — Texto Intro SEO */}
                <section className="py-20 lg:py-28 bg-white">
                    <div className="max-w-7xl mx-auto px-5 lg:px-8">
                        <FadeIn direction="up">
                            <div className="max-w-[800px] mx-auto space-y-8 text-left">
                                <p className="text-xl lg:text-2xl font-semibold text-gray-900 leading-snug">
                                    Der Karneval in Rio de Janeiro ist mehr als eine Party — er ist das kulturelle Herz Brasiliens. Millionen Menschen feiern tagelang auf den Straßen, die Samba-Schulen liefern atemberaubende Shows im Sambódromo, und die ganze Stadt vibriert vor Energie und Lebensfreude.
                                </p>
                                <div className="space-y-6 text-lg text-gray-600 leading-relaxed">
                                    <p>
                                        Aber der Karneval kann für Erstbesucher auch überwältigend sein: Welche Blocos lohnen sich? Wie kommt man sicher an Tickets für das Sambódromo? Wo feiert man am besten, ohne sich unsicher zu fühlen? Genau hier komme ich ins Spiel. Als Carioca habe ich den Karneval mein ganzes Leben lang gefeiert und kenne jeden Trick, jede Abkürzung und die besten Spots — abseits der Touristenmassen.
                                    </p>
                                </div>
                                <p className="text-lg font-semibold text-gray-900 pt-8 border-t border-gray-200">
                                    Vom Sambódromo über die besten Blocos de Rua bis zu den legendären Ensaios der Samba-Schulen — schreib mir und ich mache deinen Karneval in Rio unvergesslich.
                                </p>
                            </div>
                        </FadeIn>
                    </div>
                </section>

                {/* SEÇÃO C — Erlebnisse beim Karneval */}
                <section className="py-20 bg-gray-50 border-t border-gray-100">
                    <div className="max-w-7xl mx-auto px-5 lg:px-8">
                        <FadeIn direction="up" className="mb-12 text-center lg:text-left">
                            <h2 className="text-3xl lg:text-4xl font-heading font-bold text-gray-900 leading-tight">
                                Karneval in Rio de Janeiro — <span className="text-rio-green">3 unvergessliche Erlebnisse</span>
                            </h2>
                            <p className="mt-4 text-gray-600 text-lg">
                                Der Karneval hat viele Gesichter. Hier sind die drei Erlebnisse, die du nicht verpassen darfst.
                            </p>
                        </FadeIn>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {karnevalExperiences.map((exp, index) => {
                                const hasLink = "link" in exp && !!(exp as any).link;
                                const cardContent = (
                                    <>
                                        <div className="h-56 w-full relative overflow-hidden bg-gray-100">
                                            <Image
                                                src={exp.image}
                                                alt={exp.name}
                                                fill
                                                loading="lazy"
                                                className="object-cover group-hover:scale-105 transition-transform duration-700"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                            <div className="absolute top-3 left-3 flex flex-wrap items-center gap-2">
                                                {exp.badges.map((badge) => (
                                                    <span key={badge} className="text-xs font-bold px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-sm text-gray-700 shadow-sm uppercase tracking-wider">
                                                        {badge}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="p-8 flex flex-col flex-grow">
                                            <h3 className="text-2xl font-bold font-heading text-gray-900 mb-2">{exp.name}</h3>
                                            <p className="text-gray-500 text-sm mb-3">{exp.desc}</p>
                                            <p className="text-gray-400 text-xs italic flex-grow">💡 {exp.tip}</p>
                                            {hasLink && (
                                                <div className="mt-6 pt-6 border-t border-gray-50">
                                                    <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-rio-green group-hover:gap-2.5 transition-all duration-200">
                                                        Mehr erfahren
                                                        <ChevronRight className="w-4 h-4" />
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </>
                                );
                                return hasLink ? (
                                    <FadeIn key={index} delay={index * 0.1} direction="up">
                                        <Link href={(exp as any).link} className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:scale-[1.01] border border-gray-100 transition-all duration-300 group flex flex-col h-full cursor-pointer block">
                                            {cardContent}
                                        </Link>
                                    </FadeIn>
                                ) : (
                                    <FadeIn key={index} delay={index * 0.1} direction="up" className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl border border-gray-100 transition-all duration-300 group flex flex-col h-full">
                                        {cardContent}
                                    </FadeIn>
                                );
                            })}
                        </div>
                    </div>
                </section>

                {/* SEÇÃO D — CTA Final */}
                <section className="py-24 relative overflow-hidden bg-rio-green border-t-4 border-rio-yellow">
                    <div className="absolute inset-0 bg-[url('/images/rio-background.webp')] bg-cover bg-center mix-blend-overlay opacity-10"></div>
                    <div className="relative max-w-4xl mx-auto px-5 text-center">
                        <FadeIn direction="up">
                            <h2 className="text-3xl lg:text-5xl font-heading font-black text-white mb-6">
                                Karneval in Rio de Janeiro — <br className="hidden sm:block" />
                                <span className="text-rio-yellow text-2xl lg:text-4xl">mit einem Carioca an deiner Seite.</span>
                            </h2>
                            <p className="text-lg text-rio-sand/90 mb-10 max-w-2xl mx-auto leading-relaxed">
                                Schreib mir per WhatsApp oder E-Mail und ich plane deinen perfekten Karneval — von Sambódromo-Tickets bis zu den besten Blocos, sicher und unvergesslich.
                            </p>
                            <div className="flex flex-col sm:flex-row justify-center gap-4">
                                <Link
                                    href="/anfrage?von=site&tour=karneval-tour"
                                    className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-rio-yellow text-gray-900 rounded-full font-bold text-lg hover:bg-yellow-400 hover:scale-[1.02] transition-all shadow-xl shadow-black/10"
                                >
                                    Tour anfragen
                                </Link>
                                <a
                                    href={`${whatsappLink}?text=${customWhatsappMsg}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-md border border-white/30 text-white rounded-full font-medium text-lg hover:bg-white/20 transition-all"
                                >
                                    <Phone className="w-5 h-5" />
                                    WhatsApp an uns
                                </a>
                                <Link
                                    href="/kontakt"
                                    className="inline-flex items-center justify-center px-2 py-4 text-sm text-white/70 underline underline-offset-4 hover:text-white transition-colors"
                                >
                                    Lieber per E-Mail?
                                </Link>
                            </div>
                        </FadeIn>
                    </div>
                </section>

                {/* SEÇÃO E — Interne Linkagem */}
                <AndereTouren currentSlug="karneval" />
            </main>

            <FooterServer />
        </div>
    );
}

import Link from "next/link";
import Image from "next/image";
import NavbarServer from "@/components/NavbarServer";
import FooterServer from "@/components/FooterServer";
import FadeIn from "@/components/FadeIn";
import {
    ChevronRight,
    Phone,
    CalendarDays,
    Clock,
    Activity,
} from "lucide-react";
import AndereTouren from "@/components/AndereTouren";
import { getSettings, buildContactUrls } from "@/lib/settings";

export const metadata = {
    title: "Favela Tour Rio de Janeiro: sicher & authentisch",
    description: "Favela Tour in Rio de Janeiro auf Deutsch mit lokalem Guide. Favela Santa Marta & Rocinha erklärt. Sicher, authentisch, unvergesslich.",
    alternates: {
        canonical: "https://riofuerdeutsche.de/touren/favela-tour",
    },
    openGraph: {
        url: "https://riofuerdeutsche.de/touren/favela-tour",
    },
};

const estimatedTourDuration = "2–3 Stunden";

const favelaExperiences = [
    {
        name: "Rocinha",
        time: "~3 Stunden",
        effort: "Leicht",
        image: "/images/rocinha.webp",
        link: "/rio-guide/sehenswuerdigkeiten/rocinha",
        desc: "Rocinha ist die größte Favela Brasiliens, mit über 100.000 Einwohnern eine Stadt in der Stadt. Bäckereien, Restaurants, Schulen, Handwerker und Künstler, die ihre eigene Wirtschaft aufgebaut haben. Was hier auf den ersten Blick wie ein Viertel aussieht, ist in Wirklichkeit eine pulsierende Gemeinschaft voller Kreativität und Energie, mit einer der besten Aussichten auf Rio, die kein Reiseführer kennt.",
        tip: "Ich kenne die Familien in der Rocinha seit Jahren. Wir trinken Kaffee, hören Geschichten, sehen Orte, die kein normaler Tourist betritt. Tourismus, der hier ankommt, stärkt die lokale Wirtschaft direkt.",
        style: { objectPosition: "50% 5%" }
    },
    {
        name: "The Maze (Tavares Bastos)",
        time: "~2 Stunden",
        effort: "Leicht",
        image: "/images/the-maze.webp",
        link: "/rio-guide/sehenswuerdigkeiten/the-maze",
        desc: "The Maze ist einer der außergewöhnlichsten Orte in ganz Rio de Janeiro. Auf dem Morro Tavares Bastos im Stadtteil Catete hat der ehemalige BBC-Korrespondent Bob Nadkarni über vier Jahrzehnte ein labyrintisches Kulturzentrum geschaffen, mit Kunstgalerie, Bar und Hostel in einem. Die Wände sind mit handgefertigten Mosaiken internationaler Künstler geschmückt, und die Dachterrasse bietet einen der spektakulärsten Ausblicke der Stadt über die Guanabara-Bucht und den Zuckerhut.",
        tip: "The Maze ist am besten mit einem lokalen Guide zu erleben. Man erreicht den Morro Tavares Bastos mit kleinen VW-Vans ab der Rua Bento Lisboa im Catete. Ich begleite dich den ganzen Weg und erzähle dir die faszinierende Geschichte dieses Ortes und seiner Gemeinschaft."
    },
    {
        name: "Favela Santa Marta",
        time: "~2 Stunden",
        effort: "Leicht",
        image: "/images/rio-favela.webp",
        link: "/rio-guide/sehenswuerdigkeiten/santa-marta",
        desc: "Favela Santa Marta ist eine der geschichtsträchtigsten Favelas Rio de Janeiros, und weltberühmt als Drehort von Michael Jacksons Musikvideo \"They Don't Care About Us\" (1996). Mit rund 8.000 Einwohnern liegt sie auf einem steilen Hügel in Botafogo und bietet von oben einen atemberaubenden Blick auf den Cristo Redentor, die Lagoa und die Bucht von Botafogo. Als erste offiziell befriedete (pacificada) Favela Rios gilt sie als Vorbild für die gesamte Stadt, und ist ideal für deine erste Favela-Erfahrung.",
        tip: "Die lebensgroße Michael-Jackson-Statue auf dem Platz, wo das berühmte Video gedreht wurde, ist ein beliebter Fotospot. Nimm den Teleférico (Seilbahn). Er ist kostenlos und ersetzt die steilen Stufen mit einem Panoramablick über Rio.",
        badge: "Botafogo"
    }
];

export default async function FavelaTourPage() {
    const settings = await getSettings()

    const { whatsappHref: whatsappLink } = buildContactUrls(settings)
    const customWhatsappMsg = encodeURIComponent("Hallo! Ich interessiere mich für eine Favela Tour in Rio de Janeiro. Kannst du mir mehr erzählen?");

    return (
        <div className="flex flex-col min-h-screen bg-rio-sand selection:bg-rio-green selection:text-white font-sans">
            <NavbarServer />

            <main className="flex-grow">
                {/* SEÇÃO A — Hero */}
                <section className="relative pt-32 pb-24 lg:pt-40 lg:pb-32 overflow-hidden bg-gray-900 border-b-4 border-rio-yellow">
                    {/* Overlay & Background */}
                    <div className="absolute inset-0 z-0">
                        <Image
                            src="/images/vidigal.webp"
                            alt="Favela Tour in Rio de Janeiro"
                            fill
                            priority
                            fetchPriority="high"
                            quality={90}
                            className="object-cover object-center"
                        />
                        <div className="absolute inset-0 bg-black/60"></div>
                    </div>

                    <div className="relative z-10 max-w-7xl mx-auto px-5 lg:px-8">
                        <FadeIn direction="up">
                            {/* Breadcrumb */}
                            <nav className="flex items-center text-sm font-medium text-white/60 mb-8" aria-label="Breadcrumb">
                                <Link href="/" className="hover:text-rio-yellow transition-colors">Startseite</Link>
                                <ChevronRight className="w-4 h-4 mx-2 text-white/30" />
                                <Link href="/touren" className="hover:text-rio-yellow transition-colors">Touren & Ausflüge</Link>
                                <ChevronRight className="w-4 h-4 mx-2 text-white/30" />
                                <span className="text-rio-yellow">Favela Tour</span>
                            </nav>

                            <div className="max-w-3xl space-y-6">
                                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-sm font-medium">
                                    <CalendarDays className="w-4 h-4 text-rio-yellow" />
                                    <span>Privattouren auf Deutsch · {estimatedTourDuration} · {favelaExperiences.length} Highlights</span>
                                </div>

                                <h1 className="text-4xl lg:text-[clamp(32px,3.5vw,52px)] font-heading font-black text-white leading-[1.15] tracking-tight whitespace-normal lg:whitespace-nowrap">
                                    Favela Tour <span className="whitespace-nowrap">Rio de Janeiro</span>
                                </h1>
                                <p className="text-xl lg:text-2xl xl:text-3xl font-bold text-rio-yellow mt-4">
                                    Authentisch &amp; Sicher, auf Deutsch mit lokalem Guide
                                </p>

                                <div className="pt-6 flex flex-col sm:flex-row gap-4">
                                    {/* Primário passa a ser a Anfrage, com o slug da própria rota:
                                        assim dá pra saber qual página de tour converte. O WhatsApp
                                        continua visível ao lado, nunca escondido. */}
                                    <Link
                                        href="/anfrage?von=site&tour=favela-tour"
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

                {/* SEÇÃO B — Texto Intro SEO */}
                <section className="py-20 lg:py-28 bg-white">
                    <div className="max-w-7xl mx-auto px-5 lg:px-8">
                        <FadeIn direction="up">
                            <div className="max-w-[800px] mx-auto space-y-8 text-left">
                                <p className="text-xl lg:text-2xl font-semibold text-gray-900 leading-snug">
                                    Eine Favela Tour in Rio de Janeiro ist eines der eindrucksvollsten Erlebnisse, das diese Stadt zu bieten hat, vorausgesetzt, du machst sie mit jemandem, der dort aufgewachsen ist. Rund ein Viertel der Bevölkerung lebt in diesen Vierteln, die weit mehr sind als das, was man aus den Nachrichten kennt. Hier pulsiert Kultur, Kreativität und Gemeinschaft, und genau das möchte ich dir zeigen.
                                </p>
                                <div className="space-y-6 text-lg text-gray-600 leading-relaxed">
                                    <p>
                                        Meine Favela Tour ist kein „Armuts-Tourismus". Es geht darum, die Realität der Menschen zu verstehen, lokale Künstler und Unternehmer kennenzulernen und die unglaubliche Aussicht zu genießen, die viele dieser Viertel bieten. Als gebürtiger Carioca kenne ich die Gemeinschaften persönlich und führe die gesamte Tour auf Deutsch, das ist der entscheidende Unterschied zu den üblichen Angeboten. Ich sorge dafür, dass dein Besuch <Link href="/rio-guide/sicherheit/ist-rio-gefaehrlich" className="underline decoration-rio-green/40 underline-offset-2 hover:text-rio-green transition-colors">sicher</Link> und respektvoll abläuft.
                                    </p>
                                    <p>
                                        Wer schon von <Link href="/rio-guide/sehenswuerdigkeiten/rocinha" className="underline decoration-rio-green/40 underline-offset-2 hover:text-rio-green transition-colors">Favela Rocinha</Link> gehört hat, und ja, sie ist die größte Favela Rio de Janeiros und absolut beeindruckend. Für deinen ersten Besuch empfehle ich dir aber <Link href="/rio-guide/sehenswuerdigkeiten/santa-marta" className="underline decoration-rio-green/40 underline-offset-2 hover:text-rio-green transition-colors">Favela Santa Marta besuchen</Link> in Botafogo: überschaubar, lebendig und mit einem atemberaubenden Ausblick vom Teleférico (Seilbahn). Santa Marta war die erste offiziell „befriedete" Favela Rios und wurde weltberühmt durch Michael Jacksons Musikvideo „They Don't Care About Us" (1996). Sie ist der perfekte Einstieg für eine authentische und sichere Favela-Erfahrung in Rio de Janeiro.
                                    </p>
                                </div>
                                <p className="text-lg font-semibold text-gray-900 pt-8 border-t border-gray-200">
                                    Ob das legendäre <Link href="/rio-guide/sehenswuerdigkeiten/the-maze" className="underline decoration-rio-green/40 underline-offset-2 hover:text-rio-green transition-colors">The Maze entdecken</Link>, die beeindruckende <Link href="/rio-guide/sehenswuerdigkeiten/rocinha" className="underline decoration-rio-green/40 underline-offset-2 hover:text-rio-green transition-colors">Rocinha mit Guide</Link> oder das authentische Santa Marta. Schreib mir einfach und ich plane eine Favela Tour, die dir echte Einblicke gibt, ohne dabei die Würde der Bewohner zu vergessen.
                                </p>
                            </div>
                        </FadeIn>
                    </div>
                </section>

                {/* SEÇÃO C — Cards de Experiência */}
                <section className="py-20 bg-gray-50 border-t border-gray-100">
                    <div className="max-w-7xl mx-auto px-5 lg:px-8">
                        <FadeIn direction="up" className="mb-12 text-center lg:text-left">
                            <h2 className="text-3xl lg:text-4xl font-heading font-bold text-gray-900 leading-tight">
                                Favela Santa Marta, Rocinha &amp; The Maze: <span className="text-rio-green">3 besondere Erlebnisse</span>
                            </h2>
                            <p className="mt-4 text-gray-600 text-lg">
                                Jede Favela in Rio de Janeiro hat ihre eigene Geschichte. Hier sind die drei Erlebnisse, die ich dir zeigen möchte.
                            </p>
                        </FadeIn>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {favelaExperiences.map((exp, index) => {
                                const hasLink = "link" in exp && !!(exp as any).link;
                                const cardContent = (
                                    <>
                                        <div className="h-64 lg:h-80 w-full relative overflow-hidden bg-gray-100">
                                            <Image
                                                src={exp.image}
                                                alt={exp.name}
                                                fill
                                                loading="lazy"
                                                className="object-cover scale-110 group-hover:scale-115 transition-transform duration-700"
                                                style={(exp as any).style}
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                            <div className="absolute top-3 left-3 flex items-center gap-2 flex-wrap">
                                                {(exp as any).badge && (
                                                    <div className="flex items-center gap-2 text-[10px] font-bold px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-sm text-blue-700 shadow-sm uppercase tracking-wider">
                                                        {(exp as any).badge}
                                                    </div>
                                                )}
                                                <div className="flex items-center gap-2 text-[10px] font-bold px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-sm text-gray-700 shadow-sm uppercase tracking-wider">
                                                    <Clock className="w-3.5 h-3.5 text-gray-400" />
                                                    {exp.time}
                                                </div>
                                                <div className="flex items-center gap-2 text-[10px] font-bold px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-sm text-green-700 shadow-sm uppercase tracking-wider">
                                                    <Activity className="w-3.5 h-3.5" />
                                                    {exp.effort}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="p-8 flex flex-col flex-grow">
                                            <h3 className="text-2xl font-bold font-heading text-gray-900 mb-4">{exp.name}</h3>
                                            <p className="text-gray-600 text-sm mb-4 leading-relaxed flex-grow">{exp.desc}</p>
                                            <p className="text-gray-400 text-xs italic flex-grow">💡 {exp.tip}</p>
                                            {hasLink && (
                                                <div className="mt-6 pt-6 border-t border-gray-100">
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
                                Favela Tour in Rio de Janeiro, <br className="hidden sm:block" />
                                <span className="text-rio-yellow text-2xl lg:text-4xl">respektvoll und unvergesslich.</span>
                            </h2>
                            <p className="text-lg text-rio-sand/90 mb-10 max-w-2xl mx-auto leading-relaxed">
                                Schreib mir per WhatsApp oder E-Mail und ich organisiere eine sichere und authentische Favela Tour für dich, mit echtem Einblick in die Kultur und Gemeinschaft.
                            </p>
                            <div className="flex flex-col sm:flex-row justify-center gap-4">
                                <Link
                                    href="/anfrage?von=site&tour=favela-tour"
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
                <AndereTouren currentSlug="favela-tour" />
            </main>

            <FooterServer />
        </div>
    );
}


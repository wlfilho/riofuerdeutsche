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
    title: "Kultur & Geschichte Tour in Rio — Museen & Architektur",
    description: "Entdecke die kulturelle Seite von Rio de Janeiro — vom Museu do Amanhã über die Confeitaria Colombo bis zum Teatro Municipal. Geführte Tour auf Deutsch mit einem echten Carioca.",
    alternates: {
        canonical: "https://riofuerdeutsche.de/touren/kultur-und-geschichte",
    },
    openGraph: {
        url: "https://riofuerdeutsche.de/touren/kultur-und-geschichte",
    },
};

const estimatedTourDuration = "4–6 Stunden";

const kulturPlaces = [
    {
        name: "Museu do Amanhã",
        image: "/images/mudeu-do-amanha.webp",
        desc: "Das Museu do Amanhã auf der Praça Mauá ist eines der beeindruckendsten Museen der Welt — nicht nur wegen der Ausstellung über Nachhaltigkeit und Zukunft, sondern auch wegen der spektakulären Architektur von Santiago Calatrava. Das Gebäude ragt wie ein futuristisches Schiff in die Guanabara-Bucht.",
        tip: "Besuche das Museum am Dienstag — dann ist der Eintritt frei. Die beste Zeit ist direkt nach Öffnung, bevor die großen Gruppen kommen.",
        badges: ["Praça Mauá", "~1,5 Stunden"]
    },
    {
        name: "CCBB — Centro Cultural Banco do Brasil",
        image: "/images/centro-cultural-banco-do-brasil.webp",
        desc: "Das CCBB Rio ist eines der meistbesuchten Kulturzentren der Welt und befindet sich in einem prächtigen neoklassizistischen Gebäude im Herzen des Centro. Wechselnde Ausstellungen von Weltklasse, Filmvorführungen, Theater und ein wunderschönes Café — alles bei freiem oder sehr günstigem Eintritt.",
        tip: "Schau vorher auf der Website, welche Ausstellung gerade läuft — das CCBB holt regelmäßig internationale Blockbuster-Ausstellungen nach Rio. Die Tickets sind kostenlos, aber begrenzt.",
        badges: ["Centro", "~1 Stunde"]
    },
    {
        name: "Museu de Arte do Rio (MAR)",
        image: "/images/museu-de-arte-do-rio.webp",
        desc: "Direkt neben dem Museu do Amanhã auf der Praça Mauá verbindet das MAR zwei Gebäude — einen historischen Palast und ein modernes Bauwerk — durch ein wellenförmiges Dach. Die Sammlung erzählt die visuelle Geschichte von Rio durch Kunst, Fotografie und Installationen. Die Dachterrasse bietet einen fantastischen Blick über die Bucht.",
        tip: "Kombiniere den Besuch mit dem Museu do Amanhã — beide liegen direkt nebeneinander und du kannst einen ganzen Vormittag auf der renovierten Praça Mauá verbringen.",
        badges: ["Praça Mauá", "~1 Stunde"]
    },
    {
        name: "Confeitaria Colombo",
        image: "/images/confeitaria-colombo.webp",
        desc: "Die Confeitaria Colombo ist weit mehr als ein Café — sie ist ein lebendiges Denkmal der Belle Époque in Rio. Seit 1894 empfängt sie Gäste unter riesigen belgischen Spiegeln, Jugendstil-Dekor und Marmorsäulen. Hier tranken schon Präsidenten und Dichter ihren Kaffee. Ein Muss für jeden, der die elegante Vergangenheit Rios spüren möchte.",
        tip: 'Bestelle den traditionellen \u201eCafé com Pastel de Nata\u201c und nimm dir Zeit, die Details der Einrichtung zu bewundern — jeder Spiegel und jedes Ornament hat über 130 Jahre Geschichte.',
        badges: ["Centro", "~45 Minuten"]
    },
    {
        name: "Real Gabinete Português de Leitura",
        image: "/images/real-gabinete-portugues-de-leitura.webp",
        desc: "Diese Bibliothek gehört zu den schönsten der Welt — und kaum jemand weiß davon. Das Real Gabinete wurde 1887 eingeweiht und beherbergt über 350.000 Bücher in einem atemberaubenden neo-manuelinischen Saal. Das Licht fällt durch eine farbige Glaskuppel auf die bis zur Decke reichenden Bücherregale — ein Ort wie aus einem Traum.",
        tip: "Der Eintritt ist kostenlos und der Saal ist meist menschenleer. Perfekt für Fotos — aber bitte leise sein, es ist immer noch eine funktionierende Bibliothek!",
        badges: ["Centro", "~30 Minuten"]
    },
    {
        name: "Teatro Municipal",
        image: "/images/teatro-municipal-rj.webp",
        desc: "Das Teatro Municipal ist das prächtigste Gebäude von Rio de Janeiro — inspiriert von der Pariser Opéra Garnier und 1909 eröffnet. Die Fassade, die Innenräume mit Goldverzierungen, die Deckenmalereien und der imposante Theatersaal sind schlichtweg atemberaubend. Auch wer keine Aufführung besucht, sollte die geführte Besichtigung machen.",
        tip: "Die offizielle Führung durch das Theater dauert etwa 45 Minuten und kostet nur wenige Reais. Es lohnt sich auch, die Cinelândia — den Platz vor dem Theater — zu erkunden.",
        badges: ["Cinelândia", "~45 Minuten"]
    },
    {
        name: "Museu Nacional de Belas Artes",
        image: "/images/museu-belas-artes-rio.webp",
        desc: "Direkt neben dem Teatro Municipal beherbergt das Museu Nacional de Belas Artes die wichtigste Kunstsammlung Brasiliens — von der Kolonialzeit bis zur Moderne. Europäische und brasilianische Meisterwerke in einem eleganten Gebäude von 1937. Perfekt für alle, die die Kunstgeschichte des Landes verstehen möchten.",
        tip: "Der Eintritt ist oft kostenlos oder sehr günstig. Besonders sehenswert ist die Sammlung brasilianischer Kunst des 19. Jahrhunderts — sie erzählt die Geschichte des Landes auf beeindruckende Weise.",
        badges: ["Cinelândia", "~1 Stunde"]
    },
    {
        name: "MAM — Museu de Arte Moderna",
        image: "/images/museu-de-arte-moderna-rio-de-janeiro.webp",
        desc: "Das MAM liegt spektakulär im Aterro do Flamengo mit Blick auf die Guanabara-Bucht und den Zuckerhut. Das brutalistische Gebäude von Affonso Eduardo Reidy ist selbst ein Kunstwerk. Drinnen findest du wechselnde Ausstellungen zeitgenössischer Kunst und draußen die beeindruckenden Gärten von Burle Marx.",
        tip: "Kombiniere den Besuch mit einem Spaziergang durch den Aterro do Flamengo — die Gartenanlage ist die größte urbane Parklandschaft der Welt und wurde vom gleichen Landschaftsarchitekten entworfen.",
        badges: ["Aterro do Flamengo", "~1 Stunde"]
    },
    {
        name: "MAC — Niterói",
        image: "/images/museu-de-arte-contemporanea-niteroi-mac.webp",
        desc: "Das von Oscar Niemeyer entworfene MAC thront wie ein UFO auf einer Klippe in Niterói — direkt gegenüber von Rio, auf der anderen Seite der Bucht. Die futuristische Form und die Aussicht auf die gesamte Skyline von Rio machen es zu einem der ikonischsten Gebäude Brasiliens. Die Überfahrt mit der Fähre von der Praça XV gehört zum Erlebnis dazu.",
        tip: "Nimm die Fähre von der Praça XV nach Niterói — die Überfahrt dauert nur 20 Minuten und bietet eine fantastische Aussicht auf Rio. Das MAC ist dann nur eine kurze Busfahrt entfernt.",
        badges: ["Niterói", "~2 Stunden (inkl. Fähre)"]
    },
    {
        name: "Catedral Metropolitana",
        image: "/images/catedral-metropolitana-rio-de-janeiro.webp",
        desc: "Die Catedral Metropolitana de São Sebastião sieht aus wie eine Maya-Pyramide mitten in der Stadt — ein kegelförmiger Betonbau, der 75 Meter in die Höhe ragt. Von außen polarisierend, von innen überwältigend: Vier riesige Buntglasfenster reichen vom Boden bis zur Decke und tauchen den Raum in farbiges Licht. Eine der ungewöhnlichsten Kirchen der Welt.",
        tip: "Der Besuch dauert nur 15-20 Minuten, lohnt sich aber enorm. Das Innere ist besonders beeindruckend, wenn die Sonne durch die Glasfenster scheint — am besten vormittags besuchen.",
        badges: ["Centro / Lapa", "~20 Minuten"]
    },
];

export default async function KulturUndGeschichtePage() {
    const settings = await getSettings()

    const { whatsappHref: whatsappLink } = buildContactUrls(settings)
    const customWhatsappMsg = encodeURIComponent("Hallo! Ich interessiere mich für eine Kultur & Geschichte Tour in Rio. Kannst du mir mehr erzählen?");

    return (
        <div className="flex flex-col min-h-screen bg-rio-sand selection:bg-rio-green selection:text-white font-sans">
            <NavbarServer />

            <main className="flex-grow">
                {/* SEÇÃO A — Hero */}
                <section className="relative pt-32 pb-24 lg:pt-40 lg:pb-32 overflow-hidden bg-gray-900 border-b-4 border-rio-yellow">
                    <div className="absolute inset-0 z-0">
                        <Image
                            src="/images/kultur-und-geschichte-bg.webp"
                            alt="Kultur & Geschichte Tour in Rio de Janeiro — Museu do Amanhã und Centro histórico"
                            fill
                            priority
                            fetchPriority="high"
                            quality={90}
                            className="object-cover object-[center_40%]"
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
                                <span className="text-rio-yellow">Kultur & Geschichte</span>
                            </nav>

                            <div className="max-w-3xl space-y-6">
                                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-sm font-medium">
                                    <CalendarDays className="w-4 h-4 text-rio-yellow" />
                                    <span>Privattouren auf Deutsch · {estimatedTourDuration} · {kulturPlaces.length} Highlights</span>
                                </div>

                                <h1 className="text-4xl lg:text-[clamp(32px,3.5vw,52px)] font-heading font-black text-white leading-[1.15] tracking-tight whitespace-normal lg:whitespace-nowrap">
                                    Kultur & Geschichte Tour in Rio de Janeiro
                                </h1>
                                <p className="text-xl lg:text-2xl xl:text-3xl font-bold text-rio-yellow mt-4">
                                    Museen, Architektur und die faszinierende Geschichte der Stadt
                                </p>

                                <div className="pt-6">
                                    <a
                                        href={`${whatsappLink}?text=${customWhatsappMsg}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-rio-yellow text-gray-900 rounded-full font-bold text-lg hover:bg-yellow-400 hover:scale-[1.02] transition-all shadow-xl shadow-rio-yellow/20"
                                    >
                                        <Phone className="w-5 h-5" />
                                        Tour anfragen
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
                                    Rio de Janeiro ist nicht nur Strand und Samba — die Stadt blickt auf über 450 Jahre Geschichte zurück und beherbergt einige der beeindruckendsten Museen und historischen Gebäude Südamerikas. Vom kolonialen Zentrum bis zur futuristischen Praça Mauá erzählt jede Ecke eine eigene Geschichte.
                                </p>
                                <div className="space-y-6 text-lg text-gray-600 leading-relaxed">
                                    <p>
                                        Bei meiner Kultur & Geschichte Tour zeige ich dir die Seite von Rio, die die meisten Touristen verpassen: prachtvolle Bibliotheken, die wie aus einem Harry-Potter-Film wirken, ein Café aus der Belle Époque, futuristische Museen und Kirchen mit spektakulärer Architektur. Als gebürtiger Carioca bringe ich dir nicht nur die Fakten näher, sondern auch die Geschichten hinter den Gebäuden — auf Deutsch und mit Leidenschaft.
                                    </p>
                                </div>
                                <p className="text-lg font-semibold text-gray-900 pt-8 border-t border-gray-200">
                                    Ob du alle 10 Highlights an einem Tag erleben oder dich auf einige wenige konzentrieren möchtest — schreib mir und ich stelle die perfekte Kultur-Tour für dich zusammen.
                                </p>
                            </div>
                        </FadeIn>
                    </div>
                </section>

                {/* SEÇÃO C — Cards 1–5 */}
                <section className="py-20 bg-gray-50 border-t border-gray-100">
                    <div className="max-w-7xl mx-auto px-5 lg:px-8">
                        <FadeIn direction="up" className="mb-12 text-center lg:text-left">
                            <h2 className="text-3xl lg:text-4xl font-heading font-bold text-gray-900 leading-tight">
                                Kultur & Geschichte in Rio de Janeiro — <span className="text-rio-green">10 besondere Orte</span>
                            </h2>
                            <p className="mt-4 text-gray-600 text-lg">
                                Von futuristischen Museen bis zu kolonialen Schätzen — hier sind die kulturellen Highlights, die ich dir zeigen möchte.
                            </p>
                        </FadeIn>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {kulturPlaces.map((place, index) => {
                                const hasLink = "link" in place && !!(place as any).link;
                                const cardContent = (
                                    <>
                                        <div className="h-56 w-full relative overflow-hidden bg-gray-100">
                                            <Image
                                                src={place.image}
                                                alt={place.name}
                                                fill
                                                loading="lazy"
                                                className="object-cover group-hover:scale-105 transition-transform duration-700"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                            <div className="absolute top-3 left-3 flex flex-wrap items-center gap-2">
                                                {place.badges.map((badge) => (
                                                    <span key={badge} className="text-xs font-bold px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-sm text-gray-700 shadow-sm uppercase tracking-wider">
                                                        {badge}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="p-8 flex flex-col flex-grow">
                                            <h3 className="text-2xl font-bold font-heading text-gray-900 mb-2">{place.name}</h3>
                                            <p className="text-gray-500 text-sm mb-3">{place.desc}</p>
                                            <p className="text-gray-400 text-xs italic flex-grow">💡 {place.tip}</p>
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
                                        <Link href={(place as any).link} className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:scale-[1.01] border border-gray-100 transition-all duration-300 group flex flex-col h-full cursor-pointer block">
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
                                Kultur & Geschichte in Rio de Janeiro —{" "}
                                <span className="text-rio-yellow text-2xl lg:text-4xl">lass es dir von einem Carioca zeigen.</span>
                            </h2>
                            <p className="text-lg text-rio-sand/90 mb-10 max-w-2xl mx-auto leading-relaxed">
                                Schreib mir per WhatsApp oder E-Mail und ich stelle dir die perfekte Kultur-Tour zusammen — ob alle 10 Highlights oder nur deine Favoriten.
                            </p>
                            <div className="flex flex-col sm:flex-row justify-center gap-4">
                                <a
                                    href={`${whatsappLink}?text=${customWhatsappMsg}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-rio-yellow text-gray-900 rounded-full font-bold text-lg hover:bg-yellow-400 hover:scale-[1.02] transition-all shadow-xl shadow-black/10"
                                >
                                    <Phone className="w-5 h-5" />
                                    WhatsApp an uns
                                </a>
                                <Link
                                    href="/kontakt"
                                    className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-md border border-white/30 text-white rounded-full font-medium text-lg hover:bg-white/20 transition-all"
                                >
                                    Kontakt per E-Mail
                                </Link>
                            </div>
                        </FadeIn>
                    </div>
                </section>

                {/* SEÇÃO E — Interne Linkagem */}
                <AndereTouren currentSlug="kultur-geschichte" />
            </main>

            <FooterServer />
        </div>
    );
}

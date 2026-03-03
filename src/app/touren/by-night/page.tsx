import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FadeIn from "@/components/FadeIn";
import {
    ChevronRight,
    Phone,
    CalendarDays,
} from "lucide-react";
import AndereTouren from "@/components/AndereTouren";

export const metadata = {
    title: "Rio by Night — Nachtleben in Rio de Janeiro mit lokalem Guide | RioFürDeutsche",
    description: "Erlebe das Nachtleben von Rio de Janeiro sicher und authentisch — Samba in Lapa, Cocktails in Leblon, Craft-Biere in Botafogo. Dein Carioca-Guide zeigt dir die besten Spots, komplett auf Deutsch."
};

const nightExperiences = [
    {
        name: "Lapa",
        image: "/images/lapa-by-night.webp",
        desc: "Lapa ist das pulsierende Herz des Nachtlebens von Rio. Unter den berühmten Arcos da Lapa findest du Samba-Clubs, Live-Musik-Bars und eine Energie, die ihresgleichen sucht. Freitag- und Samstagnacht verwandeln sich die Straßen in eine riesige Open-Air-Party.",
        tip: "Die besten Samba-Clubs sind die kleinen, unscheinbaren Lokale in den Seitenstraßen — nicht die großen Touristenlokale an der Hauptstraße. Ich zeige dir, wo die Cariocas wirklich tanzen.",
        badges: ["Samba & Live-Musik", "Freitag & Samstag"]
    },
    {
        name: "Leblon",
        image: "/images/leblon-by-night.webp",
        desc: "Leblon ist das elegante Gegenstück zu Lapa. Hier findest du stilvolle Cocktailbars, gehobene Restaurants und eine entspannte Atmosphäre. Das Viertel gilt als eines der sichersten in Rio und ist perfekt für einen genussvollen Abend mit guten Drinks und noch besserem Essen.",
        tip: "Die Straße Dias Ferreira ist die Gastro-Meile von Leblon — auf wenigen hundert Metern reihen sich die besten Restaurants und Bars aneinander. Reservierung empfohlen!",
        badges: ["Cocktails & Restaurants", "Gehoben & sicher"]
    },
    {
        name: "Botafogo",
        image: "/images/botafogo-by-night.webp",
        desc: "Botafogo ist die kreative Seele des Carioca-Nachtlebens. Craft-Beer-Bars, alternative Kulturräume, Vinyl-Läden mit DJ-Sets und eine junge, lokale Szene, die weit weg vom Touristentrubel feiert. Hier erlebst du das authentischste Nachtleben Rios.",
        tip: "Die Gegend rund um die Rua Nelson Mandela und Rua Voluntários da Pátria hat die höchste Dichte an coolen Bars in ganz Rio. Perfekt für einen Bar-Hopping-Abend.",
        badges: ["Craft Beer & Alternative Szene", "Lokal & authentisch"]
    },
    {
        name: "Copacabana",
        image: "/images/quiosque-copacabana-by-night.webp",
        desc: "Copacabana bei Nacht hat einen ganz besonderen Charme. Die beleuchtete Strandpromenade, Bars direkt am Meer und das bunte Treiben auf der Avenida Atlântica schaffen eine einzigartige Atmosphäre. Von entspannten Kiosks am Strand bis zu Live-Musik in historischen Bars — Copa hat für jeden etwas.",
        tip: "Der Kiosk am Posto 6 ist der perfekte Ort für ein kaltes Bier mit Blick auf den beleuchteten Strand. Danach geht's weiter in die Seitenstraßen, wo die lokalen Bars versteckt sind.",
        badges: ["Strandpromenade & Bars", "Klassisch & lebendig"]
    },
    {
        name: "Santa Teresa",
        image: "/images/santa-teresa-by-night.webp",
        desc: "Santa Teresa thront auf einem Hügel über der Stadt und bietet das romantischste Nachtleben Rios. Kleine Bars mit Aussicht, Kunstgalerien die abends öffnen und eine bohème Atmosphäre, die an europäische Altstädte erinnert — nur mit tropischem Flair und einem Panoramablick über Rio.",
        tip: "Der Largo do Guimarães ist das Zentrum des Nachtlebens in Santa Teresa. Starte dort mit einem Caipirinha und lass dich durch die Gassen treiben — du wirst überrascht sein, was du findest.",
        badges: ["Rooftop-Bars & Kunst", "Romantisch & bohème"]
    }
];

export default function RioByNightPage() {
    const whatsappLink = "https://wa.me/573148704374";
    const customWhatsappMsg = encodeURIComponent("Hallo! Ich interessiere mich für eine Rio by Night Tour. Kannst du mir mehr erzählen?");

    return (
        <div className="flex flex-col min-h-screen bg-rio-sand selection:bg-rio-green selection:text-white font-sans">
            <Navbar />

            <main className="flex-grow">
                {/* SEÇÃO A — Hero */}
                <section className="relative pt-32 pb-24 lg:pt-40 lg:pb-32 overflow-hidden bg-gray-900 border-b-4 border-rio-yellow">
                    <div className="absolute inset-0 z-0">
                        <Image
                            src="https://images.unsplash.com/photo-1516834611397-8d633eaec5c0?w=1920&h=800&fit=crop&q=80"
                            alt="Rio by Night — Nachtleben in Rio de Janeiro"
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
                            <nav className="flex items-center text-sm font-medium text-white/60 mb-8" aria-label="Breadcrumb">
                                <Link href="/" className="hover:text-rio-yellow transition-colors">Startseite</Link>
                                <ChevronRight className="w-4 h-4 mx-2 text-white/30" />
                                <Link href="/touren" className="hover:text-rio-yellow transition-colors">Touren & Ausflüge</Link>
                                <ChevronRight className="w-4 h-4 mx-2 text-white/30" />
                                <span className="text-rio-yellow">Rio by Night</span>
                            </nav>

                            <div className="max-w-3xl space-y-6">
                                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-sm font-medium">
                                    <CalendarDays className="w-4 h-4 text-rio-yellow" />
                                    <span>Privattouren auf Deutsch · 3–4 Stunden · 5 Erlebnisse</span>
                                </div>

                                <h1 className="text-4xl lg:text-[clamp(32px,3.5vw,52px)] font-heading font-black text-white leading-[1.15] tracking-tight whitespace-normal lg:whitespace-nowrap">
                                    Rio by Night
                                </h1>
                                <p className="text-xl lg:text-2xl xl:text-3xl font-bold text-rio-yellow mt-4">
                                    Das beste Nachtleben mit einem echten Carioca
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
                                    Wenn die Sonne untergeht, erwacht Rio de Janeiro erst richtig zum Leben. Samba-Rhythmen in Lapa, Cocktails mit Meerblick in Leblon, Craft-Biere in den versteckten Bars von Botafogo — das Nachtleben dieser Stadt ist legendär und so vielfältig wie die Cariocas selbst.
                                </p>
                                <div className="space-y-6 text-lg text-gray-600 leading-relaxed">
                                    <p>
                                        Aber nachts in einer fremden Stadt unterwegs zu sein kann auch verunsichern — besonders in Rio. Genau deshalb bin ich an deiner Seite. Als gebürtiger Carioca kenne ich die sicheren Spots, die besten Bars und die Orte, an denen die Stimmung wirklich einzigartig ist. Kein Touristenfallen, keine unsicheren Ecken — nur das echte Rio bei Nacht.
                                    </p>
                                </div>
                                <p className="text-lg font-semibold text-gray-900 pt-8 border-t border-gray-200">
                                    Von der lebhaften Samba-Szene in Lapa bis zu den entspannten Rooftop-Bars in Santa Teresa — schreib mir und ich stelle dir die perfekte Nacht in Rio zusammen.
                                </p>
                            </div>
                        </FadeIn>
                    </div>
                </section>

                {/* SEÇÃO C — Erlebnisse bei Nacht */}
                <section className="py-20 bg-gray-50 border-t border-gray-100">
                    <div className="max-w-7xl mx-auto px-5 lg:px-8">
                        <FadeIn direction="up" className="mb-12 text-center lg:text-left">
                            <h2 className="text-3xl lg:text-4xl font-heading font-bold text-gray-900 leading-tight">
                                Nachtleben in Rio de Janeiro — <span className="text-rio-green">5 Viertel, 5 Erlebnisse</span>
                            </h2>
                            <p className="mt-4 text-gray-600 text-lg">
                                Jedes Viertel hat seinen eigenen Charakter. Hier sind die besten Spots für deine Nacht in Rio.
                            </p>
                        </FadeIn>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {nightExperiences.map((exp, index) => (
                                <FadeIn key={index} delay={index * 0.1} direction="up" className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl border border-gray-100 transition-all duration-300 group flex flex-col h-full">
                                    <div className="h-56 w-full relative overflow-hidden bg-gray-100">
                                        <Image
                                            src={exp.image}
                                            alt={exp.name}
                                            fill
                                            loading="lazy"
                                            className="object-cover group-hover:scale-105 transition-transform duration-700"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                    </div>
                                    <div className="p-8 flex flex-col flex-grow">
                                        <h3 className="text-2xl font-bold font-heading text-gray-900 mb-2">{exp.name}</h3>
                                        <p className="text-gray-500 text-sm mb-3">{exp.desc}</p>
                                        <p className="text-gray-400 text-xs italic mb-6 flex-grow">💡 {exp.tip}</p>
                                        <div className="flex flex-wrap items-center gap-2 pt-6 border-t border-gray-50">
                                            {exp.badges.map((badge) => (
                                                <span key={badge} className="text-xs font-bold px-3 py-1.5 rounded-full bg-gray-100 text-gray-600 uppercase tracking-wider">
                                                    {badge}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </FadeIn>
                            ))}
                        </div>
                    </div>
                </section>

                {/* SEÇÃO D — CTA Final */}
                <section className="py-24 relative overflow-hidden bg-rio-green border-t-4 border-rio-yellow">
                    <div className="absolute inset-0 bg-[url('/images/rio-background.webp')] bg-cover bg-center mix-blend-overlay opacity-10"></div>
                    <div className="relative max-w-4xl mx-auto px-5 text-center">
                        <FadeIn direction="up">
                            <h2 className="text-3xl lg:text-5xl font-heading font-black text-white mb-6">
                                Deine Nacht in Rio de Janeiro — <br className="hidden sm:block" />
                                <span className="text-rio-yellow text-2xl lg:text-4xl">sicher und unvergesslich.</span>
                            </h2>
                            <p className="text-lg text-rio-sand/90 mb-10 max-w-2xl mx-auto leading-relaxed">
                                Schreib mir auf WhatsApp und ich plane den perfekten Abend für dich — von Samba bis Cocktails, immer sicher und mit Insider-Wissen.
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
                                    href="/#kontakt"
                                    className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-md border border-white/30 text-white rounded-full font-medium text-lg hover:bg-white/20 transition-all"
                                >
                                    Zum Kontaktformular
                                </Link>
                            </div>
                        </FadeIn>
                    </div>
                </section>

                {/* SEÇÃO E — Interne Linkagem */}
                <AndereTouren currentSlug="night" />
            </main>

            <Footer />
        </div>
    );
}

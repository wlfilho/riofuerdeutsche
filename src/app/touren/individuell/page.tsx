import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FadeIn from "@/components/FadeIn";
import { ChevronRight, Phone, CalendarDays } from "lucide-react";
import AndereTouren from "@/components/AndereTouren";

export const metadata = {
    title: "Individuelle Tour in Rio — dein Wunschtag mit Guide",
    description: "Plane deine individuelle Tour in Rio de Janeiro — du bestimmst die Orte, das Tempo und die Interessen. Dein persönlicher Carioca-Guide organisiert den perfekten Tag, komplett auf Deutsch.",
    alternates: {
        canonical: "https://riofuerdeutsche.de/touren/individuell",
    },
    openGraph: {
        url: "https://riofuerdeutsche.de/touren/individuell",
    },
};

export default function IndividuelleTourPage() {
    return (
        <div className="flex flex-col min-h-screen bg-rio-sand selection:bg-rio-green selection:text-white font-sans">
            <Navbar />

            <main className="flex-grow">
                {/* Hero Section */}
                <section className="relative pt-32 pb-24 lg:pt-40 lg:pb-32 overflow-hidden bg-gray-900 border-b-4 border-rio-yellow">
                    <div className="absolute inset-0 z-0">
                        <Image
                            src="https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=1920&h=800&fit=crop&q=80"
                            alt="Individuelle Tour in Rio de Janeiro"
                            fill
                            priority
                            fetchPriority="high"
                            quality={90}
                            className="object-cover object-center"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent"></div>
                    </div>

                    <div className="relative z-10 max-w-7xl mx-auto px-5 lg:px-8">
                        <FadeIn direction="up">
                            <nav className="flex items-center text-sm font-medium text-gray-400 mb-8" aria-label="Breadcrumb">
                                <Link href="/" className="hover:text-rio-yellow transition-colors">Startseite</Link>
                                <ChevronRight className="w-4 h-4 mx-2 text-gray-600" />
                                <Link href="/touren" className="hover:text-rio-yellow transition-colors">Touren & Ausflüge</Link>
                                <ChevronRight className="w-4 h-4 mx-2 text-gray-600" />
                                <span className="text-rio-yellow">Individuelle Tour</span>
                            </nav>

                            <div className="max-w-3xl space-y-6">
                                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-sm font-medium">
                                    <CalendarDays className="w-4 h-4 text-rio-yellow" />
                                    <span>Privattouren auf Deutsch · Flexibel · Auf Anfrage</span>
                                </div>

                                <h1 className="text-4xl lg:text-[clamp(32px,3.8vw,52px)] font-heading font-black text-white leading-[1.15] tracking-tight whitespace-normal xl:whitespace-nowrap">
                                    Individuelle Tour in Rio de Janeiro
                                </h1>
                                <p className="text-xl lg:text-2xl xl:text-3xl font-bold text-rio-yellow mt-4">
                                    Dein Wunschtag — du bestimmst, ich organisiere
                                </p>

                                <div className="pt-6">
                                    <a
                                        href="https://wa.me/573148704374?text=Hallo! Ich möchte eine individuelle Tour in Rio planen. Kannst du mir helfen?"
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

                {/* Text Intro */}
                <section className="py-20 lg:py-28 bg-white">
                    <div className="max-w-7xl mx-auto px-5 lg:px-8">
                        <FadeIn direction="up">
                            <div className="max-w-[800px] mx-auto space-y-8 text-left">
                                <p className="text-xl lg:text-2xl font-semibold text-gray-900 leading-snug">
                                    Keine der Touren passt perfekt zu dir? Dann lass uns deinen eigenen Tag in Rio zusammenstellen. Du sagst mir, was dich interessiert — ich plane den Rest.
                                </p>
                                <div className="space-y-6 text-lg text-gray-600 leading-relaxed">
                                    <p>
                                        Vielleicht willst du morgens den Cristo besuchen, mittags in einer Favela authentisch essen und abends Samba in Lapa erleben. Oder du hast nur vier Stunden vor dem Flug und willst das Maximum rausholen. Vielleicht reist du mit Kindern, mit deinen Eltern oder als Paar auf Hochzeitsreise — jede Situation ist anders, und genau dafür gibt es die individuelle Tour.
                                    </p>
                                    <p>
                                        Als gebürtiger Carioca, der in Deutschland gelebt hat, verstehe ich genau, was deutsche Reisende erwarten: Pünktlichkeit, klare Kommunikation, Sicherheit und gleichzeitig echte, ungeschönte Erlebnisse. Ich passe jede Tour an deine Wünsche, dein Tempo und dein Budget an.
                                    </p>
                                </div>
                                <p className="text-lg font-semibold text-gray-900 pt-8 border-t border-gray-200">
                                    Schreib mir einfach auf WhatsApp, was du dir vorstellst — und innerhalb von 24 Stunden bekommst du einen Vorschlag für deinen perfekten Tag in Rio.
                                </p>
                            </div>
                        </FadeIn>
                    </div>
                </section>

                {/* Seção 1: So funktioniert's */}
                <section className="py-24 bg-gray-50 border-t border-gray-100">
                    <div className="max-w-7xl mx-auto px-5 lg:px-8">
                        <FadeIn direction="up" className="text-center mb-16">
                            <h2 className="text-3xl lg:text-4xl font-heading font-bold text-gray-900">
                                So funktioniert&apos;s — in 3 einfachen Schritten
                            </h2>
                        </FadeIn>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {[
                                {
                                    num: "01",
                                    icon: "💬",
                                    title: "Schreib mir deine Wünsche",
                                    desc: "Erzähl mir, was dich interessiert: Sehenswürdigkeiten, Strände, Kultur, Fußball, Essen — alles ist möglich. Sag mir auch, wie viele Tage du hast, mit wem du reist und welches Tempo dir am liebsten ist."
                                },
                                {
                                    num: "02",
                                    icon: "📋",
                                    title: "Ich plane deinen Tag",
                                    desc: "Innerhalb von 24 Stunden bekommst du einen individuellen Vorschlag mit Ablauf, Highlights und Tipps — kostenlos und unverbindlich. Du entscheidest, ob und was du ändern möchtest."
                                },
                                {
                                    num: "03",
                                    icon: "🚀",
                                    title: "Wir erleben Rio zusammen",
                                    desc: "Am Tag deiner Tour hole ich dich ab und wir starten. Alles ist organisiert — Transport, Tickets, Restaurants. Du genießt einfach den Tag, ich kümmere mich um den Rest. Komplett auf Deutsch."
                                }
                            ].map((step, i) => (
                                <FadeIn key={i} delay={0.1 * i} direction="up" className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm relative pt-12">
                                    <div className="absolute -top-6 left-8 bg-rio-yellow text-gray-900 font-heading font-black text-xl w-12 h-12 flex items-center justify-center rounded-full shadow-lg">
                                        {step.num}
                                    </div>
                                    <div className="text-4xl mb-6">
                                        {step.icon}
                                    </div>
                                    <h3 className="text-xl font-bold font-heading text-gray-900 mb-4">
                                        {step.title}
                                    </h3>
                                    <p className="text-gray-600 leading-relaxed text-sm">
                                        {step.desc}
                                    </p>
                                </FadeIn>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Seção 2: Beispiele */}
                <section className="py-24 bg-white border-t border-gray-100">
                    <div className="max-w-7xl mx-auto px-5 lg:px-8 text-center">
                        <FadeIn direction="up" className="mb-12">
                            <h2 className="text-3xl font-heading font-bold text-gray-900">
                                Was alles möglich ist
                            </h2>
                        </FadeIn>

                        <div className="max-w-5xl mx-auto">
                            <div className="flex flex-col gap-4">
                                {[
                                    { text: "🏔️ Cristo + Zuckerhut + Sonnenuntergang am Arpoador", bold: "Klassiker an einem Tag" },
                                    { text: "🌿 Tijuca-Wanderung + Prainha + Açaí am Strand", bold: "Natur & Entspannung" },
                                    { text: "🏛️ Museu do Amanhã + Confeitaria Colombo + Santa Teresa", bold: "Kultur & Geschichte" },
                                    { text: "⚽ Maracanã-Tour + Fußballspiel abends", bold: "Für Fußball-Fans" },
                                    { text: "👨‍👩‍👧‍👦 Zuckerhut + AquaRio + Strandnachmittag", bold: "Perfekt für Familien" },
                                    { text: "💑 Sonnenuntergang Arpoador + Dinner in Leblon + Lapa bei Nacht", bold: "Romantischer Abend" }
                                ].map((example, i) => (
                                    <FadeIn key={i} delay={0.05 * i} direction="up">
                                        <div className="bg-gray-50 border border-gray-100 rounded-2xl p-5 flex flex-col md:flex-row md:items-center md:justify-between text-left gap-2 hover:border-rio-yellow hover:shadow-md transition-all">
                                            <span className="text-gray-700 text-sm md:text-base leading-snug">{example.text}</span>
                                            <span className="text-rio-green font-bold text-sm bg-rio-green/10 px-4 py-1.5 rounded-full whitespace-nowrap self-start md:self-auto">
                                                {example.bold}
                                            </span>
                                        </div>
                                    </FadeIn>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Seção 3: CTA Final */}
                <section className="py-24 relative overflow-hidden bg-rio-green border-t-4 border-rio-yellow">
                    <div className="absolute inset-0 bg-[url('/images/rio-background.webp')] bg-cover bg-center mix-blend-overlay opacity-10"></div>
                    <div className="relative max-w-4xl mx-auto px-5 text-center">
                        <FadeIn direction="up">
                            <h2 className="text-3xl lg:text-5xl font-heading font-black text-white mb-6 leading-tight">
                                Deine individuelle Tour in Rio de Janeiro — lass uns loslegen.
                            </h2>
                            <p className="text-lg text-rio-sand/90 mb-10 max-w-2xl mx-auto leading-relaxed">
                                Schreib mir per WhatsApp oder E-Mail, was du dir vorstellst. Innerhalb von 24 Stunden hast du deinen persönlichen Tourenvorschlag — kostenlos und unverbindlich.
                            </p>
                            <div className="flex flex-col sm:flex-row justify-center gap-4">
                                <a
                                    href="https://wa.me/573148704374?text=Hallo! Ich möchte eine individuelle Tour in Rio planen. Kannst du mir helfen?"
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

                <AndereTouren currentSlug="individuell" />
            </main>

            <Footer />
        </div>
    );
}

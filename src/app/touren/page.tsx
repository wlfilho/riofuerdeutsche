import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FadeIn from "@/components/FadeIn";
import { ChevronRight, Phone, CalendarDays } from "lucide-react";

export const metadata = {
    title: "Geführte Touren in Rio de Janeiro — sicher & auf Deutsch | RioFürDeutsche",
    description: "Entdecke Rio de Janeiro mit einem echten Carioca als Guide. Stadttouren, Natur, Fußball, Karneval und Tagesausflüge — sicher, authentisch und komplett auf Deutsch."
};

export default function TourenPage() {
    return (
        <div className="flex flex-col min-h-screen bg-rio-sand selection:bg-rio-green selection:text-white font-sans">
            <Navbar />

            <main className="flex-grow">
                {/* SEÇÃO A — Hero */}
                <section className="relative pt-32 pb-24 lg:pt-40 lg:pb-32 overflow-hidden bg-gray-900 border-b-4 border-rio-yellow">
                    {/* Overlay & Background */}
                    <div className="absolute inset-0 z-0">
                        <Image
                            src="https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=1920&h=800&fit=crop&q=80"
                            alt="Geführte Touren in Rio de Janeiro"
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
                            {/* Breadcrumb */}
                            <nav className="flex items-center text-sm font-medium text-gray-400 mb-8" aria-label="Breadcrumb">
                                <Link href="/" className="hover:text-rio-yellow transition-colors">Startseite</Link>
                                <ChevronRight className="w-4 h-4 mx-2 text-gray-600" />
                                <span className="text-rio-yellow">Touren & Ausflüge</span>
                            </nav>

                            <div className="max-w-3xl space-y-6">
                                {/* Badges */}
                                <div className="flex flex-wrap gap-2">
                                    {['Stadttouren', 'Natur & Abenteuer', 'Tagesausflüge', 'Auf Deutsch'].map((tag) => (
                                        <div key={tag} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-[10px] lg:text-xs font-bold tracking-[0.05em] uppercase">
                                            {tag}
                                        </div>
                                    ))}
                                </div>

                                <h1 className="text-4xl lg:text-5xl xl:text-6xl font-heading font-black text-white leading-[1.15] tracking-tight">
                                    Geführte Touren und Ausflüge in Rio de Janeiro
                                </h1>
                                <p className="text-xl lg:text-2xl xl:text-3xl font-bold text-rio-yellow mt-4">
                                    Sicher, authentisch und komplett auf Deutsch
                                </p>

                                <div className="pt-6">
                                    <a
                                        href="https://wa.me/573148704374"
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
                    <div className="max-w-4xl mx-auto px-5 lg:px-8">
                        <FadeIn direction="up">
                            <div className="max-w-[800px] mx-auto text-center space-y-6 text-gray-600 leading-relaxed text-lg">
                                <p className="text-xl lg:text-2xl font-semibold text-gray-900 leading-snug mb-8">
                                    Rio de Janeiro gehört zu den aufregendsten Städten der Welt — aber gerade als deutschsprachiger Tourist stellt man sich viele Fragen: Welche Sehenswürdigkeiten lohnen sich wirklich? Wo ist es sicher? Und wie erlebt man die Stadt abseits der typischen Touristenpfade? Genau hier komme ich ins Spiel.
                                </p>
                                <p>
                                    Als gebürtiger Carioca, der in Deutschland gelebt hat und fließend Deutsch spricht, biete ich geführte Touren in Rio de Janeiro an, die Sicherheit, Insider-Wissen und authentische Erlebnisse verbinden. Ob die klassischen Highlights wie Corcovado und Zuckerhut, versteckte Strände im Tijuca-Regenwald, ein Fußball-Erlebnis im Maracanã oder Tagesausflüge nach Búzios und Ilha Grande — ich zeige dir meine Stadt so, wie du sie allein nie erleben würdest.
                                </p>
                                <p className="font-medium text-gray-900 pt-4">
                                    Alle Touren sind flexibel, individuell anpassbar und komplett auf Deutsch. Schau dir die verschiedenen Optionen an und schreib mir einfach — zusammen planen wir deinen perfekten Tag in Rio.
                                </p>
                            </div>
                        </FadeIn>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}

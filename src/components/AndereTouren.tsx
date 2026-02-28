import Link from "next/link";
import FadeIn from "./FadeIn";
import { ArrowRight } from "lucide-react";

interface Tour {
    slug: string;
    emoji: string;
    title: string;
    description: string;
    badge: string;
    link: string;
    isExternal?: boolean;
    isComingSoon?: boolean;
}

const allTours: Tour[] = [
    {
        slug: "klassiker",
        emoji: "🏔️",
        title: "Klassiker Tour in Rio de Janeiro",
        description: "Die schönsten Sehenswürdigkeiten Rios an einem Tag — von Corcovado bis Arpoador.",
        badge: "~8 Stunden",
        link: "/touren/klassiker"
    },
    {
        slug: "natur-und-straende",
        emoji: "🌿",
        title: "Natur & Strände in Rio de Janeiro",
        description: "Regenwald-Wanderungen, Gipfeltouren und versteckte Strände — Rios wilde Seite.",
        badge: "3–8 Stunden",
        link: "/touren/natur-und-straende"
    },
    {
        slug: "favela",
        emoji: "🏘️",
        title: "Favela Tour in Rio de Janeiro",
        description: "Ein respektvoller Einblick in die Kultur der Favelas — authentisch und sicher.",
        badge: "Bald verfügbar",
        link: "/#kontakt",
        isComingSoon: true
    },
    {
        slug: "night",
        emoji: "🌙",
        title: "Nachtleben in Rio de Janeiro",
        description: "Samba, Lapa und das pulsierende Nachtleben Rios — erlebe die Stadt nach Sonnenuntergang.",
        badge: "Bald verfügbar",
        link: "/#kontakt",
        isComingSoon: true
    },
    {
        slug: "karneval",
        emoji: "🎉",
        title: "Karneval Tour in Rio de Janeiro",
        description: "Das größte Fest der Welt hautnah erleben — ich zeige dir den echten Karneval von Rio.",
        badge: "Bald verfügbar",
        link: "/#kontakt",
        isComingSoon: true
    },
    {
        slug: "fussball",
        emoji: "⚽",
        title: "Fußball Tour in Rio de Janeiro",
        description: "Maracanã, Museen und echte Fußball-Leidenschaft — erlebe Rio wie ein Fan.",
        badge: "Bald verfügbar",
        link: "/#kontakt",
        isComingSoon: true
    },
    {
        slug: "ausfluege",
        emoji: "🗺️",
        title: "Tagesausflüge ab Rio de Janeiro",
        description: "Búzios, Ilha Grande, Paraty, Petrópolis und mehr — traumhafte Ausflüge rund um Rio.",
        badge: "Bald verfügbar",
        link: "/#kontakt",
        isComingSoon: true
    },
    {
        slug: "individuell",
        emoji: "🎯",
        title: "Individuelle Tour in Rio de Janeiro",
        description: "Dein Wunschtag in Rio — du bestimmst die Orte, ich plane den perfekten Tag.",
        badge: "Auf Anfrage",
        link: "https://wa.me/573148704374?text=Hallo! Ich möchte eine individuelle Tour in Rio planen...",
        isExternal: true
    }
];

export default function AndereTouren({ currentSlug }: { currentSlug: string }) {
    const toursToShow = allTours.filter(tour => tour.slug !== currentSlug);

    return (
        <section className="py-20 bg-white border-t border-gray-100">
            <div className="max-w-7xl mx-auto px-5 lg:px-8">
                <FadeIn direction="up" className="mb-10">
                    <h2 className="text-3xl lg:text-4xl font-heading font-bold text-gray-900 leading-tight">
                        Rio de Janeiro Touren — entdecke mehr mit deinem lokalen Guide
                    </h2>
                </FadeIn>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {toursToShow.map((tour, index) => {
                        const isInternal = !tour.isExternal && !tour.link.startsWith('#') && !tour.link.startsWith('/#');

                        const content = (
                            <div className={`p-6 bg-white rounded-2xl border border-gray-100 shadow-sm transition-all duration-300 flex flex-col h-full 
                                ${tour.isComingSoon
                                    ? 'opacity-80 border-dashed border-gray-300 bg-gray-50/50'
                                    : 'hover:border-rio-yellow hover:shadow-md group'}`}>

                                <div className="flex justify-between items-start mb-4">
                                    <span className="text-3xl">{tour.emoji}</span>
                                    <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded-md 
                                        ${tour.isComingSoon
                                            ? 'bg-gray-200 text-gray-500'
                                            : tour.slug === 'individuell'
                                                ? 'bg-blue-50 text-blue-600'
                                                : 'bg-rio-sand text-rio-green'}`}>
                                        {tour.badge}
                                    </span>
                                </div>

                                <h3 className="text-xl font-bold font-heading text-gray-900 mb-2">{tour.title}</h3>
                                <p className="text-gray-500 text-sm leading-relaxed mb-6 flex-grow">
                                    {tour.description}
                                </p>

                                <div className={`flex items-center gap-1.5 text-sm font-bold ${tour.isComingSoon ? 'text-gray-400' : 'text-rio-green group-hover:text-rio-yellow transition-colors'}`}>
                                    {tour.isComingSoon ? 'In Kürze verfügbar' : 'Mehr erfahren'}
                                    {!tour.isComingSoon && <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />}
                                </div>
                            </div>
                        );

                        if (tour.isExternal) {
                            return (
                                <FadeIn key={tour.slug} delay={index * 0.05} direction="up">
                                    <a
                                        href={tour.link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="h-full block"
                                    >
                                        {content}
                                    </a>
                                </FadeIn>
                            );
                        }

                        return (
                            <FadeIn key={tour.slug} delay={index * 0.05} direction="up">
                                <Link href={tour.link} className="h-full block">
                                    {content}
                                </Link>
                            </FadeIn>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}

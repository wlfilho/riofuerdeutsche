import Link from "next/link";
import FadeIn from "./FadeIn";
import { ArrowRight } from "lucide-react";

interface Tour {
    slug: string;
    emoji: string;
    title: string;
    description: string;
    badges: string[];
    link: string;
    isExternal?: boolean;
    isComingSoon?: boolean;
    comingSoonLabel?: string;
}

const allTours: Tour[] = [
    {
        slug: "klassiker",
        emoji: "🏔️",
        title: "Klassiker Tour in Rio de Janeiro",
        description: "Die schönsten Sehenswürdigkeiten Rios an einem Tag — von Corcovado bis Arpoador.",
        badges: ["~8 Stunden", "12 Highlights"],
        link: "/touren/klassiker"
    },
    {
        slug: "natur-und-straende",
        emoji: "🌿",
        title: "Natur & Strände in Rio de Janeiro",
        description: "Regenwald-Wanderungen, Gipfeltouren und versteckte Strände — Rios wilde Seite.",
        badges: ["3–8 Stunden", "9 Highlights"],
        link: "/touren/natur-und-straende"
    },
    {
        slug: "favela-tour",
        emoji: "🏘️",
        title: "Favela Tour in Rio de Janeiro",
        description: "Ein respektvoller Einblick in die Kultur der Favelas — authentisch und sicher.",
        badges: ["2–3 Stunden", "2 Highlights"],
        link: "/touren/favela-tour",
        isComingSoon: false
    },
    {
        slug: "kultur-geschichte",
        emoji: "🏛️",
        title: "Kultur & Geschichte Tour in Rio de Janeiro",
        description: "Museen, historische Gebäude und die faszinierende Geschichte Rios — vom kolonialen Zentrum bis Praça Mauá.",
        badges: ["4–6 Stunden", "10 Highlights"],
        link: "https://wa.me/573148704374?text=Hallo! Ich interessiere mich für eine Kultur & Geschichte Tour in Rio. Kannst du mir mehr erzählen?",
        isComingSoon: true,
        comingSoonLabel: "Bald verfügbar"
    },
    {
        slug: "night",
        emoji: "🌙",
        title: "Rio by Night — Nachtleben in Rio de Janeiro",
        description: "Samba, Lapa und das pulsierende Nachtleben Rios — erlebe die Stadt nach Sonnenuntergang.",
        badges: ["3–4 Stunden", "Nachtleben"],
        link: "/touren/by-night",
        isComingSoon: false
    },
    {
        slug: "karneval",
        emoji: "🎉",
        title: "Karneval Tour in Rio de Janeiro",
        description: "Das größte Fest der Welt hautnah erleben — ich zeige dir den echten Karneval von Rio.",
        badges: ["Saisonal", "Karneval"],
        link: "/touren/karneval-tour",
        isComingSoon: false
    },
    {
        slug: "fussball",
        emoji: "⚽",
        title: "Fußball Tour in Rio de Janeiro",
        description: "Maracanã, Museen und echte Fußball-Leidenschaft — erlebe Rio wie ein Fan.",
        badges: ["3–4 Stunden", "Fußball"],
        link: "/#kontakt",
        isComingSoon: true
    },
    {
        slug: "ausfluege",
        emoji: "🗺️",
        title: "Tagesausflüge ab Rio de Janeiro",
        description: "Búzios, Ilha Grande, Paraty, Petrópolis und mehr — traumhafte Ausflüge rund um Rio.",
        badges: ["Ganztägig", "Ab Rio"],
        link: "/#kontakt",
        isComingSoon: true
    },
    {
        slug: "individuell",
        emoji: "🎯",
        title: "Individuelle Tour in Rio de Janeiro",
        description: "Dein Wunschtag in Rio — du bestimmst die Orte, ich plane den perfekten Tag.",
        badges: ["Flexibel", "Auf Anfrage"],
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
                                    <div className="flex flex-wrap gap-1.5 justify-end max-w-[70%]">
                                        {tour.isComingSoon && (
                                            <span className="bg-gray-200 text-gray-500 text-[9px] font-bold px-2 py-0.5 rounded border border-gray-200 uppercase tracking-wider whitespace-nowrap">
                                                {tour.comingSoonLabel || "In Kürze"}
                                            </span>
                                        )}
                                        {tour.badges.map((badge) => (
                                            <span key={badge} className="bg-white/90 px-2 py-0.5 rounded-full text-[9px] font-bold text-rio-green border border-gray-100 uppercase tracking-wider whitespace-nowrap">
                                                {badge}
                                            </span>
                                        ))}
                                    </div>
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

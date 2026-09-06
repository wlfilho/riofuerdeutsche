import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import NavbarServer from "@/components/NavbarServer";
import FooterServer from "@/components/FooterServer";
import FadeIn from "@/components/FadeIn";
import Faq from "@/components/Faq";
import {
    ChevronRight,
    CalendarDays,
    MapPin,
    Trophy,
    Flag,
    Users,
    Goal,
    ArrowRight,
    Shuffle,
    Tv,
} from "lucide-react";

// Fatos do calendário: comunicado oficial da FIFA (Bekanntgabe des Spielplans,
// inside.fifa.com). As datas dos jogos eliminatórios individuais e os horários
// ainda não são públicos — a página diz isso explicitamente em vez de estimar,
// e é atualizada quando a FIFA divulgar (Auslosung: 11.12.2026).
export const metadata: Metadata = {
    // "Fußball" no title é deliberado, como no hub: a Handball-WM der Frauen
    // 2027 acontece na Alemanha e o Google mistura os intents sem isso.
    title: "Spielplan der Fußball Frauen WM 2027 · Termine & Spielorte",
    description:
        "Der Spielplan der FIFA Frauen-WM 2027 in Brasilien: Gruppenphase vom 24. Juni bis 4. Juli, Finale am 25. Juli im Maracanã. Alle Termine, Spielorte und die Auslosung am 11. Dezember 2026 in Rio.",
    alternates: {
        canonical: "https://riofuerdeutsche.de/frauen-wm-2027/spielplan",
    },
    openGraph: {
        title: "Spielplan der Fußball Frauen WM 2027 · Termine & Spielorte",
        description:
            "Gruppenphase vom 24. Juni bis 4. Juli 2027, Finale am 25. Juli im Maracanã. Alle Termine und Spielorte der Frauen-WM in Brasilien.",
        url: "https://riofuerdeutsche.de/frauen-wm-2027/spielplan",
        type: "website",
        images: [{ url: "/images/wm-2027/bg-wm-2027.webp" }],
    },
};

const eckdaten = [
    { icon: Shuffle, label: "Auslosung", value: "11. Dezember 2026, Rio de Janeiro" },
    { icon: Flag, label: "Eröffnungsspiel", value: "24. Juni 2027, Maracanã" },
    { icon: CalendarDays, label: "Gruppenphase", value: "24. Juni bis 4. Juli 2027" },
    { icon: Trophy, label: "Finale", value: "25. Juli 2027, Maracanã" },
    { icon: Goal, label: "Spiele", value: "64 in 8 Städten" },
    { icon: Users, label: "Teams", value: "32 Nationalmannschaften" },
];

/**
 * Fases do torneio conforme o comunicado da FIFA. `termin` só recebe data
 * quando ela é oficial — o resto fica explícito como "nach der Auslosung",
 * nunca estimativa apresentada como fato.
 */
const turnierphasen = [
    {
        phase: "Gruppenphase",
        termin: "24. Juni bis 4. Juli 2027",
        orte: "Alle 8 Spielorte",
        detail:
            "32 Teams in acht Gruppen. Die beiden Gruppenersten erreichen das Achtelfinale.",
        confirmed: true,
    },
    {
        phase: "Achtelfinale",
        termin: "Termine folgen nach der Auslosung",
        orte: "U. a. Brasília, Porto Alegre, Recife und Salvador",
        detail:
            "In diesen vier Städten steigt jeweils mindestens ein K.-o.-Spiel bis einschließlich Achtelfinale.",
        confirmed: false,
    },
    {
        phase: "Viertelfinale",
        termin: "Termine folgen nach der Auslosung",
        orte: "Belo Horizonte, Fortaleza, Rio de Janeiro und São Paulo",
        detail: "Die vier größten Bühnen des Turniers vor den Halbfinals.",
        confirmed: false,
    },
    {
        phase: "Halbfinale",
        termin: "Termine folgen nach der Auslosung",
        orte: "São Paulo und Rio de Janeiro (Maracanã)",
        detail: "Ein Halbfinale in der Arena Itaquera, eines im Maracanã.",
        confirmed: false,
    },
    {
        phase: "Spiel um Platz 3",
        termin: "Termine folgen nach der Auslosung",
        orte: "São Paulo",
        detail: "Das kleine Finale in der Arena Itaquera.",
        confirmed: false,
    },
    {
        phase: "Finale",
        termin: "Sonntag, 25. Juli 2027",
        orte: "Maracanã, Rio de Janeiro",
        detail:
            "Der Höhepunkt des Turniers im legendären Maracanã, vor bis zu 73.139 Zuschauern.",
        confirmed: true,
    },
];

const brasilienSpiele = [
    {
        datum: "Donnerstag, 24. Juni 2027",
        stadt: "Rio de Janeiro",
        stadion: "Maracanã",
        hinweis: "Eröffnungsspiel",
    },
    {
        datum: "Dienstag, 29. Juni 2027",
        stadt: "São Paulo",
        stadion: "Arena Itaquera",
        hinweis: null,
    },
    {
        datum: "Sonntag, 4. Juli 2027",
        stadt: "Brasília",
        stadion: "Estádio Nacional Mané Garrincha",
        hinweis: null,
    },
];

const faqItems = [
    {
        question: "Wann beginnt die Frauen WM 2027 und wann ist das Finale?",
        answer:
            "Das Turnier beginnt am 24. Juni 2027 mit dem Eröffnungsspiel im Maracanã in Rio de Janeiro. Das Finale findet am Sonntag, 25. Juli 2027, ebenfalls im Maracanã statt.",
    },
    {
        question: "Wann ist die Auslosung der Gruppen für die WM 2027?",
        answer:
            "Die Auslosung der Gruppenphase findet am 11. Dezember 2026 in Rio de Janeiro statt, im Museum für Moderne Kunst. Danach steht fest, welche Teams in welchen Städten spielen.",
    },
    {
        question: "Wann stehen die genauen Spieltermine fest?",
        answer:
            "Der Rahmen steht bereits: Die Gruppenphase läuft vom 24. Juni bis 4. Juli 2027, das Finale ist am 25. Juli. Die Zuordnung der Teams zu den einzelnen Spielen und die Anstoßzeiten werden mit der Auslosung am 11. Dezember 2026 bekannt gegeben.",
    },
    {
        question: "Wo finden die Halbfinals und das Finale statt?",
        answer:
            "Die beiden Halbfinals werden in São Paulo (Arena Itaquera) und in Rio de Janeiro (Maracanã) gespielt. Das Spiel um Platz 3 findet in São Paulo statt, das Finale am 25. Juli 2027 im Maracanã.",
    },
    {
        question: "Wann spielt Brasilien in der Gruppenphase?",
        answer:
            "Gastgeber Brasilien eröffnet das Turnier am 24. Juni 2027 im Maracanã, spielt am 29. Juni in São Paulo und beendet die Gruppenphase am 4. Juli in Brasília.",
    },
    {
        question: "Wann und wo spielt Deutschland bei der WM 2027?",
        answer:
            "Deutschland ist qualifiziert, die Gruppengegner und Spielorte stehen aber erst nach der Auslosung am 11. Dezember 2026 fest. Sicher ist: Alle deutschen Spiele werden im Free-TV übertragen.",
    },
    {
        question: "Wo wird die Frauen WM 2027 im Fernsehen übertragen?",
        answer:
            "In Deutschland zeigen ARD und ZDF 30 Spiele kostenlos im Free-TV, darunter alle Spiele der deutschen Nationalmannschaft. MagentaTV überträgt alle 64 Partien.",
    },
];

const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: {
            "@type": "Answer",
            text: item.answer,
        },
    })),
};

export default function Page() {
    return (
        <div className="flex flex-col min-h-screen bg-rio-sand selection:bg-rio-green selection:text-white font-sans">
            <NavbarServer />

            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
            />

            <main className="flex-grow">
                {/* SEÇÃO 1 : Hero */}
                <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-28 overflow-hidden bg-gray-900 border-b-4 border-rio-yellow">
                    <div className="absolute inset-0 z-0">
                        <Image
                            src="/images/wm-2027/bg-wm-2027.webp"
                            alt="Spielplan der FIFA Frauen-Weltmeisterschaft 2027 in Brasilien"
                            fill
                            priority
                            fetchPriority="high"
                            quality={90}
                            className="object-cover object-center"
                        />
                        <div className="absolute inset-0 bg-black/50"></div>
                        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/55 to-transparent"></div>
                    </div>

                    <div className="relative z-10 max-w-7xl mx-auto px-5 lg:px-8">
                        <FadeIn direction="up">
                            <nav
                                className="flex items-center text-sm font-medium text-white/60 mb-8"
                                aria-label="Breadcrumb"
                            >
                                <Link href="/" className="hover:text-rio-yellow transition-colors">
                                    Startseite
                                </Link>
                                <ChevronRight className="w-4 h-4 mx-2 text-white/30" />
                                <Link
                                    href="/frauen-wm-2027"
                                    className="hover:text-rio-yellow transition-colors"
                                >
                                    Frauen WM 2027
                                </Link>
                                <ChevronRight className="w-4 h-4 mx-2 text-white/30" />
                                <span className="text-rio-yellow">Spielplan</span>
                            </nav>

                            <div className="max-w-3xl space-y-6">
                                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-sm font-medium">
                                    <CalendarDays className="w-4 h-4 text-rio-yellow" />
                                    <span>24. Juni bis 25. Juli 2027 · 64 Spiele · 8 Spielorte</span>
                                </div>

                                <h1 className="text-4xl lg:text-[clamp(32px,3.5vw,52px)] font-heading font-black text-white leading-[1.15] tracking-tight">
                                    Spielplan der Frauen WM 2027 in Brasilien
                                </h1>

                                <p className="text-lg lg:text-xl text-rio-sand/90 leading-relaxed">
                                    Der Rahmen des Turniers steht: Gruppenphase vom 24. Juni bis 4.
                                    Juli, Finale am 25. Juli 2027 im Maracanã. Hier findest du alle
                                    bestätigten Termine und Spielorte, den Spielplan des Gastgebers
                                    Brasilien und alles zur Auslosung am 11. Dezember 2026. Sobald
                                    die FIFA neue Termine bestätigt, wird diese Seite aktualisiert.
                                </p>

                                <p className="text-sm text-white/60">Stand: September 2026</p>

                                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                                    <a
                                        href="#turnierphasen"
                                        className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-rio-yellow text-gray-900 rounded-full font-bold text-lg hover:bg-yellow-400 hover:scale-[1.02] transition-all shadow-xl shadow-rio-yellow/20"
                                    >
                                        Alle Termine ansehen
                                        <ArrowRight className="w-5 h-5" />
                                    </a>
                                    <Link
                                        href="/frauen-wm-2027"
                                        className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-md border border-white/30 text-white rounded-full font-medium text-lg hover:bg-white/20 transition-all"
                                    >
                                        Zur WM-Übersicht
                                    </Link>
                                </div>
                            </div>
                        </FadeIn>
                    </div>
                </section>

                {/* SEÇÃO 2 : Eckdaten */}
                <section className="py-20 lg:py-28 bg-white">
                    <div className="max-w-7xl mx-auto px-5 lg:px-8">
                        <FadeIn direction="up" className="max-w-[800px] mx-auto mb-12">
                            <h2 className="text-3xl lg:text-4xl font-heading font-bold text-gray-900 leading-tight">
                                Die wichtigsten Termine im Überblick
                            </h2>
                            <p className="mt-4 text-gray-600 text-lg leading-relaxed">
                                Die FIFA hat den Spielplan der Frauen-WM 2027 offiziell
                                bekannt gegeben. Jede der acht Städte bekommt mindestens sieben
                                Spiele und mindestens ein K.-o.-Spiel. Eröffnung und Finale steigen
                                im Maracanã in Rio de Janeiro.
                            </p>
                        </FadeIn>

                        <FadeIn direction="up">
                            <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {eckdaten.map((item) => {
                                    const Icon = item.icon;
                                    return (
                                        <div
                                            key={item.label}
                                            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex gap-4 hover:border-rio-yellow hover:shadow-md transition-all duration-300"
                                        >
                                            <div className="inline-flex items-center justify-center w-11 h-11 shrink-0 rounded-2xl bg-rio-green/10 text-rio-green">
                                                <Icon className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <dt className="text-xs font-bold uppercase tracking-wider text-rio-green">
                                                    {item.label}
                                                </dt>
                                                <dd className="mt-1 text-lg font-semibold text-gray-900">
                                                    {item.value}
                                                </dd>
                                            </div>
                                        </div>
                                    );
                                })}
                            </dl>
                        </FadeIn>
                    </div>
                </section>

                {/* SEÇÃO 3 : Turnierphasen */}
                <section id="turnierphasen" className="py-20 bg-gray-50 border-t border-gray-100">
                    <div className="max-w-7xl mx-auto px-5 lg:px-8">
                        <FadeIn direction="up" className="max-w-[800px] mx-auto mb-12">
                            <h2 className="text-3xl lg:text-4xl font-heading font-bold text-gray-900 leading-tight">
                                Die Turnierphasen: von der Gruppenphase bis zum Finale
                            </h2>
                            <p className="mt-4 text-gray-600 text-lg leading-relaxed">
                                Gespielt wird im gleichen Format wie 2023: 32 Teams, acht Gruppen,
                                danach K.-o.-Runde ab dem Achtelfinale. Die genauen Termine und
                                Anstoßzeiten der einzelnen Spiele veröffentlicht die FIFA mit der
                                Auslosung.
                            </p>
                        </FadeIn>

                        <div className="max-w-[800px] mx-auto space-y-4">
                            {turnierphasen.map((phase, index) => (
                                <FadeIn key={phase.phase} direction="up" delay={index * 0.05}>
                                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8 hover:border-rio-yellow hover:shadow-md transition-all duration-300">
                                        <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-2">
                                            <h3 className="text-xl font-bold font-heading text-gray-900">
                                                {phase.phase}
                                            </h3>
                                            <p
                                                className={`text-sm font-bold uppercase tracking-wider ${
                                                    phase.confirmed
                                                        ? "text-rio-green"
                                                        : "text-gray-400"
                                                }`}
                                            >
                                                {phase.termin}
                                            </p>
                                        </div>
                                        <p className="mt-2 inline-flex items-center gap-1.5 text-gray-900 font-medium">
                                            <MapPin className="w-4 h-4 text-rio-green shrink-0" />
                                            {phase.orte}
                                        </p>
                                        <p className="mt-2 text-gray-600 leading-relaxed">
                                            {phase.detail}
                                        </p>
                                    </div>
                                </FadeIn>
                            ))}
                        </div>
                    </div>
                </section>

                {/* SEÇÃO 4 : Spielplan Brasilien */}
                <section className="py-20 lg:py-28 bg-white">
                    <div className="max-w-7xl mx-auto px-5 lg:px-8">
                        <FadeIn direction="up" className="max-w-[800px] mx-auto">
                            <h2 className="text-3xl lg:text-4xl font-heading font-bold text-gray-900 leading-tight">
                                Der Spielplan des Gastgebers Brasilien
                            </h2>
                            <p className="mt-4 text-gray-600 text-lg leading-relaxed">
                                Als einziges Team kennt Brasilien seine Spielorte schon vor der
                                Auslosung. Die Seleção eröffnet das Turnier im Maracanã und zieht
                                dann durch die drei größten Stadien des Landes:
                            </p>

                            <div className="mt-8 space-y-4">
                                {brasilienSpiele.map((spiel) => (
                                    <div
                                        key={spiel.datum}
                                        className="bg-gray-50 rounded-2xl border border-gray-100 p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                                    >
                                        <div>
                                            <p className="text-sm font-bold uppercase tracking-wider text-rio-green">
                                                {spiel.datum}
                                            </p>
                                            <p className="mt-1 text-lg font-semibold text-gray-900">
                                                {spiel.stadion}, {spiel.stadt}
                                            </p>
                                        </div>
                                        {spiel.hinweis && (
                                            <span className="inline-flex items-center gap-1.5 self-start sm:self-center text-[10px] font-bold px-3 py-1.5 rounded-full bg-rio-yellow text-gray-900 uppercase tracking-wider">
                                                <Flag className="w-3.5 h-3.5" />
                                                {spiel.hinweis}
                                            </span>
                                        )}
                                    </div>
                                ))}
                            </div>

                            <p className="mt-6 text-gray-600 leading-relaxed">
                                Ein Brasilien-Spiel im Maracanã ist ein Erlebnis für sich: Das ganze
                                Land steht still, und Rio wird zu einer einzigen Fanzone. Mehr zum
                                Stadion findest du auf unserer Seite zum{" "}
                                <Link
                                    href="/rio-guide/sehenswuerdigkeiten/maracana"
                                    className="underline decoration-rio-green/40 underline-offset-2 hover:text-rio-green transition-colors"
                                >
                                    Maracanã
                                </Link>
                                .
                            </p>
                        </FadeIn>
                    </div>
                </section>

                {/* SEÇÃO 5 : Auslosung */}
                <section id="auslosung" className="py-20 bg-gray-50 border-t border-gray-100">
                    <div className="max-w-7xl mx-auto px-5 lg:px-8">
                        <FadeIn direction="up" className="max-w-[800px] mx-auto">
                            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-rio-green/10 text-rio-green mb-6">
                                <Shuffle className="w-7 h-7" />
                            </div>
                            <h2 className="text-3xl lg:text-4xl font-heading font-bold text-gray-900 leading-tight">
                                Die Auslosung: 11. Dezember 2026 in Rio de Janeiro
                            </h2>
                            <div className="mt-4 space-y-4 text-gray-600 text-lg leading-relaxed">
                                <p>
                                    Die Gruppen der Frauen-WM 2027 werden am 11. Dezember 2026 in Rio
                                    de Janeiro ausgelost, im Museum für Moderne Kunst an der
                                    Guanabara-Bucht. Mit der Auslosung steht der komplette Spielplan
                                    fest: welche Teams in welchen Gruppen spielen, in welchen Städten
                                    ihre Spiele stattfinden und wann Deutschland antritt.
                                </p>
                                <p>
                                    Für die Reiseplanung ist das der wichtigste Tag vor dem Turnier.
                                    Sobald die Gruppen gelost sind, steigen Nachfrage und Preise für
                                    Flüge und Hotels in den Spielorten der großen Fußballnationen
                                    spürbar. Wer seine Reise nach Rio schon vorher grob plant, bucht
                                    nach der Auslosung schneller und günstiger.
                                </p>
                            </div>
                        </FadeIn>
                    </div>
                </section>

                {/* SEÇÃO 6 : TV-Übertragung */}
                <section className="py-20 lg:py-28 bg-white">
                    <div className="max-w-7xl mx-auto px-5 lg:px-8">
                        <FadeIn direction="up" className="max-w-[800px] mx-auto">
                            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-rio-green/10 text-rio-green mb-6">
                                <Tv className="w-7 h-7" />
                            </div>
                            <h2 className="text-3xl lg:text-4xl font-heading font-bold text-gray-900 leading-tight">
                                TV-Übertragung in Deutschland
                            </h2>
                            <p className="mt-4 text-gray-600 text-lg leading-relaxed">
                                ARD und ZDF zeigen 30 Spiele der Frauen-WM 2027 kostenlos im
                                Free-TV, darunter alle Spiele der deutschen Nationalmannschaft.
                                MagentaTV überträgt alle 64 Partien. Und wer das Turnier nicht vor
                                dem Fernseher, sondern im Stadion oder in Rio erleben will: Genau
                                dafür sind wir da.
                            </p>
                        </FadeIn>
                    </div>
                </section>

                {/* SEÇÃO 7 : FAQ */}
                <section className="py-20 bg-gray-50 border-t border-gray-100">
                    <div className="max-w-3xl mx-auto px-5 lg:px-8">
                        <FadeIn direction="up" className="text-center mb-12">
                            <h2 className="text-3xl lg:text-4xl font-heading font-bold text-gray-900">
                                Häufige Fragen zum Spielplan
                            </h2>
                        </FadeIn>

                        <FadeIn direction="up">
                            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm px-6 sm:px-10 py-4">
                                <Faq items={faqItems.map((item) => ({ q: item.question, a: item.answer }))} />
                            </div>
                        </FadeIn>
                    </div>
                </section>

                {/* SEÇÃO 8 : Footer CTA */}
                <section className="py-24 relative overflow-hidden bg-rio-green border-t-4 border-rio-yellow">
                    <div className="absolute inset-0 bg-[url('/images/rio-background.webp')] bg-cover bg-center mix-blend-overlay opacity-10"></div>
                    <div className="relative max-w-4xl mx-auto px-5 text-center">
                        <FadeIn direction="up">
                            <h2 className="text-3xl lg:text-5xl font-heading font-black text-white mb-6">
                                Du willst die WM 2027 live in Rio erleben?
                            </h2>
                            <p className="text-lg text-rio-sand/90 mb-10 max-w-2xl mx-auto leading-relaxed">
                                Erzähl mir, wann du kommst und welche Spiele dich interessieren. Du
                                bekommst einen persönlichen Vorschlag mit Ablauf und Preis,
                                kostenlos und unverbindlich, von einem deutschsprachigen Guide vor
                                Ort.
                            </p>
                            <div className="flex flex-col sm:flex-row justify-center gap-4">
                                <Link
                                    href="/anfrage?von=site&thema=frauen-wm-2027"
                                    className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-rio-yellow text-gray-900 rounded-full font-bold text-lg hover:bg-yellow-400 hover:scale-[1.02] transition-all shadow-xl shadow-black/10"
                                >
                                    Tour für die WM 2027 anfragen
                                    <ArrowRight className="w-5 h-5" />
                                </Link>
                                <Link
                                    href="/frauen-wm-2027"
                                    className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-md border border-white/30 text-white rounded-full font-medium text-lg hover:bg-white/20 transition-all"
                                >
                                    Zur WM-Übersicht
                                </Link>
                            </div>
                        </FadeIn>
                    </div>
                </section>
            </main>

            <FooterServer />
        </div>
    );
}

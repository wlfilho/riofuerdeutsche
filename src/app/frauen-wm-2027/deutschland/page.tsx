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
    ArrowRight,
    Shuffle,
    Tv,
    CheckCircle2,
    Globe,
} from "lucide-react";

// Página "magnética" da estratégia WM 2027 (doc no Obsidian, seção 4): vive
// de atualização contínua a cada notícia da seleção. Keywords T1 validadas:
// "frauen-wm 2027 qualifikation" (210/mês), "frauen-wm-quali 2027" (110/mês),
// "dfb frauen wm 2027". IMPORTANTE: atualizar o "Stand:" visível e os blocos
// de fatos a cada mudança (amistosos de novembro, sorteio 11/12, convocação).
export const metadata: Metadata = {
    title: "Deutschland bei der Fußball Frauen WM 2027 · Qualifikation & Spiele",
    description:
        "Die DFB-Frauen bei der Frauen-WM 2027 in Brasilien: Qualifikation als Gruppensieger, die nächsten Länderspiele, mögliche Gegner und wo Deutschland spielt. Auslosung am 11. Dezember 2026 in Rio.",
    alternates: {
        canonical: "https://riofuerdeutsche.de/frauen-wm-2027/deutschland",
    },
    openGraph: {
        title: "Deutschland bei der Fußball Frauen WM 2027 · Qualifikation & Spiele",
        description:
            "Die DFB-Frauen sind für die WM 2027 in Brasilien qualifiziert. Alle Fakten zur Qualifikation, den nächsten Spielen und der Auslosung.",
        url: "https://riofuerdeutsche.de/frauen-wm-2027/deutschland",
        type: "website",
        images: [{ url: "/images/wm-2027/bg-wm-2027.webp" }],
    },
};

/**
 * O caminho até a WM, em ordem cronológica. Os itens com `done` já
 * aconteceram; o resto ganha data/resultado conforme sai — este array é o
 * coração da "atualização contínua" da página.
 */
const fahrplan = [
    {
        done: true,
        titel: "Qualifiziert als Gruppensieger",
        termin: "5. Juni 2026",
        text: "2:0 gegen Norwegen in Köln, vor 33.425 Zuschauern. Deutschland löst das WM-Ticket als erstes europäisches Team, schon vor dem letzten Gruppenspiel.",
    },
    {
        done: false,
        titel: "Länderspiele im Oktober",
        termin: "9. und 13. Oktober 2026",
        text: "Zwei echte WM-Tests: am 9. Oktober gegen Australien in Karlsruhe (ZDF), am 13. Oktober gegen Asienmeister Japan in Bremen (ARD). Beide Gegner sind für die WM 2027 qualifiziert.",
    },
    {
        done: false,
        titel: "Länderspiele im November",
        termin: "9. bis 17. November 2026",
        text: "Die letzte Länderspielphase des Jahres. Gegner und Spielorte gibt der DFB noch bekannt.",
    },
    {
        done: false,
        titel: "Auslosung der Gruppen in Rio",
        termin: "11. Dezember 2026",
        text: "Im Museum für Moderne Kunst in Rio de Janeiro werden die acht Gruppen gelost. Danach stehen Deutschlands Gegner, Spielorte und Spieltermine fest.",
    },
    {
        done: false,
        titel: "FIFA Frauen-WM 2027 in Brasilien",
        termin: "24. Juni bis 25. Juli 2027",
        text: "32 Teams, 64 Spiele, 8 Städte. Eröffnung und Finale im Maracanã in Rio de Janeiro.",
    },
];

/**
 * Classificadas até setembro/2026 (14 de 32). Atualizar conforme saem vagas.
 * `code` = ISO do país, aponta pro SVG redondo em public/images/flags/
 * (circle-flags, MIT — https://github.com/HatScripts/circle-flags). Time novo
 * na lista = baixar a bandeira correspondente pra mesma pasta.
 */
const qualifizierte = [
    { region: "Gastgeber", teams: [{ name: "Brasilien", code: "br" }] },
    {
        region: "Europa",
        teams: [
            { name: "Deutschland", code: "de" },
            { name: "Spanien", code: "es" },
            { name: "Frankreich", code: "fr" },
            { name: "Dänemark", code: "dk" },
        ],
    },
    {
        region: "Asien",
        teams: [
            { name: "Australien", code: "au" },
            { name: "Japan", code: "jp" },
            { name: "China", code: "cn" },
            { name: "Südkorea", code: "kr" },
            { name: "Nordkorea", code: "kp" },
            { name: "Philippinen", code: "ph" },
        ],
    },
    {
        region: "Südamerika",
        teams: [
            { name: "Argentinien", code: "ar" },
            { name: "Kolumbien", code: "co" },
        ],
    },
    { region: "Ozeanien", teams: [{ name: "Neuseeland", code: "nz" }] },
];

const faqItems = [
    {
        question: "Ist Deutschland für die Frauen WM 2027 qualifiziert?",
        answer:
            "Ja. Die DFB-Frauen haben sich am 5. Juni 2026 mit einem 2:0 gegen Norwegen in Köln als Gruppensieger qualifiziert, als erstes europäisches Team.",
    },
    {
        question: "Wann und wo spielt Deutschland bei der WM 2027?",
        answer:
            "Das entscheidet die Auslosung am 11. Dezember 2026 in Rio de Janeiro. Da der Spielplan der FIFA bereits steht, sind Deutschlands Spielorte und Termine direkt nach der Auslosung bekannt. Sicher ist: Erreicht Deutschland das Finale, spielt es am 25. Juli 2027 im Maracanã in Rio.",
    },
    {
        question: "Wer ist der Bundestrainer der DFB-Frauen?",
        answer:
            "Christian Wück. Unter ihm hat sich die Mannschaft ohne Niederlage in der Gruppe mit Norwegen, Österreich und Slowenien für die WM qualifiziert.",
    },
    {
        question: "Wann sind die nächsten Länderspiele der DFB-Frauen?",
        answer:
            "Am 9. Oktober 2026 gegen Australien in Karlsruhe (live im ZDF) und am 13. Oktober gegen Japan in Bremen (live in der ARD). Eine weitere Länderspielphase folgt vom 9. bis 17. November 2026.",
    },
    {
        question: "Wo werden die deutschen WM-Spiele übertragen?",
        answer:
            "Alle Spiele der deutschen Nationalmannschaft laufen im Free-TV bei ARD oder ZDF. MagentaTV überträgt zusätzlich alle 64 Spiele des Turniers.",
    },
    {
        question: "Wie erlebe ich die Deutschland-Spiele live in Brasilien?",
        answer:
            "Tickets verkauft ausschließlich die FIFA, in Verkaufsphasen ab der Auslosung. Für alles vor Ort, von der Reiseroute zu den deutschen Spielorten über Unterkunft bis zur Begleitung am Spieltag, sind wir da: deutschsprachig und mit Basis in Rio. Wer sich vor der Auslosung meldet, bekommt seine Planung als Erster.",
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
                            alt="Deutschland bei der FIFA Frauen-WM 2027 in Brasilien"
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
                                <span className="text-rio-yellow">Deutschland</span>
                            </nav>

                            <div className="max-w-3xl space-y-6">
                                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-sm font-medium">
                                    <CheckCircle2 className="w-4 h-4 text-rio-yellow" />
                                    <span>Qualifiziert seit dem 5. Juni 2026</span>
                                </div>

                                <h1 className="text-4xl lg:text-[clamp(32px,3.5vw,52px)] font-heading font-black text-white leading-[1.15] tracking-tight">
                                    Deutschland bei der Frauen WM 2027 in Brasilien
                                </h1>

                                <p className="text-lg lg:text-xl text-rio-sand/90 leading-relaxed">
                                    Die DFB-Frauen sind dabei: als Gruppensieger qualifiziert, ohne
                                    Niederlage, als erstes europäisches Team. Hier findest du den
                                    Weg der Mannschaft zur WM, die nächsten Länderspiele, die
                                    möglichen Gegner und, sobald gelost ist, die Spielorte und
                                    Termine in Brasilien.
                                </p>

                                <p className="text-sm text-white/60">Stand: September 2026</p>

                                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                                    <a
                                        href="#fahrplan"
                                        className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-rio-yellow text-gray-900 rounded-full font-bold text-lg hover:bg-yellow-400 hover:scale-[1.02] transition-all shadow-xl shadow-rio-yellow/20"
                                    >
                                        Der Weg zur WM
                                        <ArrowRight className="w-5 h-5" />
                                    </a>
                                    <Link
                                        href="/frauen-wm-2027/rio-de-janeiro"
                                        className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-md border border-white/30 text-white rounded-full font-medium text-lg hover:bg-white/20 transition-all"
                                    >
                                        Deine WM-Reise nach Rio
                                    </Link>
                                </div>
                            </div>
                        </FadeIn>
                    </div>
                </section>

                {/* SEÇÃO 2 : Fahrplan / Timeline */}
                <section id="fahrplan" className="py-20 lg:py-28 bg-white">
                    <div className="max-w-7xl mx-auto px-5 lg:px-8">
                        <FadeIn direction="up" className="max-w-[800px] mx-auto mb-12">
                            <h2 className="text-3xl lg:text-4xl font-heading font-bold text-gray-900 leading-tight">
                                Der Weg der DFB-Frauen zur WM 2027
                            </h2>
                            <p className="mt-4 text-gray-600 text-lg leading-relaxed">
                                Vom WM-Ticket in Köln bis zum Anpfiff in Brasilien: Diese Seite
                                wird bei jedem Schritt aktualisiert, zuletzt bei den
                                Oktober-Terminen.
                            </p>
                        </FadeIn>

                        <div className="max-w-[800px] mx-auto space-y-4">
                            {fahrplan.map((etappe, index) => (
                                <FadeIn key={etappe.titel} direction="up" delay={index * 0.05}>
                                    <div
                                        className={`rounded-2xl border p-6 sm:p-8 transition-all duration-300 ${
                                            etappe.done
                                                ? "bg-rio-green/5 border-rio-green/20"
                                                : "bg-white border-gray-100 shadow-sm hover:border-rio-yellow hover:shadow-md"
                                        }`}
                                    >
                                        <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-2">
                                            <h3 className="text-xl font-bold font-heading text-gray-900 inline-flex items-center gap-2">
                                                {etappe.done && (
                                                    <CheckCircle2 className="w-5 h-5 text-rio-green shrink-0" />
                                                )}
                                                {etappe.titel}
                                            </h3>
                                            <p className="text-sm font-bold uppercase tracking-wider text-rio-green">
                                                {etappe.termin}
                                            </p>
                                        </div>
                                        <p className="mt-2 text-gray-600 leading-relaxed">
                                            {etappe.text}
                                        </p>
                                    </div>
                                </FadeIn>
                            ))}
                        </div>
                    </div>
                </section>

                {/* SEÇÃO 3 : Die Qualifikation */}
                <section className="py-20 bg-gray-50 border-t border-gray-100">
                    <div className="max-w-7xl mx-auto px-5 lg:px-8">
                        <FadeIn direction="up" className="max-w-[800px] mx-auto">
                            <h2 className="text-3xl lg:text-4xl font-heading font-bold text-gray-900 leading-tight">
                                So lief die WM-Qualifikation
                            </h2>
                            <div className="mt-4 space-y-4 text-gray-600 text-lg leading-relaxed">
                                <p>
                                    In der Qualifikationsgruppe A4 traf die Mannschaft von
                                    Bundestrainer Christian Wück auf Norwegen, Österreich und
                                    Slowenien. Schon nach fünf von sechs Spielen war der
                                    Gruppensieg sicher: Am 5. Juni 2026 schlug Deutschland
                                    Verfolger Norwegen in Köln mit 2:0, die Tore erzielten
                                    Debütantin Marie Müller und Carlotta Wamser.
                                </p>
                                <p>
                                    Damit löste Deutschland eines von vier direkten europäischen
                                    Tickets der ersten Qualifikationsphase. Die übrigen sieben
                                    europäischen Plätze werden in den Play-offs vergeben: die
                                    erste Runde vom 7. bis 13. Oktober, die zweite vom 26.
                                    November bis 5. Dezember 2026. Dort spielen auch Österreich
                                    und die Schweiz noch um ihre WM-Teilnahme.
                                </p>
                            </div>
                        </FadeIn>
                    </div>
                </section>

                {/* SEÇÃO 4 : Wo spielt Deutschland? */}
                <section className="py-20 lg:py-28 bg-white">
                    <div className="max-w-7xl mx-auto px-5 lg:px-8">
                        <FadeIn direction="up" className="max-w-[800px] mx-auto">
                            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-rio-green/10 text-rio-green mb-6">
                                <Shuffle className="w-7 h-7" />
                            </div>
                            <h2 className="text-3xl lg:text-4xl font-heading font-bold text-gray-900 leading-tight">
                                Wo spielt Deutschland in Brasilien?
                            </h2>
                            <div className="mt-4 space-y-4 text-gray-600 text-lg leading-relaxed">
                                <p>
                                    Das entscheidet die Auslosung am 11. Dezember 2026 in Rio de
                                    Janeiro. Weil der{" "}
                                    <Link
                                        href="/frauen-wm-2027/spielplan"
                                        className="underline decoration-rio-green/40 underline-offset-2 hover:text-rio-green transition-colors"
                                    >
                                        Spielplan der FIFA
                                    </Link>{" "}
                                    bereits steht, sind Deutschlands Städte und Termine direkt
                                    nach der Ziehung bekannt. Infrage kommen alle{" "}
                                    <Link
                                        href="/frauen-wm-2027/stadien"
                                        className="underline decoration-rio-green/40 underline-offset-2 hover:text-rio-green transition-colors"
                                    >
                                        acht Spielorte
                                    </Link>
                                    , von Rio bis Recife.
                                </p>
                                <p>
                                    Eines steht jetzt schon fest: Der Weg zum Titel endet in Rio.
                                    Erreicht Deutschland das Finale, spielt es am 25. Juli 2027 im
                                    Maracanã. Und wer seine Reise zu den Deutschland-Spielen schon
                                    vor der Auslosung grob plant, bucht danach schneller und
                                    günstiger als die Millionen Fans, die erst am 11. Dezember
                                    anfangen zu suchen.
                                </p>
                            </div>
                            <div className="mt-8">
                                <Link
                                    href="/anfrage?von=site&thema=frauen-wm-2027"
                                    className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-rio-yellow text-gray-900 rounded-full font-bold text-lg hover:bg-yellow-400 hover:scale-[1.02] transition-all shadow-lg"
                                >
                                    Reise zu den Deutschland-Spielen planen
                                    <ArrowRight className="w-5 h-5" />
                                </Link>
                            </div>
                        </FadeIn>
                    </div>
                </section>

                {/* SEÇÃO 5 : Mögliche Gegner */}
                <section id="teams" className="py-20 bg-gray-50 border-t border-gray-100">
                    <div className="max-w-7xl mx-auto px-5 lg:px-8">
                        <FadeIn direction="up" className="max-w-[800px] mx-auto mb-10">
                            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-rio-green/10 text-rio-green mb-6">
                                <Globe className="w-7 h-7" />
                            </div>
                            <h2 className="text-3xl lg:text-4xl font-heading font-bold text-gray-900 leading-tight">
                                Die möglichen Gegner: 14 von 32 Teams stehen fest
                            </h2>
                            <p className="mt-4 text-gray-600 text-lg leading-relaxed">
                                Bis zur Auslosung füllt sich das Teilnehmerfeld über die
                                kontinentalen Qualifikationen und Play-offs. Stand September 2026
                                sind diese Teams qualifiziert:
                            </p>
                        </FadeIn>

                        {/* Colunas verticais lado a lado, uma por confederação, com as
                            bandeiras empilhadas dentro. h-full deixa as 5 colunas da
                            mesma altura (Asien, com 6 times, dita a linha). */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 items-stretch max-w-5xl mx-auto">
                            {qualifizierte.map((gruppe, index) => (
                                <FadeIn key={gruppe.region} direction="up" delay={index * 0.05} className="h-full">
                                    <div className="h-full bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col items-center">
                                        <p className="text-xs font-bold uppercase tracking-wider text-rio-green">
                                            {gruppe.region}
                                        </p>
                                        <div className="mt-5 flex flex-col items-center gap-5">
                                            {gruppe.teams.map((team) => {
                                                const istDeutschland = team.name === "Deutschland";
                                                return (
                                                    <div
                                                        key={team.name}
                                                        className="flex flex-col items-center text-center"
                                                    >
                                                        <div
                                                            className={`relative h-14 w-14 rounded-full shadow-md ${
                                                                istDeutschland
                                                                    ? "ring-4 ring-rio-yellow"
                                                                    : "ring-1 ring-gray-200"
                                                            }`}
                                                        >
                                                            <Image
                                                                src={`/images/flags/${team.code}.svg`}
                                                                alt={`Flagge ${team.name}`}
                                                                fill
                                                                unoptimized
                                                                className="rounded-full"
                                                            />
                                                        </div>
                                                        <p
                                                            className={`mt-2 text-xs leading-tight ${
                                                                istDeutschland
                                                                    ? "font-bold text-gray-900"
                                                                    : "font-semibold text-gray-800"
                                                            }`}
                                                        >
                                                            {team.name}
                                                        </p>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </FadeIn>
                            ))}
                        </div>
                    </div>
                </section>

                {/* SEÇÃO 6 : TV */}
                <section className="py-20 lg:py-28 bg-white">
                    <div className="max-w-7xl mx-auto px-5 lg:px-8">
                        <FadeIn direction="up" className="max-w-[800px] mx-auto">
                            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-rio-green/10 text-rio-green mb-6">
                                <Tv className="w-7 h-7" />
                            </div>
                            <h2 className="text-3xl lg:text-4xl font-heading font-bold text-gray-900 leading-tight">
                                Alle Deutschland-Spiele im Free-TV
                            </h2>
                            <p className="mt-4 text-gray-600 text-lg leading-relaxed">
                                ARD und ZDF übertragen 30 Spiele der WM 2027 kostenlos, darunter
                                garantiert alle Spiele der deutschen Nationalmannschaft. MagentaTV
                                zeigt alle 64 Partien. Schöner als vor dem Fernseher ist aber nur
                                ein Platz: im Stadion, oder mitten in Rio, wenn die Stadt
                                Fußball feiert.
                            </p>
                        </FadeIn>
                    </div>
                </section>

                {/* SEÇÃO 7 : FAQ */}
                <section className="py-20 bg-gray-50 border-t border-gray-100">
                    <div className="max-w-3xl mx-auto px-5 lg:px-8">
                        <FadeIn direction="up" className="text-center mb-12">
                            <h2 className="text-3xl lg:text-4xl font-heading font-bold text-gray-900">
                                Häufige Fragen zu Deutschland bei der WM 2027
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
                                Den DFB-Frauen nach Brasilien folgen?
                            </h2>
                            <p className="text-lg text-rio-sand/90 mb-10 max-w-2xl mx-auto leading-relaxed">
                                Erzähl mir, wie deine WM-Reise aussehen soll. Du bekommst einen
                                persönlichen Vorschlag mit Ablauf und Preis, kostenlos und
                                unverbindlich, von einem deutschsprachigen Guide in Rio.
                            </p>
                            <div className="flex flex-col sm:flex-row justify-center gap-4">
                                <Link
                                    href="/anfrage?von=site&thema=frauen-wm-2027"
                                    className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-rio-yellow text-gray-900 rounded-full font-bold text-lg hover:bg-yellow-400 hover:scale-[1.02] transition-all shadow-xl shadow-black/10"
                                >
                                    WM-Reise anfragen
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

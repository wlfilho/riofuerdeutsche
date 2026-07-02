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
    Ticket,
    Flag,
    ArrowRight,
    ShieldCheck,
    Compass,
    Trophy,
    Users,
    Goal,
    GraduationCap,
    Plane,
} from "lucide-react";

export const metadata: Metadata = {
    title: "Frauen WM 2027 in Brasilien · Reiseguide für Rio",
    description:
        "Alles zur FIFA Frauen-Weltmeisterschaft 2027 in Brasilien: Spielorte, Termine, Tickets und dein deutscher Guide in Rio. Eröffnung und Finale im Maracanã.",
    alternates: {
        canonical: "https://riofuerdeutsche.de/frauen-wm-2027",
    },
    openGraph: {
        title: "Frauen WM 2027 in Brasilien · Reiseguide für Rio",
        description:
            "FIFA Frauen-WM 2027: Spielorte, Termine, Tickets und dein deutscher Guide in Rio.",
        url: "https://riofuerdeutsche.de/frauen-wm-2027",
        type: "website",
        images: [{ url: "/images/wm-2027/bg-wm-2027.webp" }],
    },
};

const eckdaten = [
    { icon: CalendarDays, label: "Turnierzeitraum", value: "24. Juni bis 25. Juli 2027" },
    { icon: Flag, label: "Eröffnungsspiel", value: "24. Juni 2027, Maracanã (Rio de Janeiro)" },
    { icon: Trophy, label: "Finale", value: "25. Juli 2027, Maracanã (Rio de Janeiro)" },
    { icon: Users, label: "Teilnehmer", value: "32 Nationalmannschaften" },
    { icon: Goal, label: "Spiele insgesamt", value: "64" },
    { icon: MapPin, label: "Spielorte", value: "8 Städte in Brasilien" },
];

const spielorte = [
    {
        stadt: "Rio de Janeiro",
        stadion: "Maracanã",
        kapazitaet: "73.139",
        badge: "Eröffnung + Finale",
        slug: "maracana",
        link: "/rio-guide/sehenswuerdigkeiten/maracana",
        highlight: true,
    },
    {
        stadt: "Brasília",
        stadion: "Estádio Nacional Mané Garrincha",
        kapazitaet: "69.910",
        slug: "mane-garrincha",
    },
    {
        stadt: "Belo Horizonte",
        stadion: "Mineirão",
        kapazitaet: "66.000",
        slug: "mineirao",
        imgPos: "center bottom",
    },
    {
        stadt: "Fortaleza",
        stadion: "Arena Castelão",
        kapazitaet: "57.000",
        slug: "castelao",
    },
    {
        stadt: "Porto Alegre",
        stadion: "Beira-Rio",
        kapazitaet: "50.848",
        slug: "beira-rio",
        imgPos: "center 78%",
    },
    {
        stadt: "Salvador",
        stadion: "Arena Fonte Nova",
        kapazitaet: "47.915",
        slug: "fonte-nova",
    },
    {
        stadt: "São Paulo",
        stadion: "Arena Itaquera",
        kapazitaet: "47.252",
        slug: "itaquera",
    },
    {
        stadt: "Recife",
        stadion: "Arena de Pernambuco",
        kapazitaet: "45.440",
        slug: "pernambuco",
    },
];

const faqItems = [
    {
        question: "Wann findet die Frauen WM 2027 statt?",
        answer:
            "Vom 24. Juni bis 25. Juli 2027 in Brasilien. Das Eröffnungsspiel ist am 24. Juni, das Finale am 25. Juli. Beide Spiele finden im Maracanã in Rio de Janeiro statt.",
    },
    {
        question: "In welchen Städten wird gespielt?",
        answer:
            "In acht Städten: Rio de Janeiro, São Paulo, Belo Horizonte, Brasília, Fortaleza, Porto Alegre, Salvador und Recife. Alle Stadien wurden bereits bei der Männer-WM 2014 genutzt.",
    },
    {
        question: "Wo findet das Finale der Frauen WM 2027 statt?",
        answer:
            "Das Finale findet am 25. Juli 2027 im Maracanã in Rio de Janeiro statt. Im selben Stadion findet auch das Eröffnungsspiel statt.",
    },
    {
        question: "Wie kommt man an Tickets für die WM 2027?",
        answer:
            "Tickets werden ausschließlich über die offizielle FIFA-Seite verkauft. Die Verkaufsphasen werden in mehreren Wellen organisiert, beginnend nach der Auslosung der Gruppen. Mehr Details findest du auf unserer Ticket-Seite.",
    },
    {
        question: "Ist Brasilien sicher als Reiseziel während der WM?",
        answer:
            "Ja, mit der richtigen Vorbereitung. Rio de Janeiro hat in den letzten Jahren mehrere große Sportveranstaltungen erfolgreich ausgerichtet, darunter die Olympischen Spiele 2016 und die Männer-WM 2014. Wichtig ist, die grundlegenden Sicherheitsregeln zu kennen. Mehr dazu in unserem Sicherheits-Guide.",
    },
    {
        question: "Wann findet die Auslosung der Gruppenphase statt?",
        answer:
            "Der genaue Termin ist noch nicht offiziell bestätigt. Voraussichtlich findet die Endrundenauslosung Anfang 2027 statt, nach Abschluss der interkontinentalen Play-offs im Februar 2027, wenn alle 32 Teilnehmer feststehen.",
    },
    {
        question: "Wer ist als Gastgeber automatisch qualifiziert?",
        answer:
            "Brasilien als Gastgeber ist automatisch für die Endrunde qualifiziert. Die anderen 31 Plätze werden über die kontinentalen Qualifikationsturniere vergeben. Europa stellt elf Teams, die über das Liga-Format der UEFA Women's Nations League ermittelt werden.",
    },
    {
        question: "Wie kann ich meine Reise zur WM 2027 nach Rio planen?",
        answer:
            "Frühzeitig buchen ist wichtig: Hotels in der Nähe des Maracanã werden schnell ausgebucht sein. Ein deutschsprachiger Guide vor Ort hilft dir bei Unterkunft, Transfer, Sicherheit und allem, was du in der Stadt brauchst.",
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
                <section className="relative pt-32 pb-24 lg:pt-40 lg:pb-32 overflow-hidden bg-gray-900 border-b-4 border-rio-yellow">
                    <div className="absolute inset-0 z-0">
                        <Image
                            src="/images/wm-2027/bg-wm-2027.webp"
                            alt="FIFA Frauen-Weltmeisterschaft 2027 in Brasilien"
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
                                <span className="text-rio-yellow">Frauen WM 2027</span>
                            </nav>

                            <div className="max-w-3xl space-y-6">
                                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-sm font-medium">
                                    <CalendarDays className="w-4 h-4 text-rio-yellow" />
                                    <span>24. Juni bis 25. Juli 2027 · 8 Städte in Brasilien</span>
                                </div>

                                <h1 className="text-4xl lg:text-[clamp(32px,3.5vw,52px)] font-heading font-black text-white leading-[1.15] tracking-tight">
                                    Frauen-Weltmeisterschaft 2027 in Brasilien
                                </h1>

                                <p className="text-lg lg:text-xl text-rio-sand/90 leading-relaxed">
                                    Vom 24. Juni bis 25. Juli 2027 spielt die FIFA Frauen-WM in acht
                                    brasilianischen Städten. Eröffnungsspiel und Finale finden im
                                    Maracanã in Rio de Janeiro statt. Auf dieser Seite findest du
                                    alles, was du als deutscher Fan wissen musst: Spielorte, Termine,
                                    Tickets und wie du deine Reise nach Rio planst.
                                </p>

                                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                                    <Link
                                        href="/frauen-wm-2027/rio-de-janeiro"
                                        className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-rio-yellow text-gray-900 rounded-full font-bold text-lg hover:bg-yellow-400 hover:scale-[1.02] transition-all shadow-xl shadow-rio-yellow/20"
                                    >
                                        Tours in Rio während der WM 2027
                                        <ArrowRight className="w-5 h-5" />
                                    </Link>
                                    <Link
                                        href="/frauen-wm-2027/spielplan"
                                        className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-md border border-white/30 text-white rounded-full font-medium text-lg hover:bg-white/20 transition-all"
                                    >
                                        Spielplan ansehen
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
                                Die wichtigsten Fakten zur Frauen WM 2027 in Brasilien
                            </h2>
                            <div className="mt-4 space-y-4 text-gray-600 text-lg leading-relaxed">
                                <p>
                                    Vom 24. Juni bis 25. Juli 2027 wird Brasilien zum Schauplatz der
                                    zehnten FIFA Frauen-Weltmeisterschaft. Es ist die erste Frauen-WM,
                                    die jemals in Südamerika ausgetragen wird, und mehr als ein
                                    sportlicher Meilenstein: Es ist die Bühne, auf der ein Land, das
                                    den Fußball wie kein anderes lebt, die Welt empfängt.
                                </p>
                                <p>
                                    Die Frauen-Weltmeisterschaft gehört zu den größten Sportereignissen
                                    der Welt. Nur die Olympischen Spiele und die Männer-WM erreichen
                                    weltweit höhere Zuschauerzahlen. Über 32 Nationalmannschaften, 64
                                    Spiele und Millionen Fans aus aller Welt machen das Turnier zu einem
                                    globalen Spektakel.
                                </p>
                                <p>
                                    Brasilien hat eine{" "}
                                    <Link
                                        href="/touren/fussball"
                                        className="underline decoration-rio-green/40 underline-offset-2 hover:text-rio-green transition-colors"
                                    >
                                        jahrzehntelange Fußballtradition
                                    </Link>
                                    , die jede Stadt, jeden Strand und jede Bar in Rio prägt. Während
                                    der WM 2027 wird diese Energie spürbarer als je zuvor sein.
                                </p>
                            </div>
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

                {/* SEÇÃO 3 : Die 8 Spielorte */}
                <section className="py-20 bg-gray-50 border-t border-gray-100">
                    <div className="max-w-7xl mx-auto px-5 lg:px-8">
                        <FadeIn direction="up" className="max-w-[800px] mx-auto mb-12">
                            <h2 className="text-3xl lg:text-4xl font-heading font-bold text-gray-900 leading-tight">
                                Die 8 Spielorte der Frauen WM 2027
                            </h2>
                            <p className="mt-4 text-gray-600 text-lg leading-relaxed">
                                Alle 64 Spiele finden in acht brasilianischen Städten statt. Sämtliche
                                Stadien wurden bereits für die Männer-WM 2014 modernisiert. Das
                                Maracanã in Rio de Janeiro ist Schauplatz von Eröffnung und Finale.
                            </p>
                        </FadeIn>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {spielorte.map((ort, index) => {
                                const cardContent = (
                                    <>
                                        <div className="h-52 w-full relative overflow-hidden bg-gray-100">
                                            <Image
                                                src={`/images/wm-2027/stadien/${ort.slug}.webp`}
                                                alt={`${ort.stadion} in ${ort.stadt}`}
                                                fill
                                                loading="lazy"
                                                style={{ objectPosition: (ort as { imgPos?: string }).imgPos }}
                                                className="object-cover group-hover:scale-105 transition-transform duration-700"
                                            />
                                            {ort.badge && (
                                                <div className="absolute top-3 left-3">
                                                    <div className="flex items-center gap-1.5 text-[10px] font-bold px-3 py-1.5 rounded-full bg-rio-yellow text-gray-900 shadow-sm uppercase tracking-wider">
                                                        <Flag className="w-3.5 h-3.5" />
                                                        {ort.badge}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-6 flex flex-col flex-grow">
                                            <h3 className="text-xl font-bold font-heading text-gray-900">
                                                {ort.stadt}
                                            </h3>
                                            <p className="mt-1 text-gray-600 font-medium">
                                                {ort.stadion}
                                            </p>
                                            <p className="mt-3 inline-flex items-center gap-1.5 text-sm text-gray-500">
                                                <MapPin className="w-4 h-4 text-gray-400" />
                                                {ort.kapazitaet} Plätze
                                            </p>
                                            {ort.link && (
                                                <div className="mt-5 pt-5 border-t border-gray-100">
                                                    <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-rio-green group-hover:gap-2.5 transition-all duration-200">
                                                        Mehr zum Maracanã
                                                        <ChevronRight className="w-4 h-4" />
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </>
                                );

                                const baseCard = `rounded-3xl overflow-hidden shadow-sm border transition-all duration-300 group flex flex-col h-full ${
                                    ort.highlight
                                        ? "bg-white border-rio-yellow ring-2 ring-rio-yellow/40"
                                        : "bg-white border-gray-100"
                                }`;

                                return ort.link ? (
                                    <FadeIn key={index} delay={index * 0.05} direction="up">
                                        <Link
                                            href={ort.link}
                                            className={`${baseCard} hover:shadow-xl hover:scale-[1.01] cursor-pointer block`}
                                        >
                                            {cardContent}
                                        </Link>
                                    </FadeIn>
                                ) : (
                                    <FadeIn
                                        key={index}
                                        delay={index * 0.05}
                                        direction="up"
                                        className={baseCard}
                                    >
                                        {cardContent}
                                    </FadeIn>
                                );
                            })}
                        </div>

                        <FadeIn direction="up" className="mt-12 text-center">
                            <Link
                                href="/frauen-wm-2027/stadien"
                                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-rio-green text-white rounded-full font-bold text-lg hover:bg-green-700 hover:scale-[1.02] transition-all shadow-lg"
                            >
                                Alle Spielorte im Detail ansehen
                                <ArrowRight className="w-5 h-5" />
                            </Link>
                        </FadeIn>
                    </div>
                </section>

                {/* SEÇÃO 4 : Rio im Mittelpunkt */}
                <section className="py-20 lg:py-28 bg-white">
                    <div className="max-w-7xl mx-auto px-5 lg:px-8">
                        <FadeIn direction="up" className="max-w-[800px] mx-auto">
                            <h2 className="text-3xl lg:text-4xl font-heading font-bold text-gray-900 leading-tight">
                                Warum Rio bei dieser WM im Mittelpunkt steht
                            </h2>
                            <p className="mt-4 text-gray-600 text-lg leading-relaxed">
                                Eröffnung und Finale finden im Maracanã statt. Das sind die beiden
                                Spiele mit der größten Aufmerksamkeit weltweit. Wer als Fan eine Reise
                                zur WM 2027 plant, kommt an Rio nicht vorbei.
                            </p>
                            <p className="mt-4 text-gray-600 text-lg leading-relaxed">
                                Und wer in Rio ist, hat zwischen den Spieltagen mehr zu entdecken als
                                jede andere Gastgeberstadt der WM. Strände,{" "}
                                <Link
                                    href="/touren/sport-und-abenteuer"
                                    className="underline decoration-rio-green/40 underline-offset-2 hover:text-rio-green transition-colors"
                                >
                                    Berge
                                </Link>
                                ,{" "}
                                <Link
                                    href="/touren/kultur-und-geschichte"
                                    className="underline decoration-rio-green/40 underline-offset-2 hover:text-rio-green transition-colors"
                                >
                                    Kultur
                                </Link>{" "}
                                und Nachtleben warten in unmittelbarer Nähe der Spielorte.
                            </p>
                            <p className="mt-4 text-gray-600 text-lg leading-relaxed">
                                Es ist nicht das erste Mal, dass Brasilien deutsche Fans empfängt. Bei
                                der Männer-WM 2014 reisten zehntausende Deutsche durchs Land, darunter
                                zum historischen 7:1-Halbfinale in Belo Horizonte, einem der
                                unvergessensten Spiele der WM-Geschichte. 2027 kommen sie wieder,
                                diesmal nach Rio, in eine Stadt, die mehr bietet als nur Fußball.
                            </p>
                            <p className="mt-4 text-gray-600 text-lg leading-relaxed">
                                Rio de Janeiro ist UNESCO-Weltkulturerbe. Zwischen den Spieltagen warten
                                der{" "}
                                <Link
                                    href="/rio-guide/sehenswuerdigkeiten/christus-erloeser"
                                    className="underline decoration-rio-green/40 underline-offset-2 hover:text-rio-green transition-colors"
                                >
                                    Christus auf dem Corcovado
                                </Link>
                                , der{" "}
                                <Link
                                    href="/rio-guide/sehenswuerdigkeiten/zuckerhut"
                                    className="underline decoration-rio-green/40 underline-offset-2 hover:text-rio-green transition-colors"
                                >
                                    Zuckerhut
                                </Link>
                                ,{" "}
                                <Link
                                    href="/touren/natur-und-straende"
                                    className="underline decoration-rio-green/40 underline-offset-2 hover:text-rio-green transition-colors"
                                >
                                    Copacabana und Ipanema
                                </Link>
                                , die{" "}
                                <Link
                                    href="/touren/favela-tour"
                                    className="underline decoration-rio-green/40 underline-offset-2 hover:text-rio-green transition-colors"
                                >
                                    Favelas
                                </Link>
                                , das{" "}
                                <Link
                                    href="/touren/by-night"
                                    className="underline decoration-rio-green/40 underline-offset-2 hover:text-rio-green transition-colors"
                                >
                                    Nachtleben in Lapa
                                </Link>{" "}
                                und die Restaurants in Santa Teresa. Während der WM wird die ganze Stadt
                                zum Mittelpunkt der Fußballwelt.
                            </p>
                        </FadeIn>

                        <FadeIn direction="up" className="max-w-[800px] mx-auto mt-12">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {[
                                    {
                                        icon: MapPin,
                                        title: "Die Sehenswürdigkeiten der Stadt",
                                        desc: "Christus Erlöser, Zuckerhut, Escadaria Selarón und mehr: die wichtigsten Highlights für spielfreie Tage.",
                                        link: "/rio-guide/sehenswuerdigkeiten",
                                    },
                                    {
                                        icon: Compass,
                                        title: "Geführte Touren auf Deutsch",
                                        desc: "Klassiker Tour, Favela Tour, Rio by Night und weitere Erlebnisse mit lokalem Guide.",
                                        link: "/touren",
                                    },
                                    {
                                        icon: Trophy,
                                        title: "Das Maracanã als Sehenswürdigkeit",
                                        desc: "Geschichte und Besuch des berühmtesten Stadions der Welt, auch außerhalb der Spieltage.",
                                        link: "/rio-guide/sehenswuerdigkeiten/maracana",
                                    },
                                    {
                                        icon: ShieldCheck,
                                        title: "Sicherheit in Rio",
                                        desc: "Was du als deutscher Tourist wissen musst, bevor du anreist.",
                                        link: "/ist-rio-gefaehrlich",
                                    },
                                ].map((card) => {
                                    const Icon = card.icon;
                                    return (
                                        <Link
                                            key={card.title}
                                            href={card.link}
                                            className="group flex flex-col bg-white rounded-3xl border border-gray-100 shadow-sm p-7 hover:shadow-xl hover:border-rio-green/30 hover:scale-[1.01] transition-all duration-300"
                                        >
                                            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-rio-green/10 text-rio-green mb-5">
                                                <Icon className="w-6 h-6" />
                                            </div>
                                            <h3 className="text-xl font-bold font-heading text-gray-900">
                                                {card.title}
                                            </h3>
                                            <p className="mt-3 text-gray-600 leading-relaxed flex-grow">
                                                {card.desc}
                                            </p>
                                            <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-rio-green group-hover:gap-2.5 transition-all duration-200">
                                                Mehr erfahren
                                                <ArrowRight className="w-4 h-4" />
                                            </span>
                                        </Link>
                                    );
                                })}
                            </div>
                        </FadeIn>

                        <FadeIn direction="up" className="max-w-[800px] mx-auto mt-12">
                            <p className="text-lg text-gray-600 leading-relaxed">
                                Alles, was du für deine Reise nach Rio während der WM 2027 brauchst,
                                findest du gebündelt im Reiseguide für Rio während der WM:
                            </p>
                            <div className="mt-8 text-center">
                                <Link
                                    href="/frauen-wm-2027/rio-de-janeiro"
                                    className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-rio-yellow text-gray-900 rounded-full font-bold text-lg hover:bg-yellow-400 hover:scale-[1.02] transition-all shadow-lg"
                                >
                                    Kompletter Reiseguide für Rio während der WM
                                    <ArrowRight className="w-5 h-5" />
                                </Link>
                            </div>
                        </FadeIn>
                    </div>
                </section>

                {/* SEÇÃO 5 : Deutschland bei der WM 2027 */}
                <section className="py-20 bg-gray-50 border-t border-gray-100">
                    <div className="max-w-7xl mx-auto px-5 lg:px-8">
                        <FadeIn direction="up" className="max-w-[800px] mx-auto">
                            <h2 className="text-3xl lg:text-4xl font-heading font-bold text-gray-900 leading-tight">
                                Die DFB-Frauen bei der WM 2027
                            </h2>
                            <p className="mt-4 text-gray-600 text-lg leading-relaxed">
                                Die DFB-Frauen sind bei der WM 2027 dabei. Am 5. Juni 2026 sicherte
                                sich die Mannschaft von Bundestrainer Christian Wück mit einem 2:0
                                gegen Norwegen in Köln vorzeitig das WM-Ticket als Gruppensieger.
                            </p>
                            <p className="mt-4 text-gray-600 text-lg leading-relaxed">
                                Die endgültigen Gruppengegner Deutschlands stehen erst nach der
                                Endrundenauslosung fest. Diese wird voraussichtlich Anfang 2027
                                stattfinden, nachdem im Februar 2027 die letzten Startplätze über die
                                interkontinentalen Play-offs vergeben sind.
                            </p>
                            <div className="mt-10 text-center">
                                <Link
                                    href="/frauen-wm-2027/deutschland"
                                    className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-rio-green text-white rounded-full font-bold text-lg hover:bg-green-700 hover:scale-[1.02] transition-all shadow-lg"
                                >
                                    Alle Infos zur deutschen Mannschaft
                                    <ArrowRight className="w-5 h-5" />
                                </Link>
                            </div>
                        </FadeIn>
                    </div>
                </section>

                {/* SEÇÃO 6 : Tickets */}
                <section className="py-20 lg:py-28 bg-white">
                    <div className="max-w-7xl mx-auto px-5 lg:px-8">
                        <FadeIn direction="up" className="max-w-[800px] mx-auto">
                            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-rio-green/10 text-rio-green mb-6">
                                <Ticket className="w-7 h-7" />
                            </div>
                            <h2 className="text-3xl lg:text-4xl font-heading font-bold text-gray-900 leading-tight">
                                Tickets für die Frauen WM 2027
                            </h2>
                            <p className="mt-4 text-gray-600 text-lg leading-relaxed">
                                Tickets werden ausschließlich über die offizielle FIFA-Seite verkauft.
                                Der Verkauf erfolgt in mehreren Phasen, beginnend nach der Auslosung
                                der Gruppenphase. Wer sich frühzeitig registriert, wird über alle
                                Verkaufsphasen benachrichtigt.
                            </p>
                            <div className="mt-10 text-center">
                                <Link
                                    href="/frauen-wm-2027/tickets"
                                    className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-rio-yellow text-gray-900 rounded-full font-bold text-lg hover:bg-yellow-400 hover:scale-[1.02] transition-all shadow-lg"
                                >
                                    Alles zu Tickets und Vorverkauf
                                    <ArrowRight className="w-5 h-5" />
                                </Link>
                            </div>
                        </FadeIn>
                    </div>
                </section>

                {/* SEÇÃO 7 : FAQ */}
                <section className="py-20 bg-gray-50 border-t border-gray-100">
                    <div className="max-w-3xl mx-auto px-5 lg:px-8">
                        <FadeIn direction="up" className="mb-8">
                            <h2 className="text-3xl lg:text-4xl font-heading font-bold text-gray-900 leading-tight">
                                Häufig gestellte Fragen
                            </h2>
                        </FadeIn>

                        <FadeIn direction="up">
                            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm px-6 lg:px-8">
                                <Faq
                                    items={faqItems.map((item) => ({
                                        q: item.question,
                                        a: item.answer,
                                    }))}
                                />
                            </div>
                        </FadeIn>

                        <FadeIn direction="up" className="mt-8 flex flex-col sm:flex-row gap-4">
                            <Link
                                href="/ist-rio-gefaehrlich"
                                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white border border-gray-200 text-gray-900 rounded-full font-semibold hover:border-rio-green hover:text-rio-green transition-all"
                            >
                                <ShieldCheck className="w-5 h-5 text-rio-green" />
                                Zum Sicherheits-Guide für Rio
                            </Link>
                            <Link
                                href="/frauen-wm-2027/rio-de-janeiro"
                                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-rio-green text-white rounded-full font-semibold hover:bg-green-700 transition-all"
                            >
                                Tours in Rio während der WM 2027
                                <ArrowRight className="w-5 h-5" />
                            </Link>
                        </FadeIn>
                    </div>
                </section>

                {/* SEÇÃO 7.5 : Dein Rio Guide */}
                <section className="py-20 lg:py-28 bg-white border-t border-gray-100">
                    <div className="max-w-7xl mx-auto px-5 lg:px-8">
                        <FadeIn direction="up">
                            <div className="max-w-2xl mx-auto text-center">
                                <div className="relative w-32 h-32 lg:w-40 lg:h-40 mx-auto rounded-full overflow-hidden bg-gray-100 ring-4 ring-rio-green/10 shadow-md">
                                    <Image
                                        src="/images/wm-2027/will.webp"
                                        alt="Will, deutschsprachiger Rio Guide in Rio de Janeiro"
                                        fill
                                        loading="lazy"
                                        className="object-cover object-top"
                                    />
                                </div>

                                <span className="mt-6 inline-block text-xs font-bold uppercase tracking-wider text-rio-green">
                                    Dein Guide vor Ort
                                </span>
                                <h2 className="mt-3 text-3xl lg:text-4xl font-heading font-bold text-gray-900 leading-tight">
                                    Will, dein deutschsprachiger Rio Guide
                                </h2>

                                <div className="mt-5 flex flex-wrap justify-center gap-2">
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rio-green/10 text-rio-green text-sm font-semibold">
                                        <MapPin className="w-4 h-4" />
                                        Geborener Carioca
                                    </span>
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rio-green/10 text-rio-green text-sm font-semibold">
                                        <GraduationCap className="w-4 h-4" />
                                        Deutsche Schule Rio
                                    </span>
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rio-green/10 text-rio-green text-sm font-semibold">
                                        <Plane className="w-4 h-4" />
                                        4 Jahre in Köln
                                    </span>
                                </div>

                                <div className="mt-6 space-y-5 text-gray-600 text-lg leading-relaxed">
                                    <p>
                                        Ich heiße <strong className="font-semibold text-gray-900">Will</strong>, geboren und aufgewachsen in Rio de
                                        Janeiro. Meine gesamte Schulzeit habe ich auf der Deutschen
                                        Schule in Rio absolviert, und vier Jahre meines Lebens habe
                                        ich in Köln verbracht. So habe ich beide Kulturen tief
                                        kennengelernt: die deutsche Mentalität und die brasilianische
                                        Lebensart.
                                    </p>
                                    <p>
                                        Heute arbeite ich als deutschsprachiger Guide in meiner
                                        Heimatstadt. Ich weiß, was deutsche Besucher erwarten, und
                                        ich kenne Rio aus jeder Perspektive. Während der WM 2027
                                        begleite ich dich vor Ort: mit lokalem Wissen, persönlichem
                                        Kontakt und der Sicherheit eines Cariocas, der hier zuhause
                                        ist.
                                    </p>
                                </div>
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
                                Bereit für die WM 2027 in Rio?
                            </h2>
                            <p className="text-lg text-rio-sand/90 mb-10 max-w-2xl mx-auto leading-relaxed">
                                Plane deine Reise mit einem deutschsprachigen Guide vor Ort. Mit Will,
                                Carioca und ehemaligem Kölner, bist du in Rio sicher unterwegs: von der
                                Anreise über die Spieltage bis zu deinen freien Tagen in der Stadt.
                            </p>
                            <div className="flex flex-col sm:flex-row justify-center gap-4">
                                <Link
                                    href="/frauen-wm-2027/rio-de-janeiro"
                                    className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-rio-yellow text-gray-900 rounded-full font-bold text-lg hover:bg-yellow-400 hover:scale-[1.02] transition-all shadow-xl shadow-black/10"
                                >
                                    Tours in Rio während der WM 2027
                                    <ArrowRight className="w-5 h-5" />
                                </Link>
                                <Link
                                    href="/unterkunft/beratung"
                                    className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-md border border-white/30 text-white rounded-full font-medium text-lg hover:bg-white/20 transition-all"
                                >
                                    Persönliche Reiseberatung anfragen
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

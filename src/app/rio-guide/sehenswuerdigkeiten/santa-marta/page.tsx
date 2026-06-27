import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FadeIn from "@/components/FadeIn";
import AndereTouren from "@/components/AndereTouren";
import Faq from "@/components/Faq";
import { ChevronRight, Home, ArrowRight, Phone } from "lucide-react";

const faqs = [
    {
        q: "Ist die Favela Santa Marta sicher zu besuchen?",
        a: "Mit Will an deiner Seite ja. Santa Marta war die erste befriedete Favela Rios und gilt heute als eine der sichersten für einen Besuch. Will kennt die Community und führt dich mit Respekt durch die Gassen.",
    },
    {
        q: "Wo wurde das Michael-Jackson-Video gedreht?",
        a: "Direkt in der Santa Marta. Auf dem kleinen Platz oben im Morro steht heute eine lebensgroße Bronzestatue von Michael Jackson, genau dort, wo Spike Lee 1996 \"They Don't Care About Us\" gefilmt hat. Ein beliebter Fotostopp.",
    },
    {
        q: "Wie kommt man in der Santa Marta nach oben?",
        a: "Mit dem Teleférico, dem Schrägaufzug. Er fährt kostenlos den steilen Hügel hinauf und erspart dir die vielen Treppen. Von oben hast du den besten Blick auf Cristo, Lagoa und die Bucht von Botafogo.",
    },
    {
        q: "Was kostet eine Tour durch die Santa Marta?",
        a: "Die Favela Tour mit Will startet ab ca. 80 €. Der Besuch der Favela selbst ist kostenlos, bezahlt wird die deutschsprachige Begleitung und die Lokalkenntnis.",
    },
    {
        q: "Wie lange dauert ein Besuch?",
        a: "Etwa zwei Stunden. Santa Marta ist überschaubar und genau deshalb ein guter erster Kontakt mit einer Favela in Rio.",
    },
];

export const metadata = {
    title: {
        absolute: "Favela Santa Marta Rio de Janeiro besuchen auf Deutsch | Rio für Deutsche",
    },
    description:
        "Favela Santa Marta in Botafogo besuchen: Michael Jackson Video, erste pacificada Favela, Teleférico, Aussicht auf Cristo und Bucht. Auf Deutsch, mit Will.",
    keywords: [
        "Favela Santa Marta",
        "Santa Marta Rio de Janeiro",
        "Michael Jackson Favela",
        "Favela Tour Botafogo",
        "pacificada Favela",
        "Santa Marta besuchen",
    ],
    alternates: {
        canonical: "https://riofuerdeutsche.de/rio-guide/sehenswuerdigkeiten/santa-marta",
    },
    openGraph: {
        title: "Favela Santa Marta Rio de Janeiro besuchen auf Deutsch",
        description:
            "Die erste befriedete Favela Rios in Botafogo. Michael Jackson Video, Teleférico, atemberaubender Blick. Mit Will auf Deutsch erklärt.",
        url: "https://riofuerdeutsche.de/rio-guide/sehenswuerdigkeiten/santa-marta",
    },
};

const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TouristAttraction",
    name: "Favela Santa Marta",
    description:
        "Favela Santa Marta in Botafogo, Rio de Janeiro. Eine lebendige Gemeinschaft mit rund 8.000 Einwohnern auf dem Morro Dona Marta, weltbekannt durch das Michael-Jackson-Video und als erste offiziell befriedete Favela Rios.",
    url: "https://riofuerdeutsche.de/rio-guide/sehenswuerdigkeiten/santa-marta",
    touristType: "Cultural tourism",
    isAccessibleForFree: true,
    address: {
        "@type": "PostalAddress",
        addressLocality: "Rio de Janeiro",
        addressRegion: "RJ",
        addressCountry: "BR",
    },
    geo: {
        "@type": "GeoCoordinates",
        latitude: -22.9474,
        longitude: -43.1925,
    },
    inLanguage: "de",
};

const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
};

const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
        { "@type": "ListItem", position: 1, name: "Startseite", item: "https://riofuerdeutsche.de" },
        { "@type": "ListItem", position: 2, name: "Rio-Guide", item: "https://riofuerdeutsche.de/rio-guide" },
        { "@type": "ListItem", position: 3, name: "Sehenswürdigkeiten", item: "https://riofuerdeutsche.de/rio-guide/sehenswuerdigkeiten" },
        { "@type": "ListItem", position: 4, name: "Favela Santa Marta", item: "https://riofuerdeutsche.de/rio-guide/sehenswuerdigkeiten/santa-marta" },
    ],
};

export default function SantaMartaPage() {
    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
            />
            <div className="flex flex-col min-h-screen bg-rio-sand selection:bg-rio-green selection:text-white font-sans">
                <Navbar />

                <main className="flex-grow">
                    {/* ── HERO ─────────────────────────────────────────── */}
                    <section className="relative pt-32 pb-28 lg:pt-44 lg:pb-36 overflow-hidden">
                        <Image
                            src="/images/rio-favela.webp"
                            alt="Favela Santa Marta in Botafogo, Rio de Janeiro"
                            fill
                            className="object-cover object-center z-0"
                            priority
                        />
                        <div className="absolute inset-0 z-0 bg-[#071a0e]/75" />
                        <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-[#22a262]/10 blur-3xl z-0 -translate-y-1/2 translate-x-1/4" />
                        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-[#22a262]/8 blur-3xl z-0 translate-y-1/2 -translate-x-1/4" />

                        <div className="relative z-10 max-w-7xl mx-auto px-5 lg:px-8">
                            <FadeIn direction="up">
                                <nav
                                    className="flex items-center flex-wrap gap-y-1 text-sm font-medium text-white/50 mb-10"
                                    aria-label="Breadcrumb"
                                >
                                    <Link href="/" className="hover:text-white transition-colors" aria-label="Startseite">
                                        <Home className="w-4 h-4" />
                                    </Link>
                                    <ChevronRight className="w-4 h-4 mx-2 text-white/25 shrink-0" />
                                    <Link href="/rio-guide" className="hover:text-white transition-colors">
                                        Rio-Guide
                                    </Link>
                                    <ChevronRight className="w-4 h-4 mx-2 text-white/25 shrink-0" />
                                    <Link href="/rio-guide/sehenswuerdigkeiten" className="hover:text-white transition-colors">
                                        Sehenswürdigkeiten
                                    </Link>
                                    <ChevronRight className="w-4 h-4 mx-2 text-white/25 shrink-0" />
                                    <span className="text-[#22a262] font-semibold">Favela Santa Marta</span>
                                </nav>

                                <div className="max-w-4xl">
                                    <h1 className="text-5xl lg:text-[clamp(40px,5vw,72px)] font-heading font-black text-white leading-[1.08] tracking-tight mb-6">
                                        Favela Santa Marta, die erste befriedete Favela Rios
                                    </h1>

                                    <p className="text-xl lg:text-2xl text-white/70 font-medium leading-snug max-w-2xl mb-10">
                                        Klein, lebendig, mitten in Botafogo. Der beste erste Kontakt mit einer Favela in Rio.
                                    </p>

                                    <div className="flex flex-col sm:flex-row gap-4">
                                        <Link
                                            href="/touren/favela-tour"
                                            className="inline-flex items-center justify-center gap-2.5 px-8 py-4 bg-[#22a262] text-white rounded-full font-bold text-base hover:bg-[#1a8a52] hover:scale-[1.02] transition-all shadow-xl shadow-[#22a262]/25"
                                        >
                                            Favela Santa Marta besuchen
                                            <ArrowRight className="w-4 h-4" />
                                        </Link>
                                        <Link
                                            href="/rio-guide/sehenswuerdigkeiten"
                                            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/8 backdrop-blur-md border border-white/20 text-white/80 rounded-full font-medium text-base hover:bg-white/15 hover:text-white transition-all"
                                        >
                                            Alle Sehenswürdigkeiten
                                        </Link>
                                    </div>
                                </div>
                            </FadeIn>
                        </div>
                    </section>

                    {/* ── Info Cards ─────────────────────────────────── */}
                    <section className="py-16 lg:py-20 bg-gray-50 border-t border-gray-100">
                        <div className="max-w-7xl mx-auto px-5 lg:px-8">
                            <FadeIn direction="up">
                                <h2 className="text-xs font-bold tracking-widest uppercase text-rio-green mb-8">
                                    Praktische Infos auf einen Blick
                                </h2>
                            </FadeIn>
                            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">

                                <FadeIn delay={0} direction="up" className="bg-white border border-gray-100 rounded-2xl p-5 flex flex-col gap-3 hover:border-rio-green/30 hover:shadow-sm transition-all duration-300">
                                    <span className="text-2xl" role="img" aria-label="Uhr">⏱</span>
                                    <div>
                                        <p className="text-[11px] font-bold tracking-widest uppercase text-gray-400 mb-1">Dauer</p>
                                        <p className="text-gray-900 font-semibold text-[15px] leading-snug">ca. 2 Stunden <span className="text-gray-400 font-normal">(mit Will)</span></p>
                                    </div>
                                </FadeIn>

                                <FadeIn delay={0.05} direction="up" className="bg-white border border-gray-100 rounded-2xl p-5 flex flex-col gap-3 hover:border-rio-green/30 hover:shadow-sm transition-all duration-300">
                                    <span className="text-2xl" role="img" aria-label="Sonne">☀️</span>
                                    <div>
                                        <p className="text-[11px] font-bold tracking-widest uppercase text-gray-400 mb-1">Beste Zeit</p>
                                        <p className="text-gray-900 font-semibold text-[15px] leading-snug">Tagsüber <span className="text-gray-400 font-normal">(10:00 bis 16:00 Uhr)</span></p>
                                    </div>
                                </FadeIn>

                                <FadeIn delay={0.1} direction="up" className="bg-white border border-gray-100 rounded-2xl p-5 flex flex-col gap-3 hover:border-rio-green/30 hover:shadow-sm transition-all duration-300">
                                    <span className="text-2xl" role="img" aria-label="Standort">📍</span>
                                    <div>
                                        <p className="text-[11px] font-bold tracking-widest uppercase text-gray-400 mb-1">Lage</p>
                                        <p className="text-gray-900 font-semibold text-[15px] leading-snug">Botafogo <span className="text-gray-400 font-normal">(Morro Dona Marta)</span></p>
                                    </div>
                                </FadeIn>

                                <FadeIn delay={0.15} direction="up" className="bg-white border border-gray-100 rounded-2xl p-5 flex flex-col gap-3 hover:border-rio-green/30 hover:shadow-sm transition-all duration-300">
                                    <span className="text-2xl" role="img" aria-label="Geld">💰</span>
                                    <div>
                                        <p className="text-[11px] font-bold tracking-widest uppercase text-gray-400 mb-1">Eintritt</p>
                                        <p className="text-gray-900 font-semibold text-[15px] leading-snug">Kostenlos <span className="text-gray-400 font-normal">(Tour ab ca. 80 €)</span></p>
                                    </div>
                                </FadeIn>

                                <FadeIn delay={0.2} direction="up" className="bg-white border border-gray-100 rounded-2xl p-5 flex flex-col gap-3 hover:border-rio-green/30 hover:shadow-sm transition-all duration-300">
                                    <span className="text-2xl" role="img" aria-label="Seilbahn">🚡</span>
                                    <div>
                                        <p className="text-[11px] font-bold tracking-widest uppercase text-gray-400 mb-1">Teleférico</p>
                                        <p className="text-gray-900 font-semibold text-[15px] leading-snug">Kostenlos, ersetzt die steilen Stufen</p>
                                    </div>
                                </FadeIn>

                                <FadeIn delay={0.25} direction="up" className="bg-white border border-rio-green/20 rounded-2xl p-5 flex flex-col gap-3 hover:border-rio-green/50 hover:shadow-sm transition-all duration-300">
                                    <span className="text-2xl" role="img" aria-label="Auto">🚗</span>
                                    <div>
                                        <p className="text-[11px] font-bold tracking-widest uppercase text-rio-green mb-1">Mit Will</p>
                                        <p className="text-gray-900 font-semibold text-[15px] leading-snug">Privattransfer inklusive, kein Stress</p>
                                    </div>
                                </FadeIn>

                                <FadeIn delay={0.3} direction="up" className="bg-white border border-rio-green/20 rounded-2xl p-5 flex flex-col gap-3 hover:border-rio-green/50 hover:shadow-sm transition-all duration-300">
                                    <span className="text-2xl" role="img" aria-label="Sprechen">🗣️</span>
                                    <div>
                                        <p className="text-[11px] font-bold tracking-widest uppercase text-rio-green mb-1">Sprache</p>
                                        <p className="text-gray-900 font-semibold text-[15px] leading-snug">Auf Deutsch erklärt, mit Lokalkenntnissen</p>
                                    </div>
                                </FadeIn>

                            </div>

                            {/* ── Wetter & Sicht ───────────────────────── */}
                            <FadeIn direction="up" className="mt-6">
                                <div className="relative bg-[#0d1f15] rounded-2xl overflow-hidden border border-amber-500/40 shadow-lg shadow-black/10">
                                    <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-amber-500/8 blur-3xl pointer-events-none" />
                                    <div className="relative p-7 lg:p-8">
                                        <div className="flex items-center gap-3 mb-5">
                                            <span className="text-3xl" role="img" aria-label="Wetter">⛅</span>
                                            <span className="text-xs font-bold tracking-widest uppercase text-amber-400">
                                                Wetter &amp; Sicht
                                            </span>
                                        </div>
                                        <h3 className="text-xl lg:text-2xl font-heading font-bold text-white mb-4 leading-tight">
                                            Wann die Aussicht oben am besten ist
                                        </h3>
                                        <p className="text-white/75 text-base leading-relaxed mb-4">
                                            Santa Marta sitzt auf einem steilen Hang über Botafogo. Von der oberen Station des Teleférico
                                            siehst du den Cristo Redentor von schräg unten, die Lagoa und die ganze Bucht von Botafogo bis
                                            zum Zuckerhut. Wenn die Luft klar ist, hast du eine der besten Aussichten der Stadt, und das
                                            ohne einen Cent Eintritt.
                                        </p>
                                        <p className="text-white/60 text-sm leading-relaxed">
                                            <span className="text-amber-400 font-semibold">Klare Sicht ist am wahrscheinlichsten:</span>{" "}
                                            Juni bis September (Winter in Rio, trockene Luft, kaum Nachmittagswolken). Im Hochsommer
                                            (Januar, Februar) gehst du am besten vormittags hoch, bevor sich die Wolken über dem Corcovado
                                            sammeln.
                                        </p>
                                    </div>
                                </div>
                            </FadeIn>
                        </div>
                    </section>

                    {/* ── Intro Text ─────────────────────────────────── */}
                    <section className="pt-20 lg:pt-28 pb-8 bg-white">
                        <div className="max-w-7xl mx-auto px-5 lg:px-8">
                            <FadeIn direction="up">
                                <div className="max-w-[800px] mx-auto space-y-7 text-left">
                                    <h2 className="text-3xl lg:text-4xl font-heading font-bold text-gray-900 leading-tight">
                                        Santa Marta, der beste erste Kontakt mit einer Favela
                                    </h2>

                                    <p className="text-xl lg:text-2xl font-semibold text-gray-900 leading-snug">
                                        Wenn meine deutschen Gäste mir sagen, dass sie eine Favela sehen wollen, aber sich noch
                                        nicht sicher sind, bringe ich sie meistens nach Santa Marta. Klein genug, dass du in zwei
                                        Stunden ein Gefühl für den Ort bekommst. Lebendig genug, dass du wirklich verstehst, was
                                        eine Favela ausmacht. Und mitten in Botafogo, also fünf Minuten von der Zona Sul entfernt.
                                    </p>

                                    <p className="text-lg text-gray-600 leading-relaxed">
                                        Rund 8.000 Menschen leben hier, auf dem Morro Dona Marta, einem steilen Hang über Botafogo.
                                        Es gibt kleine Bäckereien, Friseure, ein paar Bars, eine Schule, und überall an den Hauswänden
                                        Grafittis von Künstlern, die hier oben groß geworden sind. Du läufst nicht durch ein Museum,
                                        du läufst durch ein Viertel, in dem Leute morgens zur Arbeit gehen und abends auf der Laje
                                        sitzen.
                                    </p>

                                    <p className="text-lg text-gray-600 leading-relaxed pt-2 border-t border-gray-100">
                                        Ich bin in Rio aufgewachsen und kenne Santa Marta seit den Jahren, in denen hier noch
                                        niemand hochging. Heute ist es anders. Es gibt einen Teleférico, der dich kostenlos hochbringt,
                                        Touristen kommen vorbei, ein paar Familien führen kleine Cafés mit Aussicht. Was sich nicht
                                        geändert hat: das Tempo. Wenn du mit der{" "}
                                        <Link href="/touren/favela-tour" className="text-[#2D6A4F] underline underline-offset-2 hover:text-[#1a4a35] transition-colors">Favela Tour auf Deutsch</Link>{" "}
                                        herkommst, gehst du in genau dem Tempo, in dem die Cariocas hier leben.
                                    </p>
                                </div>
                            </FadeIn>
                        </div>
                    </section>

                    {/* ── Geschichte ─────────────────────────────────── */}
                    <section className="pt-20 lg:pt-28 pb-12 lg:pb-16 bg-gray-50 border-t border-gray-100">
                        <div className="max-w-7xl mx-auto px-5 lg:px-8">
                            <FadeIn direction="up" className="mb-10">
                                <div className="max-w-[800px] mx-auto">
                                    <h2 className="text-3xl lg:text-4xl font-heading font-bold text-gray-900 leading-tight">
                                        Geschichte &amp;{" "}
                                        <span className="text-rio-green">Wissenswertes</span>
                                    </h2>
                                </div>
                            </FadeIn>

                            <FadeIn direction="up">
                                <div className="max-w-[800px] mx-auto space-y-7 text-left">

                                    <p className="text-lg text-gray-600 leading-relaxed">
                                        Santa Marta ist eine der ältesten Favelas der Zona Sul. Sie wuchs ab den 1930er Jahren am
                                        Morro Dona Marta, hinter der Praça Corumbá in Botafogo, getragen vor allem von Arbeitern,
                                        die in den umliegenden Häusern und auf den Baustellen der wachsenden Stadt beschäftigt waren.
                                        Über Jahrzehnte hat die Gemeinschaft den Hang Stück für Stück besiedelt, Haus über Haus,
                                        ohne dass der Staat groß etwas dazu beigetragen hätte.
                                    </p>

                                    <p className="text-lg text-gray-600 leading-relaxed">
                                        Bekannt wurde Santa Marta im August 1996, mit drei Tagen Dreharbeiten. Spike Lee drehte hier
                                        oben das Musikvideo zu <em>They Don&apos;t Care About Us</em> mit Michael Jackson. Die Szene auf
                                        dem Platz, mit der Trommelgruppe Olodum im Hintergrund, hat die Favela weltweit bekannt gemacht.
                                        Auf genau der Laje, von der aus damals gedreht wurde, steht heute eine lebensgroße Bronzestatue
                                        von Michael Jackson. Wer einmal in Santa Marta war, hat normalerweise ein Foto davon.
                                    </p>

                                    <p className="text-lg text-gray-600 leading-relaxed">
                                        2008 wurde Santa Marta die erste offiziell befriedete Favela Rios. Die Polizei richtete hier
                                        eine sogenannte UPP ein, eine permanente Einheit für Befriedungspolizei, und der Drogenhandel,
                                        der zuvor die Gemeinschaft kontrolliert hatte, verschwand für lange Zeit aus dem Alltag. Das
                                        Programm war politisch umstritten und nicht überall erfolgreich, in Santa Marta hat es aber
                                        funktioniert, und seither gilt der Morro als eine der sichersten Favelas der Stadt.
                                    </p>

                                    <p className="text-lg text-gray-600 leading-relaxed">
                                        Die wichtigste praktische Veränderung der letzten Jahre ist der Teleférico, ein Plano Inclinado,
                                        der den Hang in fünf Stationen erklimmt. Vorher musstest du knapp 800 Stufen hochlaufen, was
                                        gerade für ältere Bewohner ein echtes Hindernis war. Heute steigst du unten ein, fährst kostenlos
                                        hoch, und bist in ein paar Minuten oben auf der Laje. Für die Bewohner ist das Alltag, für dich
                                        als Besucher ist es nebenbei eine kleine Panoramafahrt.
                                    </p>

                                    <p className="text-lg text-gray-600 leading-relaxed">
                                        Was man auf dem Weg nach oben sieht: bunte Häuser. Im Rahmen eines Revitalisierungsprojekts
                                        haben die Bewohner zusammen mit Künstlern viele der Fassaden in kräftigen Farben gestrichen.
                                        Wer durch die schmalen Vielas läuft, läuft heute durch eine kleine Open-Air-Galerie aus
                                        Grafittis und Wandmalereien, viele davon von lokalen Künstlern, die in der Favela groß
                                        geworden sind.
                                    </p>

                                    <p className="text-lg text-gray-600 leading-relaxed">
                                        Und dann ist da die Aussicht. Von der oberen Station siehst du den Cristo Redentor frontal,
                                        die Lagoa Rodrigo de Freitas, die Bucht von Botafogo, und an klaren Tagen die Pão de Açúcar.
                                        Es ist ein Blick, den du an keinem offiziellen Aussichtspunkt der Stadt so bekommst, und er
                                        kostet keinen Eintritt. Genau diese Mischung macht Santa Marta aus: Geschichte, Aussicht und
                                        ein Viertel, das funktioniert.
                                    </p>

                                </div>
                            </FadeIn>
                        </div>
                    </section>

                    {/* ── Wills Insider-Tipp ─────────────────────────── */}
                    <section className="py-16 lg:py-20 bg-white border-t border-gray-100">
                        <div className="max-w-7xl mx-auto px-5 lg:px-8">
                            <FadeIn direction="up">
                                <div className="max-w-[800px] mx-auto">
                                    <div className="relative bg-[#0d1f15] rounded-3xl overflow-hidden border-l-4 border-[#22a262] shadow-xl shadow-black/10">
                                        <div className="absolute top-0 right-0 w-72 h-72 rounded-full bg-[#22a262]/8 blur-3xl pointer-events-none" />
                                        <div className="relative p-8 lg:p-10">
                                            <div className="flex items-center gap-3 mb-6">
                                                <span className="text-3xl" role="img" aria-label="Glühbirne">💡</span>
                                                <span className="text-xs font-bold tracking-widest uppercase text-[#22a262]">
                                                    Wills Insider-Tipp
                                                </span>
                                            </div>
                                            <h3 className="text-2xl lg:text-3xl font-heading font-bold text-white mb-5 leading-tight">
                                                Der Trick mit der Michael-Jackson-Statue
                                            </h3>
                                            <p className="text-white/75 text-lg leading-relaxed">
                                                Das beliebteste Foto in Santa Marta wird auf der Laje mit der Bronze-Statue gemacht, dort
                                                wo Spike Lee 1996 das Video gedreht hat. Im Laufe des Vormittags füllt sich der Platz mit
                                                Reisegruppen, und du wartest schnell zehn Minuten auf dein Foto. Mein Tipp: Wir fahren
                                                gleich nach der Öffnung mit dem Teleférico ganz nach oben, gehen zu Fuß zwei Stationen
                                                wieder runter zur Laje, und du hast den Platz fast für dich. Danach trinken wir einen
                                                Café bei Dona Marlene auf der Aussichtsterrasse, mit Blick auf den Cristo. Genau in dieser
                                                Reihenfolge.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </FadeIn>
                        </div>
                    </section>

                    {/* ── FAQ ─────────────────────────────────────────── */}
                    <section className="py-20 lg:py-24 bg-white border-t border-gray-100">
                        <div className="max-w-7xl mx-auto px-5 lg:px-8">
                            <FadeIn direction="up" className="mb-10">
                                <div className="max-w-[800px] mx-auto">
                                    <h2 className="text-3xl lg:text-4xl font-heading font-bold text-gray-900 leading-tight">
                                        Häufige Fragen zur Favela Santa Marta
                                    </h2>
                                </div>
                            </FadeIn>
                            <FadeIn direction="up">
                                <div className="max-w-[800px] mx-auto">
                                    <Faq items={faqs} />
                                </div>
                            </FadeIn>
                        </div>
                    </section>

                    {/* ── Passt gut dazu ─────────────────────────────── */}
                    <section className="py-20 lg:py-24 bg-gray-50 border-t border-gray-100">
                        <div className="max-w-7xl mx-auto px-5 lg:px-8">
                            <FadeIn direction="up" className="mb-10">
                                <h2 className="text-3xl lg:text-4xl font-heading font-bold text-gray-900 leading-tight">
                                    Passt gut dazu…
                                </h2>
                                <p className="text-gray-500 mt-2 text-lg">
                                    Drei Orte, die nach Santa Marta sofort Sinn ergeben.
                                </p>
                            </FadeIn>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                                <FadeIn delay={0} direction="up" className="flex">
                                    <Link
                                        href="/rio-guide/sehenswuerdigkeiten/rocinha"
                                        className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col overflow-hidden w-full"
                                    >
                                        <div className="relative h-48 overflow-hidden">
                                            <Image
                                                src="/images/rocinha.webp"
                                                alt="Favela Rocinha, die größte Favela Brasiliens"
                                                fill
                                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                            <span className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2.5 py-0.5 rounded-full text-[9px] font-bold text-rio-green uppercase tracking-wider">
                                                Größte Favela
                                            </span>
                                        </div>
                                        <div className="p-5 flex flex-col flex-grow">
                                            <h3 className="text-lg font-bold font-heading text-gray-900 mb-2">Rocinha</h3>
                                            <p className="text-gray-500 text-sm leading-relaxed flex-grow">
                                                Der Kontrast zu Santa Marta. Eine ganze Stadt im Berg, mit über 100.000 Einwohnern und eigener Wirtschaft.
                                            </p>
                                            <div className="flex items-center gap-1.5 text-sm font-bold text-rio-green group-hover:text-rio-yellow transition-colors mt-4">
                                                Mehr erfahren <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                                            </div>
                                        </div>
                                    </Link>
                                </FadeIn>

                                <FadeIn delay={0.08} direction="up" className="flex">
                                    <Link
                                        href="/rio-guide/sehenswuerdigkeiten/the-maze"
                                        className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col overflow-hidden w-full"
                                    >
                                        <div className="relative h-48 overflow-hidden">
                                            <Image
                                                src="/images/the-maze.webp"
                                                alt="The Maze in Tavares Bastos"
                                                fill
                                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                            <span className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2.5 py-0.5 rounded-full text-[9px] font-bold text-rio-green uppercase tracking-wider">
                                                Versteckt
                                            </span>
                                        </div>
                                        <div className="p-5 flex flex-col flex-grow">
                                            <h3 className="text-lg font-bold font-heading text-gray-900 mb-2">The Maze, Tavares Bastos</h3>
                                            <p className="text-gray-500 text-sm leading-relaxed flex-grow">
                                                Ein anderer Morro, eine andere Geschichte. Ein labyrinthisches Kulturzentrum mit Blick auf die Bucht.
                                            </p>
                                            <div className="flex items-center gap-1.5 text-sm font-bold text-rio-green group-hover:text-rio-yellow transition-colors mt-4">
                                                Mehr erfahren <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                                            </div>
                                        </div>
                                    </Link>
                                </FadeIn>

                                <FadeIn delay={0.16} direction="up" className="flex">
                                    <Link
                                        href="/rio-guide/sehenswuerdigkeiten/christus-erloeser"
                                        className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col overflow-hidden w-full"
                                    >
                                        <div className="relative h-48 overflow-hidden">
                                            <Image
                                                src="/images/cristo-bg.webp"
                                                alt="Christus Erlöser auf dem Corcovado"
                                                fill
                                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                            <span className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2.5 py-0.5 rounded-full text-[9px] font-bold text-rio-green uppercase tracking-wider">
                                                Klassiker
                                            </span>
                                        </div>
                                        <div className="p-5 flex flex-col flex-grow">
                                            <h3 className="text-lg font-bold font-heading text-gray-900 mb-2">Christus Erlöser</h3>
                                            <p className="text-gray-500 text-sm leading-relaxed flex-grow">
                                                Von der Laje in Santa Marta siehst du den Cristo aus einem Winkel, den du sonst nirgends bekommst.
                                            </p>
                                            <div className="flex items-center gap-1.5 text-sm font-bold text-rio-green group-hover:text-rio-yellow transition-colors mt-4">
                                                Mehr erfahren <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                                            </div>
                                        </div>
                                    </Link>
                                </FadeIn>

                            </div>
                        </div>
                    </section>

                    {/* ── CTA Final ──────────────────────────────────── */}
                    <section className="py-24 relative overflow-hidden bg-[#0d1f15] border-t-4 border-rio-yellow">
                        <div className="absolute inset-0 bg-[url('/images/rio-background.webp')] bg-cover bg-center mix-blend-overlay opacity-10" />
                        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-[#22a262]/10 blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/4" />
                        <div className="relative max-w-4xl mx-auto px-5 text-center">
                            <FadeIn direction="up">
                                <h2 className="text-3xl lg:text-5xl font-heading font-black text-white mb-6 leading-tight">
                                    Die Favela Santa Marta{" "}
                                    <br className="hidden sm:block" />
                                    <span className="text-rio-yellow">mit deinem deutschsprachigen Tourguide besuchen</span>
                                </h2>
                                <p className="text-lg text-white/70 mb-10 max-w-2xl mx-auto leading-relaxed">
                                    Ich hole dich am Hotel ab, wir fahren zusammen nach Botafogo, du läufst durch Santa Marta
                                    mit jemandem, der den Morro seit Jahren kennt. Auf Deutsch, in deinem Tempo.
                                </p>
                                <div className="flex flex-col sm:flex-row justify-center gap-4">
                                    <Link
                                        href="/touren/favela-tour"
                                        className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-rio-yellow text-gray-900 rounded-full font-bold text-lg hover:bg-yellow-400 hover:scale-[1.02] transition-all shadow-xl shadow-rio-yellow/20"
                                    >
                                        <Phone className="w-5 h-5" />
                                        Favela Santa Marta mit Will besuchen
                                    </Link>
                                    <Link
                                        href="/kontakt"
                                        className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-md border border-white/30 text-white rounded-full font-medium text-lg hover:bg-white/20 transition-all"
                                    >
                                        Kontakt aufnehmen
                                    </Link>
                                </div>
                            </FadeIn>
                        </div>
                    </section>

                    <AndereTouren currentSlug="__santa-marta__" prioritySlugs={["favela-tour", "klassiker", "kultur-geschichte"]} />

                </main>

                <Footer />
            </div>
        </>
    );
}

import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FadeIn from "@/components/FadeIn";
import AndereTouren from "@/components/AndereTouren";
import { ChevronRight, MapPin, ArrowRight, Phone } from "lucide-react";

export const metadata = {
    title: "Christus Erlöser Rio de Janeiro — Tipps, Eintritt & Anfahrt | Rio für Deutsche",
    description:
        "Alles über den Christus Erlöser in Rio: Eintritt, beste Reisezeit, Geheimtipps vom Carioca. Redeemer statue rio de janeiro — so besuchst du ihn richtig.",
    alternates: {
        canonical: "https://riofuerdeutsche.de/rio-guide/sehenswuerdigkeiten/christus-erloeser",
    },
    openGraph: {
        title: "Christus Erlöser Rio de Janeiro — Tipps vom Carioca",
        description:
            "Eintritt, Anfahrt, Insider-Tipps und Geschichte — alles was du über den Christus Erlöser wissen musst. Auf Deutsch, von einem Carioca.",
        url: "https://riofuerdeutsche.de/rio-guide/sehenswuerdigkeiten/christus-erloeser",
    },
};

export default function ChristusErloeserPage() {
    return (
        <div className="flex flex-col min-h-screen bg-rio-sand selection:bg-rio-green selection:text-white font-sans">
            <Navbar />

            <main className="flex-grow">
                {/* ── HERO ─────────────────────────────────────────── */}
                <section className="relative pt-32 pb-28 lg:pt-44 lg:pb-36 overflow-hidden">
                    {/* Gradient background — placeholder sem imagem */}
                    <div className="absolute inset-0 z-0 bg-gradient-to-br from-[#071a0e] via-[#0d2818] to-[#142b1c]" />

                    {/* Subtle texture overlay */}
                    <div
                        className="absolute inset-0 z-0 opacity-[0.04]"
                        style={{
                            backgroundImage:
                                "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.8) 1px, transparent 0)",
                            backgroundSize: "32px 32px",
                        }}
                    />

                    {/* Green glow accent */}
                    <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-[#22a262]/10 blur-3xl z-0 -translate-y-1/2 translate-x-1/4" />
                    <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-[#22a262]/8 blur-3xl z-0 translate-y-1/2 -translate-x-1/4" />

                    <div className="relative z-10 max-w-7xl mx-auto px-5 lg:px-8">
                        <FadeIn direction="up">
                            {/* Breadcrumb */}
                            <nav
                                className="flex items-center flex-wrap gap-y-1 text-sm font-medium text-white/50 mb-10"
                                aria-label="Breadcrumb"
                            >
                                <Link
                                    href="/"
                                    className="hover:text-white transition-colors"
                                >
                                    Startseite
                                </Link>
                                <ChevronRight className="w-4 h-4 mx-2 text-white/25 shrink-0" />
                                <Link
                                    href="/rio-guide"
                                    className="hover:text-white transition-colors"
                                >
                                    Rio-Guide
                                </Link>
                                <ChevronRight className="w-4 h-4 mx-2 text-white/25 shrink-0" />
                                <Link
                                    href="/rio-guide/sehenswuerdigkeiten"
                                    className="hover:text-white transition-colors"
                                >
                                    Sehenswürdigkeiten
                                </Link>
                                <ChevronRight className="w-4 h-4 mx-2 text-white/25 shrink-0" />
                                <span className="text-[#22a262] font-semibold">
                                    Christus Erlöser
                                </span>
                            </nav>

                            {/* Supertítulo */}
                            <p className="text-xs font-bold tracking-widest uppercase text-[#22a262] mb-4 flex items-center gap-2">
                                <MapPin className="w-3.5 h-3.5" />
                                Rio-Guide · Sehenswürdigkeiten
                            </p>

                            {/* H1 */}
                            <div className="max-w-4xl">
                                <h1 className="text-5xl lg:text-[clamp(40px,5vw,72px)] font-heading font-black text-white leading-[1.08] tracking-tight mb-6">
                                    Christus Erlöser
                                </h1>

                                {/* Tagline */}
                                <p className="text-xl lg:text-2xl text-white/70 font-medium leading-snug max-w-2xl mb-10">
                                    Das Wahrzeichen von Rio — und der Moment,
                                    der jeden sprachlos macht
                                </p>

                                {/* CTA Buttons */}
                                <div className="flex flex-col sm:flex-row gap-4">
                                    {/* CTA primário */}
                                    <Link
                                        href="/touren/klassiker-tour"
                                        className="inline-flex items-center justify-center gap-2.5 px-8 py-4 bg-[#22a262] text-white rounded-full font-bold text-base hover:bg-[#1a8a52] hover:scale-[1.02] transition-all shadow-xl shadow-[#22a262]/25"
                                    >
                                        Klassiker Tour anfragen
                                        <ArrowRight className="w-4 h-4" />
                                    </Link>

                                    {/* CTA secundário */}
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

                {/* ── SECÇÃO 3 — Informações Práticas ─────────────── */}
                <section className="py-16 lg:py-20 bg-gray-50 border-t border-gray-100">
                    <div className="max-w-7xl mx-auto px-5 lg:px-8">
                        <FadeIn direction="up">
                            <h2 className="text-xs font-bold tracking-widest uppercase text-rio-green mb-8">
                                Praktische Infos auf einen Blick
                            </h2>
                        </FadeIn>
                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">

                            {/* Card 1 — Dauer */}
                            <FadeIn delay={0} direction="up" className="bg-white border border-gray-100 rounded-2xl p-5 flex flex-col gap-3 hover:border-rio-green/30 hover:shadow-sm transition-all duration-300">
                                <span className="text-2xl" role="img" aria-label="Uhr">⏱</span>
                                <div>
                                    <p className="text-[11px] font-bold tracking-widest uppercase text-gray-400 mb-1">Dauer</p>
                                    <p className="text-gray-900 font-semibold text-[15px] leading-snug">ca. 2 Stunden</p>
                                </div>
                            </FadeIn>

                            {/* Card 2 — Beste Zeit */}
                            <FadeIn delay={0.05} direction="up" className="bg-white border border-gray-100 rounded-2xl p-5 flex flex-col gap-3 hover:border-rio-green/30 hover:shadow-sm transition-all duration-300">
                                <span className="text-2xl" role="img" aria-label="Kalender">📅</span>
                                <div>
                                    <p className="text-[11px] font-bold tracking-widest uppercase text-gray-400 mb-1">Beste Zeit</p>
                                    <p className="text-gray-900 font-semibold text-[15px] leading-snug">Morgens (vor 9 Uhr)</p>
                                </div>
                            </FadeIn>

                            {/* Card 3 — Eintritt */}
                            <FadeIn delay={0.1} direction="up" className="bg-white border border-gray-100 rounded-2xl p-5 flex flex-col gap-3 hover:border-rio-green/30 hover:shadow-sm transition-all duration-300">
                                <span className="text-2xl" role="img" aria-label="Geld">💰</span>
                                <div>
                                    <p className="text-[11px] font-bold tracking-widest uppercase text-gray-400 mb-1">Eintritt</p>
                                    <p className="text-gray-900 font-semibold text-[15px] leading-snug">ca. 17 € <span className="text-gray-400 font-normal">(R$ 90–100)</span></p>
                                </div>
                            </FadeIn>

                            {/* Card 4 — Mit Will */}
                            <FadeIn delay={0.15} direction="up" className="bg-white border border-rio-green/20 rounded-2xl p-5 flex flex-col gap-3 hover:border-rio-green/50 hover:shadow-sm transition-all duration-300">
                                <span className="text-2xl" role="img" aria-label="Auto">🚗</span>
                                <div>
                                    <p className="text-[11px] font-bold tracking-widest uppercase text-rio-green mb-1">Mit Will</p>
                                    <p className="text-gray-900 font-semibold text-[15px] leading-snug">Privattransfer inklusive — kein Stress</p>
                                </div>
                            </FadeIn>

                            {/* Card 5 — Schwierigkeit */}
                            <FadeIn delay={0.2} direction="up" className="bg-white border border-gray-100 rounded-2xl p-5 flex flex-col gap-3 hover:border-rio-green/30 hover:shadow-sm transition-all duration-300">
                                <span className="text-2xl" role="img" aria-label="Wandern">🥾</span>
                                <div>
                                    <p className="text-[11px] font-bold tracking-widest uppercase text-gray-400 mb-1">Schwierigkeit</p>
                                    <p className="text-gray-900 font-semibold text-[15px] leading-snug">
                                        Leicht <span className="text-gray-400 font-normal">(Van)</span> / Moderat <span className="text-gray-400 font-normal">(Wanderweg)</span>
                                    </p>
                                </div>
                            </FadeIn>

                            {/* Card 6 — Tipp Wetter */}
                            <FadeIn delay={0.25} direction="up" className="bg-white border border-rio-green/20 rounded-2xl p-5 flex flex-col gap-3 hover:border-rio-green/50 hover:shadow-sm transition-all duration-300">
                                <span className="text-2xl" role="img" aria-label="Wetter">🌤</span>
                                <div>
                                    <p className="text-[11px] font-bold tracking-widest uppercase text-rio-green mb-1">Tipp Wetter</p>
                                    <p className="text-gray-900 font-semibold text-[15px] leading-snug">Klarer Himmel = freie Sicht bis Uruguay</p>
                                </div>
                            </FadeIn>

                        </div>
                    </div>
                </section>

                {/* ── SECÇÃO 4 — Texto Introdutório ───────────────── */}
                <section className="py-20 lg:py-28 bg-white">
                    <div className="max-w-7xl mx-auto px-5 lg:px-8">
                        <FadeIn direction="up">
                            <div className="max-w-[800px] mx-auto space-y-7 text-left">

                                {/* Parágrafo 1 — A primeira vez */}
                                <p className="text-xl lg:text-2xl font-semibold text-gray-900 leading-snug">
                                    Es gibt diesen Moment, wenn du die Rolltreppe hochfährst und
                                    er plötzlich vor dir steht — riesig, ruhig, die Arme ausgebreitet
                                    über der ganzen Stadt. Ich bin in Rio aufgewachsen und habe ihn
                                    hundertmal gesehen, aber dieser Moment überrascht mich immer noch.
                                    Den Christus Erlöser muss man einfach erlebt haben.
                                </p>

                                {/* Parágrafo 2 — O que o torna especial */}
                                <p className="text-lg text-gray-600 leading-relaxed">
                                    Auf 710 Metern Höhe thront die Statue auf dem Gipfel des Corcovado —
                                    und von dort oben öffnet sich ein 360°-Panorama, das seinesgleichen
                                    sucht: Ipanema, Copacabana, die Guanabara-Bucht, der Zuckerhut, der
                                    Regenwald der Tijuca — alles auf einmal, in einer einzigen Drehung.
                                    An wirklich klaren Tagen reicht der Blick bis zum Horizont. Der
                                    Christus Erlöser ist nicht einfach eine Statue. Er ist der einzige
                                    Aussichtspunkt der Welt, um den sich eine ganze Millionenstadt wie
                                    selbstverständlich herum organisiert — als wäre er schon immer da
                                    gewesen und hätte nie irgendwo anderes stehen können.
                                </p>

                                {/* Parágrafo 3 — O conselho do Will */}
                                <p className="text-lg text-gray-600 leading-relaxed pt-2 border-t border-gray-100">
                                    Mein wichtigster Tipp: Geh früh hin. Vor 9 Uhr gehört der Christus
                                    fast nur dir — die Luft ist kühler, das Licht ist weicher, und du
                                    kannst in aller Ruhe stehen und einfach schauen. Ab 10 Uhr rollen
                                    die Reisebusse an und das Erlebnis wird ein ganz anderes. Es lohnt
                                    sich außerdem immer, die Tickets vorab online zu reservieren — die
                                    Schlange an der Kasse kann an vollen Tagen eine Stunde oder mehr
                                    betragen, und das bei praller Sonne. Das muss wirklich nicht sein.
                                </p>

                            </div>
                        </FadeIn>
                    </div>
                </section>

                {/* ── SECÇÃO 5 — Geschichte & Wissenswertes ───────── */}
                <section className="pt-20 lg:pt-28 pb-8 lg:pb-10 bg-gray-50 border-t border-gray-100">
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

                                {/* P1 — A construção */}
                                <p className="text-lg text-gray-600 leading-relaxed">
                                    Der Christus Erlöser wurde 1931 eingeweiht — nach neun Jahren
                                    Bauzeit. Der Entwurf stammt vom brasilianischen Ingenieur Heitor
                                    da Silva Costa, die eigentliche Skulptur schuf der französische
                                    Bildhauer Paul Landowski. Die innere Tragstruktur besteht aus
                                    Stahlbeton; die Außenhülle wurde vollständig mit Speckstein
                                    verkleidet — einem Material, das sich besonders gut formen lässt
                                    und dem tropischen Klima Rios jahrzehntelang standhält. Jeder
                                    der über 6 Millionen kleinen Steine wurde von Hand angebracht.
                                </p>

                                {/* P2 — Os números */}
                                <p className="text-lg text-gray-600 leading-relaxed">
                                    Die Statue ist 30 Meter hoch, der Sockel weitere 8 Meter —
                                    insgesamt also 38 Meter. Die ausgestreckten Arme messen 28 Meter
                                    von Fingerspitze zu Fingerspitze, das Gesamtgewicht beträgt rund
                                    635 Tonnen. Der Corcovado, auf dem er steht, erhebt sich 710
                                    Meter über dem Meeresspiegel und liegt mitten in der Floresta
                                    da Tijuca — dem größten urbanen Regenwald der Welt. 2007 wurde
                                    der Christus Erlöser offiziell zu einem der Sieben Weltwunder
                                    der Neuzeit gewählt.
                                </p>

                                {/* P3 — O que poucos sabem */}
                                <p className="text-lg text-gray-600 leading-relaxed">
                                    Was die meisten nicht wissen: Der Christus wird jedes Jahr
                                    durchschnittlich sechs Mal vom Blitz getroffen. Finger, Daumen
                                    und Kopf mussten im Laufe der Jahrzehnte deshalb mehrfach
                                    restauriert werden. Und wer genau hinschaut, entdeckt noch etwas:
                                    Im Innern des Sockels befindet sich eine kleine Kapelle — die
                                    Capela Nossa Senhora Aparecida. Dort finden tatsächlich Hochzeiten
                                    und Taufen statt. Die allermeisten Touristen laufen direkt daran
                                    vorbei, ohne es je zu merken.
                                </p>

                                {/* P4 — A ligação com os alemães */}
                                <p className="text-lg text-gray-600 leading-relaxed">
                                    Eine Besonderheit, die kein Reiseführer erwähnt — und die
                                    besonders für deutsche Besucher interessant ist: Der Christus
                                    Erlöser wurde 1931 eingeweiht, genau in jener Epoche, in der
                                    Brasilien eine der größten deutschen Gemeinschaften außerhalb
                                    Europas beherbergte. In Santa Catarina und Rio Grande do Sul
                                    gab es ganze Städte, in denen ausschließlich Deutsch gesprochen
                                    wurde. Rio de Janeiro war der Ankunftspunkt für Tausende dieser
                                    Einwanderer — und die Statue, die sie beim Einfahren in die
                                    Guanabara-Bucht sahen, war buchstäblich das Erste, was sie von
                                    ihrer neuen Heimat erblickten. Das erzähle ich meinen deutschen
                                    Gästen immer — es ist einer der Momente, in denen man spürt,
                                    dass Geschichte wirklich persönlich werden kann.
                                </p>

                            </div>
                        </FadeIn>
                    </div>
                </section>

                {/* ── INFOGRÁFICO ─────────────────────────────────── */}
                <section className="pb-12 lg:pb-16 bg-gray-50">
                    <div className="max-w-7xl mx-auto px-5 lg:px-8">
                        <FadeIn direction="up">
                            <figure className="max-w-[800px] mx-auto">
                                <div className="rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
                                    <Image
                                        src="/images/rio-guide/sehenswuerdigkeiten/infografik-cristo-01.webp"
                                        alt="Infografik zum Christus Erlöser in Rio de Janeiro: Höhe 38 Meter, Armspannweite 28 Meter, Gewicht 635 Tonnen, Höhe über dem Meeresspiegel 710 Meter, erbaut 1922–1931"
                                        width={1200}
                                        height={900}
                                        className="w-full h-auto"
                                        loading="lazy"
                                    />
                                </div>
                                <figcaption className="mt-3 text-sm text-gray-400 text-center leading-snug">
                                    Zahlen &amp; Fakten zum Christus Erlöser — eines der meistbesuchten Wahrzeichen der Welt.
                                    Gebaut zwischen 1922 und 1931, thront er auf 710 Metern Höhe über Rio de Janeiro.
                                </figcaption>
                            </figure>
                        </FadeIn>
                    </div>
                </section>

                {/* ── SECÇÃO 6 — Dica do Will (Insider-Tipp card) ─── */}
                <section className="py-16 lg:py-20 bg-white border-t border-gray-100">
                    <div className="max-w-7xl mx-auto px-5 lg:px-8">
                        <FadeIn direction="up">
                            <div className="max-w-[800px] mx-auto">
                                <div className="relative bg-[#0d1f15] rounded-3xl overflow-hidden border-l-4 border-[#22a262] shadow-xl shadow-black/10">

                                    {/* Subtle glow inside the card */}
                                    <div className="absolute top-0 right-0 w-72 h-72 rounded-full bg-[#22a262]/8 blur-3xl pointer-events-none" />

                                    <div className="relative p-8 lg:p-10">
                                        {/* Icon + label */}
                                        <div className="flex items-center gap-3 mb-6">
                                            <span className="text-3xl" role="img" aria-label="Glühbirne">💡</span>
                                            <span className="text-xs font-bold tracking-widest uppercase text-[#22a262]">
                                                Wills Insider-Tipp
                                            </span>
                                        </div>

                                        {/* Título */}
                                        <h3 className="text-2xl lg:text-3xl font-heading font-bold text-white mb-5 leading-tight">
                                            Der geheime Wanderweg
                                        </h3>

                                        {/* Texto */}
                                        <p className="text-white/75 text-lg leading-relaxed">
                                            Die meisten Touristen nehmen den Van-Shuttle vom Largo do
                                            Boticário — schnell, bequem, aber du siehst eigentlich
                                            nichts von der Tijuca. Mein Tipp: Nimm den Wanderweg{" "}
                                            <span className="text-white font-semibold italic">
                                                Caminho das Paineiras
                                            </span>
                                            . 3,8 km durch echten Regenwald — du hörst Affen und Vögel,
                                            und wenn du oben ankommst, hast du dir den Ausblick wirklich
                                            verdient. Früh morgens, vor 8 Uhr, hast du den Weg fast für
                                            dich allein. Das ist das echte Rio-Erlebnis — nicht die
                                            Van-Schlange.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </FadeIn>
                    </div>
                </section>

                {/* ── SECÇÃO 7 — Passt gut dazu ───────────────────── */}
                <section className="py-20 lg:py-24 bg-gray-50 border-t border-gray-100">
                    <div className="max-w-7xl mx-auto px-5 lg:px-8">
                        <FadeIn direction="up" className="mb-10">
                            <h2 className="text-3xl lg:text-4xl font-heading font-bold text-gray-900 leading-tight">
                                Passt gut dazu…
                            </h2>
                            <p className="text-gray-500 mt-2 text-lg">
                                Drei Orte, die du nicht verpassen solltest, wenn du schon am Corcovado bist.
                            </p>
                        </FadeIn>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                            {/* Card 1 — Zuckerhut */}
                            <FadeIn delay={0} direction="up">
                                <Link
                                    href="/rio-guide/sehenswuerdigkeiten/zuckerhut"
                                    className="group p-6 bg-white rounded-2xl border border-gray-100 shadow-sm hover:border-rio-yellow hover:shadow-md transition-all duration-300 flex flex-col h-full"
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <span className="text-3xl" role="img" aria-label="Seilbahn">🚡</span>
                                        <span className="bg-white/90 px-2.5 py-0.5 rounded-full text-[9px] font-bold text-rio-green border border-gray-100 uppercase tracking-wider">
                                            Sehenswürdigkeit
                                        </span>
                                    </div>
                                    <h3 className="text-xl font-bold font-heading text-gray-900 mb-2">Zuckerhut</h3>
                                    <p className="text-gray-500 text-sm leading-relaxed mb-6 flex-grow">
                                        Der zweite große Klassiker — am schönsten bei Sonnenuntergang mit Blick auf den Christus.
                                    </p>
                                    <div className="flex items-center gap-1.5 text-sm font-bold text-rio-green group-hover:text-rio-yellow transition-colors">
                                        Mehr erfahren <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                                    </div>
                                </Link>
                            </FadeIn>

                            {/* Card 2 — Mirante Dona Marta */}
                            <FadeIn delay={0.08} direction="up">
                                <Link
                                    href="/rio-guide/sehenswuerdigkeiten/mirante-dona-marta"
                                    className="group p-6 bg-white rounded-2xl border border-gray-100 shadow-sm hover:border-rio-yellow hover:shadow-md transition-all duration-300 flex flex-col h-full"
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <span className="text-3xl" role="img" aria-label="Fernrohr">🔭</span>
                                        <span className="bg-white/90 px-2.5 py-0.5 rounded-full text-[9px] font-bold text-rio-green border border-gray-100 uppercase tracking-wider">
                                            Insider-Tipp
                                        </span>
                                    </div>
                                    <h3 className="text-xl font-bold font-heading text-gray-900 mb-2">Mirante Dona Marta</h3>
                                    <p className="text-gray-500 text-sm leading-relaxed mb-6 flex-grow">
                                        Der beste Blick AUF den Christus — kostenlos, kaum Touristen, und du siehst ihn wie die Cariocas.
                                    </p>
                                    <div className="flex items-center gap-1.5 text-sm font-bold text-rio-green group-hover:text-rio-yellow transition-colors">
                                        Mehr erfahren <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                                    </div>
                                </Link>
                            </FadeIn>

                            {/* Card 3 — Tijuca Regenwald */}
                            <FadeIn delay={0.16} direction="up">
                                <Link
                                    href="/rio-guide/sehenswuerdigkeiten/tijuca-regenwald"
                                    className="group p-6 bg-white rounded-2xl border border-gray-100 shadow-sm hover:border-rio-yellow hover:shadow-md transition-all duration-300 flex flex-col h-full"
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <span className="text-3xl" role="img" aria-label="Pflanze">🌿</span>
                                        <span className="bg-white/90 px-2.5 py-0.5 rounded-full text-[9px] font-bold text-rio-green border border-gray-100 uppercase tracking-wider">
                                            Natur
                                        </span>
                                    </div>
                                    <h3 className="text-xl font-bold font-heading text-gray-900 mb-2">Tijuca Regenwald</h3>
                                    <p className="text-gray-500 text-sm leading-relaxed mb-6 flex-grow">
                                        Der Christus steht mitten drin — entdecke die größte städtische Regenwaldwelt der Welt.
                                    </p>
                                    <div className="flex items-center gap-1.5 text-sm font-bold text-rio-green group-hover:text-rio-yellow transition-colors">
                                        Mehr erfahren <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                                    </div>
                                </Link>
                            </FadeIn>

                        </div>
                    </div>
                </section>

                {/* ── SECÇÃO 8 — CTA Final ─────────────────────────── */}
                <section className="py-24 relative overflow-hidden bg-[#0d1f15] border-t-4 border-rio-yellow">
                    <div className="absolute inset-0 bg-[url('/images/rio-background.webp')] bg-cover bg-center mix-blend-overlay opacity-10" />
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-[#22a262]/10 blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/4" />
                    <div className="relative max-w-4xl mx-auto px-5 text-center">
                        <FadeIn direction="up">
                            <h2 className="text-3xl lg:text-5xl font-heading font-black text-white mb-6 leading-tight">
                                Den Christus Erlöser{" "}
                                <br className="hidden sm:block" />
                                <span className="text-rio-yellow">mit Will besuchen</span>
                            </h2>
                            <p className="text-lg text-white/70 mb-10 max-w-2xl mx-auto leading-relaxed">
                                Als Carioca zeige ich dir nicht nur die Aussicht —{" "}
                                ich erzähle dir, was hinter der Statue steckt.
                                Auf Deutsch, mit lokalem Wissen, ohne Touristenfalle.
                            </p>
                            <div className="flex flex-col sm:flex-row justify-center gap-4">
                                <Link
                                    href="/touren/klassiker-tour"
                                    className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-rio-yellow text-gray-900 rounded-full font-bold text-lg hover:bg-yellow-400 hover:scale-[1.02] transition-all shadow-xl shadow-rio-yellow/20"
                                >
                                    <Phone className="w-5 h-5" />
                                    Klassiker Tour anfragen
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

                {/* ── SECÇÃO 9 — Andere Touren ─────────────────────── */}
                <AndereTouren currentSlug="__christus-erloeser__" />

            </main>

            <Footer />
        </div>
    );
}

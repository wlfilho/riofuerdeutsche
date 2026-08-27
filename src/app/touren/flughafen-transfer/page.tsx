import Link from "next/link";
import Image from "next/image";
import NavbarServer from "@/components/NavbarServer";
import FooterServer from "@/components/FooterServer";
import FadeIn from "@/components/FadeIn";
import {
    ChevronRight,
    Phone,
    Plane,
    Luggage,
    Clock,
    Ship,
    ArrowRight,
    Check,
} from "lucide-react";
import AndereTouren from "@/components/AndereTouren";
import { getSettings, buildContactUrls } from "@/lib/settings";

export const metadata = {
    title: "Transfer Rio de Janeiro: Flughafen, Kreuzfahrthafen & Hotel",
    description:
        "Privater Transfer in Rio de Janeiro — vom Flughafen (GIG & SDU) oder Kreuzfahrthafen direkt zu deiner Unterkunft. Ich hole dich persönlich ab, auf Deutsch, mit deinem Namen auf dem Schild.",
    alternates: {
        canonical: "https://riofuerdeutsche.de/touren/flughafen-transfer",
    },
    openGraph: {
        url: "https://riofuerdeutsche.de/touren/flughafen-transfer",
    },
};

/**
 * O CTA usa `thema=transfer`, e NÃO `tour=flughafen-transfer`: o transfer não é
 * um tour, é upsell dos tours — a venda acontece na proposta, como item
 * opcional de quem já está fechando passeio. Por isso este slug fica fora de
 * TOUR_SLUGS (src/lib/tours.ts), e por isso a página termina fazendo ponte
 * para os tours em vez de empurrar a compra avulsa.
 */
const ANFRAGE_HREF = "/anfrage?von=site&thema=transfer";

const WHATSAPP_MSG =
    "Hallo Will! Ich interessiere mich für einen Transfer in Rio de Janeiro.";

/**
 * A BAGAGEM limita antes dos assentos nos dois veículos. Pessoas e malas andam
 * sempre juntas neste array, e a UI nunca renderiza um sem o outro: "bis zu 6
 * Personen" sozinho é a promessa que estoura no desembarque, com o cliente
 * cansado e sem solução possível.
 */
const PREISE = [
    {
        personen: "Bis zu 3 Personen",
        gepaeck: "max. 2 große Koffer + Handgepäck",
        tag: "60 €",
        nacht: "80 €",
    },
    {
        personen: "Bis zu 6 Personen",
        gepaeck: "max. 4 große Koffer + Handgepäck",
        tag: "150 €",
        nacht: "190 €",
    },
];

const STRECKEN = [
    { icon: Plane, text: "Flughafen (GIG & SDU) ↔ Hotel" },
    { icon: Ship, text: "Kreuzfahrthafen ↔ Hotel" },
    { icon: ArrowRight, text: "Kreuzfahrthafen ↔ Flughafen" },
];

export default async function FlughafenTransferPage() {
    const settings = await getSettings();
    const { whatsappHref } = buildContactUrls(settings);
    const waHref = `${whatsappHref}?text=${encodeURIComponent(WHATSAPP_MSG)}`;

    return (
        <div className="flex flex-col min-h-screen bg-rio-sand selection:bg-rio-green selection:text-white font-sans">
            <NavbarServer />

            <main className="flex-grow">
                {/* SEÇÃO A — Hero */}
                <section className="relative pt-32 pb-24 lg:pt-40 lg:pb-32 overflow-hidden bg-gray-900 border-b-4 border-rio-yellow">
                    <div className="absolute inset-0 z-0">
                        <Image
                            src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1920&h=800&fit=crop&q=80"
                            alt="Ankunft in Rio de Janeiro"
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
                            <nav
                                className="flex items-center text-sm font-medium text-gray-400 mb-8"
                                aria-label="Breadcrumb"
                            >
                                <Link href="/" className="hover:text-rio-yellow transition-colors">
                                    Startseite
                                </Link>
                                <ChevronRight className="w-4 h-4 mx-2 text-gray-600" />
                                <Link href="/touren" className="hover:text-rio-yellow transition-colors">
                                    Touren &amp; Ausflüge
                                </Link>
                                <ChevronRight className="w-4 h-4 mx-2 text-gray-600" />
                                <span className="text-rio-yellow">Transfer</span>
                            </nav>

                            <div className="max-w-3xl space-y-6">
                                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-sm font-medium">
                                    <Plane className="w-4 h-4 text-rio-yellow" />
                                    <span>Privater Transfer · GIG, SDU &amp; Kreuzfahrthafen</span>
                                </div>

                                <h1 className="text-4xl lg:text-[clamp(28px,3.2vw,48px)] font-heading font-black text-white leading-[1.15] tracking-tight">
                                    Transfer Rio de Janeiro: Flughafen, Kreuzfahrthafen &amp; Hotel
                                </h1>
                                <p className="text-xl lg:text-2xl xl:text-3xl font-bold text-rio-yellow mt-4">
                                    Ich hole dich persönlich ab, auf Deutsch, mit deinem Namen auf dem Schild
                                </p>

                                <div className="pt-6 flex flex-col sm:flex-row gap-4">
                                    <Link
                                        href={ANFRAGE_HREF}
                                        className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-rio-yellow text-gray-900 rounded-full font-bold text-lg hover:bg-yellow-400 hover:scale-[1.02] transition-all shadow-xl shadow-rio-yellow/20"
                                    >
                                        Transfer anfragen
                                        <ArrowRight className="w-5 h-5" />
                                    </Link>
                                    <a
                                        href={waHref}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-md border border-white/30 text-white rounded-full font-medium text-lg hover:bg-white/20 transition-all"
                                    >
                                        <Phone className="w-5 h-5" />
                                        Auf WhatsApp schreiben
                                    </a>
                                </div>
                            </div>
                        </FadeIn>
                    </div>
                </section>

                {/* SEÇÃO B — Abertura. Sem preço aqui de propósito: a maioria de
                    quem chega nesta página está pesquisando "como chego do
                    aeroporto", não comprando. Preço cedo convida à comparação
                    com aplicativo de corrida, que é a comparação que se perde. */}
                <section className="py-20 lg:py-28 bg-white">
                    <div className="max-w-7xl mx-auto px-5 lg:px-8">
                        <FadeIn direction="up">
                            <div className="max-w-[800px] mx-auto space-y-8 text-left">
                                <p className="text-xl lg:text-2xl font-semibold text-gray-900 leading-snug">
                                    Nach zwölf Stunden Flug willst du keine App öffnen, nicht auf Portugiesisch verhandeln und nicht raten, welches der wartenden Autos deins ist.
                                </p>
                                <div className="space-y-6 text-lg text-gray-600 leading-relaxed">
                                    <p>
                                        Du kommst aus der Ankunftshalle, und da steht jemand mit deinem Namen auf dem Schild. Und der spricht Deutsch.
                                    </p>
                                    <p>
                                        Das bin ich selbst — kein Fahrer, den ich für dich bestellt habe. Ich fahre dich vom Flughafen oder vom Kreuzfahrthafen direkt zu deiner Unterkunft, und unterwegs sind die ersten Fragen schon beantwortet: wo du Geld wechselst, was dein Viertel taugt, was du morgen früh als Erstes machst.
                                    </p>
                                </div>
                                <p className="text-lg font-semibold text-gray-900 pt-8 border-t border-gray-200">
                                    Deine Reise fängt nicht am Hotel an, sondern in dem Moment, in dem du aus dem Flugzeug steigst. Genau da hole ich dich ab.
                                </p>
                            </div>
                        </FadeIn>
                    </div>
                </section>

                {/* SEÇÃO C — Strecken */}
                <section className="py-20 bg-gray-50 border-t border-gray-100">
                    <div className="max-w-7xl mx-auto px-5 lg:px-8">
                        <FadeIn direction="up" className="mb-12">
                            <h2 className="text-3xl lg:text-4xl font-heading font-black text-gray-900 mb-3">
                                Welche Strecken ich fahre
                            </h2>
                            <p className="text-lg text-gray-600">
                                In beide Richtungen, zum selben Preis — Hinfahrt wie Rückfahrt.
                            </p>
                        </FadeIn>

                        <div className="grid sm:grid-cols-3 gap-6">
                            {STRECKEN.map(({ icon: Icon, text }) => (
                                <FadeIn key={text} direction="up">
                                    <div className="h-full bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-start gap-4">
                                        <span className="shrink-0 w-11 h-11 rounded-full bg-rio-green/10 flex items-center justify-center">
                                            <Icon className="w-5 h-5 text-rio-green" />
                                        </span>
                                        <p className="text-base font-semibold text-gray-900 leading-snug pt-2">
                                            {text}
                                        </p>
                                    </div>
                                </FadeIn>
                            ))}
                        </div>
                    </div>
                </section>

                {/* SEÇÃO D — Preise & Bedingungen */}
                <section className="py-20 lg:py-28 bg-white border-t border-gray-100">
                    <div className="max-w-7xl mx-auto px-5 lg:px-8">
                        <FadeIn direction="up" className="mb-12 max-w-[800px]">
                            <h2 className="text-3xl lg:text-4xl font-heading font-black text-gray-900 mb-3">
                                Preise pro Strecke
                            </h2>
                            <p className="text-lg text-gray-600">
                                Achte auf das Gepäck, nicht nur auf die Personenzahl — wer zwei Wochen nach Brasilien fliegt, reist selten mit Handgepäck allein.
                            </p>
                        </FadeIn>

                        <div className="grid md:grid-cols-2 gap-6 max-w-[900px]">
                            {PREISE.map(preis => (
                                <FadeIn key={preis.personen} direction="up">
                                    <div className="h-full bg-gray-50 rounded-2xl p-7 border border-gray-100">
                                        <p className="text-xl font-heading font-black text-gray-900">
                                            {preis.personen}
                                        </p>
                                        <p className="mt-1 inline-flex items-center gap-2 text-base font-semibold text-rio-green">
                                            <Luggage className="w-4 h-4 shrink-0" />
                                            {preis.gepaeck}
                                        </p>
                                        <dl className="mt-6 space-y-3 border-t border-gray-200 pt-5">
                                            <div className="flex items-baseline justify-between gap-4">
                                                <dt className="text-sm text-gray-500">07:00 – 22:00 Uhr</dt>
                                                <dd className="text-2xl font-heading font-black text-gray-900">
                                                    {preis.tag}
                                                </dd>
                                            </div>
                                            <div className="flex items-baseline justify-between gap-4">
                                                <dt className="text-sm text-gray-500 inline-flex items-center gap-1.5">
                                                    <Clock className="w-3.5 h-3.5 shrink-0" />
                                                    22:00 – 07:00 Uhr
                                                </dt>
                                                <dd className="text-2xl font-heading font-black text-gray-900">
                                                    {preis.nacht}
                                                </dd>
                                            </div>
                                        </dl>
                                    </div>
                                </FadeIn>
                            ))}
                        </div>

                        <FadeIn direction="up">
                            <p className="mt-6 text-base text-gray-600 max-w-[900px]">
                                Mehr Personen oder mehr Gepäck? Schreib mir — größere Fahrzeuge organisiere ich auf Anfrage.
                            </p>
                        </FadeIn>

                        <FadeIn direction="up">
                            <div className="mt-10 max-w-[900px] bg-rio-sand rounded-2xl p-7 border border-rio-green/15">
                                <h3 className="text-lg font-heading font-black text-gray-900 mb-4">
                                    Gut zu wissen
                                </h3>
                                <ul className="space-y-3 text-base text-gray-700">
                                    <li className="flex gap-3">
                                        <Check className="w-5 h-5 text-rio-green shrink-0 mt-0.5" />
                                        <span>Buchbar ab <strong>48 Stunden</strong> im Voraus.</span>
                                    </li>
                                    <li className="flex gap-3">
                                        <Check className="w-5 h-5 text-rio-green shrink-0 mt-0.5" />
                                        <span>
                                            Der Transfer wird im Voraus bezahlt und ist nicht erstattungsfähig.
                                        </span>
                                    </li>
                                    <li className="flex gap-3">
                                        <Check className="w-5 h-5 text-rio-green shrink-0 mt-0.5" />
                                        <span>
                                            Bei Flugausfall oder Verspätung verschiebe ich den Transfer kostenlos.
                                        </span>
                                    </li>
                                </ul>
                            </div>
                        </FadeIn>
                    </div>
                </section>

                {/* SEÇÃO E — Ponte para tour. É o objetivo da página: quem chega
                    do aeroporto é o melhor lead possível para o dia seguinte. */}
                <section className="py-24 relative overflow-hidden bg-rio-green border-t-4 border-rio-yellow">
                    <div className="absolute inset-0 bg-[url('/images/rio-background.webp')] bg-cover bg-center mix-blend-overlay opacity-10"></div>
                    <div className="relative max-w-4xl mx-auto px-5 text-center">
                        <FadeIn direction="up">
                            <h2 className="text-3xl lg:text-5xl font-heading font-black text-white mb-6">
                                Und am Tag danach? <br className="hidden sm:block" />
                                <span className="text-rio-yellow">Zeige ich dir die Stadt.</span>
                            </h2>
                            <p className="text-lg text-rio-sand/90 mb-10 max-w-2xl mx-auto leading-relaxed">
                                Auf der Fahrt vom Flughafen reden wir sowieso schon darüber, was du in Rio sehen willst. Die meisten hängen den Transfer deshalb an eine Tour — dann kennst du dein Gegenüber schon, bevor der erste Tag losgeht.
                            </p>
                            <div className="flex flex-col sm:flex-row justify-center gap-4">
                                <Link
                                    href="/touren"
                                    className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-rio-yellow text-gray-900 rounded-full font-bold text-lg hover:bg-yellow-400 hover:scale-[1.02] transition-all shadow-xl shadow-black/10"
                                >
                                    Touren ansehen
                                    <ArrowRight className="w-5 h-5" />
                                </Link>
                                <Link
                                    href={ANFRAGE_HREF}
                                    className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-md border border-white/30 text-white rounded-full font-medium text-lg hover:bg-white/20 transition-all"
                                >
                                    Transfer anfragen
                                </Link>
                            </div>
                        </FadeIn>
                    </div>
                </section>

                {/* SEÇÃO F — Interne Linkagem. currentSlug não bate com nenhum
                    tour de propósito: o transfer não é um deles, então os 11
                    aparecem todos. */}
                <AndereTouren currentSlug="flughafen-transfer" />
            </main>

            <FooterServer />
        </div>
    );
}

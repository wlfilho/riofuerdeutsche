import type { Metadata } from "next";
import Link from "next/link";
import NavbarServer from "@/components/NavbarServer";
import FooterServer from "@/components/FooterServer";
import Faq, { type FaqItem } from "@/components/Faq";
import ReviewCard, { type Review } from "@/components/ReviewCard";
import { createClient } from "@/utils/supabase/server";
import { getSettings, buildContactUrls } from "@/lib/settings";
import { Instagram, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Über Will | Dein deutschsprachiger Guide in Rio de Janeiro",
  description:
    "Carioca von Geburt, mit der deutschen Kultur aufgewachsen und vier Jahre in Köln gelebt. Ich zeige dir Rio de Janeiro auf Deutsch, als Einheimischer, der beide Welten kennt.",
};

const faqItems: FaqItem[] = [
  {
    q: "Sprichst du wirklich fließend Deutsch?",
    a: "Ja, und zwar nicht erst seit gestern. Ich bin in Rio auf die Escola Alemã Corcovado gegangen und habe vier Jahre in Köln gelebt und studiert. Deutsch ist für mich keine Fremdsprache, sondern ein Teil meines Lebens.",
  },
  {
    q: "Wie gut kennst du Rio de Janeiro?",
    a: "Ich bin hier geboren und aufgewachsen. Rio ist meine Heimat, kein Reiseziel, das ich aus Büchern kenne. Ich zeige dir die Stadt aus der Sicht eines Cariocas, mit den Ecken, die in keinem Reiseführer stehen.",
  },
  {
    q: "Bietest du Stadtführungen auf Deutsch an?",
    a: "Genau das ist mein Schwerpunkt. Als deutschsprachiger Guide in Rio führe ich dich auf Deutsch durch die Stadt, ohne Sprachbarriere und ohne Missverständnisse. Alle meine Touren findest du im Tourenbereich.",
  },
  {
    q: "Für wen sind deine Touren?",
    a: "Für alle, die Rio sicher, entspannt und in ihrer eigenen Sprache erleben wollen. Egal ob du zum ersten Mal kommst, mit der Familie reist oder die Stadt schon kennst und tiefer eintauchen möchtest.",
  },
  {
    q: "Wie kann ich dich für eine Tour erreichen?",
    a: "Am einfachsten schreibst du mir direkt. Über die Kontaktseite erreichst du mich, und wir planen zusammen deinen Tag in Rio.",
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqItems.map((item) => ({
    "@type": "Question",
    name: item.q,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.a,
    },
  })),
};

async function getLatestReviews(): Promise<Review[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("reviews")
    .select(
      "id, created_at, nickname, rating, title, body, attractions, photo_urls, will_photo_urls, consent_own_photos, consent_will_photos"
    )
    .eq("status", "approved")
    .order("approved_at", { ascending: false })
    .limit(2);

  if (error) {
    console.error("Error fetching reviews:", error);
    return [];
  }
  return data ?? [];
}

export default async function UeberWill() {
  const latestReviews = await getLatestReviews();
  const { instagramHref } = buildContactUrls(await getSettings());

  return (
    <>
      {/* JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="flex flex-col min-h-screen bg-[#f8f5f0] font-sans">
        <NavbarServer />

        <main className="flex-grow pb-16">
          {/* 1. HERO SECTION FULL WIDTH */}
          <section className="w-full bg-[#0d1f15] pt-32 pb-20 px-5 lg:px-8 text-white">
            <div className="max-w-5xl mx-auto">
              <div className="flex flex-wrap gap-3 justify-center md:justify-start mb-8">
                <span className="bg-white/10 backdrop-blur-md text-white border border-white/20 px-4 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase">
                  Über mich
                </span>
                <span className="bg-rio-yellow text-[#0d1f15] px-4 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase">
                  Rio für Deutsche
                </span>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-7xl font-black text-white mb-6 tracking-tight text-center md:text-left leading-tight text-shadow-hero">
                Dein deutschsprachiger Guide in Rio
              </h1>

              <p className="text-2xl md:text-3xl text-rio-yellow text-center md:text-left font-medium max-w-3xl">
                Carioca von Geburt, mit der deutschen Kultur aufgewachsen. Ich zeige dir mein Rio, auf Deutsch.
              </p>
            </div>
          </section>

          <article className="max-w-5xl mx-auto px-5 lg:px-8 mt-16">
            {/* 2. PROSA PRINCIPAL */}
            <section className="prose prose-lg prose-green max-w-none text-gray-800 mb-16 leading-relaxed [&>p]:mb-7">
              <p>
                Lange bevor es Rio für Deutsche gab, stand ich schon hier, mitten in dieser Stadt, und habe deutschen Besuchern Rio gezeigt. Angefangen habe ich damit als Teenager. Das Mitnehmen, das Zeigen, das Erklären meiner Stadt war nie ein Job für mich. Es war immer das, was ich am liebsten mache.
              </p>
              <p>
                Aber fangen wir am Anfang an. Meine Eltern wollten, dass meine Schwester und ich früh eine Fremdsprache lernen. Also kam ich mit vier Jahren in die Escola Alemã Corcovado, die deutsche Schule in Rio, gleich bei uns um die Ecke. Vom Kindergarten an habe ich dort viele Jahre lang gelernt, und diese Zeit hat mich geprägt.
              </p>
              <p>
                Das war keine Schule, in der man nur ein bisschen Deutsch als Fremdsprache büffelt. Ich bin mit der deutschen Kultur groß geworden. Deutsche Lehrer, deutsche Feste, Musikunterricht, Sozialkunde, ganze Fächer auf Deutsch. Mitten in Rio habe ich jeden Tag ein Stück Deutschland gelebt. Deutsch ist für mich nie eine reine Schulsprache geblieben, sondern ein Teil von mir geworden.
              </p>
              <p>
                Später wollte ich mehr. Ich bin nach Deutschland gezogen, nach Köln, und bin vier Jahre dort geblieben. Zuerst habe ich das Studienkolleg gemacht, um mein Deutsch richtig zu festigen, danach habe ich an der KISD studiert, der Köln International School of Design.
              </p>
              <p>
                Diese vier Jahre haben alles verändert. Ich habe Deutschland nicht mehr nur aus der Schule in Rio gekannt, sondern von innen gelebt: den Alltag, die Mentalität, die kleinen Dinge, die man nur versteht, wenn man wirklich dort wohnt. Genau das macht heute den Unterschied, wenn ich dich durch Rio führe. Ich weiß, wie du denkst, was dir wichtig ist und worauf du achtest, weil ich beide Welten kenne.
              </p>
              <p>
                Zurück in Brasilien habe ich dann viele Jahre in einer ganz anderen Welt gearbeitet: Design, digitales Marketing, Kommunikation, Content. Fast drei Jahrzehnte vor dem Bildschirm, in denen ich gelernt habe, wie man Geschichten erzählt, wie man Dinge erklärt und wie man Menschen wirklich erreicht.
              </p>
            </section>

            {/* 3. CARD DE DESTAQUE ESCURO (A virada) */}
            <div className="bg-[#0d1f15] text-white p-8 md:p-12 rounded-3xl shadow-xl mb-16">
              <p className="text-lg md:text-xl leading-relaxed mb-6">
                Irgendwann habe ich mir eine einfache Frage gestellt: Warum bringe ich nicht alles zusammen, was ich kann? Die deutsche Sprache und Kultur, mit der ich aufgewachsen bin. Mein Wissen aus Design, Kommunikation und Content. Und meine größte Leidenschaft, meine Stadt Rio de Janeiro.
              </p>
              <p className="text-lg md:text-xl leading-relaxed mb-0">
                Genau daraus ist Rio für Deutsche entstanden. Kein Job, den ich zufällig mache, sondern die Verbindung von allem, was mich ausmacht. Heute vertiefe ich mein Wissen über meine Stadt ständig weiter und bilde mich im Bereich Tourismus formell weiter, weil ich diese Arbeit ernst nehme und sie richtig machen will.
              </p>
            </div>

            {/* 4. WARUM DEUTSCHSPRACHIGE GÄSTE */}
            <section className="prose prose-lg prose-green max-w-none text-gray-800 mb-16">
              <h2 className="text-3xl font-bold text-[#0d1f15] mb-6">
                Warum gerade deutschsprachige Gäste?
              </h2>
              <p>
                Ich habe mein Leben lang die deutsche Kultur erlebt und die Sprache gelebt, und es gibt hier in Rio kaum jemanden, der dir die Stadt wirklich auf Deutsch zeigen kann, von einem Einheimischen, der beide Seiten kennt. Diese Lücke wollte ich füllen. Du sollst Rio erleben, ohne Sprachbarriere, ohne Missverständnisse, mit jemandem, der dich versteht.
              </p>
            </section>

          </article>

          {/* 5. PROVA SOCIAL */}
          <section className="w-full bg-white border-y border-gray-100 py-16 px-5 lg:px-8 mb-16">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-3xl font-bold text-[#0d1f15] mb-4 text-center">
                Was meine Gäste sagen
              </h2>
              <p className="text-lg md:text-xl text-gray-700 leading-relaxed mb-10 text-center max-w-3xl mx-auto">
                Aber verlass dich nicht nur auf meine Worte. Lies, was meine Gäste über ihre Zeit mit mir in Rio sagen. Ihre Erfahrungen erzählen dir mehr als alles, was ich hier schreiben könnte.
              </p>

              {latestReviews.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                  {latestReviews.map((review) => (
                    <ReviewCard key={review.id} review={review} />
                  ))}
                </div>
              )}

              <div className="flex justify-center">
                <Link
                  href="/bewertungen"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-rio-green text-white rounded-full font-semibold text-lg hover:bg-rio-green/90 hover:scale-[1.02] transition-all shadow-xl shadow-rio-green/20"
                >
                  Alle Bewertungen lesen
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </div>
          </section>

          <article className="max-w-5xl mx-auto px-5 lg:px-8">
            {/* 6. REDES SOCIAIS */}
            <section className="mb-16">
              <h2 className="text-3xl font-bold text-[#0d1f15] mb-6">
                Begleite mich durch Rio
              </h2>
              <p className="text-lg text-gray-700 leading-relaxed mb-8">
                Auf Instagram nehme ich dich schon heute mit durch meine Stadt: echte Ecken, echte Tipps, das Rio, das ich jeden Tag erlebe. Folge mir und sei dabei, während hier etwas Neues entsteht.
              </p>

              <div className="flex flex-wrap gap-4">
                <a
                  href={instagramHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-3 px-6 py-3 bg-white border border-gray-200 text-[#0d1f15] rounded-full font-semibold hover:border-rio-green hover:text-rio-green transition-all shadow-sm"
                >
                  <Instagram className="w-5 h-5" />
                  Folge mir auf Instagram
                </a>
                {/* https://facebook.com/riofuerdeutsche — ativar quando o canal lançar */}
                {/* https://youtube.com/@riofuerdeutsche — ativar quando o canal lançar */}
              </div>
            </section>

            {/* 7. CTA FINAL */}
            <section className="bg-[#0d1f15] text-white p-8 md:p-12 rounded-3xl shadow-xl mb-16">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">
                Lass uns dein Rio planen
              </h2>
              <p className="text-lg text-gray-300 leading-relaxed mb-8">
                Egal ob du zum ersten Mal kommst oder Rio schon kennst: Ich zeige dir die Stadt so, wie nur ein Carioca sie kennt, in deiner Sprache und in deinem Tempo. Schreib mir einfach, und wir finden zusammen heraus, wie dein perfekter Tag in Rio aussieht.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/touren"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-rio-green text-white rounded-full font-semibold text-lg hover:bg-rio-green/90 hover:scale-[1.02] transition-all shadow-xl shadow-rio-green/20"
                >
                  Touren entdecken
                </Link>
                <Link
                  href="/kontakt"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-white/30 text-white rounded-full font-medium text-lg hover:bg-white/10 transition-all"
                >
                  Kontakt aufnehmen
                </Link>
              </div>
            </section>

            {/* 8. FAQ */}
            <section className="mb-4">
              <h2 className="text-3xl font-bold text-[#0d1f15] mb-8">
                Häufige Fragen
              </h2>
              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm px-6 lg:px-8">
                <Faq items={faqItems} />
              </div>
            </section>
          </article>
        </main>

        <FooterServer />
      </div>
    </>
  );
}

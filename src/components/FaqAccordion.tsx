"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { FALLBACK_CONTACT } from "@/lib/contactFallback";

type FaqItem = {
  q: string;
  a: React.ReactNode;
  cta?: { label: string; href: string } | null;
};

const linkClass = "text-rio-green underline decoration-rio-green/40 underline-offset-2 hover:decoration-rio-green transition-colors";

function buildItems(whatsappHref: string, emailHref: string): FaqItem[] {
  return [
    {
      q: "Sprichst du wirklich fließend Deutsch?",
      a: "Ja — ich bin in Rio auf eine deutsche Schule gegangen und habe vier Jahre in Köln gelebt und studiert. Deutsch ist für mich keine Fremdsprache, sondern ein echter Teil meiner Identität.",
    },
    {
      q: "Ist Rio de Janeiro wirklich so gefährlich?",
      a: "Rio hat Risiken — aber die meisten Probleme passieren, weil Touristen einfache Fehler machen. Mit der richtigen Vorbereitung wirst du eine fantastische Zeit haben.",
      cta: {
        label: "Die 7 häufigsten Fehler — und wie du sie vermeidest →",
        href: "/ist-rio-gefaehrlich",
      },
    },
    {
      q: "Wie buche ich eine Tour?",
      a: (
        <>
          Am schnellsten über das{" "}
          <Link href="/anfrage?von=site" className={linkClass}>
            Anfrageformular
          </Link>{" "}
          — dort stehen schon die Fragen, die ich sowieso stellen würde. Lieber direkt? Schreib mir auf{" "}
          <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className={linkClass}>
            WhatsApp
          </a>{" "}
          oder per{" "}
          <a href={emailHref} className={linkClass}>
            E-Mail
          </a>{" "}
          — ich antworte innerhalb von 24 Stunden. Wir besprechen deine Wünsche, ich mache dir ein Angebot, und du entscheidest ganz ohne Druck.
        </>
      ),
    },
    {
      q: "Fahre ich allein oder in einer Gruppe?",
      a: "Alle Touren sind privat oder in sehr kleinen Gruppen (max. 6 Personen) — niemals ein Touristenbus. Du buchst direkt bei mir, nicht über eine Agentur.",
    },
    {
      q: "Was kostet eine Tour?",
      a: "Der Preis hängt von der Dauer, der Gruppengröße und den gewählten Aktivitäten ab. Schreib mir — ich erstelle dir ein persönliches Angebot, das zu deinem Budget passt.",
    },
  ];
}

export default function FaqAccordion({
  whatsappHref = FALLBACK_CONTACT.whatsappHref,
  emailHref = FALLBACK_CONTACT.emailHref,
}: {
  whatsappHref?: string;
  emailHref?: string;
}) {
  const [open, setOpen] = useState<number | null>(null);
  const items = buildItems(whatsappHref, emailHref);

  return (
    <div className="divide-y divide-gray-100">
      {items.map((item, i) => {
        const isOpen = open === i;
        return (
          <div key={i}>
            <button
              onClick={() => setOpen(isOpen ? null : i)}
              aria-expanded={isOpen}
              className="w-full flex items-center justify-between gap-4 py-6 text-left group"
            >
              <span className="font-bold text-gray-900 text-lg leading-snug">
                {item.q}
              </span>
              <ChevronDown
                className={`w-5 h-5 text-rio-green shrink-0 transition-transform duration-300 ${
                  isOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            <div
              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                isOpen ? "max-h-40 pb-6" : "max-h-0"
              }`}
            >
              <p className="text-gray-600 leading-relaxed">
                {item.a}
                {item.cta && (
                  <>
                    {" "}
                    <Link
                      href={item.cta.href}
                      className="text-rio-green underline decoration-rio-green/40 underline-offset-2 hover:decoration-rio-green transition-colors"
                    >
                      {item.cta.label}
                    </Link>
                  </>
                )}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
    {
        q: "Ist die Rocinha sicher für Touristen?",
        a: "Mit einem ortskundigen Guide ist ein Besuch der Rocinha sicher. Will ist in der Nähe aufgewachsen, kennt die Gemeinschaft seit Jahren und bewegt sich dort mit Respekt und Lokalkenntnis. Allein und ohne Begleitung wird ein Besuch nicht empfohlen.",
    },
    {
        q: "Kann man die Rocinha alleine besuchen?",
        a: "Technisch ja, aber ohne Begleitung verpasst du das Wesentliche — und bewegst dich in einem Ort, dessen Codes du nicht kennst. Mit Will bekommst du Zugang zu Familien, Aussichten und Geschichten, die man allein nie findet.",
    },
    {
        q: "Was kostet eine Favela Tour in der Rocinha?",
        a: "Die Favela Tour mit Will startet ab ca. 80 €. Der Eintritt in die Rocinha selbst ist kostenlos — bezahlt wird die Begleitung, die Lokalkenntnis und die Verbindung zur Community.",
    },
    {
        q: "Wie macht man das berühmte Drohnen-Video in der Rocinha?",
        a: "Das Drohnen-Video wird von lokalen Anbietern direkt in der Rocinha angeboten und kostet rund 200 Reais pro Person. Will zeigt dir, wo und wann du es am besten machst — ohne lange Schlange.",
    },
    {
        q: "Wie lange dauert ein Besuch der Rocinha?",
        a: "Ein Besuch mit Will dauert in der Regel etwa 3 Stunden. Beste Zeit ist tagsüber zwischen 10:00 und 16:00 Uhr.",
    },
];

export default function RocinhaFaq() {
    const [open, setOpen] = useState<number | null>(null);

    return (
        <div className="divide-y divide-gray-100">
            {faqs.map((item, i) => {
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
                                isOpen ? "max-h-60 pb-6" : "max-h-0"
                            }`}
                        >
                            <p className="text-gray-600 leading-relaxed">{item.a}</p>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

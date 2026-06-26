"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

export type FaqItem = { q: string; a: string };

export default function Faq({ items }: { items: FaqItem[] }) {
    const [open, setOpen] = useState<number | null>(null);

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
                                isOpen ? "max-h-96 pb-6" : "max-h-0"
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

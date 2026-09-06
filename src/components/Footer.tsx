'use client'

import Link from "next/link";
import { useEffect, useRef } from "react";
import { ChevronDown, Instagram, Youtube, Mail, MapPin, Phone, Send } from "lucide-react";
import type { ContactUrls } from "@/lib/settings";
import { FALLBACK_CONTACT } from "@/lib/contactFallback";
import { seasonalBanner, footerColumns, footerThemes } from "@/lib/footerLinks";

const WhatsAppIcon = ({ className }: { className?: string }) => (
    <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        className={className}
        xmlns="http://www.w3.org/2000/svg"
    >
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
    </svg>
);

const focusRing = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rfd-yellow";

export default function Footer({ contact = FALLBACK_CONTACT }: { contact?: ContactUrls }) {
    const footerRef = useRef<HTMLElement>(null);

    // Navegador sem ::details-content (Safari ≤18.3, Firefox ≤137) não deixa o
    // CSS forçar as colunas abertas no desktop. Aqui só ligamos o atributo
    // `open` acima de 768px; os links já estão todos no HTML servido, então é
    // neutro para SEO. Onde o CSS resolve, o efeito não faz nada.
    useEffect(() => {
        if (typeof CSS !== 'undefined' && CSS.supports('selector(::details-content)')) return;
        const mq = window.matchMedia('(min-width: 768px)');
        const sync = () => {
            if (!mq.matches) return;
            footerRef.current
                ?.querySelectorAll<HTMLDetailsElement>('details.footer-acc')
                .forEach((details) => { details.open = true; });
        };
        sync();
        mq.addEventListener('change', sync);
        return () => mq.removeEventListener('change', sync);
    }, []);

    return (
        <footer ref={footerRef} className="bg-rfd-green-dark text-white/70">
            <h2 className="sr-only">Fußbereich</h2>

            {/* Faixa 1 — sazonal (configurável em src/lib/footerLinks.ts) */}
            {seasonalBanner.active && (
                <div className="bg-rfd-yellow text-rfd-green-dark">
                    <div className="max-w-7xl mx-auto px-5 lg:px-8 py-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                        <span className="shrink-0 rounded-full bg-rfd-green-dark px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide text-rfd-yellow">
                            {seasonalBanner.tag}
                        </span>
                        <span className="font-semibold">{seasonalBanner.text}</span>
                        <span className="flex flex-wrap items-center gap-x-4 gap-y-2">
                            {seasonalBanner.links.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={`font-semibold underline underline-offset-4 decoration-rfd-green-dark/40 hover:decoration-rfd-green-dark transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rfd-green-dark`}
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </span>
                    </div>
                </div>
            )}

            {/* Faixa 2 — conversão */}
            <div className="bg-rfd-green-mid">
                <div className="max-w-7xl mx-auto px-5 lg:px-8 py-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                    <div>
                        <p className="font-heading font-black text-2xl md:text-3xl tracking-tight text-white">
                            Plane deine Tage in Rio mit einem Cariocas.
                        </p>
                        <p className="mt-2 text-white/80">
                            Antwort meist innerhalb von 24 Stunden, auf Deutsch.
                        </p>
                    </div>
                    {/* ?von=site: atribuição do CTA do rodapé, já usada no rodapé anterior. */}
                    <Link
                        href="/anfrage?von=site"
                        className={`shrink-0 self-start md:self-auto rounded-lg bg-rfd-yellow px-6 py-3.5 font-bold text-rfd-green-dark hover:brightness-105 transition-all ${focusRing}`}
                    >
                        Unverbindlich anfragen
                    </Link>
                </div>
            </div>

            {/* Faixa 3 — colunas de links. A coluna de marca vem primeiro no DOM
                (topo no mobile) e vai para a quinta posição no desktop. */}
            <div className="max-w-7xl mx-auto px-5 lg:px-8 pt-10 pb-8">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-x-8 gap-y-8">
                    <div className="md:order-last">
                        <Link
                            href="/"
                            className={`inline-flex items-center gap-2 font-heading font-black text-xl tracking-tight text-white ${focusRing}`}
                        >
                            <MapPin className="h-5 w-5 text-rfd-yellow" aria-hidden="true" />
                            <span>Rio für Deutsche</span>
                        </Link>
                        <p className="mt-3 text-sm">
                            Dein Buddy in Rio. Deutschsprachige Privattouren, das ganze Jahr.
                        </p>
                        <ul className="mt-4 space-y-1 text-sm">
                            {contact.phoneHref && (
                                <li>
                                    <a href={contact.phoneHref} className={`flex items-center gap-2 py-[9px] hover:text-white transition-colors ${focusRing}`}>
                                        <Phone className="h-4 w-4 text-rfd-yellow" aria-hidden="true" />
                                        {contact.phone}
                                    </a>
                                </li>
                            )}
                            {contact.emailHref && (
                                <li>
                                    <a href={contact.emailHref} className={`flex items-center gap-2 py-[9px] hover:text-white transition-colors ${focusRing}`}>
                                        <Mail className="h-4 w-4 text-rfd-yellow" aria-hidden="true" />
                                        {contact.email}
                                    </a>
                                </li>
                            )}
                            <li>
                                <Link href="/ueber-will" className={`block py-[9px] hover:text-white transition-colors ${focusRing}`}>
                                    Über Will
                                </Link>
                            </li>
                            <li>
                                <Link href="/kontakt" className={`block py-[9px] hover:text-white transition-colors ${focusRing}`}>
                                    Kontakt
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {footerColumns.map((column) => (
                        <nav key={column.id} aria-labelledby={`footer-${column.id}-heading`} className="border-b border-white/10 md:border-none">
                            {/* Coluna 1 (Touren) abre por padrão no mobile; ≥768px o CSS
                                em globals.css força todas abertas, sem JS. */}
                            <details className="footer-acc" open={column.id === 'touren'}>
                                <summary className={`flex items-center justify-between gap-2 py-3 md:py-0 md:mb-4 ${focusRing}`}>
                                    <h3 id={`footer-${column.id}-heading`} className="font-bold text-white">
                                        {column.heading}
                                    </h3>
                                    <ChevronDown className="footer-acc-chevron h-5 w-5 shrink-0" aria-hidden="true" />
                                </summary>
                                <ul className="pb-3 md:pb-0 text-sm">
                                    {column.links.map((link) => (
                                        <li key={link.href}>
                                            <Link href={link.href} className={`block py-[9px] hover:text-white transition-colors ${focusRing}`}>
                                                {link.label}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </details>
                        </nav>
                    ))}
                </div>

                {/* Linha de temas */}
                <nav aria-labelledby="footer-themen-heading" className="mt-10">
                    <h3 id="footer-themen-heading" className="font-bold text-white mb-4">
                        Weitere Themen
                    </h3>
                    <ul className="flex flex-wrap gap-3">
                        {footerThemes.map((link) => (
                            <li key={link.href}>
                                <Link
                                    href={link.href}
                                    className={`inline-block rounded-full border border-white/25 px-4 py-2 text-sm hover:border-rfd-yellow hover:text-white transition-colors ${focusRing}`}
                                >
                                    {link.label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </nav>

                {/* Parágrafo SEO */}
                <p className="mt-10 max-w-4xl text-sm text-white/60">
                    Rio für Deutsche ist die deutschsprachige Reiseleitung in Rio de Janeiro: private Touren zu Zuckerhut und Christus-Erlöser, Favela-Tour in der Rocinha, Fußball im Maracanã und Tagesausflüge in den Bundesstaat Rio.
                </p>

                {/* Barra final */}
                <div className="mt-8 pt-6 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
                    <p>© {new Date().getFullYear()} Rio für Deutsche. Alle Rechte vorbehalten.</p>
                    <div className="flex flex-wrap items-center justify-center gap-4">
                        <Link href="/impressum" className={`py-[9px] hover:text-white transition-colors ${focusRing}`}>
                            Impressum
                        </Link>
                        <Link href="/datenschutz" className={`py-[9px] hover:text-white transition-colors ${focusRing}`}>
                            Datenschutz
                        </Link>
                        <button
                            onClick={() => window.dispatchEvent(new Event('cookie_consent_reset'))}
                            className={`py-[9px] hover:text-white transition-colors cursor-pointer ${focusRing}`}
                        >
                            Cookie-Einstellungen
                        </button>
                        <span className="flex items-center gap-3">
                            {contact.instagramHref && (
                                <a
                                    href={contact.instagramHref}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`w-10 h-10 flex items-center justify-center rounded-full border border-white/20 hover:text-white hover:border-rfd-yellow transition-colors ${focusRing}`}
                                >
                                    <Instagram className="h-5 w-5" aria-hidden="true" />
                                    <span className="sr-only">Instagram</span>
                                </a>
                            )}
                            {contact.youtubeHref && (
                                <a
                                    href={contact.youtubeHref}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`w-10 h-10 flex items-center justify-center rounded-full border border-white/20 hover:text-white hover:border-rfd-yellow transition-colors ${focusRing}`}
                                >
                                    <Youtube className="h-5 w-5" aria-hidden="true" />
                                    <span className="sr-only">YouTube</span>
                                </a>
                            )}
                            {contact.whatsappHref && (
                                <a
                                    href={contact.whatsappHref}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`w-10 h-10 flex items-center justify-center rounded-full border border-white/20 hover:text-white hover:border-rfd-yellow transition-colors ${focusRing}`}
                                >
                                    <WhatsAppIcon className="h-5 w-5" />
                                    <span className="sr-only">WhatsApp</span>
                                </a>
                            )}
                            {contact.telegramHref && (
                                <a
                                    href={contact.telegramHref}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`w-10 h-10 flex items-center justify-center rounded-full border border-white/20 hover:text-white hover:border-rfd-yellow transition-colors ${focusRing}`}
                                >
                                    <Send className="h-[18px] w-[18px]" aria-hidden="true" />
                                    <span className="sr-only">Telegram</span>
                                </a>
                            )}
                        </span>
                    </div>
                </div>
            </div>
        </footer>
    );
}

'use client'

import Link from "next/link";
import { useTranslations } from "next-intl";
import { MapPin, Instagram, Youtube, Mail, Send } from "lucide-react";
import type { ContactUrls } from "@/lib/settings";
import { FALLBACK_CONTACT } from "@/lib/contactFallback";

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

export default function Footer({ contact = FALLBACK_CONTACT }: { contact?: ContactUrls }) {
    const t = useTranslations('public.footer');

    return (
        <footer className="bg-gray-900 text-gray-400 py-12">
            <div className="max-w-7xl mx-auto px-5 lg:px-8">
                <div className="grid md:grid-cols-3 gap-8 mb-8 pb-8 border-b border-gray-800">
                    <div>
                        <Link href="/" className="font-heading font-black text-2xl tracking-tight text-white flex items-center gap-2 mb-4">
                            <MapPin className="h-6 w-6 text-rio-yellow" />
                            <span>Rio<span className="text-rio-blue">FürDeutsche</span></span>
                        </Link>
                        <p className="text-sm mb-3">{t('tagline')}</p>
                        <p className="text-sm mb-6 text-gray-500">RioFürDeutsche bietet deutschsprachige Reiseleitung, Citytouren und Ausflüge in Rio de Janeiro, geführt von einem echten Carioca, der fließend Deutsch spricht.</p>
                        <div className="flex items-center gap-3">
                            {contact.instagramHref && (
                            <a
                                href={contact.instagramHref}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-800 text-gray-400 hover:text-white hover:bg-rio-green hover:scale-110 transition-all duration-300 border border-gray-700 hover:border-rio-green shadow-lg"
                            >
                                <Instagram className="h-[20px] w-[20px]" />
                                <span className="sr-only">Instagram</span>
                            </a>
                            )}
                            {contact.youtubeHref && (
                            <a
                                href={contact.youtubeHref}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-800 text-gray-400 hover:text-white hover:bg-rio-green hover:scale-110 transition-all duration-300 border border-gray-700 hover:border-rio-green shadow-lg"
                            >
                                <Youtube className="h-[20px] w-[20px]" />
                                <span className="sr-only">YouTube</span>
                            </a>
                            )}
                            {contact.whatsappHref && (
                            <a
                                href={contact.whatsappHref}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-800 text-gray-400 hover:text-white hover:bg-[#25D366] hover:scale-110 transition-all duration-300 border border-gray-700 hover:border-[#25D366] shadow-lg"
                            >
                                <WhatsAppIcon className="h-[20px] w-[20px]" />
                                <span className="sr-only">WhatsApp</span>
                            </a>
                            )}
                            {contact.telegramHref && (
                            <a
                                href={contact.telegramHref}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-800 text-gray-400 hover:text-white hover:bg-[#0088cc] hover:scale-110 transition-all duration-300 border border-gray-700 hover:border-[#0088cc] shadow-lg"
                            >
                                <Send className="h-[18px] w-[18px]" />
                                <span className="sr-only">Telegram</span>
                            </a>
                            )}
                            {contact.emailHref && (
                            <a
                                href={contact.emailHref}
                                className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-800 text-gray-400 hover:text-white hover:bg-rio-blue hover:scale-110 transition-all duration-300 border border-gray-700 hover:border-rio-blue shadow-lg"
                            >
                                <Mail className="h-[18px] w-[18px]" />
                                <span className="sr-only">Email</span>
                            </a>
                            )}
                        </div>
                    </div>
                    <div>
                        <h3 className="text-white font-bold mb-4">{t('quickLinks')}</h3>
                        <ul className="space-y-2 text-sm">
                            {/* Primeiro da lista de propósito: é o CTA da Fase 1, e o
                                footer é o único lugar que aparece em toda página. */}
                            <li><Link href="/anfrage?von=site" className="font-semibold text-white hover:text-rio-yellow transition-colors">{t('tourAnfragen')}</Link></li>
                            <li><Link href="/touren" className="hover:text-white transition-colors">{t('tourenUndAusfluege')}</Link></li>
                            <li><Link href="/ueber-will" className="hover:text-white transition-colors">{t('ueberUns')}</Link></li>
                            <li><Link href="/rio-guide/sehenswuerdigkeiten" className="hover:text-white transition-colors">{t('rioGuide')}</Link></li>
                            <li><Link href="/rio-guide/sehenswuerdigkeiten/christus-erloeser" className="hover:text-white transition-colors">{t('christusErloeser')}</Link></li>
                            <li><Link href="/kontakt" className="hover:text-white transition-colors">{t('kontakt')}</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-white font-bold mb-4">{t('kontakt')}</h3>
                        <ul className="space-y-2 text-sm">
                            {contact.whatsappHref && (
                            <li className="flex items-center gap-2">
                                <WhatsAppIcon className="h-4 w-4 text-[#25D366]" />
                                <a href={contact.whatsappHref} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors" suppressHydrationWarning>{contact.phone}</a>
                            </li>
                            )}
                            {contact.emailHref && (
                            <li className="flex items-center gap-2">
                                <Mail className="h-4 w-4 text-rio-blue" />
                                <a href={contact.emailHref} className="hover:text-white transition-colors">{contact.email}</a>
                            </li>
                            )}
                            <li className="pt-2 text-rio-yellow">{t('deinBuddyInRio')}</li>
                        </ul>
                    </div>
                </div>
                <div className="flex flex-col md:flex-row justify-between items-center text-xs">
                    {/* year vai como string: em ICU um número seria formatado com
                        separador de milhar (2.026), mudando o texto renderizado. */}
                    <p>{t('copyright', { year: String(new Date().getFullYear()) })}</p>
                    <div className="flex gap-4 mt-4 md:mt-0">
                        <Link href="/impressum" className="hover:text-white transition-colors">{t('impressum')}</Link>
                        <Link href="/datenschutz" className="hover:text-white transition-colors">{t('datenschutz')}</Link>
                        <button
                            onClick={() => window.dispatchEvent(new Event('cookie_consent_reset'))}
                            className="hover:text-white transition-colors cursor-pointer"
                        >
                            {t('cookieEinstellungen')}
                        </button>
                    </div>
                </div>
            </div>
        </footer>
    );
}

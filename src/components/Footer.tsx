import Link from "next/link";
import { MapPin, Instagram, Youtube } from "lucide-react";

export default function Footer() {
    return (
        <footer className="bg-gray-900 text-gray-400 py-12">
            <div className="max-w-7xl mx-auto px-5 lg:px-8">
                <div className="grid md:grid-cols-3 gap-8 mb-8 pb-8 border-b border-gray-800">
                    <div>
                        <Link href="/" className="font-heading font-black text-2xl tracking-tight text-white flex items-center gap-2 mb-4">
                            <MapPin className="h-6 w-6 text-rio-yellow" />
                            <span>Rio<span className="text-rio-blue">FürDeutsche</span></span>
                        </Link>
                        <p className="text-sm mb-6">Dein deutschsprachiger Insider Guide in der wunderbaren Stadt Rio de Janeiro.</p>
                        <div className="flex items-center gap-3">
                            <a
                                href="https://instagram.com/riofuerdeutsche"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-800 text-gray-400 hover:text-white hover:bg-rio-green hover:scale-110 transition-all duration-300 border border-gray-700 hover:border-rio-green shadow-lg"
                            >
                                <Instagram className="h-[20px] w-[20px]" />
                                <span className="sr-only">Instagram</span>
                            </a>
                            <a
                                href="https://youtube.com/@riofuerdeutsche"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-800 text-gray-400 hover:text-white hover:bg-rio-green hover:scale-110 transition-all duration-300 border border-gray-700 hover:border-rio-green shadow-lg"
                            >
                                <Youtube className="h-[20px] w-[20px]" />
                                <span className="sr-only">YouTube</span>
                            </a>
                        </div>
                    </div>
                    <div>
                        <h3 className="text-white font-bold mb-4">Quick Links</h3>
                        <ul className="space-y-2 text-sm">
                            <li><Link href="/touren/klassiker" className="hover:text-white transition-colors">Touren und Ausflüge</Link></li>
                            <li><Link href="/#ueber-uns" className="hover:text-white transition-colors">Über Uns</Link></li>
                            <li><Link href="/#vorteile" className="hover:text-white transition-colors">Warum Wir?</Link></li>
                            <li><Link href="/kontakt" className="hover:text-white transition-colors">Kontakt</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-white font-bold mb-4">Kontakt</h3>
                        <ul className="space-y-2 text-sm">
                            <li>Rio de Janeiro, Brasilien</li>
                            <li>WhatsApp: <a href="https://wa.me/573148704374" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">+57 314 870 4374</a></li>
                            <li>Email: <a href="mailto:lantelmew@gmail.com" className="hover:text-white transition-colors">lantelmew@gmail.com</a></li>
                            <li className="pt-2 text-rio-yellow">Dein Buddy in Rio!</li>
                        </ul>
                    </div>
                </div>
                <div className="flex flex-col md:flex-row justify-between items-center text-xs">
                    <p>&copy; {new Date().getFullYear()} Rio für Deutsche. Alle Rechte vorbehalten.</p>
                    <div className="flex gap-4 mt-4 md:mt-0">
                        <Link href="/impressum" className="hover:text-white transition-colors">Impressum</Link>
                        <Link href="/datenschutz" className="hover:text-white transition-colors">Datenschutz</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}

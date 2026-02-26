"use client";

import { useState } from "react";
import Link from "next/link";
import {
    MapPin,
    Phone,
    User,
    Menu,
    X,
    Instagram,
    Youtube,
    ChevronDown,
} from "lucide-react";

const navLinks = [
    {
        label: "Touren & Ausflüge",
        subLinks: [
            { href: "/touren/klassiker", label: "🗺️ Klassiker Tour" },
            { href: "#", label: "🏘️ Favela Tour", disabled: true },
            { href: "#", label: "🌙 Rio by Night", disabled: true },
            { href: "#", label: "🎉 Karneval Tour", disabled: true },
            { href: "#", label: "🎯 Individuelle Tour", disabled: true },
        ],
    },
    { href: "/#ueber-uns", label: "Über Uns" },
    { href: "/#vorteile", label: "Vorteile" },
    { href: "/#bewertungen", label: "Bewertungen" },
    { href: "/#kontakt", label: "Kontakt" },
];

export default function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [mobileTourenOpen, setMobileTourenOpen] = useState(false);

    return (
        <>
            {/* NAVBAR */}
            <header className="fixed top-0 left-0 right-0 z-[120] bg-white lg:bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100 transition-all duration-300">
                <div className="max-w-7xl mx-auto px-5 lg:px-8 h-20 flex items-center justify-between">
                    <Link
                        href="/"
                        className="font-heading font-black text-2xl tracking-tight text-rio-green flex items-center gap-2 group relative z-[130]"
                        onClick={() => setIsMenuOpen(false)}
                    >
                        <MapPin className="h-7 w-7 text-rio-yellow group-hover:-translate-y-1 transition-transform" />
                        <span>Rio<span className="text-rio-blue font-light">FürDeutsche</span></span>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden lg:flex gap-8 items-center" aria-label="Hauptnavigation">
                        {navLinks.map((link) => (
                            link.subLinks ? (
                                <div key={link.label} className="relative group p-2">
                                    <button className="flex items-center gap-1 text-sm font-medium text-gray-700 group-hover:text-rio-green transition-colors duration-200">
                                        {link.label}
                                        <ChevronDown className="w-4 h-4 transition-transform duration-300 group-hover:-rotate-180" />
                                    </button>
                                    <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 w-56 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                                        <div className="bg-white rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] border border-gray-100 overflow-hidden transform origin-top translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                                            <div className="py-2">
                                                {link.subLinks.map((sub, i) => sub.disabled ? (
                                                    <span key={i} className="block px-5 py-2.5 text-sm text-gray-400 cursor-not-allowed">
                                                        {sub.label}
                                                    </span>
                                                ) : (
                                                    <Link
                                                        key={i}
                                                        href={sub.href}
                                                        className="block px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-rio-green/5 hover:text-rio-green transition-colors"
                                                    >
                                                        {sub.label}
                                                    </Link>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <Link
                                    key={link.href}
                                    href={link.href!}
                                    className="p-2 text-sm font-medium text-gray-700 hover:text-rio-green transition-colors duration-200"
                                >
                                    {link.label}
                                </Link>
                            )
                        ))}
                    </nav>

                    <div className="flex items-center gap-4">
                        <Link href="/login" className="hidden lg:flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-rio-green transition-colors duration-200">
                            <User className="h-4 w-4 text-rio-green" />
                            <span>Login</span>
                        </Link>

                        {/* Hamburger Button */}
                        <button
                            className="lg:hidden p-2 text-gray-700 hover:text-rio-green transition-colors relative z-[130]"
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            aria-label="Menü öffnen"
                            aria-expanded={isMenuOpen}
                        >
                            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </button>
                    </div>
                </div>
            </header>

            {/* Mobile Menu Overlay */}
            <div
                className={`fixed inset-0 z-[110] lg:hidden bg-white transition-all duration-500 ease-in-out ${isMenuOpen ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0 pointer-events-none"
                    }`}
                role="dialog"
                aria-modal="true"
                aria-label="Mobile Navigation"
            >
                <div className="flex flex-col h-full pt-24 pb-8 px-8 overflow-y-auto">
                    <nav className="flex flex-col gap-8 items-center text-center py-10 w-full" aria-label="Mobile Navigation">
                        {navLinks.map((link) => (
                            link.subLinks ? (
                                <div key={link.label} className="flex flex-col items-center w-full">
                                    <button
                                        className="flex items-center gap-2 text-2xl font-bold text-gray-900 hover:text-rio-green transition-colors"
                                        onClick={() => setMobileTourenOpen(!mobileTourenOpen)}
                                    >
                                        {link.label}
                                        <ChevronDown className={`w-6 h-6 transition-transform duration-300 ${mobileTourenOpen ? "-rotate-180 text-rio-green" : ""}`} />
                                    </button>
                                    <div className={`flex flex-col gap-4 overflow-hidden transition-all duration-300 w-full ${mobileTourenOpen ? "max-h-64 opacity-100 mt-6" : "max-h-0 opacity-0 mt-0"}`}>
                                        {link.subLinks.map((sub, i) => sub.disabled ? (
                                            <span key={i} className="text-lg font-medium text-gray-400">
                                                {sub.label}
                                            </span>
                                        ) : (
                                            <Link
                                                key={i}
                                                href={sub.href}
                                                className="text-lg font-medium text-gray-600 hover:text-rio-green transition-colors"
                                                onClick={() => setIsMenuOpen(false)}
                                            >
                                                {sub.label}
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <Link
                                    key={link.href}
                                    href={link.href!}
                                    className="text-2xl font-bold text-gray-900 hover:text-rio-green transition-colors"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    {link.label}
                                </Link>
                            )
                        ))}
                        <div className="w-full h-px bg-gray-100 max-w-xs my-2"></div>
                        <Link
                            href="/login"
                            className="flex items-center gap-3 text-2xl font-bold text-gray-900 hover:text-rio-green transition-colors"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            <User className="h-6 w-6 text-rio-green" />
                            <span>Login</span>
                        </Link>
                    </nav>

                    <div className="mt-auto pt-10 text-center border-t border-gray-100 pb-10">
                        <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-4">Kontaktieren Sie uns</p>
                        <div className="flex flex-col items-center gap-4">
                            <a href="tel:+573148704374" className="flex items-center gap-3 text-gray-700 font-semibold text-xl">
                                <Phone className="h-6 w-6 text-rio-green" />
                                <span>+57 314 870 4374</span>
                            </a>
                            <div className="flex gap-4 mt-2">
                                <a href="https://instagram.com/riofuerdeutsche" target="_blank" rel="noopener noreferrer" className="w-12 h-12 flex items-center justify-center bg-gray-50 rounded-full text-gray-600 hover:text-rio-green hover:bg-gray-100 transition-all">
                                    <Instagram className="h-[22px] w-[22px]" />
                                    <span className="sr-only">Instagram</span>
                                </a>
                                <a href="https://youtube.com/@riofuerdeutsche" target="_blank" rel="noopener noreferrer" className="w-12 h-12 flex items-center justify-center bg-gray-50 rounded-full text-gray-600 hover:text-rio-green hover:bg-gray-100 transition-all">
                                    <Youtube className="h-6 w-6" />
                                    <span className="sr-only">YouTube</span>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

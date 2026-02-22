"use client";

import { useState } from "react";
import Link from "next/link";
import FadeIn from "@/components/FadeIn";
import {
  ArrowRight,
  MapPin,
  ShieldCheck,
  Camera,
  Star,
  HeartHandshake,
  Phone,
  CheckCircle2,
  CalendarDays,
  User,
  Menu,
  X,
  Instagram,
  Youtube
} from "lucide-react";

// NOTE: Using native img tags to avoid Remote Patterns config issues in Next.js dynamically
export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = [
    { href: "#touren", label: "Touren & Ausflüge" },
    { href: "#ueber-uns", label: "Über Uns" },
    { href: "#vorteile", label: "Vorteile" },
    { href: "#bewertungen", label: "Bewertungen" },
    { href: "#kontakt", label: "Kontakt" },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-rio-sand selection:bg-rio-green selection:text-white pb-0 font-sans">

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
          <nav className="hidden lg:flex gap-8">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-gray-700 hover:text-rio-green transition-colors duration-200"
              >
                {link.label}
              </a>
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
              aria-label="Toggle Menu"
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
      >
        <div className="flex flex-col h-full pt-24 pb-8 px-8 overflow-y-auto">
          <nav className="flex flex-col gap-8 items-center text-center py-10">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-2xl font-bold text-gray-900 hover:text-rio-green transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                {link.label}
              </a>
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
              <a href="tel:+5521999999999" className="flex items-center gap-3 text-gray-700 font-semibold text-xl">
                <Phone className="h-6 w-6 text-rio-green" />
                <span>+55 (21) 99999-9999</span>
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

      {/* HERO SECTION */}
      <section className="relative h-screen min-h-[600px] flex items-center pt-20 overflow-hidden">
        {/* Background Image Setup */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: "url('/images/rio-background.webp')",
          }}
        >
          {/* Gradient Overlay for Text Readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-rio-sand via-transparent to-transparent opacity-90"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-5 lg:px-8 w-full">
          <FadeIn direction="up">
            <div className="max-w-2xl space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white text-sm font-medium">
                <HeartHandshake className="w-4 h-4 text-rio-yellow" />
                <span>Dein deutschsprachiger Guide in Rio</span>
              </div>

              <h1 className="text-5xl lg:text-7xl font-heading font-bold text-white leading-[1.1] tracking-tight text-shadow-hero">
                Entdecke Rio <br />
                <span className="text-rio-yellow">wie ein Einheimischer</span>
              </h1>

              <p className="text-lg lg:text-xl text-gray-200 max-w-xl font-light leading-relaxed">
                Deutschsprachige Privattouren durch Rio de Janeiro. Maßgeschneidert, sicher und unvergesslich – erlebe die Marvelous City aus der besten Perspektive.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link href="#touren" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-rio-yellow text-gray-900 rounded-full font-semibold text-lg hover:bg-yellow-400 hover:scale-[1.02] transition-all shadow-xl shadow-rio-yellow/20">
                  <Camera className="w-5 h-5" />
                  Touren ansehen
                </Link>
                <Link href="#kontakt" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-md border border-white/30 text-white rounded-full font-medium text-lg hover:bg-white/20 transition-all">
                  Kostenlos anfragen
                </Link>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* WHY US SECTION */}
      <section id="vorteile" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-5 lg:px-8">
          <FadeIn direction="up" className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-rio-green font-semibold tracking-wide uppercase text-sm mb-3">Warum mit uns?</h2>
            <h3 className="text-3xl md:text-4xl font-heading font-bold text-gray-900">Dein perfekter Urlaub in besten Händen</h3>
          </FadeIn>

          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            {[
              {
                icon: HeartHandshake,
                color: "text-rio-blue",
                bg: "bg-rio-blue/10",
                title: "100% Deutschsprachig",
                desc: "Keine Sprachbarrieren! Unsere Guides sprechen fließend Deutsch und kennen die brasilianische Kultur bis ins Detail."
              },
              {
                icon: ShieldCheck,
                color: "text-rio-green",
                bg: "bg-rio-green/10",
                title: "Absolut Sicher",
                desc: "Wir legen höchsten Wert auf deine Sicherheit. Als Einheimische kennen wir die sicheren Routen und besten Zeiten für jeden Ort."
              },
              {
                icon: CheckCircle2,
                color: "text-rio-yellow",
                bg: "bg-rio-yellow/20",
                title: "Maßgeschneiderte Touren",
                desc: "Keine Massenabfertigung. Wir kreieren individuelle Erlebnisse, genau nach deinen Wünschen und in deinem Tempo."
              }
            ].map((feature, i) => (
              <FadeIn key={i} delay={i * 0.15} direction="up" className="p-8 rounded-3xl bg-gray-50 border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${feature.bg} mb-6`}>
                  <feature.icon className={`w-7 h-7 ${feature.color}`} />
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h4>
                <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* TOP TOURS SECTION */}
      <section id="touren" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-5 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <FadeIn direction="left" className="max-w-2xl">
              <h2 className="text-rio-green font-semibold tracking-wide uppercase text-sm mb-3">Ausflüge & Highlights</h2>
              <h3 className="text-3xl md:text-4xl font-heading font-bold text-gray-900 leading-tight">Die beliebtesten Touren <br />für unsere Gäste</h3>
            </FadeIn>
            <FadeIn direction="right">
              <Link href="#kontakt" className="group inline-flex items-center gap-2 text-rio-blue font-medium hover:text-rio-blue/80 transition-colors">
                Alle Touren ansehen
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </FadeIn>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "Die Klassiker (Corcovado & Zuckerhut)",
                duration: "8 Stunden",
                desc: "Christusstatue, Zuckerhut, Selarón-Treppe & das historische Zentrum an einem Tag.",
                img: "/images/rio-klassiker.webp"
              },
              {
                title: "Favela Tour Authentisch & Sicher",
                duration: "4 Stunden",
                desc: "Ein respektvoller Einblick in die Kultur der Favelas (z.B. Rocinha oder Vidigal).",
                img: "/images/rio-favela.webp"
              },
              {
                title: "Tropischer Regenwald & Strände",
                duration: "6 Stunden",
                desc: "Tijuca-Nationalpark mit Wasserfällen und versteckte Traumstrände Rios.",
                img: "/images/rio-natur.webp"
              }
            ].map((tour, i) => (
              <FadeIn key={i} delay={i * 0.15} direction="up">
                <Link
                  href="#kontakt"
                  className="group flex flex-col bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl border border-gray-100 transition-all duration-300 h-full"
                >
                  <div className="relative h-64 overflow-hidden">
                    <div className="absolute inset-0 bg-gray-900 group-hover:bg-opacity-20 transition-all z-10 opacity-0"></div>
                    <img src={tour.img} alt={tour.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" />
                    <div className="absolute top-4 right-4 z-20 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-rio-green flex items-center gap-1">
                      <CalendarDays className="w-3 h-3" />
                      {tour.duration}
                    </div>
                  </div>
                  <div className="p-8 flex flex-col flex-grow">
                    <h4 className="text-xl font-bold font-heading text-gray-900 mb-3 line-clamp-2">{tour.title}</h4>
                    <p className="text-gray-600 mb-6 flex-grow">{tour.desc}</p>
                    <div className="inline-flex items-center gap-2 text-rio-green font-semibold group-hover:-translate-y-0.5 transition-transform mt-auto">
                      Details anfragen
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </Link>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ABOUT US / GUIDE TEASER */}
      <section id="ueber-uns" className="py-24 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-5 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <FadeIn direction="left" className="lg:w-1/2 relative">
              <div className="absolute -top-6 -left-6 w-32 h-32 bg-rio-yellow/20 rounded-full blur-2xl"></div>
              <div className="absolute -bottom-6 -right-6 w-48 h-48 bg-rio-green/10 rounded-full blur-3xl"></div>
              <img
                src="/images/rio-cristo.webp"
                alt="Rio de Janeiro Tour"
                className="relative z-10 w-full aspect-square object-cover object-left rounded-tr-[80px] rounded-bl-[80px] rounded-tl-3xl rounded-br-3xl shadow-2xl"
              />
            </FadeIn>

            <FadeIn direction="right" className="lg:w-1/2 space-y-6">
              <h2 className="text-rio-green font-semibold tracking-wide uppercase text-sm mb-2">Über Mich</h2>
              <h3 className="text-3xl md:text-5xl font-heading font-bold text-gray-900 leading-tight">
                Hallo, ich bin <span className="text-rio-blue">Will!</span>
              </h3>
              <p className="text-lg text-gray-600 leading-relaxed">
                Als gebürtiger Carioca kenne ich Rio de Janeiro wie meine Westentasche. Von den berühmten Sehenswürdigkeiten bis zu den versteckten Juwelen, die nur Einheimische kennen – ich zeige Ihnen alles!
              </p>
              <p className="text-lg text-gray-600 leading-relaxed">
                Ich spreche fließend Deutsch und liebe es, meine Leidenschaft für meine Heimatstadt mit Besuchern aus deutschsprachigen Ländern zu teilen. Mit mir erleben Sie Rio ohne Sprachbarrieren.
              </p>

              <blockquote className="border-l-4 border-rio-yellow pl-4 py-2 my-6">
                <p className="text-xl italic font-medium text-gray-800">
                  &quot;Ich zeige Ihnen nicht nur Sehenswürdigkeiten, sondern auch die Seele Rios.&quot;
                </p>
              </blockquote>

              <div className="flex flex-wrap gap-3 pt-4">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100/80 text-gray-800 text-sm font-medium">
                  <MapPin className="w-4 h-4 text-rio-blue" />
                  <span>Lokaler Guide</span>
                </div>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100/80 text-gray-800 text-sm font-medium">
                  <HeartHandshake className="w-4 h-4 text-rio-blue" />
                  <span>Deutschsprachig</span>
                </div>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100/80 text-gray-800 text-sm font-medium">
                  <User className="w-4 h-4 text-rio-blue" />
                  <span>Carioca</span>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* BEWERTUNGEN SECTION */}
      <section id="bewertungen" className="py-24 bg-rio-sand/30">
        <div className="max-w-7xl mx-auto px-5 lg:px-8">
          <FadeIn direction="up" className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-rio-green font-semibold tracking-wide uppercase text-sm mb-3">Erfahrungen</h2>
            <h3 className="text-3xl md:text-4xl font-heading font-bold text-gray-900">Was unsere Gäste sagen</h3>
          </FadeIn>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { text: "Beste Entscheidung unseres Rio Urlaubs! Super sicher und extrem informativ. Danke an das tolle Team!", name: "Michael & Sarah", rating: 5 },
              { text: "Wir haben uns zu jeder Zeit absolut sicher gefühlt. Die Tour zur Christusstatue war perfekt organisiert.", name: "Thomas M.", rating: 5 },
              { text: "Tolle Insidertipps und ein fantastischer Tag. Ohne unseren Guide hätten wir das wahre Rio nie so erlebt.", name: "Familie Weber", rating: 5 }
            ].map((review, i) => (
              <FadeIn key={i} delay={i * 0.15} direction="up" className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col h-full">
                <div className="flex gap-1 mb-4">
                  {[...Array(review.rating)].map((_, j) => (
                    <Star key={j} className="w-5 h-5 fill-rio-yellow text-rio-yellow" />
                  ))}
                </div>
                <p className="text-gray-600 mb-6 flex-grow italic">"{review.text}"</p>
                <p className="font-bold text-gray-900 border-t border-gray-100 pt-4">{review.name}</p>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* CALL TO ACTION */}
      <section id="kontakt" className="py-24 relative overflow-hidden bg-rio-green">
        <div className="absolute inset-0 bg-[url('/images/rio-background.webp')] bg-cover bg-center mix-blend-overlay opacity-10"></div>
        <div className="relative max-w-4xl mx-auto px-5 text-center">
          <FadeIn direction="up">
            <h2 className="text-3xl md:text-5xl font-heading font-bold text-white mb-6">Lust auf Rio bekommen?</h2>
            <p className="text-lg text-rio-sand/90 mb-10 max-w-2xl mx-auto">
              Lass uns unverbindlich über deine Pläne sprechen. Wir erstellen dir gerne ein auf dich zugeschnittenes Angebot für deinen Traumurlaub in Brasilien.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <a href="https://wa.me/5521999999999" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-rio-yellow text-gray-900 rounded-full font-bold text-lg hover:bg-yellow-400 hover:scale-[1.02] transition-all shadow-xl shadow-black/10">
                <Phone className="w-5 h-5" />
                WhatsApp an uns
              </a>
              <a href="mailto:kontakt@riofuerdeutsche.example" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-md border border-white/30 text-white rounded-full font-medium text-lg hover:bg-white/20 transition-all">
                Zum Kontaktformular
              </a>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* FOOTER */}
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
              <h4 className="text-white font-bold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#touren" className="hover:text-white transition-colors">Touren & Preise</a></li>
                <li><a href="#ueber-uns" className="hover:text-white transition-colors">Über Uns</a></li>
                <li><a href="#vorteile" className="hover:text-white transition-colors">Warum Wir?</a></li>
                <li><a href="#kontakt" className="hover:text-white transition-colors">Kontakt</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Kontakt</h4>
              <ul className="space-y-2 text-sm">
                <li>Rio de Janeiro, Brasilien</li>
                <li>WhatsApp: +55 (21) 99999-9999</li>
                <li>Email: kontakt@riofuerdeutsche.example</li>
                <li className="pt-2 text-rio-yellow">Dein Buddy in Rio!</li>
              </ul>
            </div>
          </div>
          <div className="flex flex-col md:flex-row justify-between items-center text-xs">
            <p>&copy; {new Date().getFullYear()} Rio für Deutsche. Alle Rechte vorbehalten.</p>
            <div className="flex gap-4 mt-4 md:mt-0">
              <a href="#" className="hover:text-white transition-colors">Impressum</a>
              <a href="#" className="hover:text-white transition-colors">Datenschutz</a>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}

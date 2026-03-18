import Link from "next/link";
import { Syne } from "next/font/google";

const syne = Syne({ subsets: ["latin"], weight: ["700", "800"] });

export default function CTAGuideCompleto() {
  return (
    <section 
      id="cta-guide" 
      className="bg-[#0d1f15] rounded-[14px] p-[28px] md:py-[28px] md:px-[32px] flex flex-col md:flex-row md:items-center justify-between gap-[24px] w-full"
    >
      {/* Lado Esquerdo */}
      <div className="flex flex-col items-start">
        {/* Eyebrow badge */}
        <div className="bg-[rgba(245,197,24,0.15)] border border-[rgba(245,197,24,0.35)] rounded-[20px] px-[12px] py-[3px] mb-[10px]">
          <span className="text-[#f5c518] text-[8px] font-[700] uppercase tracking-[0.5px]">
            Early Access
          </span>
        </div>

        {/* Título */}
        <h2 className={`${syne.className} text-[#f8f5f0] text-[18px] font-[800] leading-[1.3] mb-[6px]`}>
          Schalte den kompletten<br className="hidden md:block" /> Rio-Guide frei
        </h2>

        {/* Subtítulo */}
        <p className="text-[#99ddee] text-[11px] leading-[1.6]">
          Edition 1, 2, 3 und 4 — alles über Rio auf Deutsch,<br className="hidden md:block" /> von einem echten Carioca.
        </p>

        {/* Checkmarks */}
        <div className="flex flex-col md:flex-row gap-[14px] md:flex-wrap mt-[12px]">
          <div className="flex items-center gap-[6px]">
            <div className="w-[6px] h-[6px] rounded-full bg-[#22a262] shrink-0" />
            <span className="text-[#99ddee] text-[10px]">Alle Kapitel sofort verfügbar</span>
          </div>
          <div className="flex items-center gap-[6px]">
            <div className="w-[6px] h-[6px] rounded-full bg-[#22a262] shrink-0" />
            <span className="text-[#99ddee] text-[10px]">Alle zukünftigen Updates inklusive</span>
          </div>
          <div className="flex items-center gap-[6px]">
            <div className="w-[6px] h-[6px] rounded-full bg-[#22a262] shrink-0" />
            <span className="text-[#99ddee] text-[10px]">Preis steigt mit jeder neuen Edition</span>
          </div>
        </div>
      </div>

      {/* Lado Direito */}
      <div className="flex flex-col shrink-0 items-center md:items-end w-full md:w-auto">
        <Link
          href="/guide/upgrade"
          className="bg-[#f5c518] text-[#0d1f15] text-[13px] font-[800] py-[14px] px-[26px] rounded-[10px] hover:bg-[#e6b800] transition-colors whitespace-nowrap text-center w-full md:w-auto"
        >
          Jetzt freischalten →
        </Link>
        <span className="text-[#666666] text-[9px] text-center mt-[5px]">
          Zur Verkaufsseite
        </span>
      </div>
    </section>
  );
}

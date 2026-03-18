export default function CTABeratung() {
  return (
    <section className="bg-[#ffffff] border-[0.5px] border-[#e0ddd6] rounded-[14px] p-[28px] md:py-[28px] md:px-[32px] flex flex-col md:flex-row md:items-center gap-[28px] w-full">
      {/* Ícone (Esquerda) */}
      <div className="w-[56px] h-[56px] bg-[#f0faf4] rounded-full flex items-center justify-center shrink-0">
        <span className="text-[26px]">📞</span>
      </div>

      {/* Conteúdo (Centro) */}
      <div className="flex-1">
        {/* Título */}
        <h2 className="text-[#1a1a1a] text-[16px] font-[800] mb-[5px]">
          Persönliche Unterkunft-Beratung
        </h2>

        {/* Subtítulo */}
        <p className="text-[#666666] text-[11px] leading-[1.6] max-w-[480px]">
          60 Minuten mit Will per Videocall — sichere Unterkunft finden,
          Routen planen, alle Fragen beantwortet. Von einem Carioca,
          der fließend Deutsch spricht.
        </p>

        {/* Pills */}
        <div className="flex flex-wrap gap-[8px] mt-[10px]">
          <span className="bg-[#e8f5e9] text-[#0f4a2c] text-[9px] font-[600] px-[10px] py-[3px] rounded-[20px]">
            60 Minuten
          </span>
          <span className="bg-[#e8f5e9] text-[#0f4a2c] text-[9px] font-[600] px-[10px] py-[3px] rounded-[20px]">
            Videocall
          </span>
          <span className="bg-[#e8f5e9] text-[#0f4a2c] text-[9px] font-[600] px-[10px] py-[3px] rounded-[20px]">
            Personalisiert
          </span>
          <span className="bg-[#e8f5e9] text-[#0f4a2c] text-[9px] font-[600] px-[10px] py-[3px] rounded-[20px]">
            Auf Deutsch
          </span>
        </div>
      </div>

      {/* Botão (Direita) */}
      <div className="shrink-0 w-full md:w-auto mt-[4px] md:mt-0">
        <a
          href="https://riofuerdeutsche.de/unterkunft/beratung"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-[#0d1f15] text-[#f8f5f0] text-[12px] font-[700] py-[13px] px-[22px] rounded-[10px] hover:bg-[#1a3a28] transition-colors whitespace-nowrap text-center block w-full md:w-auto"
        >
          Beratung buchen →
        </a>
      </div>
    </section>
  );
}

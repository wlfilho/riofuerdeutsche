interface MembersHeroProps {
  userName: string;
  heroImageUrl?: string;
}

export default function MembersHero({ userName, heroImageUrl }: MembersHeroProps) {
  const bgImage = heroImageUrl || "/images/home-pao-de-acucar.webp";

  return (
    <div
      className="relative w-full overflow-hidden flex items-end"
      style={{
        minHeight: "340px",
        backgroundImage: `url('${bgImage}')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Overlay gradiente da esquerda */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to right, rgba(0,0,0,0.80) 0%, rgba(0,0,0,0.45) 55%, transparent 100%)",
        }}
      />

      {/* Conteúdo */}
      <div className="relative z-10 px-[48px] py-[40px] md:px-[64px] flex flex-col items-start max-w-[700px]">
        {/* Badge */}
        <div
          className="mb-[12px] px-[14px] py-[4px] rounded-full border text-[11px] font-[700] uppercase tracking-[1px] text-white"
          style={{ borderColor: "rgba(255,255,255,0.35)" }}
        >
          Mitgliederbereich
        </div>

        {/* Título */}
        <h1 className="font-heading font-black text-white leading-tight mb-[12px]"
          style={{ fontSize: "clamp(32px, 5vw, 48px)" }}>
          Willkommen zurück,{" "}
          <span style={{ color: "#f5c518" }}>{userName}!</span>
        </h1>

        {/* Subtítulo */}
        <p
          className="text-[16px] leading-[1.6] max-w-[520px]"
          style={{ color: "rgba(255,255,255,0.85)" }}
        >
          Dein persönlicher Rio-Guide — Insider-Tipps von einem echten Carioca,
          der fließend Deutsch spricht.
        </p>
      </div>
    </div>
  );
}

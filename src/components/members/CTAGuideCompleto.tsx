import Link from "next/link";

export default function CTAGuideCompleto() {
  return (
    <section
      id="cta-guide"
      className="relative w-full text-center overflow-hidden"
      style={{
        backgroundColor: "#0d1f15",
        backgroundImage: "url('/images/rio-background.webp')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        padding: "80px 24px",
      }}
    >
      {/* Overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "rgba(10, 25, 16, 0.82)" }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Badge */}
        <span
          className="inline-block uppercase font-bold tracking-widest"
          style={{
            background: "rgba(245,197,24,0.18)",
            border: "1px solid rgba(245,197,24,0.45)",
            borderRadius: "999px",
            padding: "4px 16px",
            fontSize: "10px",
            letterSpacing: "1px",
            color: "#f5c518",
            marginBottom: "20px",
          }}
        >
          Early Access
        </span>

        {/* Título */}
        <h2
          className="font-display"
          style={{
            fontSize: "clamp(26px, 5vw, 36px)",
            fontWeight: 800,
            color: "#ffffff",
            marginBottom: "12px",
            maxWidth: "600px",
            lineHeight: 1.2,
          }}
        >
          Den kompletten Rio-Guide freischalten
        </h2>

        {/* Subtítulo */}
        <p
          style={{
            fontSize: "16px",
            color: "rgba(255,255,255,0.80)",
            lineHeight: 1.6,
            maxWidth: "560px",
            margin: "0 auto 32px",
          }}
        >
          Edition 1, 2, 3 und 4 — alles über Rio auf Deutsch. Alle zukünftigen
          Updates inklusive. Der Preis steigt mit jeder neuen Edition.
        </p>

        {/* Botões */}
        <div className="flex justify-center flex-wrap" style={{ gap: "16px" }}>
          <Link
            href="/dashboard/upgrade"
            style={{
              background: "#f5c518",
              color: "#1a1a1a",
              fontSize: "15px",
              fontWeight: 700,
              padding: "14px 28px",
              borderRadius: "999px",
              border: "none",
              textDecoration: "none",
              whiteSpace: "nowrap",
            }}
          >
            📖 Jetzt freischalten
          </Link>
          <a
            href="#kapitel"
            style={{
              background: "rgba(255,255,255,0.12)",
              color: "#ffffff",
              fontSize: "15px",
              fontWeight: 600,
              padding: "14px 28px",
              borderRadius: "999px",
              border: "1px solid rgba(255,255,255,0.25)",
              textDecoration: "none",
              whiteSpace: "nowrap",
            }}
          >
            Mehr erfahren
          </a>
        </div>
      </div>
    </section>
  );
}

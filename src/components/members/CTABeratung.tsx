export default function CTABeratung() {
  return (
    <section
      className="w-full text-center"
      style={{
        background: "#f5c518",
        borderTop: "none",
        padding: "72px 24px",
      }}
    >
      <div className="flex flex-col items-center" style={{ maxWidth: "700px", margin: "0 auto" }}>
        {/* Badge */}
        <span
          className="inline-block uppercase font-bold tracking-widest"
          style={{
            background: "#e8f5e9",
            border: "1px solid rgba(34,162,98,0.35)",
            borderRadius: "999px",
            padding: "4px 16px",
            fontSize: "10px",
            letterSpacing: "1px",
            color: "#2e7d32",
            marginBottom: "20px",
          }}
        >
          Persönliche Beratung
        </span>

        {/* Título */}
        <h2
          className="font-display"
          style={{
            fontSize: "clamp(26px, 5vw, 36px)",
            fontWeight: 800,
            color: "#1a1a1a",
            marginBottom: "12px",
            lineHeight: 1.2,
          }}
        >
          Persönliche Unterkunft-Beratung
        </h2>

        {/* Subtítulo */}
        <p
          style={{
            fontSize: "16px",
            color: "#555",
            lineHeight: 1.6,
            maxWidth: "560px",
            margin: "0 auto 20px",
          }}
        >
          60 Minuten mit Will per Videocall — sichere Unterkunft finden, Routen
          planen und alle deine Fragen beantwortet. Von einem Carioca, der
          fließend Deutsch spricht.
        </p>

        {/* Pills de características */}
        <div
          className="flex justify-center flex-wrap"
          style={{ gap: "10px", marginBottom: "32px" }}
        >
          {["60 Minuten", "Videocall", "Personalisiert", "Auf Deutsch"].map((label) => (
            <span
              key={label}
              style={{
                background: "#e8f5e9",
                color: "#0f4a2c",
                borderRadius: "999px",
                padding: "5px 14px",
                fontSize: "11px",
                fontWeight: 600,
              }}
            >
              {label}
            </span>
          ))}
        </div>

        {/* Botões */}
        <div className="flex justify-center flex-wrap" style={{ gap: "16px" }}>
          <a
            href="https://riofuerdeutsche.de/unterkunft/beratung"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              background: "#0d1f15",
              color: "#f8f5f0",
              fontSize: "15px",
              fontWeight: 700,
              padding: "14px 28px",
              borderRadius: "999px",
              border: "none",
              textDecoration: "none",
              whiteSpace: "nowrap",
            }}
          >
            📞 Beratung buchen
          </a>
          <a
            href="https://riofuerdeutsche.de/unterkunft/beratung#details"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              background: "transparent",
              color: "#0d1f15",
              fontSize: "15px",
              fontWeight: 600,
              padding: "14px 28px",
              borderRadius: "999px",
              border: "1px solid #0d1f15",
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

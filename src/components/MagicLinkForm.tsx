"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { Shield, ArrowRight, CheckCircle2 } from "lucide-react";
import Link from "next/link";

interface MagicLinkFormProps {
  variant: "inline1" | "inline2" | "final";
}

export default function MagicLinkForm({
  variant,
}: MagicLinkFormProps) {
  const [email, setEmail] = useState("");
  const [vorname, setVorname] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const supabase = createClient();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setIsAuthenticated(!!user);
    };
    checkUser();
  }, [supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          data: { first_name: vorname },
          emailRedirectTo: `${window.location.origin}/guide/sicherheit`,
        },
      });

      if (error) {
        setErrorMsg(error.message);
      } else {
        setSuccess(true);
      }
    } catch (err: unknown) {
      const errorMsgDetails = err instanceof Error ? err.message : "Ein Fehler ist aufgetreten. Bitte versuche es später noch einmal.";
      setErrorMsg(errorMsgDetails);
    } finally {
      setLoading(false);
    }
  };

  const getVariantContent = () => {
    switch (variant) {
      case "inline1":
        return {
          icon: <Shield className="w-10 h-10 text-[#0d1f15] mb-4" />,
          headline: "Willst du die vollständigen Tipps zu jedem dieser 7 Fehler?",
          subtext: "Trag deinen Namen und deine E-Mail ein — wir schicken dir sofort einen Zugangslink. Kein Passwort nötig.",
          submitText: "Kostenlosen Zugang sichern",
          trustText: "Kein Passwort. Kein Spam. Jederzeit abmeldbar.",
          containerStyle: "bg-rio-yellow p-8 md:p-10 rounded-3xl shadow-lg border border-yellow-300",
          headlineStyle: "text-2xl md:text-3xl font-bold text-[#0d1f15] mb-3",
        };
      case "inline2":
        return {
          icon: null,
          headline: "Die kompletten 15 Regeln — kostenlos",
          subtext: "Melde dich an und erhalte sofort Zugang zur vollständigen Sicherheits-Sektion im Rio für Deutsche Guide.",
          submitText: "Jetzt kostenlos anmelden",
          trustText: "Kein Passwort. Kein Spam. Jederzeit abmeldbar.",
          containerStyle: "bg-rio-yellow p-8 md:p-10 rounded-3xl shadow-lg border border-yellow-300",
          headlineStyle: "text-2xl md:text-3xl font-bold text-[#0d1f15] mb-3",
        };
      case "final":
        return {
          icon: null,
          headline: "Rio wartet auf dich. Geh vorbereitet hin.",
          subtext: "Alles was du brauchst, um sicher und selbstbewusst durch Rio zu reisen — kostenlos, in einem Guide, von einem Carioca der fließend Deutsch spricht.",
          submitText: "Kostenlosen Sicherheits-Guide sichern",
          trustText: "Kein Passwort. Kein Spam. Sofortiger Zugang per E-Mail.",
          containerStyle: "bg-rio-yellow p-10 md:p-14 rounded-3xl w-full shadow-xl border border-yellow-300",
          headlineStyle: "text-3xl md:text-5xl font-bold text-[#0d1f15] mb-4 tracking-tight",
        };
    }
  };

  const content = getVariantContent();

  if (isAuthenticated) {
    return (
      <div className={`${content.containerStyle} text-center flex flex-col items-center justify-center`}>
        {content.icon}
        <h3 className={content.headlineStyle}>{content.headline}</h3>
        <p className="text-[#0d1f15]/80 text-lg mb-8 max-w-lg mx-auto">{content.subtext}</p>
        <Link
          href="/guide/sicherheit"
          className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#0d1f15] text-white rounded-full font-bold text-lg hover:bg-[#1a3826] hover:scale-[1.02] transition-all shadow-md"
        >
          Zum Guide (/guide/sicherheit)
          <ArrowRight className="w-5 h-5" />
        </Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className={`${content.containerStyle} text-center flex flex-col items-center justify-center`}>
        <CheckCircle2 className="w-16 h-16 text-[#0d1f15] mb-6" />
        <h3 className="text-3xl font-bold text-[#0d1f15] mb-3">Fast geschafft!</h3>
        <p className="text-[#0d1f15]/80 text-lg">
          Wir haben dir einen Zugangslink an <span className="font-bold text-[#0d1f15]">{email}</span> geschickt. Schau in dein Postfach.
        </p>
      </div>
    );
  }

  return (
    <div className={content.containerStyle}>
      <div className="flex flex-col items-center text-center max-w-2xl mx-auto">
        {content.icon}
        <h3 className={content.headlineStyle}>{content.headline}</h3>
        <p className="text-[#0d1f15]/80 text-lg mb-8">{content.subtext}</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-md w-full">
          {errorMsg && (
            <div className="p-4 bg-red-100 border border-red-300 rounded-xl text-red-800 text-sm font-medium">
              {errorMsg}
            </div>
          )}

          <div className="flex flex-col gap-3">
            <input
              type="text"
              required
              placeholder="Vorname"
              value={vorname}
              onChange={(e) => setVorname(e.target.value)}
              disabled={loading}
              className="w-full px-5 py-4 rounded-2xl bg-white border border-transparent text-[#0d1f15] text-lg placeholder:text-gray-400 focus:outline-none focus:ring-4 focus:ring-[#0d1f15]/20 focus:border-[#0d1f15] transition-all"
            />
            <input
              type="email"
              required
              placeholder="E-Mail-Adresse"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              className="w-full px-5 py-4 rounded-2xl bg-white border border-transparent text-[#0d1f15] text-lg placeholder:text-gray-400 focus:outline-none focus:ring-4 focus:ring-[#0d1f15]/20 focus:border-[#0d1f15] transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex md:mt-2 items-center justify-center gap-2 px-8 py-4 bg-[#0d1f15] text-white rounded-full font-bold text-xl hover:bg-[#1a3826] hover:scale-[1.02] transition-all shadow-lg disabled:opacity-70 disabled:hover:scale-100"
          >
            {loading ? "Wird gesendet..." : content.submitText}
            {!loading && <ArrowRight className="w-6 h-6" />}
          </button>

          <p className="text-sm font-medium text-[#0d1f15]/60 mt-3">
            {content.trustText}
          </p>
        </form>
      </div>
    </div>
  );
}

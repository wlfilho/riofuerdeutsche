"use client";

import { useState, useEffect, Suspense } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import AuthLayout from "@/components/AuthLayout";
import { m, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import { Loader2, AlertCircle, CheckCircle2, ArrowLeft } from "lucide-react";

/** Mínimo do Supabase Auth por padrão; validamos no cliente para dar erro traduzido. */
const MIN_PASSWORT_LAENGE = 6;

function UpdatePasswordForm() {
    const t = useTranslations("public.auth");
    const searchParams = useSearchParams();
    // O /auth/callback marca assim quando o exchangeCodeForSession falha (link
    // expirado ou já usado) — nesse caso nem chegou a existir sessão.
    const linkExpired = searchParams.get("error") === "expired";
    const [password, setPassword] = useState("");
    const [passwordConfirm, setPasswordConfirm] = useState("");
    const [loading, setLoading] = useState(false);
    const [done, setDone] = useState(false);
    // null = ainda verificando a sessão vinda do link de recuperação.
    const [hasSession, setHasSession] = useState<boolean | null>(null);
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
    const router = useRouter();
    const supabase = createClient();

    /**
     * O /auth/callback troca o code por sessão ANTES de redirecionar para cá, então
     * aqui basta confirmar que ela existe. Sem sessão o updateUser falharia no submit
     * com um erro cru — melhor dizer de cara que o link expirou e oferecer um novo.
     */
    useEffect(() => {
        if (linkExpired) {
            setHasSession(false);
            return;
        }
        let active = true;
        supabase.auth.getUser().then(({ data }) => {
            if (active) setHasSession(!!data.user);
        });
        return () => {
            active = false;
        };
    }, [supabase, linkExpired]);

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);

        if (password.length < MIN_PASSWORT_LAENGE) {
            setMessage({ type: "error", text: t("updatePassword.zuKurz", { min: MIN_PASSWORT_LAENGE }) });
            return;
        }

        if (password !== passwordConfirm) {
            setMessage({ type: "error", text: t("updatePassword.stimmenNichtUeberein") });
            return;
        }

        setLoading(true);

        try {
            const { error } = await supabase.auth.updateUser({ password });
            if (error) throw error;

            setDone(true);
            setMessage({ type: "success", text: t("updatePassword.erfolgreich") });

            // A sessão do link de recuperação já está ativa e a senha agora é a nova;
            // mandamos direto para a área de membros em vez de exigir novo login.
            const { data: profile } = await supabase
                .from("profiles")
                .select("role")
                .eq("id", (await supabase.auth.getUser()).data.user?.id ?? "")
                .single();

            setTimeout(() => {
                router.push(profile?.role === "admin" ? "/admin" : "/dashboard");
            }, 1500);
        } catch {
            setMessage({ type: "error", text: t("updatePassword.fehler") });
            setLoading(false);
        }
    };

    if (hasSession === null) {
        return (
            <AuthLayout title={t("updatePassword.titel")}>
                <div className="flex justify-center py-6">
                    <Loader2 className="h-6 w-6 animate-spin text-rio-green" />
                </div>
            </AuthLayout>
        );
    }

    if (!hasSession) {
        return (
            <AuthLayout title={t("updatePassword.titel")} subtitle={t("updatePassword.linkAbgelaufenUntertitel")}>
                <div className="space-y-6">
                    <div className="p-3 rounded-lg flex items-center gap-2 text-sm bg-red-50 text-red-700 border border-red-200">
                        <AlertCircle className="h-5 w-5 shrink-0" />
                        <span className="leading-tight">{t("updatePassword.linkAbgelaufen")}</span>
                    </div>
                    <Link
                        href="/forgot-password"
                        className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-md text-sm font-bold text-white bg-rio-green hover:bg-rio-green-light transition-all"
                    >
                        {t("updatePassword.neuenLinkAnfordern")}
                    </Link>
                    <div className="text-center pt-2">
                        <Link
                            href="/login"
                            className="inline-flex items-center text-sm font-bold text-gray-900 hover:text-rio-green transition-colors gap-1"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            {t("zurueckZurAnmeldung")}
                        </Link>
                    </div>
                </div>
            </AuthLayout>
        );
    }

    return (
        <AuthLayout title={t("updatePassword.titel")} subtitle={t("updatePassword.untertitel")}>
            <form onSubmit={handleUpdate} className="space-y-6">
                <AnimatePresence mode="wait">
                    {message && (
                        <m.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className={`p-3 rounded-lg flex items-center gap-2 text-sm ${message.type === "success"
                                ? "bg-green-50 text-green-700 border border-green-200"
                                : "bg-red-50 text-red-700 border border-red-200"
                                }`}
                        >
                            {message.type === "success" ? (
                                <CheckCircle2 className="h-5 w-5 shrink-0" />
                            ) : (
                                <AlertCircle className="h-5 w-5 shrink-0" />
                            )}
                            <span className="leading-tight">{message.text}</span>
                        </m.div>
                    )}
                </AnimatePresence>

                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                        {t("updatePassword.neuesPasswort")}
                    </label>
                    <input
                        id="password"
                        type="password"
                        required
                        autoComplete="new-password"
                        disabled={done}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-rio-green focus:border-rio-green sm:text-sm transition-all disabled:bg-gray-50"
                        placeholder={t("passwortPlaceholder")}
                    />
                    <p className="mt-1 text-xs text-gray-500">
                        {t("updatePassword.hinweis", { min: MIN_PASSWORT_LAENGE })}
                    </p>
                </div>

                <div>
                    <label htmlFor="passwordConfirm" className="block text-sm font-medium text-gray-700">
                        {t("updatePassword.passwortBestaetigen")}
                    </label>
                    <input
                        id="passwordConfirm"
                        type="password"
                        required
                        autoComplete="new-password"
                        disabled={done}
                        value={passwordConfirm}
                        onChange={(e) => setPasswordConfirm(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-rio-green focus:border-rio-green sm:text-sm transition-all disabled:bg-gray-50"
                        placeholder={t("passwortPlaceholder")}
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading || done}
                    className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-md text-sm font-bold text-white bg-rio-green hover:bg-rio-green-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rio-green transition-all disabled:opacity-50 disabled:cursor-not-allowed items-center gap-2"
                >
                    {loading ? (
                        <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            {t("updatePassword.wirdGespeichert")}
                        </>
                    ) : (
                        t("updatePassword.speichern")
                    )}
                </button>
            </form>
        </AuthLayout>
    );
}

export default function UpdatePasswordPage() {
    // useSearchParams exige um boundary de Suspense no App Router.
    return (
        <Suspense fallback={null}>
            <UpdatePasswordForm />
        </Suspense>
    );
}

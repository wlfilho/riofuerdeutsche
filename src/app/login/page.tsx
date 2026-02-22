"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AuthLayout from "@/components/AuthLayout";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
    const router = useRouter();
    const supabase = createClient();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                if (error.message.includes("Email not confirmed")) {
                    setMessage({
                        type: "error",
                        text: "Deine E-Mail wurde noch nicht bestätigt. Bitte überprüfe deinen Posteingang oder klicke unten, um den Link erneut zu senden."
                    });
                } else {
                    throw error;
                }
            } else {
                setMessage({ type: "success", text: "Login erfolgreich! Leite weiter..." });
                setTimeout(() => router.push("/dashboard"), 1500);
            }
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : "Fehler bei der Anmeldung.";
            setMessage({ type: "error", text: errorMessage });
        } finally {
            setLoading(false);
        }
    };

    const handleResendEmail = async () => {
        if (!email) {
            setMessage({ type: "error", text: "Bitte gib zuerst deine E-Mail ein." });
            return;
        }
        setLoading(true);
        const { error } = await supabase.auth.resend({
            type: 'signup',
            email: email,
        });
        setLoading(false);
        if (error) {
            setMessage({ type: "error", text: error.message });
        } else {
            setMessage({ type: "success", text: "Bestätigungs-E-Mail gesendet!" });
        }
    };

    return (
        <AuthLayout title="Willkommen zurück" subtitle="Melde dich an, um fortzufahren">
            <form onSubmit={handleLogin} className="space-y-6">
                <AnimatePresence mode="wait">
                    {message && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="space-y-2"
                        >
                            <div
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
                                <span>{message.text}</span>
                            </div>
                            {message.type === "error" && message.text.includes("nicht bestätigt") && (
                                <button
                                    type="button"
                                    onClick={handleResendEmail}
                                    className="text-xs font-semibold text-rio-green underline underline-offset-2 hover:text-rio-green-light block mx-auto py-1"
                                >
                                    Bestätigungslink erneut senden
                                </button>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>

                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                        E-Mail
                    </label>
                    <input
                        id="email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-rio-green focus:border-rio-green sm:text-sm transition-all"
                        placeholder="deine@email.de"
                    />
                </div>

                <div>
                    <label htmlFor="password" title="password" className="block text-sm font-medium text-gray-700">
                        Passwort
                    </label>
                    <input
                        id="password"
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-rio-green focus:border-rio-green sm:text-sm transition-all"
                        placeholder="••••••••"
                    />
                </div>

                <div className="flex items-center justify-between">
                    <div className="text-sm">
                        <Link
                            href="/forgot-password"
                            className="font-medium text-gray-600 hover:text-rio-green transition-colors"
                        >
                            Passwort vergessen?
                        </Link>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-md text-sm font-bold text-white bg-rio-green hover:bg-rio-green-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rio-green transition-all disabled:opacity-50 disabled:cursor-not-allowed items-center gap-2"
                >
                    {loading ? (
                        <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Anmelden...
                        </>
                    ) : (
                        "Anmelden"
                    )}
                </button>

                <div className="text-center text-sm pt-2">
                    <span className="text-gray-500">Noch kein Konto? </span>
                    <Link
                        href="/signup"
                        className="font-bold text-gray-900 hover:text-rio-green transition-colors"
                    >
                        Registrieren
                    </Link>
                </div>
            </form>
        </AuthLayout>
    );
}

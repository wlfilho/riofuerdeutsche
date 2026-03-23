"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthLayout from "@/components/AuthLayout";
import { m, AnimatePresence } from "framer-motion";
import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react";

export default function SignupPage() {
    const router = useRouter();
    const [firstName, setFirstName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
    const supabase = createClient();

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        try {
            const { error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        first_name: firstName,
                    },
                    emailRedirectTo: `${window.location.origin}/auth/callback`,
                },
            });

            if (error) throw error;

            setMessage({
                type: "success",
                text: "Konto erfolgreich erstellt! Willkommen im Rio-Guide."
            });

            setTimeout(() => {
                router.push('/dashboard');
            }, 1500);
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : "Fehler bei der Kontoerstellung.";
            setMessage({ type: "error", text: errorMessage });
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout title="Konto erstellen" subtitle="In wenigen Sekunden dabei sein">
            <form onSubmit={handleSignup} className="space-y-6">
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
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                        Vorname
                    </label>
                    <input
                        id="firstName"
                        type="text"
                        required
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-rio-green focus:border-rio-green sm:text-sm transition-all"
                        placeholder="z.B. Sarah"
                    />
                </div>

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

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-md text-sm font-bold text-white bg-rio-green hover:bg-rio-green-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rio-green transition-all disabled:opacity-50 disabled:cursor-not-allowed items-center gap-2"
                >
                    {loading ? (
                        <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Konto wird erstellt...
                        </>
                    ) : (
                        "Registrieren"
                    )}
                </button>

                <div className="text-center text-sm pt-2">
                    <span className="text-gray-500">Bereits ein Konto? </span>
                    <Link
                        href="/login"
                        className="font-bold text-gray-900 hover:text-rio-green transition-colors"
                    >
                        Anmelden
                    </Link>
                </div>
            </form>
        </AuthLayout>
    );
}

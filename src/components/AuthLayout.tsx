"use client";

import { m } from "framer-motion";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { ArrowLeft, MapPin } from "lucide-react";

export default function AuthLayout({
    children,
    title,
    subtitle,
}: {
    children: React.ReactNode;
    title: string;
    subtitle?: string;
}) {
    const t = useTranslations("public.auth");

    return (
        <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-rio-sand selection:bg-rio-green selection:text-white">
            <div className="absolute top-6 left-6 z-10">
                <Link href="/" className="inline-flex items-center gap-2 text-gray-600 hover:text-rio-green transition-colors text-sm font-medium">
                    <ArrowLeft className="w-4 h-4" />
                    {t("zurueckZurStartseite")}
                </Link>
            </div>

            <m.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="sm:mx-auto sm:w-full sm:max-w-md flex flex-col items-center"
            >
                <Link href="/" className="font-heading font-black text-3xl tracking-tight text-rio-green flex items-center gap-2 mb-8 group">
                    <MapPin className="h-8 w-8 text-rio-yellow group-hover:-translate-y-1 transition-transform" />
                    <span>Rio<span className="text-rio-blue font-light">FürDeutsche</span></span>
                </Link>

                <h2 className="text-center text-3xl font-heading font-extrabold text-gray-900 tracking-tight">
                    {title}
                </h2>
                {subtitle && (
                    <p className="mt-2 text-center text-sm text-gray-600">
                        {subtitle}
                    </p>
                )}
            </m.div>

            <m.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="mt-8 sm:mx-auto sm:w-full sm:max-w-md"
            >
                <div className="bg-white py-8 px-4 shadow-2xl shadow-rio-green/5 border border-gray-100 sm:rounded-3xl sm:px-10">
                    {children}
                </div>
            </m.div>
        </div>
    );
}

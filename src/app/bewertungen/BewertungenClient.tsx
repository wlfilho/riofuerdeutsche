'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations, useLocale } from "next-intl";
import { createClient } from "@/utils/supabase/client";
import { Star, ArrowRight, Loader2, MessageCircle, Mail } from "lucide-react";
import Link from "next/link";
import ReviewCard, { Review } from "@/components/ReviewCard";

interface BewertungenClientProps {
    whatsappHref: string;
    /** Id da review pra rolar até ela e destacar — vem da rota /bewertungen/[id]. */
    highlightId?: string;
}

export default function BewertungenClient({ whatsappHref, highlightId }: BewertungenClientProps) {
    const t = useTranslations('public.bewertungen');
    const locale = useLocale();
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [highlightedId, setHighlightedId] = useState<string | null>(null);

    const supabase = createClient();

    const fetchReviews = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('reviews')
            .select('id, created_at, nickname, rating, title, body, attractions, photo_urls, will_photo_urls, consent_own_photos, consent_will_photos')
            .eq('status', 'approved')
            .order('approved_at', { ascending: false });

        if (error) {
            console.error('Error fetching reviews:', error);
        } else {
            setReviews(data || []);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchReviews();
    }, []);

    // Link direto pra uma review (/bewertungen/[id]): rola até o card e destaca
    // por alguns segundos, assim que a lista carrega.
    useEffect(() => {
        if (!highlightId || loading || reviews.length === 0) return;
        const el = document.getElementById(`review-${highlightId}`);
        if (!el) return;
        const timer = setTimeout(() => {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            setHighlightedId(highlightId);
        }, 150);
        return () => clearTimeout(timer);
    }, [highlightId, loading, reviews.length]);

    useEffect(() => {
        if (!highlightedId) return;
        const timer = setTimeout(() => setHighlightedId(null), 3000);
        return () => clearTimeout(timer);
    }, [highlightedId]);

    const hasReviews = reviews.length > 0;
    const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0) || 0;
    // Sempre 1 casa decimal (nota 5 vira "5,0", não "5") com o separador do
    // locale — antes usava toFixed(1) e mostrava "4.8" com ponto pro alemão.
    const avgRating = hasReviews
        ? new Intl.NumberFormat(locale, {
              minimumFractionDigits: 1,
              maximumFractionDigits: 1,
          }).format(totalRating / reviews.length)
        : 0;
    const reviewCount = reviews.length || 0;

    return (
        <>
            {/* Hero */}
            <div className="bg-white border-b border-gray-200 pt-36 pb-16 px-4">
                <div className="max-w-4xl mx-auto text-center">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6">
                        {t('heroTitle')}
                    </h1>
                    <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
                        {t('heroSubtitle')}
                    </p>

                    {!loading && hasReviews && (
                        <div className="flex flex-col items-center gap-2">
                            <div className="flex items-center gap-1.5 bg-yellow-50 px-6 py-3 rounded-full border border-yellow-100 shadow-sm">
                                <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                                <span className="text-xl font-bold text-gray-900">{avgRating}</span>
                                <span className="text-gray-400 font-medium">{t('outOfFive')}</span>
                                <span className="mx-2 text-gray-300">·</span>
                                <span className="text-gray-700 font-medium">{t('reviewCount', { count: String(reviewCount) })}</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Content */}
            <main className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8 min-h-[500px]">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                        <Loader2 className="w-10 h-10 animate-spin mb-4" />
                        <p className="font-medium">{t('loading')}</p>
                    </div>
                ) : !hasReviews ? (
                    <div className="text-center py-20 bg-white rounded-3xl border border-gray-200 shadow-sm max-w-2xl mx-auto px-6">
                        <div className="flex justify-center mb-6">
                            <Star className="w-20 h-20 text-gray-200" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">
                            {t('emptyTitle')}
                        </h2>
                        <p className="text-gray-500 mb-8">{t('emptySubtitle')}</p>
                        <Link
                            href="/bewertung-schreiben"
                            className="inline-flex items-center justify-center bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-3.5 px-8 rounded-xl transition-all shadow-sm hover:shadow-lg group"
                        >
                            {t('writeReview')}
                            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                ) : (
                    <div className="flex flex-col gap-6 max-w-5xl mx-auto">
                        {reviews.map((review) => (
                            <div
                                key={review.id}
                                id={`review-${review.id}`}
                                className={`rounded-2xl transition-shadow duration-700 ${
                                    highlightedId === review.id ? 'ring-2 ring-yellow-400 ring-offset-4 ring-offset-gray-50' : ''
                                }`}
                            >
                                <ReviewCard
                                    review={review}
                                    layout="horizontal"
                                />
                            </div>
                        ))}
                    </div>
                )}

                {/* Final CTA */}
                {!loading && hasReviews && (
                    <div className="mt-20 rounded-3xl overflow-hidden shadow-xl">
                        <div className="bg-rio-yellow px-8 py-14 md:px-16 md:py-16 text-center">
                            <p className="text-gray-900/60 text-xs font-extrabold uppercase tracking-[3px] mb-4">
                                Rio de Janeiro auf Deutsch
                            </p>
                            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 leading-tight mb-5 max-w-2xl mx-auto">
                                Erlebe Rio mit einem Guide, dem du vertrauen kannst.
                            </h2>
                            <p className="text-gray-800 text-base leading-relaxed max-w-xl mx-auto mb-10">
                                Die Erfahrungen unserer Gäste sprechen für sich. Mit Will erkundest du Rio auf Deutsch — sicher, authentisch und unvergesslich. Kein Touristenpfad, sondern echtes Rio.
                            </p>

                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                <a
                                    href={whatsappHref}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-gray-900 text-white rounded-full font-bold text-lg hover:bg-gray-800 hover:scale-[1.02] transition-all shadow-xl shadow-black/20"
                                >
                                    <MessageCircle className="w-5 h-5" />
                                    {t('ctaWhatsApp')}
                                </a>
                                <Link
                                    href="/kontakt"
                                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-gray-900 rounded-full font-bold text-lg hover:bg-gray-50 hover:scale-[1.02] transition-all shadow-xl shadow-black/10"
                                >
                                    <Mail className="w-5 h-5" />
                                    {t('ctaEmail')}
                                </Link>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </>
    );
}

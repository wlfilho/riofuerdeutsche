'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from "next-intl";
import { createClient } from "@/utils/supabase/client";
import { Star, ArrowRight, X, ChevronLeft, ChevronRight, Loader2, MessageCircle, Mail } from "lucide-react";
import Link from "next/link";
import ReviewCard, { Review } from "@/components/ReviewCard";

export default function BewertungenClient({ whatsappHref }: { whatsappHref: string }) {
    const t = useTranslations('public.bewertungen');
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [lightbox, setLightbox] = useState<{ photos: string[]; index: number } | null>(null);

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

    const openLightbox = (photos: string[]) => setLightbox({ photos, index: 0 });
    const closeLightbox = () => setLightbox(null);
    const next = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        setLightbox(prev =>
            prev ? { ...prev, index: (prev.index + 1) % prev.photos.length } : null
        );
    };
    const prev = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        setLightbox(prev =>
            prev ? { ...prev, index: (prev.index - 1 + prev.photos.length) % prev.photos.length } : null
        );
    };

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (!lightbox) return;
            if (e.key === 'Escape') closeLightbox();
            if (e.key === 'ArrowRight') next();
            if (e.key === 'ArrowLeft') prev();
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [lightbox]);

    const hasReviews = reviews.length > 0;
    const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0) || 0;
    const avgRating = hasReviews ? (totalRating / reviews.length).toFixed(1) : 0;
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {reviews.map((review) => (
                            <ReviewCard
                                key={review.id}
                                review={review}
                                onOpenPhotos={openLightbox}
                            />
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

            {/* Lightbox UI */}
            {lightbox && (
                <div
                    className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center animate-in fade-in duration-300"
                    onClick={closeLightbox}
                >
                    <div
                        className="relative max-w-5xl max-h-[90vh] mx-4"
                        onClick={e => e.stopPropagation()}
                    >
                        <img
                            src={lightbox.photos[lightbox.index]}
                            alt={t('photoAlt', { n: String(lightbox.index + 1) })}
                            className="max-h-[85vh] max-w-full object-contain rounded-lg shadow-2xl transition-all duration-300 transform scale-100"
                        />

                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2
                            bg-black/60 backdrop-blur-md text-white text-xs px-4 py-1.5 rounded-full font-bold">
                            {lightbox.index + 1} / {lightbox.photos.length}
                        </div>

                        {lightbox.photos.length > 1 && (
                            <>
                                <button onClick={prev}
                                    className="absolute left-4 top-1/2 -translate-y-1/2
                                        bg-white/10 hover:bg-white/20 backdrop-blur-md text-white rounded-full
                                        w-12 h-12 flex items-center justify-center transition-all border border-white/20 hover:scale-110 active:scale-95 group">
                                    <ChevronLeft className="w-6 h-6" />
                                </button>
                                <button onClick={next}
                                    className="absolute right-4 top-1/2 -translate-y-1/2
                                        bg-white/10 hover:bg-white/20 backdrop-blur-md text-white rounded-full
                                        w-12 h-12 flex items-center justify-center transition-all border border-white/20 hover:scale-110 active:scale-95 group">
                                    <ChevronRight className="w-6 h-6" />
                                </button>
                            </>
                        )}
                    </div>

                    <button onClick={closeLightbox}
                        className="absolute top-6 right-6 text-white/50 hover:text-white transition-all hover:scale-110 active:scale-90 p-2">
                        <X className="w-8 h-8" />
                    </button>

                    <p className="absolute bottom-6 left-6 text-white/30 text-[10px] uppercase font-bold tracking-[2px]">
                        {t('galleryLabel')}
                    </p>
                </div>
            )}
        </>
    );
}

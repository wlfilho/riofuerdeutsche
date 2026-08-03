'use client';

import React, { useState } from 'react';
import { Star, ChevronDown, ChevronUp } from 'lucide-react';
import { useLocale } from 'next-intl';

export interface Review {
    id: string;
    created_at: string;
    attractions?: string[];
    nickname: string;
    rating: number;
    title: string;
    body: string;
    photo_urls?: string[];
    will_photo_urls?: string[];
    consent_own_photos?: boolean;
    consent_will_photos?: boolean;
}

interface ReviewCardProps {
    review: Review;
    onOpenPhotos?: (photos: string[]) => void;
}

export default function ReviewCard({ review, onOpenPhotos }: ReviewCardProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const locale = useLocale();
    const date = new Date(review.created_at);
    // "März 2026": formato mês+ano não é coberto por format.ts, então o Intl
    // fica aqui — mas com o locale do contexto, não fixo.
    const formattedDate = new Intl.DateTimeFormat(locale, {
        month: 'long',
        year: 'numeric'
    }).format(date);

    const isLongText = review.body.length > 300;
    const displayText = isExpanded ? review.body : review.body.slice(0, 300);

    const getPublicPhotos = (review: Review) => {
        const photos: string[] = [];
        if (review.consent_own_photos) photos.push(...(review.photo_urls ?? []));
        if (review.consent_will_photos) photos.push(...(review.will_photo_urls ?? []));
        return photos;
    };

    const publicPhotos = getPublicPhotos(review);

    return (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col h-full font-sans group relative">

            {/* Top: Name + Stars */}
            <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                    <span className="font-bold text-gray-900 text-lg leading-tight block">{review.nickname}</span>
                    <span className="text-gray-400 text-sm">{formattedDate}</span>
                </div>
                <div className="flex gap-0.5 shrink-0 mt-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                            key={star}
                            className={`w-4 h-4 ${star <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`}
                        />
                    ))}
                </div>
            </div>

            <hr className="border-gray-100 my-4" />

            {/* Title */}
            <h3 className="text-xl font-bold text-gray-900 mb-3 leading-snug">
                {review.title}
            </h3>

            {/* Body */}
            <div className="flex-grow">
                <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                    {displayText}{!isExpanded && isLongText && '...'}
                </p>
                {isLongText && (
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="inline-flex items-center gap-1 mt-4 px-3.5 py-1.5 rounded-full border border-gray-200 text-xs font-bold text-gray-500 hover:border-yellow-300 hover:text-yellow-700 hover:bg-yellow-50 transition-all"
                    >
                        {isExpanded ? (
                            <><ChevronUp className="w-3.5 h-3.5" />Weniger lesen</>
                        ) : (
                            <><ChevronDown className="w-3.5 h-3.5" />Mehr lesen</>
                        )}
                    </button>
                )}
            </div>

            {/* Footer: Attractions + Thumbnails */}
            <div className="mt-6 pt-6 border-t border-gray-50 flex items-center justify-between gap-4">
                {review.attractions && review.attractions.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                        {review.attractions.map(att => (
                            <span key={att} className="px-2.5 py-1 bg-yellow-50 text-yellow-700 text-[10px] font-bold rounded-full border border-yellow-100 uppercase tracking-wide">
                                {att}
                            </span>
                        ))}
                    </div>
                ) : <div />}

                {/* Photo thumbnails */}
                {publicPhotos.length > 0 && onOpenPhotos && (
                    <button
                        onClick={() => onOpenPhotos(publicPhotos)}
                        className="flex items-center gap-1 shrink-0 active:scale-95 transition-transform"
                        aria-label={`${publicPhotos.length} Fotos anzeigen`}
                    >
                        {publicPhotos.slice(0, 3).map((url, i) => {
                            const isLast = i === 2 && publicPhotos.length > 3;
                            return (
                                <div key={i} className="relative w-10 h-10 rounded-lg overflow-hidden border border-gray-100 shadow-sm">
                                    <img src={url} alt="" className="w-full h-full object-cover" />
                                    {isLast && (
                                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                            <span className="text-white text-[11px] font-bold">+{publicPhotos.length - 3}</span>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </button>
                )}
            </div>
        </div>
    );
}

'use client';

import React, { useState } from 'react';
import { Star, ChevronDown, ChevronUp } from 'lucide-react';

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
    
    // Formatar data: Mês / Ano
    const date = new Date(review.created_at);
    const formattedDate = date.toLocaleDateString('de-DE', {
        month: 'long',
        year: 'numeric'
    });

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
            
            {/* Top Header: Stars + Photo Button */}
            <div className="flex justify-between items-start mb-4">
                {/* Stars */}
                <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                            key={star}
                            className={`w-5 h-5 ${
                                star <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'
                            }`}
                        />
                    ))}
                </div>

                {/* Photo thumbnails (top right) */}
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
                                    <img
                                        src={url}
                                        alt=""
                                        className="w-full h-full object-cover"
                                    />
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

            {/* Title */}
            <h3 className="text-xl font-bold text-gray-900 mb-3 leading-snug">
                {review.title}
            </h3>

            {/* Body */}
            <div className="flex-grow">
                <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                    {displayText}
                    {!isExpanded && isLongText && "..."}
                </p>
                
                {isLongText && (
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="inline-flex items-center text-sm font-semibold text-gray-900 hover:text-gray-600 transition-colors mt-4 group/btn"
                    >
                        {isExpanded ? (
                            <>
                                Weniger lesen
                                <ChevronUp className="ml-1 w-4 h-4 group-hover/btn:-translate-y-0.5 transition-transform" />
                            </>
                        ) : (
                            <>
                                Mehr lesen
                                <ChevronDown className="ml-1 w-4 h-4 group-hover/btn:translate-y-0.5 transition-transform" />
                            </>
                        )}
                    </button>
                )}
            </div>

            {/* Footer */}
            <div className="mt-6 pt-6 border-t border-gray-50 flex items-center justify-between gap-4 flex-wrap">
                <div className="flex flex-col">
                    <span className="font-bold text-gray-800 text-lg">{review.nickname}</span>
                    <span className="text-gray-400 text-sm">{formattedDate}</span>
                </div>
                
                {/* Attractions Badge */}
                {review.attractions && review.attractions.length > 0 && (
                    <div className="px-3.5 py-1.5 bg-yellow-50 text-yellow-700 text-[10px] font-bold rounded-full border border-yellow-200 uppercase tracking-wider">
                        {review.attractions.length > 1 
                          ? `${review.attractions[0]} +${review.attractions.length - 1}`
                          : review.attractions[0]
                        }
                    </div>
                )}
            </div>
        </div>
    );
}

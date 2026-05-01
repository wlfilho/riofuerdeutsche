'use client';

import React from 'react';
import { Star } from 'lucide-react';

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
    const date = new Date(review.created_at);
    const formattedDate = date.toLocaleDateString('de-DE', {
        month: 'long',
        year: 'numeric'
    });

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

            {/* Title */}
            <h3 className="text-xl font-bold text-gray-900 mb-3 leading-snug">
                {review.title}
            </h3>

            {/* Body */}
            <div className="flex-grow">
                <p className="text-gray-600 leading-relaxed whitespace-pre-line line-clamp-5">
                    {review.body}
                </p>
            </div>

            {/* Footer: Attractions + Thumbnails */}
            <div className="mt-6 pt-6 border-t border-gray-50 flex items-center justify-between gap-4">
                {review.attractions && review.attractions.length > 0 ? (
                    <div className="px-3.5 py-1.5 bg-yellow-50 text-yellow-700 text-[10px] font-bold rounded-full border border-yellow-200 uppercase tracking-wider">
                        {review.attractions.length > 1
                            ? `${review.attractions[0]} +${review.attractions.length - 1}`
                            : review.attractions[0]}
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

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Star, ChevronDown, ChevronUp, Images } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { getPublicReviewPhotos, getReviewAvatarUrl } from '@/lib/reviewPhotos';

// Só os pontos do Rio-Guide que realmente existem como página hoje — os
// outros itens da lista de atrações da review (ver ATTRACTIONS em
// bewertung-schreiben/ReviewFormInline.tsx) não têm página própria ainda,
// então o badge fica sem link em vez de apontar pra algo que não existe.
const ATTRACTION_LINKS: Record<string, string> = {
    'Christus-Erlöser': '/rio-guide/sehenswuerdigkeiten/christus-erloeser',
    'Escadaria Selarón': '/rio-guide/sehenswuerdigkeiten/escadaria-selaron',
    'Favela Rocinha': '/rio-guide/sehenswuerdigkeiten/rocinha',
    'Zuckerhut': '/rio-guide/sehenswuerdigkeiten/zuckerhut',
};

function AttractionBadge({ name }: { name: string }) {
    const href = ATTRACTION_LINKS[name];
    const className = `px-2.5 py-1 bg-yellow-50 text-yellow-700 text-[10px] font-bold rounded-full border border-yellow-100 uppercase tracking-wide${href ? ' hover:bg-yellow-100 hover:border-yellow-300 transition-colors' : ''}`;
    if (href) {
        return <Link href={href} className={className}>{name}</Link>;
    }
    return <span className={className}>{name}</span>;
}

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
    /** 'grid' = card vertical original (usado em grids 2 colunas). 'horizontal' = container largo (página /bewertungen). */
    layout?: 'grid' | 'horizontal';
}

export default function ReviewCard({ review, layout = 'grid' }: ReviewCardProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const locale = useLocale();
    const t = useTranslations('public.bewertungen');
    const date = new Date(review.created_at);
    // "März 2026": formato mês+ano não é coberto por format.ts, então o Intl
    // fica aqui — mas com o locale do contexto, não fixo.
    const formattedDate = new Intl.DateTimeFormat(locale, {
        month: 'long',
        year: 'numeric'
    }).format(date);

    const truncateAt = layout === 'horizontal' ? 260 : 300;
    const isLongText = review.body.length > truncateAt;
    const displayText = isExpanded ? review.body : review.body.slice(0, truncateAt);

    const publicPhotos = getPublicReviewPhotos(review);
    const avatarUrl = getReviewAvatarUrl(review);
    // Miniaturas e "X Fotos ansehen" levam pra página da primeira foto — cada
    // foto tem rota própria (/bewertungen/[id]/foto/[n]), com navegação entre
    // as fotos da mesma review a partir de lá.
    const firstPhotoHref = `/bewertungen/${review.id}/foto/1`;

    // No layout horizontal o avatar acompanha a altura do bloco nome/data/estrelas
    // (~3 linhas) — do tamanho das miniaturas da galeria ele parecia repetir o
    // preview de fotos. No card 'grid' (menor, usado em /ueber-will) mantém o
    // tamanho original.
    const avatarSize = layout === 'horizontal' ? 'w-16 h-16' : 'w-11 h-11';
    const avatarPx = layout === 'horizontal' ? 64 : 44;
    const avatarTextSize = layout === 'horizontal' ? 'text-xl' : 'text-sm';

    const avatar = avatarUrl ? (
        <Image
            src={avatarUrl}
            alt={review.nickname}
            width={avatarPx}
            height={avatarPx}
            className={`${avatarSize} rounded-full object-cover shrink-0`}
        />
    ) : (
        <div className={`${avatarSize} rounded-full bg-rio-green/10 flex items-center justify-center shrink-0`}>
            <span className={`text-rio-green font-bold ${avatarTextSize}`}>{review.nickname?.charAt(0).toUpperCase()}</span>
        </div>
    );

    const stars = (
        <div className="flex gap-0.5 shrink-0">
            {[1, 2, 3, 4, 5].map((star) => (
                <Star
                    key={star}
                    className={`w-4 h-4 ${star <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`}
                />
            ))}
        </div>
    );

    const readMoreButton = isLongText && (
        <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="inline-flex items-center gap-1 mt-4 px-3.5 py-1.5 rounded-full border border-gray-200 text-xs font-bold text-gray-500 hover:border-yellow-300 hover:text-yellow-700 hover:bg-yellow-50 transition-all"
        >
            {isExpanded ? (
                <><ChevronUp className="w-3.5 h-3.5" />{t('readLess')}</>
            ) : (
                <><ChevronDown className="w-3.5 h-3.5" />{t('readMore')}</>
            )}
        </button>
    );

    if (layout === 'horizontal') {
        return (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden font-sans">
                <div className="flex flex-col sm:flex-row">
                    {/* Sidebar: avatar, nome, data e nota */}
                    <div className="sm:w-56 lg:w-64 shrink-0 bg-gray-50/70 p-6 flex items-center gap-3 sm:gap-4 border-b sm:border-b-0 sm:border-r border-gray-100">
                        {avatar}
                        <div className="min-w-0">
                            <p className="font-bold text-gray-900 text-lg leading-tight truncate">{review.nickname}</p>
                            <p className="text-gray-400 text-sm mt-0.5">{formattedDate}</p>
                            <div className="mt-2.5">{stars}</div>
                        </div>
                    </div>

                    {/* Conteúdo: título, texto e fotos */}
                    <div className="flex-1 min-w-0 p-6 sm:p-8">
                        <h3 className="text-xl font-bold text-gray-900 mb-3 leading-snug">
                            {review.title}
                        </h3>
                        <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                            {displayText}{!isExpanded && isLongText && '…'}
                        </p>
                        {readMoreButton}

                        {publicPhotos.length > 0 && (
                            <div className="mt-6 pt-5 border-t border-gray-50 flex items-center gap-3 flex-wrap">
                                <Link
                                    href={firstPhotoHref}
                                    className="flex shrink-0 active:scale-95 transition-transform"
                                    aria-label={t('viewPhotos', { count: publicPhotos.length })}
                                >
                                    {publicPhotos.slice(0, 4).map((url, i) => {
                                        const isLast = i === 3 && publicPhotos.length > 4;
                                        return (
                                            <div
                                                key={i}
                                                className={`relative w-11 h-11 rounded-full overflow-hidden border-2 border-white shadow-sm ${i > 0 ? '-ml-3' : ''}`}
                                                style={{ zIndex: 4 - i }}
                                            >
                                                <Image src={url} alt="" fill sizes="44px" className="object-cover" />
                                                {isLast && (
                                                    <div className="absolute inset-0 bg-black/55 flex items-center justify-center">
                                                        <span className="text-white text-[10px] font-bold">+{publicPhotos.length - 4}</span>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </Link>
                                <Link
                                    href={firstPhotoHref}
                                    className="inline-flex items-center gap-1.5 text-sm font-bold text-gray-700 hover:text-yellow-700 transition-colors"
                                >
                                    <Images className="w-4 h-4" />
                                    {t('viewPhotos', { count: publicPhotos.length })}
                                </Link>
                            </div>
                        )}

                        {review.attractions && review.attractions.length > 0 && (
                            <div className="mt-6 pt-5 border-t border-gray-50">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-2">
                                    {t('visitedLabel')}
                                </p>
                                {/* -ml-2.5 compensa o padding horizontal do badge (px-2.5): sem
                                    isso, o texto do badge começa ~10px depois do "BESUCHT" acima. */}
                                <div className="flex flex-wrap gap-1.5 -ml-2.5">
                                    {review.attractions.map(att => (
                                        <AttractionBadge key={att} name={att} />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col h-full font-sans group relative">

            {/* Top: Avatar + Name + Stars */}
            <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-center gap-3 min-w-0">
                    {avatar}
                    <div className="min-w-0">
                        <span className="font-bold text-gray-900 text-lg leading-tight block truncate">{review.nickname}</span>
                        <span className="text-gray-400 text-sm">{formattedDate}</span>
                    </div>
                </div>
                <div className="mt-0.5">{stars}</div>
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
                {readMoreButton}
            </div>

            {/* Footer: Attractions + Thumbnails */}
            <div className="mt-6 pt-6 border-t border-gray-50 flex items-center justify-between gap-4">
                {review.attractions && review.attractions.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                        {review.attractions.map(att => (
                            <AttractionBadge key={att} name={att} />
                        ))}
                    </div>
                ) : <div />}

                {/* Photo thumbnails */}
                {publicPhotos.length > 0 && (
                    <Link
                        href={firstPhotoHref}
                        className="flex items-center gap-1 shrink-0 active:scale-95 transition-transform"
                        aria-label={t('viewPhotos', { count: publicPhotos.length })}
                    >
                        {publicPhotos.slice(0, 3).map((url, i) => {
                            const isLast = i === 2 && publicPhotos.length > 3;
                            return (
                                <div key={i} className="relative w-10 h-10 rounded-lg overflow-hidden border border-gray-100 shadow-sm">
                                    <Image src={url} alt="" fill sizes="40px" className="object-cover" />
                                    {isLast && (
                                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                            <span className="text-white text-[11px] font-bold">+{publicPhotos.length - 3}</span>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </Link>
                )}
            </div>
        </div>
    );
}

/**
 * Fotos públicas de uma review — mesma regra usada em toda parte que mostra
 * a galeria (card, lightbox antigo, página de foto): só entra o que tem
 * consentimento, própria antes das do Will. Extraído pra cá porque agora
 * roda tanto no client (ReviewCard) quanto no server (rota de foto/OG).
 */
export interface ReviewPhotoSource {
    photo_urls?: string[] | null;
    will_photo_urls?: string[] | null;
    consent_own_photos?: boolean | null;
    consent_will_photos?: boolean | null;
}

export function getPublicReviewPhotos(review: ReviewPhotoSource): string[] {
    const photos: string[] = [];
    if (review.consent_own_photos) photos.push(...(review.photo_urls ?? []));
    if (review.consent_will_photos) photos.push(...(review.will_photo_urls ?? []));
    return photos;
}

/** Mesma lógica da seção "Bewertungen" da home: prioriza foto do Will, depois
 * foto própria, sempre respeitando o consentimento. `null` = usa fallback de inicial. */
export function getReviewAvatarUrl(review: ReviewPhotoSource): string | null {
    return (
        (review.consent_will_photos && review.will_photo_urls?.[0]) ||
        (review.consent_own_photos && review.photo_urls?.[0]) ||
        null
    );
}

import { createClient } from '@/utils/supabase/server';

export interface ReviewDetail {
    id: string;
    nickname: string;
    title: string;
    body: string;
    photo_urls: string[] | null;
    will_photo_urls: string[] | null;
    consent_own_photos: boolean | null;
    consent_will_photos: boolean | null;
}

/** Usado pelas páginas de review e de foto (ambas server-side) — só reviews aprovadas são públicas. */
export async function getApprovedReviewById(id: string): Promise<ReviewDetail | null> {
    const supabase = await createClient();
    const { data } = await supabase
        .from('reviews')
        .select('id, nickname, title, body, photo_urls, will_photo_urls, consent_own_photos, consent_will_photos')
        .eq('id', id)
        .eq('status', 'approved')
        .maybeSingle();
    return data;
}

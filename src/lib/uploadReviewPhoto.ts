/**
 * Envia uma foto de review pra /api/reviews/upload-photo, que converte pra
 * WebP no servidor (via sharp) antes de gravar no Storage — usado nos 3
 * lugares que sobem foto de review: os dois formulários públicos
 * (ReviewForm, ReviewFormInline) e a moderação no admin (fotos do Will).
 */
export async function uploadReviewPhoto(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch('/api/reviews/upload-photo', {
        method: 'POST',
        body: formData,
    });

    if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error || 'Upload fehlgeschlagen');
    }

    const { url } = (await res.json()) as { url: string };
    return url;
}

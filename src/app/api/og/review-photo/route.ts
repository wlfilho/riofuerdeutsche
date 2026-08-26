import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';

// Preview de link (WhatsApp/Facebook) não renderiza WebP em og:image — mesma
// pegadinha já documentada nas propostas. Como as fotos de review agora são
// sempre WebP (ver /api/reviews/upload-photo), o card de compartilhamento de
// /bewertungen/[id] precisa dessa conversão pra JPEG sob demanda; sem isso o
// link cai sempre no banner genérico da marca.
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    const src = req.nextUrl.searchParams.get('url');
    if (!src) {
        return NextResponse.json({ error: 'url ausente' }, { status: 400 });
    }

    let parsed: URL;
    try {
        parsed = new URL(src);
    } catch {
        return NextResponse.json({ error: 'url inválida' }, { status: 400 });
    }

    // Não vira proxy aberto: só converte foto do nosso próprio bucket de reviews.
    const allowedHost = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL!).hostname;
    if (parsed.hostname !== allowedHost || !parsed.pathname.startsWith('/storage/v1/object/public/review-photos/')) {
        return NextResponse.json({ error: 'url não permitida' }, { status: 400 });
    }

    const sourceRes = await fetch(src);
    if (!sourceRes.ok) {
        return NextResponse.json({ error: 'falha ao buscar a imagem original' }, { status: 502 });
    }

    try {
        const inputBuffer = Buffer.from(await sourceRes.arrayBuffer());
        const jpeg = await sharp(inputBuffer)
            .resize({ width: 1200, height: 900, fit: 'cover' })
            .flatten({ background: '#ffffff' }) // webp com alpha viraria preto em JPEG sem isso
            .jpeg({ quality: 85 })
            .toBuffer();

        return new NextResponse(new Uint8Array(jpeg), {
            headers: {
                'Content-Type': 'image/jpeg',
                // a imagem de origem não muda de conteúdo sob a mesma URL (nomes com
                // timestamp), então cachear "para sempre" é seguro aqui.
                'Cache-Control': 'public, max-age=31536000, immutable',
            },
        });
    } catch (err) {
        console.error('[og/review-photo] falha ao converter:', err);
        return NextResponse.json({ error: 'falha ao converter a imagem' }, { status: 500 });
    }
}

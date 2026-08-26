import { NextRequest, NextResponse } from 'next/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import sharp from 'sharp';

// Rota pública (sem auth) — quem envia uma review, com ou sem login, precisa
// poder subir fotos. Mesma exposição que já existia antes (o browser subia
// direto pro Storage com a anon key); aqui pelo menos passa por validação e
// conversão no servidor antes de chegar no bucket.
const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE = 5 * 1024 * 1024; // 5 MB — mesmo limite já anunciado no formulário

export async function POST(req: NextRequest) {
    let file: File | null;
    try {
        const formData = await req.formData();
        file = formData.get('file') as File | null;
    } catch {
        return NextResponse.json({ error: 'Requisição inválida' }, { status: 400 });
    }

    if (!file) {
        return NextResponse.json({ error: 'Nenhum arquivo enviado' }, { status: 400 });
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
        return NextResponse.json({ error: 'Formato não suportado (use JPG, PNG ou WebP)' }, { status: 400 });
    }
    if (file.size > MAX_SIZE) {
        return NextResponse.json({ error: 'Arquivo muito grande (máx. 5 MB)' }, { status: 400 });
    }

    try {
        const inputBuffer = Buffer.from(await file.arrayBuffer());

        // .rotate() sem argumento: auto-orienta pela tag EXIF (essencial em foto de
        // celular — sem isso ela vem "deitada"). 1920px no lado maior é mais que
        // suficiente pra galeria e pro lightbox; nada aqui precisa da resolução
        // original de 4000px+ que vem direto da câmera.
        const webpBuffer = await sharp(inputBuffer)
            .rotate()
            .resize({ width: 1920, height: 1920, fit: 'inside', withoutEnlargement: true })
            .webp({ quality: 50 })
            .toBuffer();

        const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.webp`;

        const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
            .from('review-photos')
            .upload(fileName, webpBuffer, {
                contentType: 'image/webp',
                cacheControl: '31536000',
                upsert: false,
            });

        if (uploadError) {
            return NextResponse.json({ error: uploadError.message }, { status: 500 });
        }

        const { data: { publicUrl } } = supabaseAdmin.storage
            .from('review-photos')
            .getPublicUrl(uploadData.path);

        return NextResponse.json({ url: publicUrl }, { status: 201 });
    } catch (err) {
        console.error('[upload-photo] falha ao converter/enviar imagem:', err);
        return NextResponse.json({ error: 'Não foi possível processar a imagem' }, { status: 500 });
    }
}

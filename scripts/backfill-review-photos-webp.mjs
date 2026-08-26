#!/usr/bin/env node
/**
 * Converte pra WebP as fotos de review que já estão no Storage (bucket
 * review-photos) desde antes da rota /api/reviews/upload-photo existir.
 *
 * Faz, pra cada foto em photo_urls/will_photo_urls que ainda não é .webp:
 *   1. baixa o arquivo original
 *   2. converte com sharp (mesmos parâmetros da rota de upload: rotate() pra
 *      auto-orientar pelo EXIF, resize até 1920px no lado maior, webp q=50)
 *   3. sobe o resultado como novo arquivo .webp
 *   4. atualiza a linha da review no banco pra apontar pro novo arquivo
 *   5. só então apaga o arquivo original do Storage
 *
 * A ordem do passo 5 importa: nunca apaga o original antes do banco confirmar
 * a troca, pra não perder a foto se o script cair no meio.
 *
 * --force reprocessa mesmo arquivo que já é .webp (útil só pra re-comprimir
 * com outro valor de quality, tipo depois de mudar o número aqui em cima).
 *
 * Uso:  node scripts/backfill-review-photos-webp.mjs [--dry-run] [--force]
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';
import sharp from 'sharp';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dryRun = process.argv.includes('--dry-run');
const force = process.argv.includes('--force');

function loadEnvLocal() {
    const envPath = path.join(repoRoot, '.env.local');
    const env = {};
    for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) continue;
        const idx = trimmed.indexOf('=');
        const key = trimmed.slice(0, idx).trim();
        let value = trimmed.slice(idx + 1).trim();
        if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
        env[key] = value;
    }
    return env;
}

const env = loadEnvLocal();
const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;
const BUCKET = 'review-photos';

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    console.error('Faltam NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY em .env.local');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

function isAlreadyWebp(url) {
    return /\.webp$/i.test(new URL(url).pathname);
}

function storagePathFromUrl(url) {
    const marker = `/storage/v1/object/public/${BUCKET}/`;
    const idx = url.indexOf(marker);
    return idx === -1 ? null : url.slice(idx + marker.length);
}

async function convertOne(url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`download falhou (${res.status})`);
    const inputBuffer = Buffer.from(await res.arrayBuffer());
    const originalSize = inputBuffer.length;

    const webpBuffer = await sharp(inputBuffer)
        .rotate()
        .resize({ width: 1920, height: 1920, fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 50 })
        .toBuffer();

    const fileName = `backfill-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.webp`;

    if (dryRun) {
        return { newUrl: `[dry-run] ${fileName}`, originalSize, newSize: webpBuffer.length, oldPath: storagePathFromUrl(url) };
    }

    const { data: uploadData, error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(fileName, webpBuffer, { contentType: 'image/webp', cacheControl: '31536000', upsert: false });
    if (uploadError) throw new Error(`upload falhou: ${uploadError.message}`);

    const { data: { publicUrl } } = supabase.storage.from(BUCKET).getPublicUrl(uploadData.path);
    return { newUrl: publicUrl, originalSize, newSize: webpBuffer.length, oldPath: storagePathFromUrl(url) };
}

async function processField(review, field) {
    const urls = review[field];
    if (!Array.isArray(urls) || urls.length === 0) return { urls, changed: false, oldPaths: [], totalBefore: 0, totalAfter: 0 };

    const newUrls = [];
    const oldPaths = [];
    let changed = false;
    let totalBefore = 0;
    let totalAfter = 0;

    for (const url of urls) {
        if (isAlreadyWebp(url) && !force) {
            newUrls.push(url);
            continue;
        }
        try {
            const { newUrl, originalSize, newSize, oldPath } = await convertOne(url);
            console.log(`  [${review.nickname}/${field}] ${(originalSize / 1024 / 1024).toFixed(2)} MB → ${(newSize / 1024).toFixed(0)} KB`);
            newUrls.push(newUrl);
            if (oldPath) oldPaths.push(oldPath);
            changed = true;
            totalBefore += originalSize;
            totalAfter += newSize;
        } catch (err) {
            console.error(`  [${review.nickname}/${field}] FALHOU pra ${url}: ${err.message}`);
            newUrls.push(url); // mantém a original se der erro — não perde a foto
        }
    }

    return { urls: newUrls, changed, oldPaths, totalBefore, totalAfter };
}

async function main() {
    console.log(dryRun ? '=== DRY RUN — nada será alterado ===\n' : '=== Convertendo fotos de review pra WebP ===\n');

    const { data: reviews, error } = await supabase
        .from('reviews')
        .select('id, nickname, photo_urls, will_photo_urls');
    if (error) throw error;

    let totalPhotos = 0;
    let totalBefore = 0;
    let totalAfter = 0;

    for (const review of reviews) {
        const photoResult = await processField(review, 'photo_urls');
        const willResult = await processField(review, 'will_photo_urls');

        if (!photoResult.changed && !willResult.changed) continue;

        totalBefore += photoResult.totalBefore + willResult.totalBefore;
        totalAfter += photoResult.totalAfter + willResult.totalAfter;
        totalPhotos += (photoResult.changed ? photoResult.urls.length : 0) + (willResult.changed ? willResult.urls.length : 0);

        if (!dryRun) {
            const update = {};
            if (photoResult.changed) update.photo_urls = photoResult.urls;
            if (willResult.changed) update.will_photo_urls = willResult.urls;

            const { error: updateError } = await supabase.from('reviews').update(update).eq('id', review.id);
            if (updateError) {
                console.error(`  [${review.nickname}] falha ao atualizar o banco, NÃO apagando originais: ${updateError.message}`);
                continue;
            }

            const oldPaths = [...photoResult.oldPaths, ...willResult.oldPaths];
            if (oldPaths.length > 0) {
                const { error: removeError } = await supabase.storage.from(BUCKET).remove(oldPaths);
                if (removeError) console.error(`  [${review.nickname}] banco atualizado, mas falha ao apagar originais: ${removeError.message}`);
            }
        }
    }

    console.log(`\n=== Concluído ===`);
    console.log(`Fotos convertidas: ${totalPhotos}`);
    console.log(`Tamanho antes: ${(totalBefore / 1024 / 1024).toFixed(2)} MB`);
    console.log(`Tamanho depois: ${(totalAfter / 1024 / 1024).toFixed(2)} MB`);
    if (totalBefore > 0) {
        console.log(`Redução: ${(100 - (totalAfter / totalBefore) * 100).toFixed(1)}%`);
    }
}

main().catch((err) => {
    console.error('Erro fatal:', err);
    process.exit(1);
});

#!/usr/bin/env node
/**
 * Calcula a matriz de deslocamento de carro entre as atrações do catálogo de
 * propostas e grava em proposal_travel_matrix.
 *
 * Por que pré-calcular: o catálogo é fixo e pequeno (30 atrações), então a
 * matriz entre elas não muda. Calcular uma vez e guardar no banco tira a API
 * externa do caminho da montagem da proposta: o builder fica mais rápido e não
 * quebra se o ORS cair. Só a origem do cliente (hotel, porto) é variável, e
 * essa parte é resolvida em runtime.
 *
 * Rodar de novo só quando uma atração entrar no catálogo ou uma coordenada for
 * corrigida. Não é job agendado.
 *
 * São 30 pontos = 900 pares numa única requisição, bem abaixo do limite de
 * 3.500 pares por chamada do plano gratuito.
 *
 * Uso:  node scripts/build-travel-matrix.mjs [--dry-run]
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dryRun = process.argv.includes('--dry-run');

const ORS_HOST = process.env.ORS_HOST ?? 'https://api.heigit.org';

function loadEnvLocal() {
    const env = {};
    for (const line of fs.readFileSync(path.join(repoRoot, '.env.local'), 'utf8').split('\n')) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) continue;
        const idx = trimmed.indexOf('=');
        let value = trimmed.slice(idx + 1).trim();
        if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
        env[trimmed.slice(0, idx).trim()] = value;
    }
    return env;
}

const env = loadEnvLocal();
if (!env.ORS_API_KEY) {
    console.error('ORS_API_KEY ausente em .env.local.');
    process.exit(1);
}

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
});

// Transfers de aeroporto não são parada de roteiro: ficam fora da matriz.
const { data: services, error } = await supabase
    .from('proposal_services')
    .select('id, slug, latitude, longitude')
    .eq('is_active', true)
    .neq('category', 'transfer')
    .not('latitude', 'is', null)
    .order('sort_order');

if (error) {
    console.error('Erro lendo proposal_services:', error.message);
    process.exit(1);
}
if (services.length < 2) {
    console.error('Menos de duas atrações com coordenada. Rode antes: node scripts/geocode-services.mjs --apply');
    process.exit(1);
}

console.log(`${services.length} atrações com coordenada → ${services.length ** 2} pares.`);

// O ORS espera [longitude, latitude], ao contrário do Google. Inverter isso
// devolve uma matriz plausível e inteiramente errada, sem nenhum erro.
const locations = services.map(s => [Number(s.longitude), Number(s.latitude)]);

const res = await fetch(`${ORS_HOST}/openrouteservice/v2/matrix/driving-car`, {
    method: 'POST',
    headers: { Authorization: env.ORS_API_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ locations, metrics: ['duration', 'distance'], units: 'm' }),
});
if (!res.ok) {
    // Sem ecoar o corpo: a resposta de erro do ORS às vezes devolve a query.
    console.error(`ORS respondeu HTTP ${res.status}.`);
    process.exit(1);
}

const { durations, distances, destinations } = await res.json();

// Ponto longe demais da malha viária aponta coordenada errada no catálogo, e o
// tempo calculado a partir dele é ficção. Vale um aviso alto.
const LONGE_M = 500;
(destinations ?? []).forEach((d, i) => {
    if ((d.snapped_distance ?? 0) > LONGE_M) {
        console.warn(
            `  aviso: ${services[i].slug} ficou a ${Math.round(d.snapped_distance)}m da rua mais próxima. Confira a coordenada.`,
        );
    }
});

const rows = [];
let semRota = 0;
for (let i = 0; i < services.length; i++) {
    for (let j = 0; j < services.length; j++) {
        const seconds = durations?.[i]?.[j];
        // null = o ORS não achou rota entre os dois. Fica de fora da tabela, e
        // o trecho cai no tempo fixo do catálogo como qualquer par sem linha.
        if (seconds === null || seconds === undefined) { semRota++; continue; }
        const meters = distances?.[i]?.[j];
        rows.push({
            from_service_id: services[i].id,
            to_service_id: services[j].id,
            duration_seconds: Math.round(seconds),
            distance_meters: meters === null || meters === undefined ? null : Math.round(meters),
            provider: 'openrouteservice',
            computed_at: new Date().toISOString(),
        });
    }
}

console.log(`${rows.length} pares com rota${semRota > 0 ? `, ${semRota} sem rota (ficam no tempo fixo)` : ''}.`);

if (dryRun) {
    const amostra = rows.filter(r => r.from_service_id !== r.to_service_id).slice(0, 5);
    for (const r of amostra) {
        const de = services.find(s => s.id === r.from_service_id).slug;
        const para = services.find(s => s.id === r.to_service_id).slug;
        console.log(`  ${de} → ${para}: ${Math.round(r.duration_seconds / 60)}min, ${(r.distance_meters / 1000).toFixed(1)}km`);
    }
    console.log('\n--dry-run: nada gravado.');
    process.exit(0);
}

// Upsert em lotes: a chave composta faz o recálculo substituir a linha antiga
// em vez de duplicar.
const LOTE = 500;
for (let i = 0; i < rows.length; i += LOTE) {
    const { error: upErr } = await supabase
        .from('proposal_travel_matrix')
        .upsert(rows.slice(i, i + LOTE), { onConflict: 'from_service_id,to_service_id' });
    if (upErr) {
        console.error('Erro gravando matriz:', upErr.message);
        process.exit(1);
    }
}

console.log(`Matriz gravada: ${rows.length} linhas.`);

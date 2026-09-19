#!/usr/bin/env node
/**
 * Preenche latitude/longitude das atrações do catálogo de propostas
 * (proposal_services) via geocodificação do OpenRouteService.
 *
 * Por que existe uma tabela de consultas aqui em vez de geocodificar o nome do
 * serviço: o nome no banco está em ALEMÃO ("Botanischer Garten",
 * "Königliches Portugiesisches Lesekabinett"). Geocodificar isso dá resultado
 * errado ou nenhum. E, mesmo em português, o nome da atração nem sempre é o
 * ponto que interessa: numa trilha o que conta é o começo dela, não o cume, e
 * o Cristo tem dois pontos de partida diferentes conforme se sobe de carro
 * (Paineiras) ou de trem (Cosme Velho).
 *
 * Fluxo deliberado em dois passos: rodar sem argumento só IMPRIME o resultado
 * com link do OpenStreetMap para conferência humana. Só --apply grava. Uma
 * coordenada errada não quebra nada visivelmente: ela vira um tempo de viagem
 * plausível e falso na proposta inteira.
 *
 * Geocodificador: Nominatim (OpenStreetMap), NÃO o do OpenRouteService. O
 * Pelias do ORS, que a proposta usa em runtime para a origem do cliente,
 * resolve bem um endereço ou um hotel com nome próprio, mas nos POIs do Rio
 * cai no centroide do município sem avisar: Copacabana, Escadaria Selarón e
 * Feira da Glória voltaram todos na mesma coordenada em Santa Cruz, a 35 km de
 * onde deveriam. Aqui são 30 consultas rodadas à mão uma vez, então vale usar
 * o provedor que acerta e respeitar o limite de 1 req/s dele.
 *
 * Uso:  node scripts/geocode-services.mjs [--apply] [--all]
 *       --apply  grava no banco (sem isto, só mostra)
 *       --all    refaz também os serviços que já têm coordenada
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const apply = process.argv.includes('--apply');
const redoAll = process.argv.includes('--all');

const NOMINATIM = 'https://nominatim.openstreetmap.org/search';

// Política de uso do Nominatim: no máximo 1 req/s e User-Agent identificável.
const PAUSA_MS = 1100;
const USER_AGENT = 'riofuerdeutsche-geocode/1.0 (contato via riofuerdeutsche.de)';

// Recorte do Grande Rio, igual ao de src/lib/ors.ts. Aqui serve de conferência:
// resultado fora da caixa é recusado em vez de gravado.
const BBOX = { minLng: -43.85, minLat: -23.12, maxLng: -42.95, maxLat: -22.70 };

/**
 * slug do catálogo → o que perguntar ao geocodificador.
 *
 * `nota` documenta toda escolha que não é o nome óbvio da atração; é o que o
 * revisor humano precisa saber para julgar se a coordenada está certa.
 */
const QUERIES = {
    'maracana': { q: 'Estádio do Maracanã, Rio de Janeiro' },
    'maracana-museum-4d0u8': {
        q: 'Estádio do Maracanã, Rio de Janeiro',
        nota: 'Mesmo endereço do Maracanã: o museu fica dentro do estádio.',
    },
    'favela-tour-guia': {
        q: 'Estrada da Gávea, Rocinha, Rio de Janeiro',
        nota: 'Ponto de encontro na entrada da Rocinha, não o alto da favela.',
    },
    'cristo-redentor': {
        q: 'Paineiras Corcovado, Rio de Janeiro',
        nota: 'Subida de carro: o ponto é as Paineiras, onde o veículo para.',
    },
    'cristo-redentor-trenzinho-v2e2g': {
        q: 'Trem do Corcovado, Cosme Velho, Rio de Janeiro',
        nota: 'Subida de trem: o ponto é a estação no Cosme Velho, não o Cristo.',
    },
    'santa-teresa': {
        q: 'Largo dos Guimarães, Santa Teresa, Rio de Janeiro',
        nota: 'Largo dos Guimarães como centro do passeio pelo bairro.',
    },
    'selaron': { q: 'Escadaria Selarón, Rio de Janeiro' },
    'confeitaria-colombo': { q: 'Confeitaria Colombo, Rua Gonçalves Dias, Rio de Janeiro' },
    'pao-de-acucar': {
        q: 'Avenida Pasteur, 520, Urca, Rio de Janeiro',
        nota: 'Estação I do bondinho, na Praia Vermelha: é onde o carro deixa o grupo, não o cume.',
    },
    'morro-da-urca-mrurc': {
        q: 'Avenida Pasteur, 520, Urca, Rio de Janeiro',
        nota: 'Mesma estação do Pão de Açúcar: o Morro da Urca é a primeira parada do bondinho.',
    },
    'lagoa-rodrigo-de-freitas-jbrbw': { q: 'Lagoa Rodrigo de Freitas, Rio de Janeiro' },
    'copacabana-strand-promenade-3wry6': { q: 'Praia de Copacabana, Rio de Janeiro' },
    'feira-da-gloria-gloria-freimarkt-rbz9g': { q: 'Feira da Glória, Rio de Janeiro' },
    'feira-da-general-glicerio-0b6c0': { q: 'Rua General Glicério, Laranjeiras, Rio de Janeiro' },
    'floresta-da-tijuca-regenwald-g1omv': {
        q: 'Praça Afonso Viseu, Alto da Boa Vista, Rio de Janeiro',
        nota: 'Entrada da Floresta da Tijuca (Praça Afonso Viseu), não o centro do parque.',
    },
    'lagoa-de-marapendi-mrpd1': { q: 'Lagoa de Marapendi, Barra da Tijuca, Rio de Janeiro' },
    'pedra-bonita-pdbnt': {
        q: 'Rampa da Pedra Bonita, São Conrado, Rio de Janeiro',
        nota: 'Rampa de voo livre, onde o carro chega: é o fim da estrada, não o cume da pedra.',
    },
    'morro-dois-irmaos-m2irm': {
        q: 'Rua Armando de Almeida Lima, Vidigal, Rio de Janeiro',
        nota: 'Início da trilha no alto do Vidigal, não o cume.',
    },
    'theatro-municipal-thmun': {
        q: 'Theatro Municipal, Centro, Rio de Janeiro, RJ',
        nota: 'O "RJ" no fim é necessário: sem ele o geocodificador acha o Teatro Municipal de Itaboraí.',
    },
    'centro-cultural-banco-do-brasil-ccbb': {
        q: 'Centro Cultural Banco do Brasil, Rua Primeiro de Março, Rio de Janeiro',
    },
    'museu-do-amanha-mamnh': { q: 'Museu do Amanhã, Praça Mauá, Rio de Janeiro' },
    'jardim-botanico-jbrio': {
        q: 'Jardim Botânico do Rio de Janeiro, 1008, Rua Jardim Botânico',
        nota: 'Com o número 1008 cai no portão principal; sem ele, no meio da rua homônima.',
    },
    'mac-niteroi-macnt': { q: 'Museu de Arte Contemporânea de Niterói' },
    'catedral-metropolitana-catmt': {
        q: 'Catedral Metropolitana de São Sebastião, Avenida Chile, Rio de Janeiro',
    },
    'real-gabinete-portugues-de-leitura-rgpl': {
        q: 'Real Gabinete Português de Leitura, Rua Luís de Camões, Rio de Janeiro',
    },
    'ipanema-promenade-arpoador-felsen-fhln6': {
        q: 'Pedra do Arpoador, Ipanema, Rio de Janeiro',
        nota: 'Arpoador como ponto de chegada da orla de Ipanema.',
    },
    'mirante-dona-marta-mdmrt': { q: 'Mirante Dona Marta, Rio de Janeiro' },
    'parque-lage-pqlge': { q: 'Parque Lage, Rua Jardim Botânico, Rio de Janeiro' },
    'urca-bairro-mureta-urcbr': { q: 'Mureta da Urca, Rio de Janeiro' },
    'arcos-da-lapa-arclp': { q: 'Arcos da Lapa, Rio de Janeiro' },
};

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

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
});

async function geocode(text) {
    const params = new URLSearchParams({
        q: text,
        format: 'json',
        limit: '1',
        countrycodes: 'br',
        addressdetails: '0',
    });
    const res = await fetch(`${NOMINATIM}?${params}`, { headers: { 'User-Agent': USER_AGENT } });
    if (!res.ok) throw new Error(`geocode falhou: HTTP ${res.status}`);
    const json = await res.json();
    const hit = json[0];
    if (!hit) return null;

    const latitude = Number(hit.lat);
    const longitude = Number(hit.lon);
    // Guarda contra o erro que não faz barulho: um homônimo em outro estado
    // vira um tempo de viagem plausível e falso no roteiro inteiro.
    if (
        latitude < BBOX.minLat || latitude > BBOX.maxLat ||
        longitude < BBOX.minLng || longitude > BBOX.maxLng
    ) {
        return { latitude, longitude, label: hit.display_name, foraDoRio: true };
    }
    return { latitude, longitude, label: hit.display_name };
}

const dormir = ms => new Promise(r => setTimeout(r, ms));

// ─── main ─────────────────────────────────────────────────────────────────────

// Transfers de aeroporto ficam de fora: não são parada de roteiro e não entram
// na matriz.
const { data: services, error } = await supabase
    .from('proposal_services')
    .select('id, slug, latitude, longitude, proposal_service_translations(locale, name)')
    .eq('is_active', true)
    .neq('category', 'transfer')
    .order('sort_order');

if (error) {
    console.error('Erro lendo proposal_services:', error.message);
    process.exit(1);
}

const semQuery = services.filter(s => !QUERIES[s.slug]);
if (semQuery.length > 0) {
    console.error('Slugs sem consulta na tabela QUERIES deste script:');
    for (const s of semQuery) console.error(`  ${s.slug}`);
    console.error('\nAcrescente cada um à tabela antes de rodar.');
    process.exit(1);
}

const alvos = redoAll ? services : services.filter(s => s.latitude === null);
if (alvos.length === 0) {
    console.log('Nada a fazer: todas as atrações já têm coordenada. (--all refaz tudo.)');
    process.exit(0);
}

console.log(`Geocodificando ${alvos.length} atrações...\n`);

const resultados = [];
for (const s of alvos) {
    const { q, nota } = QUERIES[s.slug];
    const nomeDe = s.proposal_service_translations?.find(t => t.locale === 'de')?.name ?? s.slug;
    let hit = null;
    try {
        hit = await geocode(q);
    } catch (err) {
        console.error(`  ${s.slug}: ${err.message}`);
    }
    resultados.push({ ...s, nomeDe, q, nota, hit });
    await dormir(PAUSA_MS);
}

for (const r of resultados) {
    console.log(`── ${r.nomeDe}`);
    console.log(`   slug:     ${r.slug}`);
    console.log(`   consulta: ${r.q}`);
    if (r.nota) console.log(`   nota:     ${r.nota}`);
    if (!r.hit) {
        console.log('   RESULTADO: nenhum. Ajuste a consulta.\n');
        continue;
    }
    const { latitude, longitude, label } = r.hit;
    console.log(`   achou:    ${label}`);
    if (r.hit.foraDoRio) console.log('   ATENÇÃO:  resultado FORA do Grande Rio. Não será gravado.');
    console.log(`   coord:    ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
    console.log(`   mapa:     https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=17/${latitude}/${longitude}`);
    console.log('');
}

const ok = resultados.filter(r => r.hit && !r.hit.foraDoRio);
const falhou = resultados.length - ok.length;

if (!apply) {
    console.log(`${ok.length} coordenada(s) encontrada(s), ${falhou} sem resultado.`);
    console.log('CONFIRA os pontos nos links acima. Para gravar: node scripts/geocode-services.mjs --apply');
    process.exit(0);
}

for (const r of ok) {
    const { error: upErr } = await supabase
        .from('proposal_services')
        .update({
            latitude: r.hit.latitude,
            longitude: r.hit.longitude,
            geo_source: 'nominatim',
            geo_updated_at: new Date().toISOString(),
        })
        .eq('id', r.id);
    if (upErr) console.error(`  ${r.slug}: erro ao gravar — ${upErr.message}`);
}

console.log(`\nGravadas ${ok.length} coordenadas. ${falhou > 0 ? `${falhou} seguem sem coordenada (usam o tempo fixo do catálogo).` : ''}`);
console.log('Próximo passo: node scripts/build-travel-matrix.mjs');

/**
 * Cliente do OpenRouteService (HeiGIT) — só servidor.
 *
 * NUNCA importar isto de um componente 'use client': ORS_API_KEY é segredo e
 * um import de valor arrastaria a chave para o bundle do browser. Quem precisa
 * de deslocamento real no cliente passa por /api/admin/proposals/origin-legs.
 *
 * Host: api.heigit.org. O antigo api.openrouteservice.org está sendo
 * descontinuado. Atenção aos prefixos, que mudaram junto com o host e não
 * batem com o que a maioria dos exemplos na internet mostra:
 *   matriz e rotas → /openrouteservice/v2/...
 *   geocodificação → /pelias/v1/...   (não /geocode/search)
 *
 * Cotas do plano gratuito, por dia: matriz 500, geocoding 3.000,
 * directions 2.000. O uso previsto aqui fica em uma ordem de grandeza abaixo
 * disso, então não há cache nem throttle — se um dia houver, o lugar é aqui.
 */

const ORS_HOST = process.env.ORS_HOST ?? 'https://api.heigit.org';

// Recorte para a geocodificação da origem: Grande Rio, de Sepetiba a Niterói.
// Sem ele, "Hotel Atlântico" acha um homônimo em outro estado e o roteiro
// inteiro sai com tempos absurdos sem que nada quebre.
const RIO_BBOX = {
    minLng: -43.85,
    minLat: -23.12,
    maxLng: -42.95,
    maxLat: -22.70,
};

export type LatLng = { latitude: number; longitude: number };

export class OrsError extends Error {}

function apiKey(): string {
    const key = process.env.ORS_API_KEY;
    if (!key) throw new OrsError('ORS_API_KEY não configurada.');
    return key;
}

// Mensagem de erro do ORS sem nunca ecoar o corpo inteiro: a chave viaja no
// header, mas a resposta de erro às vezes devolve a query completa.
function describeFailure(status: number): string {
    if (status === 401 || status === 403) return 'ORS recusou a chave de API.';
    if (status === 429) return 'Cota diária do ORS esgotada.';
    return `ORS respondeu ${status}.`;
}

/**
 * Matriz de durações entre pontos. `locations` em [longitude, latitude] —
 * ordem invertida em relação ao Google, e trocar isso produz números
 * plausíveis e errados, não um erro.
 *
 * `sources`/`destinations` são índices dentro de `locations`; omitidos, o ORS
 * calcula o quadrado completo.
 */
export async function orsMatrix(
    locations: Array<[number, number]>,
    opts: { sources?: number[]; destinations?: number[]; withDistances?: boolean } = {},
): Promise<{ durations: number[][]; distances: number[][] | null }> {
    const body: Record<string, unknown> = {
        locations,
        metrics: opts.withDistances ? ['duration', 'distance'] : ['duration'],
        units: 'm',
    };
    if (opts.sources) body.sources = opts.sources;
    if (opts.destinations) body.destinations = opts.destinations;

    const res = await fetch(`${ORS_HOST}/openrouteservice/v2/matrix/driving-car`, {
        method: 'POST',
        headers: { Authorization: apiKey(), 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        cache: 'no-store',
    });
    if (!res.ok) throw new OrsError(describeFailure(res.status));

    const json = await res.json() as { durations?: number[][]; distances?: number[][] };
    if (!json.durations) throw new OrsError('ORS devolveu matriz sem durações.');
    return { durations: json.durations, distances: json.distances ?? null };
}

/**
 * Endereço livre → coordenada, restrito ao Grande Rio. Devolve null quando o
 * ORS não acha nada dentro do recorte: quem chama trata isso como "sem
 * coordenada", nunca como erro fatal.
 */
export async function orsGeocodeRio(
    text: string,
): Promise<{ latitude: number; longitude: number; label: string } | null> {
    const params = new URLSearchParams({
        api_key: apiKey(),
        text,
        size: '1',
        'boundary.rect.min_lon': String(RIO_BBOX.minLng),
        'boundary.rect.min_lat': String(RIO_BBOX.minLat),
        'boundary.rect.max_lon': String(RIO_BBOX.maxLng),
        'boundary.rect.max_lat': String(RIO_BBOX.maxLat),
    });

    const res = await fetch(`${ORS_HOST}/pelias/v1/search?${params}`, { cache: 'no-store' });
    if (!res.ok) throw new OrsError(describeFailure(res.status));

    const json = await res.json() as {
        features?: Array<{
            geometry?: { coordinates?: [number, number] };
            properties?: { label?: string };
        }>;
    };
    const hit = json.features?.[0];
    const coords = hit?.geometry?.coordinates;
    if (!coords) return null;

    // GeoJSON é [longitude, latitude].
    return { longitude: coords[0], latitude: coords[1], label: hit?.properties?.label ?? text };
}

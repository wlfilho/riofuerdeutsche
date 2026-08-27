/**
 * Assuntos aceitos no `?thema=` da /anfrage — o que a pessoa quer, quando o
 * CTA não parte de uma página de tour. Não confundir com `tour_slug`
 * (src/lib/tours.ts), que é de ONDE o pedido veio.
 *
 * Hoje só 'unterkunft', e é teste de demanda: a consultoria de hospedagem
 * nunca foi prestada e não tem preço. Os CTAs que existiam apontavam pra
 * /unterkunft/beratung, uma rota que nunca existiu e devolvia 404. Em vez de
 * inventar uma página, eles medem interesse.
 *
 * O rótulo em alemão mora no i18n (`public.anfrage.thema.<slug>`), não aqui:
 * é texto que o visitante lê.
 */
export const THEMA_SLUGS = ['unterkunft'] as const;

export type Thema = (typeof THEMA_SLUGS)[number];

export function isThema(value: unknown): value is Thema {
  return typeof value === 'string' && (THEMA_SLUGS as readonly string[]).includes(value);
}

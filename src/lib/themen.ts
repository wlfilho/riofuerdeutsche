/**
 * Assuntos aceitos no `?thema=` da /anfrage — o que a pessoa quer, quando o
 * CTA não parte de uma página de tour. Não confundir com `tour_slug`
 * (src/lib/tours.ts), que é de ONDE o pedido veio.
 *
 * 'unterkunft' é teste de demanda: a consultoria nunca foi prestada e não tem
 * preço. Os CTAs que existiam apontavam pra /unterkunft/beratung, uma rota que
 * nunca existiu e devolvia 404. Em vez de inventar uma página, medem interesse.
 *
 * 'transfer' é o oposto — serviço real, com preço. Vai pela /anfrage e não
 * pelo WhatsApp porque a antecedência mínima é de 48h: é comprado antes da
 * viagem, da Alemanha, sem urgência que justifique conversa imediata.
 *
 * O rótulo em alemão mora no i18n (`public.anfrage.thema.<slug>`), não aqui:
 * é texto que o visitante lê.
 */
export const THEMA_SLUGS = ['unterkunft', 'transfer'] as const;

export type Thema = (typeof THEMA_SLUGS)[number];

export function isThema(value: unknown): value is Thema {
  return typeof value === 'string' && (THEMA_SLUGS as readonly string[]).includes(value);
}

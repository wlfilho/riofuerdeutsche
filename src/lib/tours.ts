/**
 * Slugs canônicos dos tours — os nomes de diretório em `src/app/touren/*`,
 * que são a URL real de cada página.
 *
 * Fonte única para validar o `?tour=` da /anfrage. NÃO usar o campo `slug` de
 * `AndereTouren.tsx` para isso: lá ele é um id interno do card e diverge da
 * rota em três casos ('kultur-geschichte' vs kultur-und-geschichte, 'night'
 * vs by-night, 'karneval' vs karneval-tour). Validar contra aquele campo faria
 * esses três tours gravarem null em silêncio, sem ninguém perceber.
 *
 * Ao criar um tour novo em src/app/touren/, acrescente o slug aqui — senão o
 * ?tour= daquela página é ignorado e o lead perde a atribuição de origem.
 */
export const TOUR_SLUGS = [
  'by-night',
  'favela-tour',
  'fussball',
  'individuell',
  'karneval-tour',
  'klassiker',
  'kultur-und-geschichte',
  'natur-und-straende',
  'regentage',
  'sport-und-abenteuer',
  'tagesausfluege',
] as const;

export type TourSlug = (typeof TOUR_SLUGS)[number];

export function isTourSlug(value: unknown): value is TourSlug {
  return typeof value === 'string' && (TOUR_SLUGS as readonly string[]).includes(value);
}

import type { ProposalGuideRateTier } from './proposals';

// Resolução da faixa de honorário por tamanho de grupo.
//
// Módulo próprio, sem nenhum import de valor de @/lib/proposals: aquele módulo
// carrega o client Supabase de servidor, e o builder de propostas é client
// component. Assim servidor e browser usam a mesma função em vez de duas
// cópias que divergem.

// Faixa que cobre `pax`. null = nenhuma faixa bate (grupo maior que a última
// cadastrada, ou catálogo vazio). Quem chama cai no honorário padrão das
// configurações e avisa, em vez de aplicar em silêncio o preço de uma faixa
// que não é a daquele grupo.
export function findGuideRateTier(
  tiers: ProposalGuideRateTier[],
  pax: number,
): ProposalGuideRateTier | null {
  return tiers.find(t => pax >= t.min_pax && (t.max_pax === null || pax <= t.max_pax)) ?? null;
}

// Rótulo curto da faixa para a interface: "1–3", "6–18", "6+".
// A meia-risca aqui é intervalo numérico, não traço de aposto.
export function guideRateTierLabel(tier: ProposalGuideRateTier): string {
  return tier.max_pax === null ? `${tier.min_pax}+` : `${tier.min_pax}–${tier.max_pax}`;
}

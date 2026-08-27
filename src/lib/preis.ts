/**
 * Preço-âncora "ab X pro Person", usado na /anfrage e na página de sucesso.
 *
 * VAZIO DE PROPÓSITO até o Will decidir o número (é da Fase 3). Enquanto for
 * null, a âncora e a faixa de preço simplesmente NÃO renderizam — melhor
 * ausência do que "€0" ou texto de placeholder em produção.
 *
 * As colunas estimated_min/estimated_max de price_leads não servem pra isso:
 * são resíduo da calculadora antiga, 0 de 66 registros, e nada no código
 * escreve nelas.
 *
 * Para ativar: põe o número aqui. É o único lugar.
 */
export const PREIS_AB_PRO_PERSON: number | null = null

/** Faixa do grupo = pax × âncora, com folga pra cima. Null enquanto não houver âncora. */
export function preisSpanne(pax: number): { min: number; max: number } | null {
  if (PREIS_AB_PRO_PERSON === null || pax < 1) return null
  const min = PREIS_AB_PRO_PERSON * pax
  return { min, max: Math.round(min * 1.6) }
}

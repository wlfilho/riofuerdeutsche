import { type TourSlug } from './tours'

/**
 * Temas do multi-select "Was wollt ihr in Rio erleben?" da /anfrage.
 *
 * São um subconjunto CURADO dos tours (src/lib/tours.ts), não a lista inteira:
 * o critério é "o que eu preciso saber pra escolher qual proposta montar", e
 * `individuell`, `regentage`, `karneval-tour` e `sport-und-abenteuer` não
 * separam propostas — o primeiro é a ausência de tema, os outros três são
 * circunstância (chuva, época do ano) ou nicho.
 *
 * Não listar pontos turísticos um a um é decisão de produto: 30 opções
 * paralisam e transferem ao cliente o trabalho de montar o roteiro, que é
 * justamente o serviço.
 *
 * O tipo amarra ao TourSlug de propósito — tema que não corresponde a um tour
 * não compila, e renomear um tour quebra aqui em vez de gravar slug órfão.
 */
export const INTERESSE_TOURS = [
  'klassiker',
  'natur-und-straende',
  'favela-tour',
  'kultur-und-geschichte',
  'by-night',
  'fussball',
  'tagesausfluege',
] as const satisfies readonly TourSlug[]

/**
 * "Ich weiß es noch nicht — empfiehl mir etwas."
 *
 * Não é escapatória nem "outros": é o posicionamento do negócio, e converte
 * quem sairia do formulário por insegurança. Renderiza com o MESMO peso visual
 * dos temas. Marcá-la desmarca os demais — quem pede recomendação não está
 * escolhendo.
 */
export const UNENTSCHLOSSEN = 'unentschlossen'

export const INTERESSE_VALUES = [...INTERESSE_TOURS, UNENTSCHLOSSEN] as const

export type Interesse = (typeof INTERESSE_VALUES)[number]

export function isInteresse(value: unknown): value is Interesse {
  return typeof value === 'string' && (INTERESSE_VALUES as readonly string[]).includes(value)
}

/**
 * Como a pessoa diz que nos encontrou. Perguntado na PÁGINA DE SUCESSO, não no
 * formulário — depois do envio não há o que abandonar.
 *
 * 'ki' cobre ChatGPT e assistentes: a maioria não passa referrer (a pessoa lê a
 * resposta e digita o endereço), então o Analytics subestima. Só perguntando
 * dá pra saber o tamanho real.
 */
export const FOUND_VIA_VALUES = [
  'google',
  'ki',
  'empfehlung',
  'social',
  'kreuzfahrt',
  'sonstiges',
] as const

export type FoundVia = (typeof FOUND_VIA_VALUES)[number]

export function isFoundVia(value: unknown): value is FoundVia {
  return typeof value === 'string' && (FOUND_VIA_VALUES as readonly string[]).includes(value)
}

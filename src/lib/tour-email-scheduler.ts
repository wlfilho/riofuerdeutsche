import { subDays, isBefore, startOfDay } from 'date-fns'

/**
 * Sequência pré-tour. `email_number` é legado (o log ainda o exige); a
 * identidade real de cada e-mail é o `slug`, resolvido em runtime contra
 * `email_templates` por (slug, locale).
 */
export const EMAIL_SEQUENCE = [
  { number: 1, name: 'Confirmação do Tour', slug: 'confirmacao_reserva', phase: 'pre_tour' },
  { number: 2, name: 'Dicas de Segurança', slug: 'dicas_seguranca', phase: 'pre_tour' },
  { number: 3, name: 'Documentos e Checklist', slug: 'documentos', phase: 'pre_tour' },
  { number: 4, name: 'Bon Voyage', slug: 'bon_voyage', phase: 'pre_tour' },
] as const

export type SequenceEmailNumber = (typeof EMAIL_SEQUENCE)[number]['number']

/** Mapa email_number → slug, para logs legados e caminhos que só têm o número. */
export const EMAIL_NUMBER_TO_SLUG: Record<SequenceEmailNumber, string> = Object.fromEntries(
  EMAIL_SEQUENCE.map((e) => [e.number, e.slug]),
) as Record<SequenceEmailNumber, string>

export function calculateSchedule(arrivalDate: Date) {
  const today = startOfDay(new Date())

  const dates = [
    { ...EMAIL_SEQUENCE[0], date: today },                                    // imediato
    { ...EMAIL_SEQUENCE[1], date: subDays(startOfDay(arrivalDate), 14) },     // 14 dias antes
    { ...EMAIL_SEQUENCE[2], date: subDays(startOfDay(arrivalDate), 7) },      // 7 dias antes
    { ...EMAIL_SEQUENCE[3], date: subDays(startOfDay(arrivalDate), 1) },      // 1 dia antes
  ]

  // Marcar como 'skipped' se a data já passou (exceto email #1, sempre pendente ao criar)
  return dates.map(item => ({
    ...item,
    status: isBefore(item.date, today) && item.number !== 1 ? 'skipped' : 'pending',
  }))
}

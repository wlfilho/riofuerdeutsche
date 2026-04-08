import { addDays, subDays, isBefore, startOfDay } from 'date-fns'

export const EMAIL_SEQUENCE = [
  { number: 1, name: 'Confirmação do Tour' },
  { number: 2, name: 'Dicas de Segurança' },
  { number: 3, name: 'Documentos e Checklist' },
  { number: 4, name: 'Bon Voyage' },
]

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

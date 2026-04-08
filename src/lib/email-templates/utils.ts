import { differenceInCalendarDays, startOfDay } from 'date-fns'

export function formatDate(isoDate: string) {
  return new Date(isoDate).toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

export function daysUntil(isoDate: string) {
  return differenceInCalendarDays(startOfDay(new Date(isoDate)), startOfDay(new Date()))
}

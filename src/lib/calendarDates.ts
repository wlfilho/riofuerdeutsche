// Date helpers for the tour calendar. All math in local time via (y, m, d)
// constructors — never `new Date('YYYY-MM-DD')`, which parses as UTC and
// shifts the day in negative-offset timezones like America/Sao_Paulo.

export const MONTH_NAMES_PT = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

export const WEEKDAY_SHORT_PT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export const WEEKDAY_LONG_PT = [
  'Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira',
  'Quinta-feira', 'Sexta-feira', 'Sábado',
];

export function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function parseISODate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(d: Date, n: number): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
}

export function startOfWeek(d: Date): Date {
  return addDays(d, -d.getDay()); // week starts on Sunday
}

export function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

export function todayISO(): string {
  return toISODate(new Date());
}

/** "Terça-feira, 15 de Julho de 2026" */
export function formatDayLong(iso: string): string {
  const d = parseISODate(iso);
  return `${WEEKDAY_LONG_PT[d.getDay()]}, ${d.getDate()} de ${MONTH_NAMES_PT[d.getMonth()]} de ${d.getFullYear()}`;
}

/** "13 Julho – 19 Julho 2026" */
export function formatWeekRange(weekStart: Date): string {
  const end = addDays(weekStart, 6);
  return `${weekStart.getDate()} ${MONTH_NAMES_PT[weekStart.getMonth()]} – ${end.getDate()} ${MONTH_NAMES_PT[end.getMonth()]} ${end.getFullYear()}`;
}

/** "09:30:00" → "09:30" */
export function formatTime(time: string | null): string | null {
  if (!time) return null;
  return time.slice(0, 5);
}

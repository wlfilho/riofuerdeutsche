'use client';

import type { TourDate } from '@/lib/tourDates';
import {
  MONTH_NAMES_PT,
  WEEKDAY_SHORT_PT,
  addDays,
  daysInMonth,
  formatWeekRange,
  isPastDay,
  isPastMonth,
  startOfWeek,
  toISODate,
  todayISO,
} from '@/lib/calendarDates';
import NavArrows from './NavArrows';

export type CalendarView = 'ano' | 'mes' | 'semana';

export default function MiniCalendar({
  view,
  anchor,
  toursByDay,
  dayAlerts,
  selectedDay,
  onDayClick,
  onNavigate,
  onMonthClick,
}: {
  view: CalendarView;
  anchor: Date;
  toursByDay: Map<string, TourDate[]>;
  // Vermelho é empate de verdade; âmbar é alguém disputando um dia que já tem
  // dono (ver dayConflictFor em @/lib/tourDates).
  dayAlerts: Map<string, 'empate' | 'perdendo'>;
  selectedDay: string | null;
  onDayClick: (iso: string) => void;
  onNavigate: (anchorISO: string) => void;
  onMonthClick: (anchorISO: string) => void;
}) {
  const year = anchor.getFullYear();
  const month = anchor.getMonth();
  const today = todayISO();

  const renderDay = (iso: string, day: number) => {
    const tours = toursByDay.get(iso) ?? [];
    const hasFechado = tours.some(t => t.status === 'fechado');
    const hasProposta = tours.some(t => t.status === 'proposta_enviada');
    const hasRascunho = tours.some(t => t.status === 'rascunho');
    const isPast = isPastDay(iso);
    // Conflito num dia que já passou não tem mais o que resolver: não alerta.
    const alert = isPast ? undefined : dayAlerts.get(iso);
    const isSelected = iso === selectedDay;
    const isToday = iso === today;

    return (
      <button
        key={iso}
        onClick={() => onDayClick(iso)}
        title={
          alert === 'empate'
            ? 'Conflito de agenda: dois compromissos do mesmo peso neste dia'
            : alert === 'perdendo'
              ? 'Dia já tem dono: o outro cliente só acontece com parceiro'
              : undefined
        }
        className={`mx-auto flex h-9 w-9 flex-col items-center justify-center rounded-lg text-xs transition-colors ${
          alert === 'empate'
            ? 'ring-2 ring-red-400 ring-offset-1'
            : alert === 'perdendo'
              ? 'ring-2 ring-amber-300 ring-offset-1'
              : ''
        } ${
          isSelected
            ? 'bg-gray-900 text-white font-semibold'
            : isToday
              ? 'bg-green-100 text-green-800 font-semibold hover:bg-green-200'
              : isPast
                ? 'text-gray-300 hover:bg-gray-50'
                : 'text-gray-700 hover:bg-gray-100'
        }`}
      >
        <span className="leading-none">{day}</span>
        <span className="flex h-1 items-center gap-0.5 mt-1">
          {hasFechado && (
            <span
              className={`h-1 w-1 rounded-full ${
                isSelected ? 'bg-green-400' : isPast ? 'bg-gray-200' : 'bg-green-600'
              }`}
            />
          )}
          {hasProposta && (
            <span className={`h-1 w-1 rounded-full ${isPast ? 'bg-gray-200' : 'bg-amber-400'}`} />
          )}
          {hasRascunho && (
            <span className={`h-1 w-1 rounded-full ${isPast ? 'bg-gray-200' : 'bg-slate-400'}`} />
          )}
        </span>
      </button>
    );
  };

  const weekdayHeader = (
    <div className="grid grid-cols-7 mb-1">
      {WEEKDAY_SHORT_PT.map((d, i) => (
        <p key={i} className="text-center text-[10px] font-semibold text-gray-400 uppercase py-0.5">
          {d[0]}
        </p>
      ))}
    </div>
  );

  if (view === 'ano') {
    const monthStatus = (m: number) => {
      const prefix = `${year}-${String(m + 1).padStart(2, '0')}`;
      let hasFechado = false;
      let hasProposta = false;
      let hasRascunho = false;
      let alert: 'empate' | 'perdendo' | undefined;
      for (const [iso, tours] of toursByDay) {
        if (!iso.startsWith(prefix)) continue;
        if (tours.some(t => t.status === 'fechado')) hasFechado = true;
        if (tours.some(t => t.status === 'proposta_enviada')) hasProposta = true;
        if (tours.some(t => t.status === 'rascunho')) hasRascunho = true;
        // Só conflito ainda acionável conta: no mês corrente os dias já
        // vividos não devem acender o alerta do mês inteiro.
        const dayAlert = isPastDay(iso) ? undefined : dayAlerts.get(iso);
        if (dayAlert === 'empate') alert = 'empate';
        else if (dayAlert === 'perdendo' && !alert) alert = 'perdendo';
      }
      return { hasFechado, hasProposta, hasRascunho, alert };
    };

    return (
      <div>
        <NavArrows
          label={String(year)}
          onPrev={() => onNavigate(toISODate(new Date(year - 1, month, 1)))}
          onNext={() => onNavigate(toISODate(new Date(year + 1, month, 1)))}
        />
        <div className="grid grid-cols-3 gap-1">
          {MONTH_NAMES_PT.map((name, m) => {
            const monthISO = `${year}-${String(m + 1).padStart(2, '0')}`;
            const status = monthStatus(m);
            const { hasFechado, hasProposta, hasRascunho } = status;
            const isPast = isPastMonth(monthISO);
            const alert = status.alert;
            const isCurrentMonth = today.startsWith(monthISO);
            return (
              <button
                key={m}
                onClick={() => onMonthClick(toISODate(new Date(year, m, 1)))}
                title={
                  alert === 'empate'
                    ? 'Conflito de agenda neste mês'
                    : alert === 'perdendo'
                      ? 'Mês com dia disputado'
                      : undefined
                }
                className={`flex flex-col items-center justify-center rounded-lg py-2 text-xs transition-colors ${
                  alert === 'empate'
                    ? 'ring-2 ring-red-400 ring-offset-1'
                    : alert === 'perdendo'
                      ? 'ring-2 ring-amber-300 ring-offset-1'
                      : ''
                } ${
                  isCurrentMonth
                    ? 'bg-green-100 text-green-800 font-semibold hover:bg-green-200'
                    : isPast
                      ? 'text-gray-300 hover:bg-gray-50'
                      : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span className="leading-none">{name.slice(0, 3)}</span>
                <span className="flex h-1 items-center gap-0.5 mt-1">
                  {hasFechado && (
                    <span className={`h-1 w-1 rounded-full ${isPast ? 'bg-gray-200' : 'bg-green-600'}`} />
                  )}
                  {hasProposta && (
                    <span className={`h-1 w-1 rounded-full ${isPast ? 'bg-gray-200' : 'bg-amber-400'}`} />
                  )}
                  {hasRascunho && (
                    <span className={`h-1 w-1 rounded-full ${isPast ? 'bg-gray-200' : 'bg-slate-400'}`} />
                  )}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  if (view === 'semana') {
    const weekStart = startOfWeek(anchor);
    const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

    return (
      <div>
        <NavArrows
          label={formatWeekRange(weekStart)}
          onPrev={() => onNavigate(toISODate(addDays(weekStart, -7)))}
          onNext={() => onNavigate(toISODate(addDays(weekStart, 7)))}
        />
        {weekdayHeader}
        <div className="grid grid-cols-7 gap-y-1">
          {days.map(d => renderDay(toISODate(d), d.getDate()))}
        </div>
      </div>
    );
  }

  const firstWeekday = new Date(year, month, 1).getDay();
  const totalDays = daysInMonth(year, month);
  const cells: (number | null)[] = [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length: totalDays }, (_, i) => i + 1),
  ];

  return (
    <div>
      <NavArrows
        label={`${MONTH_NAMES_PT[month]} ${year}`}
        onPrev={() => onNavigate(toISODate(new Date(year, month - 1, 1)))}
        onNext={() => onNavigate(toISODate(new Date(year, month + 1, 1)))}
      />
      {weekdayHeader}
      <div className="grid grid-cols-7 gap-y-1">
        {cells.map((day, i) => {
          if (day === null) return <div key={`blank-${i}`} />;
          return renderDay(toISODate(new Date(year, month, day)), day);
        })}
      </div>
    </div>
  );
}

'use client';

import type { TourDate } from '@/lib/tourDates';
import {
  MONTH_NAMES_PT,
  WEEKDAY_SHORT_PT,
  addDays,
  daysInMonth,
  formatWeekRange,
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
  conflictDays,
  selectedDay,
  onDayClick,
  onNavigate,
  onMonthClick,
}: {
  view: CalendarView;
  anchor: Date;
  toursByDay: Map<string, TourDate[]>;
  conflictDays: Set<string>;
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
    const hasConflict = conflictDays.has(iso);
    const isSelected = iso === selectedDay;
    const isToday = iso === today;

    return (
      <button
        key={iso}
        onClick={() => onDayClick(iso)}
        title={hasConflict ? 'Conflito de agenda: mais de um cliente neste dia' : undefined}
        className={`mx-auto flex h-9 w-9 flex-col items-center justify-center rounded-lg text-xs transition-colors ${
          hasConflict ? 'ring-2 ring-red-400 ring-offset-1' : ''
        } ${
          isSelected
            ? 'bg-gray-900 text-white font-semibold'
            : isToday
              ? 'bg-green-100 text-green-800 font-semibold hover:bg-green-200'
              : 'text-gray-700 hover:bg-gray-100'
        }`}
      >
        <span className="leading-none">{day}</span>
        <span className="flex h-1 items-center gap-0.5 mt-1">
          {hasFechado && (
            <span className={`h-1 w-1 rounded-full ${isSelected ? 'bg-green-400' : 'bg-green-600'}`} />
          )}
          {hasProposta && <span className="h-1 w-1 rounded-full bg-amber-400" />}
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
      let hasConflict = false;
      for (const [iso, tours] of toursByDay) {
        if (!iso.startsWith(prefix)) continue;
        if (tours.some(t => t.status === 'fechado')) hasFechado = true;
        if (tours.some(t => t.status === 'proposta_enviada')) hasProposta = true;
        if (conflictDays.has(iso)) hasConflict = true;
      }
      return { hasFechado, hasProposta, hasConflict };
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
            const { hasFechado, hasProposta, hasConflict } = monthStatus(m);
            const isCurrentMonth = today.startsWith(`${year}-${String(m + 1).padStart(2, '0')}`);
            return (
              <button
                key={m}
                onClick={() => onMonthClick(toISODate(new Date(year, m, 1)))}
                title={hasConflict ? 'Conflito de agenda neste mês' : undefined}
                className={`flex flex-col items-center justify-center rounded-lg py-2 text-xs transition-colors ${
                  hasConflict ? 'ring-2 ring-red-400 ring-offset-1' : ''
                } ${
                  isCurrentMonth
                    ? 'bg-green-100 text-green-800 font-semibold hover:bg-green-200'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span className="leading-none">{name.slice(0, 3)}</span>
                <span className="flex h-1 items-center gap-0.5 mt-1">
                  {hasFechado && <span className="h-1 w-1 rounded-full bg-green-600" />}
                  {hasProposta && <span className="h-1 w-1 rounded-full bg-amber-400" />}
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

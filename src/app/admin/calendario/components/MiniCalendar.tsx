'use client';

import type { TourDate } from '@/lib/tourDates';
import { MONTH_NAMES_PT, WEEKDAY_SHORT_PT, daysInMonth, toISODate, todayISO } from '@/lib/calendarDates';
import NavArrows from './NavArrows';

export default function MiniCalendar({
  anchor,
  toursByDay,
  selectedDay,
  onDayClick,
  onNavigate,
}: {
  anchor: Date;
  toursByDay: Map<string, TourDate[]>;
  selectedDay: string | null;
  onDayClick: (iso: string) => void;
  onNavigate: (anchorISO: string) => void;
}) {
  const year = anchor.getFullYear();
  const month = anchor.getMonth();
  const firstWeekday = new Date(year, month, 1).getDay();
  const totalDays = daysInMonth(year, month);
  const today = todayISO();

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

      <div className="grid grid-cols-7 mb-1">
        {WEEKDAY_SHORT_PT.map((d, i) => (
          <p key={i} className="text-center text-[10px] font-semibold text-gray-400 uppercase py-0.5">
            {d[0]}
          </p>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-y-1">
        {cells.map((day, i) => {
          if (day === null) return <div key={`blank-${i}`} />;

          const iso = toISODate(new Date(year, month, day));
          const tours = toursByDay.get(iso) ?? [];
          const hasFechado = tours.some(t => t.status === 'fechado');
          const hasProposta = tours.some(t => t.status === 'proposta_enviada');
          const isSelected = iso === selectedDay;
          const isToday = iso === today;

          return (
            <button
              key={iso}
              onClick={() => onDayClick(iso)}
              className={`mx-auto flex h-9 w-9 flex-col items-center justify-center rounded-lg text-xs transition-colors ${
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
        })}
      </div>
    </div>
  );
}

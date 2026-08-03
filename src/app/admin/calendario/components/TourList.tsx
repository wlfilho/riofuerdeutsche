'use client';

import { useTranslations } from 'next-intl';
import type { TourDate } from '@/lib/tourDates';
import { MONTH_NAMES_PT } from '@/lib/calendarDates';
import TourCard from './TourCard';

export default function TourList({
  tours,
  groupByMonth = false,
  onEdit,
  onDelete,
}: {
  tours: TourDate[];
  groupByMonth?: boolean;
  onEdit: (tour: TourDate) => void;
  onDelete: (tour: TourDate) => void;
}) {
  const t = useTranslations('admin.calendario');

  if (!groupByMonth) {
    return (
      <div className="space-y-3">
        {tours.map(tour => (
          <TourCard key={tour.id} tour={tour} onEdit={onEdit} onDelete={onDelete} />
        ))}
      </div>
    );
  }

  // Tours arrive sorted by (date, time), so month groups stay in order
  const byMonth = new Map<string, TourDate[]>();
  for (const t of tours) {
    const key = t.date.slice(0, 7); // YYYY-MM
    const list = byMonth.get(key) ?? [];
    list.push(t);
    byMonth.set(key, list);
  }

  return (
    <div className="space-y-6">
      {[...byMonth.entries()].map(([key, monthTours]) => (
        <section key={key}>
          <div className="flex items-baseline gap-2 mb-3">
            <h3 className="text-sm font-bold text-gray-900">
              {MONTH_NAMES_PT[Number(key.slice(5, 7)) - 1]}
            </h3>
            <span className="text-sm text-gray-400">
              {t('toursCount', { count: monthTours.length })}
            </span>
          </div>
          <div className="space-y-3">
            {monthTours.map(tour => (
              <TourCard key={tour.id} tour={tour} onEdit={onEdit} onDelete={onDelete} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

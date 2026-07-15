'use client';

import { useMemo, useState } from 'react';
import { X } from 'lucide-react';
import type { TourDate, TourDateStatus } from '@/lib/tourDates';
import TourDateModal, { type TourDateLeadOption } from '@/components/admin/TourDateModal';
import {
  MONTH_NAMES_PT,
  addDays,
  formatDayLong,
  formatWeekRange,
  parseISODate,
  startOfWeek,
  toISODate,
  todayISO,
} from '@/lib/calendarDates';
import MiniCalendar, { type CalendarView as View } from './MiniCalendar';
import TourList from './TourList';

const VIEW_OPTIONS: { id: View; label: string }[] = [
  { id: 'ano', label: 'Ano' },
  { id: 'mes', label: 'Mês' },
  { id: 'semana', label: 'Semana' },
];

export default function CalendarClient({
  initialTours,
  leadOptions,
}: {
  initialTours: TourDate[];
  leadOptions: TourDateLeadOption[];
}) {
  const [tours, setTours] = useState<TourDate[]>(initialTours);
  const [view, setView] = useState<View>('mes');
  const [anchorISO, setAnchorISO] = useState<string>(todayISO());
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<TourDateStatus | null>(null);
  const [modal, setModal] = useState<{ editing?: TourDate; defaultDate?: string } | null>(null);

  const anchor = useMemo(() => parseISODate(anchorISO), [anchorISO]);

  const visibleTours = useMemo(
    () => (statusFilter ? tours.filter(t => t.status === statusFilter) : tours),
    [tours, statusFilter]
  );

  // Tours grouped by day for the mini calendar (server orders by date, time)
  const toursByDay = useMemo(() => {
    const map = new Map<string, TourDate[]>();
    for (const t of visibleTours) {
      const list = map.get(t.date) ?? [];
      list.push(t);
      map.set(t.date, list);
    }
    return map;
  }, [visibleTours]);

  // Tours in the active range: selected day > current view around the anchor
  const { listTours, listTitle } = useMemo(() => {
    if (selectedDay) {
      return {
        listTours: visibleTours.filter(t => t.date === selectedDay),
        listTitle: formatDayLong(selectedDay),
      };
    }
    const year = anchor.getFullYear();
    if (view === 'ano') {
      return {
        listTours: visibleTours.filter(t => t.date.startsWith(`${year}-`)),
        listTitle: String(year),
      };
    }
    if (view === 'mes') {
      const prefix = anchorISO.slice(0, 7);
      return {
        listTours: visibleTours.filter(t => t.date.startsWith(prefix)),
        listTitle: `${MONTH_NAMES_PT[anchor.getMonth()]} ${year}`,
      };
    }
    const weekStart = startOfWeek(anchor);
    const startISO = toISODate(weekStart);
    const endISO = toISODate(addDays(weekStart, 6));
    return {
      listTours: visibleTours.filter(t => t.date >= startISO && t.date <= endISO),
      listTitle: formatWeekRange(weekStart),
    };
  }, [visibleTours, selectedDay, view, anchor, anchorISO]);

  // Clicking a day filters the list to it; clicking again clears the filter
  const toggleDay = (iso: string) => {
    setAnchorISO(iso);
    setSelectedDay(prev => (prev === iso ? null : iso));
  };

  const switchView = (v: View) => {
    setView(v);
    setSelectedDay(null);
  };

  const handleSaved = (saved: TourDate[]) => {
    setTours(prev => {
      const ids = new Set(saved.map(t => t.id));
      const merged = [...prev.filter(t => !ids.has(t.id)), ...saved];
      return merged.sort(
        (a, b) => a.date.localeCompare(b.date) || (a.start_time ?? '').localeCompare(b.start_time ?? '')
      );
    });
    setModal(null);
  };

  const handleDelete = async (tour: TourDate) => {
    if (!window.confirm(`Remover "${tour.tour_name}" de ${tour.date.split('-').reverse().join('.')}?`)) return;
    const res = await fetch(`/api/admin/tour-dates/${tour.id}`, { method: 'DELETE' });
    if (res.ok) {
      setTours(prev => prev.filter(t => t.id !== tour.id));
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 items-start">
      {/* Sidebar: mini calendar + controls */}
      <aside className="w-full lg:w-72 shrink-0 lg:sticky lg:top-6 space-y-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <MiniCalendar
            view={view}
            anchor={anchor}
            toursByDay={toursByDay}
            selectedDay={selectedDay}
            onDayClick={toggleDay}
            onNavigate={setAnchorISO}
            onMonthClick={iso => {
              setAnchorISO(iso);
              switchView('mes');
            }}
          />
          {/* Legend doubles as a status filter: tap to filter, tap again to clear */}
          <div className="flex items-center justify-center gap-1.5 mt-3 pt-3 border-t border-gray-100">
            <button
              onClick={() => setStatusFilter(null)}
              className={`inline-flex items-center whitespace-nowrap px-2 py-1 text-[11px] font-medium rounded-full border transition-colors ${
                statusFilter === null
                  ? 'bg-gray-100 border-gray-300 text-gray-800'
                  : 'border-transparent text-gray-500 hover:bg-gray-100'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setStatusFilter(prev => (prev === 'fechado' ? null : 'fechado'))}
              className={`inline-flex items-center whitespace-nowrap gap-1.5 px-2 py-1 text-[11px] font-medium rounded-full border transition-colors ${
                statusFilter === 'fechado'
                  ? 'bg-green-50 border-green-300 text-green-800'
                  : 'border-transparent text-gray-500 hover:bg-gray-100'
              }`}
            >
              <span className="h-2 w-2 rounded-full bg-green-600" />
              Fechado
            </button>
            <button
              onClick={() => setStatusFilter(prev => (prev === 'proposta_enviada' ? null : 'proposta_enviada'))}
              className={`inline-flex items-center whitespace-nowrap gap-1.5 px-2 py-1 text-[11px] font-medium rounded-full border transition-colors ${
                statusFilter === 'proposta_enviada'
                  ? 'bg-amber-50 border-amber-300 text-amber-800'
                  : 'border-transparent text-gray-500 hover:bg-gray-100'
              }`}
            >
              <span className="h-2 w-2 rounded-full bg-amber-400" />
              Proposta
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-3">
          <div className="grid grid-cols-3 bg-gray-100 rounded-lg p-1 gap-1">
            {VIEW_OPTIONS.map(opt => (
              <button
                key={opt.id}
                onClick={() => switchView(opt.id)}
                className={`px-2 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  view === opt.id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={() => setModal({ defaultDate: selectedDay ?? undefined })}
          className="w-full px-3 py-2.5 text-sm font-semibold text-white bg-green-600 rounded-xl hover:bg-green-700 transition-colors"
        >
          + Nova data
        </button>
      </aside>

      {/* Main: tour list for the active range */}
      <main className="flex-1 min-w-0 w-full">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 mb-4">
          <h2 className="text-lg font-bold text-gray-900">{listTitle}</h2>
          <span className="text-sm text-gray-400">
            {listTours.length === 0
              ? 'Nenhum tour'
              : `${listTours.length} tour${listTours.length > 1 ? 's' : ''}`}
          </span>
          {selectedDay && (
            <button
              onClick={() => setSelectedDay(null)}
              className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold text-gray-600 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
            >
              <X className="w-3 h-3" />
              Limpar filtro
            </button>
          )}
        </div>

        {listTours.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-10 text-center">
            <p className="text-sm text-gray-400 mb-4">Nenhum tour neste período.</p>
            <button
              onClick={() => setModal({ defaultDate: selectedDay ?? undefined })}
              className="px-3 py-2 text-xs font-semibold text-green-700 border border-green-200 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
            >
              + Nova data
            </button>
          </div>
        ) : (
          <TourList
            tours={listTours}
            groupByMonth={view === 'ano' && !selectedDay}
            onEdit={tour => setModal({ editing: tour })}
            onDelete={handleDelete}
          />
        )}
      </main>

      {modal && (
        <TourDateModal
          leadOptions={leadOptions}
          editing={modal.editing}
          defaultDate={modal.defaultDate}
          onSaved={handleSaved}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}

import { createClient } from '@/utils/supabase/server';
import CalendarClient from './components/CalendarClient';
import { TOUR_DATE_SELECT, type TourDate } from '@/lib/tourDates';
import type { TourDateLeadOption } from '@/components/admin/TourDateModal';

export const metadata = { title: 'Calendário — Admin' };

export default async function CalendarioPage() {
  const supabase = await createClient();

  const [toursResult, leadsResult] = await Promise.all([
    supabase
      .from('tour_dates')
      .select(TOUR_DATE_SELECT)
      .order('date', { ascending: true })
      .order('start_time', { ascending: true, nullsFirst: true }),
    supabase
      .from('price_leads')
      .select('id, name, status, pax')
      .in('status', ['proposal_sent', 'closed'])
      .order('name', { ascending: true }),
  ]);

  const tours = (toursResult.data ?? []) as unknown as TourDate[];
  const leadOptions = (leadsResult.data ?? []) as TourDateLeadOption[];

  return (
    <div className="p-4 sm:p-6 md:p-10">
      <div className="max-w-7xl">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Calendário</h1>
          <p className="text-gray-500 mt-1">Tours fechados e propostas enviadas</p>
        </div>

        {toursResult.error && (
          <div className="mb-4 p-3 rounded-lg text-sm bg-red-50 text-red-800 border border-red-200">
            Erro ao carregar tours: {toursResult.error.message}
          </div>
        )}

        <CalendarClient initialTours={tours} leadOptions={leadOptions} />
      </div>
    </div>
  );
}

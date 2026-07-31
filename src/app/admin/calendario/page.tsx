import { getAdminTranslations } from '@/i18n/admin';
import { createClient } from '@/utils/supabase/server';
import CalendarClient from './components/CalendarClient';
import { type TourDate } from '@/lib/tourDates';
import type { TourDateLeadOption } from '@/components/admin/TourDateModal';

export async function generateMetadata() {
  const t = await getAdminTranslations('admin.calendario');
  return { title: t('metaTitle') };
}

// !inner: filtro por lead.status exclui a linha inteira (tours de lead PERDIDO
// somem do calendário), em vez de só anular o objeto lead.
const CALENDAR_TOUR_SELECT =
  '*, lead:price_leads!inner(id, name, email, phone, status, proposal:proposals(id, pdf_url))';

export default async function CalendarioPage() {
  const t = await getAdminTranslations('admin.calendario');
  const supabase = await createClient();

  const [toursResult, leadsResult] = await Promise.all([
    supabase
      .from('tour_dates')
      // Só mostra tours de leads ativos; lead perdido (kanban PERDIDO) some do calendário
      .select(CALENDAR_TOUR_SELECT)
      .in('lead.status', ['proposal_sent', 'closed'])
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
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{t('titulo')}</h1>
          <p className="text-gray-500 mt-1">{t('subtitulo')}</p>
        </div>

        {toursResult.error && (
          <div className="mb-4 p-3 rounded-lg text-sm bg-red-50 text-red-800 border border-red-200">
            {t('erroCarregarTours')}{toursResult.error.message}
          </div>
        )}

        <CalendarClient initialTours={tours} leadOptions={leadOptions} />
      </div>
    </div>
  );
}

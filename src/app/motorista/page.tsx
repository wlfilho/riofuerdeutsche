// Área do motorista: a escala de trabalho de quem dirige nos tours.
//
// Quem chega aqui é um profile com role='driver' (o middleware barra o resto;
// admin também entra, para conferir o que o motorista vê). Os dados saem pela
// service role com filtro explícito driver_id = usuário logado — mesmo padrão
// das rotas /api/admin — porque as RLS de tour_dates/price_leads/proposals são
// admin-only e abri-las ao motorista vazaria preço e dados de outros clientes.
//
// Por isso a seleção de campos aqui é deliberadamente curta: data, horário,
// ponto de encontro, roteiro, pax e o primeiro nome do cliente. Nada de preço,
// sinal, e-mail ou telefone do cliente — e nada de `notes`: as observações do
// tour são anotações internas do admin (valores combinados, condições de
// pagamento) e já vazaram uma vez por aqui (03/09/2026). Se um dia o motorista
// precisar de instruções, isso pede um campo próprio, não o notes.
//
// Texto hardcoded em pt-BR de propósito: o motorista é local, e o lado
// público do site é de-only — não há catálogo pt-BR fora do admin.

import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { createClient as createServiceClient } from '@supabase/supabase-js';
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  MapPin,
  Route,
  Send,
  Users,
} from 'lucide-react';
import { WEEKDAY_LONG_PT, formatTime, parseISODate, todayISO } from '@/lib/calendarDates';
import LogoutButton from './LogoutButton';
import ChangePassword from './ChangePassword';

export const metadata: Metadata = {
  title: 'Área do motorista | Rio für Deutsche',
  robots: { index: false, follow: false },
};

// A escala muda no admin a qualquer momento; nada aqui pode ficar em cache.
export const dynamic = 'force-dynamic';

interface DriverTourRow {
  id: string;
  date: string;
  start_time: string | null;
  tour_name: string | null;
  status: 'rascunho' | 'proposta_enviada' | 'fechado';
  pax: number | null;
  meeting_point: string | null;
  lead: {
    id: string;
    name: string;
    proposal: { id: string; items: { day?: string | null; kind?: string; service_name?: string }[] | null } | null;
  } | null;
}

/** "2026-10-25" → "Sábado, 25/10/2026" */
function formatDateLong(iso: string): string {
  const d = parseISODate(iso);
  return `${WEEKDAY_LONG_PT[d.getDay()]}, ${d.toLocaleDateString('pt-BR')}`;
}

/** Primeiro nome do cliente: o motorista precisa saber quem busca, não o cadastro. */
function firstNameOf(fullName: string | null | undefined): string | null {
  return fullName?.trim().split(/\s+/)[0] ?? null;
}

/** Atividades vendidas para o dia, na ordem da proposta. */
function itineraryFor(row: DriverTourRow): string[] {
  const items = row.lead?.proposal?.items ?? [];
  return items
    .filter(i => i?.day === row.date && i.kind !== 'day_transport' && i.service_name)
    .map(i => i.service_name as string);
}

function TourCard({ row, past }: { row: DriverTourRow; past?: boolean }) {
  const confirmed = row.status === 'fechado';
  const itinerary = itineraryFor(row);
  return (
    <div
      className={`rounded-xl border p-4 shadow-sm ${
        past ? 'border-gray-200 bg-gray-50 opacity-70' : 'border-gray-200 bg-white'
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
          <CalendarDays className="w-4 h-4 text-gray-400 shrink-0" />
          {formatDateLong(row.date)}
        </p>
        <span
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold whitespace-nowrap ${
            confirmed ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'
          }`}
        >
          {confirmed ? <CheckCircle2 className="w-3 h-3" /> : <Send className="w-3 h-3" />}
          {confirmed ? 'Confirmado' : 'A confirmar'}
        </span>
      </div>

      {row.tour_name && <p className="mt-1 text-sm text-gray-600">{row.tour_name}</p>}

      <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-x-5 gap-y-2.5">
        <div>
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Saída</p>
          <p className={`flex items-center gap-1.5 text-sm ${row.start_time ? 'text-gray-800' : 'text-gray-400'}`}>
            <Clock className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            {formatTime(row.start_time) ?? 'A definir'}
          </p>
        </div>
        <div>
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Ponto de encontro</p>
          <p className={`flex items-start gap-1.5 text-sm ${row.meeting_point ? 'text-gray-800' : 'text-gray-400'}`}>
            <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0 mt-0.5" />
            <span className="break-words min-w-0">{row.meeting_point ?? 'A definir'}</span>
          </p>
        </div>
        <div>
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Cliente / pessoas</p>
          <p className="flex items-center gap-1.5 text-sm text-gray-800">
            <Users className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            {firstNameOf(row.lead?.name) ?? 'A confirmar'}
            {row.pax != null && <span className="text-gray-500">· {row.pax} pessoa{row.pax === 1 ? '' : 's'}</span>}
          </p>
        </div>
      </div>

      {itinerary.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1 flex items-center gap-1">
            <Route className="w-3 h-3" />
            Roteiro do dia
          </p>
          <ol className="text-sm text-gray-700 space-y-0.5 list-decimal list-inside">
            {itinerary.map((name, i) => (
              <li key={i}>{name}</li>
            ))}
          </ol>
        </div>
      )}

    </div>
  );
}

export default async function MotoristaPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login?redirect=/motorista');

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, first_name')
    .eq('id', user.id)
    .single();

  // O middleware já barra, mas a página não pode depender só dele.
  if (profile?.role !== 'driver' && profile?.role !== 'admin') redirect('/dashboard');

  const admin = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  // !inner + filtro de status: tour de lead perdido some da escala junto com
  // o calendário do admin (as linhas em tour_dates são apagadas no "lost",
  // mas o filtro protege contra estados intermediários).
  const { data, error } = await admin
    .from('tour_dates')
    .select(
      'id, date, start_time, tour_name, status, pax, meeting_point, lead:price_leads!inner(id, name, status, proposal:proposals!price_leads_proposal_id_fkey(id, items))',
    )
    .eq('driver_id', user.id)
    .in('lead.status', ['new', 'contacted', 'proposal_sent', 'closed'])
    .order('date', { ascending: true })
    .order('start_time', { ascending: true, nullsFirst: true });

  const rows = (data ?? []) as unknown as DriverTourRow[];
  const today = todayISO();
  const upcoming = rows.filter(r => r.date >= today);
  // Passado recente em ordem inversa: o mais fresco primeiro.
  const past = rows.filter(r => r.date < today).reverse().slice(0, 10);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-green-700 uppercase tracking-wide">Rio für Deutsche</p>
            <h1 className="text-lg font-bold text-gray-900">
              {profile?.first_name ? `Olá, ${profile.first_name}` : 'Área do motorista'}
            </h1>
          </div>
          <LogoutButton />
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6 space-y-8">
        <section>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Próximos tours
          </h2>
          {error && (
            <div className="p-3 rounded-lg text-sm bg-red-50 text-red-800 border border-red-200">
              Não foi possível carregar a escala. Tente de novo em instantes.
            </div>
          )}
          {!error && upcoming.length === 0 && (
            <div className="rounded-xl border border-dashed border-gray-300 bg-white p-6 text-center text-sm text-gray-500">
              Nenhum tour agendado para você no momento.
            </div>
          )}
          <div className="space-y-3">
            {upcoming.map(row => (
              <TourCard key={row.id} row={row} />
            ))}
          </div>
        </section>

        {past.length > 0 && (
          <section>
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
              Tours anteriores
            </h2>
            <div className="space-y-3">
              {past.map(row => (
                <TourCard key={row.id} row={row} past />
              ))}
            </div>
          </section>
        )}

        <section className="pt-2 border-t border-gray-200">
          <ChangePassword />
        </section>
      </main>
    </div>
  );
}

// Shared types for tour_dates (calendário de tours)

import type { SupabaseClient } from '@supabase/supabase-js';

export type TourDateStatus = 'proposta_enviada' | 'fechado';

/**
 * @deprecated Rótulos de UI vivem no catálogo i18n (`admin.status.tourDate` e
 * `admin.status.tourDateShort`). Este módulo não é React e não pode usar hooks,
 * então a tradução é feita pelos componentes. Mantido só para não quebrar
 * importações externas.
 */
export const TOUR_DATE_STATUS_LABELS: Record<TourDateStatus, string> = {
  fechado: 'FECHADO',
  proposta_enviada: 'PROPOSTA ENVIADA',
};

export interface TourDateLead {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  proposal: { id: string; pdf_url: string | null } | null;
}

export interface TourDate {
  id: string;
  lead_id: string;
  date: string; // YYYY-MM-DD
  start_time: string | null; // HH:MM:SS
  tour_name: string;
  status: TourDateStatus;
  pax: number | null;
  meeting_point: string | null;
  agreed_price: number | null;
  anzahlung_paid: boolean;
  notes: string | null;
  created_at: string;
  lead: TourDateLead | null;
}

export interface TourDateInput {
  lead_id: string;
  date: string;
  start_time: string | null;
  tour_name: string;
  status: TourDateStatus;
  pax: number | null;
  meeting_point: string | null;
  agreed_price: number | null;
  anzahlung_paid: boolean;
  notes: string | null;
}

export const TOUR_DATE_SELECT = '*, lead:price_leads(id, name, email, phone, proposal:proposals(id, pdf_url))';

export interface ConflictingTourDate {
  id: string;
  tour_name: string;
  status: TourDateStatus;
  lead: { id: string; name: string } | null;
}

/**
 * Outros tours (de leads diferentes) já agendados no mesmo dia. Um guia só dá
 * conta de um pack por dia, então isso é sempre um conflito de agenda —
 * independente de horário ou de status (proposta x fechado): dois clientes
 * "querendo" o mesmo dia já é sinal pra separar guias.
 *
 * tour_dates só existe para leads ativos (proposal_sent/closed — ver
 * syncTourDatesWithLeadStatus, que apaga as linhas quando o lead vira
 * "lost"), então não precisa filtrar por status do lead aqui.
 */
export async function findConflictingTourDates(
  supabase: SupabaseClient,
  date: string,
  excludeLeadId: string,
): Promise<ConflictingTourDate[]> {
  const { data, error } = await supabase
    .from('tour_dates')
    .select('id, tour_name, status, lead:price_leads(id, name)')
    .eq('date', date)
    .neq('lead_id', excludeLeadId);

  if (error) {
    console.error('[findConflictingTourDates]', error.message);
    return [];
  }
  return (data ?? []) as unknown as ConflictingTourDate[];
}

// Mantém o calendário coerente com o kanban: lead com proposta enviada/fechado
// atualiza os tours vinculados; lead perdido apaga as datas pra liberar o dia
// pra outro cliente. new/contacted não mexem no calendário.
export async function syncTourDatesWithLeadStatus(
  supabase: SupabaseClient,
  leadId: string,
  leadStatus: string,
): Promise<string | null> {
  if (leadStatus === 'lost') {
    const { error } = await supabase.from('tour_dates').delete().eq('lead_id', leadId);
    return error?.message ?? null;
  }

  const tourStatus: TourDateStatus | null =
    leadStatus === 'closed' ? 'fechado'
    : leadStatus === 'proposal_sent' ? 'proposta_enviada'
    : null;
  if (!tourStatus) return null;

  const { error } = await supabase
    .from('tour_dates')
    .update({ status: tourStatus })
    .eq('lead_id', leadId);
  return error?.message ?? null;
}

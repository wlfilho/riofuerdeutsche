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
  // Opcional de propósito: o que importa no calendário é a data + o cliente,
  // não o nome do passeio (isso já está descrito na proposta). Ver
  // createMissingTourDates abaixo.
  tour_name: string | null;
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
  tour_name: string | null;
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
  tour_name: string | null;
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

// ATENÇÃO: esta lógica está duplicada no banco desde a migration
// 20260831010000 (trigger price_leads_sync_tour_dates), que existe para cobrir
// escrita direta no Postgres. Mudou aqui, mude lá também.
//
// Mantém o calendário coerente com o kanban: lead com proposta enviada/fechado
// atualiza os tours vinculados (e cria as linhas que ainda não existirem, a
// partir de requested_days — ver nota abaixo); lead perdido apaga as datas
// pra liberar o dia pra outro cliente. new/contacted não mexem no calendário.
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

  const { error: updateError } = await supabase
    .from('tour_dates')
    .update({ status: tourStatus })
    .eq('lead_id', leadId);
  if (updateError) return updateError.message;

  return createMissingTourDates(supabase, leadId, tourStatus);
}

// A data pedida pelo cliente (price_leads.requested_days) e o registro
// operacional do tour (tour_dates) são conceitos diferentes — a segunda só
// nascia quando alguém clicava "Adicionar tour" e preenchia nome/horário/ponto
// de encontro. Isso deixava a porta aberta pra um lead virar proposal_sent/
// closed sem NUNCA ganhar uma linha em tour_dates, sumindo do calendário mesmo
// com a venda fechada (foi o caso do Joachim Tilg, 09/2026). Aqui garantimos
// que todo dia pedido tenha pelo menos uma linha assim que o lead entra em
// proposal_sent/closed — tour_name fica null (é detalhe, já está na
// proposta; o que não pode faltar no calendário é a data + o cliente).
async function createMissingTourDates(
  supabase: SupabaseClient,
  leadId: string,
  tourStatus: TourDateStatus,
): Promise<string | null> {
  const { data: lead, error: leadError } = await supabase
    .from('price_leads')
    .select('requested_days, pax')
    .eq('id', leadId)
    .single();
  if (leadError) return leadError.message;

  const requestedDays: string[] = lead?.requested_days ?? [];
  if (requestedDays.length === 0) return null;

  const { data: existing, error: existingError } = await supabase
    .from('tour_dates')
    .select('date')
    .eq('lead_id', leadId);
  if (existingError) return existingError.message;

  const existingDates = new Set((existing ?? []).map(d => d.date));
  const missingDays = requestedDays.filter(date => !existingDates.has(date));
  if (missingDays.length === 0) return null;

  const rows: TourDateInput[] = missingDays.map(date => ({
    lead_id: leadId,
    date,
    start_time: null,
    tour_name: null,
    status: tourStatus,
    pax: lead?.pax ?? null,
    meeting_point: null,
    agreed_price: null,
    anzahlung_paid: false,
    notes: null,
  }));

  const { error: insertError } = await supabase.from('tour_dates').insert(rows);
  return insertError?.message ?? null;
}

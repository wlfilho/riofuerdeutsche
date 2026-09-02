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
// partir dos dias vendidos — ver leadTourDays abaixo); lead perdido apaga as datas
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
// que todo dia vendido tenha pelo menos uma linha assim que o lead entra em
// proposal_sent/closed — tour_name fica null (é detalhe, já está na
// proposta; o que não pode faltar no calendário é a data + o cliente).
async function createMissingTourDates(
  supabase: SupabaseClient,
  leadId: string,
  tourStatus: TourDateStatus,
): Promise<string | null> {
  const { data: lead, error: leadError } = await supabase
    .from('price_leads')
    .select('requested_days, pax, proposal_id')
    .eq('id', leadId)
    .single();
  if (leadError) return leadError.message;

  const wantedDays = await leadTourDays(supabase, lead ?? null);
  if (wantedDays.length === 0) return null;

  const { data: existing, error: existingError } = await supabase
    .from('tour_dates')
    .select('date')
    .eq('lead_id', leadId);
  if (existingError) return existingError.message;

  const existingDates = new Set((existing ?? []).map(d => d.date));
  const missingDays = wantedDays.filter(date => !existingDates.has(date));
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

// Dias que o calendário precisa cobrir: o que o cliente pediu no formulário
// (requested_days) MAIS o que a proposta realmente vendeu (items[].day).
//
// Os dois divergem toda vez que o roteiro cresce depois da Anfrage, e
// requested_days nunca é reescrito — é o registro do pedido original, não do
// que foi vendido. Foi assim que o Blank Jürgen (out/2026) pediu só 25/10, a
// proposta fechou Maracanã no 25 e Rocinha no 26, e o dia 26 nunca apareceu no
// calendário. Quem manda na agenda é a proposta.
async function leadTourDays(
  supabase: SupabaseClient,
  lead: { requested_days?: string[] | null; proposal_id?: string | null } | null,
): Promise<string[]> {
  const days = new Set<string>(lead?.requested_days ?? []);

  if (lead?.proposal_id) {
    const { data: proposal, error } = await supabase
      .from('proposals')
      .select('items')
      .eq('id', lead.proposal_id)
      .single();

    if (error) {
      // Best-effort: proposta ilegível não pode impedir que os dias pedidos
      // entrem no calendário.
      console.error('[leadTourDays]', error.message);
    } else {
      for (const item of (proposal?.items ?? []) as { day?: string | null }[]) {
        if (item?.day) days.add(item.day);
      }
    }
  }

  return [...days].sort();
}

/**
 * Reaplica a sincronia do calendário para os leads de uma proposta.
 *
 * syncTourDatesWithLeadStatus só é chamado quando o STATUS muda, mas os dias
 * do roteiro mudam na edição da proposta, com o status parado em
 * sent/accepted. Sem isto, um dia acrescentado depois do envio não chega
 * nunca ao calendário.
 *
 * Só acrescenta: dia removido do roteiro mantém a linha em tour_dates, que
 * pode já carregar horário, ponto de encontro e sinal pago. Apagar isso
 * sozinho seria pior que a linha sobrando.
 */
export async function syncTourDatesWithProposalDays(
  supabase: SupabaseClient,
  proposalId: string,
): Promise<string | null> {
  const { data: leads, error } = await supabase
    .from('price_leads')
    .select('id, status')
    .eq('proposal_id', proposalId);
  if (error) return error.message;

  for (const lead of leads ?? []) {
    const syncError = await syncTourDatesWithLeadStatus(supabase, lead.id, lead.status);
    if (syncError) return syncError;
  }
  return null;
}

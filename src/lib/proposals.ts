import { createClient } from '@/utils/supabase/server';

export type ProposalServiceCategory = 'transfer' | 'tour' | 'extra' | 'atração';
export type ProposalServiceCostCurrency = 'EUR' | 'BRL';
export type ProposalServiceCostType = 'fixed' | 'per_pax' | 'per_hour';
export type ProposalServicePeriod = 'morning' | 'afternoon' | 'evening' | 'full_day';
export type ProposalStatus = 'draft' | 'sent' | 'accepted' | 'rejected';
export type ProposalTreatment = 'Sie' | 'du-ihr';

export interface ProposalServiceCost {
  id: string;
  service_id: string;
  description: string;
  base_price: number;
  currency: ProposalServiceCostCurrency;
  price_type: ProposalServiceCostType;
  sort_order: number;
}

export interface ProposalTransportTier {
  id: string;
  transport_type_id: string;
  min_pax: number;
  max_pax: number | null;
  // Diária fixa do veículo, cobrada uma vez por dia de tour em que ele é usado.
  car_daily_rate: number;
  // Motorista terceirizado, cobrado pelas horas de deslocamento do dia.
  driver_price_per_hour: number;
  currency: 'EUR' | 'BRL';
  sort_order: number;
}

export interface ProposalTransportType {
  id: string;
  slug: string;
  name: string;
  is_manual: boolean;
  is_included: boolean;
  is_active: boolean;
  sort_order: number;
  tiers: ProposalTransportTier[];
}

export interface ProposalService {
  id: string;
  slug: string;
  name: string;
  category: ProposalServiceCategory;
  description: string | null;
  duration_hours: number | null;
  transfer_hours_to: number | null;
  transfer_hours_back: number | null;
  suggested_period: ProposalServicePeriod | null;
  pdf_note: string | null;
  notes: string | null;
  is_active: boolean;
  sort_order: number;
  transport_type_id: string | null;
  transport_type: ProposalTransportType | null;
  costs: ProposalServiceCost[];
}

export interface ProposalItem {
  // 'day_transport' marca a linha sintética de carro + motorista de um dia;
  // ausente/'activity' para atividades normais.
  kind?: 'activity' | 'day_transport';
  day: string;
  service_slug: string;
  service_name: string;
  duration_hours: number | null;
  transfer_hours_to: number | null;
  transfer_hours_back: number | null;
  costs: Array<{
    description: string;
    base_price: number;
    currency: ProposalServiceCostCurrency;
    price_type: ProposalServiceCostType;
    total_eur: number;
  }>;
  total_eur: number;
  // Snapshot: a atividade usa veículo próprio (transporte por faixa)?
  uses_vehicle?: boolean;
  // Só em itens 'day_transport': horas de deslocamento cobradas do motorista.
  transport_hours?: number;
  note: string;
}

export interface Proposal {
  id: string;
  client_name: string;
  client_email: string | null;
  client_phone: string | null;
  pax: number;
  arrival_date: string | null;
  departure_date: string | null;
  treatment: ProposalTreatment;
  items: ProposalItem[];
  total_amount: number | null;
  exchange_rate: number | null;
  guide_rate: number | null;
  status: ProposalStatus;
  internal_notes: string | null;
  pdf_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProposalFormData {
  client_name: string;
  client_email: string;
  client_phone: string;
  pax: number;
  arrival_date: string;
  departure_date: string;
  treatment: ProposalTreatment;
  internal_notes: string;
  items: ProposalItem[];
  exchange_rate: number;
  guide_rate: number;
}

export async function getTransportTypes(): Promise<ProposalTransportType[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('proposal_transport_types')
    .select('*, tiers:proposal_transport_tiers(*)')
    .eq('is_active', true)
    .order('sort_order');

  if (error) throw new Error(error.message);
  return (data ?? []) as ProposalTransportType[];
}

export async function getProposalServices(): Promise<ProposalService[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('proposal_services')
    .select(`
      *,
      costs:proposal_service_costs(*),
      transport_type:proposal_transport_types(*, tiers:proposal_transport_tiers(*))
    `)
    .eq('is_active', true)
    .order('sort_order');

  if (error) throw new Error(error.message);
  return (data ?? []) as ProposalService[];
}

export async function getProposals(): Promise<Proposal[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('proposals')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return data as Proposal[];
}

export async function getProposalById(id: string): Promise<Proposal | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('proposals')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw new Error(error.message);
  }
  return data as Proposal;
}

export async function updateProposal(id: string, formData: ProposalFormData): Promise<Proposal> {
  const supabase = await createClient();
  const total_amount = formData.items.reduce((sum, item) => sum + item.total_eur, 0);
  const { data, error } = await supabase
    .from('proposals')
    .update({ ...formData, total_amount })
    .eq('id', id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as Proposal;
}

export async function createProposal(formData: ProposalFormData): Promise<Proposal> {
  const supabase = await createClient();

  const total_amount = formData.items.reduce((sum, item) => sum + item.total_eur, 0);

  const { data, error } = await supabase
    .from('proposals')
    .insert({
      ...formData,
      total_amount,
      status: 'draft' satisfies ProposalStatus,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as Proposal;
}

export async function updateProposalStatus(id: string, status: ProposalStatus): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from('proposals')
    .update({ status })
    .eq('id', id);

  if (error) throw new Error(error.message);
}

export async function deleteProposal(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from('proposals')
    .delete()
    .eq('id', id);

  if (error) throw new Error(error.message);
}

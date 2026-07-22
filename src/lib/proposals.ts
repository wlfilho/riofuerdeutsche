import { createClient } from '@/utils/supabase/server';
import { syncTourDatesWithLeadStatus } from '@/lib/tourDates';
import { createClient as createServiceClient } from '@supabase/supabase-js';

export type ProposalServiceCategory = 'transfer' | 'tour' | 'extra' | 'atração';
export type ProposalServiceCostCurrency = 'EUR' | 'BRL';
export type ProposalServiceCostType = 'fixed' | 'per_pax' | 'per_hour';
export type ProposalServicePeriod = 'morning' | 'afternoon' | 'evening' | 'full_day';
export type ProposalStatus = 'draft' | 'sent' | 'accepted' | 'rejected';
export type ProposalTreatment = 'Sie' | 'du-ihr';
// O que o cliente vê de preços no PDF/WhatsApp: só o total final, ou também o
// subtotal por dia. Preço por atividade nunca é exibido ao cliente.
export type ProposalPriceDisplay = 'total' | 'per_day';

export interface ProposalServiceCost {
  id: string;
  service_id: string;
  description: string;
  base_price: number;
  currency: ProposalServiceCostCurrency;
  price_type: ProposalServiceCostType;
  // Default da atividade: true = cobrado na proposta; false = cliente paga no
  // local (o valor ainda é exibido na proposta). Ajustável por proposta.
  include_in_price: boolean;
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
  // Descrição curta da atividade (proposal_services.description), congelada na
  // proposta — aparece embaixo do nome no link público e no PDF.
  service_description?: string | null;
  duration_hours: number | null;
  transfer_hours_to: number | null;
  transfer_hours_back: number | null;
  costs: Array<{
    description: string;
    base_price: number;
    currency: ProposalServiceCostCurrency;
    price_type: ProposalServiceCostType;
    // false = cliente paga no local (fora do total, exibido como "Vor Ort zu
    // zahlen"). Ausência (propostas antigas) = true.
    included?: boolean;
    total_eur: number;
  }>;
  total_eur: number;
  // Snapshot: a atividade usa veículo próprio (transporte por faixa)?
  uses_vehicle?: boolean;
  // Só em itens 'day_transport': horas de deslocamento cobradas do motorista.
  transport_hours?: number;
  // Só em itens 'day_transport': toggles do dia congelados na proposta.
  // Ausência (propostas antigas) equivale a ambos ligados.
  uses_driver?: boolean;
  uses_rental_car?: boolean;
  // Só em 'day_transport': tarifas congeladas usadas no cálculo (default da
  // faixa ou customizadas na proposta), na moeda transport_currency.
  car_daily_rate?: number | null;
  driver_price_per_hour?: number | null;
  transport_currency?: 'BRL' | 'EUR';
  // Custo embutido no honorário do guia: existe pro Will (aparece nas linhas
  // de `costs` como referência interna), mas NÃO soma no total do cliente —
  // o total_eur da linha carrega só a parte cobrada por fora.
  car_cost_included?: boolean;
  driver_cost_included?: boolean;
  note: string;
}

export interface Proposal {
  id: string;
  client_name: string;
  // Rótulo interno (ex.: "Plano chuva") pra diferenciar propostas do mesmo
  // cliente no admin; nunca aparece pro cliente.
  internal_label: string | null;
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
  price_display: ProposalPriceDisplay;
  // Anzahlung (sinal em EUR) pedido pra reservar; null/0 = proposta sem sinal.
  deposit_amount: number | null;
  // "Angebot gültig bis" (ISO date); null = sem prazo de validade.
  valid_until: string | null;
  // Token do link público /angebot/[token] enviado ao cliente.
  public_token: string;
  status: ProposalStatus;
  internal_notes: string | null;
  pdf_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProposalFormData {
  client_name: string;
  internal_label: string | null;
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
  price_display: ProposalPriceDisplay;
  deposit_amount: number | null;
  valid_until: string | null;
}

// Dados bancários do bloco "Buchung & Anzahlung" (site_settings, linha única).
export interface DepositBankInfo {
  account_holder: string;
  iban: string;
  bic: string;
  bank_name: string;
}

// site_settings tem RLS restrito ao admin; a página pública /angebot precisa
// dos dados bancários, então a leitura usa a service role — só no servidor.
export async function getDepositBankInfo(): Promise<DepositBankInfo> {
  const admin = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
  const { data } = await admin
    .from('site_settings')
    .select('bank_account_holder, bank_iban, bank_bic, bank_name')
    .eq('key', 'email_assinatura')
    .single();

  return {
    account_holder: data?.bank_account_holder ?? '',
    iban: data?.bank_iban ?? '',
    bic: data?.bank_bic ?? '',
    bank_name: data?.bank_name ?? '',
  };
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

// Página pública /angebot/[token]: proposals tem RLS restrito ao admin, então
// a busca por token usa a service role — só roda no servidor.
export async function getProposalByPublicToken(token: string): Promise<Proposal | null> {
  // Evita erro de cast do Postgres em tokens que nem são UUID.
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(token)) {
    return null;
  }
  const admin = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
  const { data, error } = await admin
    .from('proposals')
    .select('*')
    .eq('public_token', token)
    .single();

  if (error) return null;
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

// Cria uma nova proposta (rascunho) a partir de uma existente — caso típico:
// o cliente pede um itinerário alternativo (ex.: plano B pra dia de chuva).
// A cópia não herda id, public_token (o DB gera um novo), pdf_url nem status.
// A marca de cópia vai no rótulo interno; client_name fica intacto porque é o
// título da proposta que o cliente vê.
export async function duplicateProposal(id: string): Promise<Proposal> {
  const original = await getProposalById(id);
  if (!original) throw new Error('Proposta não encontrada.');

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('proposals')
    .insert({
      client_name: original.client_name,
      internal_label: original.internal_label
        ? `${original.internal_label} (Kopie)`
        : 'Kopie',
      client_email: original.client_email,
      client_phone: original.client_phone,
      pax: original.pax,
      arrival_date: original.arrival_date,
      departure_date: original.departure_date,
      treatment: original.treatment,
      items: original.items,
      total_amount: original.total_amount,
      exchange_rate: original.exchange_rate,
      guide_rate: original.guide_rate,
      price_display: original.price_display,
      deposit_amount: original.deposit_amount,
      valid_until: original.valid_until,
      internal_notes: original.internal_notes,
      status: 'draft' satisfies ProposalStatus,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as Proposal;
}

// O status da proposta comanda o funil do lead vinculado no CRM
// (price_leads.proposal_id): uma mudança aqui move o card do kanban junto,
// pra não ter que contar a mesma história em duas telas.
const LEAD_STATUS_BY_PROPOSAL_STATUS: Record<ProposalStatus, string> = {
  draft: 'contacted',
  sent: 'proposal_sent',
  accepted: 'closed',
  rejected: 'lost',
};

export async function updateProposalStatus(id: string, status: ProposalStatus): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from('proposals')
    .update({ status })
    .eq('id', id);

  if (error) throw new Error(error.message);

  // Sincroniza o lead vinculado (best-effort: proposta sem lead é normal, e
  // uma falha aqui não deve derrubar a troca de status da proposta).
  const leadStatus = LEAD_STATUS_BY_PROPOSAL_STATUS[status];
  const { data: syncedLeads, error: leadError } = await supabase
    .from('price_leads')
    .update({ status: leadStatus })
    .eq('proposal_id', id)
    .select('id');

  if (leadError) {
    console.error('[updateProposalStatus] failed to sync linked lead:', leadError.message);
    return;
  }

  for (const lead of syncedLeads ?? []) {
    const syncError = await syncTourDatesWithLeadStatus(supabase, lead.id, leadStatus);
    if (syncError) {
      console.error('[updateProposalStatus] failed to sync tour_dates:', syncError);
    }
  }
}

export async function deleteProposal(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from('proposals')
    .delete()
    .eq('id', id);

  if (error) throw new Error(error.message);
}

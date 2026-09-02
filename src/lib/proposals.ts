import { createClient } from '@/utils/supabase/server';
import { getServiceTranslation, getServicesWithTranslations } from '@/lib/services-i18n';
import { syncTourDatesWithLeadStatus, syncTourDatesWithProposalDays } from '@/lib/tourDates';
import { createClient as createServiceClient } from '@supabase/supabase-js';

export type ProposalServiceCategory = 'transfer' | 'tour' | 'extra' | 'atração';
export type ProposalServiceCostCurrency = 'EUR' | 'BRL';
export type ProposalServiceCostType = 'fixed' | 'per_pax' | 'per_hour';
export type ProposalServicePeriod = 'morning' | 'afternoon' | 'evening' | 'full_day';
export type ProposalStatus = 'draft' | 'sent' | 'accepted' | 'rejected';
export type ProposalTreatment = 'Sie' | 'du-ihr';
// Moeda em que a proposta é apresentada ao cliente (coluna proposals.currency).
export type ProposalCurrency = 'EUR' | 'BRL';
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
  category: ProposalServiceCategory;
  duration_hours: number | null;
  transfer_hours_to: number | null;
  transfer_hours_back: number | null;
  suggested_period: ProposalServicePeriod | null;
  notes: string | null;
  is_active: boolean;
  sort_order: number;
  transport_type_id: string | null;
  transport_type: ProposalTransportType | null;
  costs: ProposalServiceCost[];
  // ── Texto ──────────────────────────────────────────────────────────────────
  // Vem de proposal_service_translations (ver src/lib/services-i18n.ts), NÃO
  // das colunas homônimas de proposal_services, que estão DEPRECATED.
  name: string;
  description: string | null;
  pdf_note: string | null;
  // Idioma de onde o texto realmente veio + flag de fallback, para o builder
  // sinalizar ao admin que aquele serviço não tem tradução no idioma pedido.
  // Opcionais: só o Proposal Builder (getProposalServices) os preenche; o CRUD
  // do catálogo trabalha com o mapa de traduções inteiro.
  resolved_locale?: string;
  is_fallback?: boolean;
}

// Grupo de atividades: atalho de montagem do builder. Clicar num grupo expande
// suas atividades como itens individuais no dia — a proposta salva nunca
// referencia o grupo. Interno do admin, por isso o nome não é traduzido.
export interface ProposalServiceGroup {
  id: string;
  name: string;
  is_active: boolean;
  sort_order: number;
  // Ids de proposal_services, já na ordem definida no grupo.
  service_ids: string[];
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
  // Preço manual do tour digitado na proposta, por cima do calculado. Quando
  // presente, total_eur já é este valor; guardar separado permite a edição
  // re-hidratar o override em vez de recalcular por cima dele.
  price_override_eur?: number | null;
  // Snapshot: a atividade usa veículo próprio (transporte por faixa)?
  uses_vehicle?: boolean;
  // Atração coringa: atividade digitada direto na proposta, sem linha no
  // catálogo. Não há o que resolver em proposal_services, então o texto é
  // intocável — nem o congelamento do envio nem a troca de idioma no builder
  // mexem nele.
  is_custom?: boolean;
  // Só em itens coringa: slug do tipo de transporte escolhido, guardado para o
  // editor reexibir a escolha; o efeito no preço já está em uses_vehicle.
  transport_type_slug?: string | null;
  // Só em itens 'day_transport': horas de deslocamento cobradas do motorista.
  transport_hours?: number;
  // Só em itens 'day_transport': toggles do dia congelados na proposta.
  // Ausência (propostas antigas) equivale a ambos ligados.
  uses_driver?: boolean;
  uses_rental_car?: boolean;
  // Só em itens 'day_transport': janela do dia ("HH:MM") que o editor usa como
  // âncora da grade de horários. É planejamento interno, não sai pro cliente.
  // Ausência (propostas antigas) cai no default do editor.
  day_start_time?: string | null;
  day_end_time?: string | null;
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
  // O que o cliente paga: soma dos items, ou total_override_amount quando o
  // Will fecha um valor negociado por cima do cálculo.
  total_amount: number | null;
  // Preço final manual; null = total segue a soma calculada dos items.
  total_override_amount: number | null;
  // Com override: true = cliente vê Zwischensumme + linha de Rabatt + total;
  // false = só o preço final, sem menção ao desconto.
  discount_visible: boolean;
  exchange_rate: number | null;
  guide_rate: number | null;
  price_display: ProposalPriceDisplay;
  // Anzahlung (sinal em EUR) pedido pra reservar; null/0 = proposta sem sinal.
  deposit_amount: number | null;
  // "Angebot gültig bis" (ISO date); null = sem prazo de validade.
  valid_until: string | null;
  // Idioma do texto que o cliente recebe, escolhido no Proposal Builder a
  // partir de site_settings.supported_locales. Congelado no envio.
  locale?: string | null;
  // Moeda em que o cliente vê os preços. Congelada no envio junto do locale.
  currency?: ProposalCurrency | null;
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
  // Idioma e moeda escolhidos no builder; ambos NOT NULL no banco, então o
  // formulário sempre manda um valor concreto.
  locale: string;
  currency: ProposalCurrency;
  internal_notes: string;
  items: ProposalItem[];
  total_override_amount: number | null;
  discount_visible: boolean;
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

// Últimos fallbacks de idioma/moeda, iguais aos defaults das colunas
// proposals.locale e proposals.currency. Só entram em jogo quando nem a
// proposta nem site_settings dizem outra coisa.
export const DEFAULT_PROPOSAL_LOCALE = 'de';
export const DEFAULT_PROPOSAL_CURRENCY: ProposalCurrency = 'EUR';

/**
 * Catálogo de serviços do Proposal Builder já resolvido em um idioma.
 *
 * A parte NÃO-textual (custos, horas, transporte, categoria, ordenação) vem de
 * proposal_services; o texto (name/description/pdf_note) vem exclusivamente de
 * proposal_service_translations, via getServicesWithTranslations — as colunas
 * de texto de proposal_services estão DEPRECATED e não são mais lidas.
 *
 * Serviço ativo sem nenhuma tradução fica de fora (não há o que exibir), que é
 * o mesmo critério de getServicesWithTranslations.
 */
export async function getProposalServices(
  locale: string = DEFAULT_PROPOSAL_LOCALE,
): Promise<ProposalService[]> {
  const supabase = await createClient();
  const [{ data, error }, translations] = await Promise.all([
    supabase
      .from('proposal_services')
      .select(`
        id, slug, category, notes, is_active, sort_order,
        duration_hours, transfer_hours_to, transfer_hours_back,
        suggested_period, transport_type_id,
        costs:proposal_service_costs(*),
        transport_type:proposal_transport_types(*, tiers:proposal_transport_tiers(*))
      `)
      .eq('is_active', true)
      .order('sort_order'),
    getServicesWithTranslations(locale),
  ]);

  if (error) throw new Error(error.message);

  const textById = new Map(translations.map((t) => [t.id, t]));

  return (data ?? []).flatMap((row) => {
    const text = textById.get(row.id);
    if (!text) return [];
    return [
      {
        ...(row as unknown as Omit<
          ProposalService,
          'name' | 'description' | 'pdf_note' | 'resolved_locale' | 'is_fallback'
        >),
        name: text.name,
        description: text.description,
        pdf_note: text.pdfNote,
        resolved_locale: text.resolvedLocale,
        is_fallback: text.isFallback,
      },
    ];
  });
}

// Grupos ativos para o picker do builder. Membros que apontem para serviço
// inativo/sem tradução são filtrados depois, no cliente, contra o catálogo
// resolvido — aqui vão só os ids na ordem do grupo.
export async function getProposalServiceGroups(): Promise<ProposalServiceGroup[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('proposal_service_groups')
    .select('id, name, is_active, sort_order, items:proposal_service_group_items(service_id, sort_order)')
    .eq('is_active', true)
    .order('sort_order');

  if (error) throw new Error(error.message);

  return (data ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    is_active: row.is_active,
    sort_order: row.sort_order,
    service_ids: [...(row.items ?? [])]
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((i) => i.service_id),
  }));
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
  // total_amount é sempre o que o cliente paga: o preço final manual, quando
  // definido, vence a soma calculada — assim lista, PDF, WhatsApp e página
  // pública leem uma coluna só, sem conhecer a regra.
  const total_amount = formData.total_override_amount
    ?? formData.items.reduce((sum, item) => sum + item.total_eur, 0);
  const { data, error } = await supabase
    .from('proposals')
    .update({ ...formData, total_amount })
    .eq('id', id)
    .select()
    .single();
  if (error) throw new Error(error.message);

  // O roteiro pode ganhar um dia depois que a proposta já foi enviada ou
  // fechada, e aí o status não muda — que é o único gatilho da sincronia com o
  // calendário. Sem este empurrão o dia novo fica só na proposta (Blank
  // Jürgen, out/2026: Rocinha no dia 26 vendida e ausente da agenda).
  // Best-effort: falha aqui não pode derrubar o salvamento da proposta.
  const syncError = await syncTourDatesWithProposalDays(supabase, id);
  if (syncError) {
    console.error('[updateProposal] failed to sync tour_dates:', syncError);
  }

  return data as Proposal;
}

export async function createProposal(formData: ProposalFormData): Promise<Proposal> {
  const supabase = await createClient();

  const total_amount = formData.total_override_amount
    ?? formData.items.reduce((sum, item) => sum + item.total_eur, 0);

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
      locale: original.locale ?? DEFAULT_PROPOSAL_LOCALE,
      currency: original.currency ?? DEFAULT_PROPOSAL_CURRENCY,
      items: original.items,
      total_amount: original.total_amount,
      total_override_amount: original.total_override_amount,
      discount_visible: original.discount_visible,
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

// Slug sintético da linha de transporte do dia: não existe no catálogo de
// serviços, então não há tradução para resolver — a linha passa intacta.
const DAY_TRANSPORT_SLUG = '__day_transport__';

// Slug sintético das atrações coringa, pelo mesmo motivo: não existem em
// proposal_services, então nada deve tentar resolvê-las contra o catálogo.
const CUSTOM_SERVICE_SLUG = '__custom__';

/**
 * Congela o conteúdo da proposta no momento do envio.
 *
 * O que o cliente recebeu não pode mudar depois: quando a proposta vira 'sent',
 * cada item ganha o `service_description` resolvido no idioma da proposta e
 * gravado no jsonb. A partir daí, editar o texto do serviço no catálogo não
 * mexe mais em nada que já foi enviado.
 *
 * Idempotente por construção:
 *  - só roda na transição draft → sent (o chamador verifica o status atual);
 *  - dentro do item, só preenche `service_description` que esteja AUSENTE —
 *    reenviar uma proposta nunca re-resolve do catálogo atual;
 *  - `locale`/`currency` só são gravados se estiverem vazios (as colunas têm
 *    default NOT NULL, então na prática já vêm do builder).
 *
 * Best-effort quanto ao texto: um serviço sem tradução nenhuma fica com
 * description null, e não é motivo para abortar o envio.
 */
async function freezeProposalOnSend(id: string): Promise<void> {
  const supabase = await createClient();

  const { data: proposal, error: readError } = await supabase
    .from('proposals')
    .select('id, locale, currency, items')
    .eq('id', id)
    .single();

  if (readError || !proposal) {
    console.error('[freezeProposalOnSend] proposal not found:', readError?.message);
    return;
  }

  const locale = proposal.locale ?? DEFAULT_PROPOSAL_LOCALE;
  const currency = (proposal.currency ?? DEFAULT_PROPOSAL_CURRENCY) as ProposalCurrency;
  const items = (proposal.items ?? []) as ProposalItem[];

  // slug → id do serviço: os itens referenciam o catálogo por slug, mas
  // getServiceTranslation trabalha com o id.
  const slugsToResolve = [
    ...new Set(
      items
        .filter(
          (item) =>
            item.service_slug !== DAY_TRANSPORT_SLUG &&
            item.kind !== 'day_transport' &&
            // Atração coringa: o texto foi digitado na proposta, no idioma
            // dela. Não existe serviço de catálogo por trás para resolver.
            !item.is_custom &&
            item.service_slug !== CUSTOM_SERVICE_SLUG &&
            // Só o que está faltando: descrição já congelada é intocável.
            (item.service_description === undefined || item.service_description === null),
        )
        .map((item) => item.service_slug),
    ),
  ];

  const descriptionBySlug = new Map<string, string | null>();
  if (slugsToResolve.length > 0) {
    const { data: services } = await supabase
      .from('proposal_services')
      .select('id, slug')
      .in('slug', slugsToResolve);

    await Promise.all(
      (services ?? []).map(async (svc) => {
        const translation = await getServiceTranslation(svc.id, locale);
        descriptionBySlug.set(svc.slug, translation?.description ?? null);
      }),
    );
  }

  const frozenItems = items.map((item) => {
    if (!descriptionBySlug.has(item.service_slug)) return item;
    return { ...item, service_description: descriptionBySlug.get(item.service_slug) ?? null };
  });

  const { error: writeError } = await supabase
    .from('proposals')
    .update({ locale, currency, items: frozenItems })
    .eq('id', id);

  if (writeError) {
    console.error('[freezeProposalOnSend] failed to freeze content:', writeError.message);
  }
}

export async function updateProposalStatus(id: string, status: ProposalStatus): Promise<void> {
  const supabase = await createClient();

  // O congelamento acontece SÓ na entrada em 'sent' vinda de outro status:
  // reenviar (sent → sent) não pode re-resolver texto do catálogo.
  let shouldFreeze = false;
  if (status === 'sent') {
    const { data: current } = await supabase
      .from('proposals')
      .select('status')
      .eq('id', id)
      .single();
    shouldFreeze = current?.status !== 'sent';
  }

  const { error } = await supabase
    .from('proposals')
    .update({ status })
    .eq('id', id);

  if (error) throw new Error(error.message);

  if (shouldFreeze) await freezeProposalOnSend(id);

  // Sincroniza o lead vinculado (best-effort: proposta sem lead é normal, e
  // uma falha aqui não deve derrubar a troca de status da proposta).
  //
  // Desde a migration 20260831010000 o trigger proposals_sync_lead_status faz
  // o mesmo trabalho no banco, para cobrir quem escreve fora do app. As duas
  // escritas são idempotentes, então isto aqui vira no-op — mas se mudar o
  // mapa de status, mude nos DOIS lugares (o trigger não quebra build).
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

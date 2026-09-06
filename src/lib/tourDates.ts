// Shared types for tour_dates (calendário de tours)

import type { SupabaseClient } from '@supabase/supabase-js';
// Só o tipo: proposals.ts importa funções daqui, então importar valor de lá
// criaria ciclo em runtime. `import type` é apagado na compilação.
import type { ProposalItem } from '@/lib/proposals';

export type TourDateStatus = 'rascunho' | 'proposta_enviada' | 'fechado';

/**
 * @deprecated Rótulos de UI vivem no catálogo i18n (`admin.status.tourDate` e
 * `admin.status.tourDateShort`). Este módulo não é React e não pode usar hooks,
 * então a tradução é feita pelos componentes. Mantido só para não quebrar
 * importações externas.
 */
export const TOUR_DATE_STATUS_LABELS: Record<TourDateStatus, string> = {
  fechado: 'FECHADO',
  proposta_enviada: 'PROPOSTA ENVIADA',
  rascunho: 'RASCUNHO',
};

/**
 * Selo de status, igual no calendário, no dashboard e na página do lead.
 * Rascunho é deliberadamente apagado: ele existe pra você não esquecer o dia,
 * não pra competir com o que já está vendido.
 */
export const TOUR_DATE_STATUS_BADGE: Record<TourDateStatus, string> = {
  fechado: 'bg-green-50 text-green-700',
  proposta_enviada: 'bg-amber-50 text-amber-700',
  rascunho: 'bg-slate-100 text-slate-600',
};

/**
 * Família "parceiro/dia disputado": violeta.
 *
 * Três cores, três significados, e nenhum deles se repete:
 *  - verde/âmbar/cinza  → em que estágio está o negócio (StatusBadge);
 *  - violeta            → tudo que fala de guia parceiro;
 *  - vermelho           → empate de agenda, o único que exige decisão.
 *
 * Antes o aviso "só com parceiro" era âmbar, igual ao selo de "Proposta
 * enviada", e os dois empilhados no mesmo card viravam uma mancha só.
 */
export const PARTNER_BADGE = {
  /**
   * Violeta calmo: o aviso "Só com parceiro" e o registro "Guia: João". Não é
   * a mesma informação, mas nunca aparecem juntos — um dia com parceiro
   * definido já não está em disputa (ver dayConflictFor) — e os dois pedem o
   * mesmo peso na tela: presença sem alarme.
   */
  calmo: 'bg-violet-50 text-violet-700',
  /** "Parceiro a definir": tarefa aberta, o único dos três que pede ação. */
  pendente: 'bg-violet-100 text-violet-900 border border-violet-300',
} as const;

/** Bolinha do mini calendário e da legenda. */
export const TOUR_DATE_STATUS_DOT: Record<TourDateStatus, string> = {
  fechado: 'bg-green-600',
  proposta_enviada: 'bg-amber-400',
  rascunho: 'bg-slate-400',
};

export interface TourDateLead {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  // `items` alimenta o toggle de itinerário do card do calendário (as
  // atividades do dia vêm de proposals.items filtrado por day = date).
  proposal: { id: string; pdf_url: string | null; items?: ProposalItem[] | null } | null;
}

/** Motorista escalado no dia: profile com role='driver'. */
export interface TourDateDriver {
  id: string;
  first_name: string | null;
  email: string;
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
  // Dia entregue a um guia parceiro. `with_partner` sozinho é a decisão
  // ("não vou ser eu"), ainda sem saber quem; `partner_name` chega depois,
  // quando você fecha com alguém. Ver a migration 20260902140000.
  with_partner: boolean;
  partner_name: string | null;
  // Motorista escalado para dirigir neste dia. Diferente do parceiro (que
  // SUBSTITUI o Will como guia), o motorista soma-se ao tour e ganha acesso
  // de leitura ao próprio dia em /motorista.
  driver_id: string | null;
  notes: string | null;
  created_at: string;
  lead: TourDateLead | null;
  driver: TourDateDriver | null;
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
  with_partner: boolean;
  partner_name: string | null;
  driver_id: string | null;
  notes: string | null;
}

// !price_leads_proposal_id_fkey: desde que proposals ganhou lead_id existem
// DUAS relações entre as tabelas (proposta → lead e lead → proposta), e o
// PostgREST recusa o embed ambíguo. Aqui queremos sempre a proposta que manda
// no calendário, que é price_leads.proposal_id.
export const TOUR_DATE_SELECT =
  '*, lead:price_leads(id, name, email, phone, proposal:proposals!price_leads_proposal_id_fkey(id, pdf_url, items)), driver:profiles!tour_dates_driver_id_fkey(id, first_name, email)';

// ── Hierarquia do dia ────────────────────────────────────────────────────────
//
// Dois clientes no mesmo dia não são um empate automático: o que já está
// fechado pesa mais que uma proposta enviada, que pesa mais que um rascunho.
// Quem tem o dia não precisa de alerta nenhum (não há o que decidir), e quem
// está abaixo precisa saber com quem está disputando.
//
// Alarme vermelho fica reservado ao empate no topo — dois fechados, ou duas
// propostas enviadas sem nenhum fechado. Esse é o único caso que exige decisão.
// Espalhar vermelho pelo que já está resolvido só ensina a ignorar vermelho.
const TOUR_DATE_WEIGHT: Record<TourDateStatus, number> = {
  rascunho: 1,
  proposta_enviada: 2,
  fechado: 3,
};

export type DayConflict =
  /** Nada a resolver: dia livre, dia seu, ou dia já entregue a um parceiro. */
  | { kind: 'nenhum' }
  /** Empate no topo: dois compromissos do mesmo peso brigando pelo dia. */
  | { kind: 'empate' }
  /** O dia é de outro cliente; este aqui só acontece com parceiro. */
  | { kind: 'perdendo'; ownerName: string; ownerStatus: TourDateStatus };

type ConflictCandidate = {
  lead_id: string;
  date: string;
  tour_name: string | null;
  start_time: string | null;
  status: TourDateStatus;
  with_partner: boolean;
  lead?: {
    name: string;
    proposal?: { items?: ProposalItem[] | null } | null;
  } | null;
};

/**
 * Um tour disputa a agenda do dia? Dois casos ficam de fora:
 *
 *  - dia entregue a parceiro (a decisão já foi tomada, não consome sua agenda);
 *  - dia vazio de um roteiro fechado por dia. requested_days guarda os dias que
 *    o cliente OFERECEU na Anfrage, e todos viram linha em tour_dates quando o
 *    lead avança (ver createMissingTourDates) — mas quem manda na agenda é a
 *    proposta. Se ela distribui atividades por dia e não põe nenhuma nesta
 *    data, a linha é só o rastro da possibilidade, não um compromisso (Matthias
 *    ofereceu 24–26/10/2026, a proposta marcou só o 24, e os dias 25/26 vazios
 *    empatavam em vermelho com o tour real do Blank Jürgen).
 *
 * Desde 06/09/2026 a sincronia APAGA essas linhas vazias (ver
 * createMissingTourDates e a migration 20260906000000); aqui é a rede de
 * segurança pra sobra que escapar dela.
 *
 * Linha preenchida à mão (nome do tour ou horário) continua valendo mesmo fora
 * do roteiro: o admin gravou de propósito. E lead sem proposta itemizada
 * (era do PDF, tour avulso) também vale — tour_dates é a única verdade dele.
 */
export function competesForDay(t: Omit<ConflictCandidate, 'lead_id' | 'status'>): boolean {
  if (t.with_partner) return false;
  if (t.tour_name || t.start_time) return true;

  const itemDays = (t.lead?.proposal?.items ?? []).filter(i => i.day);
  if (itemDays.length === 0) return true;
  return itemDays.some(i => i.day === t.date);
}

/**
 * Situação de UM tour dentro do seu dia. `sameDay` são todos os tours daquela
 * data, incluindo o próprio.
 *
 * Dia que não disputa agenda (ver competesForDay) sai da conta dos dois lados:
 * não recebe alerta e não consome a sua agenda, então deixa de disputar o dia
 * com os outros clientes.
 */
export function dayConflictFor(
  tour: ConflictCandidate,
  sameDay: ConflictCandidate[],
): DayConflict {
  if (!competesForDay(tour)) return { kind: 'nenhum' };

  // Vários dias do mesmo cliente não competem entre si.
  const rivals = sameDay.filter(o => o.lead_id !== tour.lead_id && competesForDay(o));
  if (rivals.length === 0) return { kind: 'nenhum' };

  const owner = rivals.reduce((top, r) =>
    TOUR_DATE_WEIGHT[r.status] > TOUR_DATE_WEIGHT[top.status] ? r : top,
  );
  const ownerWeight = TOUR_DATE_WEIGHT[owner.status];
  const myWeight = TOUR_DATE_WEIGHT[tour.status];

  if (ownerWeight > myWeight) {
    return { kind: 'perdendo', ownerName: owner.lead?.name ?? '', ownerStatus: owner.status };
  }
  if (ownerWeight === myWeight) return { kind: 'empate' };
  return { kind: 'nenhum' };
}

export interface ConflictingTourDate {
  id: string;
  date: string;
  tour_name: string | null;
  start_time: string | null;
  status: TourDateStatus;
  with_partner: boolean;
  partner_name: string | null;
  lead: {
    id: string;
    name: string;
    proposal?: { items?: ProposalItem[] | null } | null;
  } | null;
}

/**
 * Outros tours (de leads diferentes) já agendados no mesmo dia.
 *
 * Devolve TODOS, inclusive os já entregues a um parceiro ou com o dia vazio no
 * roteiro: quem decide o que é alerta é o chamador, via competesForDay (dia que
 * não disputa agenda não deve disparar e-mail, mas serve de contexto quando o
 * e-mail sai). Ver dayConflictFor acima para a hierarquia usada na tela.
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
  // !price_leads_proposal_id_fkey: mesma desambiguação do TOUR_DATE_SELECT.
  const { data, error } = await supabase
    .from('tour_dates')
    .select(
      'id, date, tour_name, start_time, status, with_partner, partner_name, lead:price_leads(id, name, proposal:proposals!price_leads_proposal_id_fkey(items))',
    )
    .eq('date', date)
    .neq('lead_id', excludeLeadId);

  if (error) {
    console.error('[findConflictingTourDates]', error.message);
    return [];
  }
  return (data ?? []) as unknown as ConflictingTourDate[];
}

// ATENÇÃO: esta lógica está duplicada no banco desde a migration
// 20260831010000 (trigger price_leads_sync_tour_dates; versão atual na
// 20260906000000), que existe para cobrir escrita direta no Postgres. Mudou
// aqui, mude lá também.
//
// Mantém o calendário coerente com o kanban: todo lead que não está perdido
// atualiza os tours vinculados e cria as linhas que faltarem (ver leadTourDays
// abaixo); lead perdido apaga as datas pra liberar o dia pra outro cliente.
export const TOUR_STATUS_BY_LEAD_STATUS: Record<string, TourDateStatus> = {
  closed: 'fechado',
  // Tour concluído: os dias viram histórico, não somem do banco.
  completed: 'fechado',
  proposal_sent: 'proposta_enviada',
  // Lead ainda em conversa: se já existe proposta montada, os dias dela vão
  // pro calendário como RASCUNHO. Um dia que só existe no rascunho continua
  // sendo um dia que você combinou com alguém, e some da agenda é o pior
  // resultado possível (Lea Schallmo, 09/2026: link mandado por WhatsApp,
  // cliente abriu duas vezes da Alemanha, proposta seguiu 'draft' e os dias
  // 17 e 19/10 não existiam no calendário).
  contacted: 'rascunho',
  new: 'rascunho',
};

export async function syncTourDatesWithLeadStatus(
  supabase: SupabaseClient,
  leadId: string,
  leadStatus: string,
): Promise<string | null> {
  if (leadStatus === 'lost') {
    const { error } = await supabase.from('tour_dates').delete().eq('lead_id', leadId);
    return error?.message ?? null;
  }

  const tourStatus = TOUR_STATUS_BY_LEAD_STATUS[leadStatus] ?? null;
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
//
// Quem manda na agenda é a proposta: com roteiro itemizado por dia, só os dias
// com atividade existem no calendário. requested_days é a DISPONIBILIDADE que
// o cliente ofereceu na Anfrage (fica de contexto na página do lead e na
// montagem da proposta), não compromisso — vira linha só enquanto não há
// roteiro montado, pra venda fechada sem proposta itemizada não sumir da
// agenda. E quando o roteiro existe, o rastro vazio dos dias oferecidos e não
// usados é apagado aqui mesmo (Matthias, out/2026: ofereceu 24–26, a proposta
// marcou só o 24, e os dias 25/26 vazios ficavam de dono falso da agenda).
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

  const itemDays = await proposalItemDays(supabase, lead?.proposal_id);

  // Dia pedido na Anfrage só vale sem roteiro montado, e mesmo assim apenas
  // depois que existe proposta enviada ou fechada. Antes disso é intenção do
  // cliente, não compromisso seu.
  const wantedDays =
    itemDays.length > 0
      ? itemDays
      : tourStatus !== 'rascunho'
        ? [...new Set<string>(lead?.requested_days ?? [])].sort()
        : [];

  // Dia vazio fora do roteiro deixa de existir. Linha com qualquer dado manual
  // DO DIA (nome, horário, ponto de encontro, preço, parceiro, motorista,
  // nota) fica: o admin gravou de propósito, apagar seria pior que a sobra.
  // anzahlung_paid fica de fora da proteção: o sinal é da reserva inteira e o
  // AnzahlungToggle replica a flag em todas as linhas do lead — os dias reais
  // continuam carregando a informação.
  if (itemDays.length > 0) {
    const { error: cleanupError } = await supabase
      .from('tour_dates')
      .delete()
      .eq('lead_id', leadId)
      .not('date', 'in', `(${itemDays.join(',')})`)
      .is('tour_name', null)
      .is('start_time', null)
      .is('meeting_point', null)
      .is('agreed_price', null)
      .eq('with_partner', false)
      .is('driver_id', null)
      .is('notes', null);
    if (cleanupError) return cleanupError.message;
  }

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
    with_partner: false,
    partner_name: null,
    driver_id: null,
    notes: null,
  }));

  const { error: insertError } = await supabase.from('tour_dates').insert(rows);
  return insertError?.message ?? null;
}

// Dias com atividade no roteiro da proposta (items[].day, sem duplicatas).
// Vazio quando não há proposta vinculada ou o roteiro não é itemizado por dia
// (era do PDF, tour avulso) — aí requested_days segue sendo a única fonte.
//
// requested_days nunca é reescrito depois da Anfrage — é o registro do que o
// cliente OFERECEU, não do que foi vendido. O Blank Jürgen (out/2026) pediu só
// 25/10, a proposta fechou Maracanã no 25 e Rocinha no 26; o Matthias ofereceu
// 24–26 e a proposta marcou só o 24. Quem manda na agenda é a proposta.
async function proposalItemDays(
  supabase: SupabaseClient,
  proposalId: string | null | undefined,
): Promise<string[]> {
  if (!proposalId) return [];

  const { data: proposal, error } = await supabase
    .from('proposals')
    .select('items')
    .eq('id', proposalId)
    .single();

  if (error) {
    // Best-effort: proposta ilegível não pode impedir que os dias pedidos
    // entrem no calendário.
    console.error('[proposalItemDays]', error.message);
    return [];
  }

  const days = new Set<string>();
  for (const item of (proposal?.items ?? []) as { day?: string | null }[]) {
    if (item?.day) days.add(item.day);
  }
  return [...days].sort();
}

/**
 * Dias que o sistema conhece para um lead: os vendidos na proposta E os
 * pedidos na Anfrage (aqui é união mesmo — dia oferecido pelo cliente pertence
 * a ele como informação, ainda que não bloqueie agenda). As rotas de
 * tour_dates usam isto pra avisar quando o admin grava uma data que não
 * pertence ao cliente — o tour fantasma do Stefan Hülsdell (09/2026) nasceu
 * assim: modal aberto pelo fluxo do kanban, data pré-preenchida com o dia
 * corrente, e nenhuma checagem contra os dias que o lead de fato tinha (o tour
 * real era 07/02/2027).
 */
export async function knownLeadDays(
  supabase: SupabaseClient,
  leadId: string,
): Promise<string[]> {
  const { data: lead, error } = await supabase
    .from('price_leads')
    .select('requested_days, proposal_id')
    .eq('id', leadId)
    .single();
  if (error || !lead) return [];

  const days = new Set<string>(lead.requested_days ?? []);
  for (const day of await proposalItemDays(supabase, lead.proposal_id)) days.add(day);
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
 * Dia removido do roteiro: a linha vazia é apagada (dia sem atividade é dia
 * livre), mas linha com dado manual — horário, ponto de encontro, sinal pago —
 * fica. Apagar isso sozinho seria pior que a linha sobrando. Ver
 * createMissingTourDates.
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

import type { SupabaseClient } from '@supabase/supabase-js';
import { EMAIL_SEQUENCE, calculateSchedule } from '@/lib/tour-email-scheduler';

/**
 * Sequência de e-mails pré-tour, ancorada no LEAD.
 *
 * Até 31/08/2026 a âncora era `tour_clients`, uma cópia manual do cliente
 * criada em `/admin/clientes`. Ela era uma segunda verdade sobre quem fechou —
 * e, na prática, tinha só um registro de teste, enquanto 17 clientes reais não
 * recebiam e-mail nenhum. A tabela foi aposentada; os dados agora vêm de onde o
 * funil já os grava:
 *
 *   quem   → price_leads (nome, e-mail)
 *   quando → tour_dates com status 'fechado' (primeira e última data)
 *   quanto → a proposta aceita (total e sinal)
 *   o quê  → o itinerário da proposta aceita
 *
 * O lead, e não o contato, é a âncora: um contato pode fechar duas viagens em
 * anos diferentes, e cada uma tem a própria sequência.
 */

export type TourEmailRecipient = {
  lead_id: string;
  name: string;
  email: string;
  /** Primeira data fechada no calendário. É dela que o agendamento conta. */
  arrival_date: string;
  /** Última data fechada. */
  departure_date: string;
  /** Uma linha por dia; `formatTourDetailsHtml` transforma cada uma em bullet. */
  tour_details: string;
  total_amount: number | null;
  deposit_amount: number | null;
};

// Abreviações alemãs: o texto vai para o cliente, não para o admin.
const ABBR_WEEKDAYS = ['So.', 'Mo.', 'Di.', 'Mi.', 'Do.', 'Fr.', 'Sa.'];

/** "Fr. 12.09." — mesmo formato curto usado na saída da proposta. */
function germanDay(iso: string): string {
  const d = new Date(`${iso}T12:00:00`);
  const dia = String(d.getDate()).padStart(2, '0');
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  return `${ABBR_WEEKDAYS[d.getDay()]} ${dia}.${mes}.`;
}

type ProposalItemLite = { kind?: string | null; day: string; service_name: string };

/**
 * Itinerário da proposta como uma linha por dia:
 *   "Fr. 12.09.: Zuckerhut, Copacabana"
 *
 * Linhas 'day_transport' são carro + motorista do dia, não atividade: ficam de
 * fora, como no link público que o cliente já leu.
 */
export function buildTourDetails(items: ProposalItemLite[] | null | undefined): string {
  const byDay = new Map<string, string[]>();
  for (const item of items ?? []) {
    if (item.kind === 'day_transport') continue;
    byDay.set(item.day, [...(byDay.get(item.day) ?? []), item.service_name]);
  }
  return [...byDay.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([day, nomes]) => `${germanDay(day)}: ${nomes.join(', ')}`)
    .join('\n');
}

/**
 * Dados do destinatário para os templates da sequência.
 *
 * Devolve `null` quando ainda não há data fechada no calendário: sem data não
 * existe "14 dias antes da chegada", então não há o que agendar.
 */
export async function getTourEmailRecipient(
  supabase: SupabaseClient,
  leadId: string,
): Promise<TourEmailRecipient | null> {
  const [{ data: lead }, { data: dates }] = await Promise.all([
    supabase
      .from('price_leads')
      .select('id, name, email, proposal:proposals(items, total_amount, deposit_amount)')
      .eq('id', leadId)
      .maybeSingle(),
    supabase
      .from('tour_dates')
      .select('date, tour_name')
      .eq('lead_id', leadId)
      .eq('status', 'fechado')
      .order('date', { ascending: true }),
  ]);

  if (!lead?.email || !dates?.length) return null;

  const proposal = (Array.isArray(lead.proposal) ? lead.proposal[0] : lead.proposal) as
    | { items: ProposalItemLite[] | null; total_amount: number | null; deposit_amount: number | null }
    | null
    | undefined;

  // Sem proposta (fechamento manual da era anterior ao link), o calendário
  // ainda pode ter o nome do tour em cada dia — melhor que mandar vazio.
  const tourDetails = proposal?.items?.length
    ? buildTourDetails(proposal.items)
    : dates
        .filter(d => d.tour_name)
        .map(d => `${germanDay(d.date)}: ${d.tour_name}`)
        .join('\n');

  return {
    lead_id: leadId,
    name: lead.name,
    email: lead.email,
    arrival_date: dates[0].date,
    departure_date: dates[dates.length - 1].date,
    tour_details: tourDetails,
    total_amount: proposal?.total_amount ?? null,
    deposit_amount: proposal?.deposit_amount ?? null,
  };
}

export type EnsureSequenceResult =
  | { scheduled: true; recipient: TourEmailRecipient }
  | { scheduled: false; reason: 'ja-agendada' | 'sem-data-fechada' | 'erro'; error?: string };

/**
 * Agenda a sequência de um lead que fechou, uma única vez.
 *
 * Idempotente de propósito: o fechamento pode ser disparado de mais de um lugar
 * (troca de status da proposta, troca de status do lead no kanban), e nenhum
 * deles pode gerar uma segunda leva de e-mails para a mesma pessoa.
 *
 * NÃO envia o e-mail #1 aqui — quem chama decide, porque só o caminho do app
 * tem contexto para isso. O agendamento em si é seguro de repetir.
 */
export async function ensureTourEmailSequence(
  supabase: SupabaseClient,
  leadId: string,
): Promise<EnsureSequenceResult> {
  const { count, error: countError } = await supabase
    .from('email_sequence_log')
    .select('id', { count: 'exact', head: true })
    .eq('lead_id', leadId);

  if (countError) return { scheduled: false, reason: 'erro', error: countError.message };
  if ((count ?? 0) > 0) return { scheduled: false, reason: 'ja-agendada' };

  const recipient = await getTourEmailRecipient(supabase, leadId);
  if (!recipient) return { scheduled: false, reason: 'sem-data-fechada' };

  const schedule = calculateSchedule(new Date(`${recipient.arrival_date}T12:00:00`));
  const rows = schedule.map(item => ({
    lead_id: leadId,
    email_number: item.number,
    email_name: item.name,
    template_slug: item.slug,
    phase: item.phase,
    scheduled_date: item.date.toISOString().split('T')[0],
    status: item.status,
  }));

  const { error } = await supabase.from('email_sequence_log').insert(rows);
  if (error) return { scheduled: false, reason: 'erro', error: error.message };

  return { scheduled: true, recipient };
}

/** Número do e-mail de confirmação, disparado na hora em que o lead fecha. */
export const CONFIRMATION_EMAIL_NUMBER = EMAIL_SEQUENCE[0].number;

/**
 * Chamado quando um lead vira `closed` pelo app: agenda a sequência e dispara a
 * confirmação na hora, marcando o log conforme o resultado.
 *
 * Best-effort de propósito — falha de e-mail não pode derrubar o fechamento de
 * uma venda. Erros ficam no log da sequência e no console.
 *
 * NÃO roda no cron nem em trigger de banco: quem fechou antes de 31/08/2026 não
 * recebe e-mail retroativo (decisão registrada na nota do Obsidian). Fechamento
 * feito por escrita direta no Postgres, portanto, agenda nada — o kanban ou a
 * proposta é que abrem a sequência.
 */
export async function startTourEmailSequence(
  supabase: SupabaseClient,
  leadId: string,
): Promise<void> {
  const result = await ensureTourEmailSequence(supabase, leadId);
  if (!result.scheduled) {
    if (result.reason === 'erro') {
      console.error('[startTourEmailSequence]', leadId, result.error);
    }
    return;
  }

  // Import tardio: `sendConfirmationEmail` arrasta o cliente Resend, que não
  // precisa estar no bundle de quem só agenda.
  const { sendTourSequenceEmail } = await import('./sendTourSequenceEmail');
  const envio = await sendTourSequenceEmail(CONFIRMATION_EMAIL_NUMBER, result.recipient);

  const patch = 'error' in envio
    ? { status: 'error', error_message: envio.error }
    : { status: 'sent', sent_at: new Date().toISOString(), resend_id: envio.id, error_message: null };

  await supabase
    .from('email_sequence_log')
    .update(patch)
    .eq('lead_id', leadId)
    .eq('email_number', CONFIRMATION_EMAIL_NUMBER);

  if ('error' in envio) {
    console.error('[startTourEmailSequence] confirmação falhou:', leadId, envio.error);
  }
}

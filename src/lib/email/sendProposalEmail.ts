import { createClient as createServiceClient } from '@supabase/supabase-js';
import { formatEmailCurrency, formatEmailDate } from './render';
import {
  DEFAULT_PROPOSAL_CURRENCY,
  DEFAULT_PROPOSAL_LOCALE,
  type Proposal,
} from '@/lib/proposals';
import { sendTemplatedEmail } from './sendTemplatedEmail';

/**
 * E-mail que leva o link da proposta ao cliente.
 *
 * Motivo de existir: o WhatsApp é frágil como arquivo (conta suspensa, número
 * trocado, conversa perdida) e a proposta some junto. O e-mail fica na caixa do
 * cliente para sempre, e o link público (/[locale]/p/[token]) não expira nem
 * depende do status da proposta — quem tem o e-mail tem a proposta.
 *
 * Envio é sempre explícito (botão no admin), nunca efeito colateral de status:
 * e-mail não tem desfazer, e corrigir um status à mão não pode disparar
 * mensagem para o cliente.
 */

/** Domínio canônico dos links enviados ao cliente. */
const SITE_URL = 'https://riofuerdeutsche.de';

/** Slug do template por tratamento — os dois existem em cada locale suportado. */
const TEMPLATE_SLUG_BY_TREATMENT = {
  'du-ihr': 'angebot_link',
  Sie: 'angebot_link_formell',
} as const;

// Rótulos do bloco {{eckdaten}}. Ficam aqui (e não em email_templates) porque o
// bloco é montado condicionalmente: linha sem valor não entra. Locale fora da
// lista cai no alemão, igual ao resto do sistema de e-mail.
const ECKDATEN_LABELS: Record<string, Record<string, string>> = {
  de: {
    reisedaten: 'Reisedaten',
    personen: 'Personen',
    gesamtpreis: 'Gesamtpreis',
    anzahlung: 'Anzahlung',
    gueltig_bis: 'Angebot gültig bis',
  },
  'pt-BR': {
    reisedaten: 'Datas',
    personen: 'Pessoas',
    gesamtpreis: 'Valor total',
    anzahlung: 'Sinal',
    gueltig_bis: 'Proposta válida até',
  },
};

function labels(locale: string) {
  return ECKDATEN_LABELS[locale] ?? ECKDATEN_LABELS.de;
}

/** Dias de tour reais (dos itens); chegada/partida são só o primeiro e o último. */
function tourDays(proposal: Proposal): string[] {
  return [...new Set(proposal.items.map(i => i.day))].sort();
}

/**
 * Período da viagem para o assunto — o que faz o cliente reencontrar o e-mail
 * meses depois pela busca. Sem datas (proposta ainda sem itens), cai no nome da
 * cidade em vez de deixar o assunto pela metade.
 */
function reisezeitraum(proposal: Proposal, locale: string): string {
  const days = tourDays(proposal);
  const start = proposal.arrival_date ?? days[0] ?? null;
  const end = proposal.departure_date ?? days[days.length - 1] ?? null;

  if (!start) return 'Rio de Janeiro';
  if (!end || end === start) return formatEmailDate(start, locale);
  return `${formatEmailDate(start, locale)} – ${formatEmailDate(end, locale)}`;
}

/**
 * Bloco HTML com os dados essenciais, repetidos no corpo do e-mail de propósito:
 * se um dia o link mudar de forma, os números continuam na caixa do cliente.
 * Mesmo total que a página pública mostra (total_amount já é o preço final;
 * sem ele, a soma dos itens) e mesma moeda congelada na proposta.
 */
function eckdatenHtml(proposal: Proposal, locale: string): string {
  const currency = proposal.currency ?? DEFAULT_PROPOSAL_CURRENCY;
  const l = labels(locale);
  const money = (v: number) => formatEmailCurrency(v, locale, currency);

  const total =
    proposal.total_amount ?? proposal.items.reduce((sum, i) => sum + i.total_eur, 0);

  const lines: string[] = [
    `${l.reisedaten}: ${reisezeitraum(proposal, locale)}`,
    `${l.personen}: ${proposal.pax}`,
    `${l.gesamtpreis}: ${money(total)}`,
  ];

  if (proposal.deposit_amount && proposal.deposit_amount > 0) {
    lines.push(`${l.anzahlung}: ${money(proposal.deposit_amount)}`);
  }
  if (proposal.valid_until) {
    lines.push(`${l.gueltig_bis}: ${formatEmailDate(proposal.valid_until, locale)}`);
  }

  return `<p style="margin:0 0 24px;padding-left:16px;border-left:2px solid #dddddd;">${lines.join('<br/>')}</p>`;
}

/** Link público da proposta — rota neutra, domínio canônico, sem validade. */
export function publicProposalUrl(proposal: Proposal): string {
  return `${SITE_URL}/${proposal.locale || DEFAULT_PROPOSAL_LOCALE}/p/${proposal.public_token}`;
}

export type ProposalEmailLogEntry = {
  id: number;
  proposal_id: string;
  to_email: string;
  bcc_email: string | null;
  template_slug: string;
  locale: string;
  subject: string | null;
  status: 'sent' | 'error';
  resend_id: string | null;
  error_message: string | null;
  created_at: string;
};

function serviceClient() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

/**
 * Perfil do Instagram no formato que o e-mail precisa: `@perfil` para o texto
 * do botão e URL para o href. Vazio quando não há perfil configurado — aí o
 * template renderiza o botão apontando para lugar nenhum, então o bloco do
 * botão sai do HTML (ver `stripInstagramBlock`).
 */
function instagramFromSetting(raw: string | null | undefined) {
  const handle = (raw ?? '').trim().replace(/^@/, '').replace(/\/+$/, '');
  if (!handle) return null;
  // Já vem como URL completa em alguns tenants; aí o handle é o último segmento.
  const slug = handle.startsWith('http') ? handle.split('/').filter(Boolean).pop()! : handle;
  return { handle: `@${slug}`, url: `https://www.instagram.com/${slug}` };
}

/**
 * Sem Instagram configurado, o botão viraria um link vazio — melhor não existir.
 * O bloco é marcado no template por um comentário HTML, então o corte não
 * depende de casar markup inteiro (que o Will pode editar no admin).
 */
function stripInstagramBlock(html: string): string {
  return html.replace(/<!--\s*instagram:start\s*-->[\s\S]*?<!--\s*instagram:end\s*-->/gi, '');
}

/** Configurações do negócio que o e-mail da proposta usa. */
async function getBusinessSettings(): Promise<{
  bcc?: string;
  instagram: ReturnType<typeof instagramFromSetting>;
}> {
  const { data } = await serviceClient()
    .from('site_settings')
    .select('business_email, business_instagram')
    .limit(1)
    .single();
  return {
    // Cópia oculta para o Will: o envio fica arquivado do lado dele também.
    bcc: data?.business_email || undefined,
    instagram: instagramFromSetting(data?.business_instagram),
  };
}

export async function sendProposalEmail(
  proposal: Proposal,
): Promise<{ success: boolean; error?: string; entry?: ProposalEmailLogEntry }> {
  const to = proposal.client_email?.trim();
  if (!to) return { success: false, error: 'NO_EMAIL' };

  // Locale da proposta, não o do contato: o texto do e-mail acompanha o idioma
  // em que a proposta foi escrita e congelada.
  const locale = proposal.locale || DEFAULT_PROPOSAL_LOCALE;
  const slug =
    TEMPLATE_SLUG_BY_TREATMENT[proposal.treatment] ?? TEMPLATE_SLUG_BY_TREATMENT['du-ihr'];
  const { bcc, instagram } = await getBusinessSettings();

  const result = await sendTemplatedEmail({
    slug,
    to,
    locale,
    bcc,
    transformHtml: instagram ? undefined : stripInstagramBlock,
    data: {
      nome: proposal.client_name,
      email: to,
      link: publicProposalUrl(proposal),
      eckdaten: eckdatenHtml(proposal, locale),
      reisezeitraum: reisezeitraum(proposal, locale),
      instagram_url: instagram?.url ?? '',
      instagram_handle: instagram?.handle ?? '',
    },
  });

  // O log guarda também o que falhou: envio que não saiu é exatamente o que não
  // pode passar despercebido. Falha ao gravar o log não vira falha de envio.
  const { data: entry, error: logError } = await serviceClient()
    .from('proposal_email_log')
    .insert({
      proposal_id: proposal.id,
      to_email: to,
      bcc_email: bcc ?? null,
      template_slug: slug,
      locale,
      subject: result.subject ?? null,
      status: result.success ? 'sent' : 'error',
      resend_id: result.id ?? null,
      error_message: result.error ?? null,
    })
    .select('*')
    .single();

  if (logError) {
    console.error('[sendProposalEmail] failed to log send:', logError.message);
  }

  return {
    success: result.success,
    error: result.error,
    entry: (entry as ProposalEmailLogEntry) ?? undefined,
  };
}

/** Histórico de envios de uma proposta, do mais recente para o mais antigo. */
export async function getProposalEmailLog(
  proposalId: string,
): Promise<ProposalEmailLogEntry[]> {
  const { data, error } = await serviceClient()
    .from('proposal_email_log')
    .select('*')
    .eq('proposal_id', proposalId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[getProposalEmailLog]', error.message);
    return [];
  }
  return (data ?? []) as ProposalEmailLogEntry[];
}

export type ProposalEmailStatus = {
  last_sent_at: string | null;
  sent_count: number;
  error_count: number;
};

/**
 * Situação do envio por proposta, para a lista do admin marcar as propostas que
 * estão como "enviada" mas nunca saíram por e-mail.
 */
export async function getProposalEmailStatuses(): Promise<Record<string, ProposalEmailStatus>> {
  const { data, error } = await serviceClient().from('proposal_email_status').select('*');

  if (error) {
    console.error('[getProposalEmailStatuses]', error.message);
    return {};
  }

  const out: Record<string, ProposalEmailStatus> = {};
  for (const row of data ?? []) {
    out[row.proposal_id] = {
      last_sent_at: row.last_sent_at,
      // count() do Postgres chega como string via PostgREST.
      sent_count: Number(row.sent_count ?? 0),
      error_count: Number(row.error_count ?? 0),
    };
  }
  return out;
}

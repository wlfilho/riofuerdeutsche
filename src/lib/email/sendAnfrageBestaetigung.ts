import { createClient as createServiceClient } from '@supabase/supabase-js';
import { buildContactUrls, getSettings } from '@/lib/settings';
import { INTERESSE_TOURS, UNENTSCHLOSSEN } from '@/lib/interessen';
import deMessages from '@/i18n/messages/de.json';
import { DEFAULT_EMAIL_LOCALE } from './render';
import { sendTemplatedEmail } from './sendTemplatedEmail';

/**
 * Confirmação automática de quem preencheu a /anfrage.
 *
 * NÃO é proposta. É confirmação orientada: responde "chegou?", "o que acontece
 * agora?" e "quando ele me responde?", que são as três perguntas que a pessoa
 * tem no segundo em que sai da página de sucesso. A proposta continua sendo
 * feita à mão pelo Will, só para quem responde.
 *
 * SEM PREÇO em lugar nenhum: preço só existe na proposta (decisão da Fase 3).
 *
 * O texto do corpo mora em `email_templates` (slug 'anfrage_bestaetigung'),
 * editável pelo Will sem deploy. O que NÃO cabe no template é o que depende de
 * condição, porque a interpolação não tem `if`: os temas marcados variam de
 * lead para lead. Esse pedaço vira o bloco {{themenblock}}, montado aqui — o
 * mesmo padrão do {{eckdaten}} da proposta.
 */

/** Slug do template. O backup do texto está na migration que o semeou. */
const TEMPLATE_SLUG = 'anfrage_bestaetigung';

/**
 * A frase que devolve cada tema marcado.
 *
 * Fica aqui e não no i18n de propósito: é copy de e-mail, não de tela, e a
 * única cópia dela no sistema. O NOME do tema continua vindo do catálogo
 * (`interestLabelDe`), então o cliente lê no e-mail exatamente o rótulo que
 * marcou no formulário e não há duas versões para divergir.
 *
 * Alemão informal, primeira pessoa, sem travessão (ver CLAUDE.md). Cada linha
 * promete só o que o tour realmente entrega: é a primeira coisa que o cliente
 * vai cobrar na resposta.
 */
const THEMA_ZEILEN: Record<(typeof INTERESSE_TOURS)[number], string> = {
  'klassiker':
    'Christus, Zuckerhut und die Selarón-Treppe. Ich lege die Reihenfolge nach Licht und Andrang, damit ihr nicht in der längsten Schlange steht.',
  'natur-und-straende':
    'Strand und Regenwald liegen in Rio nur Minuten auseinander. Ich zeige euch die Ecken, an denen ihr wirklich Ruhe habt.',
  'favela-tour':
    'Die Rocinha zu Fuß, mit Menschen von dort. Respektvoll und ohne Gaffen, sonst würde ich es nicht anbieten.',
  'kultur-und-geschichte':
    'Das alte Zentrum, die Kolonialbauten und die Geschichte hinter den Postkartenmotiven.',
  'fussball':
    'Maracanã. Ob an euren Tagen ein Spiel läuft, prüfe ich im Spielplan. Sonst wird es die Stadiontour.',
  'tagesausfluege':
    'Ein Tag raus aus der Stadt, zum Beispiel nach Petrópolis in die Berge oder an die Küste nach Arraial do Cabo.',
};

/**
 * Quem marcou "Ich weiß es noch nicht" ganha bloco próprio, nunca um espaço
 * vazio. Não é escapatória: é o posicionamento do negócio, e o e-mail tem que
 * confirmar isso em vez de tratar como resposta faltante.
 */
const UNENTSCHLOSSEN_BLOCK =
  'Du bist noch unentschieden, und das ist völlig in Ordnung. Genau dafür bin ich da: Ich schlage dir etwas vor, das zu euren Tagen passt.';

/** Aviso de que o texto livre foi lido por gente, não engolido por um formulário. */
const WUNSCH_BLOCK =
  'Was ihr euch extra gewünscht habt, habe ich mir notiert und nehme es in den Vorschlag mit.';

const THEMEN_INTRO = 'Das interessiert euch:';

function p(inner: string, extraStyle = ''): string {
  return `<p style="margin:0 0 16px;${extraStyle}">${inner}</p>`;
}

/** Rótulo alemão do tema, do mesmo catálogo que o formulário renderiza. */
function interestLabelDe(id: string): string {
  const catalog = (deMessages as { public: { anfrage: Record<string, string> } })
    .public.anfrage;
  const key = `interesse${id
    .split('-')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join('')}`;
  return catalog[key] ?? id;
}

/** Dia por extenso em alemão, igual ao que a notificação interna já usa. */
function formatGermanDay(iso: string): string {
  return new Intl.DateTimeFormat(DEFAULT_EMAIL_LOCALE, {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(iso + 'T12:00:00Z'));
}

/**
 * Dias pedidos, um por linha. Um lead pode pedir muitos dias soltos, e uma
 * lista corrida separada por vírgula fica ilegível justamente no caso em que a
 * conferência importa mais.
 */
export function tageHtml(days: string[]): string {
  return days.map(formatGermanDay).join('<br/>');
}

export function paxLabelDe(pax: number, children: number): string {
  const erwachsene = `${pax} ${pax === 1 ? 'Erwachsener' : 'Erwachsene'}`;
  if (children <= 0) return erwachsene;
  return `${erwachsene} + ${children} ${children === 1 ? 'Kind' : 'Kinder'}`;
}

/**
 * O bloco condicional do e-mail: temas marcados, o caso 'unentschlossen' e o
 * aviso sobre o texto livre.
 *
 * Devolve string vazia quando não há nada a dizer. É o caso mais comum depois
 * do próprio tema, e o e-mail tem que continuar coerente sem ele: as datas, as
 * pessoas e o próximo passo se sustentam sozinhos.
 */
export function themenblockHtml(
  interessen: readonly string[] | null,
  wunsch: string | null,
): string {
  const blocks: string[] = [];
  const marked = interessen ?? [];

  if (marked.includes(UNENTSCHLOSSEN)) {
    blocks.push(p(UNENTSCHLOSSEN_BLOCK));
  } else {
    // A ordem é a do catálogo, não a do clique: o e-mail lê igual para todo
    // mundo, e ninguém percebe a ordem em que marcou os quadradinhos.
    const temas = INTERESSE_TOURS.filter(id => marked.includes(id));
    if (temas.length > 0) {
      const linhas = temas
        .map(id => `<strong>${interestLabelDe(id)}</strong><br/>${THEMA_ZEILEN[id]}`)
        .join('<br/><br/>');
      blocks.push(p(THEMEN_INTRO));
      blocks.push(p(linhas, 'padding-left:16px;border-left:2px solid #dddddd;'));
    }
  }

  if (wunsch && wunsch.trim()) {
    blocks.push(p(WUNSCH_BLOCK));
  }

  return blocks.join('\n\n    ');
}

export type AnfrageBestaetigungInput = {
  leadId: string;
  name: string;
  email: string;
  pax: number;
  children: number;
  /** Dias pedidos em ISO, já ordenados. */
  days: string[];
  /**
   * Temas marcados. Aceita string solta de propósito: `themenblockHtml` casa
   * contra o catálogo, então id desconhecido (tema aposentado, lead antigo)
   * simplesmente não vira linha, em vez de aparecer cru no e-mail do cliente.
   */
  interessen: readonly string[] | null;
  wunsch: string | null;
};

/**
 * Envia a confirmação e registra o resultado no lead.
 *
 * Nunca lança: a submissão do formulário já está gravada quando isto roda, e
 * e-mail que não sai não pode custar o lead. O que ele não faz é engolir a
 * falha em silêncio — grava `confirmation_error` no lead, que é o que aparece
 * no admin, e loga.
 */
export async function sendAnfrageBestaetigung(
  input: AnfrageBestaetigungInput,
): Promise<{ success: boolean; error?: string }> {
  let result: { success: boolean; error?: string; id?: string };

  try {
    const { whatsappHref } = buildContactUrls(await getSettings());

    result = await sendTemplatedEmail({
      slug: TEMPLATE_SLUG,
      to: input.email,
      locale: DEFAULT_EMAIL_LOCALE,
      data: {
        nome: input.name.trim().split(' ')[0],
        email: input.email,
        tage: tageHtml(input.days),
        pax: paxLabelDe(input.pax, input.children),
        themenblock: themenblockHtml(input.interessen, input.wunsch),
        whatsapp_url: whatsappHref,
      },
    });
  } catch (err) {
    result = { success: false, error: String(err) };
  }

  if (!result.success) {
    console.error('[anfrage] confirmação não enviada:', input.email, result.error);
  }

  await recordLeadConfirmation(input.leadId, result);

  return result;
}

/**
 * Anota no lead o resultado da confirmação, para o admin saber quem foi avisado
 * e, principalmente, quem NÃO foi: sem isso o Will assume que a pessoa recebeu
 * o e-mail e ela ficou no escuro, que é o problema que a fase inteira resolve.
 *
 * Best-effort de propósito. Falhar ao anotar não pode virar erro para o
 * cliente, que já recebeu (ou não) o e-mail de qualquer jeito. Mas aparece no
 * log. Também é chamada pelo caminho de campanha, que usa outro template e as
 * mesmas colunas.
 */
export async function recordLeadConfirmation(
  leadId: string,
  result: { success: boolean; error?: string; id?: string },
): Promise<void> {
  try {
    const supabase = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );
    await supabase
      .from('price_leads')
      .update({
        confirmation_sent_at: result.success ? new Date().toISOString() : null,
        confirmation_resend_id: result.id ?? null,
        // Só o último resultado importa: reenvio bem-sucedido limpa o erro.
        confirmation_error: result.success ? null : (result.error ?? 'unknown'),
      })
      .eq('id', leadId);
  } catch (err) {
    console.error('[anfrage] falha ao registrar a confirmação no lead:', leadId, err);
  }
}

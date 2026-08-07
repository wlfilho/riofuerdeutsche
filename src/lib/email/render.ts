import { createClient as createServiceClient } from '@supabase/supabase-js';
import { formatCurrency, formatDate } from '@/lib/format';

/**
 * Camada única de resolução e interpolação de templates de e-mail.
 *
 * Fonte única: tabela `email_templates`, chave (slug, locale). Os templates
 * hardcoded que existiam em `src/lib/email-templates/` foram aposentados; todo
 * envio passa a resolver o template aqui.
 *
 * As leituras usam service role de propósito: e-mails saem de rotas sem sessão
 * (cron, webhooks) e a RLS de `email_templates`/`site_settings` é admin-only —
 * uma leitura com client de sessão falharia em silêncio nesses contextos.
 */

/** Locale de fallback final dos e-mails — todo destinatário sem locale é 'de'. */
export const DEFAULT_EMAIL_LOCALE = 'de';

export type ResolvedEmailTemplate = {
  slug: string;
  locale: string;
  name: string;
  subject: string;
  html_body: string;
  /** true quando o template devolvido não está no locale pedido. */
  isFallback: boolean;
};

function serviceClient() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

/**
 * Interpolação de shortcodes `{{chave}}` — a única do sistema.
 * Chave sem valor fica visível no output (`{{chave}}`) em vez de sumir:
 * um shortcode não resolvido é bug de dados e deve aparecer no e-mail de teste.
 */
export function renderTemplate(
  template: string,
  vars: Record<string, string | undefined>,
): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] ?? `{{${key}}}`);
}

/**
 * Resolve um template por (slug, locale) com cascata:
 *   1. (slug, locale pedido)
 *   2. (slug, default_client_locale do tenant)
 *   3. (slug, 'de')
 * Fallback nunca é silencioso: loga warning com o que foi pedido e o que saiu.
 */
export async function getEmailTemplate(
  slug: string,
  locale: string,
): Promise<ResolvedEmailTemplate | null> {
  const supabase = serviceClient();

  const { data: rows, error } = await supabase
    .from('email_templates')
    .select('slug, locale, name, subject, html_body')
    .eq('slug', slug);

  if (error || !rows || rows.length === 0) {
    console.error(`[getEmailTemplate] template "${slug}" não encontrado:`, error?.message);
    return null;
  }

  const byLocale = new Map(rows.map((r) => [r.locale, r]));

  let resolved = byLocale.get(locale);
  if (!resolved) {
    // site_settings é single-row; sem filtro por key de propósito — a chave
    // real é 'email_assinatura' (acidente histórico) e filtrar por 'main'
    // já causou fallback silencioso uma vez.
    const { data: settings } = await supabase
      .from('site_settings')
      .select('default_client_locale')
      .limit(1)
      .single();
    const defaultClientLocale = settings?.default_client_locale ?? DEFAULT_EMAIL_LOCALE;
    resolved = byLocale.get(defaultClientLocale) ?? byLocale.get(DEFAULT_EMAIL_LOCALE);
  }

  if (!resolved) return null;

  const isFallback = resolved.locale !== locale;
  if (isFallback) {
    console.warn(
      `[getEmailTemplate] fallback de locale: "${slug}" pedido em "${locale}", enviado em "${resolved.locale}"`,
    );
  }

  return { ...resolved, isFallback };
}

/**
 * Locale do destinatário: `contacts.locale` quando o e-mail é de um contato
 * conhecido, senão 'de'. (Locale em `profiles` para área de membros é
 * pendência futura — hoje membros são só 'de'.)
 */
export async function getRecipientLocale(email: string): Promise<string> {
  if (!email) return DEFAULT_EMAIL_LOCALE;
  const supabase = serviceClient();
  const { data } = await supabase
    .from('contacts')
    .select('locale')
    .eq('email', email)
    .maybeSingle();
  return data?.locale ?? DEFAULT_EMAIL_LOCALE;
}

/** Data no formato do locale do destinatário (dd.MM.yyyy para 'de'). */
export function formatEmailDate(isoDate: string, locale: string = DEFAULT_EMAIL_LOCALE) {
  return formatDate(isoDate, locale);
}

/**
 * Valor monetário no locale do destinatário ("1.234,50 €" para 'de').
 *
 * O Intl separa o valor do símbolo com NBSP (U+00A0); os e-mails sempre usaram
 * espaço normal (U+0020). Normalizamos para os e-mails continuarem
 * byte-idênticos aos já enviados.
 */
export function formatEmailCurrency(
  value: number | null | undefined,
  locale: string = DEFAULT_EMAIL_LOCALE,
  currency: 'EUR' | 'BRL' = 'EUR',
): string {
  return formatCurrency(value ?? 0, currency, locale).replace(/\u00a0/g, ' ');
}

/**
 * `tour_details` (texto livre com linhas/bullets) vira o bloco HTML usado no
 * shortcode {{tour}} — mesmo markup que os envios de confirmação sempre usaram.
 */
export function formatTourDetailsHtml(raw: string): string {
  if (!raw) return '';
  const lines = raw.split(/•|\n/).map((l) => l.trim()).filter((l) => l.length > 0);
  if (lines.length === 0) return raw;
  return lines
    .map((line) => `<span style="display:block;padding:3px 0;font-weight:normal;">• ${line}</span>`)
    .join('');
}

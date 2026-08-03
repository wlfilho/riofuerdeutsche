import { createClient } from '@/utils/supabase/server';

/**
 * Camada de leitura do texto dos serviços do catálogo.
 *
 * A fonte de verdade é `proposal_service_translations` (PK service_id+locale).
 * As colunas antigas `proposal_services.name/description/pdf_note` estão
 * DEPRECATED: ficam no banco por segurança de rollback, mas ninguém mais lê
 * delas.
 *
 * As traduções são escritas À MÃO pelo guia. Nada aqui traduz automaticamente:
 * quando falta um idioma, cai no fallback e SINALIZA (isFallback), para o admin
 * mostrar que aquele texto não está no idioma pedido.
 */

export type ServiceTranslation = {
  name: string;
  description: string | null;
  pdfNote: string | null;
  /** Idioma de onde o texto realmente veio. */
  resolvedLocale: string;
  /** true quando resolvedLocale !== o locale pedido. */
  isFallback: boolean;
};

type TranslationRow = {
  service_id: string;
  locale: string;
  name: string;
  description: string | null;
  pdf_note: string | null;
};

/**
 * Cascata de fallback: locale pedido → default_client_locale → primeira
 * tradução existente. Devolve null só se o serviço não tiver tradução nenhuma.
 */
function resolveFromRows(
  rows: TranslationRow[],
  requestedLocale: string,
  defaultClientLocale: string,
): ServiceTranslation | null {
  if (rows.length === 0) return null;

  const pick =
    rows.find((r) => r.locale === requestedLocale) ??
    rows.find((r) => r.locale === defaultClientLocale) ??
    rows[0];

  return {
    name: pick.name,
    description: pick.description,
    pdfNote: pick.pdf_note,
    resolvedLocale: pick.locale,
    isFallback: pick.locale !== requestedLocale,
  };
}

// site_settings é proto-tenant: linha ÚNICA, cuja chave é 'email_assinatura'
// por acidente histórico (a tabela nasceu guardando só a assinatura de e-mail e
// foi ganhando colunas de config desde então). O resto do código filtra por
// esse valor literal — ver src/lib/settings.ts e src/lib/proposals.ts. Filtrar
// por 'main' não casa com nada e faz todo mundo cair no default silenciosamente.
const SETTINGS_ROW_KEY = 'email_assinatura';

/** Locale padrão dos clientes, de site_settings (proto-tenant, linha única). */
async function getDefaultClientLocale(): Promise<string> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('site_settings')
    .select('default_client_locale')
    .eq('key', SETTINGS_ROW_KEY)
    .single();

  return data?.default_client_locale ?? 'de';
}

/**
 * Locales que o catálogo suporta, de site_settings.supported_locales.
 * O admin usa isto para montar as abas de idioma — nada de lista hardcoded.
 */
export async function getSupportedLocales(): Promise<string[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('site_settings')
    .select('supported_locales')
    .eq('key', SETTINGS_ROW_KEY)
    .single();

  const locales = data?.supported_locales;
  return Array.isArray(locales) && locales.length > 0 ? locales : ['de'];
}

/** Texto de UM serviço no locale pedido, com fallback sinalizado. */
export async function getServiceTranslation(
  serviceId: string,
  locale: string,
): Promise<ServiceTranslation | null> {
  const supabase = await createClient();

  const [{ data: rows }, defaultClientLocale] = await Promise.all([
    supabase
      .from('proposal_service_translations')
      .select('service_id, locale, name, description, pdf_note')
      .eq('service_id', serviceId),
    getDefaultClientLocale(),
  ]);

  return resolveFromRows((rows ?? []) as TranslationRow[], locale, defaultClientLocale);
}

export type ServiceWithTranslation = {
  id: string;
  slug: string;
  category: string;
  /** Texto resolvido no locale pedido. */
  name: string;
  description: string | null;
  pdfNote: string | null;
  resolvedLocale: string;
  isFallback: boolean;
  /** Locales que este serviço realmente possui — alimenta os badges do admin. */
  availableLocales: string[];
};

/**
 * Catálogo inteiro já resolvido no locale pedido, para o Proposal Builder.
 * Uma query só para as traduções, em vez de N+1.
 */
export async function getServicesWithTranslations(
  locale: string,
): Promise<ServiceWithTranslation[]> {
  const supabase = await createClient();

  const [servicesRes, translationsRes, defaultClientLocale] = await Promise.all([
    supabase
      .from('proposal_services')
      .select('id, slug, category, sort_order')
      .eq('is_active', true)
      .order('sort_order'),
    supabase
      .from('proposal_service_translations')
      .select('service_id, locale, name, description, pdf_note'),
    getDefaultClientLocale(),
  ]);

  if (servicesRes.error) throw new Error(servicesRes.error.message);

  const byService = new Map<string, TranslationRow[]>();
  for (const row of (translationsRes.data ?? []) as TranslationRow[]) {
    const list = byService.get(row.service_id) ?? [];
    list.push(row);
    byService.set(row.service_id, list);
  }

  const out: ServiceWithTranslation[] = [];
  for (const svc of servicesRes.data ?? []) {
    const rows = byService.get(svc.id) ?? [];
    const resolved = resolveFromRows(rows, locale, defaultClientLocale);

    // Serviço sem nenhuma tradução não tem o que exibir: fica de fora do
    // builder em vez de renderizar em branco.
    if (!resolved) continue;

    out.push({
      id: svc.id,
      slug: svc.slug,
      category: svc.category,
      name: resolved.name,
      description: resolved.description,
      pdfNote: resolved.pdfNote,
      resolvedLocale: resolved.resolvedLocale,
      isFallback: resolved.isFallback,
      availableLocales: rows.map((r) => r.locale).sort(),
    });
  }

  return out;
}

/**
 * Mapa service_id → locales existentes. Usado pelo CRUD do catálogo para os
 * badges "DE ✓ PT —" sem carregar o texto inteiro.
 *
 * Um locale só conta como traduzido quando tem `name` não-vazio: uma linha com
 * name em branco é tradução pela metade e não deve virar ✓.
 */
export async function getTranslationCoverage(): Promise<Map<string, string[]>> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('proposal_service_translations')
    .select('service_id, locale, name');

  const map = new Map<string, string[]>();
  for (const row of data ?? []) {
    if (!row.name?.trim()) continue;
    const list = map.get(row.service_id) ?? [];
    list.push(row.locale);
    map.set(row.service_id, list);
  }
  for (const [k, v] of map) map.set(k, v.sort());
  return map;
}

// ─── Escrita ─────────────────────────────────────────────────────────────────

/** Payload que o admin manda: locale → texto. Campos ausentes viram null. */
export type TranslationInput = {
  name?: string | null;
  description?: string | null;
  pdf_note?: string | null;
};
export type TranslationsPayload = Record<string, TranslationInput>;

type SupabaseLike = Awaited<ReturnType<typeof createClient>>;

const trimOrNull = (v: string | null | undefined) => v?.trim() || null;

/**
 * Grava as traduções de um serviço em proposal_service_translations.
 *
 * Regras:
 *  - só locales em `supported_locales` são aceitos (ignora o resto em silêncio);
 *  - locale com `name` vazio é DELETADO em vez de gravado — é assim que o guia
 *    "desfaz" uma tradução, e evita linha órfã que ainda contaria como coberta
 *    se alguém esquecer o filtro de name;
 *  - upsert em (service_id, locale), a PK da tabela.
 *
 * NÃO toca em proposal_services.name/description/pdf_note: colunas deprecated.
 *
 * Devolve mensagem de erro ou null.
 */
export async function saveServiceTranslations(
  supabase: SupabaseLike,
  serviceId: string,
  translations: TranslationsPayload,
  supportedLocales: string[],
): Promise<string | null> {
  const rows: {
    service_id: string;
    locale: string;
    name: string;
    description: string | null;
    pdf_note: string | null;
    updated_at: string;
  }[] = [];
  const toDelete: string[] = [];

  for (const [locale, value] of Object.entries(translations)) {
    if (!supportedLocales.includes(locale)) continue;

    const name = trimOrNull(value?.name);
    if (!name) {
      toDelete.push(locale);
      continue;
    }

    rows.push({
      service_id: serviceId,
      locale,
      name,
      description: trimOrNull(value?.description),
      pdf_note: trimOrNull(value?.pdf_note),
      updated_at: new Date().toISOString(),
    });
  }

  if (rows.length > 0) {
    const { error } = await supabase
      .from('proposal_service_translations')
      .upsert(rows, { onConflict: 'service_id,locale' });
    if (error) return error.message;
  }

  if (toDelete.length > 0) {
    const { error } = await supabase
      .from('proposal_service_translations')
      .delete()
      .eq('service_id', serviceId)
      .in('locale', toDelete);
    if (error) return error.message;
  }

  return null;
}

/** Todas as traduções cruas por serviço, para hidratar o formulário do admin. */
export async function getAllTranslationsByService(): Promise<
  Record<string, Record<string, TranslationInput>>
> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('proposal_service_translations')
    .select('service_id, locale, name, description, pdf_note');

  const out: Record<string, Record<string, TranslationInput>> = {};
  for (const row of (data ?? []) as TranslationRow[]) {
    out[row.service_id] ??= {};
    out[row.service_id][row.locale] = {
      name: row.name,
      description: row.description,
      pdf_note: row.pdf_note,
    };
  }
  return out;
}

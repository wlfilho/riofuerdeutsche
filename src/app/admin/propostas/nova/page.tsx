import {
  DEFAULT_PROPOSAL_LOCALE,
  getProposalServiceGroups,
  getProposalServices,
  getTransportTypes,
} from '@/lib/proposals';
import { getDefaultClientLocale, getSupportedLocales } from '@/lib/services-i18n';
import { getSettings } from '@/lib/settings';
import { createClient } from '@/utils/supabase/server';
import NovaPropostaForm, { type InitialLead } from './NovaPropostaForm';

/**
 * Idioma inicial de uma proposta nova, em cascata:
 *   contato vinculado ao lead → site_settings.default_client_locale → 'de'.
 *
 * `proposals` não tem FK para `contacts`: o vínculo é ao contrário
 * (price_leads.proposal_id → proposals.id e price_leads.contact_id →
 * contacts.id). Como o builder chega aqui por `?lead_id=`, o lead é a ponte
 * para descobrir o contato e, com ele, o idioma do cliente. Sem lead (ou sem
 * contato vinculado), fica só o padrão do site.
 *
 * Um locale que não esteja em supported_locales é descartado: o select do
 * builder só oferece os suportados, e pré-selecionar algo fora da lista faria
 * o campo aparecer vazio.
 */
async function resolveInitialLocale(
  leadId: string | undefined,
  supportedLocales: string[],
): Promise<string> {
  const fromSettings = await getDefaultClientLocale();
  const fallback = supportedLocales.includes(fromSettings)
    ? fromSettings
    : (supportedLocales[0] ?? DEFAULT_PROPOSAL_LOCALE);

  if (!leadId) return fallback;

  const supabase = await createClient();
  const { data } = await supabase
    .from('price_leads')
    .select('contact:contacts(locale)')
    .eq('id', leadId)
    .single();

  const contact = data?.contact as { locale?: string | null } | { locale?: string | null }[] | null;
  const contactLocale = Array.isArray(contact) ? contact[0]?.locale : contact?.locale;

  return contactLocale && supportedLocales.includes(contactLocale) ? contactLocale : fallback;
}

export default async function NovaPropostaPage({
  searchParams,
}: {
  searchParams: Promise<{ lead_id?: string }>;
}) {
  const { lead_id } = await searchParams;

  const supportedLocales = await getSupportedLocales();
  const initialLocale = await resolveInitialLocale(lead_id, supportedLocales);

  // O catálogo já vem resolvido no idioma pré-selecionado; trocar o idioma no
  // builder recarrega a página para que os textos acompanhem.
  const [services, serviceGroups, transportTypes, settings] = await Promise.all([
    getProposalServices(initialLocale),
    getProposalServiceGroups(),
    getTransportTypes(),
    getSettings(),
  ]);

  let initialLead: InitialLead | null = null;
  if (lead_id) {
    const supabase = await createClient();
    const { data } = await supabase
      .from('price_leads')
      .select('id, name, email, phone, pax, children, requested_days')
      .eq('id', lead_id)
      .single();
    if (data) initialLead = data as InitialLead;
  }

  return (
    <NovaPropostaForm
      services={services}
      serviceGroups={serviceGroups}
      transportTypes={transportTypes}
      defaultGuideRate={settings.guide_rate_eur}
      defaultExchangeRate={settings.default_exchange_rate}
      maxHoursPerDay={settings.max_hours_per_day}
      supportedLocales={supportedLocales}
      initialLocale={initialLocale}
      initialLead={initialLead ?? undefined}
    />
  );
}

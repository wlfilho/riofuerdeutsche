import { DEFAULT_PROPOSAL_LOCALE, getProposalServices, getTransportTypes } from '@/lib/proposals';
import { getSettings } from '@/lib/settings';
import { createClient } from '@/utils/supabase/server';
import NovaPropostaForm, { type InitialLead } from './NovaPropostaForm';

export default async function NovaPropostaPage({
  searchParams,
}: {
  searchParams: Promise<{ lead_id?: string }>;
}) {
  const { lead_id } = await searchParams;
  // Proposta nova nasce no idioma padrão (hoje sempre 'de'); a escolha por
  // proposta é trabalho futuro.
  const [services, transportTypes, settings] = await Promise.all([
    getProposalServices(DEFAULT_PROPOSAL_LOCALE),
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
      transportTypes={transportTypes}
      defaultGuideRate={settings.guide_rate_eur}
      defaultExchangeRate={settings.default_exchange_rate}
      maxHoursPerDay={settings.max_hours_per_day}
      initialLead={initialLead ?? undefined}
    />
  );
}

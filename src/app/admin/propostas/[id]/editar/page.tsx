import {
  DEFAULT_PROPOSAL_CURRENCY,
  DEFAULT_PROPOSAL_LOCALE,
  getProposalById,
  getProposalServiceGroups,
  getProposalServices,
  getTransportTypes,
} from '@/lib/proposals';
import { getSupportedLocales } from '@/lib/services-i18n';
import { getSettings } from '@/lib/settings';
import { redirect } from 'next/navigation';
import NovaPropostaForm from '../../nova/NovaPropostaForm';

export default async function EditarPropostaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const proposal = await getProposalById(id);

  if (!proposal) redirect('/admin/propostas');

  // Na edição o idioma vem da própria proposta; propostas antigas sem a coluna
  // preenchida caem no padrão. O catálogo é resolvido nesse mesmo idioma.
  const proposalLocale = proposal.locale ?? DEFAULT_PROPOSAL_LOCALE;

  const [services, serviceGroups, transportTypes, settings, supportedLocales] = await Promise.all([
    getProposalServices(proposalLocale),
    getProposalServiceGroups(),
    getTransportTypes(),
    getSettings(),
    getSupportedLocales(),
  ]);

  // Um idioma gravado fora de supported_locales (ex.: removido das configs
  // depois) continua listado, senão o select trocaria o idioma da proposta
  // sozinho ao salvar.
  const localeOptions = supportedLocales.includes(proposalLocale)
    ? supportedLocales
    : [...supportedLocales, proposalLocale];

  return (
    <NovaPropostaForm
      services={services}
      serviceGroups={serviceGroups}
      transportTypes={transportTypes}
      defaultGuideRate={settings.guide_rate_eur}
      defaultExchangeRate={settings.default_exchange_rate}
      maxHoursPerDay={settings.max_hours_per_day}
      supportedLocales={localeOptions}
      initialLocale={proposalLocale}
      initialCurrency={proposal.currency ?? DEFAULT_PROPOSAL_CURRENCY}
      initialData={proposal}
      proposalId={id}
    />
  );
}

import {
  DEFAULT_PROPOSAL_LOCALE,
  getProposalById,
  getProposalServices,
  getTransportTypes,
} from '@/lib/proposals';
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

  // O catálogo é resolvido no idioma da própria proposta (hoje sempre 'de');
  // propostas antigas sem a coluna preenchida caem no padrão.
  const [services, transportTypes, settings] = await Promise.all([
    getProposalServices(proposal.locale ?? DEFAULT_PROPOSAL_LOCALE),
    getTransportTypes(),
    getSettings(),
  ]);

  return (
    <NovaPropostaForm
      services={services}
      transportTypes={transportTypes}
      defaultGuideRate={settings.guide_rate_eur}
      defaultExchangeRate={settings.default_exchange_rate}
      maxHoursPerDay={settings.max_hours_per_day}
      initialData={proposal}
      proposalId={id}
    />
  );
}

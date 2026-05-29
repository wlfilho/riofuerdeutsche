import { getProposalById, getProposalServices } from '@/lib/proposals';
import { getSettings } from '@/lib/settings';
import { redirect } from 'next/navigation';
import NovaPropostaForm from '../../nova/NovaPropostaForm';

export default async function EditarPropostaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [proposal, services, settings] = await Promise.all([
    getProposalById(id),
    getProposalServices(),
    getSettings(),
  ]);

  if (!proposal) redirect('/admin/propostas');

  return (
    <NovaPropostaForm
      services={services}
      defaultGuideRate={settings.guide_rate_eur}
      defaultExchangeRate={settings.default_exchange_rate}
      maxHoursPerDay={settings.max_hours_per_day}
      initialData={proposal}
      proposalId={id}
    />
  );
}

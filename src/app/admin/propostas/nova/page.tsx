import { getProposalServices } from '@/lib/proposals';
import { getSettings } from '@/lib/settings';
import NovaPropostaForm from './NovaPropostaForm';

export default async function NovaPropostaPage() {
  const [services, settings] = await Promise.all([
    getProposalServices(),
    getSettings(),
  ]);
  return (
    <NovaPropostaForm
      services={services}
      defaultGuideRate={settings.guide_rate_eur}
      defaultExchangeRate={settings.default_exchange_rate}
      maxHoursPerDay={settings.max_hours_per_day}
    />
  );
}

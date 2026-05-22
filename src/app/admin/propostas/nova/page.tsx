import { getProposalServices } from '@/lib/proposals';
import NovaPropostaForm from './NovaPropostaForm';

export default async function NovaPropostaPage() {
  const services = await getProposalServices();
  return <NovaPropostaForm services={services} />;
}

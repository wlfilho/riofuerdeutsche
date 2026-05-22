import { getProposalById } from '@/lib/proposals';
import { redirect } from 'next/navigation';
import PropostaOutputClient from './PropostaOutputClient';

export default async function PropostaOutputPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const proposal = await getProposalById(id);
  if (!proposal) redirect('/admin/propostas');
  return <PropostaOutputClient proposal={proposal} />;
}

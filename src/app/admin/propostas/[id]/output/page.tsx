import { getDepositBankInfo, getProposalById } from '@/lib/proposals';
import { redirect } from 'next/navigation';
import PropostaOutputClient from './PropostaOutputClient';

export default async function PropostaOutputPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [proposal, bank] = await Promise.all([getProposalById(id), getDepositBankInfo()]);
  if (!proposal) redirect('/admin/propostas');
  return <PropostaOutputClient proposal={proposal} bank={bank} />;
}

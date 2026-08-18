import { getDepositBankInfo, getProposalById } from '@/lib/proposals';
import { getProposalEmailLog } from '@/lib/email/sendProposalEmail';
import { redirect } from 'next/navigation';
import PropostaOutputClient from './PropostaOutputClient';

export default async function PropostaOutputPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [proposal, bank, emailLog] = await Promise.all([
    getProposalById(id),
    getDepositBankInfo(),
    getProposalEmailLog(id),
  ]);
  if (!proposal) redirect('/admin/propostas');
  return <PropostaOutputClient proposal={proposal} bank={bank} emailLog={emailLog} />;
}

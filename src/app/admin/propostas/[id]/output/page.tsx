import { getDepositBankInfo, getProposalById } from '@/lib/proposals';
import { getProposalEmailLog } from '@/lib/email/sendProposalEmail';
import { createClient } from '@/utils/supabase/server';
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

  // O sinal mora em `tour_dates`, não na proposta: passa pelo(s) lead(s) que
  // apontam pra esta proposta (price_leads.proposal_id) até chegar nas datas.
  const supabase = await createClient();
  const { data: proposalLeads } = await supabase
    .from('price_leads')
    .select('id')
    .eq('proposal_id', id);
  const leadIds = (proposalLeads ?? []).map(l => l.id);
  const { data: tourDates } = leadIds.length > 0
    ? await supabase.from('tour_dates').select('id, date, anzahlung_paid').in('lead_id', leadIds)
    : { data: [] };

  return (
    <PropostaOutputClient
      proposal={proposal}
      bank={bank}
      emailLog={emailLog}
      tourDates={tourDates ?? []}
    />
  );
}

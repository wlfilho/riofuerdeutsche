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

  // Um lead pode ter várias propostas (plano B, versão revisada, cópia), mas
  // só uma manda no calendário: a que está em price_leads.proposal_id. Quando
  // esta não é ela, os dias daqui NÃO estão na agenda, e isso precisa aparecer
  // na tela — foi silencioso até 09/2026.
  const { data: ownerLead } = proposal.lead_id
    ? await supabase
        .from('price_leads')
        .select('id, name, proposal_id')
        .eq('id', proposal.lead_id)
        .maybeSingle()
    : { data: null };

  const calendarOwner =
    ownerLead && ownerLead.proposal_id !== proposal.id
      ? { leadId: ownerLead.id, leadName: ownerLead.name, activeProposalId: ownerLead.proposal_id }
      : null;

  return (
    <PropostaOutputClient
      proposal={proposal}
      bank={bank}
      emailLog={emailLog}
      tourDates={tourDates ?? []}
      calendarOwner={calendarOwner}
    />
  );
}

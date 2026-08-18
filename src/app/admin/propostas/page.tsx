import Link from 'next/link';
import { getAdminTranslations } from '@/i18n/admin';
import { getProposals } from '@/lib/proposals';
import { getProposalAnalyticsSummaries } from '@/lib/proposalAnalytics';
import { getProposalEmailStatuses } from '@/lib/email/sendProposalEmail';
import { createClient } from '@/utils/supabase/server';
import PropostasListClient from './PropostasListClient';
import AnfrageLinkButton from './AnfrageLinkButton';
import CampaignFilter from '@/components/admin/CampaignFilter';
import { matchesCampaign } from '@/lib/campaigns';
import CampaignBadge from '../leads/components/CampaignBadge';

type PendingLead = {
  id: string;
  name: string;
  pax: number;
  children: number | null;
  requested_days: string[] | null;
  source: string;
  status: 'new' | 'contacted';
  campaign: string | null;
  created_at: string;
};

// Data curta pro chip do lead: dd/MM, sem ano (o ano cabe no contexto da lista).
function formatShortDate(iso: string): string {
  const [, m, d] = iso.split('T')[0].split('-');
  return `${d}/${m}`;
}

async function PendingLeadsStrip({ leads }: { leads: PendingLead[] }) {
  const t = await getAdminTranslations('admin.propostas');
  const tSource = await getAdminTranslations('admin.status.source');
  const tLeadStatus = await getAdminTranslations('admin.status.lead');

  if (leads.length === 0) return null;

  return (
    <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl p-4">
      <h2 className="text-sm font-bold text-amber-900 mb-3">
        {t('solicitacoesAguardando', { count: leads.length })}
      </h2>
      <div className="space-y-2">
        {leads.map(lead => (
          <div
            key={lead.id}
            className="flex flex-wrap items-center gap-x-4 gap-y-1 bg-white border border-amber-100 rounded-lg px-4 py-2.5 text-sm"
          >
            <span className="font-semibold text-gray-800">{lead.name}</span>
            <span
              className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                lead.status === 'new' ? 'bg-gray-100 text-gray-700' : 'bg-blue-100 text-blue-700'
              }`}
            >
              {tLeadStatus(lead.status)}
            </span>
            <span className="text-gray-600">
              {lead.pax} pax
              {(lead.children ?? 0) > 0 && ` + ${t('criancas', { count: lead.children ?? 0 })}`}
            </span>
            {(lead.requested_days?.length ?? 0) > 0 && (
              <span className="text-gray-500">
                📅 {(lead.requested_days ?? []).map(formatShortDate).join(' · ')}
              </span>
            )}
            <span className="text-xs text-gray-400">
              {t('via')}
              {tSource.has(lead.source) ? tSource(lead.source) : lead.source}
            </span>
            <CampaignBadge campaign={lead.campaign} />
            <Link
              href={`/admin/propostas/nova?lead_id=${lead.id}`}
              className="ml-auto px-3 py-1.5 text-xs font-semibold bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shrink-0"
            >
              {t('criarProposta')}
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}

export default async function PropostasPage({
  searchParams,
}: {
  searchParams: Promise<{ campaign?: string }>;
}) {
  const { campaign } = await searchParams;
  const t = await getAdminTranslations('admin.propostas');
  const supabase = await createClient();
  const [allProposals, analytics, emailStatuses, { data: pendingLeads }, { data: proposalLeads }] =
    await Promise.all([
      getProposals(),
      getProposalAnalyticsSummaries(),
      getProposalEmailStatuses(),
      // Leads still in the pre-proposal pipeline; leads moved to lost/closed in
      // the CRM (or already linked to a proposal) drop out of this strip.
      supabase
        .from('price_leads')
        .select('id, name, pax, children, requested_days, source, status, campaign, created_at')
        .is('proposal_id', null)
        .in('status', ['new', 'contacted'])
        .order('created_at', { ascending: false }),
      // `proposals` não guarda campanha: quem sabe de onde a proposta veio é o
      // lead que aponta para ela. Este mapa dá a etiqueta a cada proposta.
      supabase
        .from('price_leads')
        .select('proposal_id, campaign')
        .not('proposal_id', 'is', null),
    ]);

  const campaignByProposal = new Map<string, string | null>(
    (proposalLeads ?? []).map(l => [l.proposal_id as string, l.campaign as string | null]),
  );

  const proposals = allProposals.filter(p =>
    matchesCampaign(campaignByProposal.get(p.id) ?? null, campaign),
  );
  const leads = ((pendingLeads ?? []) as PendingLead[]).filter(l =>
    matchesCampaign(l.campaign, campaign),
  );

  return (
    <div className="p-4 sm:p-6 md:p-10">
      <div className="max-w-7xl">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{t('titulo')}</h1>
          <div className="flex flex-wrap items-center gap-2">
            <CampaignFilter value={campaign} />
            <AnfrageLinkButton />
            <Link
              href="/admin/propostas/nova"
              className="px-4 py-2 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 transition-colors"
            >
              {t('novaProposta')}
            </Link>
          </div>
        </div>

        <PendingLeadsStrip leads={leads} />

        <PropostasListClient
          initialProposals={proposals}
          analytics={analytics}
          emailStatuses={emailStatuses}
          campaignByProposal={Object.fromEntries(campaignByProposal)}
        />
      </div>
    </div>
  );
}

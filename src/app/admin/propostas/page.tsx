import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { getProposals } from '@/lib/proposals';
import { createClient } from '@/utils/supabase/server';
import PropostasListClient from './PropostasListClient';
import AnfrageLinkButton from './AnfrageLinkButton';

type PendingLead = {
  id: string;
  name: string;
  pax: number;
  children: number | null;
  requested_days: string[] | null;
  source: string;
  status: 'new' | 'contacted';
  created_at: string;
};

// Data curta pro chip do lead: dd/MM, sem ano (o ano cabe no contexto da lista).
function formatShortDate(iso: string): string {
  const [, m, d] = iso.split('T')[0].split('-');
  return `${d}/${m}`;
}

async function PendingLeadsStrip({ leads }: { leads: PendingLead[] }) {
  const t = await getTranslations('admin.propostas');
  const tSource = await getTranslations('admin.status.source');
  const tLeadStatus = await getTranslations('admin.status.lead');

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

export default async function PropostasPage() {
  const t = await getTranslations('admin.propostas');
  const supabase = await createClient();
  const [proposals, { data: pendingLeads }] = await Promise.all([
    getProposals(),
    // Leads still in the pre-proposal pipeline; leads moved to lost/closed in
    // the CRM (or already linked to a proposal) drop out of this strip.
    supabase
      .from('price_leads')
      .select('id, name, pax, children, requested_days, source, status, created_at')
      .is('proposal_id', null)
      .in('status', ['new', 'contacted'])
      .order('created_at', { ascending: false }),
  ]);

  return (
    <div className="p-4 sm:p-6 md:p-10">
      <div className="max-w-7xl">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{t('titulo')}</h1>
          <div className="flex flex-wrap items-center gap-2">
            <AnfrageLinkButton />
            <Link
              href="/admin/propostas/nova"
              className="px-4 py-2 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 transition-colors"
            >
              {t('novaProposta')}
            </Link>
          </div>
        </div>

        <PendingLeadsStrip leads={(pendingLeads ?? []) as PendingLead[]} />

        <PropostasListClient initialProposals={proposals} />
      </div>
    </div>
  );
}

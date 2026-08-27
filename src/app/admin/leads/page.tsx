import { getAdminTranslations } from '@/i18n/admin';
import { createClient } from '@/utils/supabase/server';
import LeadsViewWrapper from './components/LeadsViewWrapper';
import LeadManualSheet from './components/LeadManualSheet';
import { fetchLeadGroupsMap, matchesGroup, type LeadGroup } from '@/lib/leadGroups';
import { todayInRio, withArchiveState, type ArchiveState } from '@/lib/leadArchive';

export type { LeadGroup };

export async function generateMetadata() {
  const t = await getAdminTranslations('admin.crm');
  return { title: t('metaTitleLeads') };
}

export type LeadStatus = 'new' | 'contacted' | 'proposal_sent' | 'closed' | 'lost';
export type LeadSource = 'calculator' | 'email' | 'whatsapp' | 'instagram' | 'referral' | 'other' | 'form';

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  pax: number;
  days: number | null;
  activities: unknown;
  estimated_min: number | null;
  estimated_max: number | null;
  source: LeadSource;
  status: LeadStatus;
  proposal_id: string | null;
  notes: string | null;
  claude_chat_url: string | null;
  campaign: string | null;
  campaign_data: unknown;
  requested_days: string[] | null;
  archived_at: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Lead com a data do tour, o estado de arquivamento e as etiquetas manuais
 * — ver src/lib/leadArchive.ts e src/lib/leadGroups.ts.
 */
export type LeadView = Lead & ArchiveState & { groups: LeadGroup[] };

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; source?: string; group?: string; q?: string }>;
}) {
  const params = await searchParams;
  const t = await getAdminTranslations('admin.crm');
  const tc = await getAdminTranslations('admin.common');
  const supabase = await createClient();

  const [{ data, error }, { data: tourDateRows }, groupsByLead] = await Promise.all([
    supabase.from('price_leads').select('*').order('created_at', { ascending: false }),
    supabase.from('tour_dates').select('lead_id, date'),
    fetchLeadGroupsMap(supabase),
  ]);

  const allLeads: LeadView[] = withArchiveState(
    (data ?? []) as Lead[],
    (tourDateRows ?? []) as { lead_id: string; date: string }[],
    todayInRio(),
  ).map(lead => ({ ...lead, groups: groupsByLead.get(lead.id) ?? [] }));

  // Metrics always from full list, arquivados incluídos: conversão só faz
  // sentido sobre negócios encerrados, que são justamente os que saem da visão.
  const total = allLeads.length;
  const countNew = allLeads.filter(l => l.status === 'new').length;
  const countContacted = allLeads.filter(l => l.status === 'contacted').length;
  const countClosed = allLeads.filter(l => l.status === 'closed').length;
  const countArchived = allLeads.filter(l => l.archiveReason !== null).length;
  const conversionRate = total > 0 ? Math.round((countClosed / total) * 100) : 0;

  // Apply filters server-side. Status fica de fora deste primeiro passo: no
  // kanban ele é a própria coluna, então filtrar por status esvaziaria o
  // quadro. Os demais filtros valem para as duas visões — sem isso o kanban
  // ignorava a campanha e misturava o carnaval com o resto.
  let filtered = allLeads.filter(l => matchesGroup(l.groups, params.group));
  if (params.source) filtered = filtered.filter(l => l.source === params.source);
  if (params.q) {
    const q = params.q.toLowerCase();
    filtered = filtered.filter(
      l => l.name.toLowerCase().includes(q) || l.email.toLowerCase().includes(q)
    );
  }

  const kanbanLeads = filtered;
  const tableLeads = params.status
    ? filtered.filter(l => l.status === params.status)
    : filtered;

  const metrics = [
    { label: tc('total'), value: total },
    { label: t('novos'), value: countNew },
    { label: t('emContato'), value: countContacted },
    { label: t('fechados'), value: countClosed },
    { label: t('conversao'), value: `${conversionRate}%` },
    { label: t('arquivados'), value: countArchived, muted: true },
  ];

  return (
    <div className="p-4 sm:p-6 md:p-10">
      <div className="max-w-7xl">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{t('leads')}</h1>
            <p className="text-gray-500 mt-1">{t('subtituloLeads')}</p>
          </div>
          <LeadManualSheet />
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          {metrics.map(card => (
            <div
              key={card.label}
              className={`rounded-xl border p-4 text-center ${
                card.muted ? 'bg-gray-50 border-gray-200 border-dashed' : 'bg-white border-gray-200'
              }`}
            >
              <p className={`text-2xl font-bold ${card.muted ? 'text-gray-400' : 'text-gray-900'}`}>{card.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{card.label}</p>
            </div>
          ))}
        </div>

        {/* Fetch error */}
        {error && (
          <div className="mb-4 p-3 rounded-lg text-sm bg-red-50 text-red-800 border border-red-200">
            {t('erroCarregarLeads')}{error.message}
          </div>
        )}

        {/* Table / Kanban */}
        <LeadsViewWrapper
          allLeads={kanbanLeads}
          filteredLeads={tableLeads}
          currentStatus={params.status}
          currentSource={params.source}
          currentGroup={params.group}
          currentQ={params.q}
        />
      </div>
    </div>
  );
}

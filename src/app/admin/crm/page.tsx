import { getAdminTranslations } from '@/i18n/admin';
import { createClient } from '@/utils/supabase/server';
import CrmViewWrapper from './components/CrmViewWrapper';
import CampaignFilter from '@/components/admin/CampaignFilter';
import { matchesCampaign } from '@/lib/campaigns';
import { todayInRio, withArchiveState, type ArchiveState } from '@/lib/leadArchive';

export async function generateMetadata() {
  const t = await getAdminTranslations('admin.crm');
  return { title: t('metaTitle') };
}

export type LeadStatus = 'new' | 'contacted' | 'proposal_sent' | 'closed' | 'lost';
export type LeadSource = 'calculator' | 'email' | 'whatsapp' | 'instagram' | 'referral' | 'other';

export interface CrmLead {
  id: string;
  contact_id: string | null;
  name: string;
  email: string;
  phone: string | null;
  pax: number;
  children: number | null;
  days: number | null;
  estimated_min: number | null;
  estimated_max: number | null;
  source: LeadSource;
  status: LeadStatus;
  proposal_id: string | null;
  requested_days: string[] | null;
  notes: string | null;
  campaign: string | null;
  campaign_data: unknown;
  archived_at: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Lead com os campos que o kanban precisa mas não estão na linha da tabela:
 * a data do tour (que mora em `tour_dates`) e o estado de arquivamento.
 */
export type CrmLeadView = CrmLead & ArchiveState;

export default async function CrmPage({
  searchParams,
}: {
  searchParams: Promise<{ campaign?: string }>;
}) {
  const { campaign } = await searchParams;
  const t = await getAdminTranslations('admin.crm');
  const tc = await getAdminTranslations('admin.common');
  const supabase = await createClient();

  const [{ data, error }, { data: tourDateRows }] = await Promise.all([
    supabase.from('price_leads').select('*').order('created_at', { ascending: false }),
    supabase.from('tour_dates').select('lead_id, date'),
  ]);

  // As métricas seguem o filtro: com o carnaval selecionado, a taxa de
  // conversão que aparece é a daquela campanha, não a da carteira inteira.
  const leads: CrmLeadView[] = withArchiveState(
    ((data ?? []) as CrmLead[]).filter(l => matchesCampaign(l.campaign, campaign)),
    (tourDateRows ?? []) as { lead_id: string; date: string }[],
    todayInRio(),
  );

  // Métricas cobrem a carteira inteira, arquivados incluídos: conversão só faz
  // sentido sobre negócios encerrados, que são justamente os que saem da visão.
  const total = leads.length;
  const countNew = leads.filter(l => l.status === 'new').length;
  const countContacted = leads.filter(l => l.status === 'contacted').length;
  const countProposal = leads.filter(l => l.status === 'proposal_sent').length;
  const countClosed = leads.filter(l => l.status === 'closed').length;
  const countLost = leads.filter(l => l.status === 'lost').length;
  const countArchived = leads.filter(l => l.archiveReason !== null).length;
  const eligible = total - countLost;
  const conversion = eligible > 0 ? Math.round((countClosed / eligible) * 100) : 0;

  const metrics = [
    { label: tc('total'), value: total },
    { label: t('novos'), value: countNew },
    { label: t('emContato'), value: countContacted },
    { label: t('proposta'), value: countProposal },
    { label: t('fechados'), value: countClosed },
    { label: t('conversao'), value: `${conversion}%` },
    { label: t('arquivados'), value: countArchived, muted: true },
  ];

  return (
    <div className="p-4 sm:p-6 md:p-10">
      <div className="max-w-[1600px]">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{t('titulo')}</h1>
            <p className="text-gray-500 mt-1">{t('subtitulo')}</p>
          </div>
          <CampaignFilter value={campaign} />
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-7 gap-3 mb-6">
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

        {error && (
          <div className="mb-4 p-3 rounded-lg text-sm bg-red-50 text-red-800 border border-red-200">
            {t('erroCarregarLeads')}{error.message}
          </div>
        )}

        <CrmViewWrapper leads={leads} />
      </div>
    </div>
  );
}

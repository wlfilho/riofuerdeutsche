import { getAdminTranslations } from '@/i18n/admin';
import { createClient } from '@/utils/supabase/server';
import CrmViewWrapper from './components/CrmViewWrapper';
import CampaignFilter from '@/components/admin/CampaignFilter';
import { matchesCampaign } from '@/lib/campaigns';

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
  created_at: string;
  updated_at: string;
}

export default async function CrmPage({
  searchParams,
}: {
  searchParams: Promise<{ campaign?: string }>;
}) {
  const { campaign } = await searchParams;
  const t = await getAdminTranslations('admin.crm');
  const tc = await getAdminTranslations('admin.common');
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('price_leads')
    .select('*')
    .order('created_at', { ascending: false });

  // As métricas seguem o filtro: com o carnaval selecionado, a taxa de
  // conversão que aparece é a daquela campanha, não a da carteira inteira.
  const leads: CrmLead[] = ((data ?? []) as CrmLead[]).filter(l =>
    matchesCampaign(l.campaign, campaign),
  );

  const total = leads.length;
  const countNew = leads.filter(l => l.status === 'new').length;
  const countContacted = leads.filter(l => l.status === 'contacted').length;
  const countProposal = leads.filter(l => l.status === 'proposal_sent').length;
  const countClosed = leads.filter(l => l.status === 'closed').length;
  const countLost = leads.filter(l => l.status === 'lost').length;
  const eligible = total - countLost;
  const conversion = eligible > 0 ? Math.round((countClosed / eligible) * 100) : 0;

  const metrics = [
    { label: tc('total'), value: total },
    { label: t('novos'), value: countNew },
    { label: t('emContato'), value: countContacted },
    { label: t('proposta'), value: countProposal },
    { label: t('fechados'), value: countClosed },
    { label: t('conversao'), value: `${conversion}%` },
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

        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mb-6">
          {metrics.map(card => (
            <div key={card.label} className="bg-white rounded-xl border border-gray-200 p-4 text-center">
              <p className="text-2xl font-bold text-gray-900">{card.value}</p>
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

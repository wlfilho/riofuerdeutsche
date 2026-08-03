import { getAdminTranslations } from '@/i18n/admin';
import { createClient } from '@/utils/supabase/server';
import LeadsViewWrapper from './components/LeadsViewWrapper';
import LeadManualSheet from './components/LeadManualSheet';

export async function generateMetadata() {
  const t = await getAdminTranslations('admin.crm');
  return { title: t('metaTitleLeads') };
}

export type LeadStatus = 'new' | 'contacted' | 'proposal_sent' | 'closed' | 'lost';
export type LeadSource = 'calculator' | 'email' | 'whatsapp' | 'instagram' | 'referral' | 'other';

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
  created_at: string;
  updated_at: string;
}

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; source?: string; q?: string }>;
}) {
  const params = await searchParams;
  const t = await getAdminTranslations('admin.crm');
  const tc = await getAdminTranslations('admin.common');
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('price_leads')
    .select('*')
    .order('created_at', { ascending: false });

  const allLeads: Lead[] = (data ?? []) as Lead[];

  // Metrics always from full list
  const total = allLeads.length;
  const countNew = allLeads.filter(l => l.status === 'new').length;
  const countContacted = allLeads.filter(l => l.status === 'contacted').length;
  const countClosed = allLeads.filter(l => l.status === 'closed').length;
  const conversionRate = total > 0 ? Math.round((countClosed / total) * 100) : 0;

  // Apply filters server-side
  let filtered = allLeads;
  if (params.status) filtered = filtered.filter(l => l.status === params.status);
  if (params.source) filtered = filtered.filter(l => l.source === params.source);
  if (params.q) {
    const q = params.q.toLowerCase();
    filtered = filtered.filter(
      l => l.name.toLowerCase().includes(q) || l.email.toLowerCase().includes(q)
    );
  }

  const metrics = [
    { label: tc('total'), value: total },
    { label: t('novos'), value: countNew },
    { label: t('emContato'), value: countContacted },
    { label: t('fechados'), value: countClosed },
    { label: t('conversao'), value: `${conversionRate}%` },
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
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-6">
          {metrics.map(card => (
            <div key={card.label} className="bg-white rounded-xl border border-gray-200 p-4 text-center">
              <p className="text-2xl font-bold text-gray-900">{card.value}</p>
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
          allLeads={allLeads}
          filteredLeads={filtered}
          currentStatus={params.status}
          currentSource={params.source}
          currentQ={params.q}
        />
      </div>
    </div>
  );
}

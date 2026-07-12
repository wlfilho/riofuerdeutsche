import { createClient } from '@/utils/supabase/server';
import CrmViewWrapper from './components/CrmViewWrapper';

export const metadata = { title: 'CRM — Admin' };

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
  created_at: string;
  updated_at: string;
}

export default async function CrmPage() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('price_leads')
    .select('*')
    .order('created_at', { ascending: false });

  const leads: CrmLead[] = (data ?? []) as CrmLead[];

  const total = leads.length;
  const countNew = leads.filter(l => l.status === 'new').length;
  const countContacted = leads.filter(l => l.status === 'contacted').length;
  const countProposal = leads.filter(l => l.status === 'proposal_sent').length;
  const countClosed = leads.filter(l => l.status === 'closed').length;
  const countLost = leads.filter(l => l.status === 'lost').length;
  const eligible = total - countLost;
  const conversion = eligible > 0 ? Math.round((countClosed / eligible) * 100) : 0;

  const metrics = [
    { label: 'Total', value: total },
    { label: 'Novos', value: countNew },
    { label: 'Em Contato', value: countContacted },
    { label: 'Proposta', value: countProposal },
    { label: 'Fechados', value: countClosed },
    { label: 'Conversão', value: `${conversion}%` },
  ];

  return (
    <div className="p-4 sm:p-6 md:p-10">
      <div className="max-w-[1600px]">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">CRM</h1>
            <p className="text-gray-500 mt-1">Pipeline de leads e conversões</p>
          </div>
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
            Erro ao carregar leads: {error.message}
          </div>
        )}

        <CrmViewWrapper leads={leads} />
      </div>
    </div>
  );
}

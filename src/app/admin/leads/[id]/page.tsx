import { notFound } from 'next/navigation';
import { getAdminTranslations } from '@/i18n/admin';
import { createClient } from '@/utils/supabase/server';
import LeadHeader from './components/LeadHeader';
import LeadDataCard from './components/LeadDataCard';
import LeadActivities from './components/LeadActivities';
import LeadStatusCard from './components/LeadStatusCard';
import LeadContactTimeline from './components/LeadContactTimeline';
import type { LeadContact } from './components/LeadContactTimeline';
import DeleteLeadButton from './components/DeleteLeadButton';
import type { Lead } from '../page';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const t = await getAdminTranslations('admin.crm');
  const supabase = await createClient();
  const { data } = await supabase
    .from('price_leads')
    .select('name')
    .eq('id', id)
    .single();
  return {
    title: data?.name
      ? t('metaTitleLeadNome', { nome: data.name })
      : t('metaTitleLead'),
  };
}

export default async function LeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [leadResult, contactsResult] = await Promise.all([
    supabase.from('price_leads').select('*').eq('id', id).single(),
    supabase
      .from('lead_contacts')
      .select('*')
      .eq('lead_id', id)
      .order('created_at', { ascending: true }),
  ]);

  if (leadResult.error || !leadResult.data) {
    notFound();
  }

  const lead = leadResult.data as Lead;
  const contacts: LeadContact[] = (contactsResult.data ?? []) as LeadContact[];

  return (
    <div className="p-4 sm:p-6 md:p-10">
      <div className="max-w-6xl">
        {/* Header */}
        <LeadHeader lead={lead} />

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main column */}
          <div className="lg:col-span-2 space-y-6">
            <LeadDataCard lead={lead} />
            <LeadActivities activities={lead.activities} />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <LeadStatusCard
              leadId={lead.id}
              initialStatus={lead.status}
              initialNotes={lead.notes}
            />
            <LeadContactTimeline leadId={lead.id} initialContacts={contacts} />
          </div>
        </div>

        {/* Delete */}
        <DeleteLeadButton leadId={lead.id} leadName={lead.name} />
      </div>
    </div>
  );
}

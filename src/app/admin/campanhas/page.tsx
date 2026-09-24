import { createClient } from '@/utils/supabase/server';
import { CAMPAIGN_LIST } from '@/lib/campaigns';
import CampanhasClient, { type CampaignHistoryRow } from './CampanhasClient';

export const metadata = { title: 'Campanhas' };

export default async function CampanhasPage() {
  const supabase = await createClient();

  const [{ data: templates }, { data: sends }] = await Promise.all([
    supabase
      .from('email_templates')
      .select('slug, name, subject')
      .eq('category', 'Campanha')
      .eq('locale', 'de')
      .order('name'),
    supabase
      .from('campaign_sends')
      .select('campaign, template_slug, status, created_at'),
  ]);

  // Agrupado em JS: são poucas linhas por mês e o PostgREST não faz GROUP BY.
  const byKey = new Map<string, CampaignHistoryRow>();
  for (const s of sends ?? []) {
    const key = `${s.campaign}|${s.template_slug}`;
    const row = byKey.get(key) ?? {
      campaign: s.campaign,
      templateSlug: s.template_slug,
      sent: 0,
      failed: 0,
      lastAt: s.created_at,
    };
    if (s.status === 'sent') row.sent += 1;
    else row.failed += 1;
    if (s.created_at > row.lastAt) row.lastAt = s.created_at;
    byKey.set(key, row);
  }
  const history = [...byKey.values()].sort((a, b) => b.lastAt.localeCompare(a.lastAt));

  return (
    <div className="p-4 sm:p-6 md:p-10">
      <div className="max-w-5xl">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Campanhas</h1>
          <p className="text-gray-500 mt-1">
            Envio de e-mail em lote para os leads de uma campanha.
          </p>
        </div>

        <CampanhasClient
          campaigns={CAMPAIGN_LIST.map(c => ({ slug: c.slug, label: c.label }))}
          templates={templates ?? []}
          history={history}
        />
      </div>
    </div>
  );
}

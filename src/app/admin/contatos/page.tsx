import { getAdminTranslations } from '@/i18n/admin';
import { createClient } from '@/utils/supabase/server';
import ContactsPageClient, { type ContactListItem } from './ContactsPageClient';

export async function generateMetadata() {
  const t = await getAdminTranslations('admin.contatos');
  return { title: t('metaTitle') };
}

export default async function ContatosPage() {
  const supabase = await createClient();

  const [
    { data: contacts },
    { data: profiles },
    { data: allLeads },
    { data: clientRows },
  ] = await Promise.all([
    supabase
      .from('contacts')
      .select('id, email, name, phone, source, created_at')
      .order('created_at', { ascending: false }),
    supabase
      .from('profiles')
      .select('id, email, role, first_name'),
    supabase
      .from('price_leads')
      .select('contact_id, status')
      .order('created_at', { ascending: false }),
    // Quem fechou. A regra (lead closed / proposta accepted / data fechada) mora
    // na view `clients_v`, não aqui: o cron da sequência de e-mails vai precisar
    // da mesma definição, e duas cópias em TypeScript divergiriam.
    supabase
      .from('clients_v')
      .select('contact_id'),
  ]);

  const profileByEmail = new Map((profiles ?? []).map(p => [p.email, p]));

  const leadStatusByContactId = new Map<string, string>();
  for (const lead of allLeads ?? []) {
    if (lead.contact_id && !leadStatusByContactId.has(lead.contact_id)) {
      leadStatusByContactId.set(lead.contact_id, lead.status);
    }
  }

  const clientContactIds = new Set((clientRows ?? []).map(r => r.contact_id as string));

  const unified: ContactListItem[] = (contacts ?? []).map(c => ({
    id: c.id,
    email: c.email,
    name: c.name ?? profileByEmail.get(c.email)?.first_name ?? null,
    phone: c.phone ?? null,
    source: c.source ?? null,
    created_at: c.created_at,
    guide_role: profileByEmail.get(c.email)?.role as ContactListItem['guide_role'],
    lead_status: leadStatusByContactId.get(c.id) as ContactListItem['lead_status'],
    is_client: clientContactIds.has(c.id),
  }));

  return <ContactsPageClient contacts={unified} />;
}

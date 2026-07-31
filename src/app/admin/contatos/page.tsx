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
    { data: allClients },
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
    supabase
      .from('tour_clients')
      .select('contact_id, status')
      .order('created_at', { ascending: false }),
  ]);

  const profileByEmail = new Map((profiles ?? []).map(p => [p.email, p]));

  const leadStatusByContactId = new Map<string, string>();
  for (const lead of allLeads ?? []) {
    if (lead.contact_id && !leadStatusByContactId.has(lead.contact_id)) {
      leadStatusByContactId.set(lead.contact_id, lead.status);
    }
  }

  const clientStatusByContactId = new Map<string, string>();
  for (const client of allClients ?? []) {
    if (client.contact_id && !clientStatusByContactId.has(client.contact_id)) {
      clientStatusByContactId.set(client.contact_id, client.status);
    }
  }

  const unified: ContactListItem[] = (contacts ?? []).map(c => ({
    id: c.id,
    email: c.email,
    name: c.name ?? profileByEmail.get(c.email)?.first_name ?? null,
    phone: c.phone ?? null,
    source: c.source ?? null,
    created_at: c.created_at,
    guide_role: profileByEmail.get(c.email)?.role as ContactListItem['guide_role'],
    lead_status: leadStatusByContactId.get(c.id) as ContactListItem['lead_status'],
    client_status: clientStatusByContactId.get(c.id) as ContactListItem['client_status'],
  }));

  return <ContactsPageClient contacts={unified} />;
}

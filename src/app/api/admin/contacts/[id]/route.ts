import { createClient } from '@/utils/supabase/server';
import { getProposalAnalyticsSummaries } from '@/lib/proposalAnalytics';
import { getProposalEmailStatuses } from '@/lib/email/sendProposalEmail';
import { NextRequest, NextResponse } from 'next/server';

async function verifyAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { authorized: false, supabase };
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();
  return { authorized: profile?.role === 'admin', supabase };
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { authorized, supabase } = await verifyAdmin();
  if (!authorized) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;

  const { data: contact } = await supabase
    .from('contacts')
    .select('*')
    .eq('id', id)
    .single();

  if (!contact) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const [
    { data: profile },
    { data: leads },
  ] = await Promise.all([
    supabase
      .from('profiles')
      .select('id, email, role, first_name, created_at, premium_since, premium_until, guide_edition')
      .eq('email', contact.email)
      .maybeSingle(),
    supabase
      .from('price_leads')
      .select('*')
      .eq('contact_id', id)
      .order('created_at', { ascending: false }),
  ]);

  const leadIds = (leads ?? []).map(l => l.id);
  const proposalIdsFromLeads = (leads ?? []).map(l => l.proposal_id).filter((pid): pid is string => !!pid);

  const [
    { count: pagesRead },
    { data: leadContacts },
    { data: emailLogs },
    { data: proposalsFromLeads },
    { data: proposalsByEmail },
  ] = await Promise.all([
    profile
      ? supabase
          .from('user_page_progress')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', profile.id)
      : Promise.resolve({ count: 0, data: null }),
    leadIds.length > 0
      ? supabase
          .from('lead_contacts')
          .select('*')
          .in('lead_id', leadIds)
          .order('created_at', { ascending: false })
      : Promise.resolve({ data: [] }),
    leadIds.length > 0
      ? supabase
          .from('email_sequence_log')
          .select('*, email_templates(name, subject)')
          .in('lead_id', leadIds)
          .order('scheduled_date', { ascending: true })
      : Promise.resolve({ data: [] }),
    proposalIdsFromLeads.length > 0
      ? supabase.from('proposals').select('*').in('id', proposalIdsFromLeads)
      : Promise.resolve({ data: [] }),
    // Pega também propostas "órfãs" (ex.: plano B duplicado) que não ficaram
    // linkadas a nenhum lead mas foram feitas pro mesmo e-mail do contato.
    supabase.from('proposals').select('*').eq('client_email', contact.email),
  ]);

  const proposalsMap = new Map(
    [...(proposalsFromLeads ?? []), ...(proposalsByEmail ?? [])].map(p => [p.id, p])
  );
  const proposalIds = [...proposalsMap.keys()];

  // Contexto que a aba Propostas usa pra dizer o que aconteceu DEPOIS do envio:
  // leitura do link público, envio por e-mail e datas já no calendário (com o
  // sinal, que mora em tour_dates e não na proposta).
  const [analytics, emailStatuses, { data: tourDates }] = await Promise.all([
    getProposalAnalyticsSummaries(proposalIds).catch(() => ({})),
    getProposalEmailStatuses(proposalIds),
    leadIds.length > 0
      ? supabase
          .from('tour_dates')
          .select('id, lead_id, date, start_time, status, anzahlung_paid, agreed_price')
          .in('lead_id', leadIds)
          .order('date', { ascending: true })
      : Promise.resolve({ data: [] }),
  ]);

  return NextResponse.json({
    contact,
    profile: profile ?? null,
    pages_read: pagesRead ?? 0,
    leads: leads ?? [],
    lead_contacts: leadContacts ?? [],
    email_logs: emailLogs ?? [],
    proposals: [...proposalsMap.values()].sort((a, b) => b.created_at.localeCompare(a.created_at)),
    proposal_analytics: analytics,
    proposal_emails: emailStatuses,
    tour_dates: tourDates ?? [],
  });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { authorized, supabase } = await verifyAdmin();
  if (!authorized) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const body = await request.json();
  const { email, name, phone, source } = body;

  const { data, error } = await supabase
    .from('contacts')
    .update({
      ...(email !== undefined && { email }),
      name: name || null,
      phone: phone || null,
      source: source || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { authorized, supabase } = await verifyAdmin();
  if (!authorized) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;

  const { error } = await supabase
    .from('contacts')
    .delete()
    .eq('id', id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}

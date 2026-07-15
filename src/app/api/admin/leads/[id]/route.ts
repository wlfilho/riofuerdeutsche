import { createClient } from '@/utils/supabase/server';
import { syncTourDatesWithLeadStatus } from '@/lib/tourDates';
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

const VALID_STATUSES = ['new', 'contacted', 'proposal_sent', 'closed', 'lost'];

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { authorized, supabase } = await verifyAdmin();
  if (!authorized) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;

  const [leadResult, interactionsResult] = await Promise.all([
    supabase.from('price_leads').select('*').eq('id', id).single(),
    supabase
      .from('lead_contacts')
      .select('*')
      .eq('lead_id', id)
      .order('created_at', { ascending: false }),
  ]);

  if (leadResult.error) return NextResponse.json({ error: leadResult.error.message }, { status: 500 });

  return NextResponse.json({
    lead: leadResult.data,
    interactions: interactionsResult.data ?? [],
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
  const { status, claude_chat_url, notes } = body;

  if (status !== undefined && !VALID_STATUSES.includes(status)) {
    return NextResponse.json({ error: 'Status inválido.' }, { status: 400 });
  }

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (status !== undefined) updates.status = status;
  if (claude_chat_url !== undefined) updates.claude_chat_url = claude_chat_url;
  if (notes !== undefined) updates.notes = notes;

  if (Object.keys(updates).length === 1) {
    return NextResponse.json({ error: 'Nenhum campo para atualizar.' }, { status: 400 });
  }

  const { data: lead, error } = await supabase
    .from('price_leads')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Best-effort: falha na sincronização do calendário não derruba a troca de status.
  if (status !== undefined) {
    const syncError = await syncTourDatesWithLeadStatus(supabase, id, status);
    if (syncError) console.error('[leads PATCH] failed to sync tour_dates:', syncError);
  }

  return NextResponse.json({ lead });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { authorized, supabase } = await verifyAdmin();
  if (!authorized) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;

  const { error } = await supabase.from('price_leads').delete().eq('id', id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}

import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { TOUR_DATE_SELECT } from '@/lib/tourDates';

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

const VALID_STATUSES = ['proposta_enviada', 'fechado'];

export async function GET(request: NextRequest) {
  const { authorized, supabase } = await verifyAdmin();
  if (!authorized) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const leadId = request.nextUrl.searchParams.get('lead_id');

  let query = supabase
    .from('tour_dates')
    .select(TOUR_DATE_SELECT)
    .order('date', { ascending: true })
    .order('start_time', { ascending: true, nullsFirst: true });

  if (leadId) query = query.eq('lead_id', leadId);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ tourDates: data ?? [] });
}

export async function POST(request: NextRequest) {
  const { authorized, supabase } = await verifyAdmin();
  if (!authorized) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const dates = Array.isArray(body.dates) ? body.dates : [body];

  if (dates.length === 0) {
    return NextResponse.json({ error: 'Nenhuma data informada.' }, { status: 400 });
  }

  const rows = [];
  for (const d of dates) {
    if (!d.lead_id || !d.date || !d.tour_name?.trim()) {
      return NextResponse.json({ error: 'lead_id, date e tour_name são obrigatórios.' }, { status: 400 });
    }
    if (!VALID_STATUSES.includes(d.status)) {
      return NextResponse.json({ error: 'Status inválido.' }, { status: 400 });
    }
    rows.push({
      lead_id: d.lead_id,
      date: d.date,
      start_time: d.start_time || null,
      tour_name: d.tour_name.trim(),
      status: d.status,
      pax: d.pax ?? null,
      meeting_point: d.meeting_point?.trim() || null,
      agreed_price: d.agreed_price ?? null,
      anzahlung_paid: Boolean(d.anzahlung_paid),
      notes: d.notes?.trim() || null,
    });
  }

  const { data, error } = await supabase
    .from('tour_dates')
    .insert(rows)
    .select(TOUR_DATE_SELECT);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ tourDates: data ?? [] }, { status: 201 });
}

// Bulk sync from the kanban: update status (or delete) of all tour dates of a lead
export async function PATCH(request: NextRequest) {
  const { authorized, supabase } = await verifyAdmin();
  if (!authorized) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const { lead_id, status, action } = body;

  if (!lead_id) {
    return NextResponse.json({ error: 'lead_id é obrigatório.' }, { status: 400 });
  }

  if (action === 'delete') {
    const { error } = await supabase.from('tour_dates').delete().eq('lead_id', lead_id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  if (!VALID_STATUSES.includes(status)) {
    return NextResponse.json({ error: 'Status inválido.' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('tour_dates')
    .update({ status })
    .eq('lead_id', lead_id)
    .select(TOUR_DATE_SELECT);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ tourDates: data ?? [] });
}

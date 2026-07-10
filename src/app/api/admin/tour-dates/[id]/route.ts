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

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { authorized, supabase } = await verifyAdmin();
  if (!authorized) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const body = await request.json();

  if (body.status !== undefined && !VALID_STATUSES.includes(body.status)) {
    return NextResponse.json({ error: 'Status inválido.' }, { status: 400 });
  }
  if (body.tour_name !== undefined && !body.tour_name?.trim()) {
    return NextResponse.json({ error: 'Nome do tour é obrigatório.' }, { status: 400 });
  }

  const updates: Record<string, unknown> = {};
  if (body.date !== undefined) updates.date = body.date;
  if (body.start_time !== undefined) updates.start_time = body.start_time || null;
  if (body.tour_name !== undefined) updates.tour_name = body.tour_name.trim();
  if (body.status !== undefined) updates.status = body.status;
  if (body.pax !== undefined) updates.pax = body.pax ?? null;
  if (body.meeting_point !== undefined) updates.meeting_point = body.meeting_point?.trim() || null;
  if (body.agreed_price !== undefined) updates.agreed_price = body.agreed_price ?? null;
  if (body.anzahlung_paid !== undefined) updates.anzahlung_paid = Boolean(body.anzahlung_paid);
  if (body.notes !== undefined) updates.notes = body.notes?.trim() || null;

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'Nenhum campo para atualizar.' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('tour_dates')
    .update(updates)
    .eq('id', id)
    .select(TOUR_DATE_SELECT)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ tourDate: data });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { authorized, supabase } = await verifyAdmin();
  if (!authorized) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;

  const { error } = await supabase.from('tour_dates').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}

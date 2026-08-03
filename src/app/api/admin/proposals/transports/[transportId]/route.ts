import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

async function verifyAdmin(): Promise<boolean> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;
  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single();
  return profile?.role === 'admin';
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ transportId: string }> },
) {
  if (!await verifyAdmin()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = await createClient();
  const { transportId } = await params;
  const body = await request.json();

  // Extract tiers before passing the rest to .update()
  const { tiers, ...transportFields } = body;

  if (Object.keys(transportFields).length > 0) {
    const { error } = await supabase
      .from('proposal_transport_types')
      .update(transportFields)
      .eq('id', transportId);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // If tiers is explicitly provided, replace all tiers for this transport
  if (Array.isArray(tiers)) {
    await supabase
      .from('proposal_transport_tiers')
      .delete()
      .eq('transport_type_id', transportId);

    if (tiers.length > 0) {
      const tierRows = tiers.map((t: { min_pax: number; max_pax: number | null; car_daily_rate: number; driver_price_per_hour: number; currency: string }, i: number) => ({
        transport_type_id: transportId,
        min_pax: t.min_pax,
        max_pax: t.max_pax ?? null,
        car_daily_rate: t.car_daily_rate,
        driver_price_per_hour: t.driver_price_per_hour,
        currency: t.currency,
        sort_order: i * 10,
      }));
      const { error } = await supabase.from('proposal_transport_tiers').insert(tierRows);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ transportId: string }> },
) {
  if (!await verifyAdmin()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = await createClient();
  const { transportId } = await params;

  const { error } = await supabase
    .from('proposal_transport_types')
    .delete()
    .eq('id', transportId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}

import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

type CostPayload = {
  description: string;
  base_price: number;
  currency: string;
  price_type: string;
  include_in_price?: boolean;
};

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
  { params }: { params: Promise<{ serviceId: string }> }
) {
  if (!await verifyAdmin()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = await createClient();
  const { serviceId } = await params;
  const body = await request.json();

  if ('costs' in body) {
    // Full update: replace service fields + delete/recreate costs
    const { costs, ...serviceFields } = body;

    const { error: updateErr } = await supabase
      .from('proposal_services')
      .update({ ...serviceFields, updated_at: new Date().toISOString() })
      .eq('id', serviceId);

    if (updateErr) return NextResponse.json({ error: updateErr.message }, { status: 500 });

    const { error: deleteErr } = await supabase
      .from('proposal_service_costs')
      .delete()
      .eq('service_id', serviceId);

    if (deleteErr) return NextResponse.json({ error: deleteErr.message }, { status: 500 });

    if ((costs as CostPayload[]).length > 0) {
      const { error: costsErr } = await supabase
        .from('proposal_service_costs')
        .insert(
          (costs as CostPayload[]).map((c, i) => ({
            service_id: serviceId,
            description: c.description,
            base_price: c.base_price,
            currency: c.currency,
            price_type: c.price_type,
            include_in_price: c.include_in_price ?? true,
            sort_order: i,
          }))
        );
      if (costsErr) return NextResponse.json({ error: costsErr.message }, { status: 500 });
    }
  } else {
    // Partial update (toggle is_active, etc.)
    const { error } = await supabase
      .from('proposal_services')
      .update({ ...body, updated_at: new Date().toISOString() })
      .eq('id', serviceId);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ serviceId: string }> }
) {
  if (!await verifyAdmin()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = await createClient();
  const { serviceId } = await params;

  const { error } = await supabase
    .from('proposal_services')
    .delete()
    .eq('id', serviceId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}

import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

type CostPayload = {
  description: string;
  base_price: number;
  currency: string;
  price_type: string;
};

async function verifyAdmin(): Promise<boolean> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;
  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single();
  return profile?.role === 'admin';
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export async function GET() {
  if (!await verifyAdmin()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('proposal_services')
    .select('*, costs:proposal_service_costs(*)')
    .order('sort_order');

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ services: data ?? [] });
}

export async function POST(request: NextRequest) {
  if (!await verifyAdmin()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = await createClient();
  const body = await request.json();
  const {
    name, category, description, pdf_note, notes, is_active,
    duration_hours, transfer_hours_to, transfer_hours_back,
    suggested_period, costs,
  } = body;

  if (!name?.trim() || !category) {
    return NextResponse.json({ error: 'name e category são obrigatórios.' }, { status: 400 });
  }

  // Unique slug
  const slug = `${slugify(name.trim())}-${Math.random().toString(36).slice(2, 7)}`;

  // Next sort_order
  const { data: maxRow } = await supabase
    .from('proposal_services')
    .select('sort_order')
    .order('sort_order', { ascending: false })
    .limit(1)
    .maybeSingle();
  const sort_order = (maxRow?.sort_order ?? -1) + 1;

  const { data: service, error: svcErr } = await supabase
    .from('proposal_services')
    .insert({
      slug,
      name: name.trim(),
      category,
      description: description?.trim() || null,
      pdf_note: pdf_note?.trim() || null,
      notes: notes?.trim() || null,
      is_active: is_active ?? true,
      duration_hours: duration_hours || null,
      transfer_hours_to: transfer_hours_to || null,
      transfer_hours_back: transfer_hours_back || null,
      suggested_period: suggested_period || null,
      sort_order,
    })
    .select()
    .single();

  if (svcErr) return NextResponse.json({ error: svcErr.message }, { status: 500 });

  if (costs?.length > 0) {
    const { error: costsErr } = await supabase
      .from('proposal_service_costs')
      .insert(
        (costs as CostPayload[]).map((c, i) => ({
          service_id: service.id,
          description: c.description,
          base_price: c.base_price,
          currency: c.currency,
          price_type: c.price_type,
          sort_order: i,
        }))
      );
    if (costsErr) return NextResponse.json({ error: costsErr.message }, { status: 500 });
  }

  return NextResponse.json({ service }, { status: 201 });
}

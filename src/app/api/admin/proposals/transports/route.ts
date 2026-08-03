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
    .from('proposal_transport_types')
    .select('*, tiers:proposal_transport_tiers(*)')
    .order('sort_order');

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ transports: data ?? [] });
}

export async function POST(request: NextRequest) {
  if (!await verifyAdmin()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = await createClient();
  const body = await request.json();
  const { name, is_manual, is_included, is_active, tiers } = body;

  if (!name?.trim()) {
    return NextResponse.json({ error: 'nome é obrigatório.' }, { status: 400 });
  }

  const slug = `${slugify(name.trim())}-${Math.random().toString(36).slice(2, 7)}`;

  const { data: maxRow } = await supabase
    .from('proposal_transport_types')
    .select('sort_order')
    .order('sort_order', { ascending: false })
    .limit(1)
    .maybeSingle();
  const sort_order = (maxRow?.sort_order ?? -1) + 1;

  const { data: transport, error } = await supabase
    .from('proposal_transport_types')
    .insert({ slug, name: name.trim(), is_manual: is_manual ?? false, is_included: is_included ?? false, is_active: is_active ?? true, sort_order })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (Array.isArray(tiers) && tiers.length > 0) {
    const tierRows = tiers.map((t: { min_pax: number; max_pax: number | null; car_daily_rate: number; driver_price_per_hour: number; currency: string }, i: number) => ({
      transport_type_id: transport.id,
      min_pax: t.min_pax,
      max_pax: t.max_pax ?? null,
      car_daily_rate: t.car_daily_rate,
      driver_price_per_hour: t.driver_price_per_hour,
      currency: t.currency,
      sort_order: i * 10,
    }));
    await supabase.from('proposal_transport_tiers').insert(tierRows);
  }

  return NextResponse.json({ transport }, { status: 201 });
}

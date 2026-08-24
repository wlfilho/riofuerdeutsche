import { createClient } from '@/utils/supabase/server';
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

export async function GET() {
  const { authorized, supabase } = await verifyAdmin();
  if (!authorized) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data, error } = await supabase
    .from('lead_groups')
    .select('id, name')
    .order('name');

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ groups: data ?? [] });
}

export async function POST(request: NextRequest) {
  const { authorized, supabase } = await verifyAdmin();
  if (!authorized) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const name = typeof body.name === 'string' ? body.name.trim() : '';
  if (!name) return NextResponse.json({ error: 'Nome é obrigatório.' }, { status: 400 });

  // Reaproveita o grupo se já existir com esse nome (case-insensitive) em vez
  // de duplicar: o combobox do drawer deixa digitar um nome novo sem checar
  // antes se já existe um igual.
  const { data: existing } = await supabase
    .from('lead_groups')
    .select('id, name')
    .ilike('name', name)
    .maybeSingle();

  if (existing) return NextResponse.json({ group: existing });

  const { data: created, error } = await supabase
    .from('lead_groups')
    .insert({ name })
    .select('id, name')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ group: created }, { status: 201 });
}

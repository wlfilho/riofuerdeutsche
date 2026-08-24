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

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { authorized, supabase } = await verifyAdmin();
  if (!authorized) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id: lead_id } = await params;
  const body = await request.json();
  const group_id = typeof body.group_id === 'string' ? body.group_id : '';
  if (!group_id) return NextResponse.json({ error: 'group_id é obrigatório.' }, { status: 400 });

  const { error } = await supabase
    .from('lead_group_members')
    .insert({ lead_id, group_id });

  // 23505 = já está no grupo — idempotente, não é erro.
  if (error && error.code !== '23505') {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true }, { status: 201 });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { authorized, supabase } = await verifyAdmin();
  if (!authorized) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id: lead_id } = await params;
  const group_id = request.nextUrl.searchParams.get('group_id');
  if (!group_id) return NextResponse.json({ error: 'group_id é obrigatório.' }, { status: 400 });

  const { error } = await supabase
    .from('lead_group_members')
    .delete()
    .eq('lead_id', lead_id)
    .eq('group_id', group_id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}

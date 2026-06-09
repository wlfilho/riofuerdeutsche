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
  const { type, direction, note } = body;

  const validTypes = ['whatsapp', 'email', 'phone', 'other'];
  const validDirections = ['sent', 'received'];

  if (!validTypes.includes(type)) return NextResponse.json({ error: 'Tipo inválido' }, { status: 400 });
  if (!validDirections.includes(direction)) return NextResponse.json({ error: 'Direção inválida' }, { status: 400 });

  const { data, error } = await supabase
    .from('lead_contacts')
    .insert({ lead_id, type, direction, note: note?.trim() || null, is_automatic: false })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}

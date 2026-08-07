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
  { params }: { params: Promise<{ groupId: string }> }
) {
  if (!await verifyAdmin()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = await createClient();
  const { groupId } = await params;
  const body = await request.json();

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if ('name' in body) {
    const name = (body.name ?? '').trim();
    if (!name) return NextResponse.json({ error: 'name é obrigatório.' }, { status: 400 });
    updates.name = name;
  }
  if ('is_active' in body) updates.is_active = body.is_active;

  const { error: groupErr } = await supabase
    .from('proposal_service_groups')
    .update(updates)
    .eq('id', groupId);

  if (groupErr) return NextResponse.json({ error: groupErr.message }, { status: 500 });

  // Membros: mesmo padrão do CRUD de custos das atividades — apaga e recria,
  // que é a forma simples de aplicar remoções e reordenação de uma vez.
  if ('service_ids' in body) {
    const serviceIds = [...new Set((body.service_ids ?? []) as string[])];
    if (serviceIds.length === 0) {
      return NextResponse.json({ error: 'O grupo precisa de pelo menos uma atividade.' }, { status: 400 });
    }

    const { error: delErr } = await supabase
      .from('proposal_service_group_items')
      .delete()
      .eq('group_id', groupId);
    if (delErr) return NextResponse.json({ error: delErr.message }, { status: 500 });

    const { error: insErr } = await supabase
      .from('proposal_service_group_items')
      .insert(serviceIds.map((service_id, i) => ({
        group_id: groupId,
        service_id,
        sort_order: i,
      })));
    if (insErr) return NextResponse.json({ error: insErr.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ groupId: string }> }
) {
  if (!await verifyAdmin()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = await createClient();
  const { groupId } = await params;

  // Os membros caem junto (FK ON DELETE CASCADE). Propostas existentes não são
  // afetadas: elas nunca referenciam o grupo, só as atividades expandidas.
  const { error } = await supabase
    .from('proposal_service_groups')
    .delete()
    .eq('id', groupId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

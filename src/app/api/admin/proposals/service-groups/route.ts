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

// Lista TODOS os grupos (inclusive inativos) para a tela de gestão em
// /admin/propostas/atividades. O builder usa getProposalServiceGroups(), que
// filtra por ativo.
export async function GET() {
  if (!await verifyAdmin()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('proposal_service_groups')
    .select('id, name, is_active, sort_order, items:proposal_service_group_items(service_id, sort_order)')
    .order('sort_order');

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const groups = (data ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    is_active: row.is_active,
    sort_order: row.sort_order,
    service_ids: [...(row.items ?? [])]
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((i) => i.service_id),
  }));

  return NextResponse.json({ groups });
}

export async function POST(request: NextRequest) {
  if (!await verifyAdmin()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = await createClient();
  const body = await request.json();
  const name = (body.name ?? '').trim();
  // Ordem do array = ordem das atividades no grupo. Duplicatas são descartadas
  // (a tabela tem UNIQUE (group_id, service_id)).
  const serviceIds = [...new Set((body.service_ids ?? []) as string[])];

  if (!name) {
    return NextResponse.json({ error: 'name é obrigatório.' }, { status: 400 });
  }
  if (serviceIds.length === 0) {
    return NextResponse.json({ error: 'O grupo precisa de pelo menos uma atividade.' }, { status: 400 });
  }

  const { data: maxRow } = await supabase
    .from('proposal_service_groups')
    .select('sort_order')
    .order('sort_order', { ascending: false })
    .limit(1)
    .maybeSingle();
  const sort_order = (maxRow?.sort_order ?? -1) + 1;

  const { data: group, error: groupErr } = await supabase
    .from('proposal_service_groups')
    .insert({ name, is_active: body.is_active ?? true, sort_order })
    .select()
    .single();

  if (groupErr) return NextResponse.json({ error: groupErr.message }, { status: 500 });

  const { error: itemsErr } = await supabase
    .from('proposal_service_group_items')
    .insert(serviceIds.map((service_id, i) => ({
      group_id: group.id,
      service_id,
      sort_order: i,
    })));

  if (itemsErr) {
    // Grupo sem membros não serve pra nada — desfaz pra não deixar lixo.
    await supabase.from('proposal_service_groups').delete().eq('id', group.id);
    return NextResponse.json({ error: itemsErr.message }, { status: 500 });
  }

  return NextResponse.json({ group }, { status: 201 });
}

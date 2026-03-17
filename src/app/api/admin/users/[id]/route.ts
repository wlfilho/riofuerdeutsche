// src/app/api/admin/users/[id]/route.ts
import { createClient } from '@/utils/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseAdmin = createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function verifyAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { authorized: false, userId: null };
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();
  return { authorized: profile?.role === 'admin', userId: user.id };
}

// GET — Buscar detalhes de um usuário
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { authorized } = await verifyAdmin();
  if (!authorized) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
  }

  const { id } = await params;

  const { data: profile, error } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !profile) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  return NextResponse.json({ user: profile });
}

// PATCH — Atualizar dados de um usuário
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { authorized, userId } = await verifyAdmin();
  if (!authorized) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json();
  const { role, premium_until, guide_edition, payment_id, first_name } = body;

  // Prevenir auto-rebaixamento
  if (id === userId && role && role !== 'admin') {
    return NextResponse.json(
      { error: 'Du kannst deinen eigenen Admin-Status não entfernen.' },
      { status: 400 }
    );
  }

  // Montar dados de update
  const updateData: Record<string, unknown> = {};

  if (role !== undefined) {
    updateData.role = role;

    if (role === 'premium') {
      updateData.premium_since = new Date().toISOString();
      updateData.premium_until = premium_until || null;
      updateData.guide_edition = guide_edition || 1;
    } else if (role === 'user') {
      // Revogar: limpar campos premium
      updateData.premium_since = null;
      updateData.premium_until = null;
      updateData.guide_edition = null;
      updateData.payment_id = null;
    }
  }

  if (premium_until !== undefined) updateData.premium_until = premium_until || null;
  if (guide_edition !== undefined) updateData.guide_edition = guide_edition;
  if (payment_id !== undefined) updateData.payment_id = payment_id;
  if (first_name !== undefined) updateData.first_name = first_name || null;

  const { data: profile, error } = await supabaseAdmin
    .from('profiles')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ user: profile });
}

// DELETE — Deletar usuário (auth + profile)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { authorized, userId } = await verifyAdmin();
  if (!authorized) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
  }

  const { id } = await params;

  // Prevenir auto-exclusão
  if (id === userId) {
    return NextResponse.json(
      { error: 'Du kannst dich selbst nicht löschen.' },
      { status: 400 }
    );
  }

  // Deletar profile primeiro (por causa da FK)
  const { error: profileError } = await supabaseAdmin
    .from('profiles')
    .delete()
    .eq('id', id);

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 500 });
  }

  // Deletar usuário do auth
  const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(id);

  if (authError) {
    return NextResponse.json({ error: authError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

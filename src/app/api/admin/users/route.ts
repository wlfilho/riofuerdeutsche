// src/app/api/admin/users/route.ts
import { createClient } from '@/utils/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseAdmin = createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Helper para verificar admin
async function verifyAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { authorized: false, supabase, userId: null };
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();
  return {
    authorized: profile?.role === 'admin',
    supabase,
    userId: user.id,
  };
}

// GET — Listar todos os usuários
export async function GET(request: NextRequest) {
  const { authorized } = await verifyAdmin();
  if (!authorized) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
  }

  const searchParams = request.nextUrl.searchParams;
  const search = searchParams.get('search') || '';
  const roleFilter = searchParams.get('role') || '';

  let query = supabaseAdmin
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });

  if (search) {
    query = query.ilike('email', `%${search}%`);
  }

  if (roleFilter && roleFilter !== 'all') {
    query = query.eq('role', roleFilter);
  }

  const { data: users, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ users });
}

// POST — Criar novo usuário manualmente
export async function POST(request: NextRequest) {
  const { authorized } = await verifyAdmin();
  if (!authorized) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
  }

  const body = await request.json();
  const { email, password, role, guide_edition, first_name } = body;

  if (!email || !password) {
    return NextResponse.json(
      { error: 'Email und Passwort sind erforderlich.' },
      { status: 400 }
    );
  }

  // Criar usuário via Supabase Auth (admin API)
  const { data: authUser, error: authError } =
    await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Já confirma o email
      user_metadata: {
        first_name: first_name || null,
      },
    });

  if (authError) {
    return NextResponse.json({ error: authError.message }, { status: 500 });
  }

  // O trigger handle_new_user já cria o profile com role='user'
  // Se o role desejado for diferente, atualizar
  if (authUser.user && role && role !== 'user') {
    const updateData: Record<string, unknown> = { role };

    if (role === 'premium') {
      updateData.premium_since = new Date().toISOString();
      updateData.guide_edition = guide_edition || 1;
    }

    await supabaseAdmin
      .from('profiles')
      .update(updateData)
      .eq('id', authUser.user.id);
  }

  return NextResponse.json({ user: authUser.user }, { status: 201 });
}

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
  if (!user) return { authorized: false };
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();
  return { authorized: profile?.role === 'admin' };
}

export async function GET(request: NextRequest) {
  const { authorized } = await verifyAdmin();
  if (!authorized) return NextResponse.json({ error: 'Not authorized' }, { status: 403 });

  const status = request.nextUrl.searchParams.get('status');
  const full = request.nextUrl.searchParams.get('full') === '1';

  if (full) {
    const sortField = status === 'approved' ? 'approved_at' : 'created_at';
    let listQuery = supabaseAdmin
      .from('reviews')
      .select('*')
      .order(sortField, { ascending: false });

    if (status) {
      listQuery = listQuery.eq('status', status);
    }

    const { data: reviews, error } = await listQuery;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ reviews: reviews ?? [] });
  }

  let countQuery = supabaseAdmin.from('reviews').select('*', { count: 'exact', head: true });
  if (status) countQuery = countQuery.eq('status', status);

  const { count, error } = await countQuery;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ count: count ?? 0 });
}

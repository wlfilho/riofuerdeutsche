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

export async function GET(request: NextRequest) {
  const { authorized, supabase } = await verifyAdmin();
  if (!authorized) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const status = request.nextUrl.searchParams.get('status');

  let query = supabase.from('reviews').select('*', { count: 'exact', head: true });
  if (status) query = query.eq('status', status);

  const { count, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ count });
}

import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();
  if (profile?.role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const res = await fetch('https://api.frankfurter.app/latest?from=BRL&to=EUR');
  if (!res.ok) return NextResponse.json({ error: 'Failed to fetch rate' }, { status: 502 });

  const data = await res.json();
  return NextResponse.json({ rate: data?.rates?.EUR ?? null });
}

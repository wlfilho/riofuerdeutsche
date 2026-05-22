import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

async function verifyAdmin(): Promise<boolean> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;
  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single();
  return profile?.role === 'admin';
}

export async function GET() {
  if (!await verifyAdmin()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('proposal_services')
    .select('transport_type_id')
    .not('transport_type_id', 'is', null);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const counts: Record<string, number> = {};
  for (const row of data ?? []) {
    if (row.transport_type_id) {
      counts[row.transport_type_id] = (counts[row.transport_type_id] ?? 0) + 1;
    }
  }

  return NextResponse.json({ counts });
}

import { createClient } from '@/utils/supabase/server';
import { createProposal } from '@/lib/proposals';
import { NextRequest, NextResponse } from 'next/server';

async function verifyAdmin(): Promise<boolean> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();
  return profile?.role === 'admin';
}

export async function POST(request: NextRequest) {
  if (!await verifyAdmin()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { lead_id, ...formData } = body;

  try {
    const proposal = await createProposal(formData);

    // Link the CRM lead to the proposal it originated (best-effort).
    if (lead_id) {
      const supabase = await createClient();
      await supabase
        .from('price_leads')
        .update({ proposal_id: proposal.id })
        .eq('id', lead_id)
        .is('proposal_id', null);
    }

    return NextResponse.json(proposal);
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

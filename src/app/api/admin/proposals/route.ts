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
    // A proposta sempre sabe de quem ela é (proposals.lead_id).
    const proposal = await createProposal(formData, lead_id ?? null);

    // Já quem manda no calendário (price_leads.proposal_id) só é definido
    // quando o lead ainda não tem proposta: uma segunda proposta do mesmo
    // cliente não sequestra a agenda da primeira sozinha. A divergência vira
    // aviso na tela da proposta, com botão pra você decidir.
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

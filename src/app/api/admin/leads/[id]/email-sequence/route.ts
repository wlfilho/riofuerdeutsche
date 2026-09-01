import { createClient } from '@/utils/supabase/server';
import {
  previewTourEmailSequence,
  startTourEmailSequence,
} from '@/lib/email/tourEmailSequence';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Sequência de e-mails pré-tour de um lead fechado.
 *
 * GET  → o que seria enviado (destinatário + datas), sem escrever nada.
 * POST → agenda os quatro e-mails e dispara a confirmação.
 *
 * O POST existe justamente para o envio NÃO ser automático: fechar um lead não
 * manda e-mail, quem manda é o Will clicando, depois de ver o preview do GET.
 */

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

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { authorized, supabase } = await verifyAdmin();
  if (!authorized) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const preview = await previewTourEmailSequence(supabase, id);

  if (!preview) {
    return NextResponse.json({ preview: null, reason: 'sem-data-fechada' });
  }
  return NextResponse.json({ preview });
}

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { authorized, supabase } = await verifyAdmin();
  if (!authorized) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;

  // Só lead fechado entra na sequência: os textos falam de uma viagem
  // confirmada ("deine Reise ist bestätigt").
  const { data: lead } = await supabase
    .from('price_leads')
    .select('status')
    .eq('id', id)
    .maybeSingle();

  if (lead?.status !== 'closed') {
    return NextResponse.json({ error: 'LEAD_NAO_FECHADO' }, { status: 400 });
  }

  const result = await startTourEmailSequence(supabase, id);

  if (!result.scheduled) {
    const status = result.reason === 'ja-agendada' ? 409 : 400;
    return NextResponse.json({ error: result.reason, detail: result.error }, { status });
  }

  return NextResponse.json({ success: true });
}

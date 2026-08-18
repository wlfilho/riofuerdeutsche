import { createClient } from '@/utils/supabase/server';
import { getProposalById, updateProposalStatus } from '@/lib/proposals';
import { sendProposalEmail } from '@/lib/email/sendProposalEmail';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Envia ao cliente o e-mail com o link da proposta.
 *
 * Chamada só pelo botão do admin — nunca por efeito colateral de status. Quem
 * envia por aqui também marca a proposta como 'sent': o congelamento do
 * conteúdo (freezeProposalOnSend) e o card do CRM têm que andar junto, e marcar
 * ANTES do envio garante que o link que o cliente abre já mostra o texto
 * congelado.
 */

async function verifyAdmin() {
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

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!await verifyAdmin()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  try {
    const proposal = await getProposalById(id);
    if (!proposal) {
      return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 });
    }
    if (!proposal.client_email?.trim()) {
      return NextResponse.json({ error: 'NO_EMAIL' }, { status: 400 });
    }

    if (proposal.status !== 'sent') {
      await updateProposalStatus(id, 'sent');
      proposal.status = 'sent';
    }

    const result = await sendProposalEmail(proposal);
    if (!result.success) {
      // 502: o envio falhou na Resend, mas o status já mudou — a resposta
      // precisa dizer as duas coisas para a tela não mentir.
      return NextResponse.json(
        { error: result.error ?? 'SEND_FAILED', status: 'sent', entry: result.entry },
        { status: 502 },
      );
    }

    return NextResponse.json({ success: true, status: 'sent', entry: result.entry });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

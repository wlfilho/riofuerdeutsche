import { Metadata } from 'next';
import ProposalPage from '@/components/proposal/ProposalPage';
import { proposalMetadata } from '@/components/proposal/metadata';

export const dynamic = 'force-dynamic';

/**
 * Rota neutra, sem locale na URL: o idioma sai de proposals.locale.
 * Renderiza exatamente o mesmo componente que /angebot/[token].
 */

export async function generateMetadata({
  params,
}: {
  params: Promise<{ token: string }>;
}): Promise<Metadata> {
  const { token } = await params;
  return proposalMetadata(token);
}

export default async function NeutralProposalPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  return <ProposalPage token={token} />;
}

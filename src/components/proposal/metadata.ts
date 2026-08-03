import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { getProposalByPublicToken } from '@/lib/proposals';
import { resolveProposalLocale } from './locale';

/**
 * Metadata da página pública da proposta, compartilhada pelas três rotas.
 *
 * `robots: noindex/nofollow` é o ponto importante: a proposta é privada,
 * protegida só pelo token. Nada disso entra no sitemap (ver src/app/sitemap.ts).
 *
 * O locale segue a mesma cascata da página (URL → proposals.locale → 'de') para
 * o <title> não sair num idioma e o corpo em outro.
 */
export async function proposalMetadata(
  token: string,
  urlLocale?: string,
): Promise<Metadata> {
  const proposal = await getProposalByPublicToken(token);
  const locale = proposal
    ? await resolveProposalLocale(proposal, urlLocale)
    : (urlLocale ?? 'de');

  const t = await getTranslations({ locale, namespace: 'public.angebot' });
  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
    robots: { index: false, follow: false },
  };
}

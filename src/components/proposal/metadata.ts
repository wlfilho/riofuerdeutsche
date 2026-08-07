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
  // Com nome do cliente o title fica pessoal — e é o que o preview do WhatsApp
  // mostra ao enviar o link. Token inválido/nome vazio: título genérico.
  // `absolute` porque a marca já está na mensagem; sem isso o template do
  // layout raiz ("%s | Rio für Deutsche") duplicaria o sufixo.
  const name = proposal?.client_name?.trim();
  const title = name ? t('metaTitleNamed', { name }) : t('metaTitle');
  const description = t('metaDescription');
  return {
    title: { absolute: title },
    description,
    robots: { index: false, follow: false },
    // Preview do link no WhatsApp: title personalizado + arte da marca.
    // A URL relativa vira absoluta via metadataBase do layout raiz.
    openGraph: {
      title,
      description,
      siteName: 'Rio für Deutsche',
      // ?v= força os apps de mensagem a rebuscarem quando a imagem muda —
      // eles cacheiam o preview pela URL. Incrementar a cada troca de arte.
      images: [{ url: '/og/proposal.jpg?v=2', width: 1024, height: 541 }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['/og/proposal.jpg?v=2'],
    },
  };
}

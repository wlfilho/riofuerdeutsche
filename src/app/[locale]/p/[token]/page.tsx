import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ProposalPage from '@/components/proposal/ProposalPage';
import { proposalMetadata } from '@/components/proposal/metadata';
import { getPublicSupportedLocales } from '@/lib/services-i18n';

export const dynamic = 'force-dynamic';

/**
 * Rota neutra com locale explícito na URL.
 *
 * POR QUE ISTO NÃO ENGOLE AS OUTRAS ROTAS
 * ---------------------------------------
 * O segmento dinâmico `[locale]` fica na RAIZ do app, então em tese concorre
 * com tudo. Duas coisas impedem o estrago:
 *
 *  1. O Next resolve segmento ESTÁTICO antes de dinâmico no mesmo nível. Como
 *     este branch existe só em `[locale]/p/[token]`, um caminho como
 *     `/touren` (uma parte) ou `/touren/klassiker` (duas partes, e a segunda
 *     não é `p`) nunca chega aqui — não há `page.tsx` em `[locale]/` nem em
 *     `[locale]/p/`, só na folha de 3 segmentos.
 *
 *  2. Mesmo com 3 segmentos e o do meio igual a `p`, o locale é validado
 *     contra site_settings.supported_locales. Fora da lista → notFound(), que
 *     entrega a 404 normal do site em vez de renderizar uma proposta.
 *
 * A leitura é `getPublicSupportedLocales` (service role), NÃO a versão de
 * sessão: site_settings tem RLS só para admin, então o visitante anônimo lia
 * lista vazia e caía no fallback ['de'] — e /pt-BR/p/[token] dava 404 mesmo
 * com 'pt-BR' configurado.
 *
 * O efeito combinado: esta rota só captura `/<locale suportado>/p/<token>`.
 */

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; token: string }>;
}): Promise<Metadata> {
  const { locale, token } = await params;
  const supported = await getPublicSupportedLocales();
  if (!supported.includes(locale)) return {};
  return proposalMetadata(token, locale);
}

export default async function LocalizedProposalPage({
  params,
}: {
  params: Promise<{ locale: string; token: string }>;
}) {
  const { locale, token } = await params;

  const supported = await getPublicSupportedLocales();
  if (!supported.includes(locale)) notFound();

  return <ProposalPage token={token} urlLocale={locale} />;
}

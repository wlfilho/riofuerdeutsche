import { getPublicSupportedLocales } from '@/lib/services-i18n';
import {
  DEFAULT_PROPOSAL_CURRENCY,
  DEFAULT_PROPOSAL_LOCALE,
  type Proposal,
  type ProposalCurrency,
} from '@/lib/proposals';

/**
 * Locale efetivo da página pública de uma proposta.
 *
 * Ordem, da maior para a menor precedência:
 *   1. locale da URL (`/[locale]/p/[token]`) — SÓ se estiver em
 *      site_settings.supported_locales; a própria rota já rejeita o resto com
 *      404, para o segmento dinâmico não virar catch-all;
 *   2. proposals.locale (NOT NULL, default 'de');
 *   3. 'de'.
 *
 * A rota legada `/angebot/[token]` nunca passa urlLocale, então continua caindo
 * direto em proposals.locale — hoje 'de' em 100% das propostas.
 */
export async function resolveProposalLocale(
  proposal: Proposal,
  urlLocale?: string,
): Promise<string> {
  if (urlLocale) {
    const supported = await getPublicSupportedLocales();
    if (supported.includes(urlLocale)) return urlLocale;
  }
  return proposal.locale || DEFAULT_PROPOSAL_LOCALE;
}

/** Moeda congelada na proposta; default da coluna é 'EUR'. */
export function proposalCurrency(proposal: Proposal): ProposalCurrency {
  return proposal.currency ?? DEFAULT_PROPOSAL_CURRENCY;
}

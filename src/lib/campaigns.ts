/**
 * Campanhas de tour em grupo.
 *
 * Um lead de campanha é um lead normal em `price_leads` — mesmo CRM, mesma
 * conversão em proposta — só que etiquetado com `campaign`. O formulário
 * público correspondente mora em /anfrage/<slug>.
 *
 * Os rótulos aqui são pt-BR de propósito: são lidos pelo Will (e-mail,
 * WhatsApp, admin). O texto em alemão que o cliente vê fica no catálogo i18n,
 * em `public.anfrage<Campanha>`.
 */

export type CampaignSlug = 'aida-karneval-2028';

export interface Campaign {
  slug: CampaignSlug;
  /** Rótulo interno, usado no admin e nas notificações. */
  label: string;
  /** Datas do tour, definidas pela escala do navio — o lead não escolhe. */
  fixedDays: string[];
  /** Ids das opções de interesse; o rótulo alemão vem do catálogo i18n. */
  interests: string[];
  /** Rótulo pt-BR de cada interesse, para as notificações e o admin. */
  interestLabels: Record<string, string>;
}

export const CAMPAIGNS: Record<CampaignSlug, Campaign> = {
  'aida-karneval-2028': {
    slug: 'aida-karneval-2028',
    label: 'AIDA Karneval 2028',
    fixedDays: ['2028-02-26', '2028-02-27'],
    interests: ['sambodromo', 'klassiker', 'blocos', 'strand', 'favela', 'offen'],
    interestLabels: {
      sambodromo: 'Sambódromo (desfile)',
      klassiker: 'Clássicos: Pão de Açúcar & Cristo',
      blocos: 'Carnaval de rua (blocos)',
      strand: 'Praia & Copacabana',
      favela: 'Favela (Rocinha)',
      offen: 'Indeciso / aberto a sugestões',
    },
  },
};

export const CAMPAIGN_LIST: Campaign[] = Object.values(CAMPAIGNS);

export function getCampaign(slug: unknown): Campaign | null {
  return typeof slug === 'string' && slug in CAMPAIGNS
    ? CAMPAIGNS[slug as CampaignSlug]
    : null;
}

export function campaignLabel(slug: string | null | undefined): string | null {
  return getCampaign(slug)?.label ?? null;
}

/**
 * Regra única do filtro por campanha, usada por CRM, leads e propostas.
 *
 * Mora aqui e não junto do componente de filtro porque quem chama é Server
 * Component: função exportada de um módulo 'use client' não pode ser invocada
 * no servidor — o build passa e só quebra em runtime.
 *
 * Sem filtro devolve tudo; 'none' seleciona quem não está em campanha alguma.
 */
export function matchesCampaign(
  leadCampaign: string | null | undefined,
  filter: string | undefined,
): boolean {
  if (!filter) return true;
  if (filter === 'none') return !leadCampaign;
  return leadCampaign === filter;
}

/**
 * Países oferecidos no seletor de DDI. O público é do DACH, mas 'other' existe
 * para ninguém ficar de fora — e é justamente o caso que interessa saber.
 *
 * Sem bandeiras: emoji de bandeira não renderiza no Windows (vira "DE"), então
 * o campo ficaria diferente conforme o sistema. O DDI sozinho é universal.
 */
export const PHONE_COUNTRIES = [
  { code: 'DE', dial: '+49' },
  { code: 'AT', dial: '+43' },
  { code: 'CH', dial: '+41' },
] as const;

export type PhoneCountry = (typeof PHONE_COUNTRIES)[number]['code'] | 'other';

export const PHONE_COUNTRY_CODES: PhoneCountry[] = [
  ...PHONE_COUNTRIES.map(c => c.code),
  'other',
];

/** Rótulo pt-BR para o admin e as notificações. */
export const PHONE_COUNTRY_LABELS: Record<PhoneCountry, string> = {
  DE: 'Alemanha (+49)',
  AT: 'Áustria (+43)',
  CH: 'Suíça (+41)',
  other: 'Fora do DACH',
};

/** Respostas do formulário de campanha, como gravadas em `campaign_data`. */
export interface CampaignData {
  interests?: string[];
  children_ages?: string;
  preferred_day?: string;
  phone_country?: PhoneCountry;
  consent_at?: string;
}

export function parseCampaignData(value: unknown): CampaignData {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as CampaignData)
    : {};
}

import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Etiquetas manuais de agrupamento de leads (ver /admin/crm, drawer do lead).
 *
 * Substitui `campaign` como mecanismo de filtro/rótulo: toda campanha (AIDA
 * Karneval etc.) também vira uma etiqueta aqui na hora em que o lead entra
 * (`/api/anfrage`), então CRM, Leads e Propostas filtram e mostram tudo pelo
 * mesmo sistema, em vez de campanha e etiqueta serem duas coisas paralelas.
 * `campaign` continua existindo em `price_leads` — ele ainda decide as datas
 * fixas, os interesses e o e-mail de confirmação do formulário —, só deixou
 * de ser o que dirige o filtro/badge no admin.
 */
export interface LeadGroup {
  id: string;
  name: string;
}

type GroupMemberRow = { lead_id: string; lead_groups: LeadGroup | LeadGroup[] | null };

/**
 * Mapa lead_id -> etiquetas, pra anexar `groups` a qualquer listagem de leads
 * (CRM, /admin/leads, /admin/propostas) sem repetir o join em cada página.
 */
export async function fetchLeadGroupsMap(
  supabase: SupabaseClient,
): Promise<Map<string, LeadGroup[]>> {
  const { data } = await supabase
    .from('lead_group_members')
    .select('lead_id, lead_groups(id, name)');

  const map = new Map<string, LeadGroup[]>();
  for (const row of (data ?? []) as GroupMemberRow[]) {
    const group = Array.isArray(row.lead_groups) ? row.lead_groups[0] : row.lead_groups;
    if (!group) continue;
    const list = map.get(row.lead_id);
    if (list) list.push(group);
    else map.set(row.lead_id, [group]);
  }
  return map;
}

/**
 * Regra única do filtro por etiqueta, usada por CRM, leads e propostas — o
 * mesmo papel que `matchesCampaign` tinha antes de a campanha virar etiqueta.
 * Sem filtro devolve tudo; 'none' seleciona quem não está em etiqueta alguma.
 *
 * 'all' é o mesmo que sem filtro, mas dito na URL: a página de propostas abre
 * em 'none' por padrão, então lá "todos os grupos" precisa de um valor
 * explícito — ausência de parâmetro ali significa o padrão, não "tudo".
 */
export function matchesGroup(leadGroups: LeadGroup[], filter: string | undefined): boolean {
  if (!filter || filter === 'all') return true;
  if (filter === 'none') return leadGroups.length === 0;
  return leadGroups.some(g => g.id === filter);
}

/**
 * Etiqueta de uma campanha, criada na hora se ainda não existir.
 *
 * O nome bom ("AIDA Karneval 2028") só existe no catálogo em
 * `src/lib/campaigns.ts`, então quem cria a etiqueta com o rótulo certo é este
 * caminho, não o trigger `price_leads_sync_lead_group` (migration
 * `20260908010000`) — o trigger conhece só o slug e cai num nome derivado dele.
 * Por isso isto roda ANTES de gravar o lead: assim, quando o trigger disparar,
 * a etiqueta já existe com o nome certo e ele só amarra o lead nela.
 *
 * `campaign_slug` é a chave, não o nome: renomear a etiqueta no CRM não pode
 * fazer a próxima inscrição criar uma segunda.
 */
export async function ensureCampaignGroup(
  supabase: SupabaseClient,
  slug: string,
  label: string,
): Promise<string | null> {
  const { data: bySlug } = await supabase
    .from('lead_groups')
    .select('id')
    .eq('campaign_slug', slug)
    .maybeSingle();
  if (bySlug) return bySlug.id;

  // Etiqueta criada à mão no CRM com o mesmo nome, ou pelo código antigo, que
  // etiquetava por nome e não gravava o slug: adota em vez de duplicar.
  const { data: byName } = await supabase
    .from('lead_groups')
    .select('id')
    .eq('name', label)
    .maybeSingle();
  if (byName) {
    await supabase.from('lead_groups').update({ campaign_slug: slug }).eq('id', byName.id);
    return byName.id;
  }

  const { data: created } = await supabase
    .from('lead_groups')
    .insert({ name: label, campaign_slug: slug })
    .select('id')
    .single();
  return created?.id ?? null;
}

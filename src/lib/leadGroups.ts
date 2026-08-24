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
 */
export function matchesGroup(leadGroups: LeadGroup[], filter: string | undefined): boolean {
  if (!filter) return true;
  if (filter === 'none') return leadGroups.length === 0;
  return leadGroups.some(g => g.id === filter);
}

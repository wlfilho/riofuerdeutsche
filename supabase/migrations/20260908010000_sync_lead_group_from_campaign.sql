-- Campanha do lead (`price_leads.campaign`) passa a criar sozinha a etiqueta
-- correspondente em `lead_groups`/`lead_group_members`.
--
-- Por quê: quem filtra no admin (CRM, /admin/leads, /admin/propostas) lê a
-- ETIQUETA, não a campanha (ver `matchesGroup` em src/lib/leadGroups.ts). Até
-- aqui só /api/anfrage etiquetava, e sempre que um lead foi movido para uma
-- campanha por SQL direto (migração de mão, MCP) ele ficava com `campaign`
-- preenchido e etiqueta nenhuma: aparecia em "sem etiqueta" e sumia do filtro
-- da campanha. Aconteceu com 5 leads da AIDA Karneval 2028 em 08.09.2026,
-- mesma classe de problema que os triggers de status já resolvem para a
-- corrente proposta -> lead -> calendário.
--
-- A ligação campanha <-> etiqueta vira explícita (`lead_groups.campaign_slug`)
-- em vez de comparação por nome, senão o trigger teria que repetir em SQL o
-- mapa de rótulos que vive em src/lib/campaigns.ts.
--
-- O trigger só ADICIONA. Tirar etiqueta continua sendo decisão do admin no
-- drawer: limpar `campaign` não desetiqueta nada, porque a etiqueta pode ter
-- sido posta à mão por outro motivo.

alter table public.lead_groups
  add column if not exists campaign_slug text unique;

comment on column public.lead_groups.campaign_slug is
  'Slug da campanha (src/lib/campaigns.ts) que esta etiqueta espelha. Null nas etiquetas manuais do CRM.';

-- Etiqueta que já existia, criada por /api/anfrage pelo rótulo da campanha.
update public.lead_groups
   set campaign_slug = 'aida-karneval-2028'
 where name = 'AIDA Karneval 2028'
   and campaign_slug is null;

create or replace function public.sync_lead_group_from_campaign()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_group_id uuid;
begin
  select id into v_group_id
    from lead_groups
   where campaign_slug = new.campaign;

  -- Campanha nova, cujo primeiro lead entrou por SQL antes de qualquer envio
  -- do formulário: cria a etiqueta com um nome derivado do slug. O rótulo bom
  -- ("AIDA Karneval 2028") vem de /api/anfrage, que conhece o catálogo de
  -- campanhas; aqui só garante que o lead não fique órfão de etiqueta.
  if v_group_id is null then
    insert into lead_groups (name, campaign_slug)
    values (initcap(replace(new.campaign, '-', ' ')), new.campaign)
    on conflict do nothing
    returning id into v_group_id;

    if v_group_id is null then
      select id into v_group_id from lead_groups where campaign_slug = new.campaign;
    end if;
  end if;

  if v_group_id is not null then
    insert into lead_group_members (lead_id, group_id)
    values (new.id, v_group_id)
    on conflict do nothing;
  end if;

  return null;
exception when others then
  -- Etiquetar é acessório: nunca pode derrubar a entrada de um lead pelo
  -- formulário público. Mesma escolha do best-effort em /api/anfrage.
  raise warning 'sync_lead_group_from_campaign falhou para o lead % (campanha %): %',
    new.id, new.campaign, sqlerrm;
  return null;
end;
$$;

comment on function public.sync_lead_group_from_campaign() is
  'Garante a etiqueta (lead_groups) do lead sempre que price_leads.campaign é gravado, inclusive por SQL direto. Só adiciona, nunca remove.';

drop trigger if exists price_leads_sync_lead_group on public.price_leads;

create trigger price_leads_sync_lead_group
  after insert or update of campaign on public.price_leads
  for each row
  when (new.campaign is not null)
  execute function public.sync_lead_group_from_campaign();

-- Backfill: todo lead de campanha que ainda não tem a etiqueta.
insert into public.lead_group_members (lead_id, group_id)
select l.id, g.id
  from public.price_leads l
  join public.lead_groups g on g.campaign_slug = l.campaign
 where l.campaign is not null
on conflict do nothing;

-- Função de trigger não é API: chamar por RPC nem funcionaria (o Postgres exige
-- contexto de trigger), mas o linter do Supabase reclama de SECURITY DEFINER
-- exposto ao PostgREST e ele tem razão como regra.
revoke execute on function public.sync_lead_group_from_campaign() from anon, authenticated, public;

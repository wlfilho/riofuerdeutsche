-- Etiquetas manuais para agrupar leads (ex.: "AIDA Carnaval 2028",
-- "Grupo Wickert"), independente da campanha automática de landing page
-- (`price_leads.campaign`, fixa no código e atribuída só na entrada).
--
-- Muitos-para-muitos: um lead pode estar em vários grupos ao mesmo tempo, e
-- os grupos são criados livremente pelo admin (drawer do CRM), sem precisar
-- de deploy.

create table if not exists public.lead_groups (
  id         uuid primary key default gen_random_uuid(),
  name       text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.lead_group_members (
  lead_id    uuid not null references public.price_leads(id) on delete cascade,
  group_id   uuid not null references public.lead_groups(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (lead_id, group_id)
);

create index if not exists lead_group_members_group_idx
  on public.lead_group_members (group_id);

alter table public.lead_groups enable row level security;
alter table public.lead_group_members enable row level security;

create policy "admin_only" on public.lead_groups
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
        and profiles.role = 'admin'
    )
  );

create policy "admin_only" on public.lead_group_members
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
        and profiles.role = 'admin'
    )
  );

comment on table public.lead_groups is
  'Etiquetas/grupos manuais para agrupar leads no CRM, criadas ad hoc pelo admin.';
comment on table public.lead_group_members is
  'Associação muitos-para-muitos entre price_leads e lead_groups.';

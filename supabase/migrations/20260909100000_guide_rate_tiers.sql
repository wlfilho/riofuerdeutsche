-- Honorário do guia por faixa de tamanho de grupo.
--
-- Até aqui o honorário era um escalar único (site_settings.guide_rate_eur):
-- copiado uma vez para o state do builder e nunca mais sensível ao pax. Como o
-- veículo necessário muda com o tamanho do grupo (carro de passeio → carro de
-- 7 lugares → van), o honorário que cobre esse custo também muda. Com o valor
-- fixo, 8 das 12 propostas de 4+ pessoas saíram no preço de 1–3 pax.
--
-- As faixas espelham as de proposal_transport_tiers de propósito, mas vivem em
-- tabela própria: honorário não é transporte e precisa existir também em dia a
-- pé, em que não há faixa de veículo nenhuma.
create table if not exists public.proposal_guide_rate_tiers (
  id uuid primary key default gen_random_uuid(),
  min_pax integer not null check (min_pax >= 1),
  -- null = faixa sem limite superior.
  max_pax integer check (max_pax is null or max_pax >= min_pax),
  rate_eur numeric not null check (rate_eur >= 0),
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.proposal_guide_rate_tiers enable row level security;

drop policy if exists admin_all_proposal_guide_rate_tiers on public.proposal_guide_rate_tiers;
create policy admin_all_proposal_guide_rate_tiers
  on public.proposal_guide_rate_tiers
  for all
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );

-- Seed com os valores em uso hoje. O 60 da faixa 6–18 vem da conta: van a
-- R$1.000/dia com motorista incluso, diluída num dia mediano de 7h, mantendo o
-- mesmo líquido por hora que a faixa 4–5 já entrega.
--
-- 6–18 é o teto da van; grupo maior que isso não cai em faixa nenhuma de
-- propósito, para o builder avisar em vez de aplicar um preço de uma van só a
-- um grupo que precisa de duas.
insert into public.proposal_guide_rate_tiers (min_pax, max_pax, rate_eur, sort_order)
select v.min_pax, v.max_pax, v.rate_eur, v.sort_order
from (values
  (1, 3, 40::numeric, 0),
  (4, 5, 55::numeric, 10),
  (6, 18, 60::numeric, 20)
) as v(min_pax, max_pax, rate_eur, sort_order)
where not exists (select 1 from public.proposal_guide_rate_tiers);

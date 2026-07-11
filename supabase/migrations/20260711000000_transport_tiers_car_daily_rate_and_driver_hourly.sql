-- Transporte por faixa passa a ter dois custos separados:
--   car_daily_rate         → diária fixa do veículo (cobrada 1x por dia de uso)
--   driver_price_per_hour  → motorista terceirizado, por hora de deslocamento
-- (antes havia um único price_per_hour)
alter table public.proposal_transport_tiers
  rename column price_per_hour to driver_price_per_hour;

alter table public.proposal_transport_tiers
  add column car_daily_rate numeric not null default 0;

-- Recadastro das 3 faixas do modelo carro + motorista:
--   1–3 pax  → carro de passeio
--   4–5 pax  → carro 7 lugares
--   6–18 pax → van 18 lugares
-- Valores zerados são PLACEHOLDERS: preencher no CRUD antes do uso real.
with ranked as (
  select id, row_number() over (order by sort_order) as rn
  from public.proposal_transport_tiers
  where transport_type_id = (
    select id from public.proposal_transport_types where slug = 'motorista-privado'
  )
)
update public.proposal_transport_tiers t
set
  min_pax = case ranked.rn when 1 then 1 when 2 then 4 else 6 end,
  max_pax = case ranked.rn when 1 then 3 when 2 then 5 else 18 end,
  car_daily_rate = 0,
  driver_price_per_hour = 0
from ranked
where ranked.id = t.id;

-- Preenche as faixas de transporte que estavam com os placeholders zerados da
-- migration 20260711000000. Sem isso, toda proposta de 4+ pessoas congela o
-- custo interno de veículo como zero, mesmo quando o custo real existe.
--
-- Valores informados pelo Will em 09/09/2026:
--   1–3 pax  → carro de passeio R$200/dia + motorista terceirizado R$70/h
--   4–5 pax  → carro de 7 lugares R$400/dia + o mesmo motorista R$70/h
--   6–18 pax → van R$1.000/dia COM MOTORISTA INCLUSO (por isso a hora zera)
update public.proposal_transport_tiers t
set car_daily_rate = 400, driver_price_per_hour = 70, currency = 'BRL'
where t.min_pax = 4 and t.max_pax = 5
  and t.transport_type_id = (
    select id from public.proposal_transport_types where slug = 'motorista-privado'
  );

update public.proposal_transport_tiers t
set car_daily_rate = 1000, driver_price_per_hour = 0, currency = 'BRL'
where t.min_pax = 6 and t.max_pax = 18
  and t.transport_type_id = (
    select id from public.proposal_transport_types where slug = 'motorista-privado'
  );

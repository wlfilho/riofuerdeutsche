-- Custos de atividade podem ser cobrados na proposta (include_in_price = true,
-- comportamento até aqui) ou deixados por conta do cliente no local
-- (include_in_price = false) — nesse caso o valor ainda é EXIBIDO na proposta
-- ("Vor Ort zu zahlen") para o cliente se programar. O valor daqui é o default
-- da atividade; cada proposta pode inverter por item.
alter table public.proposal_service_costs
  add column include_in_price boolean not null default true;

-- Exemplo citado pelo Will: entrada do Cristo via Paineiras, R$ 87 por pessoa,
-- por padrão paga pelo cliente no local. Descrição em alemão (é exibida ao cliente).
insert into public.proposal_service_costs
  (service_id, description, base_price, currency, price_type, sort_order, include_in_price)
select id, 'Eintritt Paineiras (Corcovado)', 87, 'BRL', 'per_pax', 10, false
from public.proposal_services
where slug = 'cristo-redentor'
  and not exists (
    select 1 from public.proposal_service_costs c
    where c.service_id = proposal_services.id
  );

-- View pública read-only com a duração das atrações do catálogo de propostas.
-- proposal_services é admin-only no RLS e continua assim: esta view expõe
-- apenas as colunas de TEMPO, para que páginas públicas (/touren/klassiker)
-- parem de guardar duração escrita à mão e leiam a fonte de verdade.
--
-- Preço NÃO passa por aqui: base_price/price_type moram em
-- proposal_service_costs, que fica fora da view de propósito.
--
-- Mesma técnica do public_contact_info: security definer (padrão) para ler a
-- tabela protegida, com whitelist de colunas e filtro fixo em atrações ativas.
create or replace view public.public_tour_services as
select
  slug,
  name,
  duration_hours,
  transfer_hours_to,
  transfer_hours_back
from public.proposal_services
where is_active = true
  and category = 'atração';

revoke all on public.public_tour_services from anon, authenticated;
grant select on public.public_tour_services to anon, authenticated;

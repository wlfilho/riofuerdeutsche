-- Motoristas: pessoas que dirigem nos tours, com login próprio.
--
-- Modelo: um motorista é um usuário normal do Supabase Auth com
-- profiles.role = 'driver'. A escala é por DIA de tour (tour_dates.driver_id),
-- igual ao guia parceiro (with_partner/partner_name): num pacote de vários
-- dias pode haver motoristas diferentes por dia.
--
-- Acesso do motorista aos próprios tours: a página /motorista roda no
-- servidor com a service role e filtra por driver_id = auth.uid() depois de
-- conferir o papel — mesmo padrão das rotas /api/admin. Por isso NÃO há
-- policy nova aqui: dar SELECT direto ao motorista exigiria abrir também
-- price_leads e proposals (hoje admin-only), o que vazaria preço e dados de
-- outros clientes.

alter table public.profiles drop constraint profiles_role_check;
alter table public.profiles add constraint profiles_role_check
  check (role = any (array['user'::text, 'premium'::text, 'admin'::text, 'driver'::text]));

-- ON DELETE SET NULL: apagar o cadastro do motorista não pode apagar o tour;
-- o dia volta a ficar "sem motorista" e aparece como pendência no admin.
alter table public.tour_dates
  add column driver_id uuid references public.profiles(id) on delete set null;

create index tour_dates_driver_id_idx on public.tour_dates(driver_id);

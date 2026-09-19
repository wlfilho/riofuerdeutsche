-- Aplicada em produção em 16/09/2026 via Supabase MCP; o arquivo foi gravado
-- depois, para o repositório ter o registro. O conteúdo é o que está em
-- supabase_migrations.schema_migrations, sem alteração.

-- 1. Coordenadas por serviço (atração)
alter table public.proposal_services
  add column if not exists latitude  numeric(9,6),
  add column if not exists longitude numeric(9,6),
  add column if not exists geo_source text,
  add column if not exists geo_updated_at timestamptz;

comment on column public.proposal_services.latitude is 'Latitude do ponto de encontro do serviço (WGS84). Null = usar transfer_hours_* como fallback.';
comment on column public.proposal_services.longitude is 'Longitude do ponto de encontro do serviço (WGS84).';
comment on column public.proposal_services.geo_source is 'Origem da coordenada: manual, nominatim, ors-geocode, etc.';

-- 2. Origem do cliente na proposta (porto, hotel, endereço)
alter table public.proposals
  add column if not exists origin_label     text,
  add column if not exists origin_latitude  numeric(9,6),
  add column if not exists origin_longitude numeric(9,6),
  add column if not exists origin_geocoded_at timestamptz;

comment on column public.proposals.origin_label is 'Endereço ou nome do ponto de partida informado pelo Will (hotel, porto, aeroporto).';
comment on column public.proposals.origin_latitude is 'Latitude geocodificada de origin_label. Null = deslocamento de/para origem cai no fallback fixo.';

-- 3. Matriz de deslocamento pré-calculada entre serviços
create table if not exists public.proposal_travel_matrix (
  from_service_id uuid not null references public.proposal_services(id) on delete cascade,
  to_service_id   uuid not null references public.proposal_services(id) on delete cascade,
  duration_seconds integer not null,
  distance_meters  integer,
  provider text not null default 'openrouteservice',
  computed_at timestamptz not null default now(),
  primary key (from_service_id, to_service_id),
  constraint proposal_travel_matrix_duration_positive check (duration_seconds >= 0)
);

comment on table public.proposal_travel_matrix is 'Tempo de deslocamento real entre pares de serviços, pré-calculado. Populado por script, não em runtime.';

create index if not exists proposal_travel_matrix_from_idx
  on public.proposal_travel_matrix (from_service_id);

alter table public.proposal_travel_matrix enable row level security;

create policy proposal_travel_matrix_read_authenticated
  on public.proposal_travel_matrix
  for select
  to authenticated
  using (true);

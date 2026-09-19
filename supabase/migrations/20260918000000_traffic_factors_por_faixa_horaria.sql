-- Fator de trânsito por faixa de horário, aplicado sobre o tempo do ORS
-- (que calcula em fluxo livre). Só o início de cada faixa é guardado: ela
-- vale até o início da próxima, e a última dá a volta na meia-noite, então
-- não há como configurar buraco nem sobreposição.
alter table public.site_settings
  add column if not exists traffic_factors jsonb not null default
    '[{"start":"07:00","factor":1.5},
      {"start":"10:00","factor":1.3},
      {"start":"16:00","factor":1.5},
      {"start":"19:00","factor":1.0}]'::jsonb;

comment on column public.site_settings.traffic_factors is
  'Faixas de trânsito: [{start:"HH:MM", factor:number}]. Multiplica só tempo vindo do OpenRouteService; o tempo fixo do catálogo já embute trânsito.';

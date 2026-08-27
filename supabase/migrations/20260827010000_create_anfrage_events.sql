-- Funil da /anfrage: view -> start -> submit.
--
-- Tabela própria em vez dos eventos customizados do Vercel Analytics, que
-- exigem plano Pro/Enterprise (a API devolve 402 no Hobby). Duas vantagens
-- além do custo: histórico ilimitado (o Hobby corta em 31 dias) e os eventos
-- ficam ao lado de price_leads, então dá pra juntar funil e lead — "quem
-- abandonou tinha chegado de qual página?" — coisa que o Vercel não responde
-- nem no plano pago.
--
-- Molde: proposal_events, que já resolve bot, admin e sendBeacon.
create table anfrage_events (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null,
  event_type text not null check (event_type in ('view', 'start', 'submit')),
  von text,
  tour text,
  thema text,
  lead_id uuid references price_leads(id) on delete set null,
  country text,
  created_at timestamptz not null default now()
);

-- Um evento de cada tipo por sessão: 'view' dispara a cada carga e 'start' a
-- cada primeiro toque, mas o funil quer pessoas, não repetições.
create unique index anfrage_events_sessao_tipo on anfrage_events (session_id, event_type);
create index anfrage_events_created_at on anfrage_events (created_at desc);

comment on table anfrage_events is
  'Funil da /anfrage (view/start/submit). Coleta própria porque custom events do Vercel Analytics exigem plano pago. Admin e user-agent de automação não são gravados — ver /api/anfrage/events.';

alter table anfrage_events enable row level security;
-- Sem policy: só a service role (a rota) escreve.

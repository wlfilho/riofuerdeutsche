-- Aceite/recusa do banner de cookies.
--
-- O GA4 só carrega depois do aceite, então ele nunca consegue contar quem
-- recusa: o denominador some junto com o consentimento. Para saber a proporção
-- real é preciso uma coleta que funcione sem depender de consentimento nenhum,
-- e é o que esta tabela é. Guarda só a escolha e o país (header de geo da
-- Vercel), sem IP, sem cookie e sem identificador de sessão, então não há dado
-- pessoal a consentir.
--
-- Molde: anfrage_events / proposal_events, que já resolvem bot e admin.
create table consent_events (
  id uuid primary key default gen_random_uuid(),
  choice text not null check (choice in ('accepted', 'rejected')),
  country text,
  created_at timestamptz not null default now()
);

create index consent_events_created_at on consent_events (created_at desc);

comment on table consent_events is
  'Aceite/recusa do banner de cookies. Existe porque o GA4 só mede quem aceita. Admin e user-agent de automação não são gravados — ver /api/consent-events.';

alter table consent_events enable row level security;
-- Sem policy: só a service role (a rota) escreve; leitura só via SQL de admin.

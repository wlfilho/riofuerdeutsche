-- Link público da proposta (/angebot/<token>): token não-adivinhável e
-- independente do id, para poder ser regenerado sem afetar nada no admin.
alter table public.proposals
  add column public_token uuid not null default gen_random_uuid();

create unique index proposals_public_token_idx on public.proposals (public_token);

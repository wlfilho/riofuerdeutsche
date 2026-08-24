-- Log bruto do webhook do uazapi.
--
-- Por que guardar o payload inteiro: a documentação do uazapi é renderizada por
-- JavaScript e não foi possível ler o formato dos eventos antes de escrever o
-- receptor. Em vez de adivinhar o schema, o webhook grava o corpo cru aqui e
-- extrai o que reconhece. Quando o formato real estiver claro pelos primeiros
-- eventos, o parser em src/app/api/webhooks/uazapi/route.ts pode ser apertado —
-- e o histórico continua reprocessável porque nada foi descartado.
--
-- Contém conteúdo de conversa com clientes: dado pessoal. Acesso só via service
-- role, mesmo critério de cadastur_prestadores.

create table if not exists public.whatsapp_events (
  id            uuid primary key default gen_random_uuid(),
  received_at   timestamptz not null default now(),

  -- Identificação extraída (best-effort; null quando o parser não reconheceu)
  instance      text,
  phone         text,          -- só dígitos, com DDI
  phone_tail    text,          -- últimos 8 dígitos, para casar com contacts
  direction     text,          -- 'received' | 'sent'
  message_text  text,
  message_at    timestamptz,

  -- Vínculos resolvidos, quando encontrados
  contact_id    uuid references public.contacts(id) on delete set null,
  lead_id       uuid references public.price_leads(id) on delete set null,

  -- O que o uazapi mandou, intacto
  payload       jsonb not null,

  -- Diagnóstico do processamento
  parse_status  text not null default 'ok',   -- 'ok' | 'unparsed' | 'ignored'
  parse_note    text
);

create index if not exists whatsapp_events_received_at_idx
  on public.whatsapp_events (received_at desc);

create index if not exists whatsapp_events_phone_tail_idx
  on public.whatsapp_events (phone_tail);

create index if not exists whatsapp_events_lead_idx
  on public.whatsapp_events (lead_id);

-- Um evento por mensagem: o uazapi reenvia o webhook quando não recebe 200, e
-- sem isso um retry viraria toque duplicado na triagem.
create unique index if not exists whatsapp_events_dedupe_idx
  on public.whatsapp_events ((payload->>'id'))
  where payload->>'id' is not null;

alter table public.whatsapp_events enable row level security;

-- Nenhuma policy: sem policy e com RLS ligado, anon e authenticated não leem
-- nada. Só a service_role (que ignora RLS) enxerga.

comment on table public.whatsapp_events is
  'Eventos crus do webhook do uazapi (WhatsApp). Conteúdo de conversa com clientes — dado pessoal, acesso somente via service role. O parser é best-effort: payload sempre preservado.';

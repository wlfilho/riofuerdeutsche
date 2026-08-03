-- Como os preços aparecem pro cliente no PDF/WhatsApp da proposta:
--   'total'   → só o valor final do tour (padrão do Will)
--   'per_day' → subtotal por dia + valor final
-- Preço por atividade nunca é exibido ao cliente (só nas telas internas).
alter table public.proposals
  add column price_display text not null default 'total'
  check (price_display in ('total', 'per_day'));

-- Validade da proposta ("Angebot gültig bis"): urgência honesta + proteção
-- contra variação de câmbio. Default +14 dias aplicado no form (editável);
-- null = proposta sem prazo (propostas antigas).
alter table public.proposals
  add column valid_until date;

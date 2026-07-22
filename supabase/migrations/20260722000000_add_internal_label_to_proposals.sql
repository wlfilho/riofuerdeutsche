-- Rótulo interno da proposta, visível só no admin: diferencia propostas do
-- mesmo cliente (ex.: "Plano chuva") sem mexer no client_name, que é usado
-- como título da proposta e para se dirigir ao cliente.
alter table public.proposals add column internal_label text;

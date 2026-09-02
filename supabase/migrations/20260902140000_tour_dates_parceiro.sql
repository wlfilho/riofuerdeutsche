-- Dia entregue a um guia parceiro.
--
-- Quando dois clientes querem o mesmo dia, o Will não recusa o segundo: ele
-- procura um parceiro. Só que "achar o parceiro" é um processo com duas
-- etapas, e o calendário precisa aguentar ficar no meio do caminho:
--
--   1. a decisão ("esse dia não vou ser eu"), muitas vezes sem saber ainda quem;
--   2. o fechamento com alguém, que pode acontecer dias depois.
--
-- Por isso são dois campos e não um. `with_partner` sozinho é pendência
-- ("Parceiro a definir", âmbar, tarefa aberta); com `partner_name` vira
-- registro ("Guia: João", neutro).
--
-- Consequência no alerta de conflito: dia coberto por parceiro não consome a
-- SUA agenda. Ele deixa de disputar o dia com os outros clientes, e um cliente
-- novo naquela data não acusa mais conflito.

ALTER TABLE public.tour_dates
  ADD COLUMN IF NOT EXISTS with_partner boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS partner_name text;

-- Nome de parceiro sem a marca de parceiro seria um registro órfão: ou o dia é
-- de parceiro, ou não tem nome de parceiro.
ALTER TABLE public.tour_dates DROP CONSTRAINT IF EXISTS tour_dates_partner_name_check;
ALTER TABLE public.tour_dates ADD CONSTRAINT tour_dates_partner_name_check
  CHECK (partner_name IS NULL OR with_partner);

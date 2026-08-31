-- ── Aposenta `tour_clients` ──────────────────────────────────────────────────
--
-- Caminho 3 da nota "Contatos — Lead, Cliente e Guide" (Obsidian, Estratégias).
--
-- `tour_clients` era a definição de cliente de 08/04/2026, quando ainda não
-- existiam leads no admin, propostas nem calendário. Virou uma segunda verdade
-- sobre quem é cliente: a tela perguntava a ela, e ela tinha 1 linha — um
-- registro de teste, apagado em 31/08/2026 junto com os 4 logs de e-mail.
--
-- A sequência pré-tour passa a se ancorar no LEAD, não numa cópia dele:
--   quem      → price_leads (nome, e-mail)
--   quando    → tour_dates com status 'fechado' (primeira e última data)
--   quanto    → a proposta aceita (total e sinal)
--   o quê     → o itinerário da proposta aceita
--
-- Por que o lead e não o contato: um contato pode fechar duas viagens em anos
-- diferentes, e cada uma tem a própria sequência de e-mails.
--
-- As duas tabelas estão vazias (0 linhas em ambas), então não há dado a migrar
-- e nenhum histórico se perde.

-- ── email_sequence_log: client_id → lead_id ─────────────────────────────────
ALTER TABLE public.email_sequence_log
  DROP COLUMN client_id;

ALTER TABLE public.email_sequence_log
  ADD COLUMN lead_id uuid NOT NULL
    REFERENCES public.price_leads(id) ON DELETE CASCADE;

-- Uma sequência por lead: o agendamento é idempotente e consulta por aqui.
CREATE INDEX email_sequence_log_lead_id_idx
  ON public.email_sequence_log (lead_id);

COMMENT ON COLUMN public.email_sequence_log.lead_id IS
  'Lead que fechou. Âncora da sequência pré-tour desde 31/08/2026, no lugar de tour_clients.';

-- ── A tabela sai ────────────────────────────────────────────────────────────
DROP TABLE public.tour_clients;

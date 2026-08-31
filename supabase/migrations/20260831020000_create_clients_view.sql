-- ── Quem é cliente ───────────────────────────────────────────────────────────
--
-- Definição ÚNICA de cliente, no banco e não na tela: o contato que fechou.
--
-- Antes, "cliente" era quem tinha linha em `tour_clients` — tabela de 08/04/2026,
-- criada para a sequência de e-mails pré/pós-tour, quando ainda não existiam
-- leads no admin (09/06), propostas (22/05) nem calendário (09/07). O funil real
-- virou lead → proposta → calendário e ninguém reatou a ponta: a tabela ficou com
-- 1 linha (um registro de teste), e a tela de contatos, que perguntava a ela quem
-- era cliente, escondia os 17 clientes reais.
--
-- A view mora no banco porque a mesma pergunta vai ser feita por dois lugares: a
-- tela de contatos hoje, o cron da sequência de e-mails quando `tour_clients` for
-- aposentada. Duas cópias da regra em TypeScript divergiriam.
--
-- security_invoker: herda o RLS admin-only de price_leads/proposals/tour_dates,
-- como as views de analytics de proposta.
CREATE VIEW clients_v
  WITH (security_invoker = true) AS
WITH sinais AS (
  -- Os três sinais que o funil grava. LEFT JOIN em tour_dates já filtrado por
  -- 'fechado': data de tour ainda em negociação não faz ninguém virar cliente.
  SELECT
    l.contact_id,
    (l.status = 'closed')   AS lead_closed,
    (p.status = 'accepted') AS proposal_accepted,
    d.date                  AS closed_date,
    l.campaign
  FROM price_leads l
  LEFT JOIN proposals  p ON p.id = l.proposal_id
  LEFT JOIN tour_dates d ON d.lead_id = l.id AND d.status = 'fechado'
  WHERE l.contact_id IS NOT NULL

  UNION ALL

  -- Proposta aceita sem lead vinculado (plano B duplicado, proposta avulsa):
  -- casa pelo e-mail do contato, mesma regra da aba Propostas.
  SELECT c.id, false, true, NULL::date, NULL::text
  FROM proposals p
  JOIN contacts  c ON c.email = p.client_email
  WHERE p.status = 'accepted'
)
SELECT
  contact_id,
  bool_or(lead_closed)             AS lead_closed,
  bool_or(proposal_accepted)       AS proposal_accepted,
  bool_or(closed_date IS NOT NULL) AS has_closed_date,
  -- Primeira e última data fechada: não servem à tela de contatos, servem ao
  -- cron da sequência de e-mails (pré-tour conta da primeira, pós da última).
  min(closed_date)                 AS first_tour_date,
  max(closed_date)                 AS last_tour_date,
  -- Exposta, nunca escondida: quem filtra medição por campanha decide fora daqui.
  array_remove(array_agg(DISTINCT campaign), NULL) AS campaigns
FROM sinais
GROUP BY contact_id
HAVING bool_or(lead_closed)
    OR bool_or(proposal_accepted)
    OR bool_or(closed_date IS NOT NULL);

COMMENT ON VIEW clients_v IS
  'Contatos que fecharam: lead closed, proposta accepted ou data fechada no calendário. Definição única de "cliente" — ver Obsidian, Estratégias/Contatos — Lead, Cliente e Guide.';

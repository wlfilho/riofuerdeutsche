-- Analytics da página pública da proposta (/p/[token], /angebot/[token]).
--
-- Eventos crus enviados pelo navegador do cliente via POST /api/proposal-events
-- (service role; a tabela não tem policy de INSERT). O admin lê agregados pelas
-- views abaixo e pela página /admin/propostas/[id]/estatisticas.
--
-- Modelo de identidade:
--   visitor_id — uuid gerado no navegador e persistido em localStorage: mesmo
--                aparelho/pessoa em visitas repetidas. Mais de um visitor_id na
--                mesma proposta ≈ o link foi compartilhado com outra pessoa.
--   session_id — uuid por carregamento de página: uma "leitura".
--
-- Tipos de evento (metadata validado na API, nunca direto do cliente):
--   open    — página aberta {screen_w, screen_h, tz}
--   ping    — batimento periódico com acumulados {active_seconds, scroll_pct}
--   section — primeira vez que uma seção ficou visível {section, at_seconds}
--   click   — clique em CTA/share/copiar {target, at_seconds}

CREATE TABLE proposal_events (
  id          bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  proposal_id uuid NOT NULL REFERENCES proposals(id) ON DELETE CASCADE,
  session_id  text NOT NULL,
  visitor_id  text NOT NULL,
  event_type  text NOT NULL CHECK (event_type IN ('open', 'ping', 'section', 'click')),
  metadata    jsonb NOT NULL DEFAULT '{}'::jsonb,
  user_agent  text,
  referrer    text,
  locale      text,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_proposal_events_proposal ON proposal_events(proposal_id, created_at);
CREATE INDEX idx_proposal_events_session ON proposal_events(proposal_id, session_id);

ALTER TABLE proposal_events ENABLE ROW LEVEL SECURITY;

-- Só o admin lê; escrita fica sem policy de propósito (só a service role da
-- API insere). Mesmo padrão de tour_dates.
CREATE POLICY "admin_only" ON proposal_events
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
  );

-- ── Agregado por sessão (uma leitura da proposta) ────────────────────────────
-- security_invoker: a view herda o RLS de proposal_events (admin-only).
CREATE VIEW proposal_event_sessions
  WITH (security_invoker = true) AS
SELECT
  proposal_id,
  session_id,
  min(visitor_id)  AS visitor_id,
  min(created_at)  AS started_at,
  max(created_at)  AS last_seen_at,
  min(locale)      AS locale,
  min(user_agent)  AS user_agent,
  min(referrer) FILTER (WHERE event_type = 'open') AS referrer,
  -- pings carregam acumulados: o máximo da sessão é o valor final
  COALESCE(max((metadata->>'active_seconds')::numeric) FILTER (WHERE event_type = 'ping'), 0) AS active_seconds,
  COALESCE(max((metadata->>'scroll_pct')::numeric)     FILTER (WHERE event_type = 'ping'), 0) AS scroll_pct,
  bool_or(event_type = 'section' AND metadata->>'section' = 'price') AS saw_price,
  bool_or(event_type = 'section' AND metadata->>'section' = 'bank')  AS saw_bank,
  count(*) FILTER (WHERE event_type = 'click'
    AND metadata->>'target' IN ('whatsapp_cta', 'deposit_cta', 'whatsapp_contact', 'email_contact')) AS contact_clicks,
  count(*) FILTER (WHERE event_type = 'click'
    AND metadata->>'target' LIKE 'share\_%') AS share_clicks,
  count(*) FILTER (WHERE event_type = 'click'
    AND metadata->>'target' LIKE 'copy\_%') AS bank_copy_clicks
FROM proposal_events
GROUP BY proposal_id, session_id;

-- ── Agregado por proposta (badge da lista do admin) ──────────────────────────
CREATE VIEW proposal_analytics_summary
  WITH (security_invoker = true) AS
SELECT
  proposal_id,
  count(*)                    AS sessions,
  count(DISTINCT visitor_id)  AS unique_visitors,
  min(started_at)             AS first_view_at,
  max(last_seen_at)           AS last_view_at,
  sum(active_seconds)         AS total_active_seconds,
  max(scroll_pct)             AS max_scroll_pct,
  bool_or(saw_price)          AS saw_price,
  bool_or(saw_bank)           AS saw_bank,
  sum(contact_clicks)         AS contact_clicks,
  sum(share_clicks)           AS share_clicks,
  sum(bank_copy_clicks)       AS bank_copy_clicks
FROM proposal_event_sessions
GROUP BY proposal_id;

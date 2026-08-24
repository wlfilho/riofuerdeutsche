-- País/cidade do IP nos eventos da proposta.
--
-- Motivo: o fuso do navegador (metadata.tz) é o único sinal de "onde a pessoa
-- está" hoje, e ele mente fácil — quem viaja carrega o fuso de casa, e um
-- iPhone alemão no Rio aparece como America/Sao_Paulo. O país do IP responde a
-- pergunta que interessa de verdade quando o cliente ainda não viajou: essa
-- abertura veio da Alemanha (o cliente) ou do Brasil (eu, um teste, alguém
-- daqui)?
--
-- Vem dos headers de geolocalização da Vercel (x-vercel-ip-country / -city),
-- que a plataforma injeta na borda. Em dev local não existem: fica NULL, e a UI
-- mostra "—" em vez de inventar procedência.
--
-- Sem IP: guardamos só país e cidade, nunca o endereço. É o suficiente para
-- distinguir cliente de não-cliente e evita virar dado pessoal identificável.
ALTER TABLE proposal_events
  ADD COLUMN country text,  -- ISO 3166-1 alfa-2 ("DE", "BR")
  ADD COLUMN city    text;

-- ── Views recriadas para expor a origem por sessão ───────────────────────────
-- proposal_analytics_summary depende de proposal_event_sessions, então cai e
-- volta junto (idêntica à original).
DROP VIEW proposal_analytics_summary;
DROP VIEW proposal_event_sessions;

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
  -- Geo é gravado em todo evento; dentro de uma sessão não muda na prática.
  min(country)     AS country,
  min(city)        AS city,
  -- Fuso do navegador do 'open': junto do país do IP, separa "alemão em casa"
  -- de "alemão já no Rio" de "brasileiro daqui".
  min(metadata->>'tz') FILTER (WHERE event_type = 'open') AS tz,
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

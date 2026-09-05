-- Status "completed" (Concluído) em price_leads: o tour aconteceu.
--
-- Diferente dos outros status, é uma decisão MANUAL do admin (arrastar o card
-- no kanban), não derivada do relógio — quem quer tirar o pack da frente antes
-- dos 7 dias de arquivamento automático (leadArchive.ts) marca concluído. O
-- Cowork/MCP também passa a enxergar no banco que a conversa acabou.
--
-- Regras na corrente de sincronia:
--   - completed → proposta vinculada 'accepted' (igual a closed): concluir não
--     muda o resultado comercial, só registra que já foi entregue.
--   - completed → tour_dates 'fechado': os dias viram histórico, não somem.
--   - Lead 'completed' é terminal para a direção proposta → lead: mexer no
--     status da proposta NUNCA rebaixa um lead concluído (nem accepted → closed
--     nem rejected → lost, que apagaria as datas do tour já feito). Só o admin,
--     movendo o card, tira um lead de concluído.

-- ── Constraint ───────────────────────────────────────────────────────────────
ALTER TABLE public.price_leads
  DROP CONSTRAINT price_leads_status_check;
ALTER TABLE public.price_leads
  ADD CONSTRAINT price_leads_status_check
  CHECK (status = ANY (ARRAY['new', 'contacted', 'proposal_sent', 'closed', 'lost', 'completed']));

-- ── proposta → lead: nunca rebaixar um concluído ─────────────────────────────
CREATE OR REPLACE FUNCTION public.sync_lead_status_from_proposal()
RETURNS TRIGGER AS $$
DECLARE
  novo_status text;
BEGIN
  novo_status := CASE NEW.status
    WHEN 'draft'    THEN 'contacted'
    WHEN 'sent'     THEN 'proposal_sent'
    WHEN 'accepted' THEN 'closed'
    WHEN 'rejected' THEN 'lost'
  END;

  IF novo_status IS NULL THEN
    RETURN NEW;
  END IF;

  UPDATE public.price_leads
     SET status = novo_status
   WHERE proposal_id = NEW.id
     AND status IS DISTINCT FROM novo_status
     -- Concluído é terminal: o tour já foi feito, nenhum evento da proposta
     -- desfaz isso (e rebaixar pra 'lost' apagaria as datas do histórico).
     AND status <> 'completed';

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

ALTER FUNCTION public.sync_lead_status_from_proposal() SET search_path = '';

-- ── lead → calendário: concluído mantém os dias como 'fechado' ───────────────
CREATE OR REPLACE FUNCTION public.sync_tour_dates_from_lead()
RETURNS TRIGGER AS $$
DECLARE
  novo_status text;
BEGIN
  IF NEW.status = 'lost' THEN
    DELETE FROM public.tour_dates WHERE lead_id = NEW.id;
    RETURN NEW;
  END IF;

  novo_status := CASE NEW.status
    WHEN 'closed'        THEN 'fechado'
    WHEN 'completed'     THEN 'fechado'
    WHEN 'proposal_sent' THEN 'proposta_enviada'
  END;

  -- new/contacted não mexem no calendário
  IF novo_status IS NULL THEN
    RETURN NEW;
  END IF;

  UPDATE public.tour_dates
     SET status = novo_status
   WHERE lead_id = NEW.id
     AND status IS DISTINCT FROM novo_status;

  INSERT INTO public.tour_dates (lead_id, date, status, pax)
  SELECT NEW.id, dia, novo_status, NEW.pax
    FROM unnest(COALESCE(NEW.requested_days, ARRAY[]::date[])) AS dia
   WHERE NOT EXISTS (
     SELECT 1 FROM public.tour_dates td
      WHERE td.lead_id = NEW.id AND td.date = dia
   );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

ALTER FUNCTION public.sync_tour_dates_from_lead() SET search_path = '';

-- ── lead → proposta: concluído confirma a proposta vinculada ─────────────────
CREATE OR REPLACE FUNCTION public.sync_proposal_status_from_lead()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'lost' THEN
    UPDATE public.proposals
       SET status = 'rejected'
     WHERE (lead_id = NEW.id OR id = NEW.proposal_id)
       AND status IS DISTINCT FROM 'rejected';
  ELSIF NEW.status IN ('closed', 'completed') AND NEW.proposal_id IS NOT NULL THEN
    UPDATE public.proposals
       SET status = 'accepted'
     WHERE id = NEW.proposal_id
       AND status IS DISTINCT FROM 'accepted';
  ELSIF NEW.status = 'proposal_sent' AND NEW.proposal_id IS NOT NULL THEN
    -- Congela SÓ na entrada em 'sent' (mesma regra do TS: reenviar não
    -- re-resolve texto do catálogo; a guarda por item já seria suficiente,
    -- esta aqui poupa o trabalho à toa).
    IF EXISTS (SELECT 1 FROM public.proposals
                WHERE id = NEW.proposal_id AND status IS DISTINCT FROM 'sent') THEN
      PERFORM public.freeze_proposal_items_for_send(NEW.proposal_id);
      UPDATE public.proposals
         SET status = 'sent'
       WHERE id = NEW.proposal_id
         AND status IS DISTINCT FROM 'sent';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

ALTER FUNCTION public.sync_proposal_status_from_lead() SET search_path = '';

-- ── Cliente continua cliente depois do tour ──────────────────────────────────
-- Mesma definição da 20260831020000, com 'completed' contando como fechado.
CREATE OR REPLACE VIEW public.clients_v
  WITH (security_invoker = true) AS
WITH sinais AS (
  SELECT
    l.contact_id,
    (l.status IN ('closed', 'completed')) AS lead_closed,
    (p.status = 'accepted')               AS proposal_accepted,
    d.date                                AS closed_date,
    l.campaign
  FROM public.price_leads l
  LEFT JOIN public.proposals  p ON p.id = l.proposal_id
  LEFT JOIN public.tour_dates d ON d.lead_id = l.id AND d.status = 'fechado'
  WHERE l.contact_id IS NOT NULL

  UNION ALL

  SELECT c.id, false, true, NULL::date, NULL::text
  FROM public.proposals p
  JOIN public.contacts  c ON c.email = p.client_email
  WHERE p.status = 'accepted'
)
SELECT
  contact_id,
  bool_or(lead_closed)             AS lead_closed,
  bool_or(proposal_accepted)       AS proposal_accepted,
  bool_or(closed_date IS NOT NULL) AS has_closed_date,
  min(closed_date)                 AS first_tour_date,
  max(closed_date)                 AS last_tour_date,
  array_remove(array_agg(DISTINCT campaign), NULL) AS campaigns
FROM sinais
GROUP BY contact_id
HAVING bool_or(lead_closed)
    OR bool_or(proposal_accepted)
    OR bool_or(closed_date IS NOT NULL);

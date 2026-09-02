-- Proposta em rascunho passa a aparecer no calendário, com status próprio.
--
-- A investigação de 02/09/2026 mostrou o buraco mais perigoso da agenda: só o
-- envio por e-mail dentro do app marca a proposta como 'sent'. Link copiado e
-- colado no WhatsApp não marca nada, o lead fica em 'contacted', e o
-- calendário (que só mostrava proposal_sent/closed) fica cego. Foi o caso da
-- Lea Schallmo: a cliente abriu a proposta duas vezes de Bamberg, e os dias 17
-- e 19/10 não existiam em lugar nenhum da agenda.
--
-- Agora todo dia montado numa proposta entra no calendário. O que muda com o
-- status do lead é a COR, não a presença:
--   new/contacted   → rascunho          (dias da proposta apenas)
--   proposal_sent   → proposta_enviada  (dias da proposta + requested_days)
--   closed          → fechado           (idem)
--   lost            → linhas apagadas   (libera o dia)
--
-- Dia pedido na Anfrage só bloqueia a agenda quando já existe proposta enviada
-- ou fechada: antes disso é intenção do cliente, não compromisso seu.
--
-- Espelha TOUR_STATUS_BY_LEAD_STATUS e leadTourDays em src/lib/tourDates.ts.

ALTER TABLE public.tour_dates DROP CONSTRAINT IF EXISTS tour_dates_status_check;
ALTER TABLE public.tour_dates ADD CONSTRAINT tour_dates_status_check
  CHECK (status IN ('rascunho', 'proposta_enviada', 'fechado'));

-- ── lead → calendário ────────────────────────────────────────────────────────
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
    WHEN 'proposal_sent' THEN 'proposta_enviada'
    WHEN 'contacted'     THEN 'rascunho'
    WHEN 'new'           THEN 'rascunho'
  END;

  IF novo_status IS NULL THEN
    RETURN NEW;
  END IF;

  UPDATE public.tour_dates
     SET status = novo_status
   WHERE lead_id = NEW.id
     AND status IS DISTINCT FROM novo_status;

  INSERT INTO public.tour_dates (lead_id, date, status, pax)
  SELECT NEW.id, dias.dia, novo_status, NEW.pax
    FROM (
      -- requested_days só entra quando a proposta já foi enviada ou fechada
      SELECT unnest(
               CASE WHEN novo_status = 'rascunho'
                    THEN ARRAY[]::date[]
                    ELSE COALESCE(NEW.requested_days, ARRAY[]::date[])
               END
             ) AS dia
      UNION
      SELECT (item->>'day')::date
        FROM public.proposals p
        CROSS JOIN LATERAL jsonb_array_elements(COALESCE(p.items, '[]'::jsonb)) AS item
       WHERE p.id = NEW.proposal_id
         AND item->>'day' IS NOT NULL
    ) AS dias
   WHERE NOT EXISTS (
     SELECT 1 FROM public.tour_dates td
      WHERE td.lead_id = NEW.id AND td.date = dias.dia
   );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

ALTER FUNCTION public.sync_tour_dates_from_lead() SET search_path = '';

-- Vincular uma proposta a um lead também precisa acordar o calendário: o
-- status do lead não muda nesse instante, e sem isto os dias da proposta
-- recém-criada não chegam à agenda.
DROP TRIGGER IF EXISTS price_leads_sync_tour_dates ON public.price_leads;
CREATE TRIGGER price_leads_sync_tour_dates
AFTER UPDATE OF status, proposal_id ON public.price_leads
FOR EACH ROW
WHEN (OLD.status IS DISTINCT FROM NEW.status
      OR OLD.proposal_id IS DISTINCT FROM NEW.proposal_id)
EXECUTE FUNCTION public.sync_tour_dates_from_lead();

-- ── dias da proposta → calendário ────────────────────────────────────────────
-- Agora também no INSERT (proposta nasce com os dias dentro) e para lead em
-- qualquer status que não seja 'lost'.
CREATE OR REPLACE FUNCTION public.sync_tour_dates_from_proposal_days()
RETURNS TRIGGER AS $$
BEGIN
  -- No UPDATE, só interessa quando os dias mudaram. A checagem vive aqui
  -- dentro (e não numa cláusula WHEN) porque o mesmo trigger cobre INSERT,
  -- onde OLD não existe.
  IF TG_OP = 'UPDATE' AND OLD.items IS NOT DISTINCT FROM NEW.items THEN
    RETURN NEW;
  END IF;

  INSERT INTO public.tour_dates (lead_id, date, status, pax)
  SELECT l.id,
         (item->>'day')::date,
         CASE l.status
           WHEN 'closed'        THEN 'fechado'
           WHEN 'proposal_sent' THEN 'proposta_enviada'
           ELSE 'rascunho'
         END,
         l.pax
    FROM public.price_leads l
    CROSS JOIN LATERAL jsonb_array_elements(COALESCE(NEW.items, '[]'::jsonb)) AS item
   WHERE l.proposal_id = NEW.id
     AND l.status <> 'lost'
     AND item->>'day' IS NOT NULL
     AND NOT EXISTS (
       SELECT 1 FROM public.tour_dates td
        WHERE td.lead_id = l.id AND td.date = (item->>'day')::date
     );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

ALTER FUNCTION public.sync_tour_dates_from_proposal_days() SET search_path = '';

DROP TRIGGER IF EXISTS proposals_sync_tour_dates ON public.proposals;
CREATE TRIGGER proposals_sync_tour_dates
AFTER INSERT OR UPDATE OF items ON public.proposals
FOR EACH ROW
EXECUTE FUNCTION public.sync_tour_dates_from_proposal_days();

-- ── backfill ─────────────────────────────────────────────────────────────────
-- Dias de proposta em rascunho que nunca chegaram ao calendário (Lea Schallmo,
-- 17 e 19/10/2026, na data desta migration).
INSERT INTO public.tour_dates (lead_id, date, status, pax)
SELECT DISTINCT
       l.id,
       (item->>'day')::date,
       CASE l.status
         WHEN 'closed'        THEN 'fechado'
         WHEN 'proposal_sent' THEN 'proposta_enviada'
         ELSE 'rascunho'
       END,
       l.pax
  FROM public.price_leads l
  JOIN public.proposals p ON p.id = l.proposal_id
  CROSS JOIN LATERAL jsonb_array_elements(COALESCE(p.items, '[]'::jsonb)) AS item
 WHERE l.status <> 'lost'
   AND p.status <> 'rejected'
   AND item->>'day' IS NOT NULL
   AND NOT EXISTS (
     SELECT 1 FROM public.tour_dates td
      WHERE td.lead_id = l.id AND td.date = (item->>'day')::date
   );

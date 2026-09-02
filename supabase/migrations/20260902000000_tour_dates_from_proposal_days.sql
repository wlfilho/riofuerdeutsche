-- O calendário passa a nascer dos dias VENDIDOS, não só dos dias pedidos.
--
-- price_leads.requested_days é o que o cliente marcou na Anfrage e nunca é
-- reescrito depois — é o registro do pedido, não da venda. Quando o roteiro
-- cresce na montagem da proposta, os dois divergem em silêncio: o Blank Jürgen
-- (out/2026) pediu só 25/10, a proposta fechou Maracanã no dia 25 e Rocinha no
-- 26, e o dia 26 simplesmente não existia no calendário.
--
-- A fonte da agenda passa a ser a união de requested_days com os dias dos
-- items da proposta vinculada. Espelha leadTourDays em src/lib/tourDates.ts —
-- mudou lá, mude aqui.

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
  SELECT NEW.id, dias.dia, novo_status, NEW.pax
    FROM (
      SELECT unnest(COALESCE(NEW.requested_days, ARRAY[]::date[])) AS dia
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

-- ── dias da proposta → calendário ────────────────────────────────────────────
-- O trigger acima só dispara na troca de status do lead. Acrescentar um dia a
-- uma proposta já enviada/fechada não muda status nenhum, então o dia novo
-- precisa deste caminho próprio. Espelha syncTourDatesWithProposalDays em
-- src/lib/proposals.ts (chamado no updateProposal).
--
-- Só acrescenta: dia retirado do roteiro mantém a linha em tour_dates, que
-- pode já ter horário, ponto de encontro e sinal pago. Apagar isso sozinho
-- seria pior que a linha sobrando.
CREATE OR REPLACE FUNCTION public.sync_tour_dates_from_proposal_days()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.tour_dates (lead_id, date, status, pax)
  SELECT l.id,
         (item->>'day')::date,
         CASE l.status WHEN 'closed' THEN 'fechado' ELSE 'proposta_enviada' END,
         l.pax
    FROM public.price_leads l
    CROSS JOIN LATERAL jsonb_array_elements(COALESCE(NEW.items, '[]'::jsonb)) AS item
   WHERE l.proposal_id = NEW.id
     AND l.status IN ('proposal_sent', 'closed')
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
AFTER UPDATE OF items ON public.proposals
FOR EACH ROW
WHEN (OLD.items IS DISTINCT FROM NEW.items)
EXECUTE FUNCTION public.sync_tour_dates_from_proposal_days();

-- ── backfill ─────────────────────────────────────────────────────────────────
-- Dias já vendidos que nunca chegaram ao calendário (Blank Jürgen 26/10/2026 e
-- Michel Frank 25/08/2026 na data desta migration).
INSERT INTO public.tour_dates (lead_id, date, status, pax)
SELECT DISTINCT
       l.id,
       (item->>'day')::date,
       CASE l.status WHEN 'closed' THEN 'fechado' ELSE 'proposta_enviada' END,
       l.pax
  FROM public.price_leads l
  JOIN public.proposals p ON p.id = l.proposal_id
  CROSS JOIN LATERAL jsonb_array_elements(COALESCE(p.items, '[]'::jsonb)) AS item
 WHERE l.status IN ('proposal_sent', 'closed')
   AND item->>'day' IS NOT NULL
   AND NOT EXISTS (
     SELECT 1 FROM public.tour_dates td
      WHERE td.lead_id = l.id AND td.date = (item->>'day')::date
   );

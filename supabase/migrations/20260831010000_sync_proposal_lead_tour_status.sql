-- Propaga status de proposta → lead → calendário dentro do banco.
--
-- Até aqui essa corrente só existia em TypeScript (updateProposalStatus em
-- src/lib/proposals.ts, que chama syncTourDatesWithLeadStatus em
-- src/lib/tourDates.ts). Quem escrevesse direto no Postgres (SQL editor,
-- conector MCP, script) deixava as três tabelas em desacordo sem erro nenhum:
-- em 31/08/2026 duas propostas viraram 'accepted' por fora e o calendário
-- seguiu mostrando "proposta enviada" — uma delas com o sinal já pago.
--
-- Os triggers abaixo tornam a escrita direta segura por construção. O código
-- TypeScript continua fazendo o mesmo trabalho; ele agora é redundante, não
-- conflitante (as duas escritas são idempotentes).

-- ── proposta → lead ──────────────────────────────────────────────────────────
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
     AND status IS DISTINCT FROM novo_status;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

ALTER FUNCTION public.sync_lead_status_from_proposal() SET search_path = '';

DROP TRIGGER IF EXISTS proposals_sync_lead_status ON public.proposals;
CREATE TRIGGER proposals_sync_lead_status
AFTER UPDATE OF status ON public.proposals
FOR EACH ROW
WHEN (OLD.status IS DISTINCT FROM NEW.status)
EXECUTE FUNCTION public.sync_lead_status_from_proposal();

-- ── lead → calendário ────────────────────────────────────────────────────────
-- Espelha syncTourDatesWithLeadStatus + createMissingTourDates: lead perdido
-- apaga as datas (libera o dia pra outro cliente); lead ativo atualiza as
-- existentes e cria as que faltam a partir de requested_days, com tour_name
-- nulo — o que não pode faltar no calendário é a data e o cliente.
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

DROP TRIGGER IF EXISTS price_leads_sync_tour_dates ON public.price_leads;
CREATE TRIGGER price_leads_sync_tour_dates
AFTER UPDATE OF status ON public.price_leads
FOR EACH ROW
WHEN (OLD.status IS DISTINCT FROM NEW.status)
EXECUTE FUNCTION public.sync_tour_dates_from_lead();

-- Proposta em rascunho volta a chegar no calendário na hora em que nasce.
--
-- A migration 20260906000000 tirou 'new' e 'contacted' do CASE de
-- sync_tour_dates_from_lead, apostando que os dias de rascunho chegariam pelo
-- trigger proposals_sync_tour_dates. Não chegam: na ORDEM em que o app grava,
-- quando a proposta é inserida ainda não existe lead algum apontando pra ela
-- (POST /api/admin/proposals cria a proposta e SÓ DEPOIS grava
-- price_leads.proposal_id), então o WHERE l.proposal_id = NEW.id daquele
-- trigger não casa com nada. E o UPDATE que vincula o lead cai justamente no
-- ramo que a 20260906 removeu.
--
-- Resultado, reproduzido em 10/09/2026: proposta criada às 13:28 para a Verena
-- Kieselbach (1 dia, 28/09) ficou fora do calendário até as 13:54, quando o
-- lead virou proposal_sent. Na tela da proposta o Sinal aparecia como "Sem
-- data de tour marcada ainda" mesmo com o dia montado e o valor preenchido —
-- e, o que é pior, o dia 28/09 ficou meia hora invisível na agenda, que é
-- exatamente o buraco que a 20260902120000 tinha fechado (caso Lea Schallmo).
--
-- src/lib/tourDates.ts nunca deixou de tratar new/contacted
-- (TOUR_STATUS_BY_LEAD_STATUS), então o TS e o SQL estavam divergentes desde
-- 06/09. Isto realinha o SQL com o TS; as regras da 20260906 (proposta
-- itemizada manda, dia vazio some) ficam de pé, inclusive a de que
-- requested_days NÃO vira linha enquanto o lead está em rascunho: dia pedido
-- na Anfrage é intenção do cliente, não compromisso.

CREATE OR REPLACE FUNCTION public.sync_tour_dates_from_lead()
RETURNS TRIGGER AS $$
DECLARE
  novo_status text;
  dias_proposta date[];
  dias_alvo date[];
BEGIN
  IF NEW.status = 'lost' THEN
    DELETE FROM public.tour_dates WHERE lead_id = NEW.id;
    RETURN NEW;
  END IF;

  novo_status := CASE NEW.status
    WHEN 'closed'        THEN 'fechado'
    WHEN 'completed'     THEN 'fechado'
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

  SELECT COALESCE(array_agg(DISTINCT (item->>'day')::date), ARRAY[]::date[])
    INTO dias_proposta
    FROM public.proposals p
    CROSS JOIN LATERAL jsonb_array_elements(COALESCE(p.items, '[]'::jsonb)) AS item
   WHERE p.id = NEW.proposal_id
     AND item->>'day' IS NOT NULL;

  -- proposta itemizada manda. Sem roteiro montado, requested_days entra como
  -- fallback, mas só depois que existe proposta enviada ou fechada.
  dias_alvo := CASE
                 WHEN cardinality(dias_proposta) > 0 THEN dias_proposta
                 WHEN novo_status = 'rascunho'       THEN ARRAY[]::date[]
                 ELSE COALESCE(NEW.requested_days, ARRAY[]::date[])
               END;

  INSERT INTO public.tour_dates (lead_id, date, status, pax)
  SELECT NEW.id, dia, novo_status, NEW.pax
    FROM unnest(dias_alvo) AS dia
   WHERE NOT EXISTS (
     SELECT 1 FROM public.tour_dates td
      WHERE td.lead_id = NEW.id AND td.date = dia
   );

  -- dia vazio fora do roteiro é rastro de requested_days, não compromisso
  IF cardinality(dias_proposta) > 0 THEN
    DELETE FROM public.tour_dates td
     WHERE td.lead_id = NEW.id
       AND td.date <> ALL (dias_proposta)
       AND td.tour_name IS NULL
       AND td.start_time IS NULL
       AND td.meeting_point IS NULL
       AND td.agreed_price IS NULL
       AND NOT td.with_partner
       AND td.driver_id IS NULL
       AND td.notes IS NULL;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

ALTER FUNCTION public.sync_tour_dates_from_lead() SET search_path = '';

-- Backfill: dia de proposta que ficou fora do calendário no intervalo em que o
-- ramo do rascunho não existiu (06/09 a 10/09/2026).
INSERT INTO public.tour_dates (lead_id, date, status, pax)
SELECT DISTINCT
       l.id,
       (item->>'day')::date,
       CASE l.status
         WHEN 'closed'        THEN 'fechado'
         WHEN 'completed'     THEN 'fechado'
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

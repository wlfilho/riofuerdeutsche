-- Dia sem atividade na proposta não existe no calendário.
--
-- requested_days é a DISPONIBILIDADE que o cliente ofereceu na Anfrage, não
-- compromisso: o Matthias (out/2026) ofereceu 24–26/10, a proposta fechou só o
-- 24, e os dias 25/26 viravam linhas vazias em tour_dates que ocupavam a
-- agenda e empatavam em vermelho com o tour real do Blank Jürgen no 25 e 26.
--
-- Regra nova, espelhada em createMissingTourDates (src/lib/tourDates.ts —
-- mudou lá, mude aqui):
--   - proposta com roteiro itemizado por dia MANDA: só os dias com atividade
--     existem no calendário; o rastro vazio dos dias oferecidos e não usados é
--     apagado na própria sincronia.
--   - requested_days segue valendo como fallback para lead proposal_sent/
--     closed SEM roteiro itemizado (era do PDF, tour avulso) — venda fechada
--     não pode sumir da agenda.
--   - linha com qualquer dado manual DO DIA (nome, horário, ponto de
--     encontro, preço, parceiro, motorista, nota) NUNCA é apagada: o admin
--     gravou de propósito. anzahlung_paid NÃO protege: o sinal é da reserva
--     inteira e o AnzahlungToggle replica a flag em todas as linhas do lead —
--     os dias reais continuam carregando a informação.

-- ── lead → calendário ────────────────────────────────────────────────────────
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
  END;

  -- new/contacted não mexem no calendário (os dias de proposta em rascunho
  -- chegam pelo trigger proposals_sync_tour_dates)
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

  -- proposta itemizada manda; requested_days só sem roteiro montado
  dias_alvo := CASE WHEN cardinality(dias_proposta) > 0
                    THEN dias_proposta
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

-- ── dias da proposta → calendário ────────────────────────────────────────────
-- Mesma limpeza no caminho da edição da proposta (é aqui que o dia vazio some
-- na hora em que o roteiro é montado, sem esperar troca de status do lead).
-- De quebra, lead 'completed' passa a contar como 'fechado' também aqui.
CREATE OR REPLACE FUNCTION public.sync_tour_dates_from_proposal_days()
RETURNS TRIGGER AS $$
DECLARE
  dias_proposta date[];
BEGIN
  -- No UPDATE, só interessa quando os dias mudaram. A checagem vive aqui
  -- dentro (e não numa cláusula WHEN) porque o mesmo trigger cobre INSERT,
  -- onde OLD não existe.
  IF TG_OP = 'UPDATE' AND OLD.items IS NOT DISTINCT FROM NEW.items THEN
    RETURN NEW;
  END IF;

  SELECT COALESCE(array_agg(DISTINCT (item->>'day')::date), ARRAY[]::date[])
    INTO dias_proposta
    FROM jsonb_array_elements(COALESCE(NEW.items, '[]'::jsonb)) AS item
   WHERE item->>'day' IS NOT NULL;

  INSERT INTO public.tour_dates (lead_id, date, status, pax)
  SELECT l.id,
         dia,
         CASE l.status
           WHEN 'closed'        THEN 'fechado'
           WHEN 'completed'     THEN 'fechado'
           WHEN 'proposal_sent' THEN 'proposta_enviada'
           ELSE 'rascunho'
         END,
         l.pax
    FROM public.price_leads l
    CROSS JOIN unnest(dias_proposta) AS dia
   WHERE l.proposal_id = NEW.id
     AND l.status <> 'lost'
     AND NOT EXISTS (
       SELECT 1 FROM public.tour_dates td
        WHERE td.lead_id = l.id AND td.date = dia
     );

  IF cardinality(dias_proposta) > 0 THEN
    DELETE FROM public.tour_dates td
     USING public.price_leads l
     WHERE l.proposal_id = NEW.id
       AND td.lead_id = l.id
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

ALTER FUNCTION public.sync_tour_dates_from_proposal_days() SET search_path = '';

-- ── backfill ─────────────────────────────────────────────────────────────────
-- Rastros vazios já existentes de leads com roteiro itemizado (na data desta
-- migration: Matthias 26/10/2026 e Lea Schallmo 16/10/2026; o 25/10 do
-- Matthias já tinha sido apagado à mão).
DELETE FROM public.tour_dates td
 USING public.price_leads l
  JOIN public.proposals p ON p.id = l.proposal_id
 WHERE td.lead_id = l.id
   AND td.tour_name IS NULL
   AND td.start_time IS NULL
   AND td.meeting_point IS NULL
   AND td.agreed_price IS NULL
   AND NOT td.with_partner
   AND td.driver_id IS NULL
   AND td.notes IS NULL
   AND EXISTS (
     SELECT 1 FROM jsonb_array_elements(COALESCE(p.items, '[]'::jsonb)) AS item
      WHERE item->>'day' IS NOT NULL
   )
   AND NOT EXISTS (
     SELECT 1 FROM jsonb_array_elements(COALESCE(p.items, '[]'::jsonb)) AS item
      WHERE item->>'day' IS NOT NULL
        AND (item->>'day')::date = td.date
   );

-- Completa a direção CRM → proposta: proposal_sent → sent, agora com o
-- congelamento de conteúdo feito DENTRO do banco.
--
-- A migration 20260905100000 deixou essa transição de fora do trigger de
-- propósito, porque a entrada em 'sent' congela o conteúdo da proposta e isso
-- só existia em TypeScript (freezeProposalOnSend, src/lib/proposals.ts). O
-- buraco apareceu no mesmo dia: a Lea Schallmo estava 'proposal_sent' no CRM
-- com a proposta vinculada ainda 'draft', e nada corrigia — o trigger pulava
-- a transição e o código novo do PATCH ainda nem tinha sido deployado.
--
-- A função abaixo replica freezeProposalOnSend em SQL, com as mesmas regras:
--   - só preenche service_description AUSENTE ou null (idempotente por item;
--     descrição já congelada é intocável);
--   - pula __day_transport__, kind day_transport, is_custom e __custom__
--     (linhas sintéticas, não existem no catálogo);
--   - item cujo slug não existe em proposal_services fica intacto (igual ao
--     TS, que só resolve os slugs encontrados);
--   - resolução de idioma com o mesmo fallback de resolveFromRows
--     (services-i18n.ts): locale da proposta → default_client_locale de
--     site_settings → qualquer tradução existente.
--
-- O PATCH de /api/admin/leads/[id] continua chamando updateProposalStatus:
-- quando ele roda, o trigger já fez proposta = 'sent', então o shouldFreeze
-- de lá dá false e nada é refeito — as duas camadas são idempotentes entre
-- si, como no resto da corrente. Mudou o mapa? Mude nos DOIS lugares.

CREATE OR REPLACE FUNCTION public.freeze_proposal_items_for_send(pid uuid)
RETURNS void AS $$
DECLARE
  prop record;
  loc text;
  default_loc text;
  new_items jsonb;
BEGIN
  SELECT id, locale, items INTO prop FROM public.proposals WHERE id = pid;
  IF NOT FOUND THEN RETURN; END IF;

  SELECT COALESCE(s.default_client_locale, 'de') INTO default_loc
    FROM public.site_settings s WHERE s.key = 'email_assinatura';
  default_loc := COALESCE(default_loc, 'de');
  loc := COALESCE(prop.locale, default_loc);

  SELECT jsonb_agg(
           CASE
             WHEN (e.item->>'service_slug') IS DISTINCT FROM '__day_transport__'
              AND (e.item->>'kind') IS DISTINCT FROM 'day_transport'
              AND COALESCE((e.item->>'is_custom')::boolean, false) = false
              AND (e.item->>'service_slug') IS DISTINCT FROM '__custom__'
              AND (NOT e.item ? 'service_description'
                   OR e.item->'service_description' = 'null'::jsonb)
              AND EXISTS (SELECT 1 FROM public.proposal_services s
                           WHERE s.slug = e.item->>'service_slug')
             THEN e.item || jsonb_build_object('service_description', (
                    SELECT to_jsonb(t.description)
                      FROM public.proposal_services s
                      JOIN public.proposal_service_translations t
                        ON t.service_id = s.id
                     WHERE s.slug = e.item->>'service_slug'
                     ORDER BY CASE
                                WHEN t.locale = loc THEN 0
                                WHEN t.locale = default_loc THEN 1
                                ELSE 2
                              END
                     LIMIT 1
                  ))
             ELSE e.item
           END
           ORDER BY e.ord
         )
    INTO new_items
    FROM jsonb_array_elements(COALESCE(prop.items, '[]'::jsonb))
         WITH ORDINALITY AS e(item, ord);

  UPDATE public.proposals
     SET items = COALESCE(new_items, '[]'::jsonb)
   WHERE id = pid;
END;
$$ LANGUAGE plpgsql;

ALTER FUNCTION public.freeze_proposal_items_for_send(uuid) SET search_path = '';

-- Mesma função da migration 20260905100000, agora com o ramo proposal_sent.
CREATE OR REPLACE FUNCTION public.sync_proposal_status_from_lead()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'lost' THEN
    UPDATE public.proposals
       SET status = 'rejected'
     WHERE (lead_id = NEW.id OR id = NEW.proposal_id)
       AND status IS DISTINCT FROM 'rejected';
  ELSIF NEW.status = 'closed' AND NEW.proposal_id IS NOT NULL THEN
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

-- ── Acerto retroativo ────────────────────────────────────────────────────────
-- Leads em proposal_sent cuja proposta vinculada ficou para trás (caso Lea
-- Schallmo). Congela e envia, igual ao trigger.
DO $$
DECLARE
  r record;
BEGIN
  FOR r IN
    SELECT l.proposal_id
      FROM public.price_leads l
      JOIN public.proposals p ON p.id = l.proposal_id
     WHERE l.status = 'proposal_sent'
       AND p.status IS DISTINCT FROM 'sent'
  LOOP
    PERFORM public.freeze_proposal_items_for_send(r.proposal_id);
    UPDATE public.proposals
       SET status = 'sent'
     WHERE id = r.proposal_id;
  END LOOP;
END $$;

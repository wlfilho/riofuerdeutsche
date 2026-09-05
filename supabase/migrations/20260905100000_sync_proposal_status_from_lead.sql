-- Fecha o ciclo da sincronia de status: a direção proposta → lead → calendário
-- já existia (trigger proposals_sync_lead_status, migration 20260831010000),
-- mas mover o card no CRM só atualizava price_leads e o calendário — a
-- proposta ficava para trás. Em 05/09/2026 dois leads terminais ("Matthias"
-- perdido e "Stefan Hülsdell" fechado) ainda tinham proposta 'sent', e quem lê
-- proposals (admin, conector MCP) achava a conversa viva.
--
-- Só os status TERMINAIS do lead voltam para a proposta:
--   lost   → rejected em TODAS as propostas do lead (vinculada por
--            price_leads.proposal_id ou por proposals.lead_id): perder o lead
--            mata a conversa inteira, inclusive proposta antiga substituída e
--            proposta aceita de pacote depois cancelado.
--   closed → accepted só na proposta vinculada (proposal_id, a que comanda o
--            calendário); as substituídas não viram 'accepted' por tabela.
--
-- proposal_sent NÃO vira 'sent' aqui de propósito: a entrada em 'sent'
-- congela o conteúdo da proposta (freezeProposalOnSend, que só existe em
-- TypeScript). Essa transição é coberta pelo PATCH de /api/admin/leads/[id].
-- contacted/new também não mexem na proposta: arrastar o card para trás não
-- "desenvia" o que o cliente já recebeu.
--
-- Sem loop com o trigger da direção oposta: os mapas são pontos fixos mútuos
-- (lost↔rejected, closed↔accepted) e os dois UPDATEs têm guarda
-- IS DISTINCT FROM, então a segunda volta atualiza zero linhas e para.

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
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

ALTER FUNCTION public.sync_proposal_status_from_lead() SET search_path = '';

DROP TRIGGER IF EXISTS price_leads_sync_proposal_status ON public.price_leads;
CREATE TRIGGER price_leads_sync_proposal_status
AFTER UPDATE OF status ON public.price_leads
FOR EACH ROW
WHEN (OLD.status IS DISTINCT FROM NEW.status)
EXECUTE FUNCTION public.sync_proposal_status_from_lead();

-- ── Acerto retroativo ────────────────────────────────────────────────────────
-- Mesma regra aplicada ao que já estava dessincronizado. Os UPDATEs disparam
-- proposals_sync_lead_status, que devolve ao lead o status que ele já tem
-- (no-op pela guarda IS DISTINCT FROM).

UPDATE public.proposals p
   SET status = 'rejected'
  FROM public.price_leads l
 WHERE l.status = 'lost'
   AND (p.lead_id = l.id OR p.id = l.proposal_id)
   AND p.status IS DISTINCT FROM 'rejected';

UPDATE public.proposals p
   SET status = 'accepted'
  FROM public.price_leads l
 WHERE l.status = 'closed'
   AND p.id = l.proposal_id
   AND p.status IS DISTINCT FROM 'accepted';

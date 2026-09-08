-- Sinal pago fecha a venda (calendário → lead → proposta).
--
-- Até aqui `tour_dates.anzahlung_paid` era um booleano solto: nenhum trigger e
-- nenhum código em TS reagia a ele. Deu no Kai Kunkel (15/11/2026): sinal
-- marcado e as três tabelas paradas em "proposta enviada", sem erro e sem
-- aviso na tela. Quem lia `proposals` achava que a conversa ainda estava em
-- aberto, e o contador de sinal pendente do dashboard (que só olha tour com
-- status `fechado`) não via o tour de jeito nenhum.
--
-- Dinheiro entrando é a prova mais forte de aceite que existe: mais forte que
-- arrastar o card no kanban. Então o sinal promove a corrente inteira.
--
-- A escrita é UMA só, no lead, exatamente como na regra do resto da corrente:
-- `price_leads_sync_proposal_status` leva a proposta pra `accepted` e
-- `price_leads_sync_tour_dates` leva o calendário pra `fechado`. Nunca escrever
-- nas três tabelas direto.
--
-- Assimetrias deliberadas:
--   - Só na SUBIDA (false → true, ou INSERT já marcado, que é o caminho do
--     modal do calendário). Desmarcar o sinal NÃO reabre a venda: desmarcar é
--     conserto de clique errado, não cancelamento de tour. Cancelou de verdade
--     é `lost` no kanban, decisão explícita.
--   - `completed` não é rebaixado pra `closed` (mesma guarda dos outros
--     triggers: `completed` é terminal na volta).
--   - `lost` não ressuscita. Lead perdido tem as tour_dates apagadas pelo
--     próprio `sync_tour_dates_from_lead`, então na prática nem há linha pra
--     marcar; se houver, é engano, e ressuscitar sozinho seria pior.
--
-- O `UPDATE OF anzahlung_paid` + a guarda do WHEN cortam o laço: a volta
-- lead → calendário mexe em `status`, nunca em `anzahlung_paid`, então não
-- reentra aqui.

CREATE OR REPLACE FUNCTION public.sync_lead_status_from_anzahlung()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.price_leads
     SET status = 'closed'
   WHERE id = NEW.lead_id
     AND COALESCE(status, '') NOT IN ('closed', 'completed', 'lost');

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tour_dates_sync_lead_status_ins ON public.tour_dates;
CREATE TRIGGER tour_dates_sync_lead_status_ins
  AFTER INSERT ON public.tour_dates
  FOR EACH ROW
  WHEN (NEW.anzahlung_paid)
  EXECUTE FUNCTION public.sync_lead_status_from_anzahlung();

DROP TRIGGER IF EXISTS tour_dates_sync_lead_status_upd ON public.tour_dates;
CREATE TRIGGER tour_dates_sync_lead_status_upd
  AFTER UPDATE OF anzahlung_paid ON public.tour_dates
  FOR EACH ROW
  WHEN (NEW.anzahlung_paid AND NOT OLD.anzahlung_paid)
  EXECUTE FUNCTION public.sync_lead_status_from_anzahlung();

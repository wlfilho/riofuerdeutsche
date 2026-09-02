-- Toda proposta passa a saber de que lead ela é.
--
-- Até aqui o vínculo existia num sentido só: price_leads.proposal_id → a
-- proposta que manda no CRM e no calendário. Na criação, esse vínculo só era
-- gravado quando o lead ainda não tinha proposta nenhuma
-- (`.is('proposal_id', null)` em src/app/api/admin/proposals/route.ts), e o
-- resultado era silencioso: a segunda proposta do mesmo cliente (plano B,
-- versão revisada, cópia) nascia solta, sem lead, e portanto sem calendário.
-- Se o cliente fechasse essa segunda, a agenda seguia mostrando os dias da
-- primeira. Foi assim que a proposta "Corcovado Carro" do Jörg Pietrzik ficou
-- órfã em 07/2026.
--
-- Agora são dois campos com papéis distintos:
--   proposals.lead_id       → de quem é esta proposta (todas têm)
--   price_leads.proposal_id → qual proposta manda no calendário (uma só)
--
-- Nada troca de dono sozinho: quando as duas discordam, o admin avisa e você
-- decide.

ALTER TABLE public.proposals
  ADD COLUMN IF NOT EXISTS lead_id uuid REFERENCES public.price_leads(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS proposals_lead_id_idx ON public.proposals(lead_id);

-- Backfill pelo vínculo que já existe.
UPDATE public.proposals p
   SET lead_id = l.id
  FROM public.price_leads l
 WHERE l.proposal_id = p.id
   AND p.lead_id IS NULL;

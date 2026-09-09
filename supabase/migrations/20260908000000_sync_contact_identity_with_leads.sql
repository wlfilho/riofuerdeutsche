-- ── Identidade sincronizada: contacts ↔ price_leads ─────────────────────────
--
-- `price_leads` guarda name/email/phone POR CÓPIA, além do `contact_id` que
-- aponta pro contato. A cópia nasceu antes de `contacts` existir (a tabela é de
-- 08/06/2026, os leads são mais velhos) e nunca ganhou quem a mantivesse em dia:
-- o PATCH de /api/admin/contacts/[id] corrigia só o contato, e nada no banco
-- avisava o lead.
--
-- Em 08/09/2026 isso apareceu no cliente: o e-mail da Conny Taschner foi
-- corrigido às 10:46 de `ctaschner@gmx.dr` para `ctaschner@gmx.de` na tela de
-- contatos, e o lead seguiu com o `.dr`. Como o formulário de proposta nova
-- pré-preenche o e-mail A PARTIR DO LEAD (NovaPropostaForm), a próxima proposta
-- dela sairia com o endereço errado, e a correção do Will teria sido inútil sem
-- nenhum erro na tela.
--
-- A sincronia vive no banco, e não só em TypeScript, pelo mesmo motivo da
-- corrente proposta → lead → calendário (migration 20260831010000): quem escreve
-- direto no Postgres (SQL editor, conector MCP, script de backfill) deixaria as
-- duas tabelas em desacordo sem erro nenhum.
--
-- O QUE NÃO SINCRONIZA: `source`. `price_leads.source` diz como o PEDIDO chegou
-- e `contacts.source` diz por onde a PESSOA apareceu — divergem de propósito
-- para o mesmo lead (ver o comentário longo em src/app/api/anfrage/route.ts).
-- Igualar os dois destruiria a distinção entre canal de aquisição e de conversão.
--
-- Recursão: cada UPDATE traz a condição "e o destino ainda é diferente" no
-- WHERE. O gatilho do outro lado dispara, não acha linha para mudar, e a
-- corrente para no segundo passo.

-- ── contato → leads ─────────────────────────────────────────────────────────
-- Um contato pode ter vários leads (duas viagens em anos diferentes); a
-- correção vale para todos eles.
CREATE OR REPLACE FUNCTION public.sync_price_leads_from_contact()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.price_leads l
     SET email = CASE WHEN NEW.email IS DISTINCT FROM OLD.email THEN NEW.email ELSE l.email END,
         -- `contacts.name` aceita null e `price_leads.name` não: apagar o nome
         -- do contato não pode derrubar o lead, então nesse caso o lead fica
         -- com o nome que tinha.
         name  = CASE WHEN NEW.name IS DISTINCT FROM OLD.name AND NEW.name IS NOT NULL THEN NEW.name ELSE l.name END,
         phone = CASE WHEN NEW.phone IS DISTINCT FROM OLD.phone THEN NEW.phone ELSE l.phone END
   WHERE l.contact_id = NEW.id
     AND (
       (NEW.email IS DISTINCT FROM OLD.email AND l.email IS DISTINCT FROM NEW.email)
       OR (NEW.name IS DISTINCT FROM OLD.name AND NEW.name IS NOT NULL AND l.name IS DISTINCT FROM NEW.name)
       OR (NEW.phone IS DISTINCT FROM OLD.phone AND l.phone IS DISTINCT FROM NEW.phone)
     );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

ALTER FUNCTION public.sync_price_leads_from_contact() SET search_path = '';

DROP TRIGGER IF EXISTS contacts_sync_price_leads ON public.contacts;
CREATE TRIGGER contacts_sync_price_leads
AFTER UPDATE OF email, name, phone ON public.contacts
FOR EACH ROW
WHEN (
  OLD.email IS DISTINCT FROM NEW.email
  OR OLD.name IS DISTINCT FROM NEW.name
  OR OLD.phone IS DISTINCT FROM NEW.phone
)
EXECUTE FUNCTION public.sync_price_leads_from_contact();

-- ── lead → contato ──────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.sync_contact_from_price_lead()
RETURNS TRIGGER AS $$
DECLARE
  dono uuid;
BEGIN
  -- `contacts.email` é UNIQUE. Se o e-mail novo já é de OUTRO contato, renomear
  -- o contato atual estouraria a constraint e derrubaria a escrita no lead.
  -- O certo aí é o mesmo que o upsert por e-mail faz na /anfrage: o lead passa
  -- a pertencer ao contato que já tem esse endereço, em vez de criar um segundo
  -- cadastro para a mesma pessoa. O UPDATE abaixo não lista email/name/phone no
  -- SET, então não redispara este gatilho.
  IF NEW.email IS DISTINCT FROM OLD.email THEN
    SELECT id INTO dono FROM public.contacts WHERE email = NEW.email;

    IF dono IS NOT NULL AND dono IS DISTINCT FROM NEW.contact_id THEN
      UPDATE public.price_leads SET contact_id = dono WHERE id = NEW.id;
      RETURN NEW;
    END IF;
  END IF;

  UPDATE public.contacts c
     SET email = CASE WHEN NEW.email IS DISTINCT FROM OLD.email THEN NEW.email ELSE c.email END,
         name  = CASE WHEN NEW.name IS DISTINCT FROM OLD.name THEN NEW.name ELSE c.name END,
         phone = CASE WHEN NEW.phone IS DISTINCT FROM OLD.phone THEN NEW.phone ELSE c.phone END
   WHERE c.id = NEW.contact_id
     AND (
       (NEW.email IS DISTINCT FROM OLD.email AND c.email IS DISTINCT FROM NEW.email)
       OR (NEW.name IS DISTINCT FROM OLD.name AND c.name IS DISTINCT FROM NEW.name)
       OR (NEW.phone IS DISTINCT FROM OLD.phone AND c.phone IS DISTINCT FROM NEW.phone)
     );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

ALTER FUNCTION public.sync_contact_from_price_lead() SET search_path = '';

DROP TRIGGER IF EXISTS price_leads_sync_contact ON public.price_leads;
CREATE TRIGGER price_leads_sync_contact
AFTER UPDATE OF email, name, phone ON public.price_leads
FOR EACH ROW
WHEN (
  OLD.email IS DISTINCT FROM NEW.email
  OR OLD.name IS DISTINCT FROM NEW.name
  OR OLD.phone IS DISTINCT FROM NEW.phone
)
EXECUTE FUNCTION public.sync_contact_from_price_lead();

-- ── As duas divergências que já existiam ────────────────────────────────────
-- Conny Taschner: contato certo (corrigido às 10:46 de 08/09/2026), lead com o
-- `.dr`. O contato manda.
UPDATE public.price_leads l
   SET email = c.email
  FROM public.contacts c
 WHERE c.id = l.contact_id
   AND l.email IS DISTINCT FROM c.email;

-- Matthias: telefone no lead, contato sem nenhum. Aqui o lead manda, porque o
-- webhook do WhatsApp casa a mensagem recebida com `contacts.phone` — contato
-- sem telefone é conversa que não encontra o lead dela.
-- Só preenche vazio: onde os dois têm telefone, o contato continua valendo.
UPDATE public.contacts c
   SET phone = l.phone
  FROM public.price_leads l
 WHERE l.contact_id = c.id
   AND c.phone IS NULL
   AND l.phone IS NOT NULL;

COMMENT ON COLUMN public.price_leads.email IS
  'Cópia do e-mail do contato, mantida em dia pelos gatilhos contacts_sync_price_leads / price_leads_sync_contact (migration 20260908000000). Corrigir num lado corrige no outro.';

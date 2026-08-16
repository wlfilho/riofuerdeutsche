-- Arquivamento manual de leads no CRM.
--
-- O kanban também esconde automaticamente tours já realizados e perdidos
-- antigos, mas essa regra é derivada em src/lib/leadArchive.ts e não escreve
-- aqui. Esta coluna guarda só o arquivamento explícito, para os casos que
-- nenhuma data cobre (lead que morreu sem nunca ter tido data).
ALTER TABLE price_leads ADD COLUMN IF NOT EXISTS archived_at timestamptz;

CREATE INDEX IF NOT EXISTS idx_price_leads_archived_at
  ON price_leads(archived_at) WHERE archived_at IS NOT NULL;

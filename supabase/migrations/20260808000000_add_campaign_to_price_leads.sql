-- Campanhas de tour em grupo (AIDA Karneval 2028 e futuras) reusam price_leads.
-- `source` continua significando o canal de origem (whatsapp, instagram…);
-- `campaign` diz de qual oferta o lead veio, e `campaign_data` guarda as
-- respostas específicas daquele formulário (interesses, idades, consentimento).
ALTER TABLE price_leads ADD COLUMN IF NOT EXISTS campaign text;
ALTER TABLE price_leads ADD COLUMN IF NOT EXISTS campaign_data jsonb;

CREATE INDEX IF NOT EXISTS price_leads_campaign_idx
  ON price_leads (campaign)
  WHERE campaign IS NOT NULL;

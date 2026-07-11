-- Days the client asked for via the public Anfrage form (/anfrage).
-- Distinct from tour_dates, which only holds proposta_enviada/fechado tours.
ALTER TABLE price_leads ADD COLUMN IF NOT EXISTS requested_days date[];

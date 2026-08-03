-- Children accompanying the group (not counted in pax; pax = paying adults).
ALTER TABLE price_leads ADD COLUMN IF NOT EXISTS children integer NOT NULL DEFAULT 0;

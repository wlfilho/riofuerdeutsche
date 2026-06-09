-- Create contacts as unified entity across price_leads, tour_clients, and profiles

CREATE TABLE contacts (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email      text UNIQUE NOT NULL,
  name       text,
  phone      text,
  source     text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE price_leads ADD COLUMN contact_id uuid REFERENCES contacts(id);
ALTER TABLE tour_clients ADD COLUMN contact_id uuid REFERENCES contacts(id);

INSERT INTO contacts (email, name, phone, source, created_at)
SELECT DISTINCT ON (email) email, name, phone, source::text, created_at
FROM price_leads
ORDER BY email, created_at
ON CONFLICT (email) DO NOTHING;

INSERT INTO contacts (email, name, phone, created_at)
SELECT DISTINCT ON (email) email, name, phone, created_at
FROM tour_clients
ORDER BY email, created_at
ON CONFLICT (email) DO NOTHING;

INSERT INTO contacts (email, name, created_at)
SELECT email, first_name, created_at
FROM profiles
ON CONFLICT (email) DO NOTHING;

UPDATE price_leads pl SET contact_id = c.id FROM contacts c WHERE pl.email = c.email;
UPDATE tour_clients tc SET contact_id = c.id FROM contacts c WHERE tc.email = c.email;

ALTER TABLE price_leads ALTER COLUMN contact_id SET NOT NULL;
ALTER TABLE tour_clients ALTER COLUMN contact_id SET NOT NULL;

ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_only" ON contacts
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
  );

CREATE OR REPLACE FUNCTION contacts_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_contacts_updated_at
BEFORE UPDATE ON contacts
FOR EACH ROW EXECUTE FUNCTION contacts_set_updated_at();

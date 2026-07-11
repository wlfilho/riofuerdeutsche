-- Tour dates: confirmed tours (fechado) and tours with proposal sent (proposta_enviada),
-- shown on /admin/calendario. One price_lead can have N tour dates (multi-day tours).
-- Leads in other pipeline statuses (new/contacted/lost) have no date and never appear here.

CREATE TABLE tour_dates (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id         uuid NOT NULL REFERENCES price_leads(id) ON DELETE CASCADE,
  date            date NOT NULL,
  start_time      time,
  tour_name       text NOT NULL,
  status          text NOT NULL CHECK (status IN ('proposta_enviada', 'fechado')),
  pax             integer,
  meeting_point   text,
  agreed_price    numeric,
  anzahlung_paid  boolean NOT NULL DEFAULT false,
  notes           text,
  created_at      timestamptz DEFAULT now()
);

CREATE INDEX idx_tour_dates_date ON tour_dates(date);
CREATE INDEX idx_tour_dates_lead ON tour_dates(lead_id);

ALTER TABLE tour_dates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_only" ON tour_dates
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
  );

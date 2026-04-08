CREATE TABLE public.email_sequence_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  client_id UUID NOT NULL REFERENCES public.tour_clients(id) ON DELETE CASCADE,
  email_number INTEGER NOT NULL CHECK (email_number BETWEEN 1 AND 4),
  email_name TEXT NOT NULL,
  scheduled_date DATE NOT NULL,
  sent_at TIMESTAMPTZ,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'error', 'skipped')),
  error_message TEXT,
  resend_id TEXT
);

-- RLS
ALTER TABLE public.email_sequence_log ENABLE ROW LEVEL SECURITY;

-- Apenas admin pode ler e escrever
CREATE POLICY "Admin full access to email_sequence_log"
  ON public.email_sequence_log
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

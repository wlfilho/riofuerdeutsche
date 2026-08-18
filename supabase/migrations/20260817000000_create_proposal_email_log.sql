-- Histórico de envios da proposta por e-mail.
--
-- O e-mail com o link é o "cofre" do cliente: o WhatsApp pode sumir (conta
-- suspensa, número trocado), a caixa de entrada dele não. Por isso o envio é
-- registrado — e é histórico, não flag: reenviar depois de editar a proposta é
-- normal e a gente quer ver quantas vezes e para qual endereço foi.
--
-- Uma linha por tentativa, inclusive as que falharam (status='error'): um envio
-- que não saiu é justamente o que não pode passar despercebido.
CREATE TABLE proposal_email_log (
  id            bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  proposal_id   uuid NOT NULL REFERENCES proposals(id) ON DELETE CASCADE,
  to_email      text NOT NULL,
  bcc_email     text,
  template_slug text NOT NULL,
  locale        text NOT NULL,
  subject       text,
  status        text NOT NULL CHECK (status IN ('sent', 'error')),
  -- Id da mensagem na Resend: a ponte para o painel deles (entrega, bounce).
  resend_id     text,
  error_message text,
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_proposal_email_log_proposal
  ON proposal_email_log(proposal_id, created_at DESC);

ALTER TABLE proposal_email_log ENABLE ROW LEVEL SECURITY;

-- Só o admin lê; escrita fica sem policy de propósito (só a service role da
-- API insere). Mesmo padrão de proposal_events.
CREATE POLICY "admin_only" ON proposal_email_log
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
  );

-- Último envio bem-sucedido por proposta: o que a lista do admin precisa para
-- marcar as propostas 'sent' que nunca foram por e-mail.
CREATE VIEW proposal_email_status
  WITH (security_invoker = true) AS
SELECT
  proposal_id,
  max(created_at) FILTER (WHERE status = 'sent')  AS last_sent_at,
  count(*)        FILTER (WHERE status = 'sent')  AS sent_count,
  count(*)        FILTER (WHERE status = 'error') AS error_count
FROM proposal_email_log
GROUP BY proposal_id;

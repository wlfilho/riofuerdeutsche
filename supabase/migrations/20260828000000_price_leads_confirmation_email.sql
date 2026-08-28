-- Confirmação automática ao cliente que preencheu a /anfrage.
--
-- Por que NÃO virou um valor novo em `price_leads.status`: status é a etapa do
-- kanban que o Will move à mão (new → contacted → proposal_sent → closed/lost).
-- Um 'auto_replied' ali criaria uma coluna que o sistema mexe sozinho e o lead
-- sairia de 'new' sem ninguém ter falado com ele, que é exatamente a informação
-- que o kanban existe para dar.
--
-- Colunas separadas respondem as duas perguntas sem tocar no fluxo:
--   confirmation_sent_at   → recebeu a confirmação (e quando)
--   confirmation_error     → a tentativa falhou, e o admin precisa VER isso:
--                            senão o Will assume que a pessoa foi avisada e ela
--                            não foi. Fica preenchido só enquanto o último
--                            envio for o que falhou.
--   confirmation_resend_id → ponte pro painel da Resend (entrega, bounce),
--                            mesmo papel de proposal_email_log.resend_id.
--
-- Lead de campanha (AIDA) usa as mesmas colunas: o e-mail é outro template, mas
-- a pergunta "esta pessoa recebeu confirmação?" é a mesma.
ALTER TABLE price_leads
  ADD COLUMN confirmation_sent_at   timestamptz,
  ADD COLUMN confirmation_resend_id text,
  ADD COLUMN confirmation_error     text;

-- O que o admin consulta é sempre "quem falhou" e "quem ainda não recebeu",
-- nunca a coluna inteira — daí o índice parcial.
CREATE INDEX idx_price_leads_confirmation_error
  ON price_leads(created_at DESC)
  WHERE confirmation_error IS NOT NULL;

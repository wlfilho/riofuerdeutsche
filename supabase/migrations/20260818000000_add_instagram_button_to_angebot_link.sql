-- Botão secundário do Instagram no e-mail da proposta.
--
-- Hierarquia de propósito: o "Angebot ansehen" continua sendo o único botão
-- preenchido; o Instagram é contorno, menor e logo antes da assinatura, para
-- não disputar o clique da decisão.
--
-- O perfil vem de site_settings.business_instagram via {{instagram_url}} e
-- {{instagram_handle}} — trocar o perfil nas Configurações muda todos os
-- e-mails, sem editar template. Sem perfil configurado, a rota de envio corta o
-- trecho entre os comentários `instagram:start`/`instagram:end` (ver
-- stripInstagramBlock em src/lib/email/sendProposalEmail.ts), então o botão não
-- vira link vazio.
--
-- UPDATE cirúrgico (replace na âncora da assinatura) em vez de reescrever o
-- html_body inteiro: qualquer edição que o Will já tenha feito no admin
-- sobrevive. O WHERE deixa a migration idempotente.

UPDATE email_templates
SET html_body = replace(
  html_body,
  '<div style="margin:0 0 24px;">{{assinatura}}</div>',
  '<!-- instagram:start -->
    <p style="margin:0 0 24px;">
      <a href="{{instagram_url}}" style="display:inline-block;padding:10px 18px;border:1px solid #dddddd;border-radius:8px;color:#444444;text-decoration:none;font-weight:600;font-size:14px;">📸 Rio schon vorher sehen: {{instagram_handle}} auf Instagram</a>
    </p>
    <!-- instagram:end -->

    <div style="margin:0 0 24px;">{{assinatura}}</div>'
)
WHERE slug IN ('angebot_link', 'angebot_link_formell')
  AND locale = 'de'
  AND html_body NOT ILIKE '%instagram%';

UPDATE email_templates
SET html_body = replace(
  html_body,
  '<div style="margin:0 0 24px;">{{assinatura}}</div>',
  '<!-- instagram:start -->
    <p style="margin:0 0 24px;">
      <a href="{{instagram_url}}" style="display:inline-block;padding:10px 18px;border:1px solid #dddddd;border-radius:8px;color:#444444;text-decoration:none;font-weight:600;font-size:14px;">📸 Veja o Rio antes: {{instagram_handle}} no Instagram</a>
    </p>
    <!-- instagram:end -->

    <div style="margin:0 0 24px;">{{assinatura}}</div>'
)
WHERE slug IN ('angebot_link', 'angebot_link_formell')
  AND locale = 'pt-BR'
  AND html_body NOT ILIKE '%instagram%';

-- Template do e-mail que leva o link da proposta ao cliente.
--
-- Dois slugs por causa do `proposals.treatment`:
--   angebot_link          → du/ihr
--   angebot_link_formell  → Sie
-- A rota de envio escolhe o slug pelo tratamento gravado na proposta.
--
-- Detalhe do texto alemão informal: ele evita pronome de propósito
-- ("das Angebot", não "dein Angebot"), porque o mesmo template atende du
-- (uma pessoa) e ihr (casal/grupo). Editar no admin é livre — só vale lembrar
-- disso antes de trocar por "dein".
--
-- Shortcodes usados aqui (todos preenchidos pela rota, nunca vazios no HTML):
--   {{nome}} {{eckdaten}} {{link}} {{assinatura}} e {{reisezeitraum}} no assunto.
-- {{eckdaten}} é um bloco HTML pronto (datas, pessoas, preço, sinal, validade),
-- montado no servidor porque o template não tem condicional — linha que não
-- existe simplesmente não entra no bloco.

INSERT INTO email_templates (slug, locale, name, subject, category, sort_order, html_body)
VALUES
  (
    'angebot_link',
    'de',
    'Angebot-Link (du/ihr)',
    'Angebot für Rio de Janeiro · {{reisezeitraum}}',
    'Proposta',
    1,
    $html$<!DOCTYPE html>
<html lang="de">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:24px;background:#ffffff;color:#222222;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;font-size:16px;line-height:1.6;">
  <div style="max-width:560px;">
    <p style="margin:0 0 16px;">Hallo {{nome}},</p>

    <p style="margin:0 0 16px;">hier ist das persönliche Angebot für Rio de Janeiro — mit allen Details in Ruhe zum Nachlesen.</p>

    {{eckdaten}}

    <p style="margin:0 0 24px;">
      <a href="{{link}}" style="display:inline-block;padding:12px 22px;background:#16a34a;color:#ffffff;text-decoration:none;border-radius:8px;font-weight:600;">Angebot ansehen</a>
    </p>

    <p style="margin:0 0 16px;color:#666666;font-size:14px;">Falls der Button nicht funktioniert, hier der direkte Link:<br/>
      <a href="{{link}}" style="color:#16a34a;">{{link}}</a>
    </p>

    <p style="margin:0 0 16px;">Diese E-Mail am besten aufheben: der Link bleibt gültig, und so ist das Angebot jederzeit griffbereit — auch ohne WhatsApp.</p>

    <p style="margin:0 0 16px;">Fragen oder Änderungswünsche? Einfach direkt auf diese E-Mail antworten — ich lese jede Nachricht selbst.</p>

    <div style="margin:0 0 24px;">{{assinatura}}</div>
  </div>
</body>
</html>$html$
  ),
  (
    'angebot_link_formell',
    'de',
    'Angebot-Link (Sie)',
    'Ihr Angebot für Rio de Janeiro · {{reisezeitraum}}',
    'Proposta',
    2,
    $html$<!DOCTYPE html>
<html lang="de">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:24px;background:#ffffff;color:#222222;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;font-size:16px;line-height:1.6;">
  <div style="max-width:560px;">
    <p style="margin:0 0 16px;">Guten Tag {{nome}},</p>

    <p style="margin:0 0 16px;">hier ist Ihr persönliches Angebot für Rio de Janeiro — mit allen Details in Ruhe zum Nachlesen.</p>

    {{eckdaten}}

    <p style="margin:0 0 24px;">
      <a href="{{link}}" style="display:inline-block;padding:12px 22px;background:#16a34a;color:#ffffff;text-decoration:none;border-radius:8px;font-weight:600;">Angebot ansehen</a>
    </p>

    <p style="margin:0 0 16px;color:#666666;font-size:14px;">Falls der Button nicht funktioniert, hier der direkte Link:<br/>
      <a href="{{link}}" style="color:#16a34a;">{{link}}</a>
    </p>

    <p style="margin:0 0 16px;">Bewahren Sie diese E-Mail am besten auf: der Link bleibt gültig, so haben Sie das Angebot jederzeit griffbereit — auch ohne WhatsApp.</p>

    <p style="margin:0 0 16px;">Fragen oder Änderungswünsche? Antworten Sie einfach direkt auf diese E-Mail — ich lese jede Nachricht selbst.</p>

    <div style="margin:0 0 24px;">{{assinatura}}</div>
  </div>
</body>
</html>$html$
  ),
  (
    'angebot_link',
    'pt-BR',
    'Link da proposta (você)',
    'Sua proposta para o Rio de Janeiro · {{reisezeitraum}}',
    'Proposta',
    1,
    $html$<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:24px;background:#ffffff;color:#222222;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;font-size:16px;line-height:1.6;">
  <div style="max-width:560px;">
    <p style="margin:0 0 16px;">Olá {{nome}},</p>

    <p style="margin:0 0 16px;">aqui está a sua proposta personalizada para o Rio de Janeiro — com todos os detalhes para ver com calma.</p>

    {{eckdaten}}

    <p style="margin:0 0 24px;">
      <a href="{{link}}" style="display:inline-block;padding:12px 22px;background:#16a34a;color:#ffffff;text-decoration:none;border-radius:8px;font-weight:600;">Ver a proposta</a>
    </p>

    <p style="margin:0 0 16px;color:#666666;font-size:14px;">Se o botão não funcionar, aqui está o link direto:<br/>
      <a href="{{link}}" style="color:#16a34a;">{{link}}</a>
    </p>

    <p style="margin:0 0 16px;">Guarde este e-mail: o link continua válido, então a proposta fica sempre à mão — mesmo sem o WhatsApp.</p>

    <p style="margin:0 0 16px;">Dúvidas ou quer mudar alguma coisa? É só responder este e-mail — eu leio cada mensagem pessoalmente.</p>

    <div style="margin:0 0 24px;">{{assinatura}}</div>
  </div>
</body>
</html>$html$
  ),
  (
    'angebot_link_formell',
    'pt-BR',
    'Link da proposta (formal)',
    'Sua proposta para o Rio de Janeiro · {{reisezeitraum}}',
    'Proposta',
    2,
    $html$<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:24px;background:#ffffff;color:#222222;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;font-size:16px;line-height:1.6;">
  <div style="max-width:560px;">
    <p style="margin:0 0 16px;">Prezado(a) {{nome}},</p>

    <p style="margin:0 0 16px;">segue a sua proposta personalizada para o Rio de Janeiro — com todos os detalhes para consultar com calma.</p>

    {{eckdaten}}

    <p style="margin:0 0 24px;">
      <a href="{{link}}" style="display:inline-block;padding:12px 22px;background:#16a34a;color:#ffffff;text-decoration:none;border-radius:8px;font-weight:600;">Ver a proposta</a>
    </p>

    <p style="margin:0 0 16px;color:#666666;font-size:14px;">Se o botão não funcionar, aqui está o link direto:<br/>
      <a href="{{link}}" style="color:#16a34a;">{{link}}</a>
    </p>

    <p style="margin:0 0 16px;">Guarde este e-mail: o link continua válido, então a proposta fica sempre à mão — mesmo sem o WhatsApp.</p>

    <p style="margin:0 0 16px;">Em caso de dúvidas ou ajustes, basta responder este e-mail — eu leio cada mensagem pessoalmente.</p>

    <div style="margin:0 0 24px;">{{assinatura}}</div>
  </div>
</body>
</html>$html$
  )
ON CONFLICT (slug, locale) DO NOTHING;

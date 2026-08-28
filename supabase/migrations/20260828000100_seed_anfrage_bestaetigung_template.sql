-- Confirmação automática da /anfrage (Fase 4).
--
-- NÃO é proposta e NÃO tem preço: responde as três perguntas que o cliente tem
-- no segundo em que aperta enviar (chegou? o que acontece agora? quando ele me
-- responde?) e para por aí. O preço só existe na proposta feita à mão.
--
-- Este arquivo é também o backup do template: `email_templates` é editável pelo
-- Will em /admin/email-templates e não tem histórico no git, então uma edição
-- infeliz não tem `git revert`. O texto original fica aqui.
--
-- Shortcodes usados:
--   {{nome}}         primeiro nome
--   {{tage}}         dias pedidos, por extenso em alemão
--   {{pax}}          "2 Erwachsene + 1 Kind"
--   {{themenblock}}  bloco HTML montado no servidor (ver
--                    src/lib/email/sendAnfrageBestaetigung.ts): uma linha por
--                    tema marcado, bloco próprio para 'unentschlossen', e o
--                    aviso de que o texto livre foi lido. Vazio quando a pessoa
--                    não marcou nada — o e-mail continua coerente sem ele.
--   {{whatsapp_url}} vem das configurações de contato, nunca hardcoded
--   {{assinatura}}
--
-- O PRAZO NÃO MORA SÓ AQUI. "meistens innerhalb von 48 Stunden" está em treze
-- lugares: este template mais doze no código (de.json antwortVersprechen e
-- kontakt.heroSubtitle, a meta da /kontakt, /touren/individuell 3x, o par
-- JSON-LD + FAQ da /touren, o par de CTA /bewertungen + home, e o par JSON-LD +
-- FaqAccordion da home). Mudar o prazo só aqui faria a pessoa ler um número na
-- página e receber outro no e-mail. Rodar `npm run check:copy` depois de mexer,
-- que é o que pega os quatro pares divergindo.
--
-- O "meistens" é deliberado, e a posição dele muda com o contexto: em texto
-- longo abre a frase, em CTA curto ele hesita justo na hora de decidir e vai
-- depois do sujeito. Aqui o prazo é frase curta no fim, para não separar
-- "melde mich bei dir" de "mit einem Vorschlag und dem Preis".
INSERT INTO email_templates (slug, locale, name, subject, category, sort_order, html_body)
VALUES (
  'anfrage_bestaetigung',
  'de',
  'Anfrage: Eingangsbestätigung',
  'Deine Anfrage ist da, {{nome}}',
  'Anfrage',
  1,
  $html$<!DOCTYPE html>
<html lang="de">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:24px;background:#ffffff;color:#222222;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;font-size:16px;line-height:1.6;">
  <div style="max-width:560px;">
    <p style="margin:0 0 16px;">Hallo {{nome}},</p>

    <p style="margin:0 0 16px;">deine Anfrage ist bei mir angekommen, und ich habe sie gelesen. Du musst jetzt nichts weiter tun.</p>

    <p style="margin:0 0 16px;">Das habe ich notiert:</p>

    <p style="margin:0 0 16px;padding-left:16px;border-left:2px solid #dddddd;">
      Personen: {{pax}}<br/>
      Wunschtage: {{tage}}
    </p>

    {{themenblock}}

    <p style="margin:0 0 16px;">Wie es weitergeht: Ich schaue mir eure Tage an, überlege, was daran am besten passt, und melde mich dann persönlich bei dir, mit einem Vorschlag und dem Preis. Meistens innerhalb von 48 Stunden. Entscheiden kannst du danach in Ruhe, die Anfrage ist unverbindlich.</p>

    <p style="margin:0 0 16px;">Stimmt oben etwas nicht, oder fällt dir noch etwas ein? Antworte einfach direkt auf diese E-Mail. Ich lese jede Nachricht selbst.</p>

    <div style="margin:0 0 24px;">{{assinatura}}</div>

    <p style="margin:0 0 8px;font-size:14px;">Schneller erreichst du mich per <a href="{{whatsapp_url}}" style="color:#16a34a;">WhatsApp</a>.</p>

    <p style="margin:0;font-size:14px;">Bis dahin: <a href="https://riofuerdeutsche.de/bewertungen" style="color:#16a34a;">was andere Gäste über die Touren schreiben</a>.</p>
  </div>
</body>
</html>$html$
)
ON CONFLICT (slug, locale) DO NOTHING;

interface TourClient {
  name: string
  email: string
  arrival_date: string
  departure_date: string
  tour_details?: string
}

function checklistSection(title: string, items: string[]) {
  const rows = items
    .map(
      item => `
    <tr>
      <td style="padding:5px 0;vertical-align:top;width:20px;font-size:14px;color:#1a7a4a;">✓</td>
      <td style="padding:5px 0 5px 8px;font-size:14px;line-height:1.5;color:#333;">${item}</td>
    </tr>`
    )
    .join('')

  return `
    <p style="margin:0 0 10px;font-size:13px;font-weight:bold;color:#1a7a4a;text-transform:uppercase;letter-spacing:0.5px;">${title}</p>
    <table cellpadding="0" cellspacing="0" style="width:100%;margin-bottom:24px;">
      ${rows}
    </table>`
}

export function documentsChecklistEmail(client: TourClient) {
  const subject = 'Letzte Checkliste vor Rio ✈️'

  const html = `<!DOCTYPE html>
<html lang="de">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:32px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;max-width:600px;width:100%;">

        <!-- Header -->
        <tr>
          <td style="background:#1a7a4a;padding:32px 40px;text-align:center;">
            <p style="margin:0;color:#ffffff;font-size:22px;font-weight:bold;">Rio für Deutsche</p>
            <p style="margin:8px 0 0;color:#a8d5b8;font-size:13px;">riofuerdeutsche.de</p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:40px;">
            <p style="margin:0 0 8px;font-size:22px;font-weight:bold;color:#111;">Hallo ${client.name}!</p>
            <p style="margin:0 0 24px;font-size:16px;color:#1a7a4a;font-weight:bold;">Noch eine Woche! ✈️</p>

            <p style="margin:0 0 28px;font-size:15px;line-height:1.7;color:#333;">
              Hier ist deine finale Checkliste vor der Abreise. Kurz durchgehen — dann kannst du
              entspannt packen und die Reise genießen.
            </p>

            <!-- Checklist box -->
            <table cellpadding="0" cellspacing="0" style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:24px;margin:0 0 28px;width:100%;">
              <tr><td>
                ${checklistSection('Dokumente', [
                  'Reisepass gültig (mindestens 6 Monate nach Rückkehr)',
                  'Kopien aller wichtigen Dokumente (digital + ausgedruckt)',
                  'Reiseversicherung abgeschlossen und Notfallnummer gespeichert',
                ])}
                ${checklistSection('Apps installieren', [
                  'Uber — vor Ankunft einrichten (braucht WLAN oder Roaming)',
                  'Google Maps — Offline-Karte von Rio herunterladen',
                  'WhatsApp — für den direkten Kontakt mit mir',
                ])}
                ${checklistSection('Geld', [
                  'Kreditkarte funktioniert überall in Rio problemlos',
                  'Nicht am Flughafen wechseln — sehr schlechter Kurs',
                  'Etwas Bargeld (100–200 Reais) für die ersten Stunden',
                ])}
              </td></tr>
            </table>

            <p style="margin:0 0 32px;font-size:15px;line-height:1.7;color:#333;">
              Hast du noch Fragen vor der Abreise? Schreib mir einfach — ich antworte schnell! 😊
            </p>

            <!-- Signature -->
            <table cellpadding="0" cellspacing="0" style="border-top:1px solid #eee;padding-top:24px;width:100%;">
              <tr>
                <td>
                  <p style="margin:0;font-size:14px;color:#333;font-weight:bold;">Will</p>
                  <p style="margin:4px 0 0;font-size:13px;color:#888;">Rio für Deutsche · <a href="https://riofuerdeutsche.de" style="color:#1a7a4a;text-decoration:none;">riofuerdeutsche.de</a></p>
                </td>
              </tr>
            </table>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`

  return { subject, html }
}

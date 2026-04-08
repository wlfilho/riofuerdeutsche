interface TourClient {
  name: string
  email: string
  arrival_date: string
  departure_date: string
  tour_details?: string
}

function hasTransfer(tourDetails?: string) {
  if (!tourDetails) return false
  const lower = tourDetails.toLowerCase()
  return lower.includes('transfer') || lower.includes('flughafen')
}

export function bonVoyageEmail(client: TourClient) {
  const subject = 'Bis morgen in Rio! 🌞'

  const transferBlock = hasTransfer(client.tour_details)
    ? `<p style="margin:0 0 20px;font-size:15px;line-height:1.7;color:#333;">
        Ich bin morgen am Flughafen für dich da! Schreib mir deine Flugnummer per WhatsApp,
        falls du das noch nicht getan hast — damit ich genau weiß, wann ich dich erwarten kann.
      </p>`
    : ''

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
            <p style="margin:0 0 20px;font-size:22px;font-weight:bold;color:#111;">Hallo ${client.name}! 🌞</p>

            <p style="margin:0 0 20px;font-size:15px;line-height:1.7;color:#333;">
              Morgen ist es so weit! Ich freue mich sehr, dich in Rio willkommen zu heißen.
              Du wirst diese Stadt lieben — da bin ich mir sicher.
            </p>

            ${transferBlock}

            <!-- Contact box -->
            <table cellpadding="0" cellspacing="0" style="background:#f0f9f4;border-left:4px solid #1a7a4a;border-radius:4px;padding:20px;margin:0 0 28px;width:100%;">
              <tr>
                <td>
                  <p style="margin:0 0 8px;font-size:13px;font-weight:bold;color:#1a7a4a;text-transform:uppercase;letter-spacing:0.5px;">Bei Fragen oder Verspätungen</p>
                  <p style="margin:0;font-size:14px;line-height:1.6;color:#333;">
                    Ich bin erreichbar per WhatsApp oder E-Mail. Schreib einfach — ich bin für dich da.
                  </p>
                </td>
              </tr>
            </table>

            <p style="margin:0 0 32px;font-size:16px;line-height:1.7;color:#1a7a4a;font-weight:bold;">
              Bis morgen in der schönsten Stadt der Welt! 🏖️
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

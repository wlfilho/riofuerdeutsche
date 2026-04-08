import { formatDate } from './utils'

interface TourClient {
  name: string
  email: string
  arrival_date: string
  departure_date: string
  tour_details?: string
}

export function tourConfirmationEmail(client: TourClient) {
  const subject = 'Deine Rio-Tour ist bestätigt! 🎉'

  const tourDetailsBlock = client.tour_details
    ? `<tr>
        <td style="padding:4px 0;color:#555;font-size:14px;"><strong>Tour:</strong></td>
        <td style="padding:4px 0 4px 16px;color:#333;font-size:14px;">${client.tour_details}</td>
      </tr>`
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
            <p style="margin:0 0 16px;font-size:22px;font-weight:bold;color:#111;">Hallo ${client.name}! 🎉</p>

            <p style="margin:0 0 20px;font-size:15px;line-height:1.7;color:#333;">
              Deine Tour ist bestätigt — ich freue mich riesig, dich bald in Rio begrüßen zu dürfen!
              Rio de Janeiro wartet auf dich, und wir werden eine unvergessliche Zeit haben. Versprochen.
            </p>

            <!-- Summary box -->
            <table cellpadding="0" cellspacing="0" style="background:#f0f9f4;border-left:4px solid #1a7a4a;border-radius:4px;padding:20px;margin:0 0 24px;width:100%;">
              <tr>
                <td>
                  <p style="margin:0 0 12px;font-size:13px;font-weight:bold;color:#1a7a4a;text-transform:uppercase;letter-spacing:0.5px;">Deine Buchung</p>
                  <table cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="padding:4px 0;color:#555;font-size:14px;"><strong>Ankunft:</strong></td>
                      <td style="padding:4px 0 4px 16px;color:#333;font-size:14px;">${formatDate(client.arrival_date)}</td>
                    </tr>
                    <tr>
                      <td style="padding:4px 0;color:#555;font-size:14px;"><strong>Abreise:</strong></td>
                      <td style="padding:4px 0 4px 16px;color:#333;font-size:14px;">${formatDate(client.departure_date)}</td>
                    </tr>
                    ${tourDetailsBlock}
                  </table>
                </td>
              </tr>
            </table>

            <p style="margin:0 0 20px;font-size:15px;line-height:1.7;color:#333;">
              In den nächsten Tagen bekommst du weitere E-Mails von mir mit allem, was du vor deiner
              Ankunft wissen musst — von Sicherheitstipps bis zur finalen Checkliste.
            </p>

            <p style="margin:0 0 32px;font-size:15px;line-height:1.7;color:#333;">
              Ich freue mich riesig auf deine Ankunft in Rio! 🌞
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

import { formatDate, daysUntil } from './utils'

interface TourClient {
  name: string
  email: string
  arrival_date: string
  departure_date: string
  tour_details?: string
}

const tips = [
  {
    icon: '🚗',
    title: 'Uber statt Taxis',
    text: 'Immer die Uber-App benutzen — nie ein gelbes Taxi nehmen. Sicherer, transparenter Preis, kein Diskutieren.',
  },
  {
    icon: '💵',
    title: 'Wenig Bargeld',
    text: 'Maximal 100–150 Reais bei dir haben. Kreditkarte funktioniert fast überall problemlos.',
  },
  {
    icon: '📱',
    title: 'Handy auf der Straße',
    text: 'Tagsüber in belebten Gegenden ok — nachts immer in der Tasche lassen. Gilt besonders für teure Modelle.',
  },
  {
    icon: '🏖️',
    title: 'Wertsachen am Strand',
    text: 'Minimal mitnehmen und nie unbeaufsichtigt lassen. Ein billiges Klappenhandy für den Strand ist ideal.',
  },
  {
    icon: '🧠',
    title: 'Instinkt vertrauen',
    text: 'Wenn etwas komisch wirkt oder du dich unwohl fühlst — einfach weg da. Rio ist großartig, aber kein Abenteuer wert.',
  },
]

export function securityTipsEmail(client: TourClient) {
  const subject = 'Deine Rio-Tipps — bevor du packst 🧳'
  const days = daysUntil(client.arrival_date)
  const daysText = days > 0 ? `Noch ${days} Tag${days === 1 ? '' : 'e'} bis Rio!` : 'Es ist fast so weit!'

  const tipsHtml = tips
    .map(
      tip => `
    <tr>
      <td style="padding:0 0 20px 0;">
        <table cellpadding="0" cellspacing="0" style="width:100%;">
          <tr>
            <td style="width:36px;vertical-align:top;padding-top:2px;font-size:22px;">${tip.icon}</td>
            <td style="vertical-align:top;padding-left:12px;">
              <p style="margin:0 0 4px;font-size:15px;font-weight:bold;color:#111;">${tip.title}</p>
              <p style="margin:0;font-size:14px;line-height:1.6;color:#555;">${tip.text}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>`
    )
    .join('')

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
            <p style="margin:0 0 24px;font-size:16px;color:#1a7a4a;font-weight:bold;">${daysText} 🏖️</p>

            <p style="margin:0 0 28px;font-size:15px;line-height:1.7;color:#333;">
              Damit du dich von Anfang an sicher und wohl fühlst, habe ich meine wichtigsten
              Tipps für dich zusammengestellt. Kurz und praktisch — kein Touristen-Blabla.
            </p>

            <!-- Tips -->
            <table cellpadding="0" cellspacing="0" style="width:100%;margin-bottom:28px;">
              ${tipsHtml}
            </table>

            <p style="margin:0 0 32px;font-size:15px;line-height:1.7;color:#333;">
              Als dein lokaler Guide bin ich immer für dich da. Du kannst mich jederzeit per
              WhatsApp oder E-Mail erreichen — vor, während und nach deinem Aufenthalt.
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

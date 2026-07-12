/**
 * Thin client for the uazapi WhatsApp API (https://uazapi.com).
 * Requires UAZAPI_URL and UAZAPI_TOKEN (instance token) env vars.
 */

export async function sendWhatsAppText(number: string, text: string): Promise<boolean> {
  const url = process.env.UAZAPI_URL;
  const token = process.env.UAZAPI_TOKEN;
  if (!url || !token) return false;

  const res = await fetch(`${url.replace(/\/$/, '')}/send/text`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      token,
    },
    body: JSON.stringify({ number, text }),
  });
  return res.ok;
}

/** Numbers (with country code, digits only) that receive admin notifications. */
export function adminWhatsAppNumbers(): string[] {
  return (process.env.UAZAPI_ADMIN_NUMBERS || '')
    .split(',')
    .map(n => n.replace(/\D/g, ''))
    .filter(Boolean);
}

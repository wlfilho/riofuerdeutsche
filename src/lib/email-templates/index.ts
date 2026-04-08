import { Resend } from 'resend'
import { tourConfirmationEmail } from './tour-confirmation'
import { securityTipsEmail } from './security-tips'
import { documentsChecklistEmail } from './documents-checklist'
import { bonVoyageEmail } from './bon-voyage'

export interface TourClient {
  name: string
  email: string
  arrival_date: string
  departure_date: string
  tour_details?: string
  total_amount?: number | null
  deposit_amount?: number | null
}

export async function sendTourEmail(
  emailNumber: 1 | 2 | 3 | 4,
  client: TourClient
): Promise<{ id: string } | { error: string }> {
  if (!process.env.RESEND_API_KEY) {
    return { error: 'RESEND_API_KEY não configurada.' }
  }

  const resend = new Resend(process.env.RESEND_API_KEY)

  let subject: string
  let html: string

  switch (emailNumber) {
    case 1: {
      const tpl = tourConfirmationEmail(client)
      subject = tpl.subject
      html = tpl.html
      break
    }
    case 2: {
      const tpl = securityTipsEmail(client)
      subject = tpl.subject
      html = tpl.html
      break
    }
    case 3: {
      const tpl = documentsChecklistEmail(client)
      subject = tpl.subject
      html = tpl.html
      break
    }
    case 4: {
      const tpl = bonVoyageEmail(client)
      subject = tpl.subject
      html = tpl.html
      break
    }
  }

  const { data, error } = await resend.emails.send({
    from: 'Rio für Deutsche | Will <noreply@riofuerdeutsche.de>',
    to: client.email,
    subject,
    html,
  })

  if (error) return { error: error.message }
  if (!data?.id) return { error: 'Kein Resend-ID erhalten.' }
  return { id: data.id }
}

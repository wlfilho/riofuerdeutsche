import { renderTemplate } from '@/lib/email/render'

export type EmailTemplate = {
  id: string
  slug: string
  locale: string
  name: string
  subject: string
  html_body: string
  category: string
  sort_order: number
  updated_at: string
}

export type ShortcodeKey =
  | 'nome'
  | 'email'
  | 'tour'
  | 'data_chegada'
  | 'data_saida'
  | 'anzahlung'
  | 'betrag_total'
  | 'assinatura'
  // Campanhas de tour em grupo (ver src/lib/campaigns.ts)
  | 'termin'
  | 'pax'
  | 'interessen'

export const SHORTCODES: { key: ShortcodeKey; label: string; example: string }[] = [
  { key: 'nome', label: 'Name des Kunden', example: 'Carsten Padrok' },
  { key: 'email', label: 'E-Mail des Kunden', example: 'carsten@email.de' },
  { key: 'tour', label: 'Tour / Service', example: 'Klassiker Tour + Favela Tour' },
  { key: 'data_chegada', label: 'Anreisedatum', example: '02.05.2026' },
  { key: 'data_saida', label: 'Abreisedatum', example: '08.05.2026' },
  { key: 'anzahlung', label: 'Anzahlung', example: '150€' },
  { key: 'betrag_total', label: 'Gesamtbetrag', example: '600€' },
  { key: 'assinatura', label: 'Assinatura', example: '<p>Bis bald in Rio!<br>Will</p>' },
  { key: 'termin', label: 'Termin (Gruppentour)', example: 'Samstag, 26. und Sonntag, 27. Februar 2028' },
  { key: 'pax', label: 'Personen (Gruppentour)', example: '2 Erwachsene + 1 Kind' },
  { key: 'interessen', label: 'Interessen (Gruppentour)', example: 'Sambódromo, Zuckerhut & Christusstatue' },
]

export function applyExampleShortcodes(html: string): string {
  const exampleData = Object.fromEntries(
    SHORTCODES.map(({ key, example }) => [key, example])
  ) as Record<ShortcodeKey, string>
  return renderTemplate(html, exampleData)
}

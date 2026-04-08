export type EmailTemplate = {
  id: string
  slug: string
  name: string
  subject: string
  html_body: string
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

export const SHORTCODES: { key: ShortcodeKey; label: string; example: string }[] = [
  { key: 'nome', label: 'Name des Kunden', example: 'Carsten Padrok' },
  { key: 'email', label: 'E-Mail des Kunden', example: 'carsten@email.de' },
  { key: 'tour', label: 'Tour / Service', example: 'Klassiker Tour + Favela Tour' },
  { key: 'data_chegada', label: 'Anreisedatum', example: '02.05.2026' },
  { key: 'data_saida', label: 'Abreisedatum', example: '08.05.2026' },
  { key: 'anzahlung', label: 'Anzahlung', example: '150€' },
  { key: 'betrag_total', label: 'Gesamtbetrag', example: '600€' },
  { key: 'assinatura', label: 'Assinatura', example: '<p>Bis bald in Rio!<br>Will</p>' },
]

export function applyShortcodes(
  html: string,
  data: Partial<Record<ShortcodeKey, string>>
): string {
  return html.replace(/\{\{(\w+)\}\}/g, (_, key) => data[key as ShortcodeKey] ?? `{{${key}}}`)
}

export function applyExampleShortcodes(html: string): string {
  const exampleData = Object.fromEntries(
    SHORTCODES.map(({ key, example }) => [key, example])
  ) as Record<ShortcodeKey, string>
  return applyShortcodes(html, exampleData)
}

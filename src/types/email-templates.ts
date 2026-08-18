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
  // E-mail com o link da proposta (ver src/lib/email/sendProposalEmail.ts)
  | 'link'
  | 'eckdaten'
  | 'reisezeitraum'
  | 'instagram_url'
  | 'instagram_handle'

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
  { key: 'link', label: 'Link zum Angebot', example: 'https://riofuerdeutsche.de/de/p/abc123' },
  // Bloco HTML pronto (datas, pessoas, preço, sinal, validade): o template não
  // tem condicional, então quem monta é o servidor — linha ausente não entra.
  {
    key: 'eckdaten',
    label: 'Eckdaten des Angebots (Block)',
    example:
      '<p style="margin:0 0 24px;padding-left:16px;border-left:2px solid #dddddd;">Reisedaten: 02.05.2026 – 08.05.2026<br/>Personen: 2<br/>Gesamtpreis: 1.240,00 €<br/>Anzahlung: 300,00 €<br/>Angebot gültig bis: 30.03.2026</p>',
  },
  { key: 'reisezeitraum', label: 'Reisezeitraum (Betreff)', example: '02.–08.05.2026' },
  // Vêm de site_settings.business_instagram: trocar o perfil nas Configurações
  // muda o botão de todos os e-mails, sem editar template.
  { key: 'instagram_url', label: 'Instagram (URL)', example: 'https://www.instagram.com/riofuerdeutsche' },
  { key: 'instagram_handle', label: 'Instagram (@perfil)', example: '@riofuerdeutsche' },
]

export function applyExampleShortcodes(html: string): string {
  const exampleData = Object.fromEntries(
    SHORTCODES.map(({ key, example }) => [key, example])
  ) as Record<ShortcodeKey, string>
  return renderTemplate(html, exampleData)
}

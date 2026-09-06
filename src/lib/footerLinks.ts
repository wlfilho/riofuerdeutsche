export type FooterLink = { label: string; href: string }

export type FooterColumn = {
  id: string
  heading: string
  links: FooterLink[]
}

// Faixa sazonal do rodapé. Trocar o objeto ou setar active: false para desligar.
// Calendário previsto: Karneval em janeiro, cruzeiros de setembro a março,
// WM de abril a julho de 2027.
export const seasonalBanner = {
  active: true,
  tag: 'WM 2027',
  text: 'Die Frauen-WM 2027 kommt nach Brasilien.',
  links: [
    { label: 'Spielplan 2027', href: '/frauen-wm-2027/spielplan' },
    { label: 'Deutschland bei der WM', href: '/frauen-wm-2027/deutschland' },
    { label: 'WM 2027 in Rio', href: '/frauen-wm-2027/rio-de-janeiro' },
  ],
}

// Colunas 1 a 4 do rodapé. A coluna 5 (marca e contato) é montada no JSX
// porque depende dos dados de contato vindos do admin.
// Em breve a coluna 2 vira "Kreuzfahrt & Transfer": trocar só os dados aqui.
export const footerColumns: FooterColumn[] = [
  {
    id: 'touren',
    heading: 'Touren',
    links: [
      { label: 'Klassiker-Tour', href: '/touren/klassiker' },
      { label: 'Natur & Strände', href: '/touren/natur-und-straende' },
      { label: 'Favela-Tour Rocinha', href: '/touren/favela-tour' },
      { label: 'Rio bei Nacht', href: '/touren/by-night' },
      { label: 'Karneval-Tour', href: '/touren/karneval-tour' },
      { label: 'Kultur & Geschichte', href: '/touren/kultur-und-geschichte' },
    ],
  },
  {
    id: 'ausfluege',
    heading: 'Ausflüge & Transfer',
    links: [
      { label: 'Fußball-Tour Maracanã', href: '/touren/fussball' },
      { label: 'Tagesausflüge ab Rio', href: '/touren/tagesausfluege' },
      { label: 'Sport & Abenteuer', href: '/touren/sport-und-abenteuer' },
      { label: 'Regentage in Rio', href: '/touren/regentage' },
      { label: 'Individuelle Tour', href: '/touren/individuell' },
      { label: 'Flughafen-Transfer', href: '/touren/flughafen-transfer' },
    ],
  },
  {
    id: 'rio-guide',
    heading: 'Rio-Guide',
    links: [
      { label: 'Alle Sehenswürdigkeiten', href: '/rio-guide/sehenswuerdigkeiten' },
      { label: 'Christus-Erlöser', href: '/rio-guide/sehenswuerdigkeiten/christus-erloeser' },
      { label: 'Zuckerhut', href: '/rio-guide/sehenswuerdigkeiten/zuckerhut' },
      { label: 'Maracanã-Stadion', href: '/rio-guide/sehenswuerdigkeiten/maracana' },
      { label: 'Escadaria Selarón', href: '/rio-guide/sehenswuerdigkeiten/escadaria-selaron' },
      { label: 'Ist Rio gefährlich?', href: '/rio-guide/sicherheit/ist-rio-gefaehrlich' },
    ],
  },
  {
    id: 'frauen-wm',
    heading: 'Frauen-WM 2027',
    links: [
      { label: 'Frauen-WM 2027 Brasilien', href: '/frauen-wm-2027' },
      { label: 'WM 2027 in Rio de Janeiro', href: '/frauen-wm-2027/rio-de-janeiro' },
      { label: 'Stadien der WM 2027', href: '/frauen-wm-2027/stadien' },
      { label: 'Deutschland bei der WM', href: '/frauen-wm-2027/deutschland' },
      { label: 'Spielplan WM 2027', href: '/frauen-wm-2027/spielplan' },
    ],
  },
]

// Pílulas da linha "Weitere Themen", abaixo das colunas.
export const footerThemes: FooterLink[] = [
  { label: 'Alle Touren', href: '/touren' },
  { label: 'Rio-Guide', href: '/rio-guide' },
  { label: 'Rocinha', href: '/rio-guide/sehenswuerdigkeiten/rocinha' },
  { label: 'Santa Marta', href: '/rio-guide/sehenswuerdigkeiten/santa-marta' },
  { label: 'The Maze', href: '/rio-guide/sehenswuerdigkeiten/the-maze' },
]

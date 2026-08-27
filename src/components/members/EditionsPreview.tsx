'use client'

import { useTranslations } from 'next-intl'

/**
 * Conteúdo editorial (títulos/itens de cada edição) fica fora do catálogo de
 * propósito: é texto de marketing, não chrome reutilizável.
 */
const editions = [
  {
    id: 1,
    number: '01',
    status: 'available' as const,
    title: 'Das Wesentliche',
    subtitle: 'Die Basis für deine Reise',
    items: [
      'Wie du sicher nach Rio kommst',
      'Die besten Viertel nach Budget',
      'Uber, Metrô und Transport',
      'Cristo, Zuckerhut und mehr',
      'Die 7 gefährlichsten Fehler',
    ],
  },
  {
    id: 2,
    number: '02',
    status: 'coming_soon' as const,
    title: 'Rio erleben',
    subtitle: 'Rio wie ein Einheimischer',
    items: [
      'Alle Viertel im Detail',
      'Die besten Strände Rios',
      'Wo und was essen',
      'Nachtleben mit Sicherheit',
      'Shoppen und Märkte',
    ],
  },
  {
    id: 3,
    number: '03',
    status: 'coming_soon' as const,
    title: 'Rio wie ein Insider',
    subtitle: 'Tief eintauchen',
    items: [
      'Kultur, Kunst und Geschichte',
      'Musik, Samba und Bossa Nova',
      'Karneval von innen erleben',
      'Fußball im Maracanã',
      'Geheimtipps der Cariocas',
    ],
  },
  {
    id: 4,
    number: '04',
    status: 'coming_soon' as const,
    title: 'Der komplette Guide',
    subtitle: 'Das komplette Bild',
    items: [
      'Tagesausflüge: Búzios, Ilha Grande',
      'Detaillierte Reiserouten',
      'Niterói und Guanabara-Bucht',
      'Budget-Tipps für jeden Stil',
      'Zona Oeste und Prainha',
    ],
  },
]

export default function EditionsPreview() {
  const t = useTranslations('public.cta.editions')

  return (
    <section className="w-full bg-[#f8f5f0] border-t border-[#e8e4dc] py-16 px-6">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-xs font-bold uppercase tracking-[1.5px] text-gray-400 mb-3">
            {t('wasNochKommt')}
          </p>
          <h2 className="font-heading font-black text-3xl lg:text-4xl text-gray-900 mb-4">
            {t('titel')}
          </h2>
          <p className="text-gray-500 text-base max-w-xl mx-auto leading-relaxed">
            Wer jetzt einsteigt, bekommt alle zukünftigen Editionen kostenlos. Der Preis steigt mit jeder neuen Edition.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {editions.map((edition) =>
            edition.status === 'available' ? (
              <div
                key={edition.id}
                className="bg-white border border-[#e0ddd6] border-t-4 border-t-[#22a262] rounded-2xl p-6 flex flex-col gap-4 relative"
              >
                <span className="text-[#22a262] font-black text-4xl leading-none opacity-20 absolute top-4 right-5">
                  {edition.number}
                </span>
                <span className="inline-flex items-center gap-1.5 bg-[#e8f5e9] text-[#2e7d32] text-xs font-bold uppercase tracking-wide px-3 py-1 rounded-full w-fit">
                  {t('verfuegbar')}
                </span>
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-widest mb-0.5 text-gray-400">
                    {t('edition', { number: String(edition.id) })}
                  </p>
                  <h3 className="font-heading font-black text-xl text-gray-900 leading-tight">
                    {edition.title}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">{edition.subtitle}</p>
                </div>
                <ul className="flex flex-col gap-2 mt-1">
                  {edition.items.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-gray-600">
                      <span className="text-[#22a262] mt-0.5 flex-shrink-0">✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div
                key={edition.id}
                className="bg-white border border-[#e0ddd6] border-t-4 border-t-[#f5c518] rounded-2xl p-6 flex flex-col gap-4 relative opacity-80"
              >
                <span className="text-gray-300 font-black text-4xl leading-none absolute top-4 right-5">
                  {edition.number}
                </span>
                <span className="inline-flex items-center gap-1.5 bg-[#fff8e1] text-[#b8860b] text-xs font-bold uppercase tracking-wide px-3 py-1 rounded-full w-fit">
                  {t('demnaechst')}
                </span>
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-widest mb-0.5 text-gray-400">
                    {t('edition', { number: String(edition.id) })}
                  </p>
                  <h3 className="font-heading font-black text-xl text-gray-900 leading-tight">
                    {edition.title}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">{edition.subtitle}</p>
                </div>
                <ul className="flex flex-col gap-2 mt-1">
                  {edition.items.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-gray-400">
                      <span className="text-gray-300 mt-0.5 flex-shrink-0">○</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-10 pt-8 border-t border-[#e8e4dc]">
          <p className="text-sm text-gray-500">
            🔒 Einmal kaufen: alle Editionen für immer inklusive. Der Preis steigt nur für Neukäufer.
          </p>
        </div>

      </div>
    </section>
  )
}

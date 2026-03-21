import Link from 'next/link'

interface CTAConfig {
  icon: string
  title: string
  subtitle: string
  buttonLabel: string
  buttonHref: string
  secondaryLabel?: string
  secondaryHref?: string
}

const CTA_MAP: Record<string, CTAConfig> = {
  sicherheit: {
    icon: '🛡️',
    title: 'Kostenloser Sicherheits-Guide als PDF',
    subtitle: 'Lade dir unsere kompakte Zusammenfassung der wichtigsten Sicherheitstipps für Rio herunter — kostenlos und sofort verfügbar.',
    buttonLabel: 'PDF kostenlos herunterladen',
    buttonHref: '/guide?upgrade=true',
  },
  unterkunft: {
    icon: '🏨',
    title: 'Persönliche Unterkunft-Beratung',
    subtitle: '60 Minuten mit Will per Videocall — sichere Unterkunft finden, Routen planen und alle Fragen beantwortet. Von einem Carioca, der fließend Deutsch spricht.',
    buttonLabel: 'Beratung buchen',
    buttonHref: 'https://riofuerdeutsche.de/unterkunft/beratung',
    secondaryLabel: 'Mehr erfahren',
    secondaryHref: 'https://riofuerdeutsche.de/unterkunft/beratung#details',
  },
  transport: {
    icon: '✈️',
    title: 'Transfer vom Flughafen',
    subtitle: 'Komm sicher und stressfrei vom Flughafen ins Hotel — mit unserem privaten Transferservice, der nur für unsere Mitglieder verfügbar ist.',
    buttonLabel: 'Transfer anfragen',
    buttonHref: 'https://riofuerdeutsche.de/kontakt',
  },
}

const DEFAULT_CTA: CTAConfig = {
  icon: '🌴',
  title: 'Persönliche Tour durch Rio',
  subtitle: 'Erlebe Rio mit einem echten Carioca als Guide — maßgeschneidert auf deine Interessen, auf Deutsch.',
  buttonLabel: 'Tour anfragen',
  buttonHref: 'https://riofuerdeutsche.de/kontakt',
  secondaryLabel: 'Kontakt aufnehmen',
  secondaryHref: 'https://riofuerdeutsche.de/kontakt',
}

interface GuideCTAProps {
  chapterSlug: string
}

export default function GuideCTA({ chapterSlug }: GuideCTAProps) {
  const cta = CTA_MAP[chapterSlug] ?? DEFAULT_CTA

  const isExternal = (href: string) => href.startsWith('http')

  return (
    <div
      className="mt-10 rounded-2xl p-7 flex flex-col sm:flex-row gap-5 items-start sm:items-center"
      style={{ background: 'var(--rfd-green-dark)' }}
    >
      {/* Icon */}
      <div
        className="flex items-center justify-center rounded-xl shrink-0"
        style={{
          width: '52px',
          height: '52px',
          background: 'rgba(255,255,255,0.08)',
          fontSize: '24px',
        }}
      >
        {cta.icon}
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <h3
          className="font-heading font-bold text-base leading-snug mb-1"
          style={{ color: '#fff' }}
        >
          {cta.title}
        </h3>
        <p
          className="text-sm leading-relaxed"
          style={{ color: 'rgba(255,255,255,0.65)', maxWidth: '480px' }}
        >
          {cta.subtitle}
        </p>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-2 shrink-0">
        {isExternal(cta.buttonHref) ? (
          <a
            href={cta.buttonHref}
            target="_blank"
            rel="noopener noreferrer"
            className="font-heading font-bold text-sm px-5 py-2.5 rounded-full transition-opacity hover:opacity-90"
            style={{
              background: 'var(--rfd-yellow)',
              color: 'var(--rfd-green-dark)',
              whiteSpace: 'nowrap',
              textDecoration: 'none',
            }}
          >
            {cta.buttonLabel}
          </a>
        ) : (
          <Link
            href={cta.buttonHref}
            className="font-heading font-bold text-sm px-5 py-2.5 rounded-full transition-opacity hover:opacity-90"
            style={{
              background: 'var(--rfd-yellow)',
              color: 'var(--rfd-green-dark)',
              whiteSpace: 'nowrap',
              textDecoration: 'none',
            }}
          >
            {cta.buttonLabel}
          </Link>
        )}

        {cta.secondaryLabel && cta.secondaryHref && (
          isExternal(cta.secondaryHref) ? (
            <a
              href={cta.secondaryHref}
              target="_blank"
              rel="noopener noreferrer"
              className="font-heading font-semibold text-sm px-5 py-2.5 rounded-full transition-opacity hover:opacity-80"
              style={{
                background: 'transparent',
                color: 'rgba(255,255,255,0.75)',
                border: '1px solid rgba(255,255,255,0.25)',
                whiteSpace: 'nowrap',
                textDecoration: 'none',
              }}
            >
              {cta.secondaryLabel}
            </a>
          ) : (
            <Link
              href={cta.secondaryHref}
              className="font-heading font-semibold text-sm px-5 py-2.5 rounded-full transition-opacity hover:opacity-80"
              style={{
                background: 'transparent',
                color: 'rgba(255,255,255,0.75)',
                border: '1px solid rgba(255,255,255,0.25)',
                whiteSpace: 'nowrap',
                textDecoration: 'none',
              }}
            >
              {cta.secondaryLabel}
            </Link>
          )
        )}
      </div>
    </div>
  )
}

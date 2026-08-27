import Link from 'next/link'
import { getTranslations } from 'next-intl/server'

interface CTAConfig {
  icon: string
  title: string
  subtitle: string
  buttonLabel: string
  buttonHref: string
  secondaryLabel?: string
  secondaryHref?: string
}

/**
 * Os subtítulos continuam literais aqui: são texto editorial de marketing, não
 * chrome reutilizável. Só título/rótulos de botão foram para o catálogo.
 */
function buildCtaMap(t: (key: string) => string): Record<string, CTAConfig> {
  return {
    sicherheit: {
      icon: '🛡️',
      title: t('sicherheitTitle'),
      subtitle: 'Lade dir unsere kompakte Zusammenfassung der wichtigsten Sicherheitstipps für Rio herunter — kostenlos und sofort verfügbar.',
      buttonLabel: t('sicherheitButton'),
      buttonHref: '/dashboard?upgrade=true',
    },
    unterkunft: {
      icon: '🏨',
      title: t('unterkunftTitle'),
      subtitle: '60 Minuten mit Will per Videocall — sichere Unterkunft finden, Routen planen und alle Fragen beantwortet. Von einem Carioca, der fließend Deutsch spricht.',
      buttonLabel: t('unterkunftButton'),
      // A página /unterkunft/beratung nunca existiu (404 desde sempre). Em vez
      // de inventar uma, o CTA vira teste de demanda pela /anfrage. O
      // "Mehr erfahren" saiu junto: apontava pra uma âncora #details de uma
      // página inexistente, e "saiba mais" levando a formulário de pedido é
      // promessa quebrada.
      buttonHref: 'https://riofuerdeutsche.de/anfrage?von=site&thema=unterkunft',
    },
    transport: {
      icon: '✈️',
      title: t('transportTitle'),
      subtitle: 'Komm sicher und stressfrei vom Flughafen ins Hotel — mit unserem privaten Transferservice, der nur für unsere Mitglieder verfügbar ist.',
      buttonLabel: t('transportButton'),
      buttonHref: 'https://riofuerdeutsche.de/kontakt',
    },
  }
}

function buildDefaultCta(t: (key: string) => string): CTAConfig {
  return {
    icon: '🌴',
    title: t('defaultTitle'),
    subtitle: 'Erlebe Rio mit einem echten Carioca als Guide — maßgeschneidert auf deine Interessen, auf Deutsch.',
    buttonLabel: t('defaultButton'),
    buttonHref: 'https://riofuerdeutsche.de/kontakt',
    secondaryLabel: t('kontaktAufnehmen'),
    secondaryHref: 'https://riofuerdeutsche.de/kontakt',
  }
}

interface GuideCTAProps {
  chapterSlug: string
}

export default async function GuideCTA({ chapterSlug }: GuideCTAProps) {
  const t = await getTranslations('public.cta.guideCta')
  const cta = buildCtaMap(t)[chapterSlug] ?? buildDefaultCta(t)

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

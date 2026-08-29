'use client'

import { useEffect, useState } from 'react'
import Script from 'next/script'

const GA_ID = 'G-4BKZYR81FF'

declare global {
  interface Window {
    dataLayer: unknown[]
    gtag: (...args: unknown[]) => void
  }
}

export default function GoogleAnalytics() {
  const [enabled, setEnabled] = useState(false)

  useEffect(() => {
    const consent = localStorage.getItem('cookie_consent')
    if (consent === 'accepted') {
      setEnabled(true)
    }

    const handleConsentUpdate = () => {
      const updated = localStorage.getItem('cookie_consent')
      if (updated === 'accepted') {
        setEnabled(true)
      }
    }

    window.addEventListener('cookie_consent_updated', handleConsentUpdate)
    return () => {
      window.removeEventListener('cookie_consent_updated', handleConsentUpdate)
    }
  }, [])

  // Listener delegado: o link do WhatsApp aparece em meia dúzia de componentes
  // (Navbar, Footer, FAQ, Bewertungen, proposta, tela de sucesso do Anfrage).
  // Ouvir no document pega todos, inclusive os que ainda vão existir.
  useEffect(() => {
    if (!enabled) return

    const handleClick = (e: MouseEvent) => {
      const link = (e.target as HTMLElement | null)?.closest?.(
        'a[href*="wa.me"]'
      ) as HTMLAnchorElement | null
      if (!link) return
      window.gtag?.('event', 'contact_whatsapp', {
        link_url: link.href,
        page_path: window.location.pathname,
      })
    }

    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [enabled])

  if (!enabled) return null

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_ID}');
        `}
      </Script>
    </>
  )
}

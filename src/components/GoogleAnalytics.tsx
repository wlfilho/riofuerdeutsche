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

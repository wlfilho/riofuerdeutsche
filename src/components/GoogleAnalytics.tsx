'use client'

import { useEffect } from 'react'

const GA_ID = 'G-4BKZYR81FF'

declare global {
  interface Window {
    dataLayer: unknown[]
    gtag: (...args: unknown[]) => void
  }
}

function loadGA4() {
  if (document.querySelector(`script[src*="gtag/js?id=${GA_ID}"]`)) return

  window.dataLayer = window.dataLayer || []
  window.gtag = function gtag(...args: unknown[]) {
    window.dataLayer.push(args)
  }
  window.gtag('js', new Date())

  const script = document.createElement('script')
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`
  script.async = true
  script.onload = () => {
    window.gtag('config', GA_ID)
  }
  document.head.appendChild(script)
}

export default function GoogleAnalytics() {
  useEffect(() => {
    const consent = localStorage.getItem('cookie_consent')
    if (consent === 'accepted') {
      loadGA4()
    }

    const handleConsentUpdate = () => {
      const updated = localStorage.getItem('cookie_consent')
      if (updated === 'accepted') {
        loadGA4()
      }
    }

    window.addEventListener('cookie_consent_updated', handleConsentUpdate)
    return () => {
      window.removeEventListener('cookie_consent_updated', handleConsentUpdate)
    }
  }, [])

  return null
}

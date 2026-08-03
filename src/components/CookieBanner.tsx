'use client'

import { useEffect, useState } from 'react'
import { m, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { useTranslations } from 'next-intl'

export default function CookieBanner() {
  const t = useTranslations('public.cta.cookieBanner')
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const consent = localStorage.getItem('cookie_consent')
    if (!consent) {
      // Small delay so the banner doesn't compete with initial page load
      const timer = setTimeout(() => setVisible(true), 800)
      return () => clearTimeout(timer)
    }
  }, [])

  useEffect(() => {
    const handleReset = () => {
      localStorage.removeItem('cookie_consent')
      setVisible(true)
    }

    window.addEventListener('cookie_consent_reset', handleReset)
    return () => {
      window.removeEventListener('cookie_consent_reset', handleReset)
    }
  }, [])

  function handleAccept() {
    localStorage.setItem('cookie_consent', 'accepted')
    setVisible(false)
    window.dispatchEvent(new Event('cookie_consent_updated'))
  }

  function handleReject() {
    localStorage.setItem('cookie_consent', 'rejected')
    setVisible(false)
  }

  return (
    <AnimatePresence>
      {visible && (
        <m.div
          role="dialog"
          aria-label={t('ariaLabel')}
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed bottom-0 left-0 right-0 z-50 p-3 sm:p-5"
        >
          <div className="mx-auto max-w-5xl overflow-hidden rounded-2xl border border-[var(--rfd-border-light)] bg-[var(--rfd-cream)]/95 shadow-2xl backdrop-blur-md">
            <div className="flex flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:gap-6 sm:px-6 sm:py-5">
              {/* Icon */}
              <div className="hidden shrink-0 sm:block">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--rfd-green-brand)]/10">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="var(--rfd-green-brand)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5" />
                    <path d="M8.5 8.5v.01" />
                    <path d="M16 15.5v.01" />
                    <path d="M12 12v.01" />
                    <path d="M11 17v.01" />
                    <path d="M7 14v.01" />
                  </svg>
                </div>
              </div>

              {/* Text */}
              <p className="min-w-0 flex-1 text-sm leading-relaxed text-[var(--rfd-text-mid)]">
                {t('text')}{' '}
                <Link
                  href="/datenschutz"
                  className="font-medium text-[var(--rfd-green-brand)] underline-offset-2 hover:underline"
                >
                  {t('mehrErfahren')}
                </Link>
              </p>

              {/* Buttons */}
              <div className="flex shrink-0 gap-2.5">
                <button
                  onClick={handleReject}
                  className="cursor-pointer rounded-full border border-[var(--rfd-border)] bg-white px-4 py-2 text-sm font-medium text-[var(--rfd-text-dark)] transition-all hover:border-[var(--rfd-text-muted)] hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--rfd-green-brand)] focus-visible:ring-offset-2"
                >
                  {t('nurNotwendige')}
                </button>
                <button
                  onClick={handleAccept}
                  className="cursor-pointer rounded-full bg-[var(--rfd-green-brand)] px-4 py-2 text-sm font-medium text-white transition-all hover:bg-[var(--rfd-green-mid)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--rfd-green-brand)] focus-visible:ring-offset-2"
                >
                  {t('alleAkzeptieren')}
                </button>
              </div>
            </div>
          </div>
        </m.div>
      )}
    </AnimatePresence>
  )
}

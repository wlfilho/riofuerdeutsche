'use client'

import React, { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useReading } from './ReadingContext'

interface ReadToggleProps {
  pageId: string
}

export function ReadToggle({ pageId }: ReadToggleProps) {
  const t = useTranslations('public.dashboard.lesen')
  const { isPageRead, toggleRead } = useReading()
  const isRead = isPageRead(pageId)
  const [loading, setLoading] = useState(false)

  const handleToggle = async () => {
    if (loading) return
    setLoading(true)
    try {
      await toggleRead(pageId)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className="group flex items-center gap-3 py-1 text-left transition-opacity disabled:opacity-60"
      aria-pressed={isRead}
    >
      <span className={`text-[11px] font-mono uppercase tracking-widest transition-colors duration-200 
                        ${isRead ? 'text-green-600 font-bold' : 'text-gray-400 group-hover:text-gray-600'}`}>
        {isRead ? t('gelesen') : t('alsGelesenMarkieren')}
      </span>

      <div 
        className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none 
                    ${isRead ? 'bg-green-500' : 'bg-gray-200'}`}
      >
        <span
          aria-hidden="true"
          className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out flex items-center justify-center
                      ${isRead ? 'translate-x-4' : 'translate-x-0'}`}
        >
          {loading && <Loader2 className="w-2.5 h-2.5 animate-spin text-gray-400" />}
        </span>
      </div>
    </button>
  )
}

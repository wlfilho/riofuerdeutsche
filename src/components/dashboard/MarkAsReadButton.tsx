'use client'

import { useState } from 'react'
import { Check, Circle, Loader2 } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import { markPageAsRead, markPageAsUnread } from '@/app/actions/guideProgress'

interface MarkAsReadButtonProps {
  pageId: string
  initialIsRead: boolean
  initialReadAt?: string
}

export function MarkAsReadButton({
  pageId,
  initialIsRead,
  initialReadAt,
}: MarkAsReadButtonProps) {
  const t = useTranslations('public.dashboard.lesen')
  const locale = useLocale()
  const [isRead, setIsRead] = useState(initialIsRead)
  const [readAt, setReadAt] = useState(initialReadAt)
  const [loading, setLoading] = useState(false)
  const [showUndo, setShowUndo] = useState(false)

  const handleToggle = async () => {
    setLoading(true)
    const newIsRead = !isRead
    
    // Optimistic Update
    setIsRead(newIsRead)

    try {
      if (newIsRead) {
        const res = await markPageAsRead(pageId)
        if (res.success) {
          setReadAt(res.read_at)
        } else {
          setIsRead(!newIsRead)
        }
      } else {
        const res = await markPageAsUnread(pageId)
        if (!res.success) {
          setIsRead(!newIsRead)
        }
      }
    } catch (err) {
      console.error('Failed to update progress:', err)
      setIsRead(!newIsRead)
    } finally {
      setLoading(false)
      setShowUndo(false)
    }
  }

  // Data por extenso ("12. März 2026"). O locale vem do next-intl em vez de
  // 'de-DE' fixo; as opções continuam as mesmas para o texto não mudar.
  // `formatDate` de @/lib/format não serve aqui: ele produz dd.MM.yyyy.
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    return new Intl.DateTimeFormat(locale, {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date)
  }

  return (
    <div className="flex flex-col items-center gap-3 my-12 pt-8 border-t border-gray-100">
      {!isRead ? (
        <button
          onClick={handleToggle}
          disabled={loading}
          className="flex items-center gap-2 px-8 py-3 rounded-full border-2 border-[var(--rfd-green-brand)] 
                     text-[var(--rfd-green-brand)] font-semibold transition-all hover:bg-green-50 disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Circle className="w-5 h-5" />
          )}
          {t('alsGelesenMarkieren')}
        </button>
      ) : (
        <div className="flex flex-col items-center gap-2">
          <div 
            className="flex items-center gap-2 px-8 py-3 rounded-full bg-[var(--rfd-green-brand)] 
                       text-white font-semibold shadow-md animate-in zoom-in duration-300"
          >
            <Check className="w-5 h-5" />
            {t('gelesen')}
          </div>
          
          <div className="flex flex-col items-center gap-1">
            <span className="text-[11px] text-gray-400 font-mono">
              {t('amGelesen', { date: formatDate(readAt) })}
            </span>
            <button
              onClick={() => setShowUndo(!showUndo)}
              className="text-[10px] text-gray-300 hover:text-gray-500 underline transition-colors"
            >
              {t('aendern')}
            </button>
            
            {showUndo && (
              <button
                onClick={handleToggle}
                disabled={loading}
                className="text-[11px] text-red-400 hover:text-red-600 transition-colors animate-in fade-in slide-in-from-top-1"
              >
                {t('alsUngelesenMarkieren')}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

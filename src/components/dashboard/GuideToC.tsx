'use client'

import { CheckCircle2, Circle } from 'lucide-react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { useReading } from './ReadingContext'

export interface ToCItem {
  id: string
  text: string
  level: number
}

export interface SiblingPage {
  id: string
  title: string
  slug: string
  is_free: boolean
}

interface GuideToCProps {
  items: ToCItem[]
  activeId: string
  chapterTitle: string
  chapterSlug: string
  currentPage: number
  totalPages: number
  pages: SiblingPage[]
  currentSlug: string
  readPageIds?: string[]
}

export default function GuideToC({
  items,
  activeId,
  chapterTitle,
  chapterSlug,
  currentPage,
  totalPages,
  pages,
  currentSlug,
  readPageIds: propReadPageIds,
}: GuideToCProps) {
  const t = useTranslations('public.dashboard.toc')
  const { readPageIds: contextReadPageIds } = useReading()
  const readPageIds = contextReadPageIds || propReadPageIds || []

  const readInChapter = pages.filter(p => readPageIds.includes(p.id)).length
  const progressPercent = totalPages > 0 ? Math.round((readInChapter / totalPages) * 100) : 0

  const handleClick = (e: React.MouseEvent, id: string) => {
    e.preventDefault()
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const hasHeadings = items.length > 0

  return (
    <div className="flex flex-col gap-4">
      {/* Chapter info + progress */}
      <div
        className="rounded-xl p-4"
        style={{ background: '#fff', border: '1px solid var(--rfd-border)' }}
      >
        <p
          className="font-mono text-[10px] uppercase tracking-widest mb-1"
          style={{ color: 'var(--rfd-text-muted)' }}
        >
          {t('kapitel')}
        </p>
        <p
          className="font-heading font-bold text-sm leading-snug mb-3"
          style={{ color: 'var(--rfd-text-dark)' }}
        >
          {chapterTitle}
        </p>

        <div className="flex items-center justify-between mb-1.5">
          <span
            className="font-mono text-[10px]"
            style={{ color: 'var(--rfd-text-muted)' }}
          >
            {t('gelesenVon', { read: String(readInChapter), total: String(totalPages) })}
          </span>
          <span
            className="font-mono text-[10px] font-bold"
            style={{ color: 'var(--rfd-green-brand)' }}
          >
            {progressPercent}%
          </span>
        </div>

        <div
          className="w-full rounded-full overflow-hidden"
          style={{ height: '4px', background: 'var(--rfd-border)' }}
        >
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${progressPercent}%`,
              background: 'var(--rfd-green-brand)',
            }}
          />
        </div>
      </div>

      {/* Pages of this Chapter */}
      <div
        className="rounded-xl p-4"
        style={{ background: '#fff', border: '1px solid var(--rfd-border)' }}
      >
        <p
          className="font-mono text-[10px] uppercase tracking-widest mb-3"
          style={{ color: 'var(--rfd-text-muted)' }}
        >
          {t('seitenInDiesemKapitel')}
        </p>

        <nav className="flex flex-col gap-1">
          {pages.map((page) => {
            const isActive = page.slug === currentSlug
            const isRead = readPageIds.includes(page.id)
            return (
              <Link
                key={page.slug}
                href={`/guide/${chapterSlug}/${page.slug}`}
                className="text-left rounded-lg px-3 py-2 transition-colors flex items-center justify-between text-no-underline"
                style={{
                  background: isActive ? '#f0faf5' : 'transparent',
                  border: isActive ? '1px solid #c8e6c9' : '1px solid transparent',
                }}
              >
                <span
                  className="block leading-snug flex-1"
                  style={{
                    fontSize: '12px',
                    fontWeight: isActive ? 600 : 400,
                    color: isActive ? 'var(--rfd-green-brand)' : 'var(--rfd-text-dark)',
                  }}
                >
                  {page.title}
                </span>
                {isActive ? (
                  <span className="text-[10px]" style={{ color: 'var(--rfd-green-brand)' }}>
                    ●
                  </span>
                ) : isRead ? (
                  <CheckCircle2 size={12} className="text-green-500" />
                ) : (
                  <Circle size={10} className="text-gray-200" />
                )}
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Table of Contents */}
      {hasHeadings && (
        <div
          className="rounded-xl p-4"
          style={{ background: '#fff', border: '1px solid var(--rfd-border)' }}
        >
          <p
            className="font-mono text-[10px] uppercase tracking-widest mb-3"
            style={{ color: 'var(--rfd-text-muted)' }}
          >
            {t('aufDieserSeite')}
          </p>

          <nav className="flex flex-col gap-0.5">
            {items.map((item) => {
              const isActive = activeId === item.id
              return (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  onClick={(e) => handleClick(e, item.id)}
                  className="text-left transition-all duration-150 rounded-lg group no-underline block"
                  style={{
                    paddingLeft: `${Math.max(0, (item.level - 2) * 12 + 8)}px`,
                    paddingRight: '8px',
                    paddingTop: '5px',
                    paddingBottom: '5px',
                    borderLeft: isActive
                      ? '2px solid var(--rfd-green-brand)'
                      : '2px solid transparent',
                    background: isActive ? '#f0faf5' : 'transparent',
                  }}
                >
                  <span
                    className="block leading-snug"
                    style={{
                      fontSize: item.level <= 2 ? '13px' : '12px',
                      fontWeight: item.level <= 2 ? 600 : 400,
                      color: isActive
                        ? 'var(--rfd-green-brand)'
                        : 'var(--rfd-text-mid)',
                    }}
                  >
                    {item.text}
                  </span>
                </a>
              )
            })}
          </nav>
        </div>
      )}
    </div>
  )
}

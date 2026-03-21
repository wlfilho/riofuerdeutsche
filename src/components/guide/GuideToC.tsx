'use client'

import { useEffect, useRef, useState } from 'react'

export interface ToCItem {
  id: string
  text: string
  level: 2 | 3
}

interface GuideToCProps {
  items: ToCItem[]
  chapterTitle: string
  currentPage: number
  totalPages: number
}

export default function GuideToC({ items, chapterTitle, currentPage, totalPages }: GuideToCProps) {
  const [activeId, setActiveId] = useState<string>('')
  const observerRef = useRef<IntersectionObserver | null>(null)

  useEffect(() => {
    if (items.length === 0) return

    const headingElements = items
      .map(({ id }) => document.getElementById(id))
      .filter(Boolean) as HTMLElement[]

    if (headingElements.length === 0) return

    // Track which headings are visible
    const visibleHeadings = new Map<string, number>()

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            visibleHeadings.set(entry.target.id, entry.boundingClientRect.top)
          } else {
            visibleHeadings.delete(entry.target.id)
          }
        })

        // Pick the topmost visible heading
        if (visibleHeadings.size > 0) {
          const sorted = [...visibleHeadings.entries()].sort((a, b) => a[1] - b[1])
          setActiveId(sorted[0][0])
        }
      },
      { rootMargin: '-80px 0px -60% 0px', threshold: 0 }
    )

    headingElements.forEach((el) => observerRef.current!.observe(el))

    return () => {
      observerRef.current?.disconnect()
    }
  }, [items])

  const progressPercent = totalPages > 1 ? Math.round(((currentPage - 1) / (totalPages - 1)) * 100) : 100

  const handleClick = (id: string) => {
    const el = document.getElementById(id)
    if (!el) return
    const offset = 100
    const top = el.getBoundingClientRect().top + window.scrollY - offset
    window.scrollTo({ top, behavior: 'smooth' })
  }

  if (items.length === 0) return null

  return (
    <aside className="hidden lg:flex flex-col gap-0" style={{ width: '260px', flexShrink: 0 }}>
      <div
        className="sticky flex flex-col gap-4"
        style={{ top: '100px', maxHeight: 'calc(100vh - 120px)', overflowY: 'auto' }}
      >
        {/* Chapter info + progress */}
        <div
          className="rounded-xl p-4"
          style={{ background: '#fff', border: '1px solid var(--rfd-border)' }}
        >
          <p
            className="font-mono text-[10px] uppercase tracking-widest mb-1"
            style={{ color: 'var(--rfd-text-muted)' }}
          >
            Kapitel
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
              Seite {currentPage} von {totalPages}
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

        {/* Table of Contents */}
        <div
          className="rounded-xl p-4"
          style={{ background: '#fff', border: '1px solid var(--rfd-border)' }}
        >
          <p
            className="font-mono text-[10px] uppercase tracking-widest mb-3"
            style={{ color: 'var(--rfd-text-muted)' }}
          >
            Inhaltsverzeichnis
          </p>

          <nav className="flex flex-col gap-0.5">
            {items.map((item) => {
              const isActive = activeId === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => handleClick(item.id)}
                  className="text-left transition-all duration-150 rounded-lg group"
                  style={{
                    paddingLeft: item.level === 3 ? '16px' : '8px',
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
                      fontSize: item.level === 2 ? '13px' : '12px',
                      fontWeight: item.level === 2 ? 600 : 400,
                      color: isActive
                        ? 'var(--rfd-green-brand)'
                        : 'var(--rfd-text-mid)',
                    }}
                  >
                    {item.text}
                  </span>
                </button>
              )
            })}
          </nav>
        </div>
      </div>
    </aside>
  )
}

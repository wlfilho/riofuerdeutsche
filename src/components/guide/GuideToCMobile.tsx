'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronDown, List, CheckCircle2, Circle } from 'lucide-react'
import type { ToCItem, SiblingPage } from './GuideToC'
import { useReading } from './ReadingContext'

interface GuideToCMobileProps {
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

export default function GuideToCMobile({
  items,
  activeId,
  chapterTitle,
  chapterSlug,
  currentPage,
  totalPages,
  pages,
  currentSlug,
  readPageIds: propReadPageIds,
}: GuideToCMobileProps) {
  const { readPageIds: contextReadPageIds } = useReading()
  const readPageIds = contextReadPageIds || propReadPageIds || []
  const [open, setOpen] = useState(false)

  const activeItem = items.find((item) => item.id === activeId)
  const activeLabel = activeItem?.text ?? 'Inhaltsverzeichnis'

  const handleClick = (e: React.MouseEvent, id: string) => {
    e.preventDefault()
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
    }
    setOpen(false)
  }

  // If no items on page, we might still want to show the chapter menu? 
  // The original component showed but checked items.length.
  // The instruction says "Substitute by a sticky top bar".
  
  return (
    <div className="md:hidden sticky top-[80px] z-40 bg-white border-b border-gray-100 shadow-sm">
      {/* Sticky Bar */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-4 py-3 text-left"
      >
        <List size={18} className="shrink-0" style={{ color: 'var(--rfd-green-brand)' }} />
        
        <span className="flex-1 text-xs font-semibold uppercase tracking-wider text-gray-600 truncate">
          {activeLabel}
        </span>
        
        <ChevronDown 
          size={18} 
          className={`shrink-0 text-gray-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown menu */}
      {open && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-30"
            style={{ top: 'calc(80px + 44px)', background: 'rgba(0,0,0,0.1)', backdropFilter: 'blur(2px)' }}
            onClick={() => setOpen(false)}
          />

          <nav 
            className="relative z-40 bg-white border-t border-gray-100 shadow-xl overflow-y-auto"
            style={{ maxHeight: 'calc(100vh - 200px)' }}
          >
            <div className="p-4">
              <p className="font-heading font-bold text-sm mb-4 text-gray-800">
                {chapterTitle}
              </p>

              {/* Chapter Pages */}
              <div className="mb-6">
                <p className="font-mono text-[10px] uppercase tracking-widest text-gray-400 mb-2">
                  Kapitel-Seiten
                </p>
                <div className="flex flex-col gap-1">
                  {pages.map((page) => {
                    const isActive = page.slug === currentSlug
                    return (
                      <Link
                        key={page.slug}
                        href={`/guide/${chapterSlug}/${page.slug}`}
                        onClick={() => setOpen(false)}
                        className={`text-left rounded-lg px-3 py-2 flex items-center justify-between text-no-underline transition-colors
                          ${isActive ? 'bg-[var(--rfd-cream)] border border-[rgba(0,0,0,0.05)]' : 'hover:bg-gray-50'}`}
                      >
                        <span className={`text-[13px] flex-1 ${isActive ? 'font-bold text-[var(--rfd-green-brand)]' : 'text-gray-700'}`}>
                          {page.title}
                        </span>
                        {isActive ? (
                          <span className="w-1.5 h-1.5 rounded-full bg-[var(--rfd-green-brand)]" />
                        ) : readPageIds.includes(page.id) ? (
                          <CheckCircle2 size={12} className="text-green-500" />
                        ) : (
                          <Circle size={10} className="text-gray-200" />
                        )}
                      </Link>
                    )
                  })}
                </div>
              </div>

              {/* On this page items */}
              {items.length > 0 && (
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-widest text-gray-400 mb-2">
                    Auf dieser Seite
                  </p>
                  <div className="flex flex-col gap-0.5">
                    {items.map((item) => {
                      const isActive = activeId === item.id
                      return (
                        <a
                          key={item.id}
                          href={`#${item.id}`}
                          onClick={(e) => handleClick(e, item.id)}
                          className={`text-left rounded-lg py-2 transition-colors no-underline block
                            ${isActive ? 'bg-green-50 text-[var(--rfd-green-brand)] font-semibold' : 'text-gray-600 hover:bg-gray-50'}
                          `}
                          style={{
                            paddingLeft: `${Math.max(12, (item.level - 2) * 12 + 12)}px`,
                            paddingRight: '12px',
                            fontSize: item.level <= 2 ? '13px' : '12px',
                          }}
                        >
                          {item.text}
                        </a>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          </nav>
        </>
      )}
    </div>
  )
}

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronDown, List } from 'lucide-react'
import type { ToCItem, SiblingPage } from './GuideToC'

interface GuideToCMobileProps {
  items: ToCItem[]
  chapterTitle: string
  chapterSlug: string
  currentPage: number
  totalPages: number
  pages: SiblingPage[]
  currentSlug: string
}

export default function GuideToCMobile({
  items,
  chapterTitle,
  chapterSlug,
  currentPage,
  totalPages,
  pages,
  currentSlug,
}: GuideToCMobileProps) {
  const [open, setOpen] = useState(false)

  const handleClick = (id: string) => {
    const el = document.getElementById(id)
    if (!el) return
    const offset = 80
    const top = el.getBoundingClientRect().top + window.scrollY - offset
    window.scrollTo({ top, behavior: 'smooth' })
    setOpen(false)
  }

  if (items.length === 0) return null

  return (
    <div className="lg:hidden mb-6" style={{ borderRadius: '12px', border: '1px solid var(--rfd-border)', background: '#fff', overflow: 'hidden' }}>
      {/* Header / trigger */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 transition-colors"
        style={{ background: open ? '#f8f5f0' : '#fff' }}
        aria-expanded={open}
      >
        <div className="flex items-center gap-2">
          <List size={15} style={{ color: 'var(--rfd-green-brand)', flexShrink: 0 }} />
          <span
            className="font-mono text-[11px] uppercase tracking-widest font-semibold"
            style={{ color: 'var(--rfd-text-mid)' }}
          >
            Menü
          </span>
          {totalPages > 1 && (
            <span
              className="font-mono text-[10px]"
              style={{ color: 'var(--rfd-text-muted)' }}
            >
              — Seite {currentPage}/{totalPages}
            </span>
          )}
        </div>
        <ChevronDown
          size={16}
          style={{
            color: 'var(--rfd-text-muted)',
            transition: 'transform 0.2s',
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
            flexShrink: 0,
          }}
        />
      </button>

      {/* Collapsible content */}
      <div
        style={{
          maxHeight: open ? '400px' : '0',
          overflow: 'hidden',
          transition: 'max-height 0.3s ease',
        }}
      >
        <div style={{ borderTop: '1px solid var(--rfd-border)' }}>
          <div className="px-4 py-2">
            <p
              className="font-heading font-semibold text-xs mb-3 mt-1"
              style={{ color: 'var(--rfd-text-dark)' }}
            >
              {chapterTitle}
            </p>
            {/* Sibling Pages */}
            <p
              className="font-mono text-[10px] uppercase tracking-widest mb-3"
              style={{ color: 'var(--rfd-text-muted)' }}
            >
              Kapitel-Seiten
            </p>
            <nav className="flex flex-col gap-1 mb-6">
              {pages.map((page) => {
                const isActive = page.slug === currentSlug
                return (
                  <Link
                    key={page.slug}
                    href={`/guide/${chapterSlug}/${page.slug}`}
                    className="text-left rounded-lg px-3 py-2 transition-colors flex items-center justify-between"
                    style={{
                      background: isActive ? '#f0faf5' : 'transparent',
                      border: isActive ? '1px solid #c8e6c9' : '1px solid transparent',
                      textDecoration: 'none'
                    }}
                  >
                    <span
                      style={{
                        fontSize: '13px',
                        fontWeight: isActive ? 600 : 400,
                        color: isActive ? 'var(--rfd-green-brand)' : 'var(--rfd-text-dark)',
                      }}
                    >
                      {page.title}
                    </span>
                    {isActive && (
                      <span className="text-[10px]" style={{ color: 'var(--rfd-green-brand)' }}>
                        ●
                      </span>
                    )}
                  </Link>
                )
              })}
            </nav>

            {/* Table of Contents */}
            {items.length > 0 && (
              <>
                <p
                  className="font-mono text-[10px] uppercase tracking-widest mb-3"
                  style={{ color: 'var(--rfd-text-muted)' }}
                >
                  Auf dieser Seite
                </p>
                <nav className="flex flex-col gap-0.5 pb-2">
                  {items.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleClick(item.id)}
                      className="text-left rounded-lg px-2 py-1.5 transition-colors hover:bg-[#f0faf5]"
                      style={{ paddingLeft: item.level === 3 ? '20px' : '8px' }}
                    >
                      <span
                        style={{
                          fontSize: item.level === 2 ? '13px' : '12px',
                          fontWeight: item.level === 2 ? 600 : 400,
                          color: 'var(--rfd-text-mid)',
                          lineHeight: 1.4,
                          display: 'block',
                        }}
                      >
                        {item.text}
                      </span>
                    </button>
                  ))}
                </nav>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

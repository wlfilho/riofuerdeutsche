'use client'

import { useState, useEffect, ReactNode, useRef } from 'react'
import type { ToCItem, SiblingPage } from './GuideToC'
import GuideToC from './GuideToC'
import GuideToCMobile from './GuideToCMobile'
import { ReadingProvider } from './ReadingContext'

interface GuideToCWrapperProps {
  items: ToCItem[]
  chapterTitle: string
  chapterSlug: string
  currentPage: number
  totalPages: number
  pages: SiblingPage[]
  currentSlug: string
  readPageIds: string[]
  children: ReactNode
}

export default function GuideToCWrapper({
  items,
  chapterTitle,
  chapterSlug,
  currentPage,
  totalPages,
  pages,
  currentSlug,
  readPageIds,
  children,
}: GuideToCWrapperProps) {
  const [activeId, setActiveId] = useState<string>(items[0]?.id ?? '')

  const mainRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (items.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        })
      },
      {
        root: mainRef.current,
        rootMargin: '-80px 0px -80% 0px',
        threshold: 0,
      }
    )

    items.forEach((item) => {
      const el = document.getElementById(item.id)
      if (el) observer.observe(el)
    })

    return () => observer.disconnect()
  }, [items])

  return (
    <ReadingProvider initialReadPageIds={readPageIds}>
      <GuideToCMobile
        items={items}
        activeId={activeId}
        chapterTitle={chapterTitle}
        chapterSlug={chapterSlug}
        currentPage={currentPage}
        totalPages={totalPages}
        pages={pages}
        currentSlug={currentSlug}
      />

      <div
        className="mx-auto w-full h-[calc(100vh-80px)] flex flex-col md:flex-row gap-8 lg:gap-12 items-start overflow-hidden"
        style={{ maxWidth: '1080px' }}
      >
        <aside 
          className="hidden md:block w-[260px] shrink-0 self-start sticky top-0 h-[calc(100vh-80px)] overflow-y-auto py-8 pr-2 no-scrollbar"
        >
          <GuideToC
            items={items}
            activeId={activeId}
            chapterTitle={chapterTitle}
            chapterSlug={chapterSlug}
            currentPage={currentPage}
            totalPages={totalPages}
            pages={pages}
            currentSlug={currentSlug}
          />
        </aside>

        <main 
          ref={mainRef}
          className="flex-1 min-w-0 h-[calc(100vh-80px)] overflow-y-auto py-8 md:py-12 px-4 md:px-8 custom-scrollbar"
        >
          {children}
        </main>
      </div>
    </ReadingProvider>
  )
}

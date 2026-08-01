import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface NavItem {
  href: string
  label: string
  title: string
  isChapterTransition?: boolean
}

interface GuideNavProps {
  prev?: NavItem
  next?: NavItem
  isLastPage?: boolean
}

function NavCard({
  item,
  direction,
  chapterTransitionLabel,
}: {
  item: NavItem
  direction: 'prev' | 'next'
  chapterTransitionLabel: string
}) {
  const isPrev = direction === 'prev'
  return (
    <Link
      href={item.href}
      className="flex-1 flex flex-col gap-1 rounded-xl p-4 group transition-all duration-200"
      style={{
        border: '1px solid var(--rfd-border)',
        background: '#fff',
        textDecoration: 'none',
        alignItems: isPrev ? 'flex-start' : 'flex-end',
        minWidth: 0,
      }}
    >
      <div
        className="flex items-center gap-1.5"
        style={{ flexDirection: isPrev ? 'row' : 'row-reverse' }}
      >
        {isPrev ? (
          <ChevronLeft size={14} style={{ color: 'var(--rfd-text-muted)', flexShrink: 0 }} />
        ) : (
          <ChevronRight size={14} style={{ color: 'var(--rfd-text-muted)', flexShrink: 0 }} />
        )}
        <span
          className="font-mono text-[10px] uppercase tracking-widest"
          style={{ color: 'var(--rfd-text-muted)' }}
        >
          {item.label}
        </span>
      </div>
      <p
        className="font-heading font-semibold text-sm leading-snug group-hover:underline"
        style={{
          color: 'var(--rfd-text-dark)',
          textAlign: isPrev ? 'left' : 'right',
          textUnderlineOffset: '2px',
        }}
      >
        {item.title}
      </p>
      {item.isChapterTransition && (
        <span
          className="font-mono text-[9px] uppercase tracking-widest px-2 py-0.5 rounded-full"
          style={{ background: '#e8f5e9', color: '#2e7d32' }}
        >
          {chapterTransitionLabel}
        </span>
      )}
    </Link>
  )
}

export default async function GuideNav({ prev, next, isLastPage }: GuideNavProps) {
  if (!prev && !next && !isLastPage) return null

  const t = await getTranslations('public.dashboard.guideNav')

  return (
    <div
      className="mt-12 pt-8 flex gap-3 flex-col sm:flex-row"
      style={{ borderTop: '1px solid var(--rfd-border)' }}
    >
      {/* Previous */}
      <div className="flex-1 flex">
        {prev ? (
          <NavCard item={prev} direction="prev" chapterTransitionLabel={t('naechstesKapitel')} />
        ) : (
          <div className="flex-1" />
        )}
      </div>

      {/* Next */}
      <div className="flex-1 flex justify-end">
        {next ? (
          <NavCard item={next} direction="next" chapterTransitionLabel={t('naechstesKapitel')} />
        ) : isLastPage ? (
          <div
            className="flex-1 flex flex-col gap-1 rounded-xl p-4"
            style={{
              border: '1px solid var(--rfd-border)',
              background: '#f8f5f0',
              alignItems: 'flex-end',
            }}
          >
            <span
              className="font-mono text-[10px] uppercase tracking-widest"
              style={{ color: 'var(--rfd-text-muted)' }}
            >
              {t('endeDesGuides')}
            </span>
            <p
              className="font-heading font-semibold text-sm"
              style={{ color: 'var(--rfd-text-dark)', textAlign: 'right' }}
            >
              {t('allesGelesen')}
            </p>
          </div>
        ) : null}
      </div>
    </div>
  )
}

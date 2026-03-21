import { redirect } from 'next/navigation'
import { Lock, ChevronDown, List } from 'lucide-react'
import Link from 'next/link'

import type { ToCItem, SiblingPage } from '@/components/guide/GuideToC'
import { createClient } from '@/utils/supabase/server'
import { getMembershipAccess } from '@/lib/membership'
import { contentToHtml } from '@/lib/guideContent'
import GuidePageContent, { extractToCItems, injectHeadingIds } from '@/components/guide/GuidePageContent'

import GuideToC from '@/components/guide/GuideToC'
import GuideToCMobile from '@/components/guide/GuideToCMobile'
import GuideNav from '@/components/guide/GuideNav'
import GuideCTA from '@/components/guide/GuideCTA'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ chapterSlug: string; pageSlug: string }>
}

export default async function GuideChapterPagePage({ params }: PageProps) {
  const { chapterSlug, pageSlug } = await params

  // ── Auth & membership ──────────────────────────────────────────────────────
  const access = await getMembershipAccess()
  if (!access.isAuthenticated) {
    redirect(`/login?redirect=/guide/${chapterSlug}/${pageSlug}`)
  }

  const supabase = await createClient()

  // ── Fetch chapter ──────────────────────────────────────────────────────────
  const { data: chapter } = await supabase
    .from('guide_chapters')
    .select('id, slug, title, subtitle, icon, sort_order, edition, is_free, status')
    .eq('slug', chapterSlug)
    .eq('status', 'published')
    .single()

  if (!chapter) redirect('/guide')

  // ── Fetch all pages of this chapter (for ToC + navigation) ─────────────────
  const { data: chapterPages } = await supabase
    .from('guide_pages')
    .select('id, slug, title, subtitle, sort_order, is_free, status')
    .eq('chapter_id', chapter.id)
    .eq('status', 'published')
    .order('sort_order')

  const pages = chapterPages ?? []

  // ── Fetch current page content ─────────────────────────────────────────────
  const { data: currentPage } = await supabase
    .from('guide_pages')
    .select('id, slug, title, subtitle, content, sort_order, is_free, status')
    .eq('chapter_id', chapter.id)
    .eq('slug', pageSlug)
    .eq('status', 'published')
    .single()

  if (!currentPage) redirect(`/guide`)

  // ── Access control ─────────────────────────────────────────────────────────
  const isPremiumUser = access.isPremium
  const pageIsFree = Boolean(currentPage.is_free) || Boolean(chapter.is_free)

  if (!isPremiumUser && !pageIsFree) {
    redirect('/guide?upgrade=true')
  }

  // ── Fetch all chapters + their published pages (for cross-chapter nav) ──────
  const { data: allChaptersRaw } = await supabase
    .from('guide_chapters')
    .select('id, slug, title, sort_order, is_free')
    .eq('status', 'published')
    .eq('edition', chapter.edition)
    .order('sort_order')

  const allChapters = allChaptersRaw ?? []

  // Build flat list of all pages across all chapters for prev/next navigation
  type FlatPage = {
    chapterSlug: string
    chapterTitle: string
    pageSlug: string
    pageTitle: string
    isChapterTransition: boolean
    is_free: boolean
  }

  // We need pages for each chapter — fetch in parallel
  const chapterIds = allChapters.map((c) => c.id)
  const { data: allPagesRaw } = await supabase
    .from('guide_pages')
    .select('id, chapter_id, slug, title, sort_order, is_free, status')
    .in('chapter_id', chapterIds)
    .eq('status', 'published')
    .order('sort_order')

  const allPages = allPagesRaw ?? []

  // Build flat ordered list
  const flatPages: FlatPage[] = []
  for (const ch of allChapters) {
    const chPages = allPages
      .filter((p) => p.chapter_id === ch.id)
      .sort((a, b) => a.sort_order - b.sort_order)
    for (let i = 0; i < chPages.length; i++) {
      flatPages.push({
        chapterSlug: ch.slug,
        chapterTitle: ch.title,
        pageSlug: chPages[i].slug,
        pageTitle: chPages[i].title,
        isChapterTransition: i === 0 && ch.slug !== chapterSlug,
        is_free: chPages[i].is_free || ch.is_free,
      })
    }
  }

  const currentFlatIndex = flatPages.findIndex(
    (p) => p.chapterSlug === chapterSlug && p.pageSlug === pageSlug
  )

  const prevFlat = currentFlatIndex > 0 ? flatPages[currentFlatIndex - 1] : undefined
  const nextFlat =
    currentFlatIndex !== -1 && currentFlatIndex < flatPages.length - 1
      ? flatPages[currentFlatIndex + 1]
      : undefined
  const isLastPage = currentFlatIndex === flatPages.length - 1

  // ── Pagination within this chapter ────────────────────────────────────────
  const sortedChapterPages = [...pages].sort((a, b) => a.sort_order - b.sort_order)
  const pageIndex = sortedChapterPages.findIndex((p) => p.slug === pageSlug)
  const currentPageNumber = pageIndex + 1
  const totalPagesInChapter = sortedChapterPages.length

  // ── ToC items from content ─────────────────────────────────────────────────
  const rawHtml = contentToHtml(currentPage.content)
  const tocItems = extractToCItems(rawHtml)
  const htmlWithIds = injectHeadingIds(rawHtml, tocItems)

  // ── Build nav items ────────────────────────────────────────────────────────
  const prevNav = prevFlat
    ? {
        href: `/guide/${prevFlat.chapterSlug}/${prevFlat.pageSlug}`,
        label: 'Vorherige Seite',
        title: prevFlat.pageTitle,
        isChapterTransition: prevFlat.chapterSlug !== chapterSlug,
      }
    : undefined

  const nextNav = nextFlat
    ? {
        href: `/guide/${nextFlat.chapterSlug}/${nextFlat.pageSlug}`,
        label: 'Nächste Seite',
        title: nextFlat.pageTitle,
        isChapterTransition: nextFlat.chapterSlug !== chapterSlug,
      }
    : undefined

  return (
    <div className="w-full px-4 md:px-8" style={{ background: 'var(--rfd-cream)' }}>
      {/* Centered container */}
      <div
        className="mx-auto w-full py-8 md:py-12 flex gap-10 items-start"
        style={{ maxWidth: '1080px' }}
      >
        {/* ── Desktop Sidebar ToC ────────────────────────────────────────── */}
        <GuideToC
          items={tocItems}
          chapterTitle={chapter.title}
          chapterSlug={chapterSlug}
          currentPage={currentPageNumber}
          totalPages={totalPagesInChapter}
          pages={pages.map(p => ({ title: p.title, slug: p.slug, is_free: p.is_free }))}
          currentSlug={pageSlug}
        />

        {/* ── Main content column ───────────────────────────────────────── */}
        <main className="flex-1 min-w-0">
          {/* Mobile ToC accordion */}
          <GuideToCMobile
            items={tocItems}
            chapterTitle={chapter.title}
            chapterSlug={chapterSlug}
            currentPage={currentPageNumber}
            totalPages={totalPagesInChapter}
            pages={pages.map(p => ({ title: p.title, slug: p.slug, is_free: p.is_free }))}
            currentSlug={pageSlug}
          />

          {/* Breadcrumb */}
          <nav
            className="flex items-center gap-1.5 mb-6 flex-wrap"
            aria-label="Breadcrumb"
          >
            <Link
              href="/guide"
              className="font-mono text-[11px] hover:underline"
              style={{ color: 'var(--rfd-text-muted)', textUnderlineOffset: '2px' }}
            >
              Rio-Guide
            </Link>
            <span className="font-mono text-[11px]" style={{ color: 'var(--rfd-border)' }}>/</span>
            <span className="font-mono text-[11px]" style={{ color: 'var(--rfd-text-muted)' }}>
              {chapter.icon} {chapter.title}
            </span>
            <span className="font-mono text-[11px]" style={{ color: 'var(--rfd-border)' }}>/</span>
            <span className="font-mono text-[11px] font-semibold" style={{ color: 'var(--rfd-text-dark)' }}>
              {currentPage.title}
            </span>
          </nav>

          {/* Page header */}
          <header className="mb-8">
            {/* Free badge or page label */}
            {pageIsFree && !isPremiumUser && (
              <span
                className="inline-flex items-center gap-1 font-mono text-[9px] uppercase tracking-widest px-3 py-1 rounded-full mb-3"
                style={{ background: '#e8f5e9', color: '#2e7d32' }}
              >
                Kostenlos
              </span>
            )}

            <h1
              className="font-heading font-extrabold leading-tight mb-2"
              style={{ fontSize: 'clamp(24px, 4vw, 36px)', color: 'var(--rfd-text-dark)' }}
            >
              {currentPage.title}
            </h1>

            {currentPage.subtitle && (
              <p
                className="text-base leading-relaxed"
                style={{ color: 'var(--rfd-text-mid)', maxWidth: '640px' }}
              >
                {currentPage.subtitle}
              </p>
            )}

            <div
              className="mt-5"
              style={{ height: '1px', background: 'var(--rfd-border)' }}
            />
          </header>

          {/* Content */}
          <GuidePageContent html={htmlWithIds} />

          {/* Navigation */}
          <GuideNav prev={prevNav} next={nextNav} isLastPage={isLastPage} />

          {/* Contextual CTA */}
          <GuideCTA chapterSlug={chapterSlug} />
        </main>
      </div>
    </div>
  )
}

import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

interface PageProps {
  params: Promise<{ chapterSlug: string }>
}

export default async function GuideChapterIndexPage({ params }: PageProps) {
  const { chapterSlug } = await params
  const supabase = await createClient()

  // 1. Encontrar o capítulo pelo slug
  const { data: chapter } = await supabase
    .from('guide_chapters')
    .select('*')
    .eq('slug', chapterSlug)
    .eq('status', 'published')
    .single()

  if (!chapter) {
    if (chapterSlug === 'upgrade') {
      redirect('/dashboard?upgrade=true&r=1')
    }
    redirect('/dashboard')
  }

  // 2. Encontrar a primeira página publicada desse capítulo
  const { data: firstPage } = await supabase
    .from('guide_pages')
    .select('slug, is_free')
    .eq('chapter_id', chapter.id)
    .eq('status', 'published')
    .order('sort_order', { ascending: true })
    .limit(1)
    .single()

  if (firstPage) {
    redirect(`/guide/${chapterSlug}/${firstPage.slug}`)
  }

  // Se não houver páginas, volta para a home do guide
  redirect('/dashboard')
}

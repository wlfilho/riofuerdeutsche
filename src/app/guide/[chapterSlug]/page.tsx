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
    .select('id')
    .eq('slug', chapterSlug)
    .eq('status', 'published')
    .single()

  if (!chapter) {
    // Se o capítulo for 'sicherheit', mas o novo slug for 'sicherheit-rio', 
    // podemos fazer um redirect especial aqui se quisermos, 
    // ou apenas voltar para o /guide
    if (chapterSlug === 'sicherheit') {
      redirect('/guide/sicherheit-rio')
    }
    if (chapterSlug === 'upgrade') {
      redirect('/guide?upgrade=true')
    }
    redirect('/guide')
  }

  // 2. Encontrar a primeira página publicada desse capítulo
  const { data: firstPage } = await supabase
    .from('guide_pages')
    .select('slug')
    .eq('chapter_id', chapter.id)
    .eq('status', 'published')
    .order('sort_order', { ascending: true })
    .limit(1)
    .single()

  if (firstPage) {
    redirect(`/guide/${chapterSlug}/${firstPage.slug}`)
  }

  // Se não houver páginas, volta para a home do guide
  redirect('/guide')
}

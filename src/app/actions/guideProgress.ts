'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function markPageAsRead(pageId: string) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Unauthorized' }

  const { data, error } = await supabase
    .from('user_page_progress')
    .upsert({ 
      user_id: user.id, 
      page_id: pageId, 
      read_at: new Date().toISOString() 
    }, { onConflict: 'user_id,page_id' })
    .select('read_at')
    .single()

  if (error) {
    console.error('Error marking page as read:', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/guide', 'layout')
  return { success: true, read_at: data.read_at }
}

export async function markPageAsUnread(pageId: string) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Unauthorized' }

  const { error } = await supabase
    .from('user_page_progress')
    .delete()
    .match({ user_id: user.id, page_id: pageId })

  if (error) {
    console.error('Error marking page as unread:', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/guide', 'layout')
  return { success: true }
}

/**
 * Retorna o progresso de um capítulo para o usuário atual.
 */
export async function getChapterProgress(chapterId: string) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { total: 0, read: 0, readPageIds: [], readAtMap: {} }

  // Buscamos todas as páginas do capítulo
  const { data: pages } = await supabase
    .from('guide_pages')
    .select('id')
    .eq('chapter_id', chapterId)
    .eq('status', 'published')

  const total = pages?.length ?? 0
  const pageIds = pages?.map(p => p.id) ?? []

  if (total === 0) return { total: 0, read: 0, readPageIds: [], readAtMap: {} }

  // Buscamos o progresso do usuário para estas páginas
  const { data: progress } = await supabase
    .from('user_page_progress')
    .select('page_id, read_at')
    .in('page_id', pageIds)
    .eq('user_id', user.id)

  const readPageIds = progress?.map(p => p.page_id) ?? []
  const readAtMap: Record<string, string> = {}
  progress?.forEach(p => {
    readAtMap[p.page_id] = p.read_at
  })

  const read = readPageIds.length

  return { total, read, readPageIds, readAtMap }
}

/**
 * Retorna o progresso de todos os capítulos.
 * Útil para a página de overview /guide.
 */
export async function getAllProgress() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return {}

  // 1. Buscamos todas as páginas publicadas para saber o total por capítulo
  const { data: allPages } = await supabase
    .from('guide_pages')
    .select('id, chapter_id')
    .eq('status', 'published')

  // 2. Buscamos o progresso do usuário
  const { data: userProgress } = await supabase
    .from('user_page_progress')
    .select('page_id')
    .eq('user_id', user.id)

  const readPageIds = new Set(userProgress?.map(p => p.page_id) ?? [])

  // 3. Calculamos o progresso por capítulo
  const progressByChapter: Record<string, { total: number, read: number }> = {}

  allPages?.forEach(p => {
    if (!progressByChapter[p.chapter_id]) {
      progressByChapter[p.chapter_id] = { total: 0, read: 0 }
    }
    progressByChapter[p.chapter_id].total += 1
    if (readPageIds.has(p.id)) {
      progressByChapter[p.chapter_id].read += 1
    }
  })

  return progressByChapter
}

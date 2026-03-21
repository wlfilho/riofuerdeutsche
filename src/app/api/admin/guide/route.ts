// src/app/api/admin/guide/route.ts
import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

// Helper para verificar se é admin
async function verifyAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { authorized: false, supabase };

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  return { authorized: profile?.role === 'admin', supabase };
}

// GET — Listar todos os capítulos (incluindo drafts)
export async function GET() {
  const { authorized, supabase } = await verifyAdmin();
  if (!authorized) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
  }

  const { data: chapters, error } = await supabase
    .from('guide_chapters')
    .select('id, slug, title, subtitle, icon, sort_order, edition, is_free, status, created_at, updated_at, guide_pages(count)')
    .order('sort_order', { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Flatten page count from nested relation
  const chaptersWithCount = (chapters ?? []).map((ch: any) => ({
    ...ch,
    page_count: ch.guide_pages?.[0]?.count ?? 0,
    guide_pages: undefined,
  }));

  return NextResponse.json({ chapters: chaptersWithCount });
}

// POST — Criar novo capítulo
export async function POST(request: NextRequest) {
  const { authorized, supabase } = await verifyAdmin();
  if (!authorized) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
  }

  const body = await request.json();
  const { slug, title, subtitle, icon, content, edition, is_free, status } = body;

  if (!slug || !title) {
    return NextResponse.json(
      { error: 'slug and title are required' },
      { status: 400 }
    );
  }

  // Buscar o próximo sort_order
  const { data: lastChapter } = await supabase
    .from('guide_chapters')
    .select('sort_order')
    .order('sort_order', { ascending: false })
    .limit(1)
    .single();

  const nextOrder = (lastChapter?.sort_order || 0) + 1;

  const { data: chapter, error } = await supabase
    .from('guide_chapters')
    .insert({
      slug,
      title,
      subtitle: subtitle || null,
      icon: icon || '📄',
      content: content || '',
      sort_order: nextOrder,
      edition: edition || 1,
      is_free: is_free || false,
      status: status || 'draft',
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ chapter }, { status: 201 });
}

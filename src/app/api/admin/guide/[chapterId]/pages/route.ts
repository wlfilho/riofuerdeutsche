// GET  /api/admin/guide/[chapterId]/pages  — list pages for a chapter
// POST /api/admin/guide/[chapterId]/pages  — create new page

import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

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

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ chapterId: string }> }
) {
  const { chapterId } = await params;
  const { authorized, supabase } = await verifyAdmin();
  if (!authorized) return NextResponse.json({ error: 'Not authorized' }, { status: 403 });

  const { data: pages, error } = await supabase
    .from('guide_pages')
    .select('id, chapter_id, slug, title, subtitle, sort_order, is_free, status, created_at, updated_at')
    .eq('chapter_id', chapterId)
    .order('sort_order', { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ pages });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ chapterId: string }> }
) {
  const { chapterId } = await params;
  const { authorized, supabase } = await verifyAdmin();
  if (!authorized) return NextResponse.json({ error: 'Not authorized' }, { status: 403 });

  const body = await req.json();
  const { slug, title, subtitle, content, sort_order, is_free, status } = body;

  if (!slug || !title) {
    return NextResponse.json({ error: 'slug and title are required' }, { status: 400 });
  }

  // If no sort_order provided, append after last
  let order = sort_order;
  if (order === undefined || order === null) {
    const { data: last } = await supabase
      .from('guide_pages')
      .select('sort_order')
      .eq('chapter_id', chapterId)
      .order('sort_order', { ascending: false })
      .limit(1)
      .single();
    order = (last?.sort_order ?? 0) + 1;
  }

  const { data: page, error } = await supabase
    .from('guide_pages')
    .insert({
      chapter_id: chapterId,
      slug,
      title,
      subtitle: subtitle || null,
      content: content || '',
      sort_order: order,
      is_free: is_free ?? false,
      status: status ?? 'draft',
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ page }, { status: 201 });
}

// GET    /api/admin/guide/pages/[pageId]  — get page by id
// PATCH  /api/admin/guide/pages/[pageId]  — update page
// DELETE /api/admin/guide/pages/[pageId]  — delete page

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
  { params }: { params: Promise<{ pageId: string }> }
) {
  const { pageId } = await params;
  const { authorized, supabase } = await verifyAdmin();
  if (!authorized) return NextResponse.json({ error: 'Not authorized' }, { status: 403 });

  const { data: page, error } = await supabase
    .from('guide_pages')
    .select('*')
    .eq('id', pageId)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 404 });

  return NextResponse.json({ page });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ pageId: string }> }
) {
  const { pageId } = await params;
  const { authorized, supabase } = await verifyAdmin();
  if (!authorized) return NextResponse.json({ error: 'Not authorized' }, { status: 403 });

  const body = await req.json();
  const { slug, title, subtitle, content, sort_order, is_free, status } = body;

  const updates: Record<string, any> = { updated_at: new Date().toISOString() };
  if (slug !== undefined) updates.slug = slug;
  if (title !== undefined) updates.title = title;
  if (subtitle !== undefined) updates.subtitle = subtitle || null;
  if (content !== undefined) updates.content = content;
  if (sort_order !== undefined) updates.sort_order = sort_order;
  if (is_free !== undefined) updates.is_free = is_free;
  if (status !== undefined) updates.status = status;

  const { data: page, error } = await supabase
    .from('guide_pages')
    .update(updates)
    .eq('id', pageId)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ page });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ pageId: string }> }
) {
  const { pageId } = await params;
  const { authorized, supabase } = await verifyAdmin();
  if (!authorized) return NextResponse.json({ error: 'Not authorized' }, { status: 403 });

  const { error } = await supabase
    .from('guide_pages')
    .delete()
    .eq('id', pageId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}

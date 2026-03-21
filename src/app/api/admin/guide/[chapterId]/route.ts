// src/app/api/admin/guide/[chapterId]/route.ts
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

// GET — Buscar capítulo por ID (com conteúdo completo)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ chapterId: string }> }
) {
  const { authorized, supabase } = await verifyAdmin();
  if (!authorized) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
  }

  const { chapterId } = await params;

  const { data: chapter, error } = await supabase
    .from('guide_chapters')
    .select('*')
    .eq('id', chapterId)
    .single();

  if (error || !chapter) {
    return NextResponse.json({ error: 'Chapter not found' }, { status: 404 });
  }

  return NextResponse.json({ chapter });
}

// PATCH — Atualizar capítulo
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ chapterId: string }> }
) {
  const { authorized, supabase } = await verifyAdmin();
  if (!authorized) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
  }

  const { chapterId } = await params;
  const body = await request.json();

  const allowedFields = [
    'slug', 'title', 'subtitle', 'icon', 'content',
    'sort_order', 'edition', 'is_free', 'status'
  ];

  const updateData: Record<string, unknown> = {};
  for (const field of allowedFields) {
    if (body[field] !== undefined) {
      updateData[field] = body[field];
    }
  }

  const { data: chapter, error } = await supabase
    .from('guide_chapters')
    .update(updateData)
    .eq('id', chapterId)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ chapter });
}

// DELETE — Deletar capítulo
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ chapterId: string }> }
) {
  const { authorized, supabase } = await verifyAdmin();
  if (!authorized) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
  }

  const { chapterId } = await params;

  const { error } = await supabase
    .from('guide_chapters')
    .delete()
    .eq('id', chapterId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

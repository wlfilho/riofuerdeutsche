// src/app/api/guide/chapters/[slug]/route.ts
import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const supabase = await createClient();
  const { slug } = await params;

  // Verificar autenticação
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  // Buscar capítulo
  const { data: chapter, error } = await supabase
    .from('guide_chapters')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .single();

  if (error || !chapter) {
    return NextResponse.json({ error: 'Chapter not found' }, { status: 404 });
  }

  // Verificar acesso: se não é gratuito, precisa ser premium ou admin
  if (!chapter.is_free) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, premium_until')
      .eq('id', user.id)
      .single();

    const role = profile?.role;
    const isPremium =
      role === 'admin' ||
      (role === 'premium' &&
        (!profile?.premium_until ||
          new Date(profile.premium_until) > new Date()));

    if (!isPremium) {
      return NextResponse.json(
        { error: 'Premium required', upgrade: true },
        { status: 403 }
      );
    }
  }

  return NextResponse.json({ chapter });
}

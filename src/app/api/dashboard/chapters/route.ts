// src/app/api/dashboard/chapters/route.ts
import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

// GET — Listar capítulos publicados (sem conteúdo, só metadados)
export async function GET() {
  const supabase = await createClient();

  const { data: chapters, error } = await supabase
    .from('guide_chapters')
    .select('id, slug, title, subtitle, icon, sort_order, edition, is_free')
    .eq('status', 'published')
    .order('sort_order', { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ chapters });
}

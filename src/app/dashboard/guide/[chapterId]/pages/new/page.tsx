import { getMembershipAccess } from '@/lib/membership';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import GuidePageEditor from '@/components/admin/GuidePageEditor';

export const metadata = { title: 'Neue Seite erstellen — Admin' };

interface PageProps {
  params: Promise<{ chapterId: string }>;
}

export default async function NewGuidePage({ params }: PageProps) {
  const access = await getMembershipAccess();
  if (!access.isAdmin) redirect('/');

  const { chapterId } = await params;

  const supabase = await createClient();
  const { data: chapter } = await supabase
    .from('guide_chapters')
    .select('id, slug, title')
    .eq('id', chapterId)
    .single();

  if (!chapter) redirect('/dashboard/guide');

  return (
    <GuidePageEditor
      chapterId={chapterId}
      chapterTitle={chapter.title}
      chapterSlug={chapter.slug}
    />
  );
}

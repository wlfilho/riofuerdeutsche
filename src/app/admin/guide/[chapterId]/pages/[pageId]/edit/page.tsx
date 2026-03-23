import { getMembershipAccess } from '@/lib/membership';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import GuidePageEditor from '@/components/admin/GuidePageEditor';

export const metadata = { title: 'Seite bearbeiten — Admin' };

interface PageProps {
  params: Promise<{ chapterId: string; pageId: string }>;
}

export default async function EditGuidePage({ params }: PageProps) {
  const access = await getMembershipAccess();
  if (!access.isAdmin) redirect('/');

  const { chapterId, pageId } = await params;

  const supabase = await createClient();
  const { data: chapter } = await supabase
    .from('guide_chapters')
    .select('id, slug, title')
    .eq('id', chapterId)
    .single();

  if (!chapter) redirect('/admin/guide');

  return (
    <GuidePageEditor
      chapterId={chapterId}
      chapterTitle={chapter.title}
      chapterSlug={chapter.slug}
      pageId={pageId}
    />
  );
}

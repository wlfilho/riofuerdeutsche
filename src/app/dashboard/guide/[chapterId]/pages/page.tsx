import { getMembershipAccess } from '@/lib/membership';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import GuidePagesList from '@/components/admin/GuidePagesList';

export const metadata = { title: 'Seiten verwalten — Admin' };

interface PageProps {
  params: Promise<{ chapterId: string }>;
}

export default async function GuidePagesListPage({ params }: PageProps) {
  const access = await getMembershipAccess();
  if (!access.isAdmin) redirect('/');

  const { chapterId } = await params;

  const supabase = await createClient();
  const { data: chapter } = await supabase
    .from('guide_chapters')
    .select('id, slug, title, icon')
    .eq('id', chapterId)
    .single();

  if (!chapter) redirect('/dashboard/guide');

  return <GuidePagesList chapterId={chapterId} chapterTitle={chapter.title} chapterIcon={chapter.icon} chapterSlug={chapter.slug} />;
}

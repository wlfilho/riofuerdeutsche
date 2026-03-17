// src/app/dashboard/guide/[id]/edit/page.tsx
import { getMembershipAccess } from '@/lib/membership';
import { redirect } from 'next/navigation';
import GuideChapterEditor from '@/components/admin/GuideChapterEditor';

export const metadata = { title: 'Kapitel bearbeiten — Admin' };

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditChapterPage({ params }: PageProps) {
  const access = await getMembershipAccess();
  if (!access.isAdmin) redirect('/');
  
  const { id } = await params;
  
  return <GuideChapterEditor chapterId={id} />;
}

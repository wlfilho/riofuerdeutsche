// src/app/admin/guide/new/page.tsx
import { getMembershipAccess } from '@/lib/membership';
import { redirect } from 'next/navigation';
import GuideChapterEditor from '@/components/admin/GuideChapterEditor';

export const metadata = { title: 'Neues Kapitel — Admin' };

export default async function NewChapterPage() {
  const access = await getMembershipAccess();
  if (!access.isAdmin) redirect('/');
  return <GuideChapterEditor />;
}

// src/app/admin/guide/page.tsx
import { getMembershipAccess } from '@/lib/membership';
import { redirect } from 'next/navigation';
import GuideChaptersList from '@/components/admin/GuideChaptersList';

export const metadata = {
  title: 'Guide verwalten — Admin Dashboard',
};

export default async function GuideAdminPage() {
  const access = await getMembershipAccess();
  if (!access.isAdmin) redirect('/');

  return <GuideChaptersList />;
}

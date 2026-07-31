// src/app/admin/users/page.tsx
import { getTranslations } from 'next-intl/server';
import AdminUsersCRUD from '@/components/admin/AdminUsersCRUD';

export async function generateMetadata() {
  const t = await getTranslations('admin.usuarios');
  return { title: t('metaTitle') };
}

export default function UsersPage() {
  return <AdminUsersCRUD />;
}

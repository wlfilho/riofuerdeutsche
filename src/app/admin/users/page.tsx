// src/app/admin/users/page.tsx
import { getAdminTranslations } from '@/i18n/admin';
import AdminUsersCRUD from '@/components/admin/AdminUsersCRUD';

export async function generateMetadata() {
  const t = await getAdminTranslations('admin.usuarios');
  return { title: t('metaTitle') };
}

export default function UsersPage() {
  return <AdminUsersCRUD />;
}

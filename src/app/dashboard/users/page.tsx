// src/app/dashboard/users/page.tsx
import AdminUsersCRUD from '@/components/admin/AdminUsersCRUD';

export const metadata = {
  title: 'Benutzer verwalten — Admin Dashboard',
};

export default function UsersPage() {
  return <AdminUsersCRUD />;
}

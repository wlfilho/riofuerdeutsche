import { getMembershipAccess } from '@/lib/membership';
import { redirect } from 'next/navigation';
import AdminDashboard from '@/components/admin/AdminDashboard';

export const metadata = {
  title: 'Admin Dashboard — Rio für Deutsche',
};

export default async function DashboardPage() {
  const access = await getMembershipAccess();

  if (!access.isAdmin) {
    redirect('/');
  }

  return <AdminDashboard />;
}

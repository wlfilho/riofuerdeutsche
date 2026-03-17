// src/app/dashboard/layout.tsx
import { getMembershipAccess } from '@/lib/membership';
import { redirect } from 'next/navigation';
import AdminSidebar from '@/components/admin/AdminSidebar';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const access = await getMembershipAccess();

  if (!access.isAdmin) {
    redirect('/');
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar fixa */}
      <AdminSidebar />

      {/* Conteúdo principal */}
      <main className="flex-1 min-w-0">
        {children}
      </main>
    </div>
  );
}

// src/app/admin/layout.tsx
import { getMembershipAccess } from '@/lib/membership';
import { redirect } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { adminLocale, getAdminMessages } from '@/i18n/admin';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const access = await getMembershipAccess();

  if (!access.isAdmin) {
    redirect('/');
  }

  // Provider próprio do admin, com locale e mensagens explícitos. Sem isso, os
  // client components herdariam o locale resolvido por request — que no edge da
  // Vercel cai em `de` (catálogo vazio) e renderiza as chaves cruas.
  const messages = await getAdminMessages();

  return (
    <NextIntlClientProvider locale={adminLocale} messages={messages}>
      <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
        {/* Topbar mobile + sidebar desktop */}
        <AdminSidebar />

        {/* Conteúdo principal */}
        <main className="flex-1 min-w-0">
          {children}
        </main>
      </div>
    </NextIntlClientProvider>
  );
}

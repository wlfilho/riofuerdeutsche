// src/app/guide/layout.tsx
import { getMembershipAccess } from '@/lib/membership';
import { redirect } from 'next/navigation';
import GuideSidebar from '@/components/guide/GuideSidebar';

export default async function GuideLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const access = await getMembershipAccess();

  // Se não está autenticado, middleware já redireciona,
  // mas double-check aqui
  if (!access.isAuthenticated) {
    redirect('/login?redirect=/guide');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto flex">
        {/* Sidebar com navegação dos capítulos */}
        <GuideSidebar access={access} />

        {/* Conteúdo principal */}
        <main className="flex-1 p-6 md:p-10">
          {children}
        </main>
      </div>
    </div>
  );
}

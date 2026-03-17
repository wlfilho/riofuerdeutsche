// src/app/guide/[slug]/page.tsx
import { getMembershipAccess } from '@/lib/membership';
import { redirect, notFound } from 'next/navigation';

// Conteúdo dos capítulos (futuramente pode vir de um CMS ou MDX)
const premiumChapters: Record<
  string,
  { title: string; icon: string; content: string }
> = {
  ankommen: {
    title: 'Ankommen in Rio',
    icon: '✈️',
    content: 'TODO: Conteúdo do capítulo Ankommen',
  },
  unterkunft: {
    title: 'Unterkunft',
    icon: '🏨',
    content: 'TODO: Conteúdo do capítulo Unterkunft',
  },
  transport: {
    title: 'Transport',
    icon: '🚇',
    content: 'TODO: Conteúdo do capítulo Transport',
  },
  sehenswuerdigkeiten: {
    title: 'Sehenswürdigkeiten',
    icon: '🏔️',
    content: 'TODO: Conteúdo do capítulo Sehenswürdigkeiten',
  },
};

export default async function PremiumChapterPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const chapter = premiumChapters[slug];

  if (!chapter) {
    notFound();
  }

  // Double-check de acesso (middleware já verifica, mas por segurança)
  const access = await getMembershipAccess();
  if (!access.isPremium) {
    redirect('/guide?upgrade=true');
  }

  return (
    <article className="max-w-3xl prose prose-gray">
      <h1>
        {chapter.icon} {chapter.title}
      </h1>

      {/* TODO: Substituir pelo conteúdo real de cada capítulo */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-yellow-800">
          <strong>🚧 In Arbeit:</strong> Dieses Kapitel wird gerade
          geschrieben. Du wirst automatisch benachrichtigt, sobald es
          fertig ist!
        </p>
      </div>
    </article>
  );
}

export function generateStaticParams() {
  return Object.keys(premiumChapters).map((slug) => ({ slug }));
}

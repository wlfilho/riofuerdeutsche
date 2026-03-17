// src/app/guide/[slug]/page.tsx
'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Link from 'next/link';

interface Chapter {
  id: string;
  slug: string;
  title: string;
  icon: string;
  content: string;
  is_free: boolean;
}

export default function GuideChapterPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const router = useRouter();
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchChapter = async () => {
      try {
        const res = await fetch(`/api/guide/chapters/${slug}`);
        const data = await res.json();

        if (res.status === 401) {
          router.push(`/login?returnTo=/guide/${slug}`);
          return;
        }

        if (res.status === 403 && data.upgrade) {
          router.push('/guide?upgrade=true');
          return;
        }

        if (!res.ok) {
          setError(data.error || 'Kapitel nicht gefunden');
          return;
        }

        setChapter(data.chapter);
      } catch (err) {
        setError('Fehler beim Laden des Kapitels');
      } finally {
        setLoading(false);
      }
    };

    fetchChapter();
  }, [slug, router]);

  if (loading) {
    return (
      <div className="max-w-3xl animate-pulse">
        <div className="h-10 bg-gray-200 rounded-lg w-3/4 mb-6" />
        <div className="space-y-4">
          <div className="h-4 bg-gray-100 rounded w-full" />
          <div className="h-4 bg-gray-100 rounded w-full" />
          <div className="h-4 bg-gray-100 rounded w-5/6" />
        </div>
      </div>
    );
  }

  if (error || !chapter) {
    return (
      <div className="max-w-3xl py-12 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Oops! {error || 'Kapitel nicht gefunden'}
        </h1>
        <Link
          href="/guide"
          className="text-green-600 font-semibold hover:underline"
        >
          Zurück zur Übersicht
        </Link>
      </div>
    );
  }

  return (
    <article className="max-w-3xl prose prose-gray prose-headings:text-gray-900 prose-p:text-gray-600 prose-strong:text-gray-900 prose-a:text-green-600 prose-img:rounded-xl">
      <h1>
        {chapter.icon} {chapter.title}
      </h1>

      <ReactMarkdown remarkPlugins={[remarkGfm]}>
        {chapter.content}
      </ReactMarkdown>

      {/* Se for o final de um capítulo gratuito e o usuário não for premium, mostrar CTA */}
      {chapter.is_free && (
        <div className="not-prose mt-12 p-6 bg-gradient-to-br from-green-50 to-yellow-50 rounded-2xl border border-green-200">
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            📖 Lust auf mehr?
          </h3>
          <p className="text-gray-600 mb-4">
            Im kompletten Rio-Guide findest du alle Kapitel, Insider-Tipps zu Unterkünften, Sicherheit und den besten Orten in Rio — alles an einem Ort.
          </p>
          <Link
            href="/guide?upgrade=true"
            className="inline-block px-6 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors"
          >
            Kompletten Guide freischalten — ab 9€
          </Link>
        </div>
      )}
    </article>
  );
}

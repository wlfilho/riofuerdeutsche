'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Page {
  id: string;
  chapter_id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  sort_order: number;
  is_free: boolean;
  status: 'draft' | 'published';
  updated_at: string;
}

interface Props {
  chapterId: string;
  chapterTitle: string;
  chapterIcon: string;
  chapterSlug: string;
}

export default function GuidePagesList({ chapterId, chapterTitle, chapterIcon, chapterSlug }: Props) {
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchPages = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/guide/${chapterId}/pages`);
      const data = await res.json();
      if (data.pages) setPages(data.pages);
    } catch {
      setMessage({ type: 'error', text: 'Fehler beim Laden.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPages();
  }, [chapterId]);

  const deletePage = async (page: Page) => {
    if (!confirm(`Seite "${page.title}" wirklich löschen?`)) return;
    try {
      const res = await fetch(`/api/admin/guide/pages/${page.id}`, { method: 'DELETE' });
      if (res.ok) {
        setMessage({ type: 'success', text: `"${page.title}" gelöscht.` });
        fetchPages();
      } else {
        setMessage({ type: 'error', text: 'Fehler beim Löschen.' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Netzwerkfehler.' });
    }
  };

  const toggleStatus = async (page: Page) => {
    const newStatus = page.status === 'published' ? 'draft' : 'published';
    try {
      const res = await fetch(`/api/admin/guide/pages/${page.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setMessage({ type: 'success', text: `"${page.title}" ist jetzt ${newStatus === 'published' ? 'veröffentlicht' : 'ein Entwurf'}.` });
        fetchPages();
      }
    } catch {
      setMessage({ type: 'error', text: 'Fehler.' });
    }
  };

  const movePage = async (index: number, direction: 'up' | 'down') => {
    const newPages = [...pages];
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= newPages.length) return;

    const tempOrder = newPages[index].sort_order;
    newPages[index].sort_order = newPages[swapIndex].sort_order;
    newPages[swapIndex].sort_order = tempOrder;
    [newPages[index], newPages[swapIndex]] = [newPages[swapIndex], newPages[index]];
    setPages(newPages);

    try {
      await fetch('/api/admin/guide/pages/reorder', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: newPages.map((p) => ({ id: p.id, sort_order: p.sort_order })),
        }),
      });
    } catch {
      fetchPages(); // rollback
    }
  };

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString('de-DE', {
      day: '2-digit', month: '2-digit', year: 'numeric',
    });

  const publishedCount = pages.filter((p) => p.status === 'published').length;
  const draftCount = pages.filter((p) => p.status === 'draft').length;

  return (
    <div className="p-6 md:p-10">
      <div className="max-w-5xl mx-auto">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-6 flex-wrap">
          <Link href="/dashboard" className="hover:text-gray-600">Dashboard</Link>
          <span>›</span>
          <Link href="/dashboard/guide" className="hover:text-gray-600">Guide</Link>
          <span>›</span>
          <span className="text-gray-700 font-medium">{chapterIcon} {chapterTitle}</span>
          <span>›</span>
          <span className="text-gray-500">Seiten</span>
        </div>

        {/* Header */}
        <div className="flex items-start justify-between mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              {chapterIcon} {chapterTitle}
            </h1>
            <p className="text-gray-500 mt-1 text-sm">
              {publishedCount} veröffentlicht · {draftCount} Entwürfe · {pages.length} gesamt
            </p>
          </div>
          <Link
            href={`/dashboard/guide/${chapterId}/pages/new`}
            className="px-4 py-2 bg-green-600 text-white font-semibold rounded-full text-sm hover:bg-green-700 transition-colors whitespace-nowrap"
          >
            + Neue Seite
          </Link>
        </div>

        {/* Message */}
        {message && (
          <div className={`mb-4 p-3 rounded-lg text-sm ${
            message.type === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {message.text}
          </div>
        )}

        {/* Pages List */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-400">Laden...</div>
          ) : pages.length === 0 ? (
            <div className="p-10 text-center">
              <p className="text-gray-400 mb-4">Noch keine Seiten in diesem Kapitel.</p>
              <Link
                href={`/dashboard/guide/${chapterId}/pages/new`}
                className="inline-block px-4 py-2 bg-green-600 text-white font-semibold rounded-full text-sm hover:bg-green-700 transition-colors"
              >
                Erste Seite erstellen
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {/* Table header */}
              <div className="grid grid-cols-[32px_1fr_120px_90px_100px] gap-3 px-4 py-2 bg-gray-50 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                <div />
                <div>Seite</div>
                <div>Zugang</div>
                <div>Status</div>
                <div className="text-right">Aktionen</div>
              </div>

              {pages.map((page, index) => (
                <div
                  key={page.id}
                  className="grid grid-cols-[32px_1fr_120px_90px_100px] gap-3 items-center px-4 py-3 hover:bg-gray-50 transition-colors"
                >
                  {/* Reorder */}
                  <div className="flex flex-col gap-0.5 items-center">
                    <button
                      onClick={() => movePage(index, 'up')}
                      disabled={index === 0}
                      className="text-gray-300 hover:text-gray-600 disabled:opacity-20 text-[10px] leading-none cursor-pointer"
                    >
                      ▲
                    </button>
                    <button
                      onClick={() => movePage(index, 'down')}
                      disabled={index === pages.length - 1}
                      className="text-gray-300 hover:text-gray-600 disabled:opacity-20 text-[10px] leading-none cursor-pointer"
                    >
                      ▼
                    </button>
                  </div>

                  {/* Title + meta */}
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 text-sm truncate">{page.title}</p>
                    <p className="text-[11px] text-gray-400 truncate">
                      /{page.slug} · {formatDate(page.updated_at)}
                    </p>
                  </div>

                  {/* Access badge */}
                  <div>
                    <span className={`inline-block px-2 py-0.5 text-[10px] font-bold rounded-full ${
                      page.is_free
                        ? 'bg-green-100 text-green-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {page.is_free ? 'Kostenlos' : 'Premium'}
                    </span>
                  </div>

                  {/* Status badge (clickable toggle) */}
                  <div>
                    <button
                      onClick={() => toggleStatus(page)}
                      className={`px-2 py-0.5 text-[10px] font-semibold rounded-full transition-colors cursor-pointer ${
                        page.status === 'published'
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                      }`}
                    >
                      {page.status === 'published' ? '● Live' : '○ Entwurf'}
                    </button>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 justify-end">
                    <Link
                      href={`/dashboard/guide/${chapterId}/pages/${page.id}/edit`}
                      className="px-2.5 py-1 text-[11px] font-medium bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      ✏️
                    </Link>
                    <button
                      onClick={() => deletePage(page)}
                      className="px-2 py-1 text-[11px] text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Back link */}
        <div className="mt-6">
          <Link href="/dashboard/guide" className="text-sm text-gray-400 hover:text-gray-600">
            ← Zurück zu den Kapiteln
          </Link>
        </div>
      </div>
    </div>
  );
}

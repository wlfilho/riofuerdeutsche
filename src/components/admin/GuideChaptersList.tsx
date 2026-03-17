// src/components/admin/GuideChaptersList.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Chapter {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  icon: string;
  sort_order: number;
  edition: number;
  is_free: boolean;
  status: 'draft' | 'published';
  updated_at: string;
}

export default function GuideChaptersList() {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const fetchChapters = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/guide');
      const data = await res.json();
      if (data.chapters) setChapters(data.chapters);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChapters();
  }, []);

  const toggleStatus = async (chapter: Chapter) => {
    const newStatus = chapter.status === 'published' ? 'draft' : 'published';
    try {
      const res = await fetch(`/api/admin/guide/${chapter.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setMessage({
          type: 'success',
          text: `"${chapter.title}" ist jetzt ${newStatus === 'published' ? 'veröffentlicht' : 'ein Entwurf'}.`,
        });
        fetchChapters();
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Fehler beim Aktualisieren.' });
    }
  };

  const deleteChapter = async (chapter: Chapter) => {
    if (!confirm(`Bist du sicher, dass du "${chapter.title}" löschen möchtest?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/guide/${chapter.id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setMessage({ type: 'success', text: `"${chapter.title}" gelöscht.` });
        fetchChapters();
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Fehler beim Löschen.' });
    }
  };

  // Mover capítulo para cima ou para baixo
  const moveChapter = async (index: number, direction: 'up' | 'down') => {
    const newChapters = [...chapters];
    const swapIndex = direction === 'up' ? index - 1 : index + 1;

    if (swapIndex < 0 || swapIndex >= newChapters.length) return;

    // Trocar sort_order
    const tempOrder = newChapters[index].sort_order;
    newChapters[index].sort_order = newChapters[swapIndex].sort_order;
    newChapters[swapIndex].sort_order = tempOrder;

    // Trocar posições no array
    [newChapters[index], newChapters[swapIndex]] = [
      newChapters[swapIndex],
      newChapters[index],
    ];

    setChapters(newChapters);

    // Salvar no banco
    try {
      await fetch('/api/admin/guide/reorder', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: newChapters.map((ch) => ({
            id: ch.id,
            sort_order: ch.sort_order,
          })),
        }),
      });
    } catch (error) {
      console.error('Reorder error:', error);
      fetchChapters(); // rollback
    }
  };

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  const publishedCount = chapters.filter((c) => c.status === 'published').length;
  const draftCount = chapters.filter((c) => c.status === 'draft').length;

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <Link
                href="/dashboard"
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                ← Dashboard
              </Link>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">
              📖 Guide verwalten
            </h1>
            <p className="text-gray-500 mt-1">
              {publishedCount} veröffentlicht · {draftCount} Entwürfe ·{' '}
              {chapters.length} gesamt
            </p>
          </div>
          <Link
            href="/dashboard/guide/new"
            className="px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
          >
            + Neues Kapitel
          </Link>
        </div>

        {/* Message */}
        {message && (
          <div
            className={`mb-4 p-3 rounded-lg text-sm ${
              message.type === 'success'
                ? 'bg-green-50 text-green-800 border border-green-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Chapters List */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-400">Laden...</div>
          ) : chapters.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              Noch keine Kapitel vorhanden.
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {chapters.map((chapter, index) => (
                <div
                  key={chapter.id}
                  className="flex items-center gap-4 px-4 py-3 hover:bg-gray-50"
                >
                  {/* Reorder Buttons */}
                  <div className="flex flex-col gap-0.5">
                    <button
                      onClick={() => moveChapter(index, 'up')}
                      disabled={index === 0}
                      className="text-gray-400 hover:text-gray-600 disabled:opacity-20 text-xs cursor-pointer"
                    >
                      ▲
                    </button>
                    <button
                      onClick={() => moveChapter(index, 'down')}
                      disabled={index === chapters.length - 1}
                      className="text-gray-400 hover:text-gray-600 disabled:opacity-20 text-xs cursor-pointer"
                    >
                      ▼
                    </button>
                  </div>

                  {/* Icon */}
                  <span className="text-2xl">{chapter.icon}</span>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-gray-900 truncate">
                        {chapter.title}
                      </p>
                      {chapter.is_free && (
                        <span className="px-1.5 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold rounded">
                          GRATIS
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 truncate">
                      /{chapter.slug} · Ed. {chapter.edition} · Aktualisiert{' '}
                      {formatDate(chapter.updated_at)}
                    </p>
                  </div>

                  {/* Status Badge */}
                  <button
                    onClick={() => toggleStatus(chapter)}
                    className={`px-2.5 py-1 text-xs font-semibold rounded-full transition-colors cursor-pointer ${
                      chapter.status === 'published'
                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                        : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                    }`}
                  >
                    {chapter.status === 'published' ? '● Live' : '○ Entwurf'}
                  </button>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/dashboard/guide/${chapter.id}/edit`}
                      className="px-3 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      ✏️ Bearbeiten
                    </Link>
                    <button
                      onClick={() => deleteChapter(chapter)}
                      className="px-2 py-1 text-xs text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

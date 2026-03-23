// src/components/admin/GuideChaptersList.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ChevronDown, 
  ChevronRight, 
  FileText, 
  Settings, 
  Plus, 
  MoreVertical, 
  GripVertical, 
  Trash2, 
  ExternalLink,
  ChevronUp
} from 'lucide-react';

interface Page {
  id: string;
  title: string;
  slug: string;
  status: 'draft' | 'published';
  sort_order: number;
}

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
  page_count: number;
  pages: Page[];
}

export default function GuideChaptersList() {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(new Set());
  const [message, setMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const toggleExpand = (chapterId: string) => {
    setExpandedChapters((prev) => {
      const next = new Set(prev);
      if (next.has(chapterId)) {
        next.delete(chapterId);
      } else {
        next.add(chapterId);
      }
      return next;
    });
  };

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
    <div className="p-6 md:p-10">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <Link
                href="/admin"
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                ← Übersicht
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
            href="/admin/guide/new"
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
                <div key={chapter.id} className="border-b last:border-0 border-gray-100">
                  <div className="flex items-center gap-4 px-4 py-3 hover:bg-gray-50 bg-white">
                    {/* Expand/Collapse Button */}
                    <button
                      onClick={() => toggleExpand(chapter.id)}
                      className="p-1 hover:bg-gray-200 rounded text-gray-400"
                    >
                      {expandedChapters.has(chapter.id) ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </button>

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
                    <div 
                      className="flex items-center gap-4 flex-1 cursor-pointer min-w-0"
                      onClick={() => toggleExpand(chapter.id)}
                    >
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
                          /{chapter.slug} · Ed. {chapter.edition} ·{' '}
                          <span className="text-blue-500 font-medium">
                            {chapter.page_count} Seiten
                          </span>{' '}
                          · Aktualisiert {formatDate(chapter.updated_at)}
                        </p>
                      </div>
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
                        href={`/admin/guide/${chapter.id}/pages/new`}
                        className="p-1 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="Neue Seite hinzufügen"
                      >
                        <Plus className="w-4 h-4" />
                      </Link>
                      <Link
                        href={`/admin/guide/${chapter.id}/edit`}
                        className="p-1 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
                        title="Bearbeiten"
                      >
                        <Settings className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => deleteChapter(chapter)}
                        className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer"
                        title="Löschen"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Nested Pages List */}
                  {expandedChapters.has(chapter.id) && (
                    <div className="bg-gray-50 px-4 py-2 border-t border-gray-100 divide-y divide-gray-200/50">
                      {chapter.pages.length === 0 ? (
                        <div className="py-4 px-12 text-sm text-gray-400">
                          Keine Seiten in diesem Kapitel. 
                          <Link href={`/admin/guide/${chapter.id}/pages/new`} className="text-blue-500 hover:underline ml-1">
                            Erste Seite erstellen
                          </Link>
                        </div>
                      ) : (
                        chapter.pages.map((page) => (
                          <div key={page.id} className="flex items-center gap-3 py-2 px-10 hover:bg-white/50 rounded-lg transition-colors group">
                            <FileText className="w-3.5 h-3.5 text-gray-400" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-700">
                                {page.title}
                              </p>
                              <p className="text-[10px] text-gray-400">
                                /{page.slug}
                              </p>
                            </div>
                            
                            <div className={`px-2 py-0.5 text-[9px] font-bold rounded uppercase ${
                              page.status === 'published' ? 'bg-green-50 text-green-600' : 'bg-yellow-50 text-yellow-600'
                            }`}>
                              {page.status === 'published' ? 'Live' : 'Entwurf'}
                            </div>

                            <div className="flex items-center gap-1 opacity-10 md:opacity-0 group-hover:opacity-100 transition-opacity">
                              <Link
                                href={`/admin/guide/${chapter.id}/pages/${page.id}/edit`}
                                className="p-1 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
                                title="Seite bearbeiten"
                              >
                                <Settings className="w-3.5 h-3.5" />
                              </Link>
                              <Link
                                href={`/guide/${chapter.slug}/${page.slug}`}
                                target="_blank"
                                className="p-1 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded transition-colors"
                                title="Ansehen"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </Link>
                            </div>
                          </div>
                        ))
                      )}
                      
                      {/* Manage pages link */}
                      <div className="py-2 px-10">
                        <Link
                          href={`/admin/guide/${chapter.id}/pages`}
                          className="text-xs text-blue-500 hover:text-blue-700 font-medium"
                        >
                          Alle Seiten dieses Kapitels verwalten →
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

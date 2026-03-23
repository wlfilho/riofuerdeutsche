'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import HtmlEditor from '@/components/admin/HtmlEditor';

interface PageData {
  id?: string;
  slug: string;
  title: string;
  subtitle: string;
  content: string;
  sort_order: number;
  is_free: boolean;
  status: 'draft' | 'published';
}

interface Props {
  chapterId: string;
  chapterTitle: string;
  chapterSlug: string;
  pageId?: string; // present when editing
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export default function GuidePageEditor({ chapterId, chapterTitle, chapterSlug, pageId }: Props) {
  const router = useRouter();
  const isEditing = !!pageId;

  const [page, setPage] = useState<PageData>({
    slug: '',
    title: '',
    subtitle: '',
    content: '',
    sort_order: 1,
    is_free: false,
    status: 'draft',
  });

  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Load existing page when editing
  useEffect(() => {
    if (!pageId) return;
    const load = async () => {
      try {
        const res = await fetch(`/api/admin/guide/pages/${pageId}`);
        const data = await res.json();
        if (data.page) {
          setPage({
            slug: data.page.slug,
            title: data.page.title,
            subtitle: data.page.subtitle ?? '',
            content: data.page.content ?? '',
            sort_order: data.page.sort_order,
            is_free: data.page.is_free,
            status: data.page.status,
          });
        }
      } catch {
        setMessage({ type: 'error', text: 'Fehler beim Laden.' });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [pageId]);

  const handleTitleChange = (title: string) => {
    setPage((prev) => ({
      ...prev,
      title,
      // Auto-generate slug only on creation
      ...(!isEditing && { slug: slugify(title) }),
    }));
  };

  const handleSave = async () => {
    if (!page.title.trim() || !page.slug.trim()) {
      setMessage({ type: 'error', text: 'Titel und Slug sind Pflichtfelder.' });
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      const url = isEditing
        ? `/api/admin/guide/pages/${pageId}`
        : `/api/admin/guide/${chapterId}/pages`;

      const method = isEditing ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(page),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({ type: 'success', text: isEditing ? 'Seite gespeichert!' : 'Seite erstellt!' });
        if (!isEditing && data.page?.id) {
          // Redirect to edit after creation
          router.push(`/admin/guide/${chapterId}/pages/${data.page.id}/edit`);
        }
      } else {
        setMessage({ type: 'error', text: data.error || 'Fehler beim Speichern.' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Netzwerkfehler.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-400">Laden...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20">
      {/* Sticky top bar */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-6 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => router.push(`/admin/guide/${chapterId}/pages`)}
              className="text-sm text-gray-400 hover:text-gray-700 shrink-0 cursor-pointer"
            >
              ← Zurück
            </button>
            <span className="text-gray-200">|</span>
            <h1 className="text-base font-bold text-gray-900 truncate">
              {isEditing ? page.title || 'Seite bearbeiten' : 'Neue Seite'}
            </h1>
            <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-full shrink-0 ${
              page.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
            }`}>
              {page.status === 'published' ? 'Live' : 'Entwurf'}
            </span>
            {/* View on frontend */}
            {isEditing && (
              <Link
                href={`/guide/${chapterSlug}/${page.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-500 hover:underline shrink-0"
              >
                Seite ansehen →
              </Link>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setPage((p) => ({ ...p, status: p.status === 'published' ? 'draft' : 'published' }))}
              className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors cursor-pointer"
            >
              {page.status === 'published' ? 'Als Entwurf' : 'Veröffentlichen'}
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-1.5 text-sm font-semibold text-white bg-green-600 rounded-full hover:bg-green-700 transition-colors disabled:opacity-50 cursor-pointer"
            >
              {saving ? 'Speichern...' : 'Speichern'}
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto p-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-6 flex-wrap">
          <Link href="/admin" className="hover:text-gray-600">Dashboard</Link>
          <span>›</span>
          <Link href="/admin/guide" className="hover:text-gray-600">Guide</Link>
          <span>›</span>
          <Link href={`/admin/guide/${chapterId}/pages`} className="hover:text-gray-600">{chapterTitle}</Link>
          <span>›</span>
          <span className="text-gray-600">{isEditing ? 'Bearbeiten' : 'Neue Seite'}</span>
        </div>

        {/* Message */}
        {message && (
          <div className={`mb-5 p-3 rounded-lg text-sm ${
            message.type === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {message.text}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main — HTML Editor */}
          <div className="lg:col-span-2 flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">Inhalt (HTML)</label>
            <HtmlEditor value={page.content} onChange={(v) => setPage((p) => ({ ...p, content: v }))} />
          </div>

          {/* Sidebar — Meta fields */}
          <div className="flex flex-col gap-4">
            {/* Titel */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Titel <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={page.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="z.B. Sicherheit im Verkehr"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
              />
            </div>

            {/* Slug */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Slug (URL) <span className="text-red-400">*</span>
              </label>
              <div className="flex items-center gap-1">
                <span className="text-xs text-gray-400 shrink-0">/dashboard/…/</span>
                <input
                  type="text"
                  value={page.slug}
                  onChange={(e) => setPage((p) => ({ ...p, slug: e.target.value }))}
                  placeholder="sicherheit-verkehr"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm font-mono"
                />
              </div>
            </div>

            {/* Untertitel */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Untertitel</label>
              <input
                type="text"
                value={page.subtitle}
                onChange={(e) => setPage((p) => ({ ...p, subtitle: e.target.value }))}
                placeholder="Kurze Beschreibung (optional)"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
              />
            </div>

            {/* Reihenfolge */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Reihenfolge</label>
              <input
                type="number"
                min={1}
                value={page.sort_order}
                onChange={(e) => setPage((p) => ({ ...p, sort_order: Number(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
              />
            </div>

            {/* Zugang */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
              <label className="block text-sm font-medium text-gray-700 mb-2">Zugang</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setPage((p) => ({ ...p, is_free: true }))}
                  className={`flex-1 py-1.5 text-sm font-semibold rounded-full border transition-colors cursor-pointer ${
                    page.is_free
                      ? 'bg-green-600 text-white border-green-600'
                      : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'
                  }`}
                >
                  Kostenlos
                </button>
                <button
                  type="button"
                  onClick={() => setPage((p) => ({ ...p, is_free: false }))}
                  className={`flex-1 py-1.5 text-sm font-semibold rounded-full border transition-colors cursor-pointer ${
                    !page.is_free
                      ? 'bg-yellow-500 text-white border-yellow-500'
                      : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'
                  }`}
                >
                  Premium
                </button>
              </div>
            </div>

            {/* Status */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setPage((p) => ({ ...p, status: 'draft' }))}
                  className={`flex-1 py-1.5 text-sm font-semibold rounded-full border transition-colors cursor-pointer ${
                    page.status === 'draft'
                      ? 'bg-gray-600 text-white border-gray-600'
                      : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'
                  }`}
                >
                  Entwurf
                </button>
                <button
                  type="button"
                  onClick={() => setPage((p) => ({ ...p, status: 'published' }))}
                  className={`flex-1 py-1.5 text-sm font-semibold rounded-full border transition-colors cursor-pointer ${
                    page.status === 'published'
                      ? 'bg-green-600 text-white border-green-600'
                      : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'
                  }`}
                >
                  Veröffentlicht
                </button>
              </div>
            </div>

            {/* Abbrechen */}
            <button
              type="button"
              onClick={() => router.push(`/admin/guide/${chapterId}/pages`)}
              className="py-2 text-sm text-gray-500 hover:text-gray-700 cursor-pointer"
            >
              Abbrechen
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

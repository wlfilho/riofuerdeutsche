// src/components/admin/GuideChapterEditor.tsx
'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import RichEditor from '@/components/admin/RichEditor';
import GuideContent from '@/components/dashboard/GuideContent';
interface ChapterData {
  id?: string;
  slug: string;
  title: string;
  subtitle: string;
  icon: string;
  content: any; // Agora é JSONB (TipTap)
  edition: number;
  is_free: boolean;
  status: 'draft' | 'published';
}

interface Props {
  chapterId?: string; // Se presente, é edição; se ausente, é criação
}

export default function GuideChapterEditor({ chapterId }: Props) {
  const router = useRouter();
  const t = useTranslations('admin.guide');
  const tCommon = useTranslations('admin.common');
  const tEdicoes = useTranslations('admin.guide.edicoes');
  const isEditing = !!chapterId;

  const [chapter, setChapter] = useState<ChapterData>({
    slug: '',
    title: '',
    subtitle: '',
    icon: '📄',
    content: '',
    edition: 1,
    is_free: false,
    status: 'draft',
  });

  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(isEditing);
  const [message, setMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  // Carregar capítulo existente
  useEffect(() => {
    if (!chapterId) return;

    const fetchChapter = async () => {
      try {
        const res = await fetch(`/api/admin/guide/${chapterId}`);
        const data = await res.json();
        if (data.chapter) {
          setChapter(data.chapter);
        }
      } catch (error) {
        setMessage({ type: 'error', text: t('erroCarregar') });
      } finally {
        setLoading(false);
      }
    };

    fetchChapter();
  }, [chapterId]);

  // Auto-gerar slug a partir do título (só na criação)
  const handleTitleChange = (title: string) => {
    setChapter((prev) => ({
      ...prev,
      title,
      ...(!isEditing && {
        slug: title
          .toLowerCase()
          .replace(/ä/g, 'ae')
          .replace(/ö/g, 'oe')
          .replace(/ü/g, 'ue')
          .replace(/ß/g, 'ss')
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, ''),
      }),
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);

    try {
      const url = isEditing
        ? `/api/admin/guide/${chapterId}`
        : '/api/admin/guide';

      const method = isEditing ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(chapter),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({
          type: 'success',
          text: isEditing
            ? t('capituloSalvo')
            : t('capituloCriado'),
        });

        if (!isEditing && data.chapter?.id) {
          // Redirecionar para edição do capítulo criado
          router.push(`/admin/guide/${data.chapter.id}/edit`);
        }
      } else {
        setMessage({
          type: 'error',
          text: data.error || t('erroSalvar'),
        });
      }
    } catch (error) {
      setMessage({ type: 'error', text: tCommon('erroRede') });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-400">{tCommon('carregando')}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20">
      {/* Top Bar */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-6 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/admin/guide')}
              className="text-sm text-gray-500 hover:text-gray-700 cursor-pointer"
            >
              {t('voltar')}
            </button>
            <h1 className="text-lg font-bold text-gray-900">
              {isEditing ? `${chapter.icon} ${chapter.title}` : t('novoCapituloTitulo')}
            </h1>
            <span
              className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                chapter.status === 'published'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-yellow-100 text-yellow-700'
              }`}
            >
              {chapter.status === 'published' ? t('live') : t('rascunhoBadge')}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Toggle Status */}
            <button
              onClick={() =>
                setChapter((prev) => ({
                  ...prev,
                  status:
                    prev.status === 'published' ? 'draft' : 'published',
                }))
              }
              className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer"
            >
              {chapter.status === 'published'
                ? t('comoRascunho')
                : t('publicar')}
            </button>

            {/* Save */}
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-1.5 text-sm font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 cursor-pointer"
            >
              {saving ? tCommon('salvando') : tCommon('salvar')}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6">
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content Area */}
          <div className="lg:col-span-2">
            {/* Tabs */}
            <div className="flex gap-1 mb-3 bg-gray-100 rounded-lg p-1 w-fit">
              <button
                onClick={() => setActiveTab('edit')}
                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors cursor-pointer ${
                  activeTab === 'edit'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {t('abaEditar')}
              </button>
              <button
                onClick={() => setActiveTab('preview')}
                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors cursor-pointer ${
                  activeTab === 'preview'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {t('abaPrevia')}
              </button>
            </div>

            {activeTab === 'edit' ? (
              <RichEditor
                content={chapter.content}
                onChange={(json) =>
                  setChapter((prev) => ({
                    ...prev,
                    content: json,
                  }))
                }
              />
            ) : (
              <div className="bg-white border border-gray-200 rounded-xl p-6 min-h-[600px]">
                {chapter.content ? (
                  <GuideContent content={chapter.content} />
                ) : (
                  <p className="text-gray-400 italic">{t('semConteudo')}</p>
                )}
              </div>
            )}

            {/* Markdown Help Removed - No longer applicable */}
          </div>

          {/* Sidebar — Metadaten */}
          <div className="space-y-4">
            {/* Titel */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('tituloCampo')}
              </label>
              <input
                type="text"
                value={chapter.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder={t('tituloPlaceholder')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
              />
            </div>

            {/* Slug */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('slugUrl')}
              </label>
              <div className="flex items-center gap-1">
                <span className="text-xs text-gray-400">/dashboard/</span>
                <input
                  type="text"
                  value={chapter.slug}
                  onChange={(e) =>
                    setChapter((prev) => ({
                      ...prev,
                      slug: e.target.value,
                    }))
                  }
                  placeholder={t('slugPlaceholder')}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                />
              </div>
            </div>

            {/* Untertitel */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('subtitulo')}
              </label>
              <input
                type="text"
                value={chapter.subtitle}
                onChange={(e) =>
                  setChapter((prev) => ({
                    ...prev,
                    subtitle: e.target.value,
                  }))
                }
                placeholder={t('subtituloPlaceholder')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
              />
            </div>

            {/* Icon */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('iconeEmoji')}
              </label>
              <input
                type="text"
                value={chapter.icon}
                onChange={(e) =>
                  setChapter((prev) => ({ ...prev, icon: e.target.value }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm text-center text-2xl"
                maxLength={4}
              />
            </div>

            {/* Edition */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('edicao')}
              </label>
              <select
                value={chapter.edition}
                onChange={(e) =>
                  setChapter((prev) => ({
                    ...prev,
                    edition: Number(e.target.value),
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm bg-white"
              >
                {[1, 2, 3, 4].map((ed) => (
                  <option key={ed} value={ed}>
                    {tEdicoes(String(ed))}
                  </option>
                ))}
              </select>
            </div>

            {/* Kostenlos toggle */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-sm font-medium text-gray-700">
                  {t('gratuitoLeadMagnet')}
                </span>
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={chapter.is_free}
                    onChange={(e) =>
                      setChapter((prev) => ({
                        ...prev,
                        is_free: e.target.checked,
                      }))
                    }
                    className="sr-only"
                  />
                  <div
                    className={`w-10 h-5 rounded-full transition-colors ${
                      chapter.is_free ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-white shadow-sm transform transition-transform mt-0.5 ${
                        chapter.is_free
                          ? 'translate-x-5.5'
                          : 'translate-x-0.5'
                      }`}
                    />
                  </div>
                </div>
              </label>
              <p className="text-xs text-gray-400 mt-2">
                {t('leadMagnetHint')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

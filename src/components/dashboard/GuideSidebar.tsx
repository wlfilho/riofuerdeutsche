'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import type { MembershipAccess } from '@/types/membership';

interface Chapter {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  icon: string;
  sort_order: number;
  edition: number;
  is_free: boolean;
}

interface GuideSidebarProps {
  access: MembershipAccess;
}

export default function GuideSidebar({ access }: GuideSidebarProps) {
  const t = useTranslations('public.dashboard.sidebar');
  const pathname = usePathname();
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChapters = async () => {
      try {
        const res = await fetch('/api/dashboard/chapters');
        const data = await res.json();
        if (data.chapters) {
          setChapters(data.chapters);
        }
      } catch (error) {
        console.error('Error fetching chapters:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchChapters();
  }, []);

  return (
    <aside className="w-72 bg-white border-r border-gray-200 min-h-screen p-4 hidden md:block overflow-y-auto">
      {/* Header da sidebar */}
      <div className="mb-6">
        <Link href="/dashboard" className="block">
          <h2 className="text-lg font-bold text-gray-900">
            {t('rioFuerDeutsche')}
          </h2>
          <p className="text-sm text-gray-500">{t('kompletterGuide')}</p>
        </Link>

        {/* Badge do nível de acesso */}
        {access.isAdmin ? (
          <span className="inline-block mt-2 px-3 py-1 bg-purple-100 text-purple-800 text-xs font-semibold rounded-full">
            {t('adminBadge')}
          </span>
        ) : access.isPremium ? (
          <span className="inline-block mt-2 px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded-full">
            {t('premiumBadge')}
          </span>
        ) : (
          <span className="inline-block mt-2 px-3 py-1 bg-gray-100 text-gray-600 text-xs font-semibold rounded-full">
            {t('kostenlosBadge')}
          </span>
        )}
      </div>

      {/* Lista de capítulos */}
      <nav className="space-y-1">
        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-10 bg-gray-100 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : (
          chapters.map((chapter) => {
            const isActive = pathname === `/guide/${chapter.slug}`;
            const isLocked = !chapter.is_free && !access.isPremium && !access.isAdmin;
            const href = `/guide/${chapter.slug}`;

            return (
              <div key={chapter.id}>
                {isLocked ? (
                  <Link
                    href="/dashboard?upgrade=true"
                    className="flex items-start gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 group"
                  >
                    <span className="text-lg opacity-50">{chapter.icon}</span>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-400 group-hover:text-gray-600">
                        {chapter.title}
                      </p>
                      <p className="text-xs text-gray-400">
                        {chapter.subtitle}
                      </p>
                    </div>
                    <span className="text-xs mt-1">🔒</span>
                  </Link>
                ) : (
                  <Link
                    href={href}
                    className={`flex items-start gap-3 px-3 py-2 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-green-50 border border-green-200'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <span className="text-lg">{chapter.icon}</span>
                    <div>
                      <p
                        className={`text-sm font-medium ${
                          isActive ? 'text-green-800' : 'text-gray-700'
                        }`}
                      >
                        {chapter.title}
                      </p>
                      <p className="text-xs text-gray-500">
                        {chapter.subtitle}
                      </p>
                    </div>
                    {chapter.is_free && !access.isPremium && !access.isAdmin && (
                      <span className="text-xs text-green-600 mt-1">
                        {t('gratis')}
                      </span>
                    )}
                  </Link>
                )}
              </div>
            );
          })
        )}
      </nav>

      {/* CTA de upgrade (para usuários gratuitos) */}
      {!access.isPremium && !access.isAdmin && (
        <div className="mt-8 p-4 bg-gradient-to-br from-green-50 to-yellow-50 rounded-xl border border-green-200">
          <p className="text-sm font-bold text-gray-800 mb-1">
            {t('allesFreischalten')}
          </p>
          <p className="text-xs text-gray-600 mb-3">
            {t('allesFreischaltenText')}
          </p>
          <Link
            href="/dashboard?upgrade=true"
            className="block w-full text-center px-4 py-2 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 transition-colors"
          >
            {t('guideKaufen')}
          </Link>
        </div>
      )}
    </aside>
  );
}


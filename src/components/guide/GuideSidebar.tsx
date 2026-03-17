'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { MembershipAccess } from '@/types/membership';

// Definição dos capítulos do guia
const chapters = [
  {
    slug: 'sicherheit',
    title: 'Sicherheit in Rio',
    subtitle: 'Die 7 gefährlichsten Fehler',
    icon: '🛡️',
    free: true,
    edition: 1,
  },
  {
    slug: 'ankommen',
    title: 'Ankommen in Rio',
    subtitle: 'Flughafen, Transfer, erste Schritte',
    icon: '✈️',
    free: false,
    edition: 1,
  },
  {
    slug: 'unterkunft',
    title: 'Unterkunft',
    subtitle: 'Sichere Viertel & Unterkünfte',
    icon: '🏨',
    free: false,
    edition: 1,
  },
  {
    slug: 'transport',
    title: 'Transport',
    subtitle: 'Uber, Metro, Apps',
    icon: '🚇',
    free: false,
    edition: 1,
  },
  {
    slug: 'sehenswuerdigkeiten',
    title: 'Sehenswürdigkeiten',
    subtitle: 'Cristo, Zuckerhut, Strände & mehr',
    icon: '🏔️',
    free: false,
    edition: 1,
  },
  // --- Edição 2 (futuro) ---
  {
    slug: 'stadtviertel',
    title: 'Stadtviertel im Detail',
    subtitle: 'Ipanema, Copa, Botafogo...',
    icon: '🌆',
    free: false,
    edition: 2,
    comingSoon: true,
  },
  {
    slug: 'gastronomie',
    title: 'Essen & Trinken',
    subtitle: 'Restaurants, Street Food, Preise',
    icon: '🍽️',
    free: false,
    edition: 2,
    comingSoon: true,
  },
];

interface GuideSidebarProps {
  access: MembershipAccess;
}

export default function GuideSidebar({ access }: GuideSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="w-72 bg-white border-r border-gray-200 min-h-screen p-4 hidden md:block">
      {/* Header da sidebar */}
      <div className="mb-6">
        <Link href="/guide" className="block">
          <h2 className="text-lg font-bold text-gray-900">
            📖 Rio für Deutsche
          </h2>
          <p className="text-sm text-gray-500">Kompletter Guide</p>
        </Link>

        {/* Badge do nível de acesso */}
        {access.isPremium ? (
          <span className="inline-block mt-2 px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded-full">
            ⭐ Premium
          </span>
        ) : (
          <span className="inline-block mt-2 px-3 py-1 bg-gray-100 text-gray-600 text-xs font-semibold rounded-full">
            Kostenlos
          </span>
        )}
      </div>

      {/* Lista de capítulos */}
      <nav className="space-y-1">
        {chapters.map((chapter) => {
          const isActive = pathname === `/guide/${chapter.slug}`;
          const isLocked = !chapter.free && !access.isPremium;
          const isComingSoon = chapter.comingSoon;
          const href = `/guide/${chapter.slug}`;

          return (
            <div key={chapter.slug}>
              {isComingSoon ? (
                <div className="flex items-start gap-3 px-3 py-2 rounded-lg opacity-40 cursor-not-allowed">
                  <span className="text-lg">{chapter.icon}</span>
                  <div>
                    <p className="text-sm font-medium text-gray-400">
                      {chapter.title}
                    </p>
                    <p className="text-xs text-gray-400">In Kürze</p>
                  </div>
                </div>
              ) : isLocked ? (
                <Link
                  href="/guide?upgrade=true"
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
                  {chapter.free && (
                    <span className="text-xs text-green-600 mt-1">
                      Gratis
                    </span>
                  )}
                </Link>
              )}
            </div>
          );
        })}
      </nav>

      {/* CTA de upgrade (para usuários gratuitos) */}
      {!access.isPremium && (
        <div className="mt-8 p-4 bg-gradient-to-br from-green-50 to-yellow-50 rounded-xl border border-green-200">
          <p className="text-sm font-bold text-gray-800 mb-1">
            🔓 Alles freischalten
          </p>
          <p className="text-xs text-gray-600 mb-3">
            Hol dir den kompletten Rio-Guide mit allen Kapiteln, Karten und
            Insider-Tipps.
          </p>
          <a
            href="/guide?upgrade=true"
            className="block w-full text-center px-4 py-2 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 transition-colors"
          >
            Guide kaufen — ab 9€
          </a>
        </div>
      )}
    </aside>
  );
}

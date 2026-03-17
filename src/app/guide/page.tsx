// src/app/guide/page.tsx
'use client';

import { useState, useEffect, use } from 'react';
import { getMembershipAccess } from '@/lib/membership';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

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

export default function GuidePage({
  searchParams,
}: {
  searchParams: Promise<{ upgrade?: string }>;
}) {
  const params = use(searchParams);
  const showUpgrade = params.upgrade === 'true';
  const router = useRouter();

  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [firstName, setFirstName] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch chapters
        const chRes = await fetch('/api/guide/chapters');
        const chData = await chRes.json();
        if (chData.chapters) {
          setChapters(chData.chapters);
        }

        // Fetch membership info (client-side proxy or direct if possible)
        // Since getMembershipAccess is server-side, we should probably have a small API route 
        // or just fetch the user metadata here.
        const { createClient } = await import('@/utils/supabase/client');
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('first_name')
            .eq('id', user.id)
            .single();
          if (profile) setFirstName(profile.first_name);
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const freeChapters = chapters.filter(c => c.is_free);
  const premiumChaptersList = chapters.filter(c => !c.is_free);

  if (loading) {
    return (
      <div className="max-w-3xl animate-pulse">
        <div className="h-10 bg-gray-200 rounded-lg w-3/4 mb-6" />
        <div className="space-y-6">
          <div className="h-32 bg-gray-100 rounded-xl" />
          <div className="h-32 bg-gray-100 rounded-xl" />
          <div className="h-32 bg-gray-100 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {firstName ? `Willkommen, ${firstName}! 🇧🇷` : 'Willkommen im Rio-Guide! 🇧🇷'}
        </h1>
        <p className="text-gray-600">
          Entdecke Rio de Janeiro mit Insider-Tipps von einem echten Carioca.
        </p>
      </div>

      {/* Upgrade-Banner */}
      {showUpgrade && (
        <div className="mb-8 p-6 bg-gradient-to-r from-green-600 to-green-800 rounded-2xl text-white shadow-lg">
          <h2 className="text-xl font-bold mb-2">
            🔓 Den kompletten Rio-Guide freischalten
          </h2>
          <p className="text-green-100 mb-4">
            Sichere dir jetzt alle Kapitel — inklusive zukünftiger Updates und exklusiver Karten!
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
            <div className="bg-white/10 rounded-lg p-3">
              <p className="font-semibold">✅ Sichere Unterkünfte</p>
              <p className="text-sm text-green-200">Viertel, Budget, Checkliste</p>
            </div>
            <div className="bg-white/10 rounded-lg p-3">
              <p className="font-semibold">✅ Transport-Guide</p>
              <p className="text-sm text-green-200">Uber, Metro, Apps</p>
            </div>
            <div className="bg-white/10 rounded-lg p-3">
              <p className="font-semibold">✅ Top-Attraktionen</p>
              <p className="text-sm text-green-200">Cristo, Zuckerhut & mehr</p>
            </div>
            <div className="bg-white/10 rounded-lg p-3">
              <p className="font-semibold">✅ Zukünftige Updates</p>
              <p className="text-sm text-green-200">Alle neuen Editionen</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <a
              href="https://wa.me/5521999999999?text=Hallo%20Will!%20Ich%20möchte%20den%20Rio-Guide%20kaufen."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-6 py-3 bg-yellow-400 text-gray-900 font-bold rounded-lg hover:bg-yellow-300 transition-all transform hover:scale-105"
            >
              Jetzt kaufen — 9€
            </a>
            <p className="text-sm text-green-100">
              Early Access Preis · Steigt mit jeder Edition
            </p>
          </div>
        </div>
      )}

      {/* Free Chapters */}
      {freeChapters.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <span>📗</span> Kostenlose Kapitel
          </h2>
          <div className="grid gap-4">
            {freeChapters.map((chapter) => (
              <Link
                key={chapter.id}
                href={`/guide/${chapter.slug}`}
                className="block p-5 bg-white rounded-xl border-2 border-green-100 hover:border-green-400 hover:shadow-md transition-all group"
              >
                <div className="flex items-start gap-4">
                  <span className="text-3xl group-hover:scale-110 transition-transform">{chapter.icon}</span>
                  <div>
                    <h3 className="font-bold text-gray-900">{chapter.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {chapter.subtitle}
                    </p>
                    <span className="inline-block mt-2 px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold uppercase rounded">
                      Gratis
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Premium Chapters */}
      {premiumChaptersList.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <span>🔒</span> Premium-Kapitel
          </h2>
          <div className="grid gap-3">
            {premiumChaptersList.map((chapter) => (
              <Link
                key={chapter.id}
                href={`/guide/${chapter.slug}`}
                className="block p-5 bg-white rounded-xl border border-gray-100 hover:border-green-200 hover:shadow-sm transition-all group"
              >
                <div className="flex items-start gap-4">
                  <span className="text-3xl grayscale group-hover:grayscale-0 transition-all">{chapter.icon}</span>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900">{chapter.title}</h3>
                    <p className="text-sm text-gray-500 mt-1">{chapter.subtitle}</p>
                  </div>
                  <span className="text-gray-300 group-hover:text-green-500 transition-colors">
                    {/* Aqui poderíamos checar se o usuário tem acesso ou não */}
                    🔒
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Final CTA */}
      <div className="mt-12 p-8 bg-gray-50 rounded-2xl border border-dashed border-gray-200 text-center">
        <p className="text-gray-500 mb-4">
          Schalte den gesamten Guide frei und unterstütze dieses Projekt.
        </p>
        <Link
          href="/guide?upgrade=true"
          className="inline-block px-8 py-4 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 transition-all transform hover:scale-105"
        >
          Alle Kapitel freischalten — 9€
        </Link>
        <p className="text-xs text-gray-400 mt-4">
          Inklusive Edition 1, 2, 3 und 4 sowie alle Kartenupdates.
        </p>
      </div>
    </div>
  );
}

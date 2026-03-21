'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import MembersHero from '@/components/members/MembersHero';
import ChapterGrid from '@/components/members/ChapterGrid';
import GuideIntro from '@/components/members/GuideIntro';
import CTAGuideCompleto from '@/components/members/CTAGuideCompleto';
import EditionsPreview from '@/components/members/EditionsPreview';
import CTABeratung from '@/components/members/CTABeratung';

export default function GuidePage({
  searchParams,
}: {
  searchParams: Promise<{ upgrade?: string }>;
}) {
  const params = use(searchParams);
  const showUpgrade = params.upgrade === 'true';
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [firstName, setFirstName] = useState<string | null>(null);
  const [userPlan, setUserPlan] = useState<'free' | 'premium'>('free');
  const [chapters, setChapters] = useState<import('@/components/members/ChapterCard').Chapter[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { createClient } = await import('@/utils/supabase/client');
        const supabase = createClient();

        const [{ data: { user } }, { data: chaptersData }] = await Promise.all([
          supabase.auth.getUser(),
          supabase
            .from('guide_chapters')
            .select('id, title, subtitle, slug, icon, is_free, edition, status')
            .eq('status', 'published')
            .order('sort_order'),
        ]);

        if (chaptersData) {
          setChapters(chaptersData.map((ch) => ({
            ...ch,
            description: ch.subtitle ?? '',
          })));
        }

        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('first_name, role, premium_until')
            .eq('id', user.id)
            .single();

          if (profile) {
            setFirstName(profile.first_name);

            const isAdmin = profile.role === 'admin';
            const isPremium = isAdmin || (
              profile.role === 'premium' &&
              (!profile.premium_until || new Date(profile.premium_until) > new Date())
            );
            setUserPlan(isPremium ? 'premium' : 'free');
          }
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <>
        {/* Hero skeleton de largura total */}
        <div className="w-full bg-[#0d1f15] animate-pulse" style={{ minHeight: '340px' }} />
        <div className="max-w-5xl mx-auto px-6 py-8 w-full">
          <div className="space-y-4">
            <div className="h-36 bg-gray-200 rounded-xl" />
            <div className="h-36 bg-gray-200 rounded-xl" />
            <div className="h-36 bg-gray-200 rounded-xl" />
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {/* Hero — largura total, de borda a borda */}
      <MembersHero userName={firstName || 'Gast'} userPlan={userPlan} />
      <GuideIntro userPlan={userPlan} />

      {/* Conteúdo — centralizado com max-width */}
      <main className="max-w-5xl mx-auto px-6 py-8 w-full flex flex-col gap-0">

        {/* Upgrade Banner (legado, mantido por compatibilidade) */}
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
                className="inline-block px-6 py-3 bg-yellow-400 text-gray-900 font-bold rounded-lg hover:bg-yellow-300 transition-all"
              >
                Jetzt kaufen — 9€
              </a>
              <p className="text-sm text-green-100">Early Access Preis · Steigt mit jeder Edition</p>
            </div>
          </div>
        )}

        {/* Grid de capítulos */}
        <ChapterGrid chapters={chapters} userPlan={userPlan} />
      </main>

      {/* CTAs — largura total, fora do container max-width */}
      <CTAGuideCompleto />
      <EditionsPreview />
      <CTABeratung />
    </>
  );
}

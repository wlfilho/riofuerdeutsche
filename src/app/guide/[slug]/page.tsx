import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

import ChapterContent from "@/components/members/ChapterContent";
import ChapterNav from "@/components/members/ChapterNav";
import InlineUpgradeCTA from "@/components/members/InlineUpgradeCTA";

export default async function GuideChapterPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // Supabase Auth
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?redirect=/guide/${slug}`);
  }

  // Busca dados de assinatura
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, premium_until")
    .eq("id", user.id)
    .single();

  const isAdmin = profile?.role === "admin";
  const isPremium =
    isAdmin ||
    (profile?.role === "premium" &&
      (!profile.premium_until ||
        new Date(profile.premium_until) > new Date()));

  const userPlan = isPremium ? "premium" : "free";

  // Busca capítulo atual
  const { data: chapter, error } = await (supabase
    .from("guide_chapters")
    .select("*")
    .eq("slug", slug)
    .single() as any);

  // Se o capítulo não voltar do DB, criamos fallback pra teste visual
  // em caso de banco de dados ainda não populado
  const finalChapter = error || !chapter ? {
    id: "fallback",
    title: slug === "sicherheit" ? "Sicherheit in Rio" : "Inhalt",
    slug,
    icon: slug === "sicherheit" ? "🛡️" : "📖",
    edition: 1,
    access: slug === "sicherheit" ? "free" : "locked",
    content: "Dies ist ein Platzhaltertext im Markdown (*fallback*).\n\n## Warum es wichtig ist\n\n- Wichtiger Punkt\n\n> Dica útil da vida."
  } : chapter;

  // Busca todos capítulos ordenados
  const { data: allChapters } = await (supabase
    .from("guide_chapters")
    .select("id, title, slug, access, sort_order, icon")
    .order("sort_order") as any);

  // Fallback pra ordenação caso o banco de dados não traga
  const fallbackChapters = allChapters || [
    { title: "Sicherheit in Rio", slug: "sicherheit", access: "free" },
    { title: "Wie du nach Rio kommst", slug: "anreise", access: "locked" },
  ];

  const currentIndex = fallbackChapters.findIndex((c: any) => c.slug === slug);
  const prevChapter =
    currentIndex > 0 ? fallbackChapters[currentIndex - 1] : undefined;
  const nextChapter =
    currentIndex !== -1 && currentIndex < fallbackChapters.length - 1
      ? fallbackChapters[currentIndex + 1]
      : undefined;

  // Verifica proteção
  const isLockedPreview =
    finalChapter.access === "locked" && userPlan === "free";

  return (
    <article className="max-w-[760px] w-full pb-[40px]">
      {/* Breadcrumb */}
      <div className="text-[11px] text-[#aaa] mb-[20px] flex items-center">
        Rio-Guide <span className="text-[#ccc] mx-[6px]">/</span> Edition{" "}
        {finalChapter.edition || 1} <span className="text-[#ccc] mx-[6px]">/</span>{" "}
        <span className="text-[#555]">{finalChapter.title}</span>
      </div>

      {/* Cabeçalho */}
      <h1 className="mb-[6px]">
        <div className="text-[32px] mb-[8px] leading-none">
          {finalChapter.icon}
        </div>
        <div
          className="font-display font-[800] text-[28px] text-[#1a1a1a]"
        >
          {finalChapter.title}
        </div>
      </h1>

      <div className="inline-block bg-[#e8f5e9] text-[#2e7d32] text-[9px] font-[700] px-[10px] py-[3px] rounded-[20px] uppercase">
        Edition {finalChapter.edition || 1} — O Essencial
      </div>

      <div className="border-t-[1px] border-[#e8e4dc] my-[20px]" />

      {/* Conteúdo Renderizado (Prose React-Markdown) */}
      <ChapterContent
        content={finalChapter.content}
        isLockedPreview={isLockedPreview}
      />

      {/* Se não temos permissão, exibe CTA de upgrade imediatamente colado ao Mask Blur */}
      {isLockedPreview && (
        <div className="relative mt-[-40px]">
          <InlineUpgradeCTA userPlan={userPlan} />
        </div>
      )}

      {/* Navegação Entre Capítulos */}
      {!isLockedPreview && (
        <ChapterNav
          prev={prevChapter}
          next={nextChapter}
          isNextLocked={nextChapter?.access === "locked" && userPlan === "free"}
        />
      )}

      {/* CTA final do final da leitura */}
      {userPlan === "free" && !isLockedPreview && (
        <InlineUpgradeCTA userPlan={userPlan} />
      )}
    </article>
  );
}

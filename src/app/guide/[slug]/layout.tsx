import { createClient } from "@/utils/supabase/server";
import ChapterSidebar from "@/components/members/ChapterSidebar";
import { hardcodedChapters } from "@/components/members/ChapterGrid";

export default async function ChapterLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // Busca dados do usuário
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let userPlan: "free" | "premium" = "free";

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role, premium_until")
      .eq("id", user.id)
      .single();

    if (profile) {
      const isAdmin = profile.role === "admin";
      const isPremium =
        isAdmin ||
        (profile.role === "premium" &&
          (!profile.premium_until ||
            new Date(profile.premium_until) > new Date()));

      userPlan = isPremium ? "premium" : "free";
    }
  }

  return (
    <div className="flex bg-[#f8f5f0] min-h-screen w-full relative">
      <ChapterSidebar
        chapters={hardcodedChapters}
        currentSlug={slug}
        userPlan={userPlan}
      />
      
      <div className="flex-1 p-[20px] md:p-[32px] w-full">
        {children}
      </div>
    </div>
  );
}

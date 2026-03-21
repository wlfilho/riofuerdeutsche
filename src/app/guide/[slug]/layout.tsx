import { createClient } from "@/utils/supabase/server";
import ChapterSidebar from "@/components/members/ChapterSidebar";

export default async function ChapterLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

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

  const { data: chaptersData } = await supabase
    .from("guide_chapters")
    .select("id, title, subtitle, slug, icon, is_free, edition, status")
    .eq("status", "published")
    .order("sort_order");

  const chapters = (chaptersData ?? []).map((ch) => ({
    ...ch,
    description: ch.subtitle ?? "",
  }));

  return (
    <div className="flex bg-[#f8f5f0] min-h-screen w-full relative">
      <ChapterSidebar
        chapters={chapters}
        currentSlug={slug}
        userPlan={userPlan}
      />
      
      <div className="flex-1 p-[20px] md:p-[32px] w-full">
        {children}
      </div>
    </div>
  );
}

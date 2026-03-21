import Link from "next/link";

export interface Chapter {
  id: string;
  title: string;
  description: string;
  icon: string;
  slug: string;
  is_free: boolean;
  edition: number;
  status: "draft" | "published";
}

interface ChapterCardProps {
  chapter: Chapter;
  userPlan: "free" | "premium";
}

export default function ChapterCard({ chapter, userPlan }: ChapterCardProps) {
  const isAccessible = chapter.is_free || userPlan === "premium";

  if (isAccessible) {
    return (
      <Link
        href={`/guide/${chapter.slug}`}
        className="block h-full cursor-pointer bg-[#ffffff] rounded-[12px] p-[20px] flex flex-col group transition-colors hover:[border-color:#22a262]"
        style={{ border: '0.5px solid #e0ddd6', borderTop: '3px solid #22a262' }}
      >
        <div className="flex justify-between items-start w-full mb-[12px]">
          <span className="text-[28px]">{chapter.icon}</span>
        </div>
        <h3 className="font-display font-bold text-[#1a1a1a] mb-[4px]">{chapter.title}</h3>
        <p className="text-[12px] text-[#555] mb-[16px] leading-[1.6] line-clamp-2">
          {chapter.description}
        </p>
        <div className="mt-auto flex items-center justify-between">
          <span className="inline-block px-[8px] py-[3px] bg-[#e8f5e9] text-[#2e7d32] text-[10px] font-[700] rounded-[6px] uppercase tracking-[0.5px]">
            {chapter.is_free ? "GRATIS" : "PREMIUM ✓"}
          </span>
          <span className="text-[#22a262] font-bold text-[16px] opacity-0 group-hover:opacity-100 transition-opacity">
            →
          </span>
        </div>
      </Link>
    );
  }

  // Estado Locked
  return (
    <div
      onClick={() => {
        document.getElementById("cta-guide")?.scrollIntoView({ behavior: "smooth" });
      }}
      className="relative bg-[#ffffff] rounded-[12px] cursor-default p-[20px] h-full flex flex-col transition-colors"
      style={{ border: '0.5px solid #e0ddd6', borderTop: '3px solid #e0ddd6' }}
    >
      <div className="absolute top-3 right-3 text-base leading-none">
        🔒
      </div>
      <div className="flex justify-between items-start w-full mb-[12px] opacity-40">
        <span className="text-[28px]">{chapter.icon}</span>
      </div>
      <h3 className="font-display font-bold text-[#1a1a1a] mb-[4px] opacity-40">{chapter.title}</h3>
      <p className="text-[12px] text-[#555] mb-[16px] leading-[1.6] line-clamp-2 opacity-40">
        {chapter.description}
      </p>
      <div className="mt-auto opacity-40">
        <span className="inline-block px-[8px] py-[3px] bg-[#f5f5f5] text-[#aaa] text-[10px] font-[700] rounded-[6px]">
          🔒 Premium
        </span>
      </div>
    </div>
  );
}

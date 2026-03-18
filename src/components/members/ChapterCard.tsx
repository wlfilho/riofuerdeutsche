import Link from "next/link";

export interface Chapter {
  id: string;
  title: string;
  description: string;
  icon: string;
  slug: string;
  access: "free" | "locked" | "coming_soon";
  edition: number;
}

interface ChapterCardProps {
  chapter: Chapter;
  userPlan: "free" | "premium";
}

export default function ChapterCard({ chapter, userPlan }: ChapterCardProps) {
  const isAccessible =
    chapter.access === "free" ||
    (chapter.access === "locked" && userPlan === "premium");

  if (chapter.access === "coming_soon") {
    return (
      <div className="bg-[#fafaf8] border-[0.5px] border-dashed border-[#ddd] rounded-[12px] opacity-60 cursor-default p-[20px] h-full flex flex-col items-start transition-all">
        <div className="flex justify-between items-start w-full mb-[12px]">
          <span className="text-[28px] opacity-30">{chapter.icon}</span>
        </div>
        <h3 className="font-bold text-[#1a1a1a] mb-[4px]">{chapter.title}</h3>
        <p className="text-[12px] text-[#555] mb-[16px] leading-[1.6] line-clamp-2">
          {chapter.description}
        </p>
        <div className="mt-auto">
          <span className="inline-block px-[8px] py-[3px] bg-[#fff8e1] text-[#b8860b] text-[10px] font-[700] rounded-[6px]">
            Em breve
          </span>
        </div>
      </div>
    );
  }

  if (isAccessible) {
    return (
      <Link
        href={`/guide/${chapter.slug}`}
        className="block h-full cursor-pointer hover:border-[#22a262] transition-colors border-[0.5px] border-[#e0ddd6] border-t-[3px] border-t-[#22a262] bg-[#ffffff] rounded-[12px] p-[20px] flex flex-col group"
      >
        <div className="flex justify-between items-start w-full mb-[12px]">
          <span className="text-[28px]">{chapter.icon}</span>
        </div>
        <h3 className="font-bold text-[#1a1a1a] mb-[4px]">{chapter.title}</h3>
        <p className="text-[12px] text-[#555] mb-[16px] leading-[1.6] line-clamp-2">
          {chapter.description}
        </p>
        <div className="mt-auto flex items-center justify-between">
          <span className="inline-block px-[8px] py-[3px] bg-[#e8f5e9] text-[#2e7d32] text-[10px] font-[700] rounded-[6px] uppercase tracking-[0.5px]">
            {chapter.access === "free" ? "GRATIS" : "PREMIUM ✓"}
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
        const el = document.getElementById("cta-guide");
        if (el) {
          el.scrollIntoView({ behavior: "smooth" });
        }
      }}
      className="bg-[#ffffff] border-[0.5px] border-[#e0ddd6] rounded-[12px] opacity-[0.52] cursor-default p-[20px] h-full flex flex-col hover:opacity-[0.7] transition-opacity"
    >
      <div className="flex justify-between items-start w-full mb-[12px]">
        <span className="text-[28px] grayscale opacity-50">{chapter.icon}</span>
        <span className="text-[14px] opacity-20">🔒</span>
      </div>
      <h3 className="font-bold text-[#1a1a1a] mb-[4px]">{chapter.title}</h3>
      <p className="text-[12px] text-[#555] mb-[16px] leading-[1.6] line-clamp-2">
        {chapter.description}
      </p>
      <div className="mt-auto">
        <span className="inline-block px-[8px] py-[3px] bg-[#f5f5f5] text-[#aaa] text-[10px] font-[700] rounded-[6px]">
          🔒 Premium
        </span>
      </div>
    </div>
  );
}

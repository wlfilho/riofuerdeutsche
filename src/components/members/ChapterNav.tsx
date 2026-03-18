import Link from "next/link";

interface NavChapter {
  title: string;
  slug: string;
}

interface ChapterNavProps {
  prev?: NavChapter;
  next?: NavChapter;
  isNextLocked?: boolean;
}

export default function ChapterNav({
  prev,
  next,
  isNextLocked,
}: ChapterNavProps) {
  return (
    <div className="flex justify-between items-center mt-[32px] gap-[10px] flex-wrap">
      {prev ? (
        <Link
          href={`/guide/${prev.slug}`}
          className="border-[0.5px] border-[#e0ddd6] rounded-[8px] px-[16px] py-[10px] text-[12px] text-[#555] hover:border-[#22a262] hover:text-[#22a262] transition-colors"
        >
          ← {prev.title}
        </Link>
      ) : (
        <Link
          href="/guide"
          className="border-[0.5px] border-[#e0ddd6] rounded-[8px] px-[16px] py-[10px] text-[12px] text-[#555] hover:border-[#22a262] hover:text-[#22a262] transition-colors"
        >
          ← Zurück zur Übersicht
        </Link>
      )}

      {next ? (
        isNextLocked ? (
          <div className="border-[0.5px] border-[#e0ddd6] opacity-[0.5] rounded-[8px] px-[16px] py-[10px] text-[12px] bg-[#f8f8f8] text-[#888] cursor-default flex items-center gap-[6px]">
            {next.title} <span className="text-[10px]">🔒 Premium</span>
          </div>
        ) : (
          <Link
            href={`/guide/${next.slug}`}
            className="border-[0.5px] border-[#e0ddd6] rounded-[8px] px-[16px] py-[10px] text-[12px] text-[#555] hover:border-[#22a262] hover:text-[#22a262] transition-colors"
          >
            {next.title} →
          </Link>
        )
      ) : (
        <div />
      )}
    </div>
  );
}

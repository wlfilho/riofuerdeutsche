"use client";

import { useTranslations } from "next-intl";
import ChapterCard, { Chapter } from "./ChapterCard";

interface ChapterGridProps {
  chapters: Chapter[];
  userPlan: "free" | "premium";
}

export default function ChapterGrid({ chapters, userPlan }: ChapterGridProps) {
  const t = useTranslations("public.dashboard.kapitel");

  return (
    <div className="w-full mb-[32px]">
      <div className="text-[#bbb] text-[9px] font-[700] uppercase tracking-[1.5px] mb-[14px]">
        {t("kapitelDesGuides")}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[12px]">
        {chapters.map((ch) => (
          <ChapterCard key={ch.id} chapter={ch} userPlan={userPlan} />
        ))}
        {/* Card "Em breve" fixo no final */}
        <div className="bg-[#fafaf8] border-[0.5px] border-dashed border-[#ddd] rounded-[12px] opacity-60 cursor-default p-[20px] h-full flex flex-col items-start transition-all">
          <div className="flex justify-between items-start w-full mb-[12px]">
            <span className="text-[28px] opacity-30">📖</span>
          </div>
          <h3 className="font-display font-bold text-[#1a1a1a] mb-[4px]">{t("naechsteEditionenTitel")}</h3>
          <p className="text-[12px] text-[#555] mb-[16px] leading-[1.6] line-clamp-2">
            {t("naechsteEditionenText")}
          </p>
          <div className="mt-auto">
            <span className="inline-block px-[8px] py-[3px] bg-[#fff8e1] text-[#b8860b] text-[10px] font-[700] rounded-[6px]">
              {t("demnaechst")}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

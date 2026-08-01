"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { Chapter } from "./ChapterCard";

interface ChapterSidebarProps {
  chapters: Chapter[];
  currentSlug: string;
  userPlan: "free" | "premium";
}

export default function ChapterSidebar({
  chapters,
  currentSlug,
  userPlan,
}: ChapterSidebarProps) {
  const t = useTranslations("public.dashboard.sidebar");
  const isAccessible = (ch: Chapter) => ch.is_free || userPlan === "premium";

  const freeChapters = chapters.filter((ch) => ch.is_free);
  const premiumChapters = chapters.filter((ch) => !ch.is_free);

  return (
    <div className="hidden md:flex flex-col w-[220px] shrink-0 bg-[#ffffff] border-[0.5px] border-[#e0ddd6] rounded-[14px] p-[16px_0] my-[20px] ml-[20px] sticky top-[20px] max-h-[calc(100vh-100px)] overflow-y-auto">
      {/* Kostenlos Section */}
      <div className="text-[#bbb] text-[8px] font-[700] uppercase tracking-[1.5px] px-[14px] mb-[6px]">
        {t("kostenlos")}
      </div>
      <div className="flex flex-col mb-[8px]">
        {freeChapters.map((ch) => {
          const isActive = ch.slug === currentSlug;
          if (isActive) {
            return (
              <div
                key={ch.id}
                className="bg-[#f0faf4] text-[#0f4a2c] font-[700] border-l-[3px] border-l-[#22a262] py-[9px] px-[14px] flex items-center gap-[8px]"
              >
                <span className="text-[13px]">{ch.icon}</span>
                <span className="text-[11px] leading-tight">{ch.title}</span>
              </div>
            );
          }

          return (
            <Link
              key={ch.id}
              href={`/guide/${ch.slug}`}
              className="text-[#555] font-[500] border-l-[3px] border-l-transparent py-[9px] px-[14px] flex items-center gap-[8px] hover:bg-[#f8f8f8] transition-colors"
            >
              <span className="text-[13px]">{ch.icon}</span>
              <span className="text-[11px] leading-tight">{ch.title}</span>
            </Link>
          );
        })}
      </div>

      {/* Divisor */}
      <div className="h-[0.5px] bg-[#e8e4dc] mx-[14px] my-[8px]" />

      {/* Premium Section */}
      <div className="text-[#bbb] text-[8px] font-[700] uppercase tracking-[1.5px] px-[14px] mb-[6px] mt-[8px]">
        {t("edition1")}
      </div>
      <div className="flex flex-col">
        {premiumChapters.map((ch) => {
          const isActive = ch.slug === currentSlug;
          const accessible = isAccessible(ch);

          if (accessible) {
            if (isActive) {
              return (
                <div
                  key={ch.id}
                  className="bg-[#f0faf4] text-[#0f4a2c] font-[700] border-l-[3px] border-l-[#22a262] py-[9px] px-[14px] flex items-center gap-[8px]"
                >
                  <span className="text-[13px]">{ch.icon}</span>
                  <span className="text-[11px] leading-tight">{ch.title}</span>
                </div>
              );
            }
            return (
              <Link
                key={ch.id}
                href={`/guide/${ch.slug}`}
                className="text-[#555] font-[500] border-l-[3px] border-l-transparent py-[9px] px-[14px] flex items-center gap-[8px] hover:bg-[#f8f8f8] transition-colors"
              >
                <span className="text-[13px]">{ch.icon}</span>
                <span className="text-[11px] leading-tight">{ch.title}</span>
              </Link>
            );
          }

          // Bloqueado
          return (
            <div
              key={ch.id}
              onClick={() => {
                const el = document.getElementById("sidebar-upgrade-cta");
                if (el) {
                  el.scrollIntoView({ behavior: "smooth" });
                }
              }}
              className="text-[#ccc] text-[11px] py-[9px] px-[14px] flex items-center cursor-pointer hover:bg-[#f8f8f8] transition-colors"
            >
              <span className="text-[13px] mr-[8px]">{ch.icon}</span>
              <span className="flex-1">{ch.title}</span>
              <span className="text-[9px] text-[#ddd]">🔒</span>
            </div>
          );
        })}
      </div>

      {/* Mini CTA Upgrade */}
      {userPlan === "free" ? (
        <div
          id="sidebar-upgrade-cta"
          className="bg-[#0d1f15] rounded-[10px] m-[12px_10px_0] p-[12px] flex flex-col"
        >
          <h3 className="text-[#f5c518] text-[10px] font-[700] mb-[2px]">
            {t("alleKapitelFreischalten")}
          </h3>
          <p className="text-[#99ddee] text-[8px] leading-[1.4] mb-[8px]">
            {t("edBis4")}
          </p>
          <Link
            href="/dashboard/upgrade"
            className="bg-[#f5c518] text-[#0d1f15] text-[9px] font-[800] py-[6px] px-[10px] rounded-[6px] text-center w-full hover:bg-[#e6b800] transition-colors"
          >
            {t("jetztFuer")}
          </Link>
        </div>
      ) : (
        <div className="bg-[#f0faf4] rounded-[10px] m-[12px_10px_0] p-[12px] flex flex-col items-start border border-[#e8f5e9]">
          <h3 className="text-[#22a262] text-[10px] font-[700]">
            {t("vollzugangAktiv")}
          </h3>
          <p className="text-[#0f4a2c] text-[8px] mt-[2px] leading-[1.4]">
            {t("alleKapitelFreigeschaltet")}
          </p>
        </div>
      )}
    </div>
  );
}

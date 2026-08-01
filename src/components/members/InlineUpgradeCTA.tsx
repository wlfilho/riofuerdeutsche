"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";

interface InlineUpgradeCTAProps {
  userPlan: "free" | "premium";
}

export default function InlineUpgradeCTA({ userPlan }: InlineUpgradeCTAProps) {
  const t = useTranslations("public.cta.inlineUpgrade");

  if (userPlan === "premium") return null;

  return (
    <div className="bg-[#0d1f15] rounded-[12px] py-[20px] px-[24px] mt-[24px] flex flex-col items-start w-full relative z-10 shadow-lg">
      <h3 className="font-display text-[#f8f5f0] text-[14px] font-[800] mb-[4px]">
        {t("titel")}
      </h3>
      <p className="text-[#99ddee] text-[11px] mb-[16px]">
        {t("subtitel")}
      </p>

      <Link
        href="/dashboard/upgrade"
        className="inline-block bg-[#f5c518] text-[#0d1f15] font-[800] text-[12px] py-[10px] px-[20px] rounded-[8px] hover:bg-[#e6b800] transition-colors"
      >
        {t("button")}
      </Link>
    </div>
  );
}

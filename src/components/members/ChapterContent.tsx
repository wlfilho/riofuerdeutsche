"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useTranslations } from "next-intl";

interface ChapterContentProps {
  content: string | any;
  isLockedPreview?: boolean;
}

export default function ChapterContent({
  content,
  isLockedPreview,
}: ChapterContentProps) {
  const t = useTranslations("public.dashboard");

  // Parsing the content if it's string array or normal markdown
  let text = typeof content === "string" ? content : "";

  if (typeof content === "object" && content !== null) {
    // Caso de uso: Se o DB possuir JSON, criamos um preview ou lidamos graciosamente
    try {
      text =
        content.content
          ?.map((c: any) => c.content?.map((n: any) => n.text).join(" "))
          .join("\n\n") || t("contentUnavailable");
    } catch (e) {
      text = "";
    }
  }

  // Se for bloqueado, extraímos apenas as 2-3 primeiras linhas
  if (isLockedPreview) {
    const lines = text
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);
    text = lines.slice(0, 3).join("\n\n") + "\n\n...";
  }

  return (
    <div
      className="relative w-full overflow-hidden"
      style={
        isLockedPreview
          ? {
              WebkitMaskImage:
                "linear-gradient(to bottom, black 40%, transparent 100%)",
              maskImage:
                "linear-gradient(to bottom, black 40%, transparent 100%)",
              maxHeight: "280px",
            }
          : {}
      }
    >
      <div className="prose prose-p:text-[#2d2d2d] prose-p:text-[15px] prose-p:leading-[1.8] prose-p:mb-[16px] prose-headings:text-[#1a1a1a] prose-h2:font-[800] prose-h2:text-[20px] prose-h2:mt-[32px] prose-h2:mb-[12px] prose-h3:font-[700] prose-h3:text-[16px] prose-h3:mt-[24px] prose-h3:mb-[8px] prose-strong:text-[#0f4a2c] prose-strong:font-[700] prose-ul:pl-[20px] prose-ul:mb-[16px] prose-ul:list-disc prose-li:leading-[1.7] prose-li:text-[15px] prose-li:text-[#2d2d2d] prose-li:mb-[4px] prose-blockquote:border-l-[3px] prose-blockquote:border-l-[#22a262] prose-blockquote:bg-[#f0faf4] prose-blockquote:p-[12px_16px] prose-blockquote:rounded-r-[8px] prose-blockquote:text-[14px] prose-blockquote:text-[#2d4a35] prose-blockquote:my-[20px] prose-blockquote:italic max-w-none">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            h2: ({ node, ...props }) => (
              <h2 className="font-display" {...props} />
            ),
          }}
        >
          {text}
        </ReactMarkdown>
      </div>
    </div>
  );
}

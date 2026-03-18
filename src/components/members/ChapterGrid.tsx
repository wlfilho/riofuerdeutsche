import ChapterCard, { Chapter } from "./ChapterCard";

export const hardcodedChapters: Chapter[] = [
  {
    id: "1",
    icon: "🛡️",
    title: "Sicherheit in Rio",
    description: "Die 7 gefährlichsten Fehler, die deutsche Touristen machen — und wie du sie vermeidest.",
    slug: "sicherheit",
    access: "free",
    edition: 1,
  },
  {
    id: "2",
    icon: "✈️",
    title: "Wie du nach Rio kommst",
    description: "Flughafen, Transfer, erste Schritte — alles was du vor der Ankunft wissen musst.",
    slug: "anreise",
    access: "locked",
    edition: 1,
  },
  {
    id: "3",
    icon: "🏨",
    title: "Unterkunft in Rio",
    description: "Sichere Viertel nach Budget, AirBnB vs. Hotel, Buchungs-Checkliste.",
    slug: "unterkunft",
    access: "locked",
    edition: 1,
  },
  {
    id: "4",
    icon: "🚇",
    title: "Transport in Rio",
    description: "Uber, Metrô, Bus — sicher und günstig unterwegs in Rio.",
    slug: "transport",
    access: "locked",
    edition: 1,
  },
  {
    id: "5",
    icon: "🏔️",
    title: "Hauptattraktionen",
    description: "Cristo Redentor, Pão de Açúcar, Praias — Routen und Insider-Tipps.",
    slug: "attraktionen",
    access: "locked",
    edition: 1,
  },
  {
    id: "6",
    icon: "📖",
    title: "Edition 2, 3, 4...",
    description: "Bairros, Gastronomia, Karneval, Kultur — em breve.",
    slug: "",
    access: "coming_soon",
    edition: 2,
  },
];

interface ChapterGridProps {
  userPlan: "free" | "premium";
}

export default function ChapterGrid({ userPlan }: ChapterGridProps) {
  return (
    <div className="w-full mb-[32px]">
      <div className="text-[#bbb] text-[9px] font-[700] uppercase tracking-[1.5px] mb-[14px]">
        KAPITEL DES GUIDES
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[12px]">
        {hardcodedChapters.map((ch) => (
          <ChapterCard key={ch.id} chapter={ch} userPlan={userPlan} />
        ))}
      </div>
    </div>
  );
}

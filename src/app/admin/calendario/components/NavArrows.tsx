'use client';

import { useTranslations } from 'next-intl';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function NavArrows({
  label,
  onPrev,
  onNext,
}: {
  label: string;
  onPrev: () => void;
  onNext: () => void;
}) {
  const t = useTranslations('admin.calendario');
  return (
    <div className="flex items-center justify-between mb-4">
      <button
        onClick={onPrev}
        className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-800 transition-colors"
        aria-label={t('anterior')}
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <p className="text-base font-semibold text-gray-900">{label}</p>
      <button
        onClick={onNext}
        className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-800 transition-colors"
        aria-label={t('proximo')}
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
}

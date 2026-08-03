'use client';

import { useTranslations } from 'next-intl';

export type LeadSource = 'calculator' | 'email' | 'whatsapp' | 'instagram' | 'referral' | 'other';

const SOURCE_CLASS: Record<LeadSource, string> = {
  calculator: 'bg-slate-100 text-slate-600',
  email: 'bg-indigo-100 text-indigo-700',
  whatsapp: 'bg-green-100 text-green-700',
  instagram: 'bg-pink-100 text-pink-700',
  referral: 'bg-orange-100 text-orange-700',
  other: 'bg-gray-100 text-gray-600',
};

export default function SourceBadge({ source }: { source: LeadSource }) {
  const t = useTranslations('admin.status.source');
  const className = SOURCE_CLASS[source] ?? SOURCE_CLASS.other;
  return (
    <span className={`inline-block px-2 py-0.5 text-xs font-semibold rounded-full ${className}`}>
      {t.has(source) ? t(source) : t('other')}
    </span>
  );
}

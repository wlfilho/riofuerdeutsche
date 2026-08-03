'use client';

import { useTranslations } from 'next-intl';

export type LeadStatus = 'new' | 'contacted' | 'proposal_sent' | 'closed' | 'lost';

const STATUS_CLASS: Record<LeadStatus, string> = {
  new: 'bg-blue-100 text-blue-700',
  contacted: 'bg-amber-100 text-amber-700',
  proposal_sent: 'bg-purple-100 text-purple-700',
  closed: 'bg-green-100 text-green-700',
  lost: 'bg-red-100 text-red-700',
};

export default function StatusBadge({ status }: { status: LeadStatus }) {
  const t = useTranslations('admin.status.lead');
  const className = STATUS_CLASS[status] ?? STATUS_CLASS.new;
  return (
    <span className={`inline-block px-2 py-0.5 text-xs font-semibold rounded-full ${className}`}>
      {t.has(status) ? t(status) : t('new')}
    </span>
  );
}

import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import StatusBadge from '../../components/StatusBadge';
import type { Lead } from '../../page';

export default async function LeadHeader({ lead }: { lead: Lead }) {
  const t = await getTranslations('admin.crm');
  return (
    <div className="flex items-center gap-3 mb-6 flex-wrap">
      <Link
        href="/admin/leads"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors"
      >
        <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
          <path
            fillRule="evenodd"
            d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z"
            clipRule="evenodd"
          />
        </svg>
        {t('leads')}
      </Link>

      <span className="text-gray-300">/</span>

      <h1 className="text-xl font-bold text-gray-900 flex-1 min-w-0 truncate">{lead.name}</h1>

      <StatusBadge status={lead.status} />
    </div>
  );
}

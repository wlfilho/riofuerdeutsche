'use client';

import Link from 'next/link';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { useTranslations } from 'next-intl';
import SourceBadge from './SourceBadge';
import LeadFlagBadges from '@/components/admin/LeadFlagBadges';
import GroupBadges from '@/components/admin/GroupBadges';
import { fmtDate } from '@/lib/adminFormat';
import type { LeadView } from '../page';

export function KanbanCardContent({ lead, isDragging = false }: { lead: LeadView; isDragging?: boolean }) {
  const t = useTranslations('admin.crm');
  const tReason = useTranslations('admin.crm.motivoArquivo');
  const canConvert = lead.status !== 'closed' && lead.status !== 'lost';
  const archived = lead.archiveReason !== null;

  return (
    <div
      className={`rounded-xl border p-3 select-none transition-shadow ${
        archived ? 'bg-gray-50 border-gray-200 border-dashed' : 'bg-white border-gray-200'
      } ${isDragging ? 'shadow-lg rotate-1' : 'shadow-sm'}`}
    >
      {/* Header: name + source badge */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <Link
          href={`/admin/leads/${lead.id}`}
          onClick={e => e.stopPropagation()}
          className={`font-semibold text-sm hover:text-green-700 transition-colors leading-snug ${
            archived ? 'text-gray-500' : 'text-gray-900'
          }`}
        >
          {lead.name}
        </Link>
        <div className="flex flex-col items-end gap-1">
          <SourceBadge source={lead.source} />
          <GroupBadges groups={lead.groups} />
        </div>
      </div>

      <LeadFlagBadges lead={lead} className="mb-1.5" />

      {archived && (
        <span
          className="inline-block mb-1.5 px-1.5 py-0.5 text-[10px] font-semibold rounded-full bg-gray-200 text-gray-600"
          title={tReason(lead.archiveReason ?? 'manual')}
        >
          {t('arquivado')}
        </span>
      )}

      {/* Email */}
      <a
        href={`mailto:${lead.email}`}
        onClick={e => e.stopPropagation()}
        className="block text-xs text-gray-400 hover:text-green-700 transition-colors mb-2 truncate"
      >
        {lead.email}
      </a>

      {/* Meta */}
      <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
        <span className="inline-flex items-center gap-1">
          <svg className="h-3 w-3 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10 9a3 3 0 100-6 3 3 0 000 6zM6 8a2 2 0 11-4 0 2 2 0 014 0zM1.49 15.326a.78.78 0 01-.358-.442 3 3 0 014.308-3.516 6.484 6.484 0 00-1.905 3.959c-.023.222-.014.442.025.654a4.97 4.97 0 01-2.07-.655zM16.44 15.98a4.97 4.97 0 002.07-.654.78.78 0 00.357-.442 3 3 0 00-4.308-3.517 6.484 6.484 0 011.907 3.96 2.32 2.32 0 01-.026.654zM18 8a2 2 0 11-4 0 2 2 0 014 0zM5.304 16.19a.844.844 0 01-.277-.71 5 5 0 019.947 0 .843.843 0 01-.277.71A6.975 6.975 0 0110 18a6.974 6.974 0 01-4.696-1.81z" />
          </svg>
          {lead.pax}
        </span>
        {/* A data do tour é a informação operacional; a de criação só aparece
            quando o lead ainda não tem data marcada. */}
        {lead.tourDate ? (
          <span
            className={`inline-flex items-center gap-1 font-medium ${
              lead.tourDatePast ? 'text-gray-400' : 'text-gray-700'
            }`}
            title={t('dataDoTour')}
          >
            <svg className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
            </svg>
            {fmtDate(lead.tourDate)}
          </span>
        ) : (
          <span className="inline-flex items-center gap-1" title={t('criadoEm')}>
            <svg className="h-3 w-3 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
            </svg>
            {fmtDate(lead.created_at)}
          </span>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1.5 border-t border-gray-50 pt-2">
        <Link
          href={`/admin/leads/${lead.id}`}
          onClick={e => e.stopPropagation()}
          className="flex-1 text-center px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200 transition-colors"
        >
          {t('ver')}
        </Link>
        {canConvert && (
          <Link
            href={`/admin/propostas/nova?lead_id=${lead.id}`}
            onClick={e => e.stopPropagation()}
            className="flex-1 text-center px-2 py-1 text-xs font-medium bg-green-50 text-green-700 rounded-md hover:bg-green-100 transition-colors"
          >
            {t('converter')}
          </Link>
        )}
      </div>
    </div>
  );
}

export default function KanbanCard({ lead }: { lead: LeadView }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: lead.id,
    data: { lead },
  });

  const style = transform
    ? { transform: CSS.Translate.toString(transform) }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`cursor-grab active:cursor-grabbing ${isDragging ? 'opacity-30' : ''}`}
    >
      <KanbanCardContent lead={lead} isDragging={false} />
    </div>
  );
}

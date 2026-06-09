'use client';

import { useDroppable } from '@dnd-kit/core';
import KanbanCard from './KanbanCard';
import type { Lead, LeadStatus } from '../page';

type ColumnConfig = {
  id: LeadStatus;
  label: string;
  headerClass: string;
  countClass: string;
};

export const KANBAN_COLUMNS: ColumnConfig[] = [
  {
    id: 'new',
    label: 'Novo',
    headerClass: 'bg-blue-50 border-blue-100 text-blue-700',
    countClass: 'bg-blue-100 text-blue-700',
  },
  {
    id: 'contacted',
    label: 'Em Contato',
    headerClass: 'bg-amber-50 border-amber-100 text-amber-700',
    countClass: 'bg-amber-100 text-amber-700',
  },
  {
    id: 'proposal_sent',
    label: 'Proposta Enviada',
    headerClass: 'bg-purple-50 border-purple-100 text-purple-700',
    countClass: 'bg-purple-100 text-purple-700',
  },
  {
    id: 'closed',
    label: 'Fechado',
    headerClass: 'bg-green-50 border-green-100 text-green-700',
    countClass: 'bg-green-100 text-green-700',
  },
  {
    id: 'lost',
    label: 'Perdido',
    headerClass: 'bg-red-50 border-red-100 text-red-700',
    countClass: 'bg-red-100 text-red-700',
  },
];

export default function KanbanColumn({
  column,
  leads,
}: {
  column: ColumnConfig;
  leads: Lead[];
}) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id });

  return (
    <div className="flex flex-col w-64 shrink-0">
      {/* Column header */}
      <div className={`flex items-center justify-between px-3 py-2 rounded-t-xl border ${column.headerClass} mb-2`}>
        <span className="text-xs font-semibold">{column.label}</span>
        <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${column.countClass}`}>
          {leads.length}
        </span>
      </div>

      {/* Drop zone */}
      <div
        ref={setNodeRef}
        className={`flex-1 min-h-24 max-h-[calc(100vh-280px)] overflow-y-auto rounded-b-xl space-y-2 p-1 transition-colors ${
          isOver ? 'bg-gray-100' : 'bg-gray-50/60'
        }`}
      >
        {leads.length === 0 ? (
          <div className="flex items-center justify-center h-20 border-2 border-dashed border-gray-200 rounded-lg">
            <p className="text-xs text-gray-400">Nenhum lead</p>
          </div>
        ) : (
          leads.map(lead => <KanbanCard key={lead.id} lead={lead} />)
        )}
      </div>
    </div>
  );
}

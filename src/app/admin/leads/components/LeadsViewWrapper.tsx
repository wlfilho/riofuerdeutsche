'use client';

import { useState, useEffect } from 'react';
import LeadViewToggle, { type LeadsView } from './LeadViewToggle';
import LeadFilters from './LeadFilters';
import LeadsTable from './LeadsTable';
import LeadsKanban from './LeadsKanban';
import { useTranslations } from 'next-intl';
import type { LeadView } from '../page';

const STORAGE_KEY = 'leads-view';

type Props = {
  allLeads: LeadView[];
  filteredLeads: LeadView[];
  currentStatus?: string;
  currentSource?: string;
  currentCampaign?: string;
  currentQ?: string;
};

export default function LeadsViewWrapper({
  allLeads,
  filteredLeads,
  currentStatus,
  currentSource,
  currentCampaign,
  currentQ,
}: Props) {
  const [view, setView] = useState<LeadsView>('table');
  const [showArchived, setShowArchived] = useState(false);
  const t = useTranslations('admin.crm');

  // O kanban é a visão do que está pela frente, então esconde arquivados por
  // padrão. A tabela é a visão de histórico e busca: mostra tudo sempre.
  const archivedCount = allLeads.filter(l => l.archiveReason !== null).length;
  const kanbanLeads = showArchived ? allLeads : allLeads.filter(l => l.archiveReason === null);

  // Read preference from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'kanban' || saved === 'table') setView(saved);
  }, []);

  const handleViewChange = (v: LeadsView) => {
    setView(v);
    localStorage.setItem(STORAGE_KEY, v);
  };

  return (
    <div>
      {/* Filter bar + toggle */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="flex-1 min-w-0">
          <LeadFilters
            currentStatus={currentStatus}
            currentSource={currentSource}
            currentCampaign={currentCampaign}
            currentQ={currentQ}
            hideStatus={view === 'kanban'}
          />
        </div>
        {view === 'kanban' && archivedCount > 0 && (
          <button
            onClick={() => setShowArchived(v => !v)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg border transition-colors ${
              showArchived
                ? 'bg-gray-800 text-white border-gray-800 hover:bg-gray-700'
                : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
            }`}
          >
            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path d="M4 3a2 2 0 00-2 2v1a1 1 0 001 1h14a1 1 0 001-1V5a2 2 0 00-2-2H4z" />
              <path fillRule="evenodd" d="M3 8h14v7a2 2 0 01-2 2H5a2 2 0 01-2-2V8zm5 2a1 1 0 100 2h4a1 1 0 100-2H8z" clipRule="evenodd" />
            </svg>
            {showArchived ? t('ocultarArquivados') : t('mostrarArquivados', { count: archivedCount })}
          </button>
        )}
        <LeadViewToggle view={view} onChange={handleViewChange} />
      </div>

      {/* Views */}
      {view === 'table' ? (
        <LeadsTable leads={filteredLeads} />
      ) : (
        <LeadsKanban allLeads={kanbanLeads} />
      )}
    </div>
  );
}

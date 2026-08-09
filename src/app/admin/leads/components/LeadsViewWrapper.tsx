'use client';

import { useState, useEffect } from 'react';
import LeadViewToggle, { type LeadsView } from './LeadViewToggle';
import LeadFilters from './LeadFilters';
import LeadsTable from './LeadsTable';
import LeadsKanban from './LeadsKanban';
import type { Lead } from '../page';

const STORAGE_KEY = 'leads-view';

type Props = {
  allLeads: Lead[];
  filteredLeads: Lead[];
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
        <LeadViewToggle view={view} onChange={handleViewChange} />
      </div>

      {/* Views */}
      {view === 'table' ? (
        <LeadsTable leads={filteredLeads} />
      ) : (
        <LeadsKanban allLeads={allLeads} />
      )}
    </div>
  );
}

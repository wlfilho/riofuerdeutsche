'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import CrmKanban from './CrmKanban';
import CrmTable from './CrmTable';
import LeadDrawer from '@/components/admin/LeadDrawer';
import LeadModal from '@/components/admin/LeadModal';
import type { CrmLead } from '../page';

type View = 'kanban' | 'table';
const STORAGE_KEY = 'crm-view';

export default function CrmViewWrapper({ leads: initialLeads }: { leads: CrmLead[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [view, setView] = useState<View>('kanban');
  const [leads, setLeads] = useState<CrmLead[]>(initialLeads);
  const [selectedLead, setSelectedLead] = useState<CrmLead | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'kanban' || saved === 'table') setView(saved as View);
  }, []);

  // Deep link from the calendar ("Ver no CRM"): open the lead's drawer
  useEffect(() => {
    const leadId = searchParams.get('lead');
    if (!leadId) return;
    const lead = initialLeads.find(l => l.id === leadId);
    if (lead) setSelectedLead(lead);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // Sync when server re-renders (e.g. after creating a lead)
  useEffect(() => {
    setLeads(initialLeads);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialLeads.length]);

  const handleViewChange = (v: View) => {
    setView(v);
    localStorage.setItem(STORAGE_KEY, v);
  };

  const handleLeadUpdate = (updated: CrmLead) => {
    setLeads(prev => prev.map(l => l.id === updated.id ? updated : l));
    if (selectedLead?.id === updated.id) setSelectedLead(updated);
  };

  const handleLeadDelete = (id: string) => {
    setLeads(prev => prev.filter(l => l.id !== id));
    if (selectedLead?.id === id) setSelectedLead(null);
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <div className="flex items-center bg-gray-100 rounded-lg p-1 gap-1">
          <button
            onClick={() => handleViewChange('kanban')}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
              view === 'kanban' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Kanban
          </button>
          <button
            onClick={() => handleViewChange('table')}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
              view === 'table' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Tabelle
          </button>
        </div>

        <LeadModal onCreated={() => router.refresh()} />
      </div>

      {view === 'kanban' ? (
        <CrmKanban
          leads={leads}
          onLeadClick={setSelectedLead}
          onStatusChange={handleLeadUpdate}
        />
      ) : (
        <CrmTable
          leads={leads}
          onLeadClick={setSelectedLead}
          onLeadDelete={handleLeadDelete}
        />
      )}

      {selectedLead && (
        <LeadDrawer
          lead={selectedLead}
          onClose={() => setSelectedLead(null)}
          onLeadUpdate={handleLeadUpdate}
        />
      )}
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import CrmKanban from './CrmKanban';
import CrmTable from './CrmTable';
import LeadDrawer from '@/components/admin/LeadDrawer';
import LeadModal from '@/components/admin/LeadModal';
import type { CrmLeadView } from '../page';

type View = 'kanban' | 'table';
const STORAGE_KEY = 'crm-view';

export default function CrmViewWrapper({ leads: initialLeads }: { leads: CrmLeadView[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [view, setView] = useState<View>('kanban');
  const [leads, setLeads] = useState<CrmLeadView[]>(initialLeads);
  const [selectedLead, setSelectedLead] = useState<CrmLeadView | null>(null);
  const [showArchived, setShowArchived] = useState(false);
  const t = useTranslations('admin.crm');

  // O kanban é a visão do que está pela frente, então esconde arquivados por
  // padrão. A tabela é a visão de histórico e busca: mostra tudo sempre.
  const archivedCount = leads.filter(l => l.archiveReason !== null).length;
  const kanbanLeads = showArchived ? leads : leads.filter(l => l.archiveReason === null);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'kanban' || saved === 'table') setView(saved as View);
  }, []);

  // Deep link from the calendar ("Ver no CRM"): open the lead's drawer
  useEffect(() => {
    const leadId = searchParams.get('lead');
    if (!leadId) return;
    const lead = initialLeads.find(l => l.id === leadId);
    if (!lead) return;
    setSelectedLead(lead);
    // Deep link para um lead arquivado (calendário → "Ver no CRM") precisa
    // deixá-lo visível atrás do drawer, senão o kanban parece vazio.
    if (lead.archiveReason !== null) setShowArchived(true);
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

  const handleLeadUpdate = (updated: CrmLeadView) => {
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
            {t('kanban')}
          </button>
          <button
            onClick={() => handleViewChange('table')}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
              view === 'table' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {t('tabela')}
          </button>
        </div>

        <div className="flex items-center gap-2">
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
          <LeadModal onCreated={() => router.refresh()} />
        </div>
      </div>

      {view === 'kanban' ? (
        <CrmKanban
          leads={kanbanLeads}
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

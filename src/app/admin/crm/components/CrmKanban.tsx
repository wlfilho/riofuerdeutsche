'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  useDraggable,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { useTranslations } from 'next-intl';
import TourDateKanbanFlow, { type KanbanStatusChange } from '@/components/admin/TourDateKanbanFlow';
import { fmtDate, fmtEur } from '@/lib/adminFormat';
import LeadFlagBadges from '@/components/admin/LeadFlagBadges';
import { refreshArchiveReason } from '@/lib/leadArchive';
import type { CrmLeadView, LeadStatus } from '../page';

type ColumnConfig = {
  id: LeadStatus;
  headerClass: string;
  countClass: string;
};

const COLUMNS: ColumnConfig[] = [
  { id: 'new', headerClass: 'bg-gray-100 border-gray-200 text-gray-700', countClass: 'bg-gray-200 text-gray-700' },
  { id: 'contacted', headerClass: 'bg-blue-50 border-blue-100 text-blue-700', countClass: 'bg-blue-100 text-blue-700' },
  { id: 'proposal_sent', headerClass: 'bg-amber-50 border-amber-100 text-amber-700', countClass: 'bg-amber-100 text-amber-700' },
  { id: 'closed', headerClass: 'bg-green-50 border-green-100 text-green-700', countClass: 'bg-green-100 text-green-700' },
  // Teal, não verde: "fechado" é dinheiro combinado, "concluído" é tour entregue.
  { id: 'completed', headerClass: 'bg-teal-50 border-teal-100 text-teal-700', countClass: 'bg-teal-100 text-teal-700' },
  { id: 'lost', headerClass: 'bg-red-50 border-red-100 text-red-700', countClass: 'bg-red-100 text-red-700' },
];

/**
 * Ordena a coluna pelo que está mais perto de acontecer. Leads sem data
 * nenhuma (entrada manual, perdidos antigos) vão para o fim, entre si pelo
 * mais recente — lá o que importa é a chegada, não o calendário.
 */
function byUpcoming(a: CrmLeadView, b: CrmLeadView) {
  // Com "mostrar arquivados" ligado, o histórico vai para depois do que ainda
  // está em jogo — senão os tours antigos ocupam o topo da coluna.
  const archivedA = a.archiveReason !== null;
  const archivedB = b.archiveReason !== null;
  if (archivedA !== archivedB) return archivedA ? 1 : -1;
  if (a.tourDate && b.tourDate) {
    if (a.tourDate !== b.tourDate) return a.tourDate < b.tourDate ? -1 : 1;
    return 0;
  }
  if (a.tourDate) return -1;
  if (b.tourDate) return 1;
  return a.created_at < b.created_at ? 1 : -1;
}

function formatEstimate(min: number | null, max: number | null) {
  if (min === null && max === null) return null;
  if (min !== null && max !== null) return `${fmtEur(min)}–${fmtEur(max)}`;
  return fmtEur(min ?? max);
}

function CardContent({ lead, isDragging = false }: { lead: CrmLeadView; isDragging?: boolean }) {
  const tSource = useTranslations('admin.status.source');
  const tCommon = useTranslations('admin.common');
  const t = useTranslations('admin.crm');
  const tReason = useTranslations('admin.crm.motivoArquivo');
  const estimate = formatEstimate(lead.estimated_min, lead.estimated_max);
  const archived = lead.archiveReason !== null;
  return (
    <div
      className={`rounded-xl border p-3 select-none transition-shadow ${
        archived ? 'bg-gray-50 border-gray-200 border-dashed' : 'bg-white border-gray-200'
      } ${isDragging ? 'shadow-lg rotate-1' : 'shadow-sm'}`}
    >
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <span className={`font-semibold text-sm leading-snug ${archived ? 'text-gray-500' : 'text-gray-900'}`}>
          {lead.name}
        </span>
        <span className="inline-block shrink-0 px-1.5 py-0.5 text-[10px] font-semibold rounded-full bg-slate-100 text-slate-600">
          {tSource.has(lead.source) ? tSource(lead.source) : lead.source}
        </span>
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

      <p className="text-xs text-gray-400 mb-2 truncate">{lead.email}</p>

      <div className="flex items-center gap-3 text-xs text-gray-500 mb-2">
        <span className="inline-flex items-center gap-1">
          <svg className="h-3 w-3 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10 9a3 3 0 100-6 3 3 0 000 6zM6 8a2 2 0 11-4 0 2 2 0 014 0zM1.49 15.326a.78.78 0 01-.358-.442 3 3 0 014.308-3.516 6.484 6.484 0 00-1.905 3.959c-.023.222-.014.442.025.654a4.97 4.97 0 01-2.07-.655zM16.44 15.98a4.97 4.97 0 002.07-.654.78.78 0 00.357-.442 3 3 0 00-4.308-3.517 6.484 6.484 0 011.907 3.96 2.32 2.32 0 01-.026.654zM18 8a2 2 0 11-4 0 2 2 0 014 0zM5.304 16.19a.844.844 0 01-.277-.71 5 5 0 019.947 0 .843.843 0 01-.277.71A6.975 6.975 0 0110 18a6.974 6.974 0 01-4.696-1.81z" />
          </svg>
          {lead.pax} {tCommon('pax')}
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

      {estimate && (
        <p className="text-xs font-medium text-gray-700">{estimate}</p>
      )}
    </div>
  );
}

function DraggableCard({ lead, onOpenDrawer }: { lead: CrmLeadView; onOpenDrawer: (lead: CrmLeadView) => void }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: lead.id,
    data: { lead },
  });

  const style = transform ? { transform: CSS.Translate.toString(transform) } : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`cursor-grab active:cursor-grabbing ${isDragging ? 'opacity-30' : ''}`}
      onClick={() => onOpenDrawer(lead)}
    >
      <CardContent lead={lead} />
    </div>
  );
}

function KanbanColumn({
  column,
  leads,
  onLeadClick,
}: {
  column: ColumnConfig;
  leads: CrmLeadView[];
  onLeadClick: (lead: CrmLeadView) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id });
  const t = useTranslations('admin.crm');
  const tStatus = useTranslations('admin.status.lead');

  return (
    <div className="flex flex-col w-64 shrink-0">
      <div className={`flex items-center justify-between px-3 py-2 rounded-t-xl border ${column.headerClass} mb-2`}>
        <span className="text-xs font-semibold">{tStatus(column.id)}</span>
        <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${column.countClass}`}>
          {leads.length}
        </span>
      </div>

      <div
        ref={setNodeRef}
        className={`flex-1 min-h-24 max-h-[calc(100vh-300px)] overflow-y-auto rounded-b-xl space-y-2 p-1 transition-colors ${
          isOver ? 'bg-gray-100' : 'bg-gray-50/60'
        }`}
      >
        {leads.length === 0 ? (
          <div className="flex items-center justify-center h-20 border-2 border-dashed border-gray-200 rounded-lg">
            <p className="text-xs text-gray-400">{t('nenhumLead')}</p>
          </div>
        ) : (
          leads.map(lead => (
            <DraggableCard key={lead.id} lead={lead} onOpenDrawer={onLeadClick} />
          ))
        )}
      </div>
    </div>
  );
}

function Toast({ message, onDone }: { message: string; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3000);
    return () => clearTimeout(t);
  }, [onDone]);
  return (
    <div className="fixed bottom-6 right-6 z-50 px-4 py-3 bg-gray-900 text-white text-sm rounded-xl shadow-lg">
      {message}
    </div>
  );
}

export default function CrmKanban({
  leads: initialLeads,
  onLeadClick,
  onStatusChange,
}: {
  leads: CrmLeadView[];
  onLeadClick: (lead: CrmLeadView) => void;
  onStatusChange: (updated: CrmLeadView) => void;
}) {
  const [leads, setLeads] = useState<CrmLeadView[]>(initialLeads);
  const [activeLead, setActiveLead] = useState<CrmLeadView | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [tourFlow, setTourFlow] = useState<KanbanStatusChange | null>(null);
  const clearToast = useCallback(() => setToast(null), []);
  const t = useTranslations('admin.crm');
  const tCommon = useTranslations('admin.common');

  useEffect(() => {
    setLeads(initialLeads);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialLeads.length]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const lead = leads.find(l => l.id === event.active.id);
    setActiveLead(lead ?? null);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveLead(null);
    const { active, over } = event;
    if (!over) return;

    const newStatus = over.id as LeadStatus;
    const lead = leads.find(l => l.id === active.id);
    if (!lead || lead.status === newStatus) return;

    const prev = [...leads];
    // Trocar o status pode tirar (ou pôr) o card no arquivo — um perdido
    // antigo que volta para "novo" tem de reaparecer na hora.
    const updated = refreshArchiveReason({ ...lead, status: newStatus });
    setLeads(curr => curr.map(l => l.id === lead.id ? updated : l));
    onStatusChange(updated);

    try {
      const res = await fetch(`/api/admin/leads/${lead.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) {
        const data = await res.json();
        setLeads(prev);
        onStatusChange(lead);
        setToast(tCommon('erroPrefixo', { mensagem: data.error ?? t('falhaAtualizarStatus') }));
      } else {
        setTourFlow({
          leadId: lead.id,
          leadName: lead.name,
          pax: lead.pax ?? null,
          oldStatus: lead.status,
          newStatus,
        });
      }
    } catch {
      setLeads(prev);
      onStatusChange(lead);
      setToast(tCommon('erroRede'));
    }
  };

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-3 overflow-x-auto pb-4 -mx-1 px-1">
          {COLUMNS.map(col => (
            <KanbanColumn
              key={col.id}
              column={col}
              leads={leads.filter(l => l.status === col.id).sort(byUpcoming)}
              onLeadClick={onLeadClick}
            />
          ))}
        </div>

        <DragOverlay dropAnimation={null}>
          {activeLead ? (
            <div className="w-64 opacity-90 rotate-1">
              <CardContent lead={activeLead} isDragging />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      <TourDateKanbanFlow change={tourFlow} onClose={() => setTourFlow(null)} />

      {toast && <Toast message={toast} onDone={clearToast} />}
    </>
  );
}

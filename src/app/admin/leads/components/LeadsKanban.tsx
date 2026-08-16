'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  DndContext,
  DragOverlay,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core';
import { useTranslations } from 'next-intl';
import KanbanColumn, { KANBAN_COLUMNS } from './KanbanColumn';
import { KanbanCardContent } from './KanbanCard';
import TourDateKanbanFlow, { type KanbanStatusChange } from '@/components/admin/TourDateKanbanFlow';
import { refreshArchiveReason } from '@/lib/leadArchive';
import type { LeadView, LeadStatus } from '../page';

/**
 * Ordena a coluna pelo que está mais perto de acontecer, com o arquivo no fim.
 * Leads sem data nenhuma vão depois dos datados, entre si pelo mais recente —
 * lá o que importa é a chegada, não o calendário.
 */
function byUpcoming(a: LeadView, b: LeadView) {
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

export default function LeadsKanban({ allLeads }: { allLeads: LeadView[] }) {
  const [leads, setLeads] = useState<LeadView[]>(allLeads);
  const [activeLead, setActiveLead] = useState<LeadView | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [tourFlow, setTourFlow] = useState<KanbanStatusChange | null>(null);
  const clearToast = useCallback(() => setToast(null), []);
  const t = useTranslations('admin.crm');
  const tCommon = useTranslations('admin.common');

  const searchParams = useSearchParams();

  // Sync when server re-renders with new data (e.g. after creating a lead)
  useEffect(() => {
    setLeads(allLeads);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allLeads.length]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  // Client-side filter (no status filter — kanban shows all statuses)
  const q = searchParams.get('q')?.toLowerCase() ?? '';
  const source = searchParams.get('source') ?? '';

  const filteredLeads = leads.filter(l => {
    if (q && !l.name.toLowerCase().includes(q) && !l.email.toLowerCase().includes(q)) return false;
    if (source && l.source !== source) return false;
    return true;
  });

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

    // Optimistic update. Trocar o status pode tirar (ou pôr) o card no
    // arquivo — um perdido antigo que volta para "novo" tem de reaparecer.
    const prev = [...leads];
    const updated = refreshArchiveReason({ ...lead, status: newStatus });
    setLeads(curr => curr.map(l => l.id === lead.id ? updated : l));

    try {
      const res = await fetch(`/api/admin/leads/${lead.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) {
        const data = await res.json();
        setLeads(prev);
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
          {KANBAN_COLUMNS.map(col => (
            <KanbanColumn
              key={col.id}
              column={col}
              leads={filteredLeads.filter(l => l.status === col.id).sort(byUpcoming)}
            />
          ))}
        </div>

        <DragOverlay dropAnimation={null}>
          {activeLead ? (
            <div className="w-64 opacity-90 rotate-1">
              <KanbanCardContent lead={activeLead} isDragging />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      <TourDateKanbanFlow change={tourFlow} onClose={() => setTourFlow(null)} />

      {toast && <Toast message={toast} onDone={clearToast} />}
    </>
  );
}

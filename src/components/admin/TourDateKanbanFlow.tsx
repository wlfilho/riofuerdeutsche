'use client';

import { useEffect, useState } from 'react';
import type { TourDate } from '@/lib/tourDates';
import { TOUR_DATE_STATUS_LABELS } from '@/lib/tourDates';
import TourDateModal, { leadStatusToTourStatus } from './TourDateModal';

export interface KanbanStatusChange {
  leadId: string;
  leadName: string;
  pax: number | null;
  oldStatus: string;
  newStatus: string;
}

const DATED_STATUSES = ['proposal_sent', 'closed'];

function Dialog({ children }: { children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">{children}</div>
    </div>
  );
}

/**
 * Runs after a kanban card changes status:
 * - moved to Proposta Enviada / Fechado → offer "Adicionar data de tour"
 *   (asking first whether existing tour dates should follow the new status)
 * - moved to Perdido → ask whether to remove the lead's tour dates
 */
export default function TourDateKanbanFlow({
  change,
  onClose,
}: {
  change: KanbanStatusChange | null;
  onClose: () => void;
}) {
  const [step, setStep] = useState<'sync' | 'delete' | 'offer' | 'modal' | null>(null);
  const [existing, setExisting] = useState<TourDate[]>([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!change) {
      setStep(null);
      return;
    }

    let cancelled = false;
    const run = async () => {
      const goesToCalendar = DATED_STATUSES.includes(change.newStatus);
      const isLost = change.newStatus === 'lost';
      if (!goesToCalendar && !isLost) {
        onClose();
        return;
      }

      let rows: TourDate[] = [];
      try {
        const res = await fetch(`/api/admin/tour-dates?lead_id=${change.leadId}`);
        if (res.ok) rows = (await res.json()).tourDates ?? [];
      } catch {
        // treat as no existing dates; the offer/close below still works
      }
      if (cancelled) return;
      setExisting(rows);

      if (isLost) {
        if (rows.length > 0) setStep('delete');
        else onClose();
        return;
      }

      const target = leadStatusToTourStatus(change.newStatus);
      const mismatched = rows.filter(r => r.status !== target);
      if (mismatched.length > 0) setStep('sync');
      else setStep('offer');
    };
    run();

    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [change]);

  if (!change || !step) return null;

  const target = leadStatusToTourStatus(change.newStatus);
  const mismatched = existing.filter(r => r.status !== target);

  const handleSync = async (apply: boolean) => {
    if (apply) {
      setBusy(true);
      try {
        await fetch('/api/admin/tour-dates', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ lead_id: change.leadId, status: target }),
        });
      } catch {
        // dates keep their old status; the calendar page allows fixing manually
      } finally {
        setBusy(false);
      }
    }
    setStep('offer');
  };

  const handleDelete = async (apply: boolean) => {
    if (apply) {
      setBusy(true);
      try {
        await fetch('/api/admin/tour-dates', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ lead_id: change.leadId, action: 'delete' }),
        });
      } catch {
        // dates stay in the calendar; removable manually
      } finally {
        setBusy(false);
      }
    }
    onClose();
  };

  const btnPrimary = 'px-4 py-2 text-sm font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50';
  const btnSecondary = 'px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors disabled:opacity-50';

  if (step === 'sync') {
    return (
      <Dialog>
        <p className="text-sm text-gray-800 mb-1 font-semibold">{change.leadName}</p>
        <p className="text-sm text-gray-600 mb-4">
          Este lead tem {mismatched.length} data{mismatched.length > 1 ? 's' : ''} de tour no calendário.
          Atualizar o status para <strong>{TOUR_DATE_STATUS_LABELS[target]}</strong> também?
        </p>
        <div className="flex justify-end gap-2">
          <button onClick={() => handleSync(false)} disabled={busy} className={btnSecondary}>Não</button>
          <button onClick={() => handleSync(true)} disabled={busy} className={btnPrimary}>
            {busy ? 'Atualizando...' : 'Sim, atualizar'}
          </button>
        </div>
      </Dialog>
    );
  }

  if (step === 'delete') {
    return (
      <Dialog>
        <p className="text-sm text-gray-800 mb-1 font-semibold">{change.leadName}</p>
        <p className="text-sm text-gray-600 mb-4">
          Este lead foi marcado como <strong>Perdido</strong>, mas tem {existing.length} data
          {existing.length > 1 ? 's' : ''} de tour no calendário. Remover essas datas?
        </p>
        <div className="flex justify-end gap-2">
          <button onClick={() => handleDelete(false)} disabled={busy} className={btnSecondary}>Manter</button>
          <button
            onClick={() => handleDelete(true)}
            disabled={busy}
            className="px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
          >
            {busy ? 'Removendo...' : 'Remover datas'}
          </button>
        </div>
      </Dialog>
    );
  }

  if (step === 'offer') {
    return (
      <Dialog>
        <p className="text-sm text-gray-800 mb-1 font-semibold">{change.leadName}</p>
        <p className="text-sm text-gray-600 mb-4">
          Adicionar data de tour ao calendário?
          {existing.length > 0 && ` (já tem ${existing.length} data${existing.length > 1 ? 's' : ''})`}
        </p>
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className={btnSecondary}>Agora não</button>
          <button onClick={() => setStep('modal')} className={btnPrimary}>Adicionar data de tour</button>
        </div>
      </Dialog>
    );
  }

  return (
    <TourDateModal
      fixedLead={{ id: change.leadId, name: change.leadName, status: change.newStatus, pax: change.pax }}
      onSaved={onClose}
      onClose={onClose}
    />
  );
}

'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { CheckCircle2, Clock, MapPin, Pencil, Send, Trash2, Users, Wallet } from 'lucide-react';
import type { TourDate } from '@/lib/tourDates';
import { fmtDate, fmtEur } from '@/lib/adminFormat';
import { formatTime } from '@/lib/calendarDates';
import TourDateModal from '@/components/admin/TourDateModal';

function sortTours(tours: TourDate[]): TourDate[] {
  return [...tours].sort(
    (a, b) => a.date.localeCompare(b.date) || (a.start_time ?? '').localeCompare(b.start_time ?? '')
  );
}

/**
 * Tour dates of a single lead, editable in place. The calendar page already had
 * edit/delete; the lead page only offered "add" via the kanban flow, so a date
 * marked for the wrong day could not be fixed from here.
 */
export default function LeadTourDates({
  leadId,
  leadName,
  leadStatus,
  leadPax,
  initialTourDates,
}: {
  leadId: string;
  leadName: string;
  leadStatus: string;
  leadPax: number | null;
  initialTourDates: TourDate[];
}) {
  const t = useTranslations('admin.calendario');
  const tc = useTranslations('admin.common');
  const tStatus = useTranslations('admin.status.tourDate');
  const [tours, setTours] = useState<TourDate[]>(() => sortTours(initialTourDates));
  const [modal, setModal] = useState<{ editing?: TourDate } | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSaved = (saved: TourDate[]) => {
    setTours(prev => {
      const ids = new Set(saved.map(s => s.id));
      return sortTours([...prev.filter(s => !ids.has(s.id)), ...saved]);
    });
    setModal(null);
  };

  const handleDelete = async (tour: TourDate) => {
    if (!window.confirm(t('confirmarRemover', { tour: tour.tour_name, data: fmtDate(tour.date) }))) return;
    setDeletingId(tour.id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/tour-dates/${tour.id}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? tc('erroDeletar'));
        return;
      }
      setTours(prev => prev.filter(s => s.id !== tour.id));
    } catch {
      setError(tc('erroRede'));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <h2 className="text-sm font-semibold text-gray-700">
          {t('datasDeTour')}
          {tours.length > 0 && <span className="text-gray-400 font-normal"> ({tours.length})</span>}
        </h2>
        <button
          onClick={() => setModal({})}
          className="px-3 py-1.5 text-xs font-semibold text-green-700 border border-green-200 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
        >
          {t('novaData')}
        </button>
      </div>

      {tours.length === 0 ? (
        <p className="px-5 py-6 text-xs text-gray-400 italic">{t('leadSemDatasTour')}</p>
      ) : (
        <div className="divide-y divide-gray-50">
          {tours.map(tour => (
            <div key={tour.id} className="flex items-start gap-3 px-5 py-3">
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <span className="text-sm font-semibold text-gray-900">{fmtDate(tour.date)}</span>
                  <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                    <Clock className="w-3 h-3 shrink-0" />
                    {formatTime(tour.start_time) ?? tc('vazio')}
                  </span>
                  {tour.status === 'fechado' ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-50 text-green-700 text-[11px] font-semibold">
                      <CheckCircle2 className="w-3 h-3 shrink-0" />
                      {tStatus('fechado')}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[11px] font-semibold">
                      <Send className="w-3 h-3 shrink-0" />
                      {tStatus('proposta_enviada')}
                    </span>
                  )}
                </div>

                <p className="text-sm text-gray-600 mt-0.5 truncate">{tour.tour_name}</p>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs text-gray-400">
                  <span className="inline-flex items-center gap-1">
                    <Users className="w-3 h-3 shrink-0" />
                    {tour.pax ?? t('aConfirmar')}
                  </span>
                  <span className="inline-flex items-center gap-1 min-w-0">
                    <MapPin className="w-3 h-3 shrink-0" />
                    <span className="truncate">{tour.meeting_point ?? t('aConfirmar')}</span>
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Wallet className="w-3 h-3 shrink-0" />
                    {tour.agreed_price != null ? fmtEur(tour.agreed_price) : t('aDefinir')}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-0.5 shrink-0">
                <button
                  onClick={() => setModal({ editing: tour })}
                  className="p-1 rounded-md text-gray-300 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                  title={tc('editar')}
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(tour)}
                  disabled={deletingId === tour.id}
                  className="p-1 rounded-md text-gray-300 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                  title={tc('remover')}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {error && (
        <p className="px-5 py-3 border-t border-gray-100 text-sm text-red-700 bg-red-50">{error}</p>
      )}

      {modal && (
        <TourDateModal
          fixedLead={{ id: leadId, name: leadName, status: leadStatus, pax: leadPax }}
          editing={modal.editing}
          onSaved={handleSaved}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}

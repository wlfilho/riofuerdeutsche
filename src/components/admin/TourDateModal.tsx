'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import type { TourDate, TourDateStatus } from '@/lib/tourDates';
import { todayISO } from '@/lib/calendarDates';

export interface TourDateLeadOption {
  id: string;
  name: string;
  status: 'proposal_sent' | 'closed' | string;
  pax?: number | null;
}

export function leadStatusToTourStatus(status: string): TourDateStatus {
  return status === 'closed' ? 'fechado' : 'proposta_enviada';
}

type DateRow = { date: string; start_time: string };

/**
 * Create/edit modal for tour_dates. Two modes:
 * - create: N date rows ("Adicionar outro dia" for multi-day tours), lead via
 *   picker (`leadOptions`) or locked (`fixedLead`, kanban flow)
 * - edit: pass `editing` — single date, lead locked
 */
export default function TourDateModal({
  leadOptions = [],
  fixedLead,
  editing,
  defaultDate,
  onSaved,
  onClose,
}: {
  leadOptions?: TourDateLeadOption[];
  fixedLead?: TourDateLeadOption;
  editing?: TourDate;
  defaultDate?: string;
  onSaved: (tourDates: TourDate[]) => void;
  onClose: () => void;
}) {
  const t = useTranslations('admin.calendario');
  const tc = useTranslations('admin.common');
  const tStatus = useTranslations('admin.status.tourDate');
  const initialLead = fixedLead ?? (editing
    ? { id: editing.lead_id, name: editing.lead?.name ?? '', status: '', pax: editing.pax }
    : null);

  const [leadId, setLeadId] = useState<string>(initialLead?.id ?? '');
  const [tourName, setTourName] = useState(editing?.tour_name ?? '');
  const [status, setStatus] = useState<TourDateStatus>(
    editing?.status ?? (fixedLead ? leadStatusToTourStatus(fixedLead.status) : 'proposta_enviada')
  );
  const [dateRows, setDateRows] = useState<DateRow[]>([
    {
      date: editing?.date ?? defaultDate ?? todayISO(),
      start_time: editing?.start_time?.slice(0, 5) ?? '',
    },
  ]);
  const [pax, setPax] = useState<string>(
    editing?.pax != null ? String(editing.pax) : fixedLead?.pax != null ? String(fixedLead.pax) : ''
  );
  const [meetingPoint, setMeetingPoint] = useState(editing?.meeting_point ?? '');
  const [agreedPrice, setAgreedPrice] = useState<string>(
    editing?.agreed_price != null ? String(editing.agreed_price) : ''
  );
  const [anzahlungPaid, setAnzahlungPaid] = useState(editing?.anzahlung_paid ?? false);
  const [notes, setNotes] = useState(editing?.notes ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEdit = Boolean(editing);
  const needsLeadPicker = !fixedLead && !isEdit;

  const handleLeadChange = (id: string) => {
    setLeadId(id);
    const lead = leadOptions.find(l => l.id === id);
    if (lead) {
      setStatus(leadStatusToTourStatus(lead.status));
      if (lead.pax != null && !pax) setPax(String(lead.pax));
    }
  };

  const updateRow = (i: number, patch: Partial<DateRow>) => {
    setDateRows(rows => rows.map((r, idx) => idx === i ? { ...r, ...patch } : r));
  };

  const handleSave = async () => {
    if (!leadId) { setError(t('selecioneCliente')); return; }
    if (dateRows.some(r => !r.date)) { setError(t('preenchaDatas')); return; }

    setSaving(true);
    setError(null);

    const common = {
      tour_name: tourName.trim() || null,
      status,
      pax: pax ? Number(pax) : null,
      meeting_point: meetingPoint.trim() || null,
      agreed_price: agreedPrice ? Number(agreedPrice) : null,
      anzahlung_paid: anzahlungPaid,
      notes: notes.trim() || null,
    };

    try {
      let res: Response;
      if (isEdit) {
        res = await fetch(`/api/admin/tour-dates/${editing!.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...common,
            date: dateRows[0].date,
            start_time: dateRows[0].start_time || null,
          }),
        });
      } else {
        res = await fetch('/api/admin/tour-dates', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            dates: dateRows.map(r => ({
              ...common,
              lead_id: leadId,
              date: r.date,
              start_time: r.start_time || null,
            })),
          }),
        });
      }
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? t('falhaSalvar'));
        return;
      }
      onSaved(isEdit ? [data.tourDate] : data.tourDates);
    } catch {
      setError(tc('erroRede'));
    } finally {
      setSaving(false);
    }
  };

  const inputClass = 'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent';
  const labelClass = 'block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">
            {isEdit ? t('editarDataTour') : t('adicionarDataTour')}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none p-1">✕</button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {/* Cliente */}
          <div>
            <label className={labelClass}>{t('cliente')}</label>
            {needsLeadPicker ? (
              <select value={leadId} onChange={e => handleLeadChange(e.target.value)} className={inputClass}>
                <option value="">{t('selecioneClientePlaceholder')}</option>
                {leadOptions.map(l => (
                  <option key={l.id} value={l.id}>
                    {l.name} ({tStatus(leadStatusToTourStatus(l.status))})
                  </option>
                ))}
              </select>
            ) : (
              <p className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800">
                {fixedLead?.name ?? editing?.lead?.name ?? tc('vazio')}
              </p>
            )}
          </div>

          {/* Tour + status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>{t('nomeTour')} <span className="normal-case text-gray-400 font-normal">({tc('opcional')})</span></label>
              <input
                type="text"
                value={tourName}
                onChange={e => setTourName(e.target.value)}
                placeholder={t('nomeTourPlaceholder')}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>{tc('status')}</label>
              <select value={status} onChange={e => setStatus(e.target.value as TourDateStatus)} className={inputClass}>
                <option value="proposta_enviada">{tStatus('proposta_enviada')}</option>
                <option value="fechado">{tStatus('fechado')}</option>
              </select>
            </div>
          </div>

          {/* Datas */}
          <div>
            <label className={labelClass}>{isEdit ? t('dataHorario') : t('datasHorarios')}</label>
            <div className="space-y-2">
              {dateRows.map((row, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    type="date"
                    value={row.date}
                    onChange={e => updateRow(i, { date: e.target.value })}
                    className={inputClass}
                  />
                  <input
                    type="time"
                    value={row.start_time}
                    onChange={e => updateRow(i, { start_time: e.target.value })}
                    className={inputClass}
                  />
                  {!isEdit && dateRows.length > 1 && (
                    <button
                      onClick={() => setDateRows(rows => rows.filter((_, idx) => idx !== i))}
                      className="text-gray-400 hover:text-red-600 p-1 shrink-0"
                      title={t('removerDia')}
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>
            {!isEdit && (
              <button
                onClick={() => setDateRows(rows => [...rows, { date: rows[rows.length - 1]?.date ?? todayISO(), start_time: '' }])}
                className="mt-2 text-xs font-medium text-green-700 hover:text-green-800"
              >
                {t('adicionarOutroDia')}
              </button>
            )}
          </div>

          {/* Pax + valor */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>{t('numeroPessoas')}</label>
              <input type="number" min="1" value={pax} onChange={e => setPax(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>{t('valorCombinado')}</label>
              <input type="number" min="0" step="0.01" value={agreedPrice} onChange={e => setAgreedPrice(e.target.value)} className={inputClass} />
            </div>
          </div>

          {/* Ponto de encontro */}
          <div>
            <label className={labelClass}>{t('pontoEncontro')}</label>
            <input
              type="text"
              value={meetingPoint}
              onChange={e => setMeetingPoint(e.target.value)}
              placeholder={t('pontoEncontroPlaceholder')}
              className={inputClass}
            />
          </div>

          {/* Anzahlung */}
          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <input
              type="checkbox"
              checked={anzahlungPaid}
              onChange={e => setAnzahlungPaid(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
            />
            {t('sinalPago')}
          </label>

          {/* Observações */}
          <div>
            <label className={labelClass}>{tc('observacoes')}</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={3}
              className={`${inputClass} resize-none`}
            />
          </div>

          {error && (
            <div className="p-3 rounded-lg text-sm bg-red-50 text-red-800 border border-red-200">{error}</div>
          )}
        </div>

        <div className="flex justify-end gap-2 px-6 py-4 border-t border-gray-100">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
          >
            {tc('cancelar')}
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 text-sm font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            {saving ? tc('salvando') : isEdit ? tc('salvarAlteracoes') : tc('adicionar')}
          </button>
        </div>
      </div>
    </div>
  );
}

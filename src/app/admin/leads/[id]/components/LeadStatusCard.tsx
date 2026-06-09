'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { updateLeadStatus, updateLeadNotes } from '../actions';
import type { LeadStatus } from '../../page';

const STATUS_OPTIONS: { value: LeadStatus; label: string }[] = [
  { value: 'new', label: 'Novo' },
  { value: 'contacted', label: 'Em Contato' },
  { value: 'proposal_sent', label: 'Proposta Enviada' },
  { value: 'closed', label: 'Fechado ✓' },
  { value: 'lost', label: 'Perdido' },
];

type SaveState = 'idle' | 'saving' | 'saved' | 'error';

export default function LeadStatusCard({
  leadId,
  initialStatus,
  initialNotes,
}: {
  leadId: string;
  initialStatus: LeadStatus;
  initialNotes: string | null;
}) {
  const [status, setStatus] = useState<LeadStatus>(initialStatus);
  const [statusSave, setStatusSave] = useState<SaveState>('idle');

  const [notes, setNotes] = useState(initialNotes ?? '');
  const [notesSave, setNotesSave] = useState<SaveState>('idle');
  const notesTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleStatusChange = async (newStatus: LeadStatus) => {
    setStatus(newStatus);
    setStatusSave('saving');
    const result = await updateLeadStatus(leadId, newStatus);
    if (result.error) {
      setStatusSave('error');
      setTimeout(() => setStatusSave('idle'), 3000);
    } else {
      setStatusSave('saved');
      setTimeout(() => setStatusSave('idle'), 2000);
    }
  };

  const saveNotes = useCallback(
    async (value: string) => {
      setNotesSave('saving');
      const result = await updateLeadNotes(leadId, value);
      if (result.error) {
        setNotesSave('error');
        setTimeout(() => setNotesSave('idle'), 3000);
      } else {
        setNotesSave('saved');
        setTimeout(() => setNotesSave('idle'), 2000);
      }
    },
    [leadId]
  );

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setNotes(value);
    setNotesSave('idle');
    if (notesTimer.current) clearTimeout(notesTimer.current);
    notesTimer.current = setTimeout(() => saveNotes(value), 1500);
  };

  useEffect(() => {
    return () => {
      if (notesTimer.current) clearTimeout(notesTimer.current);
    };
  }, []);

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100">
        <h2 className="text-sm font-semibold text-gray-700">Status</h2>
      </div>

      <div className="px-5 py-4 space-y-5">
        {/* Status selector */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <label className="text-xs font-medium text-gray-500">Status atual</label>
            {statusSave === 'saving' && (
              <span className="text-xs text-gray-400">Salvando...</span>
            )}
            {statusSave === 'saved' && (
              <span className="text-xs text-green-600 font-medium">✓ Salvo</span>
            )}
            {statusSave === 'error' && (
              <span className="text-xs text-red-600">Erro ao salvar</span>
            )}
          </div>
          <select
            value={status}
            onChange={e => handleStatusChange(e.target.value as LeadStatus)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            {STATUS_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Notes */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <label className="text-xs font-medium text-gray-500">Anotações internas</label>
            {notesSave === 'saving' && (
              <span className="text-xs text-gray-400">Salvando...</span>
            )}
            {notesSave === 'saved' && (
              <span className="text-xs text-green-600 font-medium">✓ Salvo</span>
            )}
            {notesSave === 'error' && (
              <span className="text-xs text-red-600">Erro ao salvar</span>
            )}
          </div>
          <textarea
            value={notes}
            onChange={handleNotesChange}
            rows={4}
            placeholder="Notas internas sobre este lead..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
          />
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { updateLeadStatus, updateLeadNotes, setLeadArchived } from '../actions';
import type { ArchiveReason } from '@/lib/leadArchive';
import type { LeadStatus } from '../../page';

const STATUS_VALUES: LeadStatus[] = ['new', 'contacted', 'proposal_sent', 'closed', 'lost'];

type SaveState = 'idle' | 'saving' | 'saved' | 'error';

export default function LeadStatusCard({
  leadId,
  initialStatus,
  initialNotes,
  archiveReason,
}: {
  leadId: string;
  initialStatus: LeadStatus;
  initialNotes: string | null;
  archiveReason: ArchiveReason | null;
}) {
  const [status, setStatus] = useState<LeadStatus>(initialStatus);
  const [statusSave, setStatusSave] = useState<SaveState>('idle');

  const [archiveSave, setArchiveSave] = useState<SaveState>('idle');

  const [notes, setNotes] = useState(initialNotes ?? '');
  const [notesSave, setNotesSave] = useState<SaveState>('idle');
  const notesTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const t = useTranslations('admin.crm');
  const tCommon = useTranslations('admin.common');
  const tStatus = useTranslations('admin.status.lead');
  const tReason = useTranslations('admin.crm.motivoArquivo');

  /**
   * Arquiva ou desarquiva. A action revalida a rota, então o `archiveReason`
   * vindo do servidor é recalculado sozinho — aqui só falta refletir o estado
   * do botão enquanto isso acontece.
   */
  const handleToggleArchive = async () => {
    setArchiveSave('saving');
    const result = await setLeadArchived(leadId, archiveReason === null);
    if (result.error) {
      setArchiveSave('error');
      setTimeout(() => setArchiveSave('idle'), 3000);
    } else {
      setArchiveSave('idle');
    }
  };

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
        <h2 className="text-sm font-semibold text-gray-700">{tCommon('status')}</h2>
      </div>

      <div className="px-5 py-4 space-y-5">
        {/* Status selector */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <label className="text-xs font-medium text-gray-500">{t('statusAtual')}</label>
            {statusSave === 'saving' && (
              <span className="text-xs text-gray-400">{tCommon('salvando')}</span>
            )}
            {statusSave === 'saved' && (
              <span className="text-xs text-green-600 font-medium">{tCommon('salvoCheck')}</span>
            )}
            {statusSave === 'error' && (
              <span className="text-xs text-red-600">{t('erroAoSalvar')}</span>
            )}
          </div>
          <select
            value={status}
            onChange={e => handleStatusChange(e.target.value as LeadStatus)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            {STATUS_VALUES.map(value => (
              <option key={value} value={value}>
                {tStatus(value)}
              </option>
            ))}
          </select>
        </div>

        {/* Arquivo */}
        <div className="flex items-center justify-between gap-3 rounded-lg bg-gray-50 border border-gray-200 px-3 py-2">
          <div className="min-w-0">
            <p className="text-xs font-medium text-gray-700">
              {archiveReason ? tReason(archiveReason) : t('visivelNoKanban')}
            </p>
            {archiveReason && archiveReason !== 'manual' && (
              <p className="text-[11px] text-gray-500 mt-0.5">{t('arquivadoAutomaticamente')}</p>
            )}
            {archiveSave === 'error' && (
              <p className="text-[11px] text-red-600 mt-0.5">{t('erroAoSalvar')}</p>
            )}
          </div>
          {/* Arquivamento automático não tem botão: desarquivar não faria nada
              enquanto a regra que escondeu o card continuar valendo. */}
          {(archiveReason === null || archiveReason === 'manual') && (
            <button
              onClick={handleToggleArchive}
              disabled={archiveSave === 'saving'}
              className="shrink-0 px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {archiveSave === 'saving'
                ? tCommon('salvando')
                : archiveReason === 'manual'
                  ? t('desarquivar')
                  : t('arquivar')}
            </button>
          )}
        </div>

        {/* Notes */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <label className="text-xs font-medium text-gray-500">{t('anotacoesInternas')}</label>
            {notesSave === 'saving' && (
              <span className="text-xs text-gray-400">{tCommon('salvando')}</span>
            )}
            {notesSave === 'saved' && (
              <span className="text-xs text-green-600 font-medium">{tCommon('salvoCheck')}</span>
            )}
            {notesSave === 'error' && (
              <span className="text-xs text-red-600">{t('erroAoSalvar')}</span>
            )}
          </div>
          <textarea
            value={notes}
            onChange={handleNotesChange}
            rows={4}
            placeholder={t('notasInternasPlaceholder')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
          />
        </div>
      </div>
    </div>
  );
}

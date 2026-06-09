'use client';

import { useState } from 'react';

interface ContactDeleteConfirmProps {
  contactName: string | null;
  contactEmail: string;
  onCancel: () => void;
  onConfirm: () => Promise<void>;
}

export default function ContactDeleteConfirm({
  contactName,
  contactEmail,
  onCancel,
  onConfirm,
}: ContactDeleteConfirmProps) {
  const [loading, setLoading] = useState(false);

  const displayName = contactName || contactEmail;

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-full">
      {/* Header */}
      <div className="bg-red-50 border-b border-red-100 px-6 py-5 flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
          <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 className="text-base font-semibold text-red-800">Remover contato</h2>
      </div>

      {/* Body */}
      <div className="flex-1 bg-gray-50 flex flex-col items-center justify-center p-8 text-center gap-5">
        <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center">
          <svg className="w-7 h-7 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </div>

        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-gray-900">Remover {displayName}?</h3>
          <p className="text-sm text-gray-500 max-w-sm">
            O contato será removido da lista. Leads e registros de tour associados não serão deletados — apenas o vínculo com este contato.
          </p>
        </div>

        <div className="w-full max-w-sm p-3 rounded-lg bg-amber-50 border border-amber-200 text-left">
          <p className="text-xs text-amber-700 font-medium">
            ⚠ Esta ação não pode ser desfeita. Leads vinculados ficarão sem contato associado.
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-white border-t border-gray-200 px-6 py-4 flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={handleConfirm}
          disabled={loading}
          className="px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
        >
          {loading ? 'Removendo…' : 'Sim, remover'}
        </button>
      </div>
    </div>
  );
}

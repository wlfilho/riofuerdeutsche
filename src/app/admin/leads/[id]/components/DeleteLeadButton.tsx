'use client';

import { useState } from 'react';
import { deleteLead } from '../actions';

export default function DeleteLeadButton({ leadId, leadName }: { leadId: string; leadName: string }) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    setLoading(true);
    setError(null);
    const result = await deleteLead(leadId);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
    // On success: server action redirects to /admin/leads
  };

  return (
    <>
      <div className="flex justify-center pt-2 pb-6">
        <button
          onClick={() => setShowConfirm(true)}
          className="text-xs text-red-400 hover:text-red-600 transition-colors underline underline-offset-2"
        >
          Deletar lead
        </button>
      </div>

      {showConfirm && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => !loading && setShowConfirm(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-2">Deletar lead?</h2>
            <p className="text-sm text-gray-600 mb-2">
              O lead de <strong>{leadName}</strong> será excluído permanentemente.
            </p>
            <p className="text-sm text-gray-500 mb-6">
              Todos os contatos registrados serão removidos.
            </p>

            {error && (
              <div className="mb-4 p-3 rounded-lg text-sm bg-red-50 text-red-800 border border-red-200">
                {error}
              </div>
            )}

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                disabled={loading}
                className="px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Deletando...' : 'Deletar permanentemente'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

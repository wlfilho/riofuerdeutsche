'use client';

import { useState } from 'react';
import { registerContact } from '../actions';

type ContactType = 'whatsapp' | 'email' | 'phone' | 'other';
type Direction = 'sent' | 'received';

type NewContact = {
  id: string;
  lead_id: string;
  type: ContactType;
  direction: Direction;
  note: string | null;
  is_automatic: boolean;
  automatic_label: string | null;
  created_at: string;
  created_by: string | null;
};

type Props = {
  leadId: string;
  onClose: () => void;
  onSaved: (contact: NewContact) => void;
};

const INPUT_CLS =
  'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-50';

export default function RegisterContactDialog({ leadId, onClose, onSaved }: Props) {
  const [type, setType] = useState<ContactType>('whatsapp');
  const [direction, setDirection] = useState<Direction>('sent');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const result = await registerContact(leadId, type, direction, note || null);
    setLoading(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    onSaved(result.contact as unknown as NewContact);
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100">
          <h2 className="text-base font-bold text-gray-900">Registrar Contato</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors text-xl leading-none"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="px-6 py-5 space-y-4">
            {/* Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo <span className="text-red-500">*</span>
              </label>
              <select
                value={type}
                onChange={e => setType(e.target.value as ContactType)}
                disabled={loading}
                className={INPUT_CLS}
              >
                <option value="whatsapp">WhatsApp</option>
                <option value="email">Email</option>
                <option value="phone">Telefone</option>
                <option value="other">Outro</option>
              </select>
            </div>

            {/* Direction */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Direção <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-3">
                {(
                  [
                    { value: 'sent', label: '↑ Enviado', desc: 'você enviou' },
                    { value: 'received', label: '↓ Recebido', desc: 'você recebeu' },
                  ] as const
                ).map(opt => (
                  <label
                    key={opt.value}
                    className={`flex-1 flex items-center gap-2 px-3 py-2.5 border rounded-lg cursor-pointer transition-colors ${
                      direction === opt.value
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="direction"
                      value={opt.value}
                      checked={direction === opt.value}
                      onChange={() => setDirection(opt.value)}
                      disabled={loading}
                      className="sr-only"
                    />
                    <span className={`text-sm font-medium ${direction === opt.value ? 'text-green-700' : 'text-gray-700'}`}>
                      {opt.label}
                    </span>
                    <span className="text-xs text-gray-400">{opt.desc}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Note */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nota</label>
              <textarea
                value={note}
                onChange={e => setNote(e.target.value)}
                rows={3}
                disabled={loading}
                placeholder="Descreva brevemente o contato..."
                className={`${INPUT_CLS} resize-none`}
              />
            </div>

            {error && (
              <div className="p-3 rounded-lg text-sm bg-red-50 text-red-800 border border-red-200">
                {error}
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 px-6 pb-6 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 text-sm font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Registrando...' : 'Registrar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

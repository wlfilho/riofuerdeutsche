'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import RegisterContactDialog from './RegisterContactDialog';

export type LeadContact = {
  id: string;
  lead_id: string;
  type: 'whatsapp' | 'email' | 'phone' | 'other';
  direction: 'sent' | 'received';
  note: string | null;
  is_automatic: boolean;
  automatic_label: string | null;
  created_at: string;
  created_by: string | null;
};

function formatDateTime(iso: string) {
  const d = new Date(iso);
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${dd}.${mm}.${yyyy} ${hh}:${min}`;
}

function TypeIcon({ type }: { type: LeadContact['type'] }) {
  if (type === 'whatsapp') {
    return (
      <svg className="h-3.5 w-3.5 text-green-600" viewBox="0 0 24 24" fill="currentColor">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
      </svg>
    );
  }
  if (type === 'email') {
    return (
      <svg className="h-3.5 w-3.5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
      </svg>
    );
  }
  if (type === 'phone') {
    return (
      <svg className="h-3.5 w-3.5 text-indigo-500" viewBox="0 0 20 20" fill="currentColor">
        <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
      </svg>
    );
  }
  return (
    <svg className="h-3.5 w-3.5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
    </svg>
  );
}

function DirectionIcon({ direction }: { direction: 'sent' | 'received' }) {
  if (direction === 'sent') {
    return (
      <svg className="h-3 w-3 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
      </svg>
    );
  }
  return (
    <svg className="h-3 w-3 text-green-500" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
    </svg>
  );
}

const TYPE_LABEL: Record<LeadContact['type'], string> = {
  whatsapp: 'WhatsApp',
  email: 'Email',
  phone: 'Telefone',
  other: 'Outro',
};

const DIRECTION_LABEL: Record<string, string> = {
  sent: 'enviado',
  received: 'recebido',
};

export default function LeadContactTimeline({
  leadId,
  initialContacts,
}: {
  leadId: string;
  initialContacts: LeadContact[];
}) {
  const router = useRouter();
  const [contacts, setContacts] = useState<LeadContact[]>(initialContacts);
  const [showDialog, setShowDialog] = useState(false);

  const handleSaved = useCallback(
    (contact: LeadContact) => {
      setContacts(prev => [...prev, contact]);
      setShowDialog(false);
      router.refresh();
    },
    [router]
  );

  return (
    <>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-700">Histórico de Contatos</h2>
          <button
            onClick={() => setShowDialog(true)}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Registrar
          </button>
        </div>

        <div className="px-5 py-4">
          {contacts.length === 0 ? (
            <p className="text-xs text-gray-400 italic text-center py-4">
              Nenhum contato registrado ainda.
            </p>
          ) : (
            <div className="relative">
              {/* Vertical line */}
              <div className="absolute left-2 top-2 bottom-2 w-px bg-gray-100" />

              <div className="space-y-5">
                {contacts.map(contact => (
                  <div key={contact.id} className="relative pl-7">
                    {/* Dot */}
                    <div
                      className={`absolute left-0 top-1 w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        contact.is_automatic
                          ? 'border-gray-200 bg-gray-50'
                          : 'border-gray-300 bg-white'
                      }`}
                    >
                      <TypeIcon type={contact.type} />
                    </div>

                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span
                          className={`text-xs font-medium ${
                            contact.is_automatic ? 'text-gray-400' : 'text-gray-700'
                          }`}
                        >
                          {contact.is_automatic
                            ? contact.automatic_label ?? 'Automático'
                            : `${TYPE_LABEL[contact.type]} ${DIRECTION_LABEL[contact.direction]}`}
                        </span>
                        {!contact.is_automatic && (
                          <DirectionIcon direction={contact.direction} />
                        )}
                        {contact.is_automatic && (
                          <span className="text-xs text-gray-300 italic">automático</span>
                        )}
                      </div>

                      <p className="text-xs text-gray-400 mt-0.5">
                        {formatDateTime(contact.created_at)}
                      </p>

                      {contact.note && (
                        <p
                          className={`text-xs mt-1 leading-relaxed ${
                            contact.is_automatic ? 'text-gray-400 italic' : 'text-gray-600'
                          }`}
                        >
                          "{contact.note}"
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {showDialog && (
        <RegisterContactDialog
          leadId={leadId}
          onClose={() => setShowDialog(false)}
          onSaved={handleSaved}
        />
      )}
    </>
  );
}

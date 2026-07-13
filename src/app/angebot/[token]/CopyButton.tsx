'use client';

import { useState } from 'react';

// Botão de copiar dos dados bancários da Anzahlung. Copia o valor sem
// espaços de formatação (IBAN colável direto no app do banco).
export default function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value.replace(/\s+/g, ' ').trim());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard indisponível (http antigo etc.) — sem feedback, sem crash
    }
  };

  return (
    <button
      onClick={handleCopy}
      title={copied ? 'Kopiert!' : `${label} kopieren`}
      aria-label={`${label} kopieren`}
      className={`inline-flex items-center justify-center w-7 h-7 rounded-md transition-colors shrink-0 ${
        copied
          ? 'text-green-600 bg-green-50'
          : 'text-gray-400 hover:text-green-700 hover:bg-green-50'
      }`}
    >
      {copied ? (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
          <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
          <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
        </svg>
      )}
    </button>
  );
}

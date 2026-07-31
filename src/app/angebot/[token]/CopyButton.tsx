'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';

// Botão de copiar dos dados bancários da Anzahlung: ícone discreto ao lado do
// valor + toast animado confirmando a cópia. Copia o valor com espaços
// normalizados (IBAN colável direto no app do banco).
export default function CopyButton({ value, label }: { value: string; label: string }) {
  const t = useTranslations('public.angebot.copy');
  const [copied, setCopied] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const timers = useRef<Array<ReturnType<typeof setTimeout>>>([]);

  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach(clearTimeout);
  }, []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value.replace(/\s+/g, ' ').trim());
    } catch {
      return; // clipboard indisponível — sem feedback, sem crash
    }
    timers.current.forEach(clearTimeout);
    setCopied(true);
    setToastVisible(true);
    timers.current = [
      setTimeout(() => setToastVisible(false), 1800),
      setTimeout(() => setCopied(false), 2100),
    ];
  };

  return (
    <>
      <button
        onClick={handleCopy}
        title={t('action', { label })}
        aria-label={t('action', { label })}
        className={`inline-flex items-center justify-center w-6 h-6 rounded-md transition-colors shrink-0 ${
          copied ? 'text-green-600' : 'text-gray-300 hover:text-green-600 hover:bg-green-100/60'
        }`}
      >
        {copied ? (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
            <path d="M20 6 9 17l-5-5" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
            <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
            <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
          </svg>
        )}
      </button>

      {/* Toast */}
      <span
        aria-live="polite"
        className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-2 px-4 py-2.5 rounded-full bg-gray-900/95 text-white text-sm font-medium shadow-xl backdrop-blur-sm transition-all duration-300 ease-out ${
          toastVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3 pointer-events-none'
        }`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-green-400">
          <path d="M20 6 9 17l-5-5" />
        </svg>
        {t('copied', { label })}
      </span>
    </>
  );
}

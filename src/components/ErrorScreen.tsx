'use client';

// Tela mostrada quando uma exceção de client escapa até um error boundary.
//
// Deliberadamente burra: texto hardcoded, zero hooks de dados, zero next-intl.
// O error boundary é o último anteparo, então ele não pode depender de nada que
// possa ser justamente o que quebrou — se o catálogo de mensagens ou o provider
// de i18n for a causa, uma tela de erro traduzida quebraria junto e o visitante
// voltaria pro branco.
//
// A caixa de detalhes técnicos fica sempre visível de propósito: sem ela o
// relato que chega é "deu erro" com print de tela vazia, que foi exatamente o
// que aconteceu com o Marcio em 10/09/2026 e custou uma tarde de investigação
// às cegas. `digest` é o hash que a Vercel loga do lado do servidor; `message`
// só sobrevive em erro de client (o de servidor a React apaga em produção).

import { useEffect } from 'react';
import { reportClientError } from '@/lib/reportClientError';

export type ErrorScreenCopy = {
  title: string;
  description: string;
  retry: string;
  home: string;
  homeHref: string;
  details: string;
};

export default function ErrorScreen({
  error,
  reset,
  copy,
}: {
  error: Error & { digest?: string };
  reset: () => void;
  copy: ErrorScreenCopy;
}) {
  useEffect(() => {
    reportClientError(error);
  }, [error]);

  const detail = [error.digest && `#${error.digest}`, error.message]
    .filter(Boolean)
    .join(' ');

  return (
    <main className="min-h-screen bg-[#F7F3EB] flex flex-col items-center justify-center px-4 py-24">
      <h1 className="text-2xl md:text-3xl font-bold text-[#0A5C36] text-center mb-3 max-w-xl">
        {copy.title}
      </h1>

      <p className="text-gray-600 text-center max-w-md mb-10 text-base md:text-lg">
        {copy.description}
      </p>

      <div className="flex flex-col sm:flex-row gap-3 mb-12">
        <button
          type="button"
          onClick={reset}
          className="inline-flex items-center justify-center gap-2 bg-green-700 hover:bg-green-800 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
        >
          {copy.retry}
        </button>
        <a
          href={copy.homeHref}
          className="inline-flex items-center justify-center gap-2 border border-[#0A5C36] text-[#0A5C36] hover:bg-[#0A5C36] hover:text-white font-semibold px-6 py-3 rounded-lg transition-colors"
        >
          {copy.home}
        </a>
      </div>

      {detail && (
        <div className="w-full max-w-2xl">
          <p className="text-center text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">
            {copy.details}
          </p>
          <pre className="bg-white border border-gray-200 rounded-xl p-4 text-xs text-gray-700 whitespace-pre-wrap break-words">
            {detail}
          </pre>
        </div>
      )}
    </main>
  );
}

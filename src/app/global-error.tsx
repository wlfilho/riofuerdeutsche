'use client';

// Último anteparo: pega o que quebra no próprio layout raiz, onde a error.tsx
// ainda não existe. Por isso ela renderiza o <html> e o <body> por conta própria
// e usa estilo inline em vez de Tailwind: se o que falhou foi o layout, não dá
// para contar com nada que venha dele, folha de estilo inclusive.

import { useEffect } from 'react';
import { reportClientError } from '@/lib/reportClientError';

const SAND = '#F7F3EB';
const GREEN = '#0A5C36';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    reportClientError(error);
  }, [error]);

  const detail = [error.digest && `#${error.digest}`, error.message]
    .filter(Boolean)
    .join(' ');

  return (
    <html lang="de">
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          background: SAND,
          color: '#111827',
          fontFamily:
            'system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '3rem 1rem',
          textAlign: 'center',
        }}
      >
        <h1 style={{ color: GREEN, fontSize: '1.75rem', margin: '0 0 0.75rem', maxWidth: '36rem' }}>
          Da ist etwas schiefgelaufen.
        </h1>
        <p style={{ color: '#4b5563', maxWidth: '28rem', margin: '0 0 2.5rem', lineHeight: 1.6 }}>
          Diese Seite konnte nicht geladen werden. Meistens hilft es schon, sie noch einmal zu
          laden.
        </p>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', justifyContent: 'center' }}>
          <button
            type="button"
            onClick={reset}
            style={{
              background: '#15803d',
              color: '#fff',
              border: 'none',
              borderRadius: '0.5rem',
              padding: '0.75rem 1.5rem',
              fontSize: '1rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Noch einmal versuchen
          </button>
          <a
            href="/"
            style={{
              border: `1px solid ${GREEN}`,
              color: GREEN,
              borderRadius: '0.5rem',
              padding: '0.75rem 1.5rem',
              fontSize: '1rem',
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            Zur Startseite
          </a>
        </div>

        {detail && (
          <pre
            style={{
              marginTop: '3rem',
              maxWidth: '40rem',
              width: '100%',
              background: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '0.75rem',
              padding: '1rem',
              fontSize: '0.75rem',
              color: '#374151',
              textAlign: 'left',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
            }}
          >
            {detail}
          </pre>
        )}
      </body>
    </html>
  );
}

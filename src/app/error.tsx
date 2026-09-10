'use client';

// Error boundary do lado público. Sem ela, qualquer exceção de client vira a
// tela padrão do Next ("Application error: a client-side exception has
// occurred"), que não diz o que houve, não oferece saída e não deixa log.

import ErrorScreen from '@/components/ErrorScreen';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorScreen
      error={error}
      reset={reset}
      copy={{
        title: 'Da ist etwas schiefgelaufen.',
        description:
          'Diese Seite konnte nicht geladen werden. Meistens hilft es schon, sie noch einmal zu laden.',
        retry: 'Noch einmal versuchen',
        home: 'Zur Startseite',
        homeHref: '/',
        details: 'Technische Details',
      }}
    />
  );
}

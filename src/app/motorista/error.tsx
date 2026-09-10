'use client';

// Error boundary própria da área do motorista, em pt-BR pelo mesmo motivo que a
// page.tsx é: quem usa esta parte do site é brasileiro, e uma tela de erro em
// alemão não ajudaria ninguém a relatar o problema.

import ErrorScreen from '@/components/ErrorScreen';

export default function MotoristaError({
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
        title: 'Alguma coisa deu errado.',
        description:
          'A escala não carregou. Na maioria das vezes, tentar de novo resolve. Se não resolver, manda um print desta tela inteira para o Will.',
        retry: 'Tentar de novo',
        home: 'Voltar ao início',
        homeHref: '/',
        details: 'Detalhes técnicos',
      }}
    />
  );
}

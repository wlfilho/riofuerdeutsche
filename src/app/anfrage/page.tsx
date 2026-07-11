import { Metadata } from 'next';
import { Suspense } from 'react';
import AnfrageForm from './AnfrageForm';

export const metadata: Metadata = {
  title: 'Tour-Anfrage — Rio für Deutsche',
  description:
    'Erzähl Will kurz, wer du bist und an welchen Tagen du Rio erleben möchtest — er meldet sich mit einem persönlichen Vorschlag.',
  robots: { index: false, follow: false },
};

export default function AnfragePage() {
  return (
    <Suspense>
      <AnfrageForm />
    </Suspense>
  );
}

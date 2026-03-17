// src/app/guide/sicherheit/page.tsx
import { getMembershipAccess } from '@/lib/membership';

export const metadata = {
  title: 'Sicherheit in Rio — Rio für Deutsche Guide',
  description:
    'Die 7 gefährlichsten Fehler, die deutsche Touristen in Rio machen. Kostenloser Sicherheitsguide von einem echten Carioca.',
};

export default async function SicherheitPage() {
  const access = await getMembershipAccess();

  return (
    <article className="max-w-3xl prose prose-gray">
      <h1>🛡️ Sicherheit in Rio de Janeiro</h1>
      <p className="lead text-lg text-gray-600">
        Die 7 gefährlichsten Fehler, die deutsche Touristen in Rio machen
        — und wie du sie vermeidest.
      </p>

      <div className="not-prose bg-green-50 border border-green-200 rounded-lg p-4 mb-8">
        <p className="text-sm text-green-800">
          <strong>👋 Hey!</strong> Ich bin Will — geboren und aufgewachsen
          in Rio, habe in Köln studiert und spreche fließend Deutsch. In
          diesem Kapitel zeige ich dir, wie du Rio sicher erleben kannst.
        </p>
      </div>

      {/* ===== AQUI ENTRA O CONTEÚDO DO CAPÍTULO ===== */}
      {/*
        TODO: Preencher com o conteúdo real do Lead Magnet.
        Usar os textos do documento FUNIL_CONSULTORIA_EBOOK_UrlaubinBrasilien.md
        Capítulo 2: Die 15 goldenen Sicherheitsregeln
        Adaptar para formato web com headings, listas, callouts.

        Estrutura sugerida:
        - Fehler 1: Ostentação (Rolex, iPhone na mão...)
        - Fehler 2: Celular na rua à noite
        - Fehler 3: Táxi amarelo em vez de Uber
        - Fehler 4: Hospedar em bairro perigoso
        - Fehler 5: Andar em ruas desertas
        - Fehler 6: Levar tudo para a praia
        - Fehler 7: Não ter plano de emergência
      */}

      <h2>Fehler 1: Wertgegenstände offen zeigen</h2>
      <p>
        Rio ist eine der schönsten Städte der Welt — aber auch eine Stadt,
        in der du smart sein musst. Der häufigste Fehler...
      </p>

      {/* ... mais conteúdo ... */}

      {/* CTA no final do capítulo grátis */}
      {!access.isPremium && (
        <div className="not-prose mt-12 p-6 bg-gradient-to-br from-green-50 to-yellow-50 rounded-2xl border border-green-200">
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            📖 Das war nur ein Kapitel!
          </h3>
          <p className="text-gray-600 mb-4">
            Im kompletten Rio-Guide findest du auch: sichere Unterkünfte
            nach Budget, den besten Transport-Guide, alle
            Sehenswürdigkeiten mit Insider-Tipps — und alle zukünftigen
            Updates kostenlos.
          </p>
          <a
            href="/guide?upgrade=true"
            className="inline-block px-6 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors"
          >
            Kompletten Guide freischalten — ab 9€
          </a>
        </div>
      )}
    </article>
  );
}

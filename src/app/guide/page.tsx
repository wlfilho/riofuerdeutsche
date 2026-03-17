// src/app/guide/page.tsx
import { getMembershipAccess } from '@/lib/membership';
import Link from 'next/link';

export const metadata = {
  title: 'Rio für Deutsche — Kompletter Guide',
  description:
    'Dein kompletter Rio de Janeiro Guide auf Deutsch. Sicherheit, Unterkünfte, Transport und Insider-Tipps von einem echten Carioca.',
};

export default async function GuidePage({
  searchParams,
}: {
  searchParams: Promise<{ upgrade?: string }>;
}) {
  const access = await getMembershipAccess();
  const params = await searchParams;
  const showUpgrade = params.upgrade === 'true';

  return (
    <div className="max-w-3xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Willkommen im Rio-Guide! 🇧🇷
        </h1>
        <p className="text-gray-600">
          {access.isPremium
            ? 'Du hast Zugang zu allen Kapiteln. Viel Spaß beim Entdecken!'
            : 'Starte mit dem kostenlosen Sicherheits-Kapitel — und schalte den kompletten Guide frei, wenn du bereit bist.'}
        </p>
      </div>

      {/* Upgrade-Banner (aparece quando ?upgrade=true) */}
      {showUpgrade && !access.isPremium && (
        <div className="mb-8 p-6 bg-gradient-to-r from-green-600 to-green-800 rounded-2xl text-white">
          <h2 className="text-xl font-bold mb-2">
            🔓 Den kompletten Rio-Guide freischalten
          </h2>
          <p className="text-green-100 mb-4">
            Dieses Kapitel ist Teil des vollständigen Guides. Sichere dir
            jetzt alle Kapitel — inklusive zukünftiger Updates!
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            <div className="bg-white/10 rounded-lg p-3">
              <p className="font-semibold">✅ Sichere Unterkünfte</p>
              <p className="text-sm text-green-200">
                Viertel, Budget, Checkliste
              </p>
            </div>
            <div className="bg-white/10 rounded-lg p-3">
              <p className="font-semibold">✅ Transport-Guide</p>
              <p className="text-sm text-green-200">Uber, Metro, Apps</p>
            </div>
            <div className="bg-white/10 rounded-lg p-3">
              <p className="font-semibold">✅ Top-Sehenswürdigkeiten</p>
              <p className="text-sm text-green-200">
                Cristo, Zuckerhut & mehr
              </p>
            </div>
            <div className="bg-white/10 rounded-lg p-3">
              <p className="font-semibold">✅ Alle zukünftigen Updates</p>
              <p className="text-sm text-green-200">
                Neue Kapitel inklusive
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* TODO: Substituir por link real de pagamento (Stripe/PayPal) */}
            <a
              href="https://wa.me/5521999999999?text=Hallo%20Will!%20Ich%20möchte%20den%20Rio-Guide%20kaufen."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-6 py-3 bg-yellow-400 text-gray-900 font-bold rounded-lg hover:bg-yellow-300 transition-colors"
            >
              Jetzt kaufen — 9€
            </a>
            <p className="text-sm text-green-200">
              Early Access Preis · Steigt mit jeder Edition
            </p>
          </div>
        </div>
      )}

      {/* Card do capítulo grátis */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">
          📗 Dein kostenloses Kapitel
        </h2>
        <Link
          href="/guide/sicherheit"
          className="block p-5 bg-white rounded-xl border-2 border-green-200 hover:border-green-400 hover:shadow-md transition-all"
        >
          <div className="flex items-start gap-4">
            <span className="text-3xl">🛡️</span>
            <div>
              <h3 className="font-bold text-gray-900">Sicherheit in Rio</h3>
              <p className="text-sm text-gray-600 mt-1">
                Die 7 gefährlichsten Fehler, die deutsche Touristen in Rio
                machen — und wie du sie vermeidest.
              </p>
              <span className="inline-block mt-2 px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded">
                ✓ Kostenlos
              </span>
            </div>
          </div>
        </Link>
      </div>

      {/* Cards dos capítulos premium */}
      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-3">
          {access.isPremium ? '📘 Alle Kapitel' : '🔒 Premium-Kapitel'}
        </h2>
        <div className="space-y-3">
          {[
            {
              slug: 'ankommen',
              icon: '✈️',
              title: 'Ankommen in Rio',
              desc: 'Flughafen, Transfer, erste Schritte nach der Landung.',
            },
            {
              slug: 'unterkunft',
              icon: '🏨',
              title: 'Unterkunft',
              desc: 'Sichere Viertel, Budget-Optionen, Buchungs-Checkliste.',
            },
            {
              slug: 'transport',
              icon: '🚇',
              title: 'Transport',
              desc: 'Uber, Metro, Bus — und welche Apps du brauchst.',
            },
            {
              slug: 'sehenswuerdigkeiten',
              icon: '🏔️',
              title: 'Sehenswürdigkeiten',
              desc: 'Cristo, Zuckerhut, Ipanema — und was kein Reiseführer verrät.',
            },
          ].map((ch) => (
            <div key={ch.slug}>
              {access.isPremium ? (
                <Link
                  href={`/guide/${ch.slug}`}
                  className="block p-5 bg-white rounded-xl border border-gray-200 hover:border-green-300 hover:shadow-md transition-all"
                >
                  <div className="flex items-start gap-4">
                    <span className="text-3xl">{ch.icon}</span>
                    <div>
                      <h3 className="font-bold text-gray-900">{ch.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{ch.desc}</p>
                    </div>
                  </div>
                </Link>
              ) : (
                <div className="p-5 bg-gray-50 rounded-xl border border-gray-200 opacity-70">
                  <div className="flex items-start gap-4">
                    <span className="text-3xl opacity-50">{ch.icon}</span>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-500">{ch.title}</h3>
                      <p className="text-sm text-gray-400 mt-1">{ch.desc}</p>
                    </div>
                    <span className="text-lg">🔒</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* CTA final para usuários gratuitos */}
      {!access.isPremium && (
        <div className="mt-10 text-center">
          <p className="text-gray-500 text-sm mb-3">
            Wer jetzt kauft, bekommt alle zukünftigen Updates kostenlos.
          </p>
          <a
            href="/guide?upgrade=true"
            className="inline-block px-8 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors"
          >
            Kompletten Guide freischalten — ab 9€
          </a>
        </div>
      )}
    </div>
  );
}

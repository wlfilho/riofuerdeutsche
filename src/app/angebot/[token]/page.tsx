import { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getDepositBankInfo, getProposalByPublicToken, type ProposalItem } from '@/lib/proposals';
import CopyButton from './CopyButton';
import ShareButtons from './ShareButtons';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Ihr Angebot — Rio für Deutsche',
  description: 'Persönliches Tour-Angebot für Rio de Janeiro.',
  robots: { index: false, follow: false },
};

// ─── Format helpers (alinhados com o PDF/WhatsApp do admin) ──────────────────

function formatEur(n: number): string {
  return `€${n.toFixed(2).replace('.', ',')}`;
}

function formatDate(iso: string | null): string {
  if (!iso) return '—';
  const [y, m, d] = iso.split('-');
  return `${d}.${m}.${y}`;
}

function formatShortDate(iso: string): string {
  const [, m, d] = iso.split('-');
  return `${d}.${m}.`;
}

// Horas do dia (transfers compartilhados entre atividades vizinhas), igual ao
// cálculo do form. O cliente vê só o total aproximado, arredondado pra cima.
function calcDayHours(
  items: Array<{ duration_hours: number | null; transfer_hours_to: number | null; transfer_hours_back: number | null }>,
): number {
  if (items.length === 0) return 0;
  let total = items[0].transfer_hours_to ?? 0;
  for (let i = 0; i < items.length; i++) {
    total += items[i].duration_hours ?? 0;
    if (i < items.length - 1) {
      total += ((items[i].transfer_hours_back ?? 0) + (items[i + 1].transfer_hours_to ?? 0)) / 2;
    }
  }
  total += items[items.length - 1].transfer_hours_back ?? 0;
  return total;
}

// Custos que o cliente paga no local (included=false): fora do total, mas
// exibidos para ele se programar. Dedup para atividades em mais de um dia.
type OnsiteCost = {
  activity: string;
  description: string;
  base_price: number;
  currency: 'EUR' | 'BRL';
  price_type: 'fixed' | 'per_pax' | 'per_hour';
};

function collectOnsiteCosts(items: ProposalItem[]): OnsiteCost[] {
  const seen = new Set<string>();
  const out: OnsiteCost[] = [];
  for (const item of items) {
    if (item.kind === 'day_transport') continue;
    for (const c of item.costs ?? []) {
      if (c.included ?? true) continue;
      const key = `${item.service_name}|${c.description}|${c.base_price}|${c.currency}`;
      if (seen.has(key)) continue;
      seen.add(key);
      out.push({
        activity: item.service_name,
        description: c.description,
        base_price: c.base_price,
        currency: c.currency,
        price_type: c.price_type,
      });
    }
  }
  return out;
}

function formatOnsiteCost(c: OnsiteCost, exchangeRate: number | null): string {
  const sym = c.currency === 'EUR' ? '€' : 'R$';
  const val = c.base_price % 1 === 0
    ? c.base_price.toFixed(0)
    : c.base_price.toFixed(2).replace('.', ',');
  const approx = c.currency === 'BRL' && exchangeRate
    ? ` (ca. ${Math.round(c.base_price * exchangeRate)} €)`
    : '';
  const suffix = c.price_type === 'per_pax' ? ' pro Person'
    : c.price_type === 'per_hour' ? ' pro Stunde'
    : '';
  return `${sym} ${val}${approx}${suffix}`;
}

const FULL_WEEKDAYS = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
const ABBR_WEEKDAYS = ['So.', 'Mo.', 'Di.', 'Mi.', 'Do.', 'Fr.', 'Sa.'];

function germanWeekday(iso: string): string {
  return FULL_WEEKDAYS[new Date(iso + 'T12:00:00').getDay()];
}

function abbrGermanDay(iso: string): string {
  const d = new Date(iso + 'T12:00:00');
  const day = d.getDate().toString().padStart(2, '0');
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  return `${ABBR_WEEKDAYS[d.getDay()]} ${day}.${month}.`;
}

// ─── Building blocks ──────────────────────────────────────────────────────────

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-xs font-bold text-green-700 uppercase tracking-[0.15em]">{children}</h2>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function AngebotPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const proposal = await getProposalByPublicToken(token);
  if (!proposal) notFound();

  const isSie = proposal.treatment === 'Sie';
  // Nome como digitado no CRM pode vir em minúsculas — title-case só na exibição.
  const displayName = proposal.client_name
    .trim()
    .split(/\s+/)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
  const firstName = displayName.split(' ')[0];
  const showDayPrices = proposal.price_display === 'per_day';
  const deposit = proposal.deposit_amount ?? 0;
  const bank = deposit > 0 ? await getDepositBankInfo() : null;
  const onsiteCosts = collectOnsiteCosts(proposal.items);

  // O cliente nunca vê preço por atividade nem linha de transporte.
  const sortedDays = [...new Set(proposal.items.map(i => i.day))].sort();
  const dayData = sortedDays.map(day => {
    const dayItems = proposal.items.filter(i => i.day === day);
    const activities = dayItems.filter((i: ProposalItem) => i.kind !== 'day_transport');
    return {
      day,
      activities,
      total: dayItems.reduce((sum, i) => sum + i.total_eur, 0),
      hours: Math.ceil(calcDayHours(activities)),
    };
  });
  const grandTotal =
    proposal.total_amount ?? proposal.items.reduce((sum, i) => sum + i.total_eur, 0);

  // Reframing: mesmo valor na menor unidade honesta (pessoa × dia). Só faz
  // sentido quando há mais de uma unidade.
  const priceUnits = proposal.pax * sortedDays.length;
  const perPersonDay = priceUnits > 1 && grandTotal > 0 ? grandTotal / priceUnits : null;

  const valueStack = [
    'Privater deutschsprachiger Guide',
    'Klimatisiertes Privatfahrzeug mit Fahrer',
    'Sicherheit & Komfort an erster Stelle',
    `Individuelle Planung – ${isSie ? 'Ihr' : 'euer'} Tempo`,
    'Zahlung erst am Ende der Tour',
  ];

  const aboutText = isSie
    ? 'Mein Name ist Will, ich bin gebürtiger Carioca und lebe seit jeher in Rio de Janeiro. Ich habe mehrere Jahre in Köln verbracht, spreche fließend Deutsch und kenne beide Welten. Ich biete ausschließlich private, individuelle Führungen an – kein Gruppentrubel, kein Massentourismus. Sie haben mich ganz für sich allein.'
    : 'Mein Name ist Will, ich bin gebürtiger Carioca und lebe seit jeher in Rio de Janeiro. Ich habe mehrere Jahre in Köln verbracht, spreche fließend Deutsch und kenne beide Welten. Ich biete ausschließlich private, individuelle Führungen an – kein Gruppentrubel, kein Massentourismus. Ihr habt mich ganz für euch allein.';

  const heroChips = [
    proposal.arrival_date && proposal.departure_date
      ? `📅 ${formatShortDate(proposal.arrival_date)} – ${formatDate(proposal.departure_date)}`
      : null,
    `👥 ${proposal.pax} ${proposal.pax === 1 ? 'Person' : 'Personen'}`,
    `🗓 ${sortedDays.length} ${sortedDays.length === 1 ? 'Tourtag' : 'Tourtage'}`,
  ].filter(Boolean) as string[];

  return (
    <div className="min-h-screen bg-gray-100 py-6 px-4 sm:py-10">
      <div className="max-w-2xl mx-auto space-y-5">

        {/* ── Header: tipográfico, compacto, estilo papel timbrado ── */}
        <header className="text-center pt-2">
          <p className="text-[11px] font-bold tracking-[0.3em] text-green-700 uppercase">
            Rio für Deutsche
          </p>
          <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold text-gray-900 leading-tight">
            Angebot für {displayName}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Ihr persönlicher deutschsprachiger Guide in Rio de Janeiro
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {heroChips.map(chip => (
              <span
                key={chip}
                className="px-3 py-1.5 rounded-full bg-white border border-gray-200 shadow-sm text-[13px] font-medium text-gray-600 whitespace-nowrap"
              >
                {chip}
              </span>
            ))}
          </div>
        </header>

        {/* ── Begrüßung + Über mich (avatar sobrepondo a borda do card) ── */}
        {/* O wrapper reserva o espaço que o avatar ocupa acima do card, pra
            nunca colidir com os chips do header, independente de viewport. */}
        <div className="pt-12">
        <div className="relative bg-white rounded-2xl border border-gray-200 shadow-sm px-6 pt-14 pb-6 sm:px-7 sm:pb-7">
          <Image
            src="/images/rio-will.webp"
            alt="Will – Ihr deutschsprachiger Guide in Rio"
            width={112}
            height={112}
            className="absolute -top-11 left-1/2 -translate-x-1/2 w-[88px] h-[88px] rounded-full object-cover object-[50%_62%] ring-4 ring-white shadow-lg"
          />
          <p className="text-[15px] text-gray-800 leading-relaxed text-center max-w-md mx-auto">
            Hallo {firstName},
            <br />
            vielen Dank für {isSie ? 'Ihr' : 'dein'} Interesse! Hier ist das persönliche Angebot,
            das ich für {isSie ? 'Sie' : 'euch'} vorbereitet habe.
          </p>
          <div className="mt-5 pt-5 border-t border-gray-100">
            <SectionTitle>Über mich</SectionTitle>
            <p className="mt-2 text-sm text-gray-600 leading-relaxed">{aboutText}</p>
          </div>
        </div>
        </div>

        {/* ── Übersicht ── */}
        {sortedDays.length > 1 && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 pt-6 pb-4">
              <SectionTitle>Übersicht {isSie ? 'Ihrer' : 'eurer'} Tage</SectionTitle>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-green-700 text-white text-left">
                  <th className="px-6 py-2.5 text-xs font-semibold uppercase tracking-wide w-28">Datum</th>
                  <th className="px-4 py-2.5 text-xs font-semibold uppercase tracking-wide">Programm</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {dayData.map(({ day, activities }, i) => (
                  <tr key={day} className={i % 2 === 1 ? 'bg-gray-50/60' : ''}>
                    <td className="px-6 py-3 font-semibold text-gray-800 whitespace-nowrap align-top tabular-nums">
                      {abbrGermanDay(day)}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {activities.map(a => a.service_name).join(' · ')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ── Programm (detalhe por dia) ── */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 pt-6 pb-2">
            <SectionTitle>Detailprogramm</SectionTitle>
          </div>
          <div className="divide-y divide-gray-100">
            {dayData.map(({ day, activities, total, hours }, dayIdx) => (
              <div key={day} className="px-6 py-5">
                {/* Day header */}
                <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                  <span className="flex items-center justify-center w-9 h-9 rounded-full bg-green-600 text-white text-sm font-bold shrink-0">
                    {dayIdx + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-gray-900 leading-tight">
                      {germanWeekday(day)}
                    </p>
                    <p className="text-xs text-gray-400 tabular-nums">{formatDate(day)}</p>
                  </div>
                  <div className="ml-auto flex items-center gap-1.5">
                    {hours > 0 && (
                      <span className="px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-semibold whitespace-nowrap">
                        ⏱ ca. {hours} Std.
                      </span>
                    )}
                    {showDayPrices && (
                      <span className="px-2.5 py-1 rounded-full bg-green-50 text-green-700 text-xs font-bold tabular-nums whitespace-nowrap">
                        {formatEur(total)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Activities timeline */}
                <ol className="mt-4 ml-[17px] border-l-2 border-green-100 space-y-4">
                  {activities.map((item, idx) => (
                    <li key={idx} className="relative pl-5">
                      <span className="absolute -left-[7px] top-1 w-3 h-3 rounded-full bg-green-500 ring-4 ring-white" />
                      <p className="text-sm font-semibold text-gray-800 leading-snug">
                        {item.service_name}
                      </p>
                      {item.service_description && (
                        <p className="mt-0.5 text-[13px] text-gray-500 leading-relaxed">
                          {item.service_description}
                        </p>
                      )}
                      {item.note && (
                        <p className="mt-0.5 text-xs text-gray-400 italic">{item.note}</p>
                      )}
                    </li>
                  ))}
                </ol>
              </div>
            ))}
          </div>
        </div>

        {/* ── Preis ── */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 pt-6 pb-4">
            <SectionTitle>Preisübersicht</SectionTitle>
          </div>

          {showDayPrices && (
            <div className="px-6 pb-4">
              <dl className="divide-y divide-gray-100 border-y border-gray-100">
                {dayData.map(({ day, total }, i) => (
                  <div key={day} className="flex items-center justify-between py-2.5 text-sm">
                    <dt className="text-gray-600">
                      <span className="font-semibold text-gray-800">Tag {i + 1}</span>
                      <span className="text-gray-400"> · {abbrGermanDay(day)}</span>
                    </dt>
                    <dd className="font-medium text-gray-800 tabular-nums">{formatEur(total)}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}

          <div className="bg-green-50 px-6 py-6 border-t border-green-100 text-center">
            {/* Unidade menor em destaque; o total segue logo abaixo, sempre visível */}
            {perPersonDay ? (
              <>
                <p className="text-3xl sm:text-4xl font-extrabold text-green-700 tabular-nums leading-none">
                  {Number.isInteger(perPersonDay) ? `€${perPersonDay}` : `ca. €${Math.round(perPersonDay)}`}
                </p>
                <p className="mt-1.5 text-sm font-semibold text-green-600">pro Person und Tag</p>
                <p className="mt-2.5 text-sm text-green-900/80">
                  Gesamtpreis: <strong className="tabular-nums">{formatEur(grandTotal)}</strong>
                  <span className="text-green-700/60">
                    {' '}· {proposal.pax} {proposal.pax === 1 ? 'Person' : 'Personen'} ·{' '}
                    {sortedDays.length} {sortedDays.length === 1 ? 'Tourtag' : 'Tourtage'}
                  </span>
                </p>
              </>
            ) : (
              <>
                <p className="text-3xl sm:text-4xl font-extrabold text-green-700 tabular-nums leading-none">
                  {formatEur(grandTotal)}
                </p>
                <p className="mt-1.5 text-sm font-semibold text-green-600">Gesamtpreis</p>
                <p className="mt-2.5 text-sm text-green-700/60">
                  {proposal.pax} {proposal.pax === 1 ? 'Person' : 'Personen'} ·{' '}
                  {sortedDays.length} {sortedDays.length === 1 ? 'Tourtag' : 'Tourtage'}
                </p>
              </>
            )}

            {/* Value stack: o que o preço compra, no momento da decisão */}
            <ul className="mt-5 pt-4 border-t border-green-200/60 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 max-w-md mx-auto text-left">
              {valueStack.map(benefit => (
                <li key={benefit} className="flex items-start gap-2 text-[13px] text-green-900/80">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5 mt-0.5 text-green-600 shrink-0">
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                  {benefit}
                </li>
              ))}
            </ul>

            {/* CTA: micro-compromisso — a decisão vira a reserva, não o total */}
            <div className="mt-6">
              {deposit > 0 && bank ? (
                <a
                  href="#anzahlung"
                  className="inline-block w-full sm:w-auto px-8 py-3 bg-green-600 text-white text-sm font-semibold rounded-xl hover:bg-green-700 transition-colors shadow-sm"
                >
                  🔒 Wunschtermine für {formatEur(deposit)} sichern
                </a>
              ) : (
                <a
                  href="https://wa.me/5521990564944"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block w-full sm:w-auto px-8 py-3 bg-green-600 text-white text-sm font-semibold rounded-xl hover:bg-green-700 transition-colors shadow-sm"
                >
                  💬 Jetzt Termine sichern
                </a>
              )}
              {proposal.valid_until && (
                <p className="mt-2 text-xs text-green-700/60">
                  ⏳ Angebot gültig bis {formatDate(proposal.valid_until)}
                </p>
              )}
            </div>
          </div>

          {onsiteCosts.length > 0 && (
            <div className="mx-6 my-5 rounded-xl border border-amber-200 bg-amber-50 p-4">
              <p className="text-xs font-bold text-amber-800 uppercase tracking-wide">
                🎫 Vor Ort zu zahlen
                <span className="ml-1.5 font-normal normal-case text-amber-700/70">
                  (nicht im Preis enthalten)
                </span>
              </p>
              <ul className="mt-2.5 space-y-1.5">
                {onsiteCosts.map((c, i) => (
                  <li key={i} className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5 text-[13px]">
                    <span className="text-amber-900/80">
                      <span className="font-medium">{c.activity}</span>
                      <span className="text-amber-800/60"> – {c.description}</span>
                    </span>
                    <span className="tabular-nums whitespace-nowrap font-semibold text-amber-900">
                      {formatOnsiteCost(c, proposal.exchange_rate)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Hinweise */}
          <ul className="px-6 pb-6 pt-1 space-y-1.5 text-xs text-gray-500">
            <li className="flex gap-2">
              <span className="shrink-0">🍽</span>
              <span>
                Speisen{onsiteCosts.length > 0 ? ' und Getränke' : ', Getränke und Eintrittsgelder'} sind
                nicht im Preis inbegriffen.
              </span>
            </li>
            <li className="flex gap-2">
              <span className="shrink-0">💶</span>
              <span>
                {deposit > 0 ? 'Die Restzahlung' : 'Die Zahlung'} erfolgt in bar in Euro am Ende der Tour.
              </span>
            </li>
            <li className="flex gap-2">
              <span className="shrink-0">✏️</span>
              <span>
                Das Programm ist ein Vorschlag und kann ganz nach {isSie ? 'Ihren' : 'euren'} Wünschen
                angepasst werden.
              </span>
            </li>
          </ul>
        </div>

        {/* ── Buchung & Anzahlung ── */}
        {deposit > 0 && bank && (
          <div id="anzahlung" className="bg-white rounded-2xl border border-gray-200 border-l-4 border-l-green-600 shadow-sm p-6 sm:p-7 scroll-mt-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <SectionTitle>Buchung &amp; Anzahlung</SectionTitle>
              <span className="px-3 py-1 rounded-full bg-green-600 text-white text-sm font-bold tabular-nums">
                {formatEur(deposit)}
              </span>
            </div>
            <p className="mt-3 text-sm text-gray-700 leading-relaxed">
              Um {isSie ? 'Ihren' : 'euren'} Wunschtermin verbindlich zu reservieren, bitte ich um eine
              Anzahlung von <strong>{formatEur(deposit)}</strong> per Banküberweisung:
            </p>
            <dl className="mt-4 rounded-xl bg-gray-50 border border-gray-100 divide-y divide-gray-200/70 text-sm">
              {(
                [
                  ['Kontoinhaber', bank.account_holder, false],
                  ['IBAN', bank.iban, true],
                  ['BIC/SWIFT', bank.bic, true],
                  ['Bank', bank.bank_name, false],
                ] as Array<[string, string, boolean]>
              ).filter(([, v]) => v).map(([label, value, mono]) => (
                <div key={label} className="flex flex-wrap items-center gap-x-4 gap-y-0.5 px-4 py-2">
                  <dt className="w-28 shrink-0 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                    {label}
                  </dt>
                  <dd className="flex-1 min-w-0 flex items-center gap-1.5">
                    <span className={`text-gray-800 ${mono ? 'font-mono text-[13px] font-medium break-all' : 'font-medium break-words'}`}>
                      {value}
                    </span>
                    <CopyButton value={value} label={label} />
                  </dd>
                </div>
              ))}
            </dl>
            <p className="mt-3 flex gap-2 text-xs text-gray-400">
              <span className="shrink-0">⚠️</span>
              <span>
                {isSie ? 'Bitte beachten Sie' : 'Bitte beachtet'}, dass dieser Betrag im Falle einer
                Stornierung nicht zurückerstattet werden kann.
              </span>
            </p>
          </div>
        )}

        {/* ── Kontakt ── */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-7 text-center">
          <SectionTitle>Kontakt &amp; nächste Schritte</SectionTitle>
          <p className="mt-3 text-sm text-gray-700 leading-relaxed max-w-md mx-auto">
            Ich freue mich sehr auf diese Tage mit {isSie ? 'Ihnen' : 'euch'} in Rio! Falls{' '}
            {isSie ? 'Sie Fragen haben' : 'ihr Fragen habt'} oder Anpassungen{' '}
            {isSie ? 'wünschen, schreiben Sie' : 'wünscht, schreibt'} mir jederzeit – ich helfe gerne.
          </p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
            <a
              href="https://wa.me/5521990564944"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white text-sm font-semibold rounded-xl hover:bg-green-700 transition-colors shadow-sm"
            >
              💬 Auf WhatsApp antworten
            </a>
            <a
              href="mailto:riofuerdeutsche@gmail.com"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-gray-300 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-50 transition-colors"
            >
              ✉️ E-Mail schreiben
            </a>
          </div>
          <p className="mt-5 text-xs text-gray-400">
            William Lantelme Filho ·{' '}
            <a href="https://riofuerdeutsche.de" className="text-green-700 hover:underline">
              riofuerdeutsche.de
            </a>
          </p>
        </div>

        {/* ── Compartilhar (cliente → parceiros de viagem) ── */}
        <div className="pt-2">
          <ShareButtons url={`https://riofuerdeutsche.de/angebot/${proposal.public_token}`} />
        </div>

        <p className="text-center text-sm text-gray-400 pb-4">Até logo no Rio! 🌴</p>
      </div>
    </div>
  );
}

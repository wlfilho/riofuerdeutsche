import Image from 'next/image';
import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';
import { getDepositBankInfo, getProposalByPublicToken, type ProposalItem } from '@/lib/proposals';
import { formatCurrency, formatDate as formatDateIntl } from '@/lib/format';
import { proposalCurrency, resolveProposalLocale } from './locale';
import CopyButton from './CopyButton';
import ShareButtons from './ShareButtons';
import ProposalTracker from './ProposalTracker';

/**
 * Página pública da proposta, compartilhada por três rotas:
 *   /angebot/[token]      (legada, sem locale na URL — links já enviados)
 *   /p/[token]            (neutra)
 *   /[locale]/p/[token]   (neutra, locale explícito)
 *
 * As três renderizam ESTE componente; nada é duplicado.
 */

// ─── Format helpers ──────────────────────────────────────────────────────────
//
// ATENÇÃO: o alemão NÃO passa por Intl. `formatEur` produz `€1234,50` (símbolo
// colado, sem espaço), que é exatamente o formato usado no PDF e no texto de
// WhatsApp enviados ao cliente. Intl produziria `1.234,50 €` — mesma proposta
// com dois formatos diferentes. Decisão anterior: o alemão fica byte-idêntico.
// Só locale não-alemão usa formatCurrency/formatDate de @/lib/format.

function formatEurDe(n: number): string {
  return `€${n.toFixed(2).replace('.', ',')}`;
}

function formatDateDe(iso: string | null): string {
  if (!iso) return '—';
  const [y, m, d] = iso.split('-');
  return `${d}.${m}.${y}`;
}

function formatShortDateDe(iso: string): string {
  const [, m, d] = iso.split('-');
  return `${d}.${m}.`;
}

/** Conjunto de formatadores já resolvido para o locale/moeda da proposta. */
type Fmt = {
  money: (n: number) => string;
  date: (iso: string | null) => string;
  shortDate: (iso: string) => string;
  weekday: (iso: string) => string;
  abbrDay: (iso: string) => string;
};

const FULL_WEEKDAYS_DE = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
const ABBR_WEEKDAYS_DE = ['So.', 'Mo.', 'Di.', 'Mi.', 'Do.', 'Fr.', 'Sa.'];

function buildFormatters(locale: string, currency: 'EUR' | 'BRL'): Fmt {
  if (locale === 'de') {
    return {
      money: formatEurDe,
      date: formatDateDe,
      shortDate: formatShortDateDe,
      weekday: (iso) => FULL_WEEKDAYS_DE[new Date(iso + 'T12:00:00').getDay()],
      abbrDay: (iso) => {
        const d = new Date(iso + 'T12:00:00');
        const day = d.getDate().toString().padStart(2, '0');
        const month = (d.getMonth() + 1).toString().padStart(2, '0');
        return `${ABBR_WEEKDAYS_DE[d.getDay()]} ${day}.${month}.`;
      },
    };
  }

  // Datas são date-only (YYYY-MM-DD): formatadas em UTC para não recuar um dia
  // em fuso negativo. Por isso as partes também são lidas em UTC aqui.
  const utc = (iso: string) => new Date(iso + 'T12:00:00Z');
  const weekdayLong = new Intl.DateTimeFormat(locale, { weekday: 'long', timeZone: 'UTC' });
  const weekdayShort = new Intl.DateTimeFormat(locale, { weekday: 'short', timeZone: 'UTC' });
  const dayMonth = new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: '2-digit',
    timeZone: 'UTC',
  });

  return {
    money: (n) => formatCurrency(n, currency, locale),
    date: (iso) => (iso ? formatDateIntl(iso, locale) : '—'),
    shortDate: (iso) => dayMonth.format(utc(iso)),
    weekday: (iso) => weekdayLong.format(utc(iso)),
    abbrDay: (iso) => `${weekdayShort.format(utc(iso))} ${dayMonth.format(utc(iso))}`,
  };
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

export default async function ProposalPage({
  token,
  urlLocale,
}: {
  token: string;
  urlLocale?: string;
}) {
  const proposal = await getProposalByPublicToken(token);
  if (!proposal) notFound();

  const locale = await resolveProposalLocale(proposal, urlLocale);
  const currency = proposalCurrency(proposal);
  const t = await getTranslations({ locale, namespace: 'public.angebot' });
  const fmt = buildFormatters(locale, currency);

  // Sie/du só existe em alemão. Em qualquer outro idioma o catálogo traz a
  // forma neutra e o branching é ignorado.
  const isGerman = locale === 'de';
  const isSie = isGerman && proposal.treatment === 'Sie';
  // `.sie`/`.du` só são chaves reais no catálogo alemão; fora dele o rótulo é
  // plano. Este helper mantém as duas formas no mesmo ponto de chamada.
  const tt = (key: string) => (isGerman ? t(`${key}.${isSie ? 'sie' : 'du'}`) : t(key));

  const formatOnsiteCost = (c: OnsiteCost): string => {
    if (isGerman) {
      const sym = c.currency === 'EUR' ? '€' : 'R$';
      const val = c.base_price % 1 === 0
        ? c.base_price.toFixed(0)
        : c.base_price.toFixed(2).replace('.', ',');
      const approx = c.currency === 'BRL' && proposal.exchange_rate
        ? ` (ca. ${Math.round(c.base_price * proposal.exchange_rate)} €)`
        : '';
      const suffix = c.price_type === 'per_pax' ? ' pro Person'
        : c.price_type === 'per_hour' ? ' pro Stunde'
        : '';
      return `${sym} ${val}${approx}${suffix}`;
    }
    const val = formatCurrency(c.base_price, c.currency, locale);
    const approx = c.currency === 'BRL' && proposal.exchange_rate
      ? ` (${t('approx')} ${formatCurrency(Math.round(c.base_price * proposal.exchange_rate), 'EUR', locale)})`
      : '';
    const suffix = c.price_type === 'per_pax' ? ` ${t('perPerson')}`
      : c.price_type === 'per_hour' ? ` ${t('perHour')}`
      : '';
    return `${val}${approx}${suffix}`;
  };

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
  // Dias contam a partir das atividades: propostas antigas podem carregar uma
  // linha day_transport órfã (custo 0) de um dia esvaziado no editor, que não
  // deve virar dia de tour aqui.
  const sortedDays = [...new Set(
    proposal.items.filter(i => i.kind !== 'day_transport').map(i => i.day),
  )].sort();
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
  const calculatedSum = proposal.items.reduce((sum, i) => sum + i.total_eur, 0);
  // total_amount já é o que o cliente paga (preço final manual, quando o Will
  // definiu um). Com discount_visible, a diferença pro calculado vira uma
  // linha de Rabatt explícita — só quando é desconto de verdade; acréscimo
  // nunca é anunciado.
  const grandTotal = proposal.total_amount ?? calculatedSum;
  const discount =
    proposal.discount_visible && proposal.total_override_amount != null
      ? calculatedSum - grandTotal
      : 0;
  const showDiscount = discount > 0.005;

  // Reframing: mesmo valor na menor unidade honesta (pessoa × dia). Só faz
  // sentido quando há mais de uma unidade.
  const priceUnits = proposal.pax * sortedDays.length;
  const perPersonDay = priceUnits > 1 && grandTotal > 0 ? grandTotal / priceUnits : null;

  // Valor de destaque: inteiro sai limpo, quebrado sai arredondado com "ca.".
  const perPersonDayLabel = perPersonDay === null
    ? null
    : isGerman
      ? (Number.isInteger(perPersonDay) ? `€${perPersonDay}` : `ca. €${Math.round(perPersonDay)}`)
      : (Number.isInteger(perPersonDay)
        ? formatCurrency(perPersonDay, currency, locale)
        : `${t('approx')} ${formatCurrency(Math.round(perPersonDay), currency, locale)}`);

  const valueStack = [
    t('valueStack.guide'),
    t('valueStack.vehicle'),
    t('valueStack.pickup'),
    t('valueStack.safety'),
    tt('valueStack.pace'),
    t('valueStack.payLater'),
  ];

  const aboutText = tt('aboutText');

  const heroChips = [
    // Tour de um dia só: data única, sem o range degenerado "28.10. – 28.10.".
    proposal.arrival_date && proposal.departure_date
      ? `📅 ${proposal.arrival_date === proposal.departure_date
          ? fmt.date(proposal.arrival_date)
          : `${fmt.shortDate(proposal.arrival_date)} – ${fmt.date(proposal.departure_date)}`}`
      : null,
    `👥 ${proposal.pax} ${proposal.pax === 1 ? t('person') : t('persons')}`,
    `🗓 ${sortedDays.length} ${sortedDays.length === 1 ? t('tourDay') : t('tourDays')}`,
  ].filter(Boolean) as string[];

  // CopyButton/ShareButtons são client components: sem este provider explícito
  // eles resolveriam pelo locale DO REQUEST (o público cai em 'de'), não pelo
  // locale da proposta. Mesmo padrão do admin layout.
  const clientMessages = await getMessages({ locale });

  return (
    <NextIntlClientProvider locale={locale} messages={clientMessages}>
    <ProposalTracker token={proposal.public_token} locale={locale} />
    <div className="min-h-screen bg-gray-100 py-6 px-4 sm:py-10">
      <div className="max-w-2xl mx-auto space-y-5">

        {/* ── Header: tipográfico, compacto, estilo papel timbrado ── */}
        <header className="text-center pt-2">
          <p className="text-[11px] font-bold tracking-[0.3em] text-green-700 uppercase">
            {t('brand')}
          </p>
          <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold text-gray-900 leading-tight">
            {t('headerTitle', { name: displayName })}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {t('headerSubtitle')}
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
            src="/android-chrome-512x512.png"
            alt={t('avatarAlt')}
            width={112}
            height={112}
            className="absolute -top-11 left-1/2 -translate-x-1/2 w-[88px] h-[88px] rounded-full object-cover bg-white ring-4 ring-white shadow-lg"
          />
          <p className="text-[15px] text-gray-800 leading-relaxed text-center max-w-md mx-auto">
            {t('greeting', { name: firstName })}
            <br />
            {tt('greetingBody')}
          </p>
          <div className="mt-5 pt-5 border-t border-gray-100">
            <SectionTitle>{t('aboutTitle')}</SectionTitle>
            <p className="mt-2 text-sm text-gray-600 leading-relaxed">{aboutText}</p>
          </div>
        </div>
        </div>

        {/* ── Übersicht ── */}
        {sortedDays.length > 1 && (
          <div data-track-section="overview" className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 pt-6 pb-4">
              <SectionTitle>{tt('overviewTitle')}</SectionTitle>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-green-700 text-white text-left">
                  <th className="px-6 py-2.5 text-xs font-semibold uppercase tracking-wide w-28">{t('tableDate')}</th>
                  <th className="px-4 py-2.5 text-xs font-semibold uppercase tracking-wide">{t('tableProgram')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {dayData.map(({ day, activities }, i) => (
                  <tr key={day} className={i % 2 === 1 ? 'bg-gray-50/60' : ''}>
                    <td className="px-6 py-3 font-semibold text-gray-800 whitespace-nowrap align-top tabular-nums">
                      {fmt.abbrDay(day)}
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
        <div data-track-section="program" className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 pt-6 pb-2">
            <SectionTitle>{t('detailProgramTitle')}</SectionTitle>
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
                      {fmt.weekday(day)}
                    </p>
                    <p className="text-xs text-gray-400 tabular-nums">{fmt.date(day)}</p>
                  </div>
                  <div className="ml-auto flex items-center gap-1.5">
                    {hours > 0 && (
                      <span className="px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-semibold whitespace-nowrap">
                        {t('hoursChip', { hours: String(hours) })}
                      </span>
                    )}
                    {showDayPrices && (
                      <span className="px-2.5 py-1 rounded-full bg-green-50 text-green-700 text-xs font-bold tabular-nums whitespace-nowrap">
                        {fmt.money(total)}
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
            <SectionTitle>{t('priceOverviewTitle')}</SectionTitle>
          </div>

          {showDayPrices && (
            <div className="px-6 pb-4">
              <dl className="divide-y divide-gray-100 border-y border-gray-100">
                {dayData.map(({ day, total }, i) => (
                  <div key={day} className="flex items-center justify-between py-2.5 text-sm">
                    <dt className="text-gray-600">
                      <span className="font-semibold text-gray-800">{t('dayLabel', { n: String(i + 1) })}</span>
                      <span className="text-gray-400"> · {fmt.abbrDay(day)}</span>
                    </dt>
                    <dd className="font-medium text-gray-800 tabular-nums">{fmt.money(total)}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}

          {showDiscount && (
            <div className="px-6 pb-4">
              <dl className={`divide-y divide-gray-100 ${showDayPrices ? '' : 'border-y border-gray-100'}`}>
                <div className="flex items-center justify-between py-2.5 text-sm">
                  <dt className="text-gray-600">{t('subtotalLabel')}</dt>
                  <dd className="font-medium text-gray-800 tabular-nums">{fmt.money(calculatedSum)}</dd>
                </div>
                <div className="flex items-center justify-between py-2.5 text-sm">
                  <dt className="font-semibold text-green-700">{t('discountLabel')}</dt>
                  <dd className="font-semibold text-green-700 tabular-nums">−{fmt.money(discount)}</dd>
                </div>
              </dl>
            </div>
          )}

          <div data-track-section="price" className="bg-green-50 px-6 py-6 border-t border-green-100 text-center">
            {/* Unidade menor em destaque; o total segue logo abaixo, sempre visível */}
            {perPersonDayLabel ? (
              <>
                <p className="text-3xl sm:text-4xl font-extrabold text-green-700 tabular-nums leading-none">
                  {perPersonDayLabel}
                </p>
                <p className="mt-1.5 text-sm font-semibold text-green-600">{t('perPersonDay')}</p>
                <p className="mt-2.5 text-sm text-green-900/80">
                  {t('totalPriceLabel')}: <strong className="tabular-nums">{fmt.money(grandTotal)}</strong>
                  <span className="text-green-700/60">
                    {' '}· {proposal.pax} {proposal.pax === 1 ? t('person') : t('persons')} ·{' '}
                    {sortedDays.length} {sortedDays.length === 1 ? t('tourDay') : t('tourDays')}
                  </span>
                </p>
              </>
            ) : (
              <>
                <p className="text-3xl sm:text-4xl font-extrabold text-green-700 tabular-nums leading-none">
                  {fmt.money(grandTotal)}
                </p>
                <p className="mt-1.5 text-sm font-semibold text-green-600">{t('totalPriceLabel')}</p>
                <p className="mt-2.5 text-sm text-green-700/60">
                  {proposal.pax} {proposal.pax === 1 ? t('person') : t('persons')} ·{' '}
                  {sortedDays.length} {sortedDays.length === 1 ? t('tourDay') : t('tourDays')}
                </p>
              </>
            )}

            {/* Value stack: o que o preço compra, no momento da decisão.
                Colunas dimensionadas pelo conteúdo e centralizadas como bloco,
                acompanhando o alinhamento do painel. */}
            <div className="mt-5 pt-4 border-t border-green-200/60 flex justify-center">
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-1.5 text-left">
              {valueStack.map(benefit => (
                <li key={benefit} className="flex items-start gap-2 text-[13px] text-green-900/80">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5 mt-0.5 text-green-600 shrink-0">
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                  {benefit}
                </li>
              ))}
            </ul>
            </div>

            {/* CTA: micro-compromisso — a decisão vira a reserva, não o total */}
            <div className="mt-6">
              {deposit > 0 && bank ? (
                <a
                  href="#anzahlung"
                  data-track-click="deposit_cta"
                  className="inline-block w-full sm:w-auto px-8 py-3 bg-green-600 text-white text-sm font-semibold rounded-xl hover:bg-green-700 transition-colors shadow-sm"
                >
                  {t('depositCta', { amount: fmt.money(deposit) })}
                </a>
              ) : (
                <a
                  href="https://wa.me/5521990564944"
                  target="_blank"
                  rel="noopener noreferrer"
                  data-track-click="whatsapp_cta"
                  className="inline-flex w-full sm:w-auto items-center justify-center gap-2 px-8 py-3 bg-green-600 text-white text-sm font-semibold rounded-xl hover:bg-green-700 transition-colors shadow-sm"
                >
                  <WhatsAppIcon className="w-5 h-5" />
                  {t('whatsappCta')}
                </a>
              )}
              {proposal.valid_until && (
                <p className="mt-2 text-xs text-green-700/60">
                  {t('validUntil', { date: fmt.date(proposal.valid_until) })}
                </p>
              )}
            </div>
          </div>

          {onsiteCosts.length > 0 && (
            <div className="mx-6 my-5 rounded-xl border border-amber-200 bg-amber-50 p-4">
              <p className="text-xs font-bold text-amber-800 uppercase tracking-wide">
                {t('onsiteTitle')}
                <span className="ml-1.5 font-normal normal-case text-amber-700/70">
                  {t('onsiteNote')}
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
                      {formatOnsiteCost(c)}
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
                {onsiteCosts.length > 0 ? t('noteMealsWithOnsite') : t('noteMealsWithoutOnsite')}
              </span>
            </li>
            <li className="flex gap-2">
              <span className="shrink-0">💶</span>
              <span>
                {deposit > 0 ? t('notePaymentRest') : t('notePaymentFull')}
              </span>
            </li>
            <li className="flex gap-2">
              <span className="shrink-0">✏️</span>
              <span>
                {tt('noteAdjustable')}
              </span>
            </li>
          </ul>
        </div>

        {/* ── Buchung & Anzahlung ── */}
        {deposit > 0 && bank && (
          <div id="anzahlung" data-track-section="bank" className="bg-white rounded-2xl border border-gray-200 border-l-4 border-l-green-600 shadow-sm p-6 sm:p-7 scroll-mt-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <SectionTitle>{t('bookingTitle')}</SectionTitle>
              <span className="px-3 py-1 rounded-full bg-green-600 text-white text-sm font-bold tabular-nums">
                {fmt.money(deposit)}
              </span>
            </div>
            <p className="mt-3 text-sm text-gray-700 leading-relaxed">
              {t.rich(isGerman ? `depositRequest.${isSie ? 'sie' : 'du'}` : 'depositRequest', {
                amount: fmt.money(deposit),
                strong: chunks => <strong>{chunks}</strong>,
              })}
            </p>
            <dl className="mt-4 rounded-xl bg-gray-50 border border-gray-100 divide-y divide-gray-200/70 text-sm">
              {(
                [
                  [t('bankAccountHolder'), bank.account_holder, false, 'copy_holder'],
                  [t('bankIban'), bank.iban, true, 'copy_iban'],
                  [t('bankBic'), bank.bic, true, 'copy_bic'],
                  [t('bankName'), bank.bank_name, false, 'copy_bank_name'],
                ] as Array<[string, string, boolean, string]>
              ).filter(([, v]) => v).map(([label, value, mono, trackId]) => (
                <div key={label} className="flex flex-wrap items-center gap-x-4 gap-y-0.5 px-4 py-2">
                  <dt className="w-28 shrink-0 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                    {label}
                  </dt>
                  <dd className="flex-1 min-w-0 flex items-center gap-1.5">
                    <span className={`text-gray-800 ${mono ? 'font-mono text-[13px] font-medium break-all' : 'font-medium break-words'}`}>
                      {value}
                    </span>
                    <CopyButton value={value} label={label} trackId={trackId} />
                  </dd>
                </div>
              ))}
            </dl>
            <p className="mt-3 flex gap-2 text-xs text-gray-400">
              <span className="shrink-0">⚠️</span>
              <span>
                {tt('depositWarning')}
              </span>
            </p>
          </div>
        )}

        {/* ── Kontakt ── */}
        <div data-track-section="contact" className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-7 text-center">
          <SectionTitle>{t('contactTitle')}</SectionTitle>
          <p className="mt-3 text-sm text-gray-700 leading-relaxed max-w-md mx-auto">
            {tt('contactText')}
          </p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
            <a
              href="https://wa.me/5521990564944"
              target="_blank"
              rel="noopener noreferrer"
              data-track-click="whatsapp_contact"
              className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white text-sm font-semibold rounded-xl hover:bg-green-700 transition-colors shadow-sm"
            >
              <WhatsAppIcon className="w-5 h-5" />
              {t('replyWhatsApp')}
            </a>
            <a
              href="mailto:riofuerdeutsche@gmail.com"
              data-track-click="email_contact"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-gray-300 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-50 transition-colors"
            >
              {t('replyEmail')}
            </a>
          </div>
          <p className="mt-5 text-xs text-gray-400">
            {t('signature')} ·{' '}
            <a href="https://riofuerdeutsche.de" className="text-green-700 hover:underline">
              riofuerdeutsche.de
            </a>
          </p>
        </div>

        {/* ── Compartilhar (cliente → parceiros de viagem) ── */}
        <div data-track-section="share" className="pt-2">
          <ShareButtons url={`https://riofuerdeutsche.de/angebot/${proposal.public_token}`} />
        </div>

        <p className="text-center text-sm text-gray-400 pb-4">{t('farewell')}</p>
      </div>
    </div>
    </NextIntlClientProvider>
  );
}

// ─── Building blocks ─────────────────────────────────────────────────────────

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-xs font-bold text-green-700 uppercase tracking-[0.15em]">{children}</h2>
  );
}

function WhatsAppIcon({ className }: { className: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
    </svg>
  );
}

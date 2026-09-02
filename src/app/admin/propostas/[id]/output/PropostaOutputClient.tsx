'use client';

import { useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { fmtDate, fmtDateTime, fmtEur } from '@/lib/adminFormat';
import { resolveDayTransportKey } from '@/lib/dayTransportLabel';
import AnzahlungToggle, { type TourDateDeposit } from '@/components/admin/AnzahlungToggle';
import type { DepositBankInfo, Proposal, ProposalStatus } from '@/lib/proposals';
// Só o tipo: `import type` some na compilação, então o lib de e-mail (Resend,
// service role) não entra no bundle do browser.
import type { ProposalEmailLogEntry } from '@/lib/email/sendProposalEmail';

// ─── Format helpers ────────────────────────────────────────────────────────────
// ATENÇÃO: formatDate/formatShortDate/formatEur/formatDuration/formatOnsiteCost e
// os helpers de dia em alemão (fullGermanDay/abbrGermanDay) alimentam o texto de
// WhatsApp e o PDF ENVIADOS AO CLIENTE. Não trocar por @/lib/adminFormat nem
// traduzir: a saída do cliente é em alemão. Para a UI do admin, use fmtDate/fmtEur.

function formatDate(iso: string | null): string {
  if (!iso) return '—';
  const [y, m, d] = iso.split('-');
  return `${d}.${m}.${y}`;
}

function formatShortDate(iso: string): string {
  const [, m, d] = iso.split('-');
  return `${d}.${m}.`;
}

function formatEur(n: number): string {
  return `€${n.toFixed(2).replace('.', ',')}`;
}

function formatDuration(hours: number): string {
  const totalMinutes = Math.round(hours * 60);
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  if (h === 0) return `${m} Min.`;
  if (m === 0) return `${h} Std.`;
  return `${h} Std. ${m} Min.`;
}

function calcDayHours(items: { duration_hours: number | null; transfer_hours_to: number | null; transfer_hours_back: number | null }[]): number {
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

// Linhas 'day_transport' com custo zero existem só para congelar os toggles do
// dia (motorista/carro desligados, ou tarifas ainda em placeholder) — ficam
// fora de tudo que é exibido ou enviado ao cliente.
function visibleItems(items: Proposal['items']): Proposal['items'] {
  return items.filter(i => !(i.kind === 'day_transport' && i.total_eur === 0));
}

const FULL_WEEKDAYS = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
const ABBR_WEEKDAYS = ['So.', 'Mo.', 'Di.', 'Mi.', 'Do.', 'Fr.', 'Sa.'];

function fullGermanDay(iso: string): string {
  const d = new Date(iso + 'T12:00:00');
  const day = d.getDate().toString().padStart(2, '0');
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  return `${FULL_WEEKDAYS[d.getDay()]}, ${day}.${month}.${d.getFullYear()}`;
}

function abbrGermanDay(iso: string): string {
  const d = new Date(iso + 'T12:00:00');
  const day = d.getDate().toString().padStart(2, '0');
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  return `${ABBR_WEEKDAYS[d.getDay()]} ${day}.${month}.`;
}

// ─── Status config ─────────────────────────────────────────────────────────────

// Só a aparência: o rótulo vem de admin.status.proposal e o valor gravado no
// banco continua em inglês (draft/sent/accepted/rejected).
const STATUS_CLASSNAME: Record<ProposalStatus, string> = {
  draft: 'bg-gray-100 text-gray-600',
  sent: 'bg-blue-100 text-blue-700',
  accepted: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
};

// Link público enviado ao cliente — domínio canônico de produção.
// Rota neutra /{locale}/p/{token}: o path deixa de ser alemão e o idioma fica
// explícito na URL. /angebot/{token} continua respondendo para os links já
// enviados, então trocar aqui não quebra nada que está na mão do cliente.
function publicProposalUrl(proposal: Proposal): string {
  // 'de' inline de propósito: importar o valor de @/lib/proposals arrastaria o
  // client Supabase de servidor para o bundle do browser.
  const locale = proposal.locale || 'de';
  return `https://riofuerdeutsche.de/${locale}/p/${proposal.public_token}`;
}

// Custos que o cliente paga no local (included=false): fora do total, mas
// exibidos na proposta para ele se programar. Dedup para atividades repetidas
// em mais de um dia.
type OnsiteCost = {
  activity: string;
  description: string;
  base_price: number;
  currency: 'EUR' | 'BRL';
  price_type: 'fixed' | 'per_pax' | 'per_hour';
};

function collectOnsiteCosts(items: Proposal['items']): OnsiteCost[] {
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

// Desconto anunciável: só existe quando o Will definiu preço final manual COM
// a opção "mostrar Rabatt" — e só quando é desconto de verdade (acréscimo
// nunca vira linha na proposta). subtotal = soma calculada dos itens.
function proposalDiscount(proposal: Proposal): { subtotal: number; discount: number } | null {
  if (!proposal.discount_visible || proposal.total_override_amount == null) return null;
  const subtotal = proposal.items.reduce((sum, i) => sum + i.total_eur, 0);
  const discount = subtotal - (proposal.total_amount ?? subtotal);
  return discount > 0.005 ? { subtotal, discount } : null;
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

// ─── WhatsApp text generator ───────────────────────────────────────────────────

function generateWhatsAppText(proposal: Proposal): string {
  const firstName = proposal.client_name.split(' ')[0];
  const isSie = proposal.treatment === 'Sie';

  const lines: string[] = [];
  lines.push(`Hallo ${firstName},`);
  lines.push('');
  lines.push(
    `vielen Dank für ${isSie ? 'Ihr' : 'dein'} Interesse! Ich habe ein persönliches Angebot für ${isSie ? 'Sie' : 'euch'} vorbereitet.`
  );
  lines.push('');

  if (proposal.arrival_date && proposal.departure_date) {
    lines.push(
      `📅 Reisezeitraum: ${formatShortDate(proposal.arrival_date)} – ${formatDate(proposal.departure_date)}`
    );
  }
  lines.push(`👥 Personen: ${proposal.pax}`);
  lines.push('');
  lines.push('🗓 Programm:');

  // O cliente nunca vê preço nem duração por atividade, nem linha de
  // transporte: o programa lista as atividades, a duração aparece só como
  // total aproximado do dia (arredondado pra cima) e o preço por dia
  // (se configurado) e no total.
  const showDayPrices = proposal.price_display === 'per_day';
  const sortedDays = [...new Set(proposal.items.map(i => i.day))].sort();
  for (const day of sortedDays) {
    const dayItems = proposal.items.filter(i => i.day === day);
    const activities = dayItems.filter(i => i.kind !== 'day_transport');
    const dayTotal = dayItems.reduce((sum, i) => sum + i.total_eur, 0);
    const dayHours = Math.ceil(calcDayHours(activities));
    lines.push('');
    lines.push(showDayPrices ? `${fullGermanDay(day)} — ${formatEur(dayTotal)}` : fullGermanDay(day));
    for (const item of activities) {
      lines.push(`• ${item.service_name}`);
    }
    if (dayHours > 0) lines.push(`⏱ Dauer: ca. ${dayHours} Std.`);
  }

  const deposit = proposal.deposit_amount ?? 0;
  const onsiteCosts = collectOnsiteCosts(proposal.items);

  // Reframing: mesmo valor na menor unidade honesta (pessoa × dia).
  const total = proposal.total_amount ?? 0;
  const priceUnits = proposal.pax * sortedDays.length;
  const perPersonDay = priceUnits > 1 && total > 0 ? total / priceUnits : null;

  lines.push('');
  const rabatt = proposalDiscount(proposal);
  if (rabatt) {
    lines.push(`🧾 Zwischensumme: ${formatEur(rabatt.subtotal)}`);
    lines.push(`🎁 Rabatt: -${formatEur(rabatt.discount)}`);
  }
  lines.push(`💰 Gesamtpreis: ${formatEur(total)}`);
  if (perPersonDay) {
    lines.push(
      Number.isInteger(perPersonDay)
        ? `✦ nur €${perPersonDay} pro Person und Tag`
        : `✦ nur ca. €${Math.round(perPersonDay)} pro Person und Tag`
    );
  }
  if (proposal.valid_until) {
    lines.push(`⏳ Angebot gültig bis ${formatDate(proposal.valid_until)}`);
  }
  lines.push('');
  lines.push(
    onsiteCosts.length > 0
      ? 'ℹ️ Speisen und Getränke sind nicht im Preis inbegriffen.'
      : 'ℹ️ Speisen, Getränke und Eintrittsgelder sind nicht im Preis inbegriffen.'
  );
  lines.push(`💳 ${deposit > 0 ? 'Die Restzahlung' : 'Die Zahlung'} erfolgt in bar in Euro am Ende der Tour.`);
  if (onsiteCosts.length > 0) {
    lines.push('');
    lines.push('🎫 Vor Ort zu zahlen (nicht im Preis enthalten):');
    for (const c of onsiteCosts) {
      lines.push(`• ${c.activity}: ${c.description} – ${formatOnsiteCost(c, proposal.exchange_rate)}`);
    }
  }
  if (deposit > 0) {
    lines.push('');
    lines.push(
      `📌 Zur verbindlichen Reservierung bitte ich um eine Anzahlung von ${formatEur(deposit)} – alle Details ${isSie ? 'finden Sie' : 'findest du'} im Angebot.`
    );
  }
  lines.push('');
  lines.push(`Das vollständige Angebot ${isSie ? 'können Sie' : 'kannst du'} hier ansehen:`);
  lines.push(publicProposalUrl(proposal));
  lines.push('');
  lines.push('Bis bald in Rio! 🌴');
  lines.push('Will');
  lines.push('riofuerdeutsche.de');

  return lines.join('\n');
}

// ─── PDF generator ─────────────────────────────────────────────────────────────

async function downloadPDF(proposal: Proposal, bank: DepositBankInfo): Promise<void> {
  const jsPDFModule = await import('jspdf');
  const JsPDF = jsPDFModule.default;
  const doc = new JsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });

  const mL = 20, mR = 20, pageW = 210;
  const cW = pageW - mL - mR; // 170mm
  let y = 25;

  const GREEN = '#22a262';
  const DARK = '#1a1a1a';
  const GRAY = '#646464';
  const GREEN_BG = '#f0faf4';
  const SEPARATOR = '#dcdcdc';

  // ── Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(GREEN);
  doc.text('RIO FÜR DEUTSCHE', mL, y);
  y += 7;

  doc.setDrawColor(GREEN);
  doc.setLineWidth(0.8);
  doc.line(mL, y, pageW - mR, y);
  y += 6;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(13);
  doc.setTextColor(DARK);
  doc.text('Angebot', mL, y);
  y += 14;

  // ── Client data
  const today = new Date();
  const todayStr = [
    today.getDate().toString().padStart(2, '0'),
    (today.getMonth() + 1).toString().padStart(2, '0'),
    today.getFullYear(),
  ].join('.');

  const clientRows: Array<[string, string]> = [['Für:', proposal.client_name], ['Datum:', todayStr]];
  if (proposal.arrival_date && proposal.departure_date) {
    clientRows.push([
      'Reisezeitraum:',
      `${formatShortDate(proposal.arrival_date)} – ${formatDate(proposal.departure_date)}`,
    ]);
  }
  clientRows.push(['Personen:', String(proposal.pax)]);

  doc.setFontSize(10);
  for (const [label, value] of clientRows) {
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(DARK);
    doc.text(label, mL, y);
    doc.setFont('helvetica', 'normal');
    doc.text(value, mL + 43, y);
    y += 6;
  }
  y += 6;

  // ── Über mich
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(GREEN);
  doc.text('Über mich', mL, y);
  y += 5;

  const aboutText =
    proposal.treatment === 'Sie'
      ? 'Mein Name ist Will, ich bin gebürtiger Carioca und lebe seit jeher in Rio de Janeiro. Ich habe mehrere Jahre in Köln verbracht, spreche fließend Deutsch und kenne beide Welten. Ich biete ausschließlich private, individuelle Führungen an – kein Gruppentrubel, kein Massentourismus. Sie haben mich ganz für sich allein.'
      : 'Mein Name ist Will, ich bin gebürtiger Carioca und lebe seit jeher in Rio de Janeiro. Ich habe mehrere Jahre in Köln verbracht, spreche fließend Deutsch und kenne beide Welten. Ich biete ausschließlich private, individuelle Führungen an – kein Gruppentrubel, kein Massentourismus. Ihr habt mich ganz für euch allein.';

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(DARK);
  const aboutLines = doc.splitTextToSize(aboutText, cW);
  doc.text(aboutLines, mL, y);
  y += (aboutLines.length as number) * 5 + 10;

  // ── Table
  // Columns: date@mL, program@mL+28, duration@mL+110, price (right-aligned)@pageW-mR
  // O cliente nunca vê preço por atividade nem linha de transporte: cada dia é
  // um cabeçalho (com o subtotal do dia, se configurado) seguido das atividades.
  const COL = { date: mL, prog: mL + 28, dur: mL + 110, priceR: pageW - mR };
  const showDayPrices = proposal.price_display === 'per_day';

  doc.setFillColor(GREEN_BG);
  doc.rect(mL, y, cW, 8, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(GREEN);
  doc.text('Datum', COL.date + 2, y + 5.5);
  doc.text('Programm', COL.prog + 2, y + 5.5);
  doc.text('Dauer', COL.dur + 2, y + 5.5);
  if (showDayPrices) doc.text('Preis', COL.priceR - 2, y + 5.5, { align: 'right' });
  y += 8;

  const sortedDays = [...new Set(proposal.items.map(i => i.day))].sort();

  for (const day of sortedDays) {
    const dayItems = proposal.items.filter(i => i.day === day);
    const activities = dayItems.filter(i => i.kind !== 'day_transport');
    const dayTotal = dayItems.reduce((sum, i) => sum + i.total_eur, 0);
    // Duração só como total aproximado do dia, arredondado pra cima.
    const dayHours = Math.ceil(calcDayHours(activities));

    if (y > 250) {
      doc.addPage();
      y = 20;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(DARK);
    doc.text(abbrGermanDay(day), COL.date + 2, y + 5);
    if (dayHours > 0) doc.text(`ca. ${dayHours} Std.`, COL.dur + 2, y + 5);
    if (showDayPrices) doc.text(formatEur(dayTotal), COL.priceR - 2, y + 5, { align: 'right' });

    for (let idx = 0; idx < activities.length; idx++) {
      const item = activities[idx];

      if (y > 260) {
        doc.addPage();
        y = 20;
      }

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(DARK);

      const nameLines = doc.splitTextToSize(item.service_name, 75);
      doc.text(nameLines[0] as string, COL.prog + 2, y + 5);
      y += 6;

      // Descrição curta da atividade, em cinza, embaixo do nome.
      if (item.service_description) {
        doc.setFontSize(8);
        doc.setTextColor(GRAY);
        const descLines = doc.splitTextToSize(item.service_description, 100) as string[];
        for (const line of descLines) {
          if (y > 265) {
            doc.addPage();
            y = 20;
          }
          doc.text(line, COL.prog + 2, y + 4);
          y += 4;
        }
        y += 1;
      } else {
        y += 1;
      }
    }

    doc.setDrawColor(SEPARATOR);
    doc.setLineWidth(0.2);
    doc.line(mL, y + 1, pageW - mR, y + 1);
    y += 3;
  }

  // Zwischensumme + Rabatt antes do total, quando o desconto é anunciável.
  const pdfRabatt = proposalDiscount(proposal);
  if (pdfRabatt) {
    y += 2;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(DARK);
    doc.text('Zwischensumme', COL.prog + 2, y + 5);
    doc.text(formatEur(pdfRabatt.subtotal), COL.priceR - 2, y + 5, { align: 'right' });
    y += 6;
    doc.setTextColor(GREEN);
    doc.text('Rabatt', COL.prog + 2, y + 5);
    doc.text(`-${formatEur(pdfRabatt.discount)}`, COL.priceR - 2, y + 5, { align: 'right' });
    y += 4;
  }

  // Total row
  y += 2;
  doc.setFillColor(GREEN_BG);
  doc.rect(mL, y, cW, 9, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(GREEN);
  doc.text('Gesamt', COL.prog + 2, y + 6);
  doc.text(formatEur(proposal.total_amount ?? 0), COL.priceR - 2, y + 6, { align: 'right' });
  y += 12;

  // Reframing: mesmo valor na menor unidade honesta (pessoa × dia).
  const pdfTotal = proposal.total_amount ?? 0;
  const pdfUnits = proposal.pax * sortedDays.length;
  const pdfPerUnit = pdfUnits > 1 && pdfTotal > 0 ? pdfTotal / pdfUnits : null;
  if (pdfPerUnit) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(GRAY);
    const label = Number.isInteger(pdfPerUnit)
      ? `nur €${pdfPerUnit} pro Person und Tag`
      : `nur ca. €${Math.round(pdfPerUnit)} pro Person und Tag`;
    doc.text(label, COL.priceR - 2, y, { align: 'right' });
    y += 8;
  } else {
    y += 4;
  }

  // ── Footer notes
  const isSie = proposal.treatment === 'Sie';
  const deposit = proposal.deposit_amount ?? 0;
  const onsiteCosts = collectOnsiteCosts(proposal.items);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(GRAY);
  const footerNotes = [
    onsiteCosts.length > 0
      ? '• Speisen und Getränke sind nicht im Preis inbegriffen.'
      : '• Speisen, Getränke und Eintrittsgelder sind nicht im Preis inbegriffen.',
    `• ${deposit > 0 ? 'Die Restzahlung' : 'Die Zahlung'} erfolgt in bar in Euro am Ende der Tour.`,
    '• Klimatisiertes Privatfahrzeug mit Fahrer für alle Transfers inklusive.',
    `• Das Programm ist ein Vorschlag und kann ganz nach ${isSie ? 'Ihren' : 'euren'} Wünschen angepasst werden.`,
    ...(proposal.valid_until ? [`• Angebot gültig bis ${formatDate(proposal.valid_until)}.`] : []),
  ];
  for (const note of footerNotes) {
    doc.text(note, mL, y);
    y += 5;
  }
  y += 8;

  // ── Vor Ort zu zahlen (custos que o cliente paga direto, fora do total)
  if (onsiteCosts.length > 0) {
    if (y > 240) {
      doc.addPage();
      y = 20;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(GREEN);
    doc.text('Vor Ort zu zahlen (nicht im Preis enthalten)', mL, y);
    y += 6;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(DARK);
    for (const c of onsiteCosts) {
      if (y > 265) {
        doc.addPage();
        y = 20;
      }
      doc.text(
        `• ${c.activity}: ${c.description} – ${formatOnsiteCost(c, proposal.exchange_rate)}`,
        mL,
        y,
      );
      y += 5;
    }
    y += 8;
  }

  // ── Buchung & Anzahlung
  if (deposit > 0) {
    if (y > 230) {
      doc.addPage();
      y = 20;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(GREEN);
    doc.text('Buchung & Anzahlung', mL, y);
    y += 6;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(DARK);
    const anzahlungText =
      `Um ${isSie ? 'Ihren' : 'euren'} Wunschtermin verbindlich zu reservieren, bitte ich um eine ` +
      `Anzahlung von ${formatEur(deposit)}. ${isSie ? 'Bitte beachten Sie' : 'Bitte beachtet'}, dass ` +
      'dieser Betrag im Falle einer Stornierung nicht zurückerstattet werden kann. ' +
      'Die Anzahlung kann bequem per Banküberweisung geleistet werden:';
    const anzahlungLines = doc.splitTextToSize(anzahlungText, cW) as string[];
    doc.text(anzahlungLines, mL, y);
    y += anzahlungLines.length * 5 + 3;

    const bankRows: Array<[string, string]> = (
      [
        ['Kontoinhaber', bank.account_holder],
        ['IBAN', bank.iban],
        ['BIC/SWIFT', bank.bic],
        ['Bank', bank.bank_name],
      ] as Array<[string, string]>
    ).filter(([, v]) => v);

    doc.setFontSize(10);
    for (const [label, value] of bankRows) {
      doc.setFont('helvetica', 'bold');
      doc.text(label, mL, y);
      doc.setFont('helvetica', 'normal');
      doc.text(value, mL + 43, y);
      y += 6;
    }
    y += 8;
  }

  // ── Contact
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(GREEN);
  doc.text('Kontakt', mL, y);
  y += 5;

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(DARK);
  for (const line of [
    'William Lantelme Filho',
    'riofuerdeutsche.de',
    'riofuerdeutsche@gmail.com',
    'WhatsApp: +55 21 99056-4944',
  ]) {
    doc.text(line, mL, y);
    y += 5;
  }

  // ── Save
  const firstName = proposal.client_name.split(' ')[0];
  const dateStr = proposal.arrival_date
    ? proposal.arrival_date.split('-').reverse().join('')
    : 'undatum';
  doc.save(`Angebot_${firstName}_${dateStr}.pdf`);
}

// ─── Main Component ────────────────────────────────────────────────────────────

/**
 * Lead cujo calendário está apontado para OUTRA proposta (ou para nenhuma).
 * null quando esta proposta é a que manda na agenda, que é o caso normal.
 */
export interface CalendarOwner {
  leadId: string;
  leadName: string;
  activeProposalId: string | null;
}

export default function PropostaOutputClient({
  proposal: initial,
  bank,
  emailLog: initialEmailLog,
  tourDates,
  partnerDays = [],
  calendarOwner,
}: {
  proposal: Proposal;
  bank: DepositBankInfo;
  emailLog: ProposalEmailLogEntry[];
  tourDates: TourDateDeposit[];
  /** Dias que vão com guia parceiro. Só admin: nunca entra no texto do cliente. */
  partnerDays?: { date: string; partner_name: string | null }[];
  calendarOwner?: CalendarOwner | null;
}) {
  const router = useRouter();
  const t = useTranslations('admin.propostas');
  const tCommon = useTranslations('admin.common');
  const tStatus = useTranslations('admin.status.proposal');
  const [status, setStatus] = useState<ProposalStatus>(initial.status);
  const [statusSaving, setStatusSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [calendarSaving, setCalendarSaving] = useState(false);
  const [calendarError, setCalendarError] = useState<string | null>(null);
  // ── Envio por e-mail ──
  // O e-mail é o arquivo permanente do cliente (o WhatsApp some quando a conta
  // cai). Envio sempre explícito; a troca de status só PERGUNTA, nunca dispara.
  const [emailLog, setEmailLog] = useState<ProposalEmailLogEntry[]>(initialEmailLog);
  const [emailSending, setEmailSending] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  // Status pedido no select que ainda espera a decisão do modal.
  const [pendingSentConfirm, setPendingSentConfirm] = useState(false);

  const proposal = useMemo(() => ({ ...initial, status }), [initial, status]);

  const whatsappText = useMemo(() => generateWhatsAppText(initial), [initial]);

  // A tabela de itinerário desta tela é do admin (o cliente vê /angebot e o
  // PDF). Linhas 'day_transport' guardam um identificador sem idioma, então o
  // rótulo é traduzido aqui — aceitando também os literais alemães das
  // propostas gravadas antes dessa mudança.
  const itemLabel = useCallback(
    (item: Proposal['items'][number]): string => {
      if (item.kind !== 'day_transport') return item.service_name;
      const key = resolveDayTransportKey(item.service_name);
      return key ? t(`transporteDia.${key}`) : item.service_name;
    },
    [t],
  );

  const shownItems = useMemo(() => visibleItems(initial.items), [initial.items]);

  const partnerByDay = useMemo(
    () => new Map(partnerDays.map(d => [d.date, d.partner_name ?? ''])),
    [partnerDays]
  );

  const sortedDays = useMemo(
    () => [...new Set(shownItems.map(i => i.day))].sort(),
    [shownItems]
  );

  const grandTotal = useMemo(
    () => initial.items.reduce((sum, i) => sum + i.total_eur, 0),
    [initial.items]
  );

  const grandTotalHours = useMemo(
    () => sortedDays.reduce((sum, day) => {
      // Só atividades: a linha day_transport (horas null) distorceria o
      // compartilhamento do transfer final no calcDayHours.
      const dayItems = shownItems.filter(i => i.day === day && i.kind !== 'day_transport');
      return sum + calcDayHours(dayItems);
    }, 0),
    [shownItems, sortedDays]
  );

  const clientEmail = (initial.client_email ?? '').trim();

  // Último envio que deu certo: decide entre "Enviar" e "Reenviar", e se a
  // troca de status para 'sent' ainda precisa perguntar.
  const lastSentEntry = useMemo(
    () => emailLog.find(e => e.status === 'sent') ?? null,
    [emailLog],
  );
  const sentCount = useMemo(
    () => emailLog.filter(e => e.status === 'sent').length,
    [emailLog],
  );

  const applyStatus = useCallback(async (newStatus: ProposalStatus) => {
    setStatusSaving(true);
    try {
      const res = await fetch(`/api/admin/proposals/${initial.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) setStatus(newStatus);
    } catch {
      // status stays unchanged on network error
    } finally {
      setStatusSaving(false);
      setPendingSentConfirm(false);
    }
  }, [initial.id]);

  // Marcar como "enviada" sem nunca ter mandado o e-mail é justamente o caso em
  // que a proposta se perde depois. A tela pergunta — e nunca dispara sozinha,
  // porque e-mail não tem desfazer.
  const handleStatusChange = (newStatus: ProposalStatus) => {
    if (newStatus === 'sent' && status !== 'sent' && clientEmail && !lastSentEntry) {
      setPendingSentConfirm(true);
      return;
    }
    void applyStatus(newStatus);
  };

  const handleSendEmail = useCallback(async () => {
    setEmailSending(true);
    setEmailError(null);
    try {
      const res = await fetch(`/api/admin/proposals/${initial.id}/send-email`, {
        method: 'POST',
      });
      const body = await res.json().catch(() => ({}));
      // A rota registra tentativa que falhou também; o histórico da tela mostra
      // as duas coisas.
      if (body?.entry) setEmailLog(prev => [body.entry as ProposalEmailLogEntry, ...prev]);
      // O envio marca a proposta como enviada; num erro de envio o status pode
      // ter mudado assim mesmo, e a resposta diz isso.
      if (body?.status === 'sent') setStatus('sent');
      if (!res.ok) setEmailError(body?.error ?? tCommon('erroDesconhecido'));
    } catch {
      setEmailError(tCommon('erroRede'));
    } finally {
      setEmailSending(false);
      setPendingSentConfirm(false);
    }
  }, [initial.id, tCommon]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(whatsappText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(publicProposalUrl(initial));
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  const handleDownloadPDF = async () => {
    setPdfLoading(true);
    try {
      await downloadPDF(proposal, bank);
    } finally {
      setPdfLoading(false);
    }
  };

  // Aponta o calendário do lead para ESTA proposta. Nunca acontece sozinho:
  // trocar a agenda de um cliente é decisão sua, não efeito colateral de
  // duplicar uma proposta.
  const handleUseInCalendar = async () => {
    if (!calendarOwner) return;
    setCalendarSaving(true);
    setCalendarError(null);
    try {
      const res = await fetch(`/api/admin/leads/${calendarOwner.leadId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ proposal_id: initial.id }),
      });
      if (!res.ok) throw new Error('PATCH_FAILED');
      router.refresh();
    } catch {
      setCalendarError(t('calendarioFalhaTrocar'));
    } finally {
      setCalendarSaving(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 md:p-10">
      <div className="max-w-3xl space-y-6">

        {/* ── Aviso: os dias desta proposta não estão no calendário */}
        {calendarOwner && (
          <div className="rounded-xl border border-amber-300 bg-amber-50 p-4">
            <p className="text-sm font-semibold text-amber-900">{t('calendarioOutraTitulo')}</p>
            <p className="text-sm text-amber-800 mt-1">
              {calendarOwner.activeProposalId
                ? t('calendarioOutraTexto', { cliente: calendarOwner.leadName })
                : t('calendarioNenhumaTexto', { cliente: calendarOwner.leadName })}
            </p>
            <div className="flex flex-wrap items-center gap-3 mt-3">
              <button
                onClick={handleUseInCalendar}
                disabled={calendarSaving}
                className="px-3 py-1.5 text-sm font-semibold bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors disabled:opacity-50"
              >
                {calendarSaving ? tCommon('salvando') : t('calendarioUsarEsta')}
              </button>
              {calendarOwner.activeProposalId && (
                <Link
                  href={`/admin/propostas/${calendarOwner.activeProposalId}/output`}
                  className="text-sm font-medium text-amber-800 underline hover:text-amber-900"
                >
                  {t('calendarioVerAtual')}
                </Link>
              )}
              {calendarError && <span className="text-sm text-red-700">{calendarError}</span>}
            </div>
          </div>
        )}

        {/* ── Header */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <Link
              href="/admin/propostas"
              className="text-sm text-gray-400 hover:text-gray-700 transition-colors shrink-0"
            >
              {t('voltarPropostas')}
            </Link>
            <span className="text-gray-200">/</span>
            <h1 className="text-xl font-bold text-gray-900 truncate">
              {t('propostaSingular')} — {initial.client_name}
            </h1>
            {initial.internal_label && (
              <span className="px-1.5 py-0.5 text-[11px] font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded shrink-0">
                {initial.internal_label}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Link
              href={`/admin/propostas/${initial.id}/editar`}
              className="px-4 py-2 text-sm font-semibold bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {tCommon('editar')}
            </Link>
            <button
              onClick={handleDownloadPDF}
              disabled={pdfLoading}
              className="px-4 py-2 text-sm font-semibold bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {pdfLoading ? t('gerandoPdf') : t('baixarPdf')}
            </button>
            <button
              onClick={handleCopy}
              className="px-4 py-2 text-sm font-semibold bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              {copied ? t('copiadoExcl') : t('copiarWhatsapp')}
            </button>
          </div>
        </div>

        {/* ── Card 1: Resumo */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-base font-bold text-gray-900 mb-5">{t('resumoProposta')}</h2>
          <dl className="space-y-3">
            {(
              [
                [t('colCliente'), initial.client_name],
                [tCommon('pax'), `${initial.pax} ${initial.pax !== 1 ? tCommon('pessoas') : tCommon('pessoa')}`],
                [t('tratamento'), initial.treatment === 'Sie' ? t('sieFormal') : t('duInformal')],
                ...(initial.valid_until ? [[t('validaAte'), fmtDate(initial.valid_until)]] : []),
              ] as Array<[string, string]>
            ).map(([label, value]) => (
              <div key={label} className="flex items-center gap-4">
                <dt className="text-sm text-gray-400 w-28 shrink-0">{label}</dt>
                <dd className="text-sm font-medium text-gray-800">{value}</dd>
              </div>
            ))}

            {/* Dias de tour (chegada/partida são derivadas deles) */}
            <div className="flex items-start gap-4">
              <dt className="text-sm text-gray-400 w-28 shrink-0">
                {t('colDiasTour')}
                {sortedDays.length > 0 && (
                  <span className="block text-xs text-gray-300">
                    {sortedDays.length} {sortedDays.length === 1 ? tCommon('dia') : tCommon('dias')}
                  </span>
                )}
              </dt>
              <dd className="flex flex-wrap gap-1.5">
                {sortedDays.length === 0 ? (
                  <span className="text-sm font-medium text-gray-800">{tCommon('vazio')}</span>
                ) : (
                  sortedDays.map(day => {
                    const parceiro = partnerByDay.get(day);
                    return (
                      <span
                        key={day}
                        title={parceiro !== undefined ? t('diaComParceiroDica') : undefined}
                        className={`inline-block px-2 py-0.5 text-xs font-semibold rounded-full tabular-nums ${
                          parceiro !== undefined
                            ? 'bg-slate-100 text-slate-700'
                            : 'bg-green-50 text-green-800'
                        }`}
                      >
                        {abbrGermanDay(day)}
                        {parceiro !== undefined && ` · ${parceiro || t('parceiroADefinirCurto')}`}
                      </span>
                    );
                  })
                )}
              </dd>
            </div>

            {/* Aviso interno: nesses dias quem guia é outra pessoa */}
            {partnerDays.length > 0 && (
              <div className="flex items-start gap-4">
                <dt className="text-sm text-gray-400 w-28 shrink-0" />
                <dd className="text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
                  {t('avisoDiasComParceiro')}
                </dd>
              </div>
            )}

            {/* Status — inline editable */}
            <div className="flex items-center gap-4">
              <dt className="text-sm text-gray-400 w-28 shrink-0">{tCommon('status')}</dt>
              <dd>
                <div className="relative flex items-center gap-2">
                  <span
                    className={`inline-block px-2 py-0.5 text-xs font-semibold rounded-full ${STATUS_CLASSNAME[status]}`}
                  >
                    {tStatus(status)}
                  </span>
                  <select
                    value={status}
                    disabled={statusSaving}
                    onChange={e => handleStatusChange(e.target.value as ProposalStatus)}
                    className="text-xs text-gray-500 border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
                  >
                    <option value="draft">{tStatus('draft')}</option>
                    <option value="sent">{tStatus('sent')}</option>
                    <option value="accepted">{tStatus('accepted')}</option>
                    <option value="rejected">{tStatus('rejected')}</option>
                  </select>
                  {statusSaving && (
                    <span className="text-xs text-gray-400">{tCommon('salvando')}</span>
                  )}
                </div>
              </dd>
            </div>

            {/* Sinal pago — mora em tour_dates, só aparece com data marcada */}
            <div className="flex items-center gap-4">
              <dt className="text-sm text-gray-400 w-28 shrink-0">{t('sinalPagamento')}</dt>
              <dd>
                {tourDates.length > 0 ? (
                  <AnzahlungToggle tourDates={tourDates} />
                ) : (
                  <span className="text-xs text-gray-400">{t('sinalSemData')}</span>
                )}
              </dd>
            </div>

            {/* Link público do cliente */}
            <div className="flex items-center gap-4">
              <dt className="text-sm text-gray-400 w-28 shrink-0">{t('linkCliente')}</dt>
              <dd className="flex items-center gap-2 min-w-0">
                {/* href relativo pra abrir também no dev/túnel; o copiado é o canônico */}
                <a
                  href={`/${initial.locale || 'de'}/p/${initial.public_token}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-green-700 hover:underline truncate"
                >
                  {publicProposalUrl(initial).replace('https://', '')}
                </a>
                <button
                  onClick={handleCopyLink}
                  className="text-xs font-semibold px-2 py-1 rounded-md bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors shrink-0"
                >
                  {linkCopied ? tCommon('copiado') : tCommon('copiar')}
                </button>
              </dd>
            </div>

            {/* E-mail ao cliente — o arquivo permanente da proposta */}
            <div className="flex items-start gap-4">
              <dt className="text-sm text-gray-400 w-28 shrink-0 pt-1">{t('emailCliente')}</dt>
              <dd className="min-w-0 flex-1">
                {clientEmail ? (
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm text-gray-800 truncate">{clientEmail}</span>
                    <button
                      onClick={handleSendEmail}
                      disabled={emailSending}
                      className="text-xs font-semibold px-2 py-1 rounded-md bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors shrink-0 disabled:opacity-50"
                    >
                      {emailSending
                        ? tCommon('enviando')
                        : lastSentEntry
                          ? t('reenviarEmail')
                          : t('enviarEmail')}
                    </button>
                  </div>
                ) : (
                  <span className="text-sm text-amber-700">{t('semEmailCliente')}</span>
                )}

                {lastSentEntry ? (
                  <p className="text-xs text-gray-400 mt-1">
                    {t('emailEnviadoEm', {
                      data: fmtDateTime(lastSentEntry.created_at),
                      count: sentCount,
                    })}
                  </p>
                ) : clientEmail && status === 'sent' ? (
                  <p className="text-xs text-amber-600 mt-1">{t('emailNuncaEnviado')}</p>
                ) : null}

                {emailError && (
                  <p className="text-xs text-red-600 mt-1">
                    {t('erroEnvioEmail', { erro: emailError })}
                  </p>
                )}
              </dd>
            </div>

            {/* Total */}
            <div className="flex items-center gap-4 pt-2 border-t border-gray-100 mt-2">
              <dt className="text-sm text-gray-400 w-28 shrink-0">{tCommon('total')}</dt>
              <dd className="text-lg font-bold text-green-600 tabular-nums">
                {fmtEur(initial.total_amount ?? grandTotal)}
              </dd>
            </div>
          </dl>
        </div>

        {/* ── Card 2: Itinerário */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 pt-6 pb-4">
            <h2 className="text-base font-bold text-gray-900">{t('itinerario')}</h2>
          </div>

          {sortedDays.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">{t('nenhumServicoAdicionado')}</p>
          ) : (
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-gray-50 border-y border-gray-100">
                  <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide px-6 py-2.5">{t('colAtividade')}</th>
                  <th className="text-right text-xs font-semibold text-gray-400 uppercase tracking-wide px-4 py-2.5 whitespace-nowrap">{t('colDuracao')}</th>
                  <th className="text-right text-xs font-semibold text-gray-400 uppercase tracking-wide px-6 py-2.5">{tCommon('valor')}</th>
                </tr>
              </thead>
              {sortedDays.map(day => {
                const dayItems = shownItems.filter(i => i.day === day);
                const dayTotal = dayItems.reduce((sum, i) => sum + i.total_eur, 0);
                const dayHours = calcDayHours(dayItems.filter(i => i.kind !== 'day_transport'));
                return (
                  <tbody key={day}>
                    <tr className="bg-green-50 border-t border-green-100">
                      <td className="px-6 py-2">
                        <span className="text-xs font-bold text-green-700 uppercase tracking-wide">
                          {fullGermanDay(day)}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-right whitespace-nowrap">
                        {dayHours > 0 && (
                          <span className="text-xs font-semibold text-green-600 tabular-nums">{formatDuration(dayHours)}</span>
                        )}
                      </td>
                      <td className="px-6 py-2 text-right whitespace-nowrap">
                        <span className="text-xs font-semibold text-green-600 tabular-nums">{fmtEur(dayTotal)}</span>
                      </td>
                    </tr>
                    {dayItems.map((item, idx) => (
                      <tr key={`${day}-${idx}`} className="border-t border-gray-50 hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-3">
                          <span className="text-gray-800 font-medium">{itemLabel(item)}</span>
                          {item.note && (
                            <span className="block text-xs text-gray-400 mt-0.5">{item.note}</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right whitespace-nowrap">
                          {item.duration_hours ? (
                            <span className="text-gray-500 tabular-nums">{formatDuration(item.duration_hours)}</span>
                          ) : (
                            <span className="text-gray-300">{tCommon('vazio')}</span>
                          )}
                        </td>
                        <td className="px-6 py-3 text-right whitespace-nowrap">
                          <span className="text-gray-700 font-medium tabular-nums">{fmtEur(item.total_eur)}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                );
              })}
              <tfoot>
                {/* Com preço final manual, o admin vê o subtotal calculado e o
                    ajuste — inclusive quando o desconto é invisível pro cliente. */}
                {initial.total_override_amount != null && (() => {
                  const subtotal = initial.items.reduce((sum, i) => sum + i.total_eur, 0);
                  const diff = subtotal - (initial.total_amount ?? subtotal);
                  return (
                    <>
                      <tr className="border-t-2 border-gray-200 bg-gray-50">
                        <td className="px-6 pt-3 pb-1 text-xs text-gray-500" colSpan={2}>
                          {t('subtotalCalculado')}
                        </td>
                        <td className="px-6 pt-3 pb-1 text-right text-xs text-gray-500 tabular-nums">
                          {fmtEur(subtotal)}
                        </td>
                      </tr>
                      <tr className="bg-gray-50">
                        <td className="px-6 py-1 text-xs" colSpan={2}>
                          <span className={diff >= 0 ? 'text-green-700' : 'text-amber-600'}>
                            {diff >= 0 ? t('descontoLabel') : t('acrescimoLabel')}
                          </span>
                          <span className="ml-2 text-gray-400">
                            {initial.discount_visible ? t('rabattVisivelBadge') : t('rabattInvisivelBadge')}
                          </span>
                        </td>
                        <td className={`px-6 py-1 text-right text-xs tabular-nums ${diff >= 0 ? 'text-green-700' : 'text-amber-600'}`}>
                          {diff >= 0 ? '−' : '+'}{fmtEur(Math.abs(diff))}
                        </td>
                      </tr>
                    </>
                  );
                })()}
                <tr className={`bg-gray-50 ${initial.total_override_amount != null ? '' : 'border-t-2 border-gray-200'}`}>
                  <td className="px-6 py-4">
                    <span className="text-sm font-semibold text-gray-600">{t('valorTotal')}</span>
                    <span className="ml-3 text-xs text-gray-400 tabular-nums">
                      {sortedDays.length} {sortedDays.length === 1 ? tCommon('dia') : tCommon('dias')}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-right whitespace-nowrap">
                    {grandTotalHours > 0 && (
                      <span className="text-sm font-semibold text-gray-500 tabular-nums">{formatDuration(grandTotalHours)}</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-xl font-bold text-green-600 tabular-nums">
                      {fmtEur(initial.total_amount ?? grandTotal)}
                    </span>
                  </td>
                </tr>
              </tfoot>
            </table>
          )}
        </div>

        {/* ── Card 3: Texto WhatsApp */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-gray-900">{t('textoWhatsapp')}</h2>
            <button
              onClick={handleCopy}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                copied
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {copied ? t('copiadoExcl') : tCommon('copiar')}
            </button>
          </div>
          <textarea
            readOnly
            value={whatsappText}
            rows={20}
            className="w-full text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded-xl p-4 resize-none focus:outline-none font-mono leading-relaxed"
          />
        </div>

      </div>

      {/* Confirmação ao marcar como enviada: o e-mail nunca sai sozinho, mas
          também não deixa a proposta virar "enviada" sem ninguém perguntar. */}
      {pendingSentConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-base font-bold text-gray-900">{t('confirmarEnvioTitulo')}</h3>
            <p className="text-sm text-gray-600 mt-2">
              {t('confirmarEnvioTexto', { email: clientEmail })}
            </p>
            <div className="flex flex-wrap justify-end gap-2 mt-6">
              <button
                onClick={() => setPendingSentConfirm(false)}
                disabled={emailSending || statusSaving}
                className="px-3 py-2 text-sm font-semibold text-gray-500 hover:text-gray-700 disabled:opacity-50"
              >
                {tCommon('cancelar')}
              </button>
              <button
                onClick={() => applyStatus('sent')}
                disabled={emailSending || statusSaving}
                className="px-3 py-2 text-sm font-semibold bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                {t('confirmarEnvioSoMarcar')}
              </button>
              <button
                onClick={handleSendEmail}
                disabled={emailSending || statusSaving}
                className="px-3 py-2 text-sm font-semibold bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {emailSending ? tCommon('enviando') : t('confirmarEnvioEnviar')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

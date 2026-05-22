'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import type { Proposal, ProposalStatus } from '@/lib/proposals';

// ─── Format helpers ────────────────────────────────────────────────────────────

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

const STATUS_CONFIG: Record<ProposalStatus, { label: string; className: string }> = {
  draft: { label: 'Rascunho', className: 'bg-gray-100 text-gray-600' },
  sent: { label: 'Enviada', className: 'bg-blue-100 text-blue-700' },
  accepted: { label: 'Aceita', className: 'bg-green-100 text-green-700' },
  rejected: { label: 'Recusada', className: 'bg-red-100 text-red-700' },
};

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

  const sortedDays = [...new Set(proposal.items.map(i => i.day))].sort();
  for (const day of sortedDays) {
    const dayItems = proposal.items.filter(i => i.day === day);
    lines.push('');
    lines.push(fullGermanDay(day));
    for (const item of dayItems) {
      const dur = item.duration_hours ? ` (${item.duration_hours} Std.)` : '';
      lines.push(`• ${item.service_name}${dur} — ${formatEur(item.total_eur)}`);
    }
  }

  lines.push('');
  lines.push(`💰 Gesamtpreis: ${formatEur(proposal.total_amount ?? 0)}`);
  lines.push('');
  lines.push('ℹ️ Speisen, Getränke und Eintrittsgelder sind nicht im Preis inbegriffen.');
  lines.push('💳 Zahlung erfolgt in bar in Euro am Ende der Tour.');
  lines.push('');
  lines.push(`Das vollständige Angebot als PDF sende ich ${isSie ? 'Ihnen' : 'euch'} im Anhang.`);
  lines.push('');
  lines.push('Bis bald in Rio! 🌴');
  lines.push('Will');
  lines.push('riofuerdeutsche.de');

  return lines.join('\n');
}

// ─── PDF generator ─────────────────────────────────────────────────────────────

async function downloadPDF(proposal: Proposal): Promise<void> {
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
  doc.text('Reiseangebot', mL, y);
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
  const COL = { date: mL, prog: mL + 28, dur: mL + 110, priceR: pageW - mR };

  doc.setFillColor(GREEN_BG);
  doc.rect(mL, y, cW, 8, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(GREEN);
  doc.text('Datum', COL.date + 2, y + 5.5);
  doc.text('Programm', COL.prog + 2, y + 5.5);
  doc.text('Dauer', COL.dur + 2, y + 5.5);
  doc.text('Preis', COL.priceR - 2, y + 5.5, { align: 'right' });
  y += 8;

  const sortedDays = [...new Set(proposal.items.map(i => i.day))].sort();

  for (const day of sortedDays) {
    const dayItems = proposal.items.filter(i => i.day === day);
    const abbr = abbrGermanDay(day);

    for (let idx = 0; idx < dayItems.length; idx++) {
      const item = dayItems[idx];

      if (y > 260) {
        doc.addPage();
        y = 20;
      }

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(DARK);

      if (idx === 0) doc.text(abbr, COL.date + 2, y + 5);

      const nameLines = doc.splitTextToSize(item.service_name, 75);
      doc.text(nameLines[0] as string, COL.prog + 2, y + 5);

      doc.text(item.duration_hours ? `${item.duration_hours} Std.` : '—', COL.dur + 2, y + 5);
      doc.text(formatEur(item.total_eur), COL.priceR - 2, y + 5, { align: 'right' });

      doc.setDrawColor(SEPARATOR);
      doc.setLineWidth(0.2);
      doc.line(mL, y + 7, pageW - mR, y + 7);
      y += 7;
    }
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
  y += 16;

  // ── Footer notes
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(GRAY);
  const footerNotes = [
    '• Speisen, Getränke und Eintrittsgelder sind nicht im Preis inbegriffen.',
    '• Zahlung erfolgt in bar in Euro am Ende der Tour.',
    '• Privatfahrzeug mit Fahrer für alle Transfers inklusive.',
  ];
  for (const note of footerNotes) {
    doc.text(note, mL, y);
    y += 5;
  }
  y += 8;

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
    'lantelmew@gmail.com',
    'WhatsApp: +55 21 99999-9999',
  ]) {
    doc.text(line, mL, y);
    y += 5;
  }

  // ── Save
  const firstName = proposal.client_name.split(' ')[0];
  const dateStr = proposal.arrival_date
    ? proposal.arrival_date.split('-').reverse().join('')
    : 'undatum';
  doc.save(`Reiseangebot_${firstName}_${dateStr}.pdf`);
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function PropostaOutputClient({ proposal: initial }: { proposal: Proposal }) {
  const [status, setStatus] = useState<ProposalStatus>(initial.status);
  const [statusSaving, setStatusSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);

  const proposal = useMemo(() => ({ ...initial, status }), [initial, status]);

  const whatsappText = useMemo(() => generateWhatsAppText(initial), [initial]);

  const sortedDays = useMemo(
    () => [...new Set(initial.items.map(i => i.day))].sort(),
    [initial.items]
  );

  const grandTotal = useMemo(
    () => initial.items.reduce((sum, i) => sum + i.total_eur, 0),
    [initial.items]
  );

  const handleStatusChange = async (newStatus: ProposalStatus) => {
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
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(whatsappText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPDF = async () => {
    setPdfLoading(true);
    try {
      await downloadPDF(proposal);
    } finally {
      setPdfLoading(false);
    }
  };

  return (
    <div className="p-6 md:p-10">
      <div className="max-w-3xl space-y-6">

        {/* ── Header */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <Link
              href="/admin/propostas"
              className="text-sm text-gray-400 hover:text-gray-700 transition-colors shrink-0"
            >
              ← Propostas
            </Link>
            <span className="text-gray-200">/</span>
            <h1 className="text-xl font-bold text-gray-900 truncate">
              Proposta — {initial.client_name}
            </h1>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleDownloadPDF}
              disabled={pdfLoading}
              className="px-4 py-2 text-sm font-semibold bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {pdfLoading ? 'Generiere…' : '⬇ Baixar PDF'}
            </button>
            <button
              onClick={handleCopy}
              className="px-4 py-2 text-sm font-semibold bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              {copied ? '✓ Copiado!' : '📋 Copiar WhatsApp'}
            </button>
          </div>
        </div>

        {/* ── Card 1: Resumo */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-base font-bold text-gray-900 mb-5">Resumo da Proposta</h2>
          <dl className="space-y-3">
            {(
              [
                ['Cliente', initial.client_name],
                ['PAX', `${initial.pax} pessoa${initial.pax !== 1 ? 's' : ''}`],
                ['Chegada', formatDate(initial.arrival_date)],
                ['Partida', formatDate(initial.departure_date)],
                ['Tratamento', initial.treatment === 'Sie' ? 'Sie (formal)' : 'du/ihr (informal)'],
              ] as Array<[string, string]>
            ).map(([label, value]) => (
              <div key={label} className="flex items-center gap-4">
                <dt className="text-sm text-gray-400 w-28 shrink-0">{label}</dt>
                <dd className="text-sm font-medium text-gray-800">{value}</dd>
              </div>
            ))}

            {/* Status — inline editable */}
            <div className="flex items-center gap-4">
              <dt className="text-sm text-gray-400 w-28 shrink-0">Status</dt>
              <dd>
                <div className="relative flex items-center gap-2">
                  <span
                    className={`inline-block px-2 py-0.5 text-xs font-semibold rounded-full ${STATUS_CONFIG[status].className}`}
                  >
                    {STATUS_CONFIG[status].label}
                  </span>
                  <select
                    value={status}
                    disabled={statusSaving}
                    onChange={e => handleStatusChange(e.target.value as ProposalStatus)}
                    className="text-xs text-gray-500 border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
                  >
                    <option value="draft">Rascunho</option>
                    <option value="sent">Enviada</option>
                    <option value="accepted">Aceita</option>
                    <option value="rejected">Recusada</option>
                  </select>
                  {statusSaving && (
                    <span className="text-xs text-gray-400">Salvando…</span>
                  )}
                </div>
              </dd>
            </div>

            {/* Total */}
            <div className="flex items-center gap-4 pt-2 border-t border-gray-100 mt-2">
              <dt className="text-sm text-gray-400 w-28 shrink-0">Total</dt>
              <dd className="text-lg font-bold text-green-600 tabular-nums">
                {formatEur(initial.total_amount ?? grandTotal)}
              </dd>
            </div>
          </dl>
        </div>

        {/* ── Card 2: Itinerário */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-base font-bold text-gray-900 mb-5">Itinerário</h2>

          {sortedDays.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">Nenhuma leistung adicionada.</p>
          ) : (
            <div className="space-y-5">
              {sortedDays.map(day => {
                const dayItems = initial.items.filter(i => i.day === day);
                const dayTotal = dayItems.reduce((sum, i) => sum + i.total_eur, 0);
                return (
                  <div key={day}>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-semibold text-gray-700">{fullGermanDay(day)}</p>
                      <p className="text-xs text-gray-400 tabular-nums">{formatEur(dayTotal)}</p>
                    </div>
                    <div className="space-y-1 pl-3 border-l-2 border-green-100">
                      {dayItems.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between text-sm">
                          <div className="text-gray-700">
                            {item.service_name}
                            {item.duration_hours && (
                              <span className="text-gray-400 ml-1">({item.duration_hours} Std.)</span>
                            )}
                            {item.note && (
                              <span className="text-gray-400 ml-1 text-xs">— {item.note}</span>
                            )}
                          </div>
                          <span className="tabular-nums text-gray-600 ml-4 shrink-0">
                            {formatEur(item.total_eur)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}

              <div className="flex items-center justify-between pt-4 border-t-2 border-gray-200">
                <span className="text-sm font-semibold text-gray-600">Gesamtbetrag</span>
                <span className="text-xl font-bold text-green-600 tabular-nums">
                  {formatEur(initial.total_amount ?? grandTotal)}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* ── Card 3: Texto WhatsApp */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-gray-900">Texto WhatsApp</h2>
            <button
              onClick={handleCopy}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                copied
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {copied ? '✓ Copiado!' : 'Copiar'}
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
    </div>
  );
}

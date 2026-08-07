import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { adminWhatsAppNumbers, sendWhatsAppText } from '@/lib/uazapi';
import { DEFAULT_EMAIL_LOCALE as EMAIL_LOCALE } from '@/lib/email/render';

const VALID_SOURCES = ['whatsapp', 'email', 'instagram'] as const;

function isIsoDate(s: unknown): s is string {
  return (
    typeof s === 'string' &&
    /^\d{4}-\d{2}-\d{2}$/.test(s) &&
    !isNaN(new Date(s + 'T12:00:00').getTime())
  );
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// Notificação interna pro Will, mas os dias vão em alemão: é o que o cliente
// selecionou no formulário. Formato longo (weekday + mês por extenso) não é
// coberto por format.ts, então o Intl fica aqui com o locale dos e-mails.
function formatGermanDay(iso: string): string {
  return new Intl.DateTimeFormat(EMAIL_LOCALE, {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(iso + 'T12:00:00Z'));
}

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Ungültige Anfrage.' }, { status: 400 });
  }

  // Honeypot: answer success so bots don't adapt
  if (body.website) {
    return NextResponse.json({ ok: true });
  }

  const name = typeof body.name === 'string' ? body.name.trim().slice(0, 200) : '';
  const email = typeof body.email === 'string' ? body.email.trim().slice(0, 200) : '';
  const phone = typeof body.phone === 'string' ? body.phone.trim().slice(0, 50) : '';
  const pax = Number(body.pax);
  const children = body.children === undefined ? 0 : Number(body.children);
  const rawDays = Array.isArray(body.days) ? body.days : [];
  const source = VALID_SOURCES.includes(body.source as typeof VALID_SOURCES[number])
    ? (body.source as string)
    : 'other';

  if (!name) {
    return NextResponse.json({ error: 'Bitte gib deinen Namen an.' }, { status: 400 });
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Bitte gib eine gültige E-Mail-Adresse an.' }, { status: 400 });
  }
  if (!Number.isInteger(pax) || pax < 1 || pax > 99) {
    return NextResponse.json({ error: 'Bitte gib die Anzahl der Erwachsenen an.' }, { status: 400 });
  }
  if (!Number.isInteger(children) || children < 0 || children > 99) {
    return NextResponse.json({ error: 'Bitte gib eine gültige Anzahl an Kindern an.' }, { status: 400 });
  }
  const days = [...new Set(rawDays.filter(isIsoDate))].sort();
  if (days.length === 0 || days.length > 30) {
    return NextResponse.json({ error: 'Bitte wähle mindestens einen Wunschtag aus.' }, { status: 400 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  const { data: contact, error: contactError } = await supabase
    .from('contacts')
    .upsert(
      { email, name, phone: phone || null, source },
      { onConflict: 'email' },
    )
    .select('id')
    .single();

  if (contactError) {
    return NextResponse.json({ error: 'Etwas ist schiefgelaufen. Bitte versuche es später erneut.' }, { status: 500 });
  }

  const { data: lead, error: leadError } = await supabase
    .from('price_leads')
    .insert({
      name,
      email,
      phone: phone || null,
      pax,
      children,
      days: days.length,
      requested_days: days,
      source,
      status: 'new',
      contact_id: contact.id,
    })
    .select('id')
    .single();

  if (leadError) {
    return NextResponse.json({ error: 'Etwas ist schiefgelaufen. Bitte versuche es später erneut.' }, { status: 500 });
  }

  // Best-effort admin notification; the lead is saved either way.
  try {
    const { data: settings } = await supabase
      .from('site_settings')
      .select('business_email')
      .limit(1)
      .single();
    const to = settings?.business_email || 'will@riofuerdeutsche.de';

    const daysHtml = days.map(d => `<li>${formatGermanDay(d)}</li>`).join('');
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: 'Rio für Deutsche <will@riofuerdeutsche.de>',
      to,
      subject: `🔔 Nova solicitação de tour: ${name} (${pax} pax${children > 0 ? ` + ${children} criança${children !== 1 ? 's' : ''}` : ''}, ${days.length} dia${days.length !== 1 ? 's' : ''})`,
      html: `
        <h2>Nova solicitação pelo formulário Anfrage</h2>
        <p>
          <strong>Nome:</strong> ${escapeHtml(name)}<br/>
          <strong>E-Mail:</strong> ${escapeHtml(email)}<br/>
          <strong>Telefone:</strong> ${escapeHtml(phone) || '—'}<br/>
          <strong>Adultos:</strong> ${pax}<br/>
          <strong>Crianças:</strong> ${children}<br/>
          <strong>Origem:</strong> ${source}
        </p>
        <p><strong>Dias desejados:</strong></p>
        <ul>${daysHtml}</ul>
        <p>
          <a href="https://riofuerdeutsche.de/admin/propostas/nova?lead_id=${lead.id}">Criar proposta agora</a> ·
          <a href="https://riofuerdeutsche.de/admin/crm">Abrir CRM</a>
        </p>
      `,
    });
  } catch {
    // notification failure must not break the client flow
  }

  // Best-effort WhatsApp notification via uazapi, independent of the email above.
  try {
    const daysList = days.map(d => `• ${formatGermanDay(d)}`).join('\n');
    const text =
      `🔔 *Nova Anfrage: ${name}*\n\n` +
      `👥 ${pax} adulto(s)${children > 0 ? ` + ${children} criança(s)` : ''}\n` +
      `📧 ${email}\n` +
      `📱 ${phone || '—'}\n` +
      `🏷️ Origem: ${source}\n\n` +
      `📅 Dias desejados:\n${daysList}\n\n` +
      `👉 https://riofuerdeutsche.de/admin/propostas/nova?lead_id=${lead.id}`;
    await Promise.allSettled(
      adminWhatsAppNumbers().map(n => sendWhatsAppText(n, text)),
    );
  } catch {
    // notification failure must not break the client flow
  }

  return NextResponse.json({ ok: true });
}

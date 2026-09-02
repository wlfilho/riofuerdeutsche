import { Resend } from 'resend';
import { getSettings } from '@/lib/settings';
import { formatEmailDate } from './render';
import type { TourDateStatus } from '@/lib/tourDates';

/**
 * Alerta interno (não é e-mail de cliente) pra quando dois leads diferentes
 * caem no mesmo dia de tour: um guia só cobre um pack por dia, então isso
 * exige separar guias — e o admin precisa saber na hora, não só se abrir o
 * calendário. Por isso dispara direto pelo Resend (mesmo padrão de
 * api/anfrage/route.ts), sem passar pelo sistema de templates, que é pra
 * e-mail multilíngue de cliente.
 *
 * Dia já entregue a um parceiro não dispara nada: a decisão já foi tomada e
 * aquele dia não consome mais a agenda do Will. Ele só aparece listado como
 * contexto quando o e-mail sai por outro motivo.
 */

const STATUS_LABEL_PT: Record<TourDateStatus, string> = {
  fechado: 'FECHADO',
  proposta_enviada: 'PROPOSTA ENVIADA',
  rascunho: 'RASCUNHO',
};

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export interface ConflictTourSummary {
  lead_name: string;
  tour_name: string | null;
  status: TourDateStatus;
  // Dia já entregue a um guia parceiro: entra no e-mail como contexto, mas
  // não é o que dispara o alerta (quem decide isso é o chamador).
  with_partner?: boolean;
  partner_name?: string | null;
}

export interface ConflictDateGroup {
  date: string; // YYYY-MM-DD
  tours: ConflictTourSummary[];
}

/**
 * Best-effort: falha de envio não pode derrubar a criação/edição da data de
 * tour que originou o alerta. Sem business_email configurado, não há pra quem
 * mandar — sai calado, igual ao resto do app (nunca cai num destinatário
 * hardcoded).
 */
export async function sendDateConflictAlert(groups: ConflictDateGroup[]): Promise<void> {
  if (groups.length === 0) return;

  try {
    const settings = await getSettings();
    const to = settings.business_email;
    if (!to) return;

    const multiple = groups.length > 1;
    const subject = multiple
      ? `⚠️ Conflito de agenda: ${groups.length} dias com clientes diferentes`
      : `⚠️ Conflito de agenda: ${formatEmailDate(groups[0].date, 'pt-BR')} tem clientes diferentes`;

    const sectionsHtml = groups
      .map(group => {
        const rows = group.tours
          .map(
            t => {
              const parceiro = t.with_partner
                ? ` <em>— com parceiro${t.partner_name ? `: ${escapeHtml(t.partner_name)}` : ' (a definir)'}</em>`
                : '';
              return `<li>${escapeHtml(t.lead_name)}${t.tour_name ? ` — ${escapeHtml(t.tour_name)}` : ''} <em>(${STATUS_LABEL_PT[t.status]})</em>${parceiro}</li>`;
            },
          )
          .join('');
        return `
          <p style="margin:16px 0 4px"><strong>${formatEmailDate(group.date, 'pt-BR')}</strong> — ${group.tours.length} tours de clientes diferentes:</p>
          <ul style="margin:0 0 8px">${rows}</ul>
        `;
      })
      .join('');

    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: 'Rio für Deutsche <will@riofuerdeutsche.de>',
      to,
      subject,
      html: `
        <h2>Conflito de agenda no calendário de tours</h2>
        <p>Mais de um cliente quer tour no mesmo dia. Vale separar guias ou reagendar com um deles.</p>
        ${sectionsHtml}
        <p><a href="https://riofuerdeutsche.de/admin/calendario">Abrir calendário</a></p>
      `,
    });
  } catch (err) {
    console.error('[sendDateConflictAlert]', err);
  }
}

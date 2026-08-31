import { createClient } from '@/utils/supabase/server';

/**
 * Leitura dos analytics da página pública da proposta (proposal_events).
 *
 * Tudo aqui roda em Server Component do admin com o client de sessão: as views
 * proposal_analytics_summary / proposal_event_sessions são security_invoker e
 * herdam o RLS admin-only da tabela. A escrita fica na API pública
 * (/api/proposal-events), nunca aqui.
 */

export interface ProposalAnalyticsSummary {
  proposal_id: string;
  sessions: number;
  unique_visitors: number;
  first_view_at: string | null;
  last_view_at: string | null;
  total_active_seconds: number;
  max_scroll_pct: number;
  saw_price: boolean;
  saw_bank: boolean;
  contact_clicks: number;
  share_clicks: number;
  bank_copy_clicks: number;
}

export interface ProposalSessionStat {
  session_id: string;
  visitor_id: string;
  started_at: string;
  last_seen_at: string;
  locale: string | null;
  user_agent: string | null;
  referrer: string | null;
  country: string | null;
  city: string | null;
  tz: string | null;
  active_seconds: number;
  scroll_pct: number;
  saw_price: boolean;
  saw_bank: boolean;
  contact_clicks: number;
  share_clicks: number;
  bank_copy_clicks: number;
  // Derivados dos eventos crus da sessão:
  sections: string[];
  click_targets: string[];
}

// PostgREST serializa numeric/bigint de views como number, mas coagir aqui
// blinda contra strings em edge cases de agregação.
function n(v: unknown): number {
  return Number(v ?? 0);
}

export async function getProposalAnalyticsSummaries(
  proposalIds?: string[],
): Promise<Record<string, ProposalAnalyticsSummary>> {
  if (proposalIds && proposalIds.length === 0) return {};
  const supabase = await createClient();
  const query = supabase.from('proposal_analytics_summary').select('*');
  const { data, error } = await (proposalIds ? query.in('proposal_id', proposalIds) : query);
  if (error) throw new Error(error.message);

  const out: Record<string, ProposalAnalyticsSummary> = {};
  for (const row of data ?? []) {
    out[row.proposal_id] = {
      proposal_id: row.proposal_id,
      sessions: n(row.sessions),
      unique_visitors: n(row.unique_visitors),
      first_view_at: row.first_view_at,
      last_view_at: row.last_view_at,
      total_active_seconds: n(row.total_active_seconds),
      max_scroll_pct: n(row.max_scroll_pct),
      saw_price: !!row.saw_price,
      saw_bank: !!row.saw_bank,
      contact_clicks: n(row.contact_clicks),
      share_clicks: n(row.share_clicks),
      bank_copy_clicks: n(row.bank_copy_clicks),
    };
  }
  return out;
}

export async function getProposalSessionStats(proposalId: string): Promise<ProposalSessionStat[]> {
  const supabase = await createClient();
  const [{ data: sessions, error }, { data: rawEvents, error: eventsError }] = await Promise.all([
    supabase
      .from('proposal_event_sessions')
      .select('*')
      .eq('proposal_id', proposalId)
      .order('started_at', { ascending: false }),
    supabase
      .from('proposal_events')
      .select('session_id, event_type, metadata, created_at')
      .eq('proposal_id', proposalId)
      .in('event_type', ['section', 'click'])
      .order('created_at', { ascending: true }),
  ]);
  if (error) throw new Error(error.message);
  if (eventsError) throw new Error(eventsError.message);

  const sectionsBySession = new Map<string, string[]>();
  const clicksBySession = new Map<string, string[]>();
  for (const ev of rawEvents ?? []) {
    const meta = (ev.metadata ?? {}) as Record<string, unknown>;
    if (ev.event_type === 'section' && typeof meta.section === 'string') {
      const list = sectionsBySession.get(ev.session_id) ?? [];
      list.push(meta.section);
      sectionsBySession.set(ev.session_id, list);
    } else if (ev.event_type === 'click' && typeof meta.target === 'string') {
      const list = clicksBySession.get(ev.session_id) ?? [];
      list.push(meta.target);
      clicksBySession.set(ev.session_id, list);
    }
  }

  return (sessions ?? []).map(row => ({
    session_id: row.session_id,
    visitor_id: row.visitor_id,
    started_at: row.started_at,
    last_seen_at: row.last_seen_at,
    locale: row.locale,
    user_agent: row.user_agent,
    referrer: row.referrer,
    country: row.country,
    city: row.city,
    tz: row.tz,
    active_seconds: n(row.active_seconds),
    scroll_pct: n(row.scroll_pct),
    saw_price: !!row.saw_price,
    saw_bank: !!row.saw_bank,
    contact_clicks: n(row.contact_clicks),
    share_clicks: n(row.share_clicks),
    bank_copy_clicks: n(row.bank_copy_clicks),
    sections: sectionsBySession.get(row.session_id) ?? [],
    click_targets: clicksBySession.get(row.session_id) ?? [],
  }));
}

/** Rótulo curto de aparelho a partir do user-agent: "📱 iPhone · Safari" etc. */
export function describeDevice(ua: string | null): string {
  if (!ua) return '—';
  const isTablet = /iPad|Tablet/i.test(ua);
  const isMobile = !isTablet && /Mobi|iPhone|Android/i.test(ua);
  const os = /iPhone|iPad|iOS/i.test(ua) ? 'iOS'
    : /Android/i.test(ua) ? 'Android'
    : /Windows/i.test(ua) ? 'Windows'
    : /Mac OS/i.test(ua) ? 'macOS'
    : /Linux/i.test(ua) ? 'Linux'
    : null;
  const browser = /Instagram|FBAV|FBAN/i.test(ua) ? 'in-app'
    : /WhatsApp/i.test(ua) ? 'WhatsApp'
    : /Edg\//.test(ua) ? 'Edge'
    : /SamsungBrowser/i.test(ua) ? 'Samsung'
    : /Firefox\//.test(ua) ? 'Firefox'
    : /Chrome\/|CriOS/.test(ua) ? 'Chrome'
    : /Safari\//.test(ua) ? 'Safari'
    : null;
  const icon = isTablet ? '💻' : isMobile ? '📱' : '🖥';
  return [icon, [os, browser].filter(Boolean).join(' · ')].filter(Boolean).join(' ');
}

/** Bandeira do código ISO-2 ("DE" → 🇩🇪) via indicadores regionais. */
function flagEmoji(country: string): string {
  if (!/^[A-Za-z]{2}$/.test(country)) return '';
  return String.fromCodePoint(
    ...[...country.toUpperCase()].map(c => 0x1f1e6 + c.charCodeAt(0) - 65),
  );
}

/** Nome do país em pt-BR ("DE" → "Alemanha"); cai no próprio código se falhar. */
function countryName(country: string): string {
  try {
    return new Intl.DisplayNames(['pt-BR'], { type: 'region' }).of(country) ?? country;
  } catch {
    return country;
  }
}

export interface SessionOrigin {
  /** Rótulo curto da célula: "🇩🇪 Berlin". */
  label: string;
  /** Detalhe pro title: país por extenso + fuso do navegador. */
  detail: string;
  /**
   * Origem deduzida do fuso, não do IP — sessões anteriores ao país do IP e o
   * dev local. Sinal mais fraco (o fuso viaja junto com o aparelho), então a UI
   * mostra apagado.
   */
  fromTz: boolean;
  /**
   * País do IP diferente do país que o fuso do navegador sugere. Não é fraude:
   * o caso típico é o cliente alemão que já desembarcou no Rio. Mas é
   * exatamente o cruzamento que mostra se a leitura veio de quem se espera.
   */
  tzMismatch: boolean;
}

// Fuso → país esperado. Só os que aparecem na prática: alemão em casa, alemão
// no Brasil, e os vizinhos de fuso que a Vercel devolve pra mesma região.
const TZ_COUNTRY: Record<string, string> = {
  'Europe/Berlin': 'DE',
  'Europe/Vienna': 'AT',
  'Europe/Zurich': 'CH',
  'Europe/Lisbon': 'PT',
  'America/Sao_Paulo': 'BR',
  'America/Bahia': 'BR',
  'America/Fortaleza': 'BR',
  'America/Recife': 'BR',
  'America/Manaus': 'BR',
};

/** Origem da sessão pro admin: bandeira + cidade, com o cruzamento IP × fuso. */
export function describeOrigin(
  country: string | null,
  city: string | null,
  tz: string | null,
): SessionOrigin | null {
  if (!country && !city) {
    // Sem IP sobra o fuso: "Sao Paulo" com a bandeira do país que ele sugere.
    if (!tz) return null;
    const guess = TZ_COUNTRY[tz];
    const place = tz.split('/').pop()?.replace(/_/g, ' ') ?? tz;
    return {
      label: [guess ? flagEmoji(guess) : '', place].filter(Boolean).join(' '),
      detail: `Sem país do IP (abertura anterior ao registro) · fuso ${tz}`,
      fromTz: true,
      tzMismatch: false,
    };
  }

  const flag = country ? flagEmoji(country) : '';
  const name = country ? countryName(country) : '';
  const label = [flag, city ?? name].filter(Boolean).join(' ') || '—';
  const expected = tz ? TZ_COUNTRY[tz] : undefined;

  return {
    label,
    detail: [city ? name : null, tz ? `fuso ${tz}` : null].filter(Boolean).join(' · '),
    fromTz: false,
    tzMismatch: !!country && !!expected && expected !== country,
  };
}


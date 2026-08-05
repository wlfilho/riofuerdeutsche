'use client';

import { useEffect } from 'react';

/**
 * Telemetria da página pública da proposta. Invisível pro cliente; tudo que
 * ele faz vira eventos em POST /api/proposal-events:
 *
 *   open    — a página abriu (1× por sessão)
 *   ping    — a cada ~20s COM A ABA VISÍVEL, acumulados de leitura ativa
 *             {active_seconds, scroll_pct}; o último vai via sendBeacon no
 *             pagehide, então a sessão fecha com os números finais
 *   section — primeira vez que cada [data-track-section] entrou na viewport
 *   click   — clique em qualquer [data-track-click] (CTAs, share, copiar IBAN)
 *
 * Identidade: visitor_id persistido em localStorage (mesmo aparelho em visitas
 * repetidas — visitantes distintos ≈ link compartilhado) e session_id por
 * carregamento de página.
 *
 * Não rastreia: admin logado (a API responde disabled:true no open) e
 * navegação vinda do próprio /admin (referrer da mesma origem).
 */

const PING_INTERVAL_MS = 20_000;
const MAX_TRACKED_SECONDS = 30 * 60; // depois disso a leitura já está medida

function uuid(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return `${Date.now().toString(16)}-${Math.random().toString(16).slice(2, 10)}`;
}

function getVisitorId(): string {
  try {
    const existing = localStorage.getItem('rfd_visitor_id');
    if (existing) return existing;
    const fresh = uuid();
    localStorage.setItem('rfd_visitor_id', fresh);
    return fresh;
  } catch {
    return uuid(); // storage bloqueado: vira visitante novo a cada visita
  }
}

export default function ProposalTracker({ token, locale }: { token: string; locale: string }) {
  useEffect(() => {
    // Will abrindo o link a partir do admin: não conta como visualização.
    if (document.referrer.includes(`${location.origin}/admin`)) return;

    let disabled = false;
    // A resposta do 'open' decide se a sessão é de admin (disabled). Até ela
    // chegar, nada é enviado: eventos disparados no carregamento (seções já
    // visíveis) esperam na fila — senão sessão de admin vazaria eventos soltos.
    let ready = false;
    const queue: Array<[string, Record<string, unknown>]> = [];
    const sessionId = uuid();
    const visitorId = getVisitorId();

    const send = (
      eventType: 'open' | 'ping' | 'section' | 'click',
      metadata: Record<string, unknown>,
      useBeacon = false,
    ) => {
      if (disabled) return;
      if (!ready && eventType !== 'open') {
        // Página fechada antes da resposta do open (visita sub-segundo): a
        // fila morre sem flush, de propósito — não há leitura pra medir.
        queue.push([eventType, metadata]);
        return;
      }
      const payload = JSON.stringify({
        token,
        event_type: eventType,
        session_id: sessionId,
        visitor_id: visitorId,
        locale,
        referrer: eventType === 'open' ? document.referrer || null : null,
        metadata,
      });
      if (useBeacon && navigator.sendBeacon) {
        navigator.sendBeacon('/api/proposal-events', new Blob([payload], { type: 'application/json' }));
        return;
      }
      fetch('/api/proposal-events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload,
        keepalive: true,
      }).catch(() => {});
    };

    // ── Tempo ativo de leitura: só conta com a aba visível ──
    let accumulatedMs = 0;
    let visibleSince: number | null = document.visibilityState === 'visible' ? Date.now() : null;
    const activeSeconds = () =>
      Math.round((accumulatedMs + (visibleSince !== null ? Date.now() - visibleSince : 0)) / 1000);

    // ── Scroll máximo alcançado ──
    let maxScrollPct = 0;
    const onScroll = () => {
      const doc = document.documentElement;
      const scrollable = doc.scrollHeight - window.innerHeight;
      const pct = scrollable <= 0 ? 100 : Math.round((window.scrollY / scrollable) * 100);
      if (pct > maxScrollPct) maxScrollPct = Math.min(100, pct);
    };

    let lastPingedSeconds = -1;
    const ping = (useBeacon = false) => {
      const active = activeSeconds();
      // Aba parada em background não gera linhas repetidas no banco.
      if (active === lastPingedSeconds && !useBeacon) return;
      lastPingedSeconds = active;
      send('ping', { active_seconds: Math.min(active, MAX_TRACKED_SECONDS), scroll_pct: maxScrollPct }, useBeacon);
    };

    const onVisibility = () => {
      if (document.visibilityState === 'visible') {
        if (visibleSince === null) visibleSince = Date.now();
      } else if (visibleSince !== null) {
        accumulatedMs += Date.now() - visibleSince;
        visibleSince = null;
        ping(true); // fechar o parcial já, caso a aba nunca volte
      }
    };

    const onPageHide = () => {
      onScroll();
      if (visibleSince !== null) {
        accumulatedMs += Date.now() - visibleSince;
        visibleSince = null;
      }
      ping(true);
    };

    // ── Seções: primeira vez que cada bloco marcado fica visível ──
    const seenSections = new Set<string>();
    const observer = new IntersectionObserver(
      entries => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const section = (entry.target as HTMLElement).dataset.trackSection;
          if (!section || seenSections.has(section)) continue;
          seenSections.add(section);
          observer.unobserve(entry.target);
          send('section', { section, at_seconds: activeSeconds() });
        }
      },
      { threshold: 0.35 },
    );

    // ── Cliques: delegação por [data-track-click] (funciona em markup server) ──
    const onClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest<HTMLElement>('[data-track-click]');
      if (target?.dataset.trackClick) {
        send('click', { target: target.dataset.trackClick, at_seconds: activeSeconds() });
      }
    };

    let pingTimer: ReturnType<typeof setInterval> | null = null;
    const teardown = () => {
      if (pingTimer) clearInterval(pingTimer);
      observer.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
      document.removeEventListener('click', onClick, true);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('pagehide', onPageHide);
    };

    // 'open' via fetch (não beacon) porque a resposta importa: disabled:true =
    // sessão de admin, desliga tudo.
    fetch('/api/proposal-events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token,
        event_type: 'open',
        session_id: sessionId,
        visitor_id: visitorId,
        locale,
        referrer: document.referrer || null,
        metadata: {
          screen_w: window.screen?.width,
          screen_h: window.screen?.height,
          tz: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
      }),
    })
      .then(res => res.json())
      .then(data => {
        if (data?.disabled) {
          disabled = true;
          queue.length = 0;
          teardown();
          return;
        }
        ready = true;
        for (const [type, metadata] of queue.splice(0)) {
          send(type as 'ping' | 'section' | 'click', metadata);
        }
      })
      .catch(() => {
        // open falhou (rede): não trava a sessão — solta a fila mesmo assim.
        ready = true;
        for (const [type, metadata] of queue.splice(0)) {
          send(type as 'ping' | 'section' | 'click', metadata);
        }
      });

    document.addEventListener('visibilitychange', onVisibility);
    document.addEventListener('click', onClick, true);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('pagehide', onPageHide);
    document.querySelectorAll<HTMLElement>('[data-track-section]').forEach(el => observer.observe(el));
    onScroll();

    pingTimer = setInterval(() => {
      if (activeSeconds() >= MAX_TRACKED_SECONDS && pingTimer) {
        clearInterval(pingTimer);
        pingTimer = null;
      }
      if (document.visibilityState === 'visible') ping();
    }, PING_INTERVAL_MS);

    return teardown;
  }, [token, locale]);

  return null;
}

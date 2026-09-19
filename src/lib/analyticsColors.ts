// src/lib/analyticsColors.ts
//
// Paleta dos gráficos de /admin/analytics.
//
// Mora aqui, e não dentro de AnalyticsCharts.tsx, porque a página é server
// component e os cartões de total também precisam das cores. Export de um
// arquivo 'use client' vira client reference no servidor: `SERIES_COLORS.x`
// lido lá voltaria `undefined` e o quadradinho sairia sem cor, sem erro
// nenhum no build.
//
// As três cores são os slots 1–3 de uma paleta categórica validada para
// daltonismo (azul, laranja, água) — o conjunto passa nos limites de
// separação nos três tipos de daltonismo e em visão normal. Não trocar por
// gosto sem revalidar: o par água/laranja é o mais apertado.
//
// A água fica abaixo de 3:1 contra o branco, então a identidade da série
// nunca pode depender só da cor: os cartões de total acima do gráfico
// repetem nome e número ao lado do quadradinho.

export const SERIES_COLORS = {
  sessions: '#2a78d6',
  users: '#eb6834',
  pageViews: '#1baf7a',
} as const;

/** Série única de leads: green-600, o acento do admin. */
export const LEADS_COLOR = '#16a34a';

// src/lib/ga4.ts
//
// Acesso à Data API do Google Analytics 4 (property riofuerdeutsche.de), via
// conta de serviço `ga4-reader`. Dois consumidores hoje:
//
//   - a ferramenta `ga4_run_report` do servidor MCP (src/app/api/mcp/[secret]),
//     que devolve o JSON cru pro Claude montar o relatório;
//   - o dashboard /admin/analytics, que precisa do resultado tipado.
//
// Só leitura: o escopo pedido é `analytics.readonly`.
//
// Atenção ao interpretar qualquer número daqui: o GA4 só carrega depois do
// aceite do banner de cookies, então tudo que sai desta API é piso, não total.
// Quem recusa não aparece. A proporção real de aceite está em `consent_events`,
// que é coletada sem depender de consentimento.

import { GoogleAuth } from "google-auth-library";

/** Uma linha de relatório da Data API, do jeito que ela vem no JSON. */
export type Ga4Row = {
  dimensionValues?: { value?: string }[];
  metricValues?: { value?: string }[];
};

export type Ga4Report = {
  rows?: Ga4Row[];
  rowCount?: number;
};

/**
 * Autenticação da GA4 Data API. A chave da conta de serviço vem inteira em
 * base64 na env (o JSON tem quebras de linha na private_key, que não
 * sobrevivem bem a uma env var crua). O GoogleAuth fica em cache no módulo
 * porque ele guarda o access token internamente: numa invocação serverless
 * quente, chamadas seguidas reaproveitam o mesmo token em vez de bater no
 * endpoint de OAuth a cada vez.
 */
let cachedAuth: GoogleAuth | null = null;
export function ga4Auth(): GoogleAuth {
  if (cachedAuth) return cachedAuth;

  const keyBase64 = process.env.GA4_SERVICE_ACCOUNT_KEY_BASE64;
  if (!keyBase64) {
    throw new Error("GA4 não configurado: defina GA4_SERVICE_ACCOUNT_KEY_BASE64.");
  }

  let credentials: Record<string, unknown>;
  try {
    credentials = JSON.parse(Buffer.from(keyBase64, "base64").toString("utf-8"));
  } catch {
    throw new Error(
      "GA4_SERVICE_ACCOUNT_KEY_BASE64 não é um JSON válido em base64. Regere com: base64 -i <arquivo>.json"
    );
  }

  cachedAuth = new GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/analytics.readonly"],
  });
  return cachedAuth;
}

/**
 * Chama a Data API do GA4 (runReport). Lança erro claro em caso de falha.
 *
 * O `body` vai pro Google como veio, então qualquer campo oficial do
 * runReport serve — `dimensionFilter`, `orderBys`, `offset`. Devolve `unknown`
 * porque o consumidor original é o MCP, que só reserializa o JSON; quem
 * precisa ler as linhas em TypeScript usa `ga4RunReportFiltered`.
 */
export async function ga4RunReport(body: Record<string, unknown>): Promise<unknown> {
  const propertyId = process.env.GA4_PROPERTY_ID;
  if (!propertyId) {
    throw new Error("GA4 não configurado: defina GA4_PROPERTY_ID.");
  }

  const client = await ga4Auth().getClient();
  const { token } = await client.getAccessToken();
  if (!token) {
    throw new Error("Falha ao obter access token do Google: verifique a chave da conta de serviço.");
  }

  const res = await fetch(
    `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(body),
    }
  );

  const raw = await res.text();
  let data: unknown = raw;
  try {
    data = raw ? JSON.parse(raw) : null;
  } catch {
    // resposta não-JSON — mantém o texto cru
  }

  if (!res.ok) {
    const message =
      data && typeof data === "object" && "error" in (data as Record<string, unknown>)
        ? JSON.stringify((data as Record<string, unknown>).error)
        : raw || res.statusText;
    throw new Error(`GA4 respondeu ${res.status}: ${message}`);
  }

  return data;
}

/**
 * Mesma chamada de `ga4RunReport`, com o retorno tipado como relatório.
 *
 * Existe pro dashboard, que monta `dimensionFilter` (para excluir /admin das
 * páginas mais vistas, por exemplo) e precisa iterar as linhas sem espalhar
 * cast de `unknown` por toda a página. O filtro em si não é construído aqui:
 * vem pronto no `body`, no formato oficial da Data API, porque cada seção do
 * dashboard filtra por um critério diferente.
 */
export async function ga4RunReportFiltered(
  body: Record<string, unknown>
): Promise<Ga4Report> {
  return (await ga4RunReport(body)) as Ga4Report;
}

/** Valor da dimensão na posição `i` de uma linha ('' se ausente). */
export function ga4Dimension(row: Ga4Row, i = 0): string {
  return row.dimensionValues?.[i]?.value ?? "";
}

/** Métrica na posição `i` como número (0 se ausente ou não-numérica). */
export function ga4Metric(row: Ga4Row, i = 0): number {
  const n = Number(row.metricValues?.[i]?.value);
  return Number.isFinite(n) ? n : 0;
}

// src/lib/search-console.ts
//
// Acesso à Search Console API (Search Analytics) da propriedade
// riofuerdeutsche.de, via a mesma conta de serviço `ga4-reader` usada em
// src/lib/ga4.ts. Consumidor único hoje: a ferramenta `search_console_query`
// do servidor MCP (src/app/api/mcp/[secret]).
//
// Só leitura: o escopo pedido é `webmasters.readonly`. O GoogleAuth é
// separado do de ga4.ts porque o escopo é outro — um token de
// `analytics.readonly` não serve aqui.
//
// Diferença importante em relação ao GA4: estes números não dependem do
// banner de cookies. Vêm do próprio Google, da SERP, então são o total real
// de cliques e impressões — não um piso. Em compensação há atraso: os dois ou
// três dias mais recentes costumam vir vazios ou incompletos.

import { GoogleAuth } from "google-auth-library";

/**
 * A propriedade é do tipo *domain* (`sc-domain:`), não de prefixo de URL:
 * cobre http/https, com e sem www, e todos os subdomínios. Vai no path da API
 * URL-encoded (os dois-pontos viram %3A).
 */
const SITE_URL = "sc-domain:riofuerdeutsche.de";

/**
 * Autenticação da Search Console API. Mesma chave e mesmo raciocínio de cache
 * de `ga4Auth()`: o GoogleAuth guarda o access token internamente, então numa
 * invocação serverless quente as chamadas seguidas reaproveitam o token.
 */
let cachedAuth: GoogleAuth | null = null;
function searchConsoleAuth(): GoogleAuth {
  if (cachedAuth) return cachedAuth;

  const keyBase64 = process.env.GA4_SERVICE_ACCOUNT_KEY_BASE64;
  if (!keyBase64) {
    throw new Error(
      "Search Console não configurado: defina GA4_SERVICE_ACCOUNT_KEY_BASE64 (mesma conta de serviço do GA4)."
    );
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
    scopes: ["https://www.googleapis.com/auth/webmasters.readonly"],
  });
  return cachedAuth;
}

/**
 * Converte os atalhos relativos do GA4 ('7daysAgo', 'today', 'yesterday') em
 * YYYY-MM-DD, que é o único formato que a Search Console API aceita.
 *
 * Existe porque as duas ferramentas do MCP ficam lado a lado e é fácil passar
 * pra esta o mesmo '28daysAgo' que funciona na do GA4 — sem isto, o Google
 * devolveria um 400 seco. Data já no formato certo passa intacta.
 */
export function toSearchConsoleDate(value: string): string {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;

  const relative = value === "today" ? 0 : value === "yesterday" ? 1 : null;
  const daysAgo = relative ?? Number(/^(\d+)daysAgo$/.exec(value)?.[1]);
  if (!Number.isFinite(daysAgo)) {
    throw new Error(
      `Data inválida: "${value}". Use YYYY-MM-DD, 'today', 'yesterday' ou 'NdaysAgo'.`
    );
  }

  const d = new Date();
  d.setUTCDate(d.getUTCDate() - (daysAgo as number));
  return d.toISOString().slice(0, 10);
}

/**
 * Chama searchAnalytics.query. O `body` vai pro Google como veio, então
 * qualquer campo oficial serve — `dimensionFilterGroups`, `type`,
 * `dataState`, `startRow`. Devolve `unknown` porque o consumidor é o MCP, que
 * só reserializa o JSON.
 */
export async function searchConsoleQuery(body: Record<string, unknown>): Promise<unknown> {
  const client = await searchConsoleAuth().getClient();
  const { token } = await client.getAccessToken();
  if (!token) {
    throw new Error("Falha ao obter access token do Google: verifique a chave da conta de serviço.");
  }

  const res = await fetch(
    `https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent(SITE_URL)}/searchAnalytics/query`,
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
    throw new Error(`Search Console respondeu ${res.status}: ${message}`);
  }

  return data;
}

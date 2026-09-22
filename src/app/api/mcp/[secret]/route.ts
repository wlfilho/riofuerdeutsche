// src/app/api/mcp/[secret]/route.ts
//
// Servidor MCP remoto (Model Context Protocol) do site. Registrado como Custom
// Connector no Claude, apontando pra
// https://riofuerdeutsche.de/api/mcp/<MCP_PATH_SECRET>. Três famílias de
// ferramenta hoje:
//
//   - WhatsApp, via a API REST da instância uazapi (`rfd`);
//   - GA4, via a Data API do Google Analytics 4 (conta de serviço ga4-reader);
//   - Search Console, via a Search Analytics API (mesma conta de serviço).
//
// Ferramenta nova aqui aparece sozinha pro Claude já conectado, sem precisar
// reconectar o connector.
//
// A única proteção do endpoint é o segmento `secret` da URL batendo com
// MCP_PATH_SECRET — não há OAuth. Segredo errado (ou não configurado) responde
// 404, pra não revelar que a rota existe. Por isso as ferramentas que escrevem
// têm trava própria (ver assertKnownContact); as de GA4 e Search Console são só
// leitura.
//
// Cada ferramenta chama a API externa diretamente; fora o cliente de auth do
// Google (cacheado pelo token), não há estado em memória entre chamadas
// (serverless, uma invocação por request).

import { timingSafeEqual } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { createMcpHandler } from "mcp-handler";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { ga4RunReport } from "@/lib/ga4";
import { digitsOnly, phoneTail } from "@/lib/phone";
import { searchConsoleQuery, toSearchConsoleDate } from "@/lib/search-console";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/** Compara em tempo constante pra não vazar o segredo por timing attack. */
function isValidSecret(provided: string, expected: string): boolean {
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

type ToolResult = {
  content: { type: "text"; text: string }[];
  isError?: true;
};

function ok(data: unknown): ToolResult {
  return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
}

function fail(error: unknown): ToolResult {
  const message = error instanceof Error ? error.message : String(error);
  return { content: [{ type: "text", text: `Erro: ${message}` }], isError: true };
}

/** Envolve o callback de cada ferramenta pra nunca deixar exceção estourar sem tratamento. */
function safe<Args>(
  fn: (args: Args) => Promise<unknown>
): (args: Args) => Promise<ToolResult> {
  return async (args) => {
    try {
      return ok(await fn(args));
    } catch (error) {
      return fail(error);
    }
  };
}

/** Chama a API REST da instância uazapi. Lança erro claro em caso de falha HTTP. */
async function uazapi(path: string, body: Record<string, unknown>): Promise<unknown> {
  const baseUrl = process.env.UAZAPI_URL;
  const token = process.env.UAZAPI_TOKEN;
  if (!baseUrl || !token) {
    throw new Error("uazapi não configurado: defina UAZAPI_URL e UAZAPI_TOKEN.");
  }

  const res = await fetch(`${baseUrl}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", token },
    body: JSON.stringify(body),
  });

  const raw = await res.text();
  let data: unknown = raw;
  try {
    data = raw ? JSON.parse(raw) : null;
  } catch {
    // resposta não-JSON — mantém o texto cru
  }

  if (!res.ok) {
    const message =
      data && typeof data === "object" && "message" in (data as Record<string, unknown>)
        ? String((data as Record<string, unknown>).message)
        : raw || res.statusText;
    throw new Error(`uazapi respondeu ${res.status}: ${message}`);
  }

  return data;
}

/**
 * Allowlist de `send_text_message`: só deixa enviar pra números que já são
 * contato no CRM (tabela `contacts`). Casa pelos últimos 8 dígitos — mesma
 * lógica de src/app/api/webhooks/uazapi/route.ts — porque o número que o
 * Claude recebe pode vir em formato diferente do salvo no CRM. Isso limita o
 * dano de um vazamento do MCP_PATH_SECRET: dá pra responder um lead
 * existente, mas não pra mandar mensagem pra um número desconhecido.
 */
async function assertKnownContact(number: string): Promise<void> {
  const target = phoneTail(digitsOnly(number));
  if (!target) {
    throw new Error(`Número inválido: "${number}".`);
  }

  const { data, error } = await supabaseAdmin
    .from("contacts")
    .select("phone")
    .not("phone", "is", null);

  if (error) {
    throw new Error(`Falha ao consultar contatos do CRM: ${error.message}`);
  }

  const known = (data ?? []).some((c) => phoneTail(digitsOnly(c.phone)) === target);
  if (!known) {
    throw new Error(
      `Envio bloqueado: ${number} não é um contato conhecido no CRM. Cadastre o contato antes de enviar mensagem pra ele.`
    );
  }
}

const mcpHandler = createMcpHandler(
  (server) => {
    server.registerTool(
      "list_recent_chats",
      {
        title: "Listar conversas recentes",
        description:
          "Lista as conversas mais recentes do WhatsApp, ordenadas pela última mensagem (mais recente primeiro).",
        inputSchema: z.object({
          limit: z.number().int().positive().max(100).default(20).describe("Quantidade máxima de conversas a retornar."),
        }),
      },
      safe(async ({ limit }) =>
        uazapi("/chat/find", { limit, offset: 0, sort: "-wa_lastMsgTimestamp" })
      )
    );

    server.registerTool(
      "search_chats",
      {
        title: "Buscar conversas",
        description:
          "Busca conversas do WhatsApp por nome, id da conversa, se é grupo e/ou se está arquivada.",
        inputSchema: z.object({
          name: z.string().optional().describe("Filtra pelo nome do contato ou grupo."),
          chatId: z.string().optional().describe("Filtra pelo id exato da conversa (wa_chatid)."),
          isGroup: z.boolean().optional().describe("true para grupos, false para conversas individuais."),
          archived: z.boolean().optional().describe("true para conversas arquivadas, false para não arquivadas."),
          limit: z.number().int().positive().max(100).default(20).describe("Quantidade máxima de conversas a retornar."),
        }),
      },
      safe(async ({ name, chatId, isGroup, archived, limit }) =>
        uazapi("/chat/find", {
          limit,
          offset: 0,
          name,
          wa_chatid: chatId,
          wa_isGroup: isGroup,
          wa_archived: archived,
        })
      )
    );

    server.registerTool(
      "get_messages",
      {
        title: "Buscar mensagens de uma conversa",
        description: "Retorna as mensagens mais recentes de uma conversa específica do WhatsApp.",
        inputSchema: z.object({
          chatId: z.string().min(1).describe("Id da conversa (wa_chatid) da qual buscar as mensagens."),
          limit: z.number().int().positive().max(200).default(50).describe("Quantidade máxima de mensagens a retornar."),
        }),
      },
      safe(async ({ chatId, limit }) => uazapi("/message/find", { chatid: chatId, limit, offset: 0 }))
    );

    server.registerTool(
      "send_text_message",
      {
        title: "Enviar mensagem de texto",
        description:
          "Envia uma mensagem de texto pelo WhatsApp para um número. Só funciona para números que já são contato no CRM (allowlist). Ação real e irreversível — confirme o número e o conteúdo antes de chamar.",
        inputSchema: z.object({
          number: z.string().min(1).describe("Número de destino (com DDI, ex: 5521999999999)."),
          text: z.string().min(1).max(4096).describe("Texto da mensagem, até 4096 caracteres."),
        }),
      },
      safe(async ({ number, text }) => {
        await assertKnownContact(number);
        return uazapi("/send/text", { number, text });
      })
    );

    server.registerTool(
      "mark_chat_read",
      {
        title: "Marcar conversa como lida",
        description: "Marca todas as mensagens de uma conversa do WhatsApp como lidas.",
        inputSchema: z.object({
          number: z.string().min(1).describe("Número da conversa a marcar como lida."),
        }),
      },
      safe(async ({ number }) => uazapi("/chat/read", { number, read: true }))
    );

    server.registerTool(
      "ga4_run_report",
      {
        title: "Consultar relatório do GA4",
        description:
          "Roda um relatório na Data API do Google Analytics 4 do riofuerdeutsche.de. Use nomes oficiais de dimensões/métricas (ex: dimension 'pagePath', 'eventName', 'date', 'sessionSource'; metric 'sessions', 'totalUsers', 'eventCount', 'screenPageViews'). Datas em YYYY-MM-DD ou relativas ('7daysAgo', 'today'). Sem filtro embutido — se precisar excluir tráfego de /admin ou outro padrão, filtre nas linhas retornadas. Atenção: o GA4 só registra quem aceitou o banner de cookies, então os números são piso, não total.",
        inputSchema: z.object({
          dimensions: z
            .array(z.string())
            .default([])
            .describe("Ex: ['date', 'pagePath']. Vazio para métrica agregada sem quebra."),
          metrics: z.array(z.string()).min(1).describe("Ex: ['sessions', 'totalUsers']."),
          start_date: z.string().default("7daysAgo").describe("Data inicial, YYYY-MM-DD ou relativa."),
          end_date: z.string().default("today").describe("Data final, YYYY-MM-DD ou relativa."),
          limit: z.number().int().positive().max(1000).default(50).describe("Máximo de linhas a retornar."),
        }),
      },
      safe(async ({ dimensions, metrics, start_date, end_date, limit }) =>
        ga4RunReport({
          dateRanges: [{ startDate: start_date, endDate: end_date }],
          dimensions: dimensions.map((name) => ({ name })),
          metrics: metrics.map((name) => ({ name })),
          limit,
        })
      )
    );

    server.registerTool(
      "search_console_query",
      {
        title: "Consultar Search Console (cliques, impressões, CTR, posição)",
        description:
          "Roda uma consulta de Search Analytics na Search Console do riofuerdeutsche.de (propriedade de domínio, cobre www e subdomínios). Devolve clicks, impressions, ctr e position por dimensão. Diferente do GA4, estes números não dependem do banner de cookies — vêm da própria busca do Google, então são o total real. Em compensação há atraso: os 2 ou 3 dias mais recentes costumam vir vazios. Datas em YYYY-MM-DD (atalhos '7daysAgo'/'today' também são aceitos e convertidos).",
        inputSchema: z.object({
          dimensions: z
            .array(z.enum(["query", "page", "country", "device", "date", "searchAppearance"]))
            .default(["query"])
            .describe("Como quebrar as linhas. Ex: ['query'] para termos de busca, ['page'] para páginas, ['date','query'] para evolução por termo."),
          start_date: z.string().default("28daysAgo").describe("Data inicial, YYYY-MM-DD."),
          end_date: z.string().default("today").describe("Data final, YYYY-MM-DD."),
          row_limit: z.number().int().positive().max(25000).default(100).describe("Máximo de linhas a retornar."),
          page_filter: z
            .string()
            .optional()
            .describe("Restringe a uma página só, pela URL exata e completa (ex: 'https://riofuerdeutsche.de/touren/rocinha')."),
          query_filter: z
            .string()
            .optional()
            .describe("Restringe aos termos de busca que contenham este texto (ex: 'rocinha')."),
        }),
      },
      safe(async ({ dimensions, start_date, end_date, row_limit, page_filter, query_filter }) => {
        const filters: { dimension: string; operator: string; expression: string }[] = [];
        if (page_filter) filters.push({ dimension: "page", operator: "equals", expression: page_filter });
        if (query_filter) filters.push({ dimension: "query", operator: "contains", expression: query_filter });

        return searchConsoleQuery({
          startDate: toSearchConsoleDate(start_date),
          endDate: toSearchConsoleDate(end_date),
          dimensions,
          rowLimit: row_limit,
          ...(filters.length ? { dimensionFilterGroups: [{ filters }] } : {}),
        });
      })
    );
  },
  { serverInfo: { name: "rio-fuer-deutsche", version: "1.1.0" } }
);

async function handleRequest(
  request: NextRequest,
  { params }: { params: Promise<{ secret: string }> }
): Promise<Response> {
  const { secret } = await params;
  const expected = process.env.MCP_PATH_SECRET;

  if (!expected || !isValidSecret(secret, expected)) {
    return new NextResponse(null, { status: 404 });
  }

  return mcpHandler(request);
}

export { handleRequest as GET, handleRequest as POST, handleRequest as DELETE };

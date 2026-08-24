// src/app/api/mcp/[secret]/route.ts
//
// Servidor MCP remoto (Model Context Protocol) para o Claude ler e enviar
// mensagens no WhatsApp através da instância uazapi (`rfd`). Registrado como
// Custom Connector no Claude, apontando pra
// https://riofuerdeutsche.de/api/mcp/<MCP_PATH_SECRET>.
//
// A única proteção do endpoint é o segmento `secret` da URL batendo com
// MCP_PATH_SECRET — não há OAuth. Segredo errado (ou não configurado) responde
// 404, pra não revelar que a rota existe.
//
// Cada ferramenta chama a API REST da instância uazapi diretamente; não há
// estado em memória entre chamadas (serverless, uma invocação por request).

import { timingSafeEqual } from "node:crypto";
import { createMcpHandler } from "mcp-handler";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";

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
  const baseUrl = process.env.UAZAPI_BASE_URL;
  const token = process.env.UAZAPI_TOKEN;
  if (!baseUrl || !token) {
    throw new Error("uazapi não configurado: defina UAZAPI_BASE_URL e UAZAPI_TOKEN.");
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
          "Envia uma mensagem de texto pelo WhatsApp para um número. Ação real e irreversível — confirme o número e o conteúdo antes de chamar.",
        inputSchema: z.object({
          number: z.string().min(1).describe("Número de destino (com DDI, ex: 5521999999999)."),
          text: z.string().min(1).max(4096).describe("Texto da mensagem, até 4096 caracteres."),
        }),
      },
      safe(async ({ number, text }) => uazapi("/send/text", { number, text }))
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
  },
  { serverInfo: { name: "rio-fuer-deutsche-whatsapp", version: "1.0.0" } }
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

import { NextResponse } from 'next/server';

// Recebe exceções de client e as escreve no log da função, que é o único jeito
// de elas aparecerem no painel de erros da Vercel. Não grava em banco: o volume
// é imprevisível (qualquer visitante pode postar aqui) e o log já basta para
// diagnosticar. Por isso também todo campo entra truncado.

const MAX_BODY = 8_000;

function clamp(value: unknown, max: number): string {
  return typeof value === 'string' ? value.slice(0, max) : '';
}

export async function POST(request: Request) {
  let raw: string;
  try {
    raw = (await request.text()).slice(0, MAX_BODY);
  } catch {
    return new NextResponse(null, { status: 204 });
  }

  let body: Record<string, unknown> = {};
  try {
    body = JSON.parse(raw) as Record<string, unknown>;
  } catch {
    return new NextResponse(null, { status: 204 });
  }

  // Prefixo fixo para dar pra filtrar no log da Vercel por "[client-error]".
  console.error('[client-error]', {
    message: clamp(body.message, 500),
    digest: clamp(body.digest, 100) || null,
    url: clamp(body.url, 500),
    userAgent: clamp(body.userAgent, 300),
    stack: clamp(body.stack, 2000),
  });

  return new NextResponse(null, { status: 204 });
}

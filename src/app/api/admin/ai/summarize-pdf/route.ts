import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

async function verifyAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();
  return profile?.role === 'admin';
}

export async function POST(req: NextRequest) {
  if (!(await verifyAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get('file') as File | null;

  if (!file) return NextResponse.json({ error: 'Nenhum arquivo enviado' }, { status: 400 });
  if (file.type !== 'application/pdf') return NextResponse.json({ error: 'Apenas PDF' }, { status: 400 });
  if (file.size > 20 * 1024 * 1024) return NextResponse.json({ error: 'Arquivo muito grande' }, { status: 400 });

  const bytes = await file.arrayBuffer();
  const base64 = Buffer.from(bytes).toString('base64');

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 512,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'document',
            source: { type: 'base64', media_type: 'application/pdf', data: base64 },
          },
          {
            type: 'text',
            text: `Você é um assistente de um guia de turismo em Rio de Janeiro que atende clientes alemães.
Leia esta proposta/documento e extraia as informações mais importantes em formato de notas internas curtas e diretas.

Inclua (quando presentes):
- Programa / roteiro (dias, atividades, passeios)
- Valores cobrados (total, por pessoa, sinal)
- Datas (chegada, saída, duração)
- Número de pessoas (PAX)
- O que foi combinado / condições especiais
- Transportes incluídos
- Qualquer observação importante

Responda APENAS com as notas, sem introdução, sem título, sem markdown. Máximo 150 palavras. Escreva em português brasileiro de forma concisa.`,
          },
        ],
      },
    ],
  });

  const text = message.content[0].type === 'text' ? message.content[0].text.trim() : '';
  return NextResponse.json({ summary: text });
}

import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const LOCALE_NAMES: Record<string, string> = {
  de: 'alemão',
  'pt-BR': 'português brasileiro',
};

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

  const { title, category, locale } = await req.json();

  if (!title?.trim()) return NextResponse.json({ error: 'Título obrigatório' }, { status: 400 });
  if (!locale) return NextResponse.json({ error: 'Idioma obrigatório' }, { status: 400 });

  const languageName = LOCALE_NAMES[locale] ?? `o idioma de código "${locale}"`;

  const message = await anthropic.messages.create({
    model: 'claude-opus-5',
    max_tokens: 1000,
    output_config: { effort: 'low' },
    messages: [
      {
        role: 'user',
        content: `Você é assistente de um guia de turismo que atende clientes alemães no Rio de Janeiro (Rio für Deutsche).

Escreva uma descrição curta para a atividade "${title.trim()}"${category ? ` (categoria: ${category})` : ''}.

A descrição aparece para o cliente embaixo do nome da atividade na proposta online e no PDF. Deve ser em ${languageName}, com 1 a 2 frases (máximo ~200 caracteres), tom convidativo mas informativo, sem exageros nem clichês de marketing.

Responda APENAS com a descrição, sem aspas, sem introdução, sem markdown.`,
      },
    ],
  });

  if (message.stop_reason === 'refusal') {
    return NextResponse.json({ error: 'Não foi possível gerar a descrição' }, { status: 502 });
  }

  const text = message.content.find(b => b.type === 'text')?.text.trim() ?? '';
  if (!text) return NextResponse.json({ error: 'Não foi possível gerar a descrição' }, { status: 502 });

  return NextResponse.json({ description: text });
}

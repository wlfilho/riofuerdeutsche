import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

/**
 * Clientes para o seletor "Enviar para cliente" do editor de templates.
 *
 * Só GET: `tour_clients` foi aposentada em 31/08/2026 e com ela o CRUD que
 * vivia aqui. Cliente deixou de ser uma linha criada à mão e passou a ser o
 * lead que fechou — a mesma definição da view `clients_v` e do filtro da tela
 * de contatos, agora no nível do lead, que é o que se pode enviar e-mail para.
 */
export async function GET() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();
  if (profile?.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data, error } = await supabase
    .from('price_leads')
    .select('id, name, email')
    .eq('status', 'closed')
    .not('email', 'is', null)
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ clients: data ?? [] });
}

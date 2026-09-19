/**
 * Deslocamento entre a origem da proposta (hotel, porto) e cada atração do
 * catálogo, nos dois sentidos.
 *
 * Existe como rota porque o Proposal Builder é um componente de cliente e a
 * ORS_API_KEY não pode sair do servidor. Chamada quando o Will preenche o
 * endereço de origem e ao abrir uma proposta que já tem um.
 *
 * Nunca é erro fatal: endereço não encontrado ou ORS fora do ar devolvem 200
 * com `legs` vazio, e o builder segue com os tempos fixos do catálogo.
 */
import { createClient } from '@/utils/supabase/server';
import { orsGeocodeRio } from '@/lib/ors';
import { getOriginLegs } from '@/lib/travelServer';
import { NextRequest, NextResponse } from 'next/server';

async function verifyAdmin(): Promise<boolean> {
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

export async function POST(request: NextRequest) {
  if (!await verifyAdmin()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json() as {
    origin_label?: string;
    latitude?: number;
    longitude?: number;
  };

  const vazio = { latitude: null, longitude: null, resolved_label: null, legs: {} };

  try {
    // Coordenada já gravada na proposta dispensa geocodificar de novo.
    let ponto: { latitude: number; longitude: number; label: string } | null =
      typeof body.latitude === 'number' && typeof body.longitude === 'number'
        ? { latitude: body.latitude, longitude: body.longitude, label: body.origin_label ?? '' }
        : null;

    if (!ponto) {
      const texto = (body.origin_label ?? '').trim();
      if (!texto) return NextResponse.json(vazio);
      ponto = await orsGeocodeRio(texto);
      if (!ponto) return NextResponse.json({ ...vazio, not_found: true });
    }

    const legs = await getOriginLegs(ponto);
    return NextResponse.json({
      latitude: ponto.latitude,
      longitude: ponto.longitude,
      resolved_label: ponto.label,
      legs,
    });
  } catch (err) {
    console.error('[origin-legs]', (err as Error).message);
    return NextResponse.json({ ...vazio, failed: true });
  }
}

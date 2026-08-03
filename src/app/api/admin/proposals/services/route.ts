import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import {
  getAllTranslationsByService,
  getSupportedLocales,
  saveServiceTranslations,
  type TranslationsPayload,
} from '@/lib/services-i18n';

type CostPayload = {
  description: string;
  base_price: number;
  currency: string;
  price_type: string;
  include_in_price?: boolean;
};

async function verifyAdmin(): Promise<boolean> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;
  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single();
  return profile?.role === 'admin';
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export async function GET() {
  if (!await verifyAdmin()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = await createClient();
  const [{ data, error }, translationsByService, supportedLocales] = await Promise.all([
    supabase
      .from('proposal_services')
      // Colunas explícitas de propósito: name/description/pdf_note estão
      // DEPRECATED e o texto vem de `translations` logo abaixo. Um select('*')
      // aqui reintroduziria as colunas antigas no payload do admin.
      .select(
        'id, slug, category, notes, is_active, sort_order, duration_hours, ' +
          'transfer_hours_to, transfer_hours_back, suggested_period, ' +
          'transport_type_id, created_at, updated_at, ' +
          'costs:proposal_service_costs(*)',
      )
      .order('sort_order'),
    getAllTranslationsByService(),
    getSupportedLocales(),
  ]);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Cada serviço leva junto o mapa locale → texto, que alimenta as abas de
  // idioma do modal e os badges de cobertura da lista.
  const services = ((data ?? []) as unknown as Array<{ id: string }>).map((s) => ({
    ...s,
    translations: translationsByService[s.id] ?? {},
  }));

  return NextResponse.json({ services, supportedLocales });
}

export async function POST(request: NextRequest) {
  if (!await verifyAdmin()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = await createClient();
  const body = await request.json();
  const {
    category, notes, is_active,
    duration_hours, transfer_hours_to, transfer_hours_back,
    suggested_period, transport_type_id, costs,
  } = body;

  const translations = (body.translations ?? {}) as TranslationsPayload;
  const supportedLocales = await getSupportedLocales();

  // O nome canônico é o do locale padrão dos clientes; se ele não foi
  // preenchido, vale o primeiro locale suportado que tiver nome.
  const defaultLocale = supportedLocales[0];
  const canonicalName =
    translations[defaultLocale]?.name?.trim() ||
    supportedLocales.map((l) => translations[l]?.name?.trim()).find(Boolean) ||
    '';

  if (!canonicalName || !category) {
    return NextResponse.json({ error: 'name e category são obrigatórios.' }, { status: 400 });
  }

  // Unique slug
  const slug = `${slugify(canonicalName)}-${Math.random().toString(36).slice(2, 7)}`;

  // Next sort_order
  const { data: maxRow } = await supabase
    .from('proposal_services')
    .select('sort_order')
    .order('sort_order', { ascending: false })
    .limit(1)
    .maybeSingle();
  const sort_order = (maxRow?.sort_order ?? -1) + 1;

  const { data: service, error: svcErr } = await supabase
    .from('proposal_services')
    .insert({
      slug,
      // DEPRECATED: proposal_services.name é NOT NULL, então ainda gravamos uma
      // cópia do nome canônico só para satisfazer a constraint. Ninguém lê daqui
      // — a fonte de verdade é proposal_service_translations. description e
      // pdf_note são nullable e ficam intocados.
      name: canonicalName,
      category,
      notes: notes?.trim() || null,
      is_active: is_active ?? true,
      duration_hours: duration_hours || null,
      transfer_hours_to: transfer_hours_to || null,
      transfer_hours_back: transfer_hours_back || null,
      suggested_period: suggested_period || null,
      transport_type_id: transport_type_id || null,
      sort_order,
    })
    .select()
    .single();

  if (svcErr) return NextResponse.json({ error: svcErr.message }, { status: 500 });

  const trErr = await saveServiceTranslations(
    supabase, service.id, translations, supportedLocales,
  );
  if (trErr) return NextResponse.json({ error: trErr }, { status: 500 });

  if (costs?.length > 0) {
    const { error: costsErr } = await supabase
      .from('proposal_service_costs')
      .insert(
        (costs as CostPayload[]).map((c, i) => ({
          service_id: service.id,
          description: c.description,
          base_price: c.base_price,
          currency: c.currency,
          price_type: c.price_type,
          include_in_price: c.include_in_price ?? true,
          sort_order: i,
        }))
      );
    if (costsErr) return NextResponse.json({ error: costsErr.message }, { status: 500 });
  }

  return NextResponse.json({ service }, { status: 201 });
}

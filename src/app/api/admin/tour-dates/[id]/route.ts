import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { competesForDay, findConflictingTourDates, knownLeadDays, TOUR_DATE_SELECT, type TourDate } from '@/lib/tourDates';
import { sendDateConflictAlert } from '@/lib/email/sendDateConflictAlert';

async function verifyAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { authorized: false, supabase };
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();
  return { authorized: profile?.role === 'admin', supabase };
}

const VALID_STATUSES = ['rascunho', 'proposta_enviada', 'fechado'];

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { authorized, supabase } = await verifyAdmin();
  if (!authorized) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const body = await request.json();

  if (body.status !== undefined && !VALID_STATUSES.includes(body.status)) {
    return NextResponse.json({ error: 'Status inválido.' }, { status: 400 });
  }
  const updates: Record<string, unknown> = {};
  if (body.date !== undefined) updates.date = body.date;
  if (body.start_time !== undefined) updates.start_time = body.start_time || null;
  if (body.tour_name !== undefined) updates.tour_name = body.tour_name?.trim() || null;
  if (body.status !== undefined) updates.status = body.status;
  if (body.pax !== undefined) updates.pax = body.pax ?? null;
  if (body.meeting_point !== undefined) updates.meeting_point = body.meeting_point?.trim() || null;
  if (body.agreed_price !== undefined) updates.agreed_price = body.agreed_price ?? null;
  if (body.anzahlung_paid !== undefined) updates.anzahlung_paid = Boolean(body.anzahlung_paid);
  if (body.with_partner !== undefined) updates.with_partner = Boolean(body.with_partner);
  // Nome só existe com a marca de parceiro (o banco também garante isso).
  if (body.with_partner !== undefined || body.partner_name !== undefined) {
    updates.partner_name = body.with_partner ? body.partner_name?.trim() || null : null;
  }
  if (body.driver_id !== undefined) {
    const driverId = body.driver_id || null;
    // Só profile com role='driver' pode ser escalado (mesma guarda do POST).
    if (driverId) {
      const { data: driver } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', driverId)
        .eq('role', 'driver')
        .maybeSingle();
      if (!driver) {
        return NextResponse.json({ error: 'Motorista inválido.' }, { status: 400 });
      }
    }
    updates.driver_id = driverId;
  }
  if (body.notes !== undefined) updates.notes = body.notes?.trim() || null;

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'Nenhum campo para atualizar.' }, { status: 400 });
  }

  // Só precisa saber a data antiga pra decidir se checa conflito depois —
  // reenviar a mesma data (ex.: editando só o preço) não deve re-alertar.
  let oldDate: string | null = null;
  if (updates.date !== undefined) {
    const { data: current } = await supabase
      .from('tour_dates')
      .select('date, lead_id, with_partner')
      .eq('id', id)
      .single();
    oldDate = current?.date ?? null;

    // Mesma guarda do POST, agora na troca de data: se o novo dia colide com
    // tour de outro cliente, devolve 409 e só grava com `force` (confirmação
    // explícita no modal), em vez de gravar e avisar por e-mail depois.
    const withPartner = updates.with_partner !== undefined
      ? Boolean(updates.with_partner)
      : Boolean(current?.with_partner);
    if (!body.force && current && updates.date !== oldDate) {
      const newDate = String(updates.date);
      const conflicts = withPartner
        ? []
        : (await findConflictingTourDates(supabase, newDate, current.lead_id))
            // Parceiro ou dia vazio no roteiro do outro lead: não disputa.
            .filter(o => competesForDay(o))
            .map(o => ({
              date: newDate,
              lead_name: o.lead?.name ?? null,
              tour_name: o.tour_name,
              status: o.status,
            }));

      // Mesmo aviso do POST pra dia que o lead não tem na proposta/Anfrage.
      const known = await knownLeadDays(supabase, current.lead_id);
      const outside = known.length > 0 && !known.includes(newDate)
        ? [{ date: newDate, known_days: known }]
        : [];

      if (conflicts.length > 0 || outside.length > 0) {
        return NextResponse.json(
          { error: 'duplicate_dates', duplicates: [], conflicts, outside },
          { status: 409 },
        );
      }
    }
  }

  const { data, error } = await supabase
    .from('tour_dates')
    .update(updates)
    .eq('id', id)
    .select(TOUR_DATE_SELECT)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const updated = data as unknown as TourDate;
  if (updates.date !== undefined && updates.date !== oldDate && !updated.with_partner) {
    const others = await findConflictingTourDates(supabase, updated.date, updated.lead_id);
    // Só alerta se sobrar alguém disputando de verdade: dia do outro cliente
    // coberto por parceiro, ou vazio no roteiro dele, não briga por esta data.
    if (others.some(o => competesForDay(o))) {
      await sendDateConflictAlert([{
        date: updated.date,
        tours: [
          { lead_name: updated.lead?.name ?? '—', tour_name: updated.tour_name, status: updated.status },
          ...others.map(o => ({
            lead_name: o.lead?.name ?? '—',
            tour_name: o.tour_name,
            status: o.status,
            with_partner: o.with_partner,
            partner_name: o.partner_name,
          })),
        ],
      }]);
    }
  }

  return NextResponse.json({ tourDate: data });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { authorized, supabase } = await verifyAdmin();
  if (!authorized) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;

  const { error } = await supabase.from('tour_dates').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}

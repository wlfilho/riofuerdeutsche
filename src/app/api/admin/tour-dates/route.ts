import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { findConflictingTourDates, knownLeadDays, TOUR_DATE_SELECT, type TourDate } from '@/lib/tourDates';
import { sendDateConflictAlert, type ConflictDateGroup } from '@/lib/email/sendDateConflictAlert';

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

/** Dia já ocupado devolvido no 409. `source` diz de onde veio o choque. */
type DuplicateDate = { date: string; tour_name: string | null; source: 'existente' | 'formulario' };

/** Tour de OUTRO cliente no mesmo dia, também devolvido no 409. */
type ConflictDate = {
  date: string;
  lead_name: string | null;
  tour_name: string | null;
  status: string;
};

export async function GET(request: NextRequest) {
  const { authorized, supabase } = await verifyAdmin();
  if (!authorized) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const leadId = request.nextUrl.searchParams.get('lead_id');

  let query = supabase
    .from('tour_dates')
    .select(TOUR_DATE_SELECT)
    .order('date', { ascending: true })
    .order('start_time', { ascending: true, nullsFirst: true });

  if (leadId) query = query.eq('lead_id', leadId);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ tourDates: data ?? [] });
}

export async function POST(request: NextRequest) {
  const { authorized, supabase } = await verifyAdmin();
  if (!authorized) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const dates = Array.isArray(body.dates) ? body.dates : [body];

  if (dates.length === 0) {
    return NextResponse.json({ error: 'Nenhuma data informada.' }, { status: 400 });
  }

  const rows = [];
  for (const d of dates) {
    if (!d.lead_id || !d.date) {
      return NextResponse.json({ error: 'lead_id e date são obrigatórios.' }, { status: 400 });
    }
    if (!VALID_STATUSES.includes(d.status)) {
      return NextResponse.json({ error: 'Status inválido.' }, { status: 400 });
    }
    rows.push({
      lead_id: d.lead_id,
      date: d.date,
      start_time: d.start_time || null,
      tour_name: d.tour_name?.trim() || null,
      status: d.status,
      pax: d.pax ?? null,
      meeting_point: d.meeting_point?.trim() || null,
      agreed_price: d.agreed_price ?? null,
      anzahlung_paid: Boolean(d.anzahlung_paid),
      with_partner: Boolean(d.with_partner),
      partner_name: d.with_partner ? d.partner_name?.trim() || null : null,
      driver_id: d.driver_id || null,
      notes: d.notes?.trim() || null,
    });
  }

  // driver_id precisa apontar pra um profile com role='driver': o FK sozinho
  // aceitaria qualquer usuário, e um membro comum escalado por engano ganharia
  // acesso ao dia em /motorista.
  const driverIds = [...new Set(rows.map(r => r.driver_id).filter(Boolean))] as string[];
  if (driverIds.length > 0) {
    const { data: drivers } = await supabase
      .from('profiles')
      .select('id')
      .in('id', driverIds)
      .eq('role', 'driver');
    if ((drivers ?? []).length !== driverIds.length) {
      return NextResponse.json({ error: 'Motorista inválido.' }, { status: 400 });
    }
  }

  // Guarda contra dia dobrado: o mesmo cliente já ter tour na data que está
  // sendo criada é quase sempre cadastro repetido (aconteceu com o Uwe-Jens
  // Mey, 09/2026: o pacote de 5 dias entrou duas vezes e o calendário passou a
  // mostrar dois cards por dia). Não dá pra barrar de vez — helicóptero de
  // manhã + city tour à tarde no mesmo dia é legítimo — então avisa e só grava
  // se o admin confirmar (`force`). Isso é distinto de
  // findConflictingTourDates, que olha OUTROS leads no mesmo dia.
  if (!body.force) {
    const leadIds = [...new Set(rows.map(r => r.lead_id))];
    const dateValues = [...new Set(rows.map(r => r.date))];
    const { data: existing } = await supabase
      .from('tour_dates')
      .select('date, tour_name, lead_id')
      .in('lead_id', leadIds)
      .in('date', dateValues);

    // `source` separa as duas origens porque a correção é diferente: 'existente'
    // pede pra cancelar e editar o tour já gravado, 'formulario' pede só pra
    // arrumar a linha repetida aqui mesmo. Mandar o conselho errado faz o admin
    // procurar no calendário um tour que não existe.
    const wanted = new Set(rows.map(r => `${r.lead_id}|${r.date}`));
    const reported = new Set<string>();
    const duplicates: DuplicateDate[] = [];

    for (const e of existing ?? []) {
      const key = `${e.lead_id}|${e.date}`;
      if (!wanted.has(key) || reported.has(key)) continue;
      reported.add(key);
      duplicates.push({ date: e.date, tour_name: e.tour_name, source: 'existente' });
    }

    // O mesmo dia repetido dentro do próprio envio cai no mesmo caso, e nem
    // chega a passar pelo banco: "Adicionar outro dia" já vem preenchido com a
    // data da linha anterior, então dois cliques sem trocar o dia bastam pra
    // gravar os dois cards iguais.
    const seen = new Set<string>();
    for (const r of rows) {
      const key = `${r.lead_id}|${r.date}`;
      if (seen.has(key) && !reported.has(key)) {
        reported.add(key);
        duplicates.push({ date: r.date, tour_name: r.tour_name, source: 'formulario' });
      }
      seen.add(key);
    }

    // Choque com OUTRO cliente entra no mesmo aviso-e-confirma: criar um dia
    // em cima de um dia já vendido de outro lead é quase sempre data errada no
    // formulário (Stefan Hülsdell, 09/2026: modal aberto só pra registrar o
    // sinal, a data veio pré-preenchida com o dia corrente e nasceu um tour
    // fantasma em cima do dia fechado do Joachim Tilg). O e-mail de conflito
    // já existia, mas só saía DEPOIS de gravar; aqui o admin decide antes.
    const conflicts: ConflictDate[] = [];
    for (const r of rows) {
      // Dia entregue a parceiro não consome a sua agenda (ver dayConflictFor).
      if (r.with_partner) continue;
      const others = await findConflictingTourDates(supabase, r.date, r.lead_id);
      for (const o of others) {
        if (o.with_partner) continue;
        conflicts.push({
          date: r.date,
          lead_name: o.lead?.name ?? null,
          tour_name: o.tour_name,
          status: o.status,
        });
      }
    }

    // Dia que o lead simplesmente NÃO tem — nem na proposta, nem na Anfrage.
    // Sem esta checagem, o tour fantasma só era pego se por acaso outro
    // cliente ocupasse o mesmo dia; num dia livre ele entrava calado e virava
    // um "fechado" falso no calendário. Lead sem nenhum dia conhecido (criado
    // à mão, sem proposta) fica de fora: não há contra o que validar.
    const outside: { date: string; known_days: string[] }[] = [];
    const knownByLead = new Map<string, string[]>();
    for (const leadId of leadIds) {
      knownByLead.set(leadId, await knownLeadDays(supabase, leadId));
    }
    for (const r of rows) {
      const known = knownByLead.get(r.lead_id) ?? [];
      if (known.length > 0 && !known.includes(r.date)) {
        outside.push({ date: r.date, known_days: known });
      }
    }

    if (duplicates.length > 0 || conflicts.length > 0 || outside.length > 0) {
      return NextResponse.json(
        { error: 'duplicate_dates', duplicates, conflicts, outside },
        { status: 409 },
      );
    }
  }

  const { data, error } = await supabase
    .from('tour_dates')
    .insert(rows)
    .select(TOUR_DATE_SELECT);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Best-effort: um dia de tour novo pode colidir com o de outro cliente já
  // agendado. Checagem roda por linha inserida (um tour de vários dias pode
  // colidir só em alguns) e o alerta sai consolidado num único e-mail.
  const inserted = (data ?? []) as unknown as TourDate[];
  const conflictGroups: ConflictDateGroup[] = [];
  for (const row of inserted) {
    const others = await findConflictingTourDates(supabase, row.date, row.lead_id);
    // Dia entregue a parceiro não disputa agenda: nem quando é o tour novo que
    // já nasce com parceiro, nem quando é o outro cliente que já está coberto.
    if (row.with_partner || !others.some(o => !o.with_partner)) continue;
    conflictGroups.push({
      date: row.date,
      tours: [
        { lead_name: row.lead?.name ?? '—', tour_name: row.tour_name, status: row.status },
        ...others.map(o => ({
          lead_name: o.lead?.name ?? '—',
          tour_name: o.tour_name,
          status: o.status,
          with_partner: o.with_partner,
          partner_name: o.partner_name,
        })),
      ],
    });
  }
  if (conflictGroups.length > 0) {
    await sendDateConflictAlert(conflictGroups);
  }

  return NextResponse.json({ tourDates: data ?? [] }, { status: 201 });
}

// Bulk sync from the kanban: update status (or delete) of all tour dates of a lead
export async function PATCH(request: NextRequest) {
  const { authorized, supabase } = await verifyAdmin();
  if (!authorized) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const { lead_id, status, action } = body;

  if (!lead_id) {
    return NextResponse.json({ error: 'lead_id é obrigatório.' }, { status: 400 });
  }

  if (action === 'delete') {
    const { error } = await supabase.from('tour_dates').delete().eq('lead_id', lead_id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  if (!VALID_STATUSES.includes(status)) {
    return NextResponse.json({ error: 'Status inválido.' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('tour_dates')
    .update({ status })
    .eq('lead_id', lead_id)
    .select(TOUR_DATE_SELECT);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ tourDates: data ?? [] });
}

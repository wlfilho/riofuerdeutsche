import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

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

export async function POST(request: NextRequest) {
  const { authorized, supabase } = await verifyAdmin();
  if (!authorized) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const { name, email, phone, pax, source, notes, claude_chat_url } = body;

  if (!name || !email) {
    return NextResponse.json({ error: 'name e email são obrigatórios.' }, { status: 400 });
  }

  const validSources = ['calculator', 'email', 'whatsapp', 'instagram', 'referral', 'other'];
  if (!validSources.includes(source)) {
    return NextResponse.json({ error: 'source inválido.' }, { status: 400 });
  }

  // Upsert contact first (email is the unique key)
  const { data: contact, error: contactError } = await supabase
    .from('contacts')
    .upsert(
      { email: email.trim(), name: name.trim(), phone: phone?.trim() ?? null, source },
      { onConflict: 'email' }
    )
    .select('id')
    .single();

  if (contactError) return NextResponse.json({ error: contactError.message }, { status: 500 });

  const { data: lead, error } = await supabase
    .from('price_leads')
    .insert({
      name: name.trim(),
      email: email.trim(),
      phone: phone ?? null,
      pax: pax ?? 1,
      source,
      status: 'new',
      notes: notes ?? null,
      claude_chat_url: claude_chat_url ?? null,
      contact_id: contact.id,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ lead }, { status: 201 });
}

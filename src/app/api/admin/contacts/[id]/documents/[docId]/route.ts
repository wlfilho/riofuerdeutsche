import { createClient } from '@/utils/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseAdmin = createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

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

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; docId: string }> }
) {
  if (!(await verifyAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id, docId } = await params;
  const { label, notes } = await req.json();

  const { data, error } = await supabaseAdmin
    .from('contact_documents')
    .update({ label: label ?? '', notes: notes || null })
    .eq('id', docId)
    .eq('contact_id', id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; docId: string }> }
) {
  if (!(await verifyAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id, docId } = await params;

  const { data: doc, error: fetchError } = await supabaseAdmin
    .from('contact_documents')
    .select('storage_path')
    .eq('id', docId)
    .eq('contact_id', id)
    .single();

  if (fetchError || !doc) return NextResponse.json({ error: 'Não encontrado' }, { status: 404 });

  await supabaseAdmin.storage.from('contact-documents').remove([doc.storage_path]);

  const { error } = await supabaseAdmin
    .from('contact_documents')
    .delete()
    .eq('id', docId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}

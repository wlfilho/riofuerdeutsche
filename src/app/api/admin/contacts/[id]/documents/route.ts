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

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await verifyAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;

  const { data, error } = await supabaseAdmin
    .from('contact_documents')
    .select('id, file_name, storage_path, label, notes, uploaded_at')
    .eq('contact_id', id)
    .order('uploaded_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Generate signed URLs (1 hour)
  const docs = await Promise.all(
    (data ?? []).map(async (doc) => {
      const { data: signed } = await supabaseAdmin.storage
        .from('contact-documents')
        .createSignedUrl(doc.storage_path, 3600);
      return { ...doc, signed_url: signed?.signedUrl ?? null };
    })
  );

  return NextResponse.json(docs);
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await verifyAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;

  const formData = await req.formData();
  const file = formData.get('file') as File | null;
  const label = (formData.get('label') as string | null) ?? '';
  const notes = (formData.get('notes') as string | null) ?? null;

  if (!file) return NextResponse.json({ error: 'Nenhum arquivo enviado' }, { status: 400 });
  if (file.type !== 'application/pdf') return NextResponse.json({ error: 'Apenas PDFs são aceitos' }, { status: 400 });
  if (file.size > 20 * 1024 * 1024) return NextResponse.json({ error: 'Arquivo muito grande (máx 20 MB)' }, { status: 400 });

  const ext = '.pdf';
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const storagePath = `${id}/${Date.now()}_${safeName}${safeName.endsWith(ext) ? '' : ext}`;

  const bytes = await file.arrayBuffer();
  const { error: uploadError } = await supabaseAdmin.storage
    .from('contact-documents')
    .upload(storagePath, bytes, { contentType: 'application/pdf', upsert: false });

  if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 500 });

  const { data: doc, error: dbError } = await supabaseAdmin
    .from('contact_documents')
    .insert({ contact_id: id, file_name: file.name, storage_path: storagePath, label, notes: notes || null })
    .select()
    .single();

  if (dbError) {
    await supabaseAdmin.storage.from('contact-documents').remove([storagePath]);
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  const { data: signed } = await supabaseAdmin.storage
    .from('contact-documents')
    .createSignedUrl(storagePath, 3600);

  return NextResponse.json({ ...doc, signed_url: signed?.signedUrl ?? null }, { status: 201 });
}

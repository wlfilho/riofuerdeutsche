import { createClient } from '@/utils/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseAdmin = createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function verifyAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { authorized: false };

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  return { authorized: profile?.role === 'admin' };
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { authorized } = await verifyAdmin();
  if (!authorized) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const action = body?.action;

  if (action !== 'approve' && action !== 'reject') {
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  }

  const updateData: Record<string, unknown> = {};
  if (action === 'approve') {
    updateData.status = 'approved';
    updateData.approved_at = new Date().toISOString();
    if (Array.isArray(body?.attractions)) {
      updateData.attractions = body.attractions;
    }
  }

  if (action === 'reject') {
    updateData.status = 'rejected';
  }

  const { data: review, error } = await supabaseAdmin
    .from('reviews')
    .update(updateData)
    .eq('id', id)
    .select('id, status, approved_at, attractions')
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ review });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { authorized } = await verifyAdmin();
  if (!authorized) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json().catch(() => ({}));

  const photoUrls = Array.isArray(body?.photoUrls)
    ? body.photoUrls.filter((url: unknown): url is string => typeof url === 'string')
    : [];
  const willPhotoUrls = Array.isArray(body?.willPhotoUrls)
    ? body.willPhotoUrls.filter((url: unknown): url is string => typeof url === 'string')
    : [];

  const paths = [...photoUrls, ...willPhotoUrls]
    .map((url) => url.split('/review-photos/')[1])
    .filter(Boolean);

  if (paths.length > 0) {
    await supabaseAdmin.storage.from('review-photos').remove(paths);
  }

  const { error } = await supabaseAdmin.from('reviews').delete().eq('id', id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

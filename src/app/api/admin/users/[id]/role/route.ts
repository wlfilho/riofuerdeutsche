import { createClient } from '@/utils/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseAdmin = createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const { data: adminProfile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (adminProfile?.role !== 'admin') {
    return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
  }

  const { id: targetUserId } = await params;
  const body = await request.json();
  const { role, premium_until, guide_edition } = body;

  if (!['user', 'premium', 'admin'].includes(role)) {
    return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
  }

  if (targetUserId === user.id && role !== 'admin') {
    return NextResponse.json(
      { error: 'Du kannst deinen eigenen Admin-Status nicht entfernen.' },
      { status: 400 }
    );
  }

  const updateData: Record<string, unknown> = { role };

  if (role === 'premium') {
    updateData.premium_since = new Date().toISOString();
    updateData.premium_until = premium_until || null;
    updateData.guide_edition = guide_edition || 1;
  } else if (role === 'user') {
    updateData.premium_since = null;
    updateData.premium_until = null;
    updateData.guide_edition = null;
    updateData.payment_id = null;
  }

  const { error } = await supabaseAdmin
    .from('profiles')
    .update(updateData)
    .eq('id', targetUserId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

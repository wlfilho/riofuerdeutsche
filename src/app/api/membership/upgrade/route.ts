// src/app/api/membership/upgrade/route.ts
import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

// Usar service_role key (NÃO a anon key) para operações admin
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, edition, paymentId, secret } = body;

    // Verificação de segurança simples
    // Em produção, usar webhook do Stripe/PayPal em vez disso
    if (secret !== process.env.MEMBERSHIP_UPGRADE_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    // Chamar a function do Supabase para upgrade
    const { error } = await supabaseAdmin.rpc('upgrade_to_premium', {
      target_user_id: userId,
      edition: edition || 1,
      p_payment_id: paymentId || null,
    });

    if (error) {
      console.error('Upgrade error:', error);
      return NextResponse.json(
        { error: 'Failed to upgrade' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Upgrade error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

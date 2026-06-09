import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

// service_role: o acesso direto do anon à tabela nps_responses foi removido.
// Esta rota valida o token no servidor e só toca a linha correspondente.
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// GET /api/nps?token=... — valida o token e devolve dados de exibição.
export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token')
  if (!token) {
    return NextResponse.json({ valid: false }, { status: 400 })
  }

  const { data, error } = await supabaseAdmin
    .from('nps_responses')
    .select('nickname, tour_date, used_at')
    .eq('token', token)
    .single()

  if (error || !data || data.used_at) {
    return NextResponse.json({ valid: false })
  }

  return NextResponse.json({
    valid: true,
    nickname: data.nickname,
    tour_date: data.tour_date,
  })
}

// POST /api/nps — submete o feedback (fluxo por token OU fluxo QR sem token).
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null)
  if (!body) {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
  }

  const { token, nickname, score, best_part, improvement, redirected_to_review } = body

  // Validação básica server-side
  if (typeof score !== 'number' || score < 0 || score > 10) {
    return NextResponse.json({ error: 'score inválido' }, { status: 400 })
  }
  if (typeof best_part !== 'string' || best_part.trim().length === 0) {
    return NextResponse.json({ error: 'best_part obrigatório' }, { status: 400 })
  }

  const payload = {
    score,
    best_part: String(best_part).trim().slice(0, 2000),
    improvement: improvement ? String(improvement).trim().slice(0, 2000) : null,
    used_at: new Date().toISOString(),
    redirected_to_review: !!redirected_to_review,
  }

  if (token) {
    // Fluxo por token: atualiza a linha existente, desde que ainda não usada.
    const { data: existing, error: fetchError } = await supabaseAdmin
      .from('nps_responses')
      .select('id, used_at')
      .eq('token', token)
      .single()

    if (fetchError || !existing) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 404 })
    }
    if (existing.used_at) {
      return NextResponse.json({ error: 'Token já utilizado' }, { status: 409 })
    }

    const { error } = await supabaseAdmin
      .from('nps_responses')
      .update(payload)
      .eq('id', existing.id)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  }

  // Fluxo QR (sem token): exige nickname e cria uma nova linha.
  if (typeof nickname !== 'string' || nickname.trim().length === 0) {
    return NextResponse.json({ error: 'nickname obrigatório' }, { status: 400 })
  }

  const { error } = await supabaseAdmin.from('nps_responses').insert({
    token: `qr-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    nickname: nickname.trim().slice(0, 120),
    tour_date: null,
    ...payload,
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}

import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const { email, source, procedure } = await req.json()

  if (!email) return NextResponse.json({ error: 'Missing email' }, { status: 400 })

  const db = getSupabaseAdmin()

  await db.from('nurture_contacts').upsert(
    { email, source_stage: source ?? 'unknown', procedure_interest: procedure ?? null },
    { onConflict: 'email' }
  )

  return NextResponse.json({ ok: true })
}

import { NextRequest, NextResponse } from 'next/server'
import { checkVerification } from '@/lib/twilio/client'
import { getSupabaseAdmin } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const { leadId, code } = await req.json()

  if (!leadId || !code) {
    return NextResponse.json({ error: 'Missing leadId or code' }, { status: 400 })
  }

  const db = getSupabaseAdmin()

  // Get phone for this lead
  const { data: lead } = await db
    .from('leads')
    .select('phone')
    .eq('id', leadId)
    .single()

  if (!lead?.phone) {
    return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
  }

  const verified = await checkVerification(lead.phone, code)

  if (verified) {
    await db
      .from('leads')
      .update({ sms_code_verified: true })
      .eq('id', leadId)

    // Schedule outbound confirmation SMS (10 min delay via Twilio Functions / cron)
    // For now: send immediately
    await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/sms/send`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ leadId, phone: lead.phone, type: 'confirmation' }),
    })
  }

  return NextResponse.json({ verified })
}

import { NextRequest, NextResponse } from 'next/server'
import { startVerification, sendSms } from '@/lib/twilio/client'
import { getSupabaseAdmin } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const { leadId, phone, type } = await req.json()

  if (!phone) {
    return NextResponse.json({ error: 'Missing phone' }, { status: 400 })
  }

  try {
    if (type === 'confirmation') {
      // Outbound confirmation SMS (YES/STOP gate)
      const db = getSupabaseAdmin()
      const { data: lead } = await db
        .from('leads')
        .select('first_name, procedure')
        .eq('id', leadId)
        .single()

      const firstName = lead?.first_name ?? 'there'
      const procedure = lead?.procedure?.replace(/_/g, ' ') ?? 'procedure'
      const agency    = process.env.NEXT_PUBLIC_AGENCY_NAME ?? '[AGENCY_NAME_PLACEHOLDER]'

      await sendSms(
        phone,
        `Hi ${firstName}, this is ${agency}. We've matched you with a specialist for your ${procedure} consultation.\n\nReply YES to confirm you'd like them to call within 24 hours, or STOP to opt out. No charge to you — ever.`
      )
    } else {
      // OTP verification
      await startVerification(phone)
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('SMS send error', err)
    return NextResponse.json({ error: 'Failed to send SMS' }, { status: 500 })
  }
}

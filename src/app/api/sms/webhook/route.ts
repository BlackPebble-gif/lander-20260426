import { NextRequest, NextResponse } from 'next/server'
import { validateTwilioSignature, sendSms } from '@/lib/twilio/client'
import { getSupabaseAdmin } from '@/lib/supabase/server'

const YES_PATTERN  = /^(yes|y|yep|confirm|ok|okay|sure)$/i
const STOP_PATTERN = /^(stop|no|unsubscribe|cancel|quit|end)$/i

export async function POST(req: NextRequest) {
  // Validate Twilio signature
  const signature = req.headers.get('x-twilio-signature') ?? ''
  const url       = `${process.env.NEXT_PUBLIC_APP_URL}/api/sms/webhook`
  const rawBody   = await req.text()
  const params    = Object.fromEntries(new URLSearchParams(rawBody))

  if (!validateTwilioSignature(signature, url, params)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const from = params['From']  ?? ''
  const body = (params['Body'] ?? '').trim()

  const db = getSupabaseAdmin()

  // Find the most recent unconfirmed lead with this phone
  const { data: lead } = await db
    .from('leads')
    .select('id, first_name, procedure, tier, matched_surgeon_id, sms_response_confirmed')
    .eq('phone', from)
    .eq('sms_code_verified', true)
    .eq('sms_response_confirmed', false)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (!lead) {
    // Unknown sender — do nothing
    return new NextResponse('<?xml version="1.0"?><Response></Response>', {
      headers: { 'Content-Type': 'text/xml' },
    })
  }

  const firstName = lead.first_name ?? 'there'
  const procedure = (lead.procedure ?? 'procedure').replace(/_/g, ' ')

  if (YES_PATTERN.test(body)) {
    // Mark lead confirmed
    await db
      .from('leads')
      .update({ sms_response_confirmed: true, sms_response_at: new Date().toISOString() })
      .eq('id', lead.id)

    // Deliver lead to surgeon if tier qualifies
    if (lead.tier !== 'Reject') {
      await deliverLeadToSurgeon(lead.id, db)
    }

    const clinicNumber = process.env.TWILIO_FROM_NUMBER ?? '[CLINIC_NUMBER]'
    await sendSms(
      from,
      `Thanks ${firstName} — your matched specialist will call within 24 hours. Their number will show as ${clinicNumber}.`
    )
  } else if (STOP_PATTERN.test(body)) {
    // Suppress lead
    await db
      .from('leads')
      .update({ refunded: true })
      .eq('id', lead.id)

    await sendSms(from, "You're opted out. We won't contact you again.")
  } else {
    // Unrecognised — count attempts
    const { count } = await db
      .from('sms_attempts')
      .select('id', { count: 'exact', head: true })
      .eq('lead_id', lead.id)

    await db.from('sms_attempts').insert({ lead_id: lead.id, body })

    if ((count ?? 0) >= 2) {
      // 3rd unrecognised — timeout
      await db.from('leads').update({ refunded: true }).eq('id', lead.id)
    } else {
      await sendSms(from, 'Please reply YES to confirm, or STOP to opt out.')
    }
  }

  return new NextResponse('<?xml version="1.0"?><Response></Response>', {
    headers: { 'Content-Type': 'text/xml' },
  })
}

async function deliverLeadToSurgeon(
  leadId: string,
  db: ReturnType<typeof import('@/lib/supabase/server').getSupabaseAdmin>
) {
  // Match surgeon
  const matchRes = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/surgeon/match`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ leadId }),
  })
  return matchRes.ok
}

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { verifyRecaptcha } from '@/lib/fraud/recaptcha'
import { checkIpqs, isIpqsFraud } from '@/lib/fraud/ipqs'
import { verifyEmail } from '@/lib/fraud/neverbounce'
import { getTwilioClient } from '@/lib/twilio/client'
import { getSupabaseAdmin } from '@/lib/supabase/server'
import { computeIntentScore } from '@/lib/scoring/engine'

const RECAPTCHA_THRESHOLD = 0.5
const MAX_ATTEMPTS_PER_PHONE = 3

const submitSchema = z.object({
  firstName:       z.string().min(1),
  email:           z.string().email(),
  phone:           z.string().min(8),
  recaptchaToken:  z.string().optional(),
  // Funnel state
  category:        z.string().nullable().optional(),
  procedure:       z.string().nullable().optional(),
  specificGoal:    z.string().nullable().optional(),
  priorities:      z.array(z.string()).optional(),
  ageBracket:      z.string().nullable().optional(),
  journeyStage:    z.string().nullable().optional(),
  surgeonInMind:   z.any().optional(),
  stoppers:        z.array(z.string()).optional(),
  fundingFlags:    z.array(z.string()).optional(),
  timeline:        z.string().nullable().optional(),
  budget:          z.number().optional(),
  location:        z.string().optional(),
  travelWillingness: z.string().nullable().optional(),
})

export async function POST(req: NextRequest) {
  const ip  = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  const body = await req.json()
  const parsed = submitSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  }

  const data      = parsed.data
  const db        = getSupabaseAdmin()
  const fraudFlags: string[] = []

  // ── Parallel fraud checks ──────────────────────────────────────────
  const [recaptchaResult, ipqsResult, emailResult] = await Promise.allSettled([
    data.recaptchaToken ? verifyRecaptcha(data.recaptchaToken) : Promise.resolve(null),
    checkIpqs(ip),
    verifyEmail(data.email),
  ])

  // reCAPTCHA
  const rcResult = recaptchaResult.status === 'fulfilled' ? recaptchaResult.value : null
  if (rcResult && rcResult.score < RECAPTCHA_THRESHOLD) {
    fraudFlags.push('recaptcha_low_score')
  }

  // IPQS
  const ipqs = ipqsResult.status === 'fulfilled' ? ipqsResult.value : null
  if (isIpqsFraud(ipqs)) {
    fraudFlags.push('ipqs_fraud')
    return NextResponse.json({ blocked: true, reason: 'ipqs' })
  }

  // NeverBounce
  const emailStatus = emailResult.status === 'fulfilled' ? emailResult.value : 'unknown'
  if (emailStatus === 'invalid' || emailStatus === 'disposable') {
    fraudFlags.push(`email_${emailStatus}`)
    return NextResponse.json({ blocked: true, reason: 'email_invalid' })
  }

  // Twilio Lookup — VoIP / disconnected check
  try {
    const twilio = getTwilioClient()
    const lookup = await twilio.lookups.v2.phoneNumbers(data.phone).fetch({
      fields: ['line_type_intelligence'],
    })
    const lineType = (lookup as Record<string, unknown>).lineTypeIntelligence as Record<string, string> | null
    if (lineType?.type === 'voip' || lineType?.type === 'non-fixed-voip') {
      fraudFlags.push('voip_number')
      return NextResponse.json({ blocked: true, reason: 'voip' })
    }
  } catch {
    // Non-fatal — Twilio Lookup is best-effort
  }

  // Rate limit: max attempts per phone
  const { count } = await db
    .from('leads')
    .select('id', { count: 'exact', head: true })
    .eq('phone', data.phone)

  if ((count ?? 0) >= MAX_ATTEMPTS_PER_PHONE) {
    fraudFlags.push('phone_rate_limit')
    return NextResponse.json({ blocked: true, reason: 'rate_limit' })
  }

  // ── Intent scoring ─────────────────────────────────────────────────
  const { score, tier } = computeIntentScore({
    journeyStage:     data.journeyStage as never,
    timeline:         data.timeline as never,
    stoppers:         data.stoppers ?? [],
    priorities:       data.priorities ?? [],
    budget:           data.budget ?? 0,
    procedure:        data.procedure ?? null,
    travelWillingness:data.travelWillingness as never,
    fundingFlags:     data.fundingFlags ?? [],
  })

  // ── Insert lead ────────────────────────────────────────────────────
  const { data: lead, error } = await db
    .from('leads')
    .insert({
      category:          data.category,
      procedure:         data.procedure,
      specific_goal:     data.specificGoal,
      priorities:        data.priorities ?? [],
      age_bracket:       data.ageBracket,
      journey_stage:     data.journeyStage,
      surgeon_in_mind:   data.surgeonInMind,
      stoppers:          data.stoppers ?? [],
      funding_flags:     data.fundingFlags ?? [],
      timeline:          data.timeline,
      budget:            data.budget ?? 0,
      location:          data.location ?? '',
      travel_willingness:data.travelWillingness,
      first_name:        data.firstName,
      email:             data.email,
      phone:             data.phone,
      intent_score:      score,
      tier,
      fraud_flags:       fraudFlags,
    })
    .select('id')
    .single()

  if (error || !lead) {
    console.error('Lead insert error', error)
    return NextResponse.json({ error: 'Failed to save lead' }, { status: 500 })
  }

  return NextResponse.json({ leadId: lead.id, score, tier })
}

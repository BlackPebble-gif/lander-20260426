import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const { leadId } = await req.json()
  if (!leadId) return NextResponse.json({ error: 'Missing leadId' }, { status: 400 })

  const db = getSupabaseAdmin()

  const { data: lead } = await db
    .from('leads')
    .select('procedure, location, tier')
    .eq('id', leadId)
    .single()

  if (!lead) return NextResponse.json({ error: 'Lead not found' }, { status: 404 })

  // Find first available surgeon who covers this procedure and location
  const { data: surgeons } = await db
    .from('surgeons')
    .select('id, clinic_name, exclusivity_postcodes, procedures, accepting_leads, crm_webhook_url, ppl_rate_platinum, ppl_rate_gold, ppl_rate_silver')
    .eq('accepting_leads', true)
    .contains('procedures', [lead.procedure])

  const matched = surgeons?.find((s) =>
    s.exclusivity_postcodes?.some((pc: string) => lead.location?.includes(pc))
  ) ?? surgeons?.[0] // fallback to first available if no exclusive zone match

  if (!matched) {
    await db.from('leads').update({ matched_surgeon_id: null }).eq('id', leadId)
    return NextResponse.json({ matched: false })
  }

  const tierKey = `ppl_rate_${lead.tier?.toLowerCase()}` as keyof typeof matched
  const pplAmount = matched[tierKey] as number ?? 0

  await db
    .from('leads')
    .update({
      matched_surgeon_id: matched.id,
      delivered_at:       new Date().toISOString(),
      ppl_amount:         pplAmount,
    })
    .eq('id', leadId)

  // Deliver to surgeon CRM webhook
  if (matched.crm_webhook_url) {
    const { data: fullLead } = await db.from('leads').select('*').eq('id', leadId).single()
    try {
      await fetch(matched.crm_webhook_url, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ lead: fullLead, surgeon_id: matched.id }),
      })
    } catch (err) {
      console.error('CRM webhook delivery failed', err)
    }
  }

  return NextResponse.json({ matched: true, surgeonId: matched.id, clinic: matched.clinic_name })
}

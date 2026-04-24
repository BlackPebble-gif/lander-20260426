import { notFound } from 'next/navigation'
import { getSupabaseAdmin } from '@/lib/supabase/server'
import { ScoreBadge } from '@/components/admin/ScoreBadge'
import type { Lead } from '@/types/lead'

export default async function LeadDetailPage({ params }: { params: { id: string } }) {
  const db = getSupabaseAdmin()
  const { data: lead } = await db.from('leads').select('*').eq('id', params.id).single()
  if (!lead) notFound()

  const l = lead as Lead

  function Field({ label, value }: { label: string; value: unknown }) {
    const display = value === null || value === undefined || value === '' ? '—'
      : typeof value === 'object' ? JSON.stringify(value, null, 2)
      : String(value)
    return (
      <div className="flex gap-4 py-2 text-sm">
        <span className="w-40 shrink-0 text-primary-text/40">{label}</span>
        <span className="font-medium text-primary-text break-all">{display}</span>
      </div>
    )
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-4">
        <h1 className="font-serif text-2xl font-semibold text-primary-text">
          {l.first_name}
        </h1>
        {l.tier && <ScoreBadge tier={l.tier} score={l.intent_score} />}
      </div>

      <div className="rounded-xl border border-border bg-white divide-y divide-border px-4">
        <Field label="Created"      value={new Date(l.created_at).toLocaleString('en-AU')} />
        <Field label="Procedure"    value={l.procedure?.replace(/_/g, ' ')} />
        <Field label="Category"     value={l.category} />
        <Field label="Goal"         value={l.specific_goal} />
        <Field label="Journey"      value={l.journey_stage} />
        <Field label="Timeline"     value={l.timeline} />
        <Field label="Budget"       value={l.budget ? `$${l.budget.toLocaleString('en-AU')}` : null} />
        <Field label="Location"     value={l.location} />
        <Field label="Travel"       value={l.travel_willingness} />
        <Field label="Age bracket"  value={l.age_bracket} />
        <Field label="Priorities"   value={l.priorities} />
        <Field label="Stoppers"     value={l.stoppers} />
        <Field label="Funding"      value={l.funding_flags} />
        <Field label="Email"        value={l.email} />
        <Field label="Phone"        value={l.phone} />
        <Field label="OTP verified" value={l.sms_code_verified ? 'Yes' : 'No'} />
        <Field label="YES received" value={l.sms_response_confirmed ? 'Yes' : 'No'} />
        <Field label="Delivered at" value={l.delivered_at} />
        <Field label="PPL amount"   value={l.ppl_amount ? `$${l.ppl_amount}` : null} />
        <Field label="Fraud flags"  value={l.fraud_flags} />
        <Field label="Refunded"     value={l.refunded ? 'Yes' : 'No'} />
      </div>

      <a href="/admin/leads" className="text-sm text-accent underline-offset-4 hover:underline">
        ← Back to leads
      </a>
    </div>
  )
}

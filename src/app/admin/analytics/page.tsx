import { getSupabaseAdmin } from '@/lib/supabase/server'

export const revalidate = 300

const STAGE_LABELS: Record<number, string> = {
  1:  'Category',
  2:  'Procedure',
  3:  'Goal',
  4:  'Priorities',
  5:  'Age',
  6:  'Journey',
  7:  'Stoppers',
  8:  'Timeline',
  9:  'Funding',
  10: 'Budget',
  11: 'Location',
  12: 'Summary',
  13: 'Contact',
}

export default async function AnalyticsPage() {
  const db = getSupabaseAdmin()

  const { data: leads } = await db
    .from('leads')
    .select('intent_score, tier, created_at, sms_response_confirmed, delivered_at')
    .order('created_at', { ascending: false })
    .limit(1000)

  const total = leads?.length ?? 0

  // Tier distribution
  const tiers: Record<string, number> = { Platinum: 0, Gold: 0, Silver: 0, Reject: 0 }
  let confirmed = 0
  let delivered = 0

  for (const l of leads ?? []) {
    if (l.tier in tiers) tiers[l.tier]++
    if (l.sms_response_confirmed) confirmed++
    if (l.delivered_at) delivered++
  }

  // Leads by day (last 14 days)
  const byDay: Record<string, number> = {}
  for (const l of leads ?? []) {
    const day = l.created_at.slice(0, 10)
    byDay[day] = (byDay[day] ?? 0) + 1
  }
  const recentDays = Object.entries(byDay)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-14)

  const maxDay = Math.max(...recentDays.map(([, v]) => v), 1)

  return (
    <div className="max-w-2xl space-y-8">
      <h1 className="font-serif text-2xl font-semibold text-primary-text">Analytics</h1>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total leads', value: total },
          { label: 'Confirmed (YES)', value: confirmed },
          { label: 'Delivered', value: delivered },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-xl border border-border bg-white p-4">
            <p className="text-xs text-primary-text/40">{label}</p>
            <p className="mt-1 font-serif text-3xl font-semibold text-primary-text">{value}</p>
          </div>
        ))}
      </div>

      <div>
        <h2 className="mb-3 font-medium text-primary-text">Tier distribution</h2>
        <div className="space-y-2">
          {Object.entries(tiers).map(([tier, count]) => (
            <div key={tier} className="flex items-center gap-3">
              <span className="w-20 text-sm text-primary-text/60">{tier}</span>
              <div className="flex-1 rounded-full bg-border h-3 overflow-hidden">
                <div
                  className="h-full rounded-full bg-accent"
                  style={{ width: `${total > 0 ? (count / total) * 100 : 0}%` }}
                />
              </div>
              <span className="text-sm text-primary-text">{count}</span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="mb-3 font-medium text-primary-text">Leads per day (last 14 days)</h2>
        <div className="flex items-end gap-1 h-24">
          {recentDays.map(([day, count]) => (
            <div key={day} className="flex flex-1 flex-col items-center gap-1">
              <div
                className="w-full rounded-sm bg-accent/60"
                style={{ height: `${(count / maxDay) * 100}%`, minHeight: '2px' }}
                title={`${day}: ${count}`}
              />
              <span className="text-[9px] text-primary-text/30 rotate-45 origin-top-left">{day.slice(5)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

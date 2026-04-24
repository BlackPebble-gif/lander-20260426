import { getSupabaseAdmin } from '@/lib/supabase/server'

export const revalidate = 60

async function getStats() {
  const db = getSupabaseAdmin()

  const [allLeads, delivered, confirmed, tierCounts] = await Promise.all([
    db.from('leads').select('id', { count: 'exact', head: true }),
    db.from('leads').select('id', { count: 'exact', head: true }).not('delivered_at', 'is', null),
    db.from('leads').select('id', { count: 'exact', head: true }).eq('sms_response_confirmed', true),
    db.from('leads').select('tier'),
  ])

  const tiers = { Platinum: 0, Gold: 0, Silver: 0, Reject: 0 }
  for (const row of tierCounts.data ?? []) {
    if (row.tier in tiers) tiers[row.tier as keyof typeof tiers]++
  }

  return {
    total:      allLeads.count ?? 0,
    delivered:  delivered.count ?? 0,
    confirmed:  confirmed.count ?? 0,
    tiers,
  }
}

function StatCard({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-xl border border-border bg-white p-5">
      <p className="text-xs text-primary-text/40">{label}</p>
      <p className="mt-1 font-serif text-3xl font-semibold text-primary-text">{value}</p>
    </div>
  )
}

export default async function AdminDashboard() {
  const stats = await getStats()

  return (
    <div className="space-y-6">
      <h1 className="font-serif text-2xl font-semibold text-primary-text">Dashboard</h1>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="Total leads"      value={stats.total} />
        <StatCard label="Confirmed (YES)"  value={stats.confirmed} />
        <StatCard label="Delivered"        value={stats.delivered} />
        <StatCard label="Conversion rate"  value={stats.total > 0 ? `${Math.round((stats.confirmed / stats.total) * 100)}%` : '—'} />
      </div>

      <div>
        <h2 className="mb-3 font-medium text-primary-text">By tier</h2>
        <div className="grid grid-cols-4 gap-3">
          {Object.entries(stats.tiers).map(([tier, count]) => (
            <div key={tier} className="rounded-lg border border-border bg-white p-4 text-center">
              <p className="text-xs text-primary-text/40">{tier}</p>
              <p className="font-serif text-2xl font-semibold text-primary-text">{count}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-3">
        <a href="/admin/leads"     className="rounded-lg border border-border bg-white px-4 py-2 text-sm font-medium text-primary-text hover:bg-[#F0EDE6]">View all leads →</a>
        <a href="/admin/analytics" className="rounded-lg border border-border bg-white px-4 py-2 text-sm font-medium text-primary-text hover:bg-[#F0EDE6]">Analytics →</a>
      </div>
    </div>
  )
}

import { getSupabaseAdmin } from '@/lib/supabase/server'
import { LeadTable } from '@/components/admin/LeadTable'
import type { Lead } from '@/types/lead'

export const revalidate = 30

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: { tier?: string; page?: string }
}) {
  const db   = getSupabaseAdmin()
  const page = Number(searchParams.page ?? 1)
  const tier = searchParams.tier
  const per  = 50

  let query = db
    .from('leads')
    .select('*')
    .order('created_at', { ascending: false })
    .range((page - 1) * per, page * per - 1)

  if (tier) query = query.eq('tier', tier)

  const { data: leads } = await query

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-2xl font-semibold text-primary-text">Leads</h1>
        <div className="flex gap-2">
          {['', 'Platinum', 'Gold', 'Silver', 'Reject'].map((t) => (
            <a
              key={t || 'all'}
              href={t ? `/admin/leads?tier=${t}` : '/admin/leads'}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                (tier ?? '') === t
                  ? 'border-accent bg-accent text-white'
                  : 'border-border bg-white text-primary-text hover:border-accent/50'
              }`}
            >
              {t || 'All'}
            </a>
          ))}
        </div>
      </div>

      <LeadTable leads={(leads ?? []) as Lead[]} />

      {(leads?.length ?? 0) === per && (
        <a
          href={`/admin/leads?${tier ? `tier=${tier}&` : ''}page=${page + 1}`}
          className="block text-center text-sm text-accent underline-offset-4 hover:underline"
        >
          Next page →
        </a>
      )}
    </div>
  )
}

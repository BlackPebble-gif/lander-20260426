import { cn } from '@/lib/utils'
import type { LeadTier } from '@/types/lead'

const TIER_STYLES: Record<LeadTier, string> = {
  Platinum: 'bg-purple-100 text-purple-800',
  Gold:     'bg-yellow-100 text-yellow-800',
  Silver:   'bg-gray-100 text-gray-700',
  Reject:   'bg-red-100 text-red-700',
}

export function ScoreBadge({ tier, score }: { tier: LeadTier; score: number }) {
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium', TIER_STYLES[tier])}>
      {tier}
      <span className="opacity-70">({score})</span>
    </span>
  )
}

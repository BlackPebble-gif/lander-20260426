import { getProcedureFloor } from '@/constants/procedures'
import {
  JOURNEY_SCORES,
  TIMELINE_SCORES,
  STOPPER_SCORES,
  TRAVEL_SCORES,
  TIER_THRESHOLDS,
  SERIOUS_PRIORITY_SIGNALS,
  PRICE_PRIORITY_SIGNALS,
} from '@/constants/scoring'
import type { FunnelState } from '@/store/funnelStore'
import type { LeadTier } from '@/types/lead'

export interface ScoreBreakdown {
  journeyStage: number
  timeline: number
  stoppers: number
  priorities: number
  budget: number
  travel: number
  funding: number
  total: number
}

export interface ScoredResult {
  score: number
  tier: LeadTier
  breakdown: ScoreBreakdown
}

type ScoringInput = Pick<
  FunnelState,
  | 'journeyStage'
  | 'timeline'
  | 'stoppers'
  | 'priorities'
  | 'budget'
  | 'procedure'
  | 'travelWillingness'
  | 'fundingFlags'
>

export function computeIntentScore(state: ScoringInput): ScoredResult {
  const breakdown: ScoreBreakdown = {
    journeyStage: 0,
    timeline:     0,
    stoppers:     0,
    priorities:   0,
    budget:       0,
    travel:       0,
    funding:      0,
    total:        0,
  }

  // Journey stage (max 25)
  breakdown.journeyStage = JOURNEY_SCORES[state.journeyStage ?? ''] ?? 0

  // Timeline (max 20)
  breakdown.timeline = TIMELINE_SCORES[state.timeline ?? ''] ?? 0

  // Honesty / stoppers (max 20)
  if (state.stoppers.includes('nothing_ready_now')) {
    breakdown.stoppers = STOPPER_SCORES.nothing_ready_now
  } else if (
    state.stoppers.includes('overwhelmed') ||
    state.stoppers.includes('dont_know_who_to_trust')
  ) {
    breakdown.stoppers = STOPPER_SCORES.overwhelmed
  } else if (state.stoppers.includes('fear_wrong_result')) {
    breakdown.stoppers = STOPPER_SCORES.fear_wrong_result
  } else if (state.stoppers.includes('cost') && state.stoppers.length === 1) {
    breakdown.stoppers = STOPPER_SCORES.cost_only
  } else {
    breakdown.stoppers = STOPPER_SCORES.default
  }

  // Priorities (max 15, min -5)
  const seriousCount = state.priorities.filter((p) => SERIOUS_PRIORITY_SIGNALS.includes(p)).length
  const priceCount   = state.priorities.filter((p) => PRICE_PRIORITY_SIGNALS.includes(p)).length
  breakdown.priorities = Math.min(seriousCount * 5, 15)
  if (priceCount === state.priorities.length && state.priorities.length > 0) {
    breakdown.priorities -= 5
  }

  // Budget vs procedure floor (max 10)
  const floors = getProcedureFloor(state.procedure)
  if (state.budget >= floors.premium)       breakdown.budget = 10
  else if (state.budget >= floors.standard) breakdown.budget = 7
  else if (state.budget >= floors.minimum)  breakdown.budget = 3

  // Travel (max 5)
  breakdown.travel = TRAVEL_SCORES[state.travelWillingness ?? ''] ?? 0

  // Funding (max 5, can be negative)
  const floors2 = getProcedureFloor(state.procedure) // same as above
  if (state.fundingFlags.includes('none') && state.budget >= floors2.standard) breakdown.funding += 5
  if (state.fundingFlags.includes('medically_related')) breakdown.funding += 3
  if (state.fundingFlags.includes('super_access'))      breakdown.funding -= 2

  const raw =
    breakdown.journeyStage +
    breakdown.timeline +
    breakdown.stoppers +
    breakdown.priorities +
    breakdown.budget +
    breakdown.travel +
    breakdown.funding

  breakdown.total = Math.max(0, Math.min(100, raw))

  return {
    score: breakdown.total,
    tier:  scoreToTier(breakdown.total),
    breakdown,
  }
}

export function scoreToTier(score: number): LeadTier {
  if (score >= TIER_THRESHOLDS.PLATINUM) return 'Platinum'
  if (score >= TIER_THRESHOLDS.GOLD)     return 'Gold'
  if (score >= TIER_THRESHOLDS.SILVER)   return 'Silver'
  return 'Reject'
}

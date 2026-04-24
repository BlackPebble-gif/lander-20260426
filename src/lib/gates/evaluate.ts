import { getProcedureFloor } from '@/constants/procedures'
import type { FunnelState } from '@/store/funnelStore'

export type FallbackRoute =
  | '/funnel/nurture'
  | '/funnel/waitlist'
  | '/funnel/finance'

export type GateResult =
  | { pass: true }
  | { pass: false; destination: FallbackRoute; reason: string }

export function evaluateTimelineGate(state: Pick<FunnelState, 'timeline'>): GateResult {
  if (state.timeline === 'exploring') {
    return { pass: false, destination: '/funnel/nurture', reason: 'timeline_exploring' }
  }
  return { pass: true }
}

export function evaluateBudgetGate(
  state: Pick<FunnelState, 'budget' | 'procedure' | 'priorities'>
): GateResult {
  const floors = getProcedureFloor(state.procedure)
  const hasPaymentPlan = state.priorities.includes('payment_plans')
  if (state.budget < floors.minimum && !hasPaymentPlan) {
    return { pass: false, destination: '/funnel/finance', reason: 'budget_below_minimum' }
  }
  return { pass: true }
}

export function evaluateLocationGate(
  state: Pick<FunnelState, 'travelWillingness'>,
  hasSurgeonInZone: boolean
): GateResult {
  if (!hasSurgeonInZone && state.travelWillingness === 'local') {
    return { pass: false, destination: '/funnel/waitlist', reason: 'no_surgeon_in_zone' }
  }
  return { pass: true }
}

// Called client-side before navigation — location gate uses stub (always pass) until DB is wired
export function evaluateGatesForStage(
  stage: number,
  state: FunnelState
): GateResult {
  switch (stage) {
    case 8:
      return evaluateTimelineGate(state)
    case 10:
      return evaluateBudgetGate(state)
    case 11:
      // Stub: location gate requires DB lookup — handled server-side
      return { pass: true }
    default:
      return { pass: true }
  }
}

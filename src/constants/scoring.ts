export const JOURNEY_SCORES: Record<string, number> = {
  multiple_consults: 25,
  had_consult:       22,
  have_surgeon:      18,
  researching:       10,
}

export const TIMELINE_SCORES: Record<string, number> = {
  asap:          20,
  '3_6_months':  15,
  '6_12_months':  8,
  exploring:      0,
}

export const STOPPER_SCORES = {
  nothing_ready_now:       20,
  overwhelmed:             15,
  dont_know_who_to_trust:  15,
  fear_wrong_result:       12,
  cost_only:                5,
  default:                 10,
}

export const TRAVEL_SCORES: Record<string, number> = {
  anywhere:    5,
  interstate:  4,
  local:       2,
  overseas:    1,
}

export const TIER_THRESHOLDS = {
  PLATINUM: 80,
  GOLD:     60,
  SILVER:   40,
}

export const SERIOUS_PRIORITY_SIGNALS = ['fracs', 'surgeon_experience', 'post_op_care']
export const PRICE_PRIORITY_SIGNALS   = ['cost_pricing', 'payment_plans']

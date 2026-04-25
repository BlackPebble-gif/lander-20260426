export type ProcedureCategory = 'breast' | 'face' | 'body' | 'unsure' | null
export type JourneyStage = 'researching' | 'had_consult' | 'have_surgeon' | 'multiple_consults' | null
export type Timeline = 'asap' | '3_6_months' | '6_12_months' | 'exploring' | null
export type TravelWillingness = 'local' | 'interstate' | 'anywhere' | 'overseas' | null
export type LeadTier = 'Platinum' | 'Gold' | 'Silver' | 'Reject'

export interface SurgeonInMind {
  name?: string
  reason?: string
}

export interface Lead {
  id: string
  created_at: string
  category: ProcedureCategory
  procedure: string | null
  specific_goal: string | null
  priorities: string[]
  age_bracket: string | null
  journey_stage: JourneyStage
  surgeon_in_mind: SurgeonInMind | null
  stoppers: string[]
  funding_flags: string[]
  timeline: Timeline
  budget: number
  location: string
  travel_willingness: TravelWillingness
  first_name: string
  email: string
  phone: string
  sms_code_verified: boolean
  sms_response_confirmed: boolean
  sms_response_at: string | null
  intent_score: number
  tier: LeadTier
  fraud_flags: string[]
  matched_surgeon_id: string | null
  delivered_at: string | null
  surgeon_paid: boolean
  ppl_amount: number | null
  replacement_requested: boolean
  replacement_reason: string | null
  refunded: boolean
}

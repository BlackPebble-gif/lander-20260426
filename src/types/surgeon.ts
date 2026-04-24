export interface Surgeon {
  id: string
  clinic_name: string
  surgeon_name: string
  exclusivity_postcodes: string[]
  procedures: string[]
  accepting_leads: boolean
  crm_webhook_url: string
  ppl_rate_platinum: number
  ppl_rate_gold: number
  ppl_rate_silver: number
}

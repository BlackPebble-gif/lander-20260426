'use client'

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type {
  ProcedureCategory,
  JourneyStage,
  Timeline,
  TravelWillingness,
  LeadTier,
  SurgeonInMind,
} from '@/types/lead'

export interface FunnelState {
  // Procedure path
  category: ProcedureCategory
  procedure: string | null
  specificGoal: string | null

  // Psychographic
  priorities: string[]
  ageBracket: string | null
  journeyStage: JourneyStage
  surgeonInMind: SurgeonInMind | null
  stoppers: string[]

  // Financial qualification
  fundingFlags: string[]
  timeline: Timeline
  budget: number

  // Geographic
  location: string
  travelWillingness: TravelWillingness

  // Contact
  firstName: string
  email: string
  phone: string

  // Verification state
  smsCodeSent: boolean
  smsCodeVerified: boolean
  smsResponseConfirmed: boolean

  // Silent scoring (computed at submit time, also updated live)
  intentScore: number
  fraudFlags: string[]
  startedAt: string | null
  completedStages: number[]

  // Post-submit
  leadId: string | null
  tier: LeadTier | null

  // Actions
  setCategory: (v: ProcedureCategory) => void
  setProcedure: (v: string) => void
  setSpecificGoal: (v: string) => void
  setPriorities: (v: string[]) => void
  setAgeBracket: (v: string) => void
  setJourneyStage: (v: JourneyStage) => void
  setSurgeonInMind: (v: SurgeonInMind | null) => void
  setStoppers: (v: string[]) => void
  setFundingFlags: (v: string[]) => void
  setTimeline: (v: Timeline) => void
  setBudget: (v: number) => void
  setLocation: (v: string) => void
  setTravelWillingness: (v: TravelWillingness) => void
  setFirstName: (v: string) => void
  setEmail: (v: string) => void
  setPhone: (v: string) => void
  setSmsCodeSent: (v: boolean) => void
  setSmsCodeVerified: (v: boolean) => void
  setSmsResponseConfirmed: (v: boolean) => void
  setIntentScore: (score: number) => void
  addFraudFlag: (flag: string) => void
  markStageComplete: (stage: number) => void
  setLeadId: (id: string) => void
  setTier: (tier: LeadTier) => void
  reset: () => void
}

const DEFAULT_STATE = {
  category: null as ProcedureCategory,
  procedure: null as string | null,
  specificGoal: null as string | null,
  priorities: [] as string[],
  ageBracket: null as string | null,
  journeyStage: null as JourneyStage,
  surgeonInMind: null as SurgeonInMind | null,
  stoppers: [] as string[],
  fundingFlags: [] as string[],
  timeline: null as Timeline,
  budget: 0,
  location: '',
  travelWillingness: null as TravelWillingness,
  firstName: '',
  email: '',
  phone: '',
  smsCodeSent: false,
  smsCodeVerified: false,
  smsResponseConfirmed: false,
  intentScore: 0,
  fraudFlags: [] as string[],
  startedAt: null as string | null,
  completedStages: [] as number[],
  leadId: null as string | null,
  tier: null as LeadTier | null,
}

export const useFunnelStore = create<FunnelState>()(
  persist(
    (set) => ({
      ...DEFAULT_STATE,

      setCategory: (v) => set({ category: v, startedAt: new Date().toISOString() }),
      setProcedure: (v) => set({ procedure: v }),
      setSpecificGoal: (v) => set({ specificGoal: v }),
      setPriorities: (v) => set({ priorities: v }),
      setAgeBracket: (v) => set({ ageBracket: v }),
      setJourneyStage: (v) => set({ journeyStage: v }),
      setSurgeonInMind: (v) => set({ surgeonInMind: v }),
      setStoppers: (v) => set({ stoppers: v }),
      setFundingFlags: (v) => set({ fundingFlags: v }),
      setTimeline: (v) => set({ timeline: v }),
      setBudget: (v) => set({ budget: v }),
      setLocation: (v) => set({ location: v }),
      setTravelWillingness: (v) => set({ travelWillingness: v }),
      setFirstName: (v) => set({ firstName: v }),
      setEmail: (v) => set({ email: v }),
      setPhone: (v) => set({ phone: v }),
      setSmsCodeSent: (v) => set({ smsCodeSent: v }),
      setSmsCodeVerified: (v) => set({ smsCodeVerified: v }),
      setSmsResponseConfirmed: (v) => set({ smsResponseConfirmed: v }),
      setIntentScore: (score) => set({ intentScore: score }),
      addFraudFlag: (flag) => set((s) => ({ fraudFlags: [...new Set([...s.fraudFlags, flag])] })),
      markStageComplete: (stage) =>
        set((s) => ({ completedStages: [...new Set([...s.completedStages, stage])] })),
      setLeadId: (id) => set({ leadId: id }),
      setTier: (tier) => set({ tier }),
      reset: () => set({ ...DEFAULT_STATE }),
    }),
    {
      name: 'funnel-state',
      storage: createJSONStorage(() =>
        typeof window !== 'undefined' ? sessionStorage : {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {},
        }
      ),
      // Don't persist action functions — only data
      partialize: (state) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { setCategory, setProcedure, setSpecificGoal, setPriorities, setAgeBracket,
          setJourneyStage, setSurgeonInMind, setStoppers, setFundingFlags, setTimeline,
          setBudget, setLocation, setTravelWillingness, setFirstName, setEmail, setPhone,
          setSmsCodeSent, setSmsCodeVerified, setSmsResponseConfirmed, setIntentScore,
          addFraudFlag, markStageComplete, setLeadId, setTier, reset, ...data } = state
        return data
      },
    }
  )
)

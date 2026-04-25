'use client'

import { useRouter } from 'next/navigation'
import { useCallback } from 'react'
import { STAGES, getNextStage, getPrevStage } from '@/constants/stages'
import { evaluateGatesForStage } from '@/lib/gates/evaluate'
import { useFunnelStore } from '@/store/funnelStore'
import { trackEvent } from '@/lib/analytics/track'

export function useFunnelNavigation(currentSlug: string) {
  const router = useRouter()
  const store  = useFunnelStore()

  const currentStage = STAGES.find((s) => s.slug === currentSlug)

  const advance = useCallback(() => {
    if (!currentStage) return

    store.markStageComplete(currentStage.index)
    trackEvent('stage_complete', { stage: currentStage.index, slug: currentSlug })

    const gateResult = evaluateGatesForStage(currentStage.index, store)
    if (!gateResult.pass) {
      trackEvent('gate_triggered', { gate: gateResult.reason, destination: gateResult.destination })
      router.push(gateResult.destination)
      return
    }

    const next = getNextStage(currentSlug)
    if (next) router.push(next.path)
  }, [currentStage, currentSlug, router, store])

  const back = useCallback(() => {
    const prev = getPrevStage(currentSlug)
    if (prev) router.push(prev.path)
    else router.back()
  }, [currentSlug, router])

  return { advance, back, currentStage }
}

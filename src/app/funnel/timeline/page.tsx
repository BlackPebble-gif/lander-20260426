'use client'

import { useRouter } from 'next/navigation'
import { ProgressBar, OptionCard, Button } from '@/components/ui'
import { useFunnelStore } from '@/store/funnelStore'
import { TOTAL_STAGES } from '@/constants/stages'
import { evaluateTimelineGate } from '@/lib/gates/evaluate'
import { trackEvent } from '@/lib/analytics/track'
import type { Timeline } from '@/types/lead'

const OPTIONS: { id: Timeline; label: string; sub: string }[] = [
  { id: 'asap',         label: 'As soon as possible', sub: 'Within 1–3 months' },
  { id: '3_6_months',   label: 'In the next 3–6 months', sub: '' },
  { id: '6_12_months',  label: 'Later this year or next', sub: '6–12 months' },
  { id: 'exploring',    label: 'Just exploring for now', sub: 'No firm timeline' },
]

export default function TimelinePage() {
  const router = useRouter()
  const { timeline, setTimeline, markStageComplete } = useFunnelStore()

  function select(id: Timeline) {
    setTimeline(id)

    const gate = evaluateTimelineGate({ timeline: id })
    if (!gate.pass) {
      markStageComplete(8)
      trackEvent('gate_triggered', { gate: gate.reason, destination: gate.destination })
      router.push(gate.destination)
      return
    }

    markStageComplete(8)
    trackEvent('stage_complete', { stage: 8, timeline: id })
    setTimeout(() => router.push('/funnel/funding'), 200)
  }

  return (
    <div className="stage-enter space-y-6">
      <ProgressBar current={8} total={TOTAL_STAGES} />

      <div>
        <Button variant="ghost" size="sm" onClick={() => router.push('/funnel/stoppers')}>
          ← Back
        </Button>
      </div>

      <div className="space-y-2">
        <h1 className="font-serif text-3xl font-semibold text-primary-text">Your timeline</h1>
        <p className="text-primary-text/60">When are you hoping to have surgery?</p>
        <p className="text-sm text-primary-text/40">
          No pressure — this helps us find surgeons with the right availability for you.
        </p>
      </div>

      <div className="space-y-3">
        {OPTIONS.map((opt) => (
          <OptionCard
            key={opt.id}
            label={opt.label}
            description={opt.sub || undefined}
            selected={timeline === opt.id}
            onClick={() => select(opt.id)}
          />
        ))}
      </div>
    </div>
  )
}

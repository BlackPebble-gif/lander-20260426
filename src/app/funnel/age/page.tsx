'use client'

import { useRouter } from 'next/navigation'
import { ProgressBar, OptionCard, Button } from '@/components/ui'
import { useFunnelStore } from '@/store/funnelStore'
import { TOTAL_STAGES } from '@/constants/stages'
import { trackEvent } from '@/lib/analytics/track'

const BRACKETS = [
  { id: '18-24', label: '18–24' },
  { id: '25-34', label: '25–34' },
  { id: '35-44', label: '35–44' },
  { id: '45-54', label: '45–54' },
  { id: '55+',   label: '55+' },
  { id: 'prefer_not', label: 'Prefer not to say' },
]

export default function AgePage() {
  const router = useRouter()
  const { ageBracket, setAgeBracket, markStageComplete } = useFunnelStore()

  function select(id: string) {
    setAgeBracket(id)
    markStageComplete(5)
    trackEvent('stage_complete', { stage: 5, age_bracket: id })
    setTimeout(() => router.push('/funnel/journey'), 200)
  }

  return (
    <div className="stage-enter space-y-6">
      <ProgressBar current={5} total={TOTAL_STAGES} />

      <div>
        <Button variant="ghost" size="sm" onClick={() => router.push('/funnel/priorities')}>
          ← Back
        </Button>
      </div>

      <div className="space-y-2">
        <h1 className="font-serif text-3xl font-semibold text-primary-text">About you</h1>
        <p className="text-primary-text/60">What&apos;s your age bracket?</p>
        <p className="text-sm text-primary-text/40">
          This helps us match surgeons with experience across different age groups and skin types — it shapes the approach as much as the procedure itself.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {BRACKETS.map((b) => (
          <OptionCard
            key={b.id}
            label={b.label}
            selected={ageBracket === b.id}
            onClick={() => select(b.id)}
          />
        ))}
      </div>
    </div>
  )
}

'use client'

import { useRouter } from 'next/navigation'
import { ProgressBar, Button, Slider } from '@/components/ui'
import { useFunnelStore } from '@/store/funnelStore'
import { TOTAL_STAGES } from '@/constants/stages'
import { getProcedureFloor } from '@/constants/procedures'
import { evaluateBudgetGate } from '@/lib/gates/evaluate'
import { trackEvent } from '@/lib/analytics/track'

function getBudgetLabel(value: number, min: number, standard: number, premium: number): string {
  if (value < min)        return `Heads up: At this level, your options may be more limited and may not include FRACS-certified plastic surgeons. Moving up opens access to a wider range of qualified, experienced surgeons.`
  if (value < standard)  return 'Good range — access to experienced FRACS surgeons'
  if (value < premium)   return 'Excellent range — access to Australia\'s top surgeons'
  return 'Top-tier — access to the most sought-after surgeons'
}

function formatAUD(value: number) {
  return `$${value.toLocaleString('en-AU')}`
}

export default function BudgetPage() {
  const router = useRouter()
  const { budget, setBudget, procedure, priorities, markStageComplete } = useFunnelStore()

  const floors = getProcedureFloor(procedure)
  const sliderMin = 5000
  const sliderMax = 50000

  const displayBudget = budget || floors.standard

  const label = getBudgetLabel(displayBudget, floors.minimum, floors.standard, floors.premium)
  const isWarning = displayBudget < floors.minimum

  function next() {
    const gate = evaluateBudgetGate({ budget: displayBudget, procedure, priorities })
    markStageComplete(10)
    trackEvent('stage_complete', { stage: 10, budget: displayBudget })

    if (!gate.pass) {
      trackEvent('gate_triggered', { gate: gate.reason, destination: gate.destination })
      setBudget(displayBudget)
      router.push(gate.destination)
      return
    }

    setBudget(displayBudget)
    router.push('/funnel/location')
  }

  return (
    <div className="stage-enter space-y-6">
      <ProgressBar current={10} total={TOTAL_STAGES} />

      <div>
        <Button variant="ghost" size="sm" onClick={() => router.push('/funnel/funding')}>
          ← Back
        </Button>
      </div>

      <div className="space-y-2">
        <h1 className="font-serif text-3xl font-semibold text-primary-text">Your investment</h1>
        <p className="text-primary-text/60">What are you willing to invest to get the outcome you&apos;re looking for?</p>
        <p className="text-sm text-primary-text/40">
          Costs vary depending on the look you&apos;re after, the type of technique, anaesthetist, years of experience, and whether you&apos;re seeing one of Australia&apos;s top surgeons.
        </p>
      </div>

      <Slider
        min={sliderMin}
        max={sliderMax}
        step={1000}
        value={displayBudget}
        onChange={setBudget}
        formatLabel={formatAUD}
      />

      <div className={`rounded-lg border p-3 text-sm ${isWarning ? 'border-cta/30 bg-cta/5 text-primary-text' : 'border-accent/20 bg-accent/5 text-accent'}`}>
        {label}
      </div>

      <p className="text-center text-xs text-primary-text/40">
        All pricing is indicative. Your surgeon will confirm costs during your consultation.
      </p>

      <Button fullWidth size="lg" onClick={next}>
        Continue
      </Button>
    </div>
  )
}

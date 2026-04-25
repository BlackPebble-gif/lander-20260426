'use client'

import { useRouter } from 'next/navigation'
import { ProgressBar, Button, Card } from '@/components/ui'
import { useFunnelStore } from '@/store/funnelStore'
import { TOTAL_STAGES } from '@/constants/stages'
import { cn } from '@/lib/utils'
import { trackEvent } from '@/lib/analytics/track'

const OPTIONS = [
  { id: 'fracs',              label: 'FRACS Accreditation' },
  { id: 'surgeon_experience', label: 'Surgeon Experience' },
  { id: 'before_after',       label: 'Before & After Photos' },
  { id: 'cost_pricing',       label: 'Cost & Pricing' },
  { id: 'patient_reviews',    label: 'Patient Reviews' },
  { id: 'payment_plans',      label: 'Payment Plans' },
  { id: 'wait_times',         label: 'Wait Times / Fast Availability' },
  { id: 'bedside_manner',     label: 'Warm Bedside Manner' },
  { id: 'post_op_care',       label: 'Strong Post-Op Care' },
  { id: 'location',           label: 'Location / Proximity' },
  { id: 'hospital_quality',   label: 'Hospital Quality' },
  { id: 'female_surgeon',     label: 'Female Surgeon' },
  { id: 'unsure',             label: "I'm not sure yet" },
]

export default function PrioritiesPage() {
  const router = useRouter()
  const { priorities, setPriorities, markStageComplete } = useFunnelStore()

  function toggle(id: string) {
    if (priorities.includes(id)) {
      setPriorities(priorities.filter((p) => p !== id))
    } else {
      setPriorities([...priorities, id])
    }
  }

  function next() {
    markStageComplete(4)
    trackEvent('stage_complete', { stage: 4, priorities })
    router.push('/funnel/age')
  }

  return (
    <div className="stage-enter space-y-6">
      <ProgressBar current={4} total={TOTAL_STAGES} />

      <div>
        <Button variant="ghost" size="sm" onClick={() => router.push('/funnel/goal')}>
          ← Back
        </Button>
      </div>

      <div className="space-y-2">
        <h1 className="font-serif text-3xl font-semibold text-primary-text">Your priorities</h1>
        <p className="text-primary-text/60">What matters most to you?</p>
        <p className="text-sm text-primary-text/40">
          This helps us find the right surgeon for you. Select everything that&apos;s important to you.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {OPTIONS.map((opt) => {
          const selected = priorities.includes(opt.id)
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => toggle(opt.id)}
              className={cn(
                'rounded-lg border p-3 text-left text-sm font-medium transition-all duration-150',
                'hover:border-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
                selected
                  ? 'border-accent bg-accent/5 text-accent'
                  : 'border-border bg-white text-primary-text'
              )}
            >
              {selected && <span className="mr-1 text-accent">✓ </span>}
              {opt.label}
            </button>
          )
        })}
      </div>

      <Card className="bg-accent/5 border-accent/20">
        <blockquote className="text-sm italic text-primary-text/70">
          &ldquo;They made me feel completely comfortable discussing my goals and took the time to explain every step clearly and honestly.&rdquo;
        </blockquote>
        <p className="mt-2 text-xs text-primary-text/40">— Amanda Joyce · Verified Google Review</p>
      </Card>

      <Button
        fullWidth
        size="lg"
        onClick={next}
        disabled={priorities.length === 0}
      >
        Continue
      </Button>
    </div>
  )
}

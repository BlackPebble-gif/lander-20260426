'use client'

import { useRouter } from 'next/navigation'
import { ProgressBar, Button, CalloutBox } from '@/components/ui'
import { useFunnelStore } from '@/store/funnelStore'
import { TOTAL_STAGES } from '@/constants/stages'
import { cn } from '@/lib/utils'
import { trackEvent } from '@/lib/analytics/track'

const OPTIONS = [
  { id: 'physical_symptoms',  label: 'I have physical symptoms (pain, discomfort)' },
  { id: 'gp_mentioned',       label: 'My GP has mentioned surgery as an option' },
  { id: 'post_pregnancy',     label: 'Post-pregnancy or post-weight loss procedure' },
  { id: 'medically_related',  label: 'Reconstructive or medically related' },
  { id: 'super_access',       label: "I'd like to explore super access options" },
  { id: 'help_funding',       label: "I'd like help understanding my funding options" },
  { id: 'none',               label: 'None of these apply' },
]

export default function FundingPage() {
  const router = useRouter()
  const { fundingFlags, setFundingFlags, markStageComplete } = useFunnelStore()

  function toggle(id: string) {
    if (id === 'none') {
      setFundingFlags(['none'])
      return
    }
    const without = fundingFlags.filter((f) => f !== 'none')
    if (without.includes(id)) {
      setFundingFlags(without.filter((f) => f !== id))
    } else {
      setFundingFlags([...without, id])
    }
  }

  function next() {
    const flags = fundingFlags.length === 0 ? ['none'] : fundingFlags
    setFundingFlags(flags)
    markStageComplete(9)
    trackEvent('stage_complete', { stage: 9, funding_flags: flags })
    router.push('/funnel/budget')
  }

  return (
    <div className="stage-enter space-y-6">
      <ProgressBar current={9} total={TOTAL_STAGES} />

      <div>
        <Button variant="ghost" size="sm" onClick={() => router.push('/funnel/timeline')}>
          ← Back
        </Button>
      </div>

      <div className="space-y-2">
        <h1 className="font-serif text-3xl font-semibold text-primary-text">Funding & costs</h1>
        <p className="text-primary-text/60">Do any of these apply to you?</p>
        <p className="text-sm text-primary-text/40">
          Some situations may open up additional funding pathways. This helps us make sure we&apos;re asking the right questions on your behalf.
        </p>
      </div>

      <CalloutBox variant="info">
        Good to know. Depending on your situation, there may be funding options worth exploring — including Medicare rebates, early super access, or payment plans. Your GP or surgeon will confirm what applies.
      </CalloutBox>

      <div className="space-y-2">
        {OPTIONS.map((opt) => {
          const selected = fundingFlags.includes(opt.id)
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => toggle(opt.id)}
              className={cn(
                'w-full rounded-lg border p-3 text-left text-sm font-medium transition-all duration-150',
                'hover:border-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
                selected
                  ? 'border-accent bg-accent/5 text-accent'
                  : 'border-border bg-white text-primary-text'
              )}
            >
              {selected && <span className="mr-1">✓ </span>}
              {opt.label}
            </button>
          )
        })}
      </div>

      <Button fullWidth size="lg" onClick={next}>
        Continue
      </Button>
    </div>
  )
}

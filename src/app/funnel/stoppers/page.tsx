'use client'

import { useRouter } from 'next/navigation'
import { ProgressBar, Button, Card } from '@/components/ui'
import { useFunnelStore } from '@/store/funnelStore'
import { TOTAL_STAGES } from '@/constants/stages'
import { cn } from '@/lib/utils'
import { trackEvent } from '@/lib/analytics/track'

const OPTIONS = [
  { id: 'cost',                      label: 'Cost & affordability' },
  { id: 'fear_wrong_result',         label: 'Fear of the wrong result' },
  { id: 'dont_know_who_to_trust',    label: "Don't know who to trust" },
  { id: 'fear_surgery',              label: 'Fear of surgery itself' },
  { id: 'timing',                    label: "Timing wasn't right" },
  { id: 'overwhelmed',               label: 'Overwhelmed by information' },
  { id: 'finance_access',            label: "Couldn't access finance" },
  { id: 'judgement',                 label: 'Worried about judgement' },
  { id: 'dont_know_where_to_start',  label: "Didn't know where to start" },
  { id: 'nothing_ready_now',         label: "Nothing — I'm ready now" },
]

export default function StoppersPage() {
  const router = useRouter()
  const { stoppers, setStoppers, markStageComplete } = useFunnelStore()

  function toggle(id: string) {
    if (stoppers.includes(id)) {
      setStoppers(stoppers.filter((s) => s !== id))
    } else {
      setStoppers([...stoppers, id])
    }
  }

  function next() {
    markStageComplete(7)
    trackEvent('stage_complete', { stage: 7, stoppers })
    router.push('/funnel/timeline')
  }

  return (
    <div className="stage-enter space-y-6">
      <ProgressBar current={7} total={TOTAL_STAGES} />

      <div>
        <Button variant="ghost" size="sm" onClick={() => router.push('/funnel/journey')}>
          ← Back
        </Button>
      </div>

      <div className="space-y-2">
        <h1 className="font-serif text-3xl font-semibold text-primary-text">Let&apos;s be honest</h1>
        <p className="text-primary-text/60">What&apos;s stopped you from moving forward before?</p>
        <p className="text-sm text-primary-text/40">
          The more honest you are, the better we can help. <strong>We&apos;ve heard it all</strong> — there&apos;s nothing to be embarrassed about.
        </p>
      </div>

      <div className="space-y-2">
        {OPTIONS.map((opt) => {
          const selected = stoppers.includes(opt.id)
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

      <Card className="border-accent/20 bg-accent/5">
        <p className="text-sm text-primary-text/70">
          <strong>2,800+ people have come to us with exactly this question.</strong>
          <br />You&apos;re not alone in this.
        </p>
      </Card>

      <Button fullWidth size="lg" onClick={next} disabled={stoppers.length === 0}>
        Continue
      </Button>
    </div>
  )
}

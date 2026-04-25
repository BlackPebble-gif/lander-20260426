'use client'

import { useRouter } from 'next/navigation'
import { ProgressBar, OptionCard, CalloutBox, Button } from '@/components/ui'
import { useFunnelStore } from '@/store/funnelStore'
import { TOTAL_STAGES } from '@/constants/stages'
import { PROCEDURES } from '@/constants/procedures'
import { trackEvent } from '@/lib/analytics/track'

export default function ProcedurePage() {
  const router = useRouter()
  const { category, procedure, setProcedure, markStageComplete } = useFunnelStore()

  const options = PROCEDURES.filter((p) => p.category === category || category === 'unsure')

  function select(id: string) {
    setProcedure(id)
    markStageComplete(2)
    trackEvent('stage_complete', { stage: 2, procedure: id })
    setTimeout(() => router.push('/funnel/goal'), 200)
  }

  const bblNote = options.find((p) => p.id === 'bbl')?.safetyNote

  return (
    <div className="stage-enter space-y-6">
      <ProgressBar current={2} total={TOTAL_STAGES} />

      <div>
        <Button variant="ghost" size="sm" onClick={() => router.push('/funnel/start')}>
          ← Back
        </Button>
      </div>

      <div className="space-y-2">
        <h1 className="font-serif text-3xl font-semibold text-primary-text capitalize">
          {category === 'unsure' ? 'All procedures' : `${category} procedures`}
        </h1>
        <p className="text-primary-text/60">Which procedure are you considering?</p>
        <p className="text-sm text-primary-text/40">
          Not sure of the name? Read the descriptions below — we&apos;ll help you figure out what fits your goals.
        </p>
      </div>

      {bblNote && (
        <CalloutBox variant="safety">
          {bblNote}
        </CalloutBox>
      )}

      <div className="space-y-3">
        {options.map((p) => (
          <OptionCard
            key={p.id}
            label={p.name}
            description={p.alsoKnownAs ? `Also known as: ${p.alsoKnownAs} — ${p.description}` : p.description}
            selected={procedure === p.id}
            onClick={() => select(p.id)}
            badge={p.popular ? 'Popular' : undefined}
            chevron
          />
        ))}
      </div>
    </div>
  )
}

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ProgressBar, OptionCard, Button, Input } from '@/components/ui'
import { useFunnelStore } from '@/store/funnelStore'
import { TOTAL_STAGES } from '@/constants/stages'
import { trackEvent } from '@/lib/analytics/track'
import type { JourneyStage } from '@/types/lead'

const OPTIONS: { id: JourneyStage; label: string; sub?: string }[] = [
  { id: 'researching',        label: "No — I'm still researching" },
  { id: 'had_consult',        label: "Yes — I've had at least one consult", sub: "I'm not sure they're the right fit" },
  { id: 'have_surgeon',       label: 'I have a surgeon in mind', sub: "I'd like you to vet them before I commit" },
  { id: 'multiple_consults',  label: "I've seen multiple surgeons", sub: 'Still undecided — I need an objective perspective' },
]

export default function JourneyPage() {
  const router = useRouter()
  const { journeyStage, setJourneyStage, surgeonInMind, setSurgeonInMind, markStageComplete } = useFunnelStore()
  const [showSurgeonForm, setShowSurgeonForm] = useState(journeyStage === 'have_surgeon')
  const [surgeonName, setSurgeonName] = useState(surgeonInMind?.name ?? '')
  const [surgeonReason, setSurgeonReason] = useState(surgeonInMind?.reason ?? '')

  function select(id: JourneyStage) {
    setJourneyStage(id)
    setShowSurgeonForm(id === 'have_surgeon')
  }

  function next() {
    if (journeyStage === 'have_surgeon') {
      setSurgeonInMind({ name: surgeonName || undefined, reason: surgeonReason || undefined })
    }
    markStageComplete(6)
    trackEvent('stage_complete', { stage: 6, journey_stage: journeyStage })
    router.push('/funnel/stoppers')
  }

  return (
    <div className="stage-enter space-y-6">
      <ProgressBar current={6} total={TOTAL_STAGES} />

      <div>
        <Button variant="ghost" size="sm" onClick={() => router.push('/funnel/age')}>
          ← Back
        </Button>
      </div>

      <div className="space-y-2">
        <h1 className="font-serif text-3xl font-semibold text-primary-text">Where are you at?</h1>
        <p className="text-primary-text/60">Have you had a consultation yet?</p>
        <p className="text-sm text-primary-text/40">
          We work with people at every stage — from just starting out to those who&apos;ve already seen surgeons.
        </p>
      </div>

      <div className="space-y-3">
        {OPTIONS.map((opt) => (
          <OptionCard
            key={opt.id}
            label={opt.label}
            description={opt.sub}
            selected={journeyStage === opt.id}
            onClick={() => select(opt.id)}
          />
        ))}
      </div>

      {showSurgeonForm && (
        <div className="space-y-3 rounded-xl border border-border p-4">
          <p className="text-sm font-medium text-primary-text">Tell us a bit more (optional)</p>
          <Input
            label="Surgeon name or clinic"
            value={surgeonName}
            onChange={(e) => setSurgeonName(e.target.value)}
            placeholder="e.g. Dr Smith at Sydney Cosmetic"
          />
          <div>
            <label className="mb-1.5 block text-sm font-medium text-primary-text">
              Why are you considering them?
            </label>
            <textarea
              value={surgeonReason}
              onChange={(e) => setSurgeonReason(e.target.value)}
              rows={3}
              placeholder="e.g. A friend recommended them, or I saw their work online"
              className="w-full rounded-lg border border-border bg-white px-4 py-3 text-sm text-primary-text placeholder:text-primary-text/30 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>
        </div>
      )}

      <Button fullWidth size="lg" onClick={next} disabled={!journeyStage}>
        Continue
      </Button>
    </div>
  )
}

'use client'

import { useRouter } from 'next/navigation'
import { ProgressBar, OptionCard } from '@/components/ui'
import { useFunnelStore } from '@/store/funnelStore'
import { TOTAL_STAGES } from '@/constants/stages'
import { trackEvent } from '@/lib/analytics/track'
import type { ProcedureCategory } from '@/types/lead'

const CATEGORIES: { id: ProcedureCategory; label: string; description: string }[] = [
  { id: 'breast', label: 'Breast',    description: 'Augmentation, lift, reduction & more' },
  { id: 'face',   label: 'Face',      description: 'Rhinoplasty, eyes, brow & more' },
  { id: 'body',   label: 'Body',      description: 'Abdominoplasty, lipo, contouring & more' },
  { id: 'unsure', label: 'Not sure yet', description: "We'll help you figure it out" },
]

export default function StartPage() {
  const router = useRouter()
  const { category, setCategory, markStageComplete } = useFunnelStore()

  function select(id: ProcedureCategory) {
    setCategory(id)
    markStageComplete(1)
    trackEvent('stage_complete', { stage: 1, category: id })
    setTimeout(() => router.push('/funnel/procedure'), 200)
  }

  return (
    <div className="stage-enter space-y-8">
      <ProgressBar current={1} total={TOTAL_STAGES} />

      <div className="space-y-2">
        <p className="text-sm uppercase tracking-widest text-primary-text/40">Welcome</p>
        <h1 className="font-serif text-3xl font-semibold leading-snug text-primary-text">
          What area are you thinking about?
        </h1>
        <p className="text-primary-text/60">
          No commitment — we just want to point you in the right direction.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {CATEGORIES.map((cat) => (
          <OptionCard
            key={cat.id}
            label={cat.label}
            description={cat.description}
            selected={category === cat.id}
            onClick={() => select(cat.id)}
          />
        ))}
      </div>
    </div>
  )
}

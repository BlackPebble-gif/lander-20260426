'use client'

import { useRouter } from 'next/navigation'
import { ProgressBar, OptionCard, Button } from '@/components/ui'
import { useFunnelStore } from '@/store/funnelStore'
import { TOTAL_STAGES } from '@/constants/stages'
import { PROCEDURES } from '@/constants/procedures'
import { trackEvent } from '@/lib/analytics/track'

const GOALS_BY_PROCEDURE: Record<string, { id: string; label: string }[]> = {
  breast_aug:       [
    { id: 'natural_fullness',    label: 'Natural-looking fullness' },
    { id: 'significant_size',    label: 'Significant size increase' },
    { id: 'restore_volume',      label: 'Restore volume after pregnancy or weight loss' },
    { id: 'improve_symmetry',    label: 'Improve asymmetry' },
  ],
  breast_lift:      [
    { id: 'lift_sag',            label: 'Lift and firm sagging breasts' },
    { id: 'improve_shape',       label: 'Improve shape and position' },
    { id: 'post_pregnancy',      label: 'Restore shape after pregnancy' },
  ],
  breast_reduction: [
    { id: 'relieve_pain',        label: 'Relieve back, neck or shoulder pain' },
    { id: 'improve_proportion',  label: 'Improve body proportion' },
    { id: 'clothing_fit',        label: 'Improve clothing fit' },
  ],
  rhinoplasty:      [
    { id: 'refine_tip',          label: 'Refine or reshape the tip' },
    { id: 'reduce_size',         label: 'Reduce overall size' },
    { id: 'correct_bump',        label: 'Correct a bump or hump' },
    { id: 'improve_breathing',   label: 'Improve breathing (functional)' },
    { id: 'improve_symmetry',    label: 'Improve asymmetry' },
  ],
  facelift:         [
    { id: 'tighten_jowls',       label: 'Tighten jowls and lower face' },
    { id: 'neck_lift',           label: 'Improve neck laxity' },
    { id: 'comprehensive',       label: 'Comprehensive facial rejuvenation' },
  ],
  tummy_tuck:       [
    { id: 'remove_skin',         label: 'Remove excess skin after weight loss' },
    { id: 'post_pregnancy',      label: 'Restore abdomen after pregnancy' },
    { id: 'tighten_muscles',     label: 'Tighten separated abdominal muscles' },
  ],
  bbl:              [
    { id: 'add_volume',          label: 'Add volume and projection' },
    { id: 'improve_shape',       label: 'Improve overall shape and contour' },
    { id: 'fix_asymmetry',       label: 'Correct asymmetry' },
  ],
  liposuction:      [
    { id: 'stubborn_fat',        label: 'Remove stubborn fat deposits' },
    { id: 'body_contouring',     label: 'Overall body contouring' },
    { id: 'specific_area',       label: 'Target a specific area (abdomen, flanks, thighs)' },
  ],
  _default:         [
    { id: 'aesthetic',           label: 'Aesthetic improvement' },
    { id: 'functional',          label: 'Functional improvement' },
    { id: 'confidence',          label: 'Boost confidence and self-image' },
    { id: 'restore',             label: 'Restore appearance after life changes' },
  ],
}

function getGoals(procedureId: string | null) {
  return GOALS_BY_PROCEDURE[procedureId ?? ''] ?? GOALS_BY_PROCEDURE['_default']
}

export default function GoalPage() {
  const router = useRouter()
  const { procedure, specificGoal, setSpecificGoal, markStageComplete } = useFunnelStore()

  const procedureName = PROCEDURES.find((p) => p.id === procedure)?.name ?? 'Your procedure'
  const goals = getGoals(procedure)

  function select(id: string) {
    setSpecificGoal(id)
    markStageComplete(3)
    trackEvent('stage_complete', { stage: 3, goal: id })
    setTimeout(() => router.push('/funnel/priorities'), 200)
  }

  return (
    <div className="stage-enter space-y-6">
      <ProgressBar current={3} total={TOTAL_STAGES} />

      <div>
        <Button variant="ghost" size="sm" onClick={() => router.push('/funnel/procedure')}>
          ← Back
        </Button>
      </div>

      <div className="space-y-2">
        <h1 className="font-serif text-3xl font-semibold text-primary-text">{procedureName}</h1>
        <p className="text-primary-text/60">What result are you hoping for?</p>
        <p className="text-sm text-primary-text/40">
          Be honest — <strong>there&apos;s no wrong answer.</strong> This is how we match you with surgeons who specialise in your exact goals.
        </p>
      </div>

      <div className="space-y-3">
        {goals.map((g) => (
          <OptionCard
            key={g.id}
            label={g.label}
            selected={specificGoal === g.id}
            onClick={() => select(g.id)}
            chevron
          />
        ))}
      </div>
    </div>
  )
}

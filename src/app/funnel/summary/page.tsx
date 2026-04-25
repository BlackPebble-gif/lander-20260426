'use client'

import { useRouter } from 'next/navigation'
import { ProgressBar, Button, Card } from '@/components/ui'
import { useFunnelStore } from '@/store/funnelStore'
import { TOTAL_STAGES } from '@/constants/stages'
import { PROCEDURES } from '@/constants/procedures'
import { trackEvent } from '@/lib/analytics/track'

function Row({ label, value }: { label: string; value: string | undefined | null }) {
  if (!value) return null
  return (
    <div className="flex justify-between gap-4 py-2 text-sm">
      <span className="text-primary-text/50">{label}</span>
      <span className="text-right font-medium text-primary-text">{value}</span>
    </div>
  )
}

export default function SummaryPage() {
  const router = useRouter()
  const store = useFunnelStore()

  const procedureName = PROCEDURES.find((p) => p.id === store.procedure)?.name

  const JOURNEY_LABELS: Record<string, string> = {
    researching:       "Still researching",
    had_consult:       "Had a consultation",
    have_surgeon:      "Have a surgeon in mind",
    multiple_consults: "Seen multiple surgeons",
  }

  const TIMELINE_LABELS: Record<string, string> = {
    asap:         "As soon as possible",
    '3_6_months': "3–6 months",
    '6_12_months':"6–12 months",
  }

  function next() {
    trackEvent('stage_complete', { stage: 12 })
    router.push('/funnel/contact')
  }

  return (
    <div className="stage-enter space-y-6">
      <ProgressBar current={12} total={TOTAL_STAGES} />

      <div>
        <Button variant="ghost" size="sm" onClick={() => router.push('/funnel/location')}>
          ← Back
        </Button>
      </div>

      <div className="space-y-1">
        <h1 className="font-serif text-3xl font-semibold text-primary-text">Here&apos;s what you told us</h1>
        <p className="font-serif text-lg italic text-accent">Don&apos;t go under alone.</p>
      </div>

      <Card>
        <div className="divide-y divide-border">
          <Row label="Category"       value={store.category ? store.category.charAt(0).toUpperCase() + store.category.slice(1) : undefined} />
          <Row label="Procedure"      value={procedureName} />
          <Row label="Journey stage"  value={store.journeyStage ? JOURNEY_LABELS[store.journeyStage] : undefined} />
          <Row label="Timeline"       value={store.timeline ? TIMELINE_LABELS[store.timeline] : undefined} />
          <Row label="Budget"         value={store.budget ? `$${store.budget.toLocaleString('en-AU')}` : undefined} />
          <Row label="Location"       value={store.location || undefined} />
        </div>
      </Card>

      <Card className="border-accent/20 bg-accent/5">
        <p className="text-sm text-primary-text/70">
          On average, our clients save <strong>50–70 hours of research</strong> and avoid{' '}
          <strong>$6,000–$15,000 in unnecessary costs</strong>.
        </p>
        <p className="mt-2 text-sm text-primary-text/70">
          That&apos;s the real cost of going alone. You don&apos;t have to.
        </p>
      </Card>

      <Button fullWidth size="lg" onClick={next}>
        See my options →
      </Button>
    </div>
  )
}

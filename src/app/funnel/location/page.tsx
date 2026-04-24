'use client'

import { useRouter } from 'next/navigation'
import { ProgressBar, Button, OptionCard } from '@/components/ui'
import { useFunnelStore } from '@/store/funnelStore'
import { TOTAL_STAGES } from '@/constants/stages'
import { trackEvent } from '@/lib/analytics/track'
import type { TravelWillingness } from '@/types/lead'

const AU_LOCATIONS = [
  'Sydney, NSW', 'Melbourne, VIC', 'Brisbane, QLD', 'Perth, WA',
  'Adelaide, SA', 'Canberra, ACT', 'Hobart, TAS', 'Darwin, NT',
  'Gold Coast, QLD', 'Newcastle, NSW', 'Regional / Rural',
]

const TRAVEL_OPTIONS: { id: TravelWillingness; label: string; note?: string }[] = [
  { id: 'local',       label: 'Same city only' },
  { id: 'interstate',  label: 'Open to interstate travel' },
  { id: 'anywhere',    label: 'Happy to fly anywhere in Australia' },
  { id: 'overseas',    label: 'Considering international options', note: 'Flag as risk — may not book domestic' },
]

export default function LocationPage() {
  const router = useRouter()
  const { location, setLocation, travelWillingness, setTravelWillingness, markStageComplete } = useFunnelStore()

  async function next() {
    if (!location || !travelWillingness) return
    markStageComplete(11)
    trackEvent('stage_complete', { stage: 11, location, travel: travelWillingness })

    // Waitlist gate would check surgeon exclusivity zones server-side
    // For now: pass through (stub)
    router.push('/funnel/summary')
  }

  return (
    <div className="stage-enter space-y-6">
      <ProgressBar current={11} total={TOTAL_STAGES} />

      <div>
        <Button variant="ghost" size="sm" onClick={() => router.push('/funnel/budget')}>
          ← Back
        </Button>
      </div>

      <div className="space-y-2">
        <h1 className="font-serif text-3xl font-semibold text-primary-text">Your location</h1>
      </div>

      {/* Part A */}
      <div>
        <p className="mb-3 font-medium text-primary-text">Where are you based?</p>
        <div className="grid grid-cols-2 gap-2">
          {AU_LOCATIONS.map((loc) => (
            <button
              key={loc}
              type="button"
              onClick={() => setLocation(loc)}
              className={`rounded-lg border p-3 text-left text-sm font-medium transition-all duration-150 hover:border-accent/50 focus-visible:outline-none ${
                location === loc ? 'border-accent bg-accent/5 text-accent' : 'border-border bg-white text-primary-text'
              }`}
            >
              {location === loc && <span className="mr-1">✓ </span>}
              {loc}
            </button>
          ))}
        </div>
      </div>

      {/* Part B */}
      <div>
        <p className="mb-3 font-medium text-primary-text">Are you open to travelling for the right surgeon?</p>
        <div className="space-y-3">
          {TRAVEL_OPTIONS.map((opt) => (
            <OptionCard
              key={opt.id}
              label={opt.label}
              selected={travelWillingness === opt.id}
              onClick={() => setTravelWillingness(opt.id)}
            />
          ))}
        </div>
      </div>

      <Button
        fullWidth
        size="lg"
        onClick={next}
        disabled={!location || !travelWillingness}
      >
        Continue
      </Button>
    </div>
  )
}

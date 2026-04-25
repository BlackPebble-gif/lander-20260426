'use client'

import { useRouter } from 'next/navigation'
import { Button, Card } from '@/components/ui'
import { useFunnelStore } from '@/store/funnelStore'
import { trackEvent } from '@/lib/analytics/track'

export default function FinancePage() {
  const router = useRouter()
  const { setPriorities, priorities } = useFunnelStore()

  function continueWithFinance() {
    if (!priorities.includes('payment_plans')) {
      setPriorities([...priorities, 'payment_plans'])
    }
    trackEvent('finance_gate_accepted')
    router.push('/funnel/location')
  }

  return (
    <div className="stage-enter mx-auto max-w-md space-y-6 py-12">
      <div className="space-y-3">
        <h1 className="font-serif text-3xl font-semibold text-primary-text">
          Let&apos;s talk payment options.
        </h1>
        <p className="text-primary-text/60">
          Your budget works best with payment plans. Through our finance partner, you may be pre-approved within 48 hours — no credit impact to check.
        </p>
      </div>

      <Card className="border-cta/20 bg-cta/5 space-y-2">
        <p className="text-sm font-medium text-primary-text">How it works</p>
        <ul className="space-y-1 text-sm text-primary-text/70">
          <li>No impact on your credit score to check eligibility</li>
          <li>Pre-approval within 24–48 hours</li>
          <li>Flexible terms — spread the cost over 12–60 months</li>
          <li>Directly co-ordinated with your surgeon&apos;s clinic</li>
        </ul>
      </Card>

      <Button fullWidth size="lg" onClick={continueWithFinance}>
        Continue with payment plan options
      </Button>

      <button
        type="button"
        onClick={() => router.push('/funnel/budget')}
        className="w-full text-center text-sm text-primary-text/40 underline-offset-4 hover:underline"
      >
        Go back and adjust my budget
      </button>
    </div>
  )
}

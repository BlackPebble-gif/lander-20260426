'use client'

import { useEffect, useState } from 'react'
import { Card, Button } from '@/components/ui'
import { useFunnelStore } from '@/store/funnelStore'
import { trackEvent } from '@/lib/analytics/track'

function maskPhone(phone: string) {
  if (!phone) return ''
  const last4 = phone.slice(-4)
  return `•••• •••• ${last4}`
}

export default function ConfirmationPage() {
  const store = useFunnelStore()
  const [resent, setResent] = useState(false)

  useEffect(() => {
    trackEvent('confirmation_viewed', { tier: store.tier })
  }, [store.tier])

  async function resend() {
    await fetch('/api/sms/send', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ leadId: store.leadId, phone: store.phone, type: 'confirmation' }),
    })
    setResent(true)
    trackEvent('confirmation_sms_resent')
  }

  return (
    <div className="stage-enter mx-auto max-w-md space-y-8 py-12">
      <div className="space-y-3 text-center">
        <h1 className="font-serif text-3xl font-semibold text-primary-text">One last thing.</h1>
        <p className="text-primary-text/60">
          We&apos;ve just sent you a text to confirm your consultation request.{' '}
          <strong>Reply YES to that message</strong> and your matched surgeon will call you within 24 hours.
        </p>
      </div>

      <Card className="space-y-3 text-center">
        <p className="text-sm text-primary-text/50">Code sent to</p>
        <p className="font-serif text-xl font-medium text-primary-text">
          {maskPhone(store.phone)}
        </p>
        {!resent ? (
          <button
            type="button"
            onClick={resend}
            className="text-sm text-accent underline-offset-4 hover:underline"
          >
            Didn&apos;t get it? Resend
          </button>
        ) : (
          <p className="text-sm text-primary-text/40">Message resent.</p>
        )}
      </Card>

      <div className="flex items-center justify-center gap-6 text-center">
        {['FRACS Verified', 'Mystery Shopped', 'Patient Reviewed'].map((badge) => (
          <div key={badge} className="flex flex-col items-center gap-1">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/10 text-accent text-sm">
              ✓
            </div>
            <span className="text-xs text-primary-text/40">{badge}</span>
          </div>
        ))}
      </div>

      <p className="text-center text-xs text-primary-text/30">
        The lead is only delivered to your matched surgeon after you reply YES.
        No charge to you — ever.
      </p>
    </div>
  )
}

'use client'

import { useState } from 'react'
import { Button, Input, Card } from '@/components/ui'
import { trackEvent } from '@/lib/analytics/track'

export default function NurturePage() {
  const [email, setEmail]       = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading]   = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!email) return
    setLoading(true)
    try {
      await fetch('/api/nurture/enroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source: 'timeline_exploring' }),
      })
      trackEvent('nurture_enrolled', { source: 'timeline_exploring' })
      setSubmitted(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="stage-enter mx-auto max-w-md space-y-6 py-12">
      {!submitted ? (
        <>
          <div className="space-y-3">
            <h1 className="font-serif text-3xl font-semibold text-primary-text">
              You&apos;re early — and that&apos;s OK.
            </h1>
            <p className="text-primary-text/60">
              Most people research for 6–12 months before they&apos;re ready. We&apos;ll send you a short email series covering surgeon selection, cost breakdowns, and what to ask at consultations.
            </p>
            <p className="text-primary-text/60">
              When you&apos;re ready to move, we&apos;ll be here.
            </p>
          </div>

          <form onSubmit={submit} className="space-y-4">
            <Input
              label="Your email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
            <Button type="submit" fullWidth size="lg" disabled={loading}>
              {loading ? 'Sending...' : 'Send me the series'}
            </Button>
          </form>
        </>
      ) : (
        <Card className="text-center space-y-3">
          <p className="font-serif text-2xl font-semibold text-accent">You&apos;re on the list.</p>
          <p className="text-primary-text/60">
            We&apos;ll be in touch with the first email shortly. Take your time — this decision deserves it.
          </p>
        </Card>
      )}
    </div>
  )
}

'use client'

import { useState } from 'react'
import { Button, Input, Card } from '@/components/ui'
import { useFunnelStore } from '@/store/funnelStore'
import { trackEvent } from '@/lib/analytics/track'

export default function WaitlistPage() {
  const { location } = useFunnelStore()
  const [email, setEmail]       = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading]   = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!email) return
    setLoading(true)
    try {
      await fetch('/api/waitlist/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, location }),
      })
      trackEvent('waitlist_joined', { location })
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
              We don&apos;t have a surgeon in your area yet — but we&apos;ll go find them.
            </h1>
            {location && (
              <p className="text-primary-text/60">
                We currently don&apos;t have an exclusively matched surgeon serving <strong>{location}</strong>.
              </p>
            )}
            <p className="text-primary-text/60">
              Leave your email and we&apos;ll contact you as soon as one becomes available.
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
              {loading ? 'Joining...' : "Notify me when available"}
            </Button>
          </form>
        </>
      ) : (
        <Card className="text-center space-y-3">
          <p className="font-serif text-2xl font-semibold text-accent">You&apos;re on the list.</p>
          <p className="text-primary-text/60">
            We&apos;ll reach out as soon as a surgeon becomes available in your area.
          </p>
        </Card>
      )}
    </div>
  )
}

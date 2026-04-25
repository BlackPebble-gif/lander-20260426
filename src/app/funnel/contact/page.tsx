'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { parsePhoneNumber, isValidPhoneNumber } from 'libphonenumber-js'
import { ProgressBar, Button, Input, Card } from '@/components/ui'
import { useFunnelStore } from '@/store/funnelStore'
import { TOTAL_STAGES } from '@/constants/stages'
import { trackEvent } from '@/lib/analytics/track'

const schema = z.object({
  firstName: z.string().min(2, 'Please enter your first name'),
  email:     z.string().email('Please enter a valid email address'),
  phone:     z.string().refine(
    (v) => {
      try { return isValidPhoneNumber(v, 'AU') } catch { return false }
    },
    { message: 'Please enter a valid Australian mobile number' }
  ),
  consent:   z.boolean().refine((v) => v, { message: 'Please confirm your consent to proceed' }),
  honeypot:  z.string().max(0),
})

type FormValues = z.infer<typeof schema>

export default function ContactPage() {
  const router  = useRouter()
  const store   = useFunnelStore()
  const [serverError, setServerError] = useState<string | null>(null)

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      firstName: store.firstName,
      email:     store.email,
      phone:     store.phone,
      consent:   false,
      honeypot:  '',
    },
  })

  async function onSubmit(data: FormValues) {
    // Silent reject if honeypot filled
    if (data.honeypot) {
      router.push('/funnel/confirmation')
      return
    }

    setServerError(null)

    let recaptchaToken = ''
    if (typeof window !== 'undefined' && window.grecaptcha) {
      try {
        recaptchaToken = await window.grecaptcha.execute(
          process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY ?? '',
          { action: 'contact_submit' }
        )
      } catch { /* non-fatal */ }
    }

    // Normalise phone to E.164
    let normalisedPhone = data.phone
    try {
      normalisedPhone = parsePhoneNumber(data.phone, 'AU').format('E.164')
    } catch { /* keep as-is */ }

    const payload = {
      ...store,
      firstName:      data.firstName,
      email:          data.email,
      phone:          normalisedPhone,
      recaptchaToken,
    }

    const res = await fetch('/api/funnel/submit', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(payload),
    })

    const json = await res.json()

    if (json.blocked) {
      // Silent reject — show generic success to avoid leaking rejection
      trackEvent('lead_silently_rejected', { reason: json.reason })
      router.push('/funnel/confirmation')
      return
    }

    if (!res.ok) {
      setServerError('Something went wrong. Please try again.')
      return
    }

    store.setFirstName(data.firstName)
    store.setEmail(data.email)
    store.setPhone(normalisedPhone)
    store.setLeadId(json.leadId)
    store.setTier(json.tier)
    store.markStageComplete(13)
    trackEvent('lead_submitted', { tier: json.tier })

    router.push('/funnel/verify-code')
  }

  return (
    <div className="stage-enter space-y-6">
      <ProgressBar current={13} total={TOTAL_STAGES} />

      <div>
        <Button variant="ghost" size="sm" onClick={() => router.push('/funnel/summary')}>
          ← Back
        </Button>
      </div>

      <div className="space-y-2">
        <h1 className="font-serif text-3xl font-semibold text-primary-text">Your match is ready.</h1>
        <p className="text-primary-text/60">Enter your details so we can confirm your consultation.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {/* Honeypot — hidden from real users */}
        <div style={{ display: 'none' }} aria-hidden="true">
          <input tabIndex={-1} autoComplete="off" {...register('honeypot')} />
        </div>

        <Input
          label="First name"
          placeholder="Your first name"
          error={errors.firstName?.message}
          {...register('firstName')}
        />
        <Input
          label="Email"
          type="email"
          placeholder="you@example.com"
          error={errors.email?.message}
          hint="We'll verify this address — please use a real email."
          {...register('email')}
        />
        <Input
          label="Mobile number"
          type="tel"
          placeholder="04XX XXX XXX"
          error={errors.phone?.message}
          hint="Australian mobile only. We'll send a verification code."
          {...register('phone')}
        />

        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            id="consent"
            className="mt-0.5 h-4 w-4 rounded border-border text-accent focus:ring-accent"
            {...register('consent')}
          />
          <label htmlFor="consent" className="text-sm text-primary-text/70">
            I understand a specialist surgeon will contact me within 24 hours to discuss my consultation.
          </label>
        </div>
        {errors.consent && <p className="text-xs text-error">{errors.consent.message}</p>}

        {serverError && (
          <Card className="border-error/30 bg-error/5">
            <p className="text-sm text-error">{serverError}</p>
          </Card>
        )}

        <Button type="submit" fullWidth size="lg" disabled={isSubmitting}>
          {isSubmitting ? 'Checking your details...' : 'Confirm my consultation →'}
        </Button>
      </form>

      <p className="text-center text-xs text-primary-text/30">
        Your information is private. We never share without consent.
      </p>
    </div>
  )
}

// Extend Window for reCAPTCHA
declare global {
  interface Window {
    grecaptcha: {
      execute: (key: string, opts: { action: string }) => Promise<string>
    }
  }
}

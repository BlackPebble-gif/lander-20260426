'use client'

import { useRef, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Button, Card } from '@/components/ui'
import { useFunnelStore } from '@/store/funnelStore'
import { trackEvent } from '@/lib/analytics/track'

const CODE_LENGTH = 6

function maskPhone(phone: string) {
  if (!phone) return 'your phone'
  const last4 = phone.slice(-4)
  return `•••• •••• ${last4}`
}

export default function VerifyCodePage() {
  const router = useRouter()
  const store  = useFunnelStore()

  const [digits, setDigits] = useState<string[]>(Array(CODE_LENGTH).fill(''))
  const [error,  setError]  = useState<string | null>(null)
  const [resendCountdown, setResendCountdown] = useState(60)
  const [loading, setLoading] = useState(false)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  // Start resend countdown
  const [canResend, setCanResend] = useState(false)
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const startCountdown = useCallback(() => {
    setCanResend(false)
    setResendCountdown(60)
    countdownRef.current = setInterval(() => {
      setResendCountdown((n) => {
        if (n <= 1) {
          clearInterval(countdownRef.current!)
          setCanResend(true)
          return 0
        }
        return n - 1
      })
    }, 1000)
  }, [])

  // Start countdown on mount
  useState(() => { startCountdown() })

  function handleDigit(idx: number, value: string) {
    const char = value.slice(-1)
    if (!/^\d$/.test(char) && char !== '') return

    const next = [...digits]
    next[idx] = char
    setDigits(next)

    if (char && idx < CODE_LENGTH - 1) {
      inputRefs.current[idx + 1]?.focus()
    }

    if (next.every((d) => d !== '')) {
      verifyCode(next.join(''))
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, CODE_LENGTH)
    if (pasted.length === CODE_LENGTH) {
      const next = pasted.split('')
      setDigits(next)
      verifyCode(pasted)
    }
  }

  async function verifyCode(code: string) {
    setError(null)
    setLoading(true)
    try {
      const res = await fetch('/api/sms/verify', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ leadId: store.leadId, code }),
      })
      const json = await res.json()
      if (json.verified) {
        store.setSmsCodeVerified(true)
        store.markStageComplete(14)
        trackEvent('otp_verified')
        router.push('/funnel/confirmation')
      } else {
        setError('That code doesn\'t match. Please check and try again.')
        setDigits(Array(CODE_LENGTH).fill(''))
        inputRefs.current[0]?.focus()
      }
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  async function resendCode() {
    if (!canResend) return
    await fetch('/api/sms/send', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ leadId: store.leadId, phone: store.phone }),
    })
    trackEvent('otp_resent')
    startCountdown()
    setDigits(Array(CODE_LENGTH).fill(''))
    inputRefs.current[0]?.focus()
  }

  return (
    <div className="stage-enter space-y-8">
      <div className="space-y-2">
        <h1 className="font-serif text-3xl font-semibold text-primary-text">Check your phone</h1>
        <p className="text-primary-text/60">
          We&apos;ve sent a 6-digit code to <strong>{maskPhone(store.phone)}</strong>
        </p>
      </div>

      <div className="flex justify-center gap-2" onPaste={handlePaste}>
        {digits.map((digit, i) => (
          <input
            key={i}
            ref={(el) => { inputRefs.current[i] = el }}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={1}
            value={digit}
            onChange={(e) => handleDigit(i, e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Backspace' && !digits[i] && i > 0) {
                inputRefs.current[i - 1]?.focus()
              }
            }}
            disabled={loading}
            className="h-14 w-12 rounded-lg border-2 border-border bg-white text-center text-xl font-semibold text-primary-text focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent disabled:opacity-50"
          />
        ))}
      </div>

      {error && (
        <Card className="border-error/30 bg-error/5">
          <p className="text-sm text-error">{error}</p>
        </Card>
      )}

      <div className="text-center">
        {canResend ? (
          <button
            type="button"
            onClick={resendCode}
            className="text-sm text-accent underline-offset-4 hover:underline"
          >
            Resend code
          </button>
        ) : (
          <p className="text-sm text-primary-text/40">
            Resend available in {resendCountdown}s
          </p>
        )}
      </div>
    </div>
  )
}

'use client'

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
  }
}

export function trackEvent(event: string, params?: Record<string, unknown>) {
  if (typeof window === 'undefined') return
  if (typeof window.gtag === 'function') {
    window.gtag('event', event, params)
  }
  // Fallback: dev logging
  if (process.env.NODE_ENV === 'development') {
    console.log('[analytics]', event, params)
  }
}

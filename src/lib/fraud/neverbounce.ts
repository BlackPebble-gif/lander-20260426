export type NeverBounceResult = 'valid' | 'invalid' | 'disposable' | 'catchall' | 'unknown'

export async function verifyEmail(email: string): Promise<NeverBounceResult> {
  const key = process.env.NEVERBOUNCE_API_KEY
  if (!key) return 'unknown'

  try {
    const res = await fetch(
      `https://api.neverbounce.com/v4/single/check?key=${key}&email=${encodeURIComponent(email)}`
    )
    const data = await res.json()
    return data.result ?? 'unknown'
  } catch {
    return 'unknown'
  }
}

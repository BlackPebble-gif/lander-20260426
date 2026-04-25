export interface RecaptchaResult {
  success: boolean
  score: number
  action: string
}

export async function verifyRecaptcha(token: string): Promise<RecaptchaResult> {
  const secret = process.env.RECAPTCHA_SECRET_KEY
  if (!secret || !token) return { success: false, score: 0, action: '' }

  const res = await fetch('https://www.google.com/recaptcha/api/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body:   `secret=${secret}&response=${token}`,
  })

  const data = await res.json()
  return {
    success: data.success === true,
    score:   data.score ?? 0,
    action:  data.action ?? '',
  }
}

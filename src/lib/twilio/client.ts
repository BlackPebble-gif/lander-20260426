import twilio from 'twilio'

let _client: ReturnType<typeof twilio> | null = null

export function getTwilioClient() {
  if (!_client) {
    const sid   = process.env.TWILIO_ACCOUNT_SID
    const token = process.env.TWILIO_AUTH_TOKEN
    if (!sid || !token) throw new Error('Twilio credentials not configured')
    _client = twilio(sid, token)
  }
  return _client
}

export async function sendSms(to: string, body: string) {
  const client = getTwilioClient()
  return client.messages.create({
    to,
    from: process.env.TWILIO_FROM_NUMBER!,
    body,
  })
}

export async function startVerification(phone: string) {
  const client    = getTwilioClient()
  const serviceSid = process.env.TWILIO_VERIFY_SERVICE_SID!
  return client.verify.v2.services(serviceSid).verifications.create({
    to:      phone,
    channel: 'sms',
  })
}

export async function checkVerification(phone: string, code: string) {
  const client    = getTwilioClient()
  const serviceSid = process.env.TWILIO_VERIFY_SERVICE_SID!
  const check = await client.verify.v2.services(serviceSid).verificationChecks.create({
    to:   phone,
    code,
  })
  return check.status === 'approved'
}

export function validateTwilioSignature(
  signature: string,
  url: string,
  params: Record<string, string>
): boolean {
  const authToken = process.env.TWILIO_AUTH_TOKEN
  if (!authToken) return false
  return twilio.validateRequest(authToken, signature, url, params)
}

export interface IpqsResult {
  fraud_score: number
  vpn: boolean
  tor: boolean
  recent_abuse: boolean
  bot_status: boolean
}

export async function checkIpqs(ip: string): Promise<IpqsResult | null> {
  const key = process.env.IPQS_API_KEY
  if (!key) return null

  try {
    const res = await fetch(
      `https://www.ipqualityscore.com/api/json/ip/${key}/${encodeURIComponent(ip)}?strictness=1`
    )
    return await res.json()
  } catch {
    return null
  }
}

export function isIpqsFraud(result: IpqsResult | null): boolean {
  if (!result) return false
  return result.fraud_score > 85 || result.bot_status || result.tor
}

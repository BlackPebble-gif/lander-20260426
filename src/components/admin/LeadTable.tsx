import { ScoreBadge } from './ScoreBadge'
import type { Lead } from '@/types/lead'

interface LeadTableProps {
  leads: Lead[]
}

export function LeadTable({ leads }: LeadTableProps) {
  if (leads.length === 0) {
    return <p className="text-sm text-primary-text/40">No leads yet.</p>
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-white">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-left text-xs text-primary-text/40">
            <th className="px-4 py-3 font-medium">Date</th>
            <th className="px-4 py-3 font-medium">Name</th>
            <th className="px-4 py-3 font-medium">Procedure</th>
            <th className="px-4 py-3 font-medium">Tier</th>
            <th className="px-4 py-3 font-medium">SMS</th>
            <th className="px-4 py-3 font-medium">Delivered</th>
            <th className="px-4 py-3 font-medium"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {leads.map((lead) => (
            <tr key={lead.id} className="hover:bg-[#F5F4F1]">
              <td className="px-4 py-3 text-primary-text/50">
                {new Date(lead.created_at).toLocaleDateString('en-AU')}
              </td>
              <td className="px-4 py-3 font-medium text-primary-text">
                {lead.first_name}
              </td>
              <td className="px-4 py-3 text-primary-text/70">
                {lead.procedure?.replace(/_/g, ' ') ?? '—'}
              </td>
              <td className="px-4 py-3">
                {lead.tier && (
                  <ScoreBadge tier={lead.tier} score={lead.intent_score} />
                )}
              </td>
              <td className="px-4 py-3">
                {lead.sms_response_confirmed ? (
                  <span className="text-success">YES received</span>
                ) : lead.sms_code_verified ? (
                  <span className="text-cta">Awaiting YES</span>
                ) : (
                  <span className="text-primary-text/30">Pending</span>
                )}
              </td>
              <td className="px-4 py-3">
                {lead.delivered_at ? (
                  <span className="text-success">Delivered</span>
                ) : (
                  <span className="text-primary-text/30">—</span>
                )}
              </td>
              <td className="px-4 py-3">
                <a
                  href={`/admin/leads/${lead.id}`}
                  className="text-accent underline-offset-4 hover:underline"
                >
                  View
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

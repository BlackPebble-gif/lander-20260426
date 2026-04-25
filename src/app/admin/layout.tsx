import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

function isAuthorised(): boolean {
  const hdrs   = headers()
  const cookie = hdrs.get('cookie') ?? ''
  const secret = process.env.ADMIN_SECRET
  if (!secret) return process.env.NODE_ENV === 'development'
  return cookie.includes(`admin_token=${secret}`)
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  if (!isAuthorised()) redirect('/')

  return (
    <div className="flex min-h-screen flex-col bg-[#F5F4F1]">
      <header className="border-b border-border bg-white px-6 py-4">
        <nav className="flex items-center gap-6">
          <span className="font-serif font-semibold text-primary-text">Admin</span>
          <a href="/admin"          className="text-sm text-primary-text/60 hover:text-accent">Dashboard</a>
          <a href="/admin/leads"    className="text-sm text-primary-text/60 hover:text-accent">Leads</a>
          <a href="/admin/analytics" className="text-sm text-primary-text/60 hover:text-accent">Analytics</a>
        </nav>
      </header>
      <main className="flex-1 p-6">{children}</main>
    </div>
  )
}

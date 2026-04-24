import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Find Your Surgeon',
  robots: { index: false, follow: false },
}

export default function FunnelLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <main className="mx-auto w-full max-w-lg flex-1 px-4 py-8 md:py-12">
        {children}
      </main>
      <footer className="py-6 text-center text-xs text-primary-text/30">
        Your information is private and never shared without your consent.
      </footer>
    </div>
  )
}

import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Find Your Surgeon',
  description: 'Expert matching for plastic surgery consultations in Australia.',
  robots: { index: false, follow: false },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background text-primary-text">
        {children}
      </body>
    </html>
  )
}

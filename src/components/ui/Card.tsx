import { cn } from '@/lib/utils'

interface CardProps {
  className?: string
  children: React.ReactNode
}

export function Card({ className, children }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-xl border border-border bg-white p-6 shadow-sm',
        className
      )}
    >
      {children}
    </div>
  )
}

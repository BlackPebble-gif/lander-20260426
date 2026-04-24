import { cn } from '@/lib/utils'

interface CalloutBoxProps {
  variant?: 'info' | 'warning' | 'success' | 'safety'
  children: React.ReactNode
  className?: string
}

export function CalloutBox({ variant = 'info', children, className }: CalloutBoxProps) {
  return (
    <div
      className={cn(
        'rounded-lg border p-4 text-sm',
        {
          'border-accent/20 bg-accent/5 text-accent':           variant === 'info',
          'border-cta/20 bg-cta/5 text-primary-text':           variant === 'warning',
          'border-success/20 bg-success/5 text-success':        variant === 'success',
          'border-error/20 bg-error/5 text-error':              variant === 'safety',
        },
        className
      )}
    >
      {children}
    </div>
  )
}

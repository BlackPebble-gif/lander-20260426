'use client'

import { cn } from '@/lib/utils'

interface OptionCardProps {
  label: string
  description?: string
  selected?: boolean
  onClick?: () => void
  badge?: string
  chevron?: boolean
  safetyNote?: string
  className?: string
}

export function OptionCard({
  label,
  description,
  selected = false,
  onClick,
  badge,
  chevron = false,
  safetyNote,
  className,
}: OptionCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'group relative w-full rounded-xl border bg-white p-4 text-left transition-all duration-150',
        'hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
        selected
          ? 'border-accent bg-accent/5 shadow-sm'
          : 'border-border hover:border-accent/50',
        className
      )}
    >
      {badge && (
        <span className="absolute right-3 top-3 rounded-full bg-cta/20 px-2 py-0.5 text-xs font-medium text-cta">
          {badge}
        </span>
      )}
      <div className="flex items-center justify-between gap-3">
        <div className="flex-1">
          <p className={cn('font-serif font-semibold text-primary-text', selected && 'text-accent')}>
            {label}
          </p>
          {description && (
            <p className="mt-0.5 text-sm text-primary-text/60">{description}</p>
          )}
          {safetyNote && (
            <p className="mt-2 text-xs text-error/80">{safetyNote}</p>
          )}
        </div>
        {chevron && (
          <span className={cn('text-lg transition-colors', selected ? 'text-accent' : 'text-border group-hover:text-accent/60')}>
            ›
          </span>
        )}
        {selected && !chevron && (
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent text-white text-xs">✓</span>
        )}
      </div>
    </button>
  )
}

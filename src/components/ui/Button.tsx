'use client'

import { cn } from '@/lib/utils'
import type { ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  fullWidth?: boolean
}

export function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-40',
        {
          // Variants
          'bg-cta text-white hover:opacity-90 active:scale-[0.98]':
            variant === 'primary',
          'border border-border bg-background text-primary-text hover:bg-[#F0EDE6] active:scale-[0.98]':
            variant === 'secondary',
          'text-accent underline-offset-4 hover:underline':
            variant === 'ghost',
          // Sizes
          'h-9 rounded px-4 text-sm':  size === 'sm',
          'h-12 rounded-lg px-6 text-base': size === 'md',
          'h-14 rounded-lg px-8 text-lg':   size === 'lg',
          // Width
          'w-full': fullWidth,
        },
        className
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
}

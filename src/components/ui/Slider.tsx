'use client'

import { cn } from '@/lib/utils'

interface SliderProps {
  min: number
  max: number
  step?: number
  value: number
  onChange: (value: number) => void
  formatLabel?: (value: number) => string
  className?: string
}

export function Slider({
  min,
  max,
  step = 1000,
  value,
  onChange,
  formatLabel,
  className,
}: SliderProps) {
  const pct = ((value - min) / (max - min)) * 100

  return (
    <div className={cn('w-full', className)}>
      <div className="mb-3 text-center">
        <span className="font-serif text-3xl font-semibold text-accent">
          {formatLabel ? formatLabel(value) : value}
        </span>
      </div>
      <div className="relative">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full cursor-pointer appearance-none"
          style={{
            background: `linear-gradient(to right, #2D4A3E ${pct}%, #E8E4DC ${pct}%)`,
            height: '4px',
            borderRadius: '2px',
            outline: 'none',
          }}
        />
      </div>
      <div className="mt-1 flex justify-between text-xs text-primary-text/40">
        <span>{formatLabel ? formatLabel(min) : min}</span>
        <span>{formatLabel ? formatLabel(max) : max}</span>
      </div>
    </div>
  )
}

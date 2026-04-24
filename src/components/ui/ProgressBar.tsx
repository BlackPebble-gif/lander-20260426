interface ProgressBarProps {
  current: number
  total: number
}

export function ProgressBar({ current, total }: ProgressBarProps) {
  const pct = Math.round((current / total) * 100)
  return (
    <div className="w-full">
      <div className="mb-1 flex items-center justify-between text-xs text-primary-text/50">
        <span>Step {current} of {total}</span>
        <span>{pct}%</span>
      </div>
      <div className="h-1 w-full overflow-hidden rounded-full bg-border">
        <div
          className="h-full rounded-full bg-accent transition-all duration-300 ease-out"
          style={{ width: `${pct}%` }}
          role="progressbar"
          aria-valuenow={current}
          aria-valuemin={1}
          aria-valuemax={total}
        />
      </div>
    </div>
  )
}

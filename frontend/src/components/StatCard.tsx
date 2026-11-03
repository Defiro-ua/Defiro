import type { ReactNode } from 'react'
import { cx } from '../lib/cx'

type StatTone = 'soft' | 'error' | 'warning' | 'info'

const tones: Record<StatTone, { box: string; label: string }> = {
  soft: { box: 'bg-soft', label: 'text-ink-3' },
  error: { box: 'bg-error-soft', label: 'text-error' },
  warning: { box: 'bg-warning-soft', label: 'text-warning' },
  info: { box: 'bg-info-soft', label: 'text-info' },
}

type StatCardProps = {
  label: string
  value: string | number
  tone?: StatTone
  compact?: boolean
  className?: string
  children?: ReactNode
}

/** Indicator card: label, big number and a caption. */
export function StatCard({ label, value, tone = 'soft', compact, className, children }: StatCardProps) {
  const t = tones[tone]
  return (
    <div
      className={cx(
        'flex grow flex-col rounded-md',
        compact ? 'basis-45 gap-1 px-6 py-5' : 'basis-55 gap-1.5 p-6',
        t.box,
        className,
      )}
    >
      <p className={cx('text-label-sm font-semibold', t.label)}>{label}</p>
      <p className="text-stat tabular-nums">{value}</p>
      {children}
    </div>
  )
}

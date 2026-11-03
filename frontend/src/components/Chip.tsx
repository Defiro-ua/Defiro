import type { ReactNode } from 'react'
import { cx } from '../lib/cx'
import { Icon, type IconName } from './Icon'

export type ChipTone =
  | 'neutral'
  | 'muted'
  | 'soft'
  | 'soft-warning'
  | 'info'
  | 'success'
  | 'warning'
  | 'error'
  | 'accent'
  | 'brand'
  | 'outline'
export type ChipSize = 'md' | 'sm' | 'xs'

const tones: Record<ChipTone, string> = {
  neutral: 'bg-line text-ink-2',
  muted: 'bg-line text-ink-3',
  soft: 'bg-soft text-ink-2',
  'soft-warning': 'bg-soft text-warning',
  info: 'bg-info-soft text-info',
  success: 'bg-success-soft text-success',
  warning: 'bg-warning-soft text-warning',
  error: 'bg-error-soft text-error',
  accent: 'bg-accent-soft text-accent-ink',
  brand: 'bg-brand text-on-brand',
  outline: 'border border-dashed border-field bg-panel text-ink-2',
}

const sizes: Record<ChipSize, string> = {
  md: 'h-7 gap-1.5 px-3 text-label-sm',
  sm: 'h-6.5 gap-1.5 px-2.5 text-caption',
  xs: 'h-6 gap-1 px-2.5 text-caption',
}

type ChipProps = {
  tone?: ChipTone
  size?: ChipSize
  /** Small status dot before the label */
  dot?: boolean
  icon?: IconName
  className?: string
  children: ReactNode
}

/** Status chip / badge. Sentence case, never uppercase. */
export function Chip({ tone = 'neutral', size = 'md', dot, icon, className, children }: ChipProps) {
  return (
    <span
      data-chip
      className={cx(
        'inline-flex shrink-0 items-center whitespace-nowrap rounded-pill font-semibold',
        tones[tone],
        sizes[size],
        className,
      )}
    >
      {dot && <span aria-hidden="true" className="size-2 rounded-full bg-current" />}
      {icon && <Icon name={icon} size={size === 'md' ? 16 : 14} />}
      {children}
    </span>
  )
}

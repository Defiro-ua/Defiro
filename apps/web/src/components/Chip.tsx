import type { ReactNode } from 'react'
import type { Tone } from '../domain/types'
import { cx } from '../lib/cx'
import { Icon, type IconName } from './Icon'

const tones: Record<Tone, string> = {
  ok: 'bg-success-soft text-success',
  warn: 'bg-warning-soft text-warning',
  bad: 'bg-error-soft text-error',
  info: 'bg-info-soft text-info',
  neutro: 'bg-chip text-ink-2',
}

/** md 28px · sm 26px · xs 24px · xxs 22px */
export type ChipSize = 'md' | 'sm' | 'xs' | 'xxs'

const sizes: Record<ChipSize, string> = {
  md: 'min-h-7 gap-1.5 px-3 py-0.5 text-[13px]',
  sm: 'min-h-6.5 gap-1.5 px-2.5 text-[12px]',
  xs: 'min-h-6 gap-1.5 px-2.5 text-[12px]',
  xxs: 'min-h-5.5 gap-1 px-2 text-[12px]',
}

type ChipProps = {
  tone?: Tone
  size?: ChipSize
  icon?: IconName
  iconSize?: number
  className?: string
  children: ReactNode
}

/** Status chip. Sentence case, never uppercase. */
export function Chip({ tone = 'neutro', size = 'md', icon, iconSize, className, children }: ChipProps) {
  return (
    <span
      className={cx(
        'edge box-border inline-flex items-center rounded-pill leading-[18px] font-semibold whitespace-nowrap',
        tones[tone],
        sizes[size],
        className,
      )}
    >
      {icon && <Icon name={icon} size={iconSize ?? (size === 'xxs' ? 12 : 14)} />}
      {children}
    </span>
  )
}

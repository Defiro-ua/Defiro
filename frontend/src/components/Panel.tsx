import type { ElementType, HTMLAttributes, ReactNode } from 'react'
import { cx } from '../lib/cx'

type PanelVariant = 'panel' | 'soft' | 'tint' | 'success' | 'info' | 'error' | 'warning'
type PanelPadding = 'none' | 'sm' | 'md' | 'lg' | 'xl'

const variants: Record<PanelVariant, string> = {
  panel: 'bg-panel border border-line',
  soft: 'bg-soft',
  tint: 'bg-tint',
  success: 'bg-success-soft',
  info: 'bg-info-soft',
  error: 'bg-error-soft',
  warning: 'bg-warning-soft',
}

const paddings: Record<PanelPadding, string> = {
  none: '',
  sm: 'p-5',
  md: 'p-5 sm:p-6',
  lg: 'p-5 sm:p-7',
  xl: 'p-6 sm:p-8',
}

type PanelProps = HTMLAttributes<HTMLElement> & {
  as?: ElementType
  variant?: PanelVariant
  padding?: PanelPadding
  /** Floating panel (decision boxes, sticky bars) */
  elevated?: boolean
  children?: ReactNode
}

/** Rounded surface for cards, panels and side boxes. */
export function Panel({
  as: Component = 'section',
  variant = 'panel',
  padding = 'md',
  elevated,
  className,
  children,
  ...rest
}: PanelProps) {
  return (
    <Component
      className={cx('rounded-md', variants[variant], paddings[padding], elevated && 'shadow-island', className)}
      {...rest}
    >
      {children}
    </Component>
  )
}

import type { ReactNode } from 'react'
import { cx } from '../../lib/cx'

type SwitchProps = {
  checked: boolean
  onChange: (checked: boolean) => void
  /** Visible label next to the switch; when omitted, `ariaLabel` is required */
  children?: ReactNode
  ariaLabel?: string
  className?: string
}

export function Switch({ checked, onChange, children, ariaLabel, className }: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      onClick={() => onChange(!checked)}
      className={cx('inline-flex min-h-11 items-center gap-2.5 px-1 text-body-sm font-semibold text-ink', className)}
    >
      <span
        aria-hidden="true"
        className={cx(
          'flex h-6.5 w-11 shrink-0 rounded-pill p-0.75 transition',
          checked ? 'justify-end bg-brand' : 'justify-start bg-line-strong',
        )}
      >
        <span className="size-5 rounded-full bg-bg" />
      </span>
      {children}
    </button>
  )
}

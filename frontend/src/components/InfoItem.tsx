import type { ReactNode } from 'react'
import { cx } from '../lib/cx'

type InfoItemProps = {
  label: string
  children: ReactNode
  numeric?: boolean
  className?: string
}

/** A read-only value with its label (inside a <dl>). */
export function InfoItem({ label, children, numeric, className }: InfoItemProps) {
  return (
    <div className={cx('flex grow basis-50 flex-col gap-0.5', className)}>
      <dt className="text-label-sm font-semibold text-ink-3">{label}</dt>
      <dd className={cx('text-body-md', numeric && 'tabular-nums')}>{children}</dd>
    </div>
  )
}

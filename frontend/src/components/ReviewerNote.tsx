import type { ReactNode } from 'react'
import { cx } from '../lib/cx'

type ReviewerNoteProps = {
  author: string
  children: ReactNode
  className?: string
}

/** A reviewer's note attached to a field. */
export function ReviewerNote({ author, children, className }: ReviewerNoteProps) {
  return (
    <span className={cx('block rounded-md border-l-3 border-yellow bg-warning-soft px-3.5 py-2.5 text-body-sm text-warning', className)}>
      <strong className="font-semibold text-ink">{author}</strong>
      <br />
      {children}
    </span>
  )
}

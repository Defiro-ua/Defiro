import type { ReactNode } from 'react'
import { cx } from '../lib/cx'

/** Orange highlight for the key word of a two-tone title. */
export function Accent({ children }: { children: ReactNode }) {
  return <span className="text-orange">{children}</span>
}

type PageTitleProps = {
  children: ReactNode
  /** Whole title in brand orange (single-word titles such as "Workflows") */
  accent?: boolean
  as?: 'h1' | 'h2'
  className?: string
}

/** Page title (headline-lg). Two-tone: wrap the key word in <Accent>. */
export function PageTitle({ children, accent, as: Tag = 'h1', className }: PageTitleProps) {
  return <Tag className={cx('text-headline-lg', accent && 'text-orange', className)}>{children}</Tag>
}

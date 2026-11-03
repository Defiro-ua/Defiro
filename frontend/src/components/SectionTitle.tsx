import type { ReactNode } from 'react'
import { cx } from '../lib/cx'

type SectionTitleProps = {
  as?: 'h2' | 'h3'
  /** lg: card titles (20px) · sm: 18px · md: panel headings (16px) */
  size?: 'lg' | 'sm' | 'md'
  id?: string
  className?: string
  children: ReactNode
}

const sizes = {
  lg: 'text-title-lg',
  sm: 'text-title-sm',
  md: 'text-title-md',
}

export function SectionTitle({ as: Tag = 'h2', size = 'lg', id, className, children }: SectionTitleProps) {
  return (
    <Tag id={id} className={cx(sizes[size], 'font-semibold', className)}>
      {children}
    </Tag>
  )
}

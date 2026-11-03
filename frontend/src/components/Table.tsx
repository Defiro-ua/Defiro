import type { HTMLAttributes, ReactNode, TdHTMLAttributes, ThHTMLAttributes } from 'react'
import { cx } from '../lib/cx'

/** Rounded, horizontally scrollable frame around a table. */
export function TableFrame({ panel, className, children }: { panel?: boolean; className?: string; children: ReactNode }) {
  return (
    <div className={cx('relative overflow-x-auto rounded-md border border-line', panel && 'bg-panel', className)}>{children}</div>
  )
}

export function HeadRow({ children }: { children: ReactNode }) {
  return <tr className="bg-soft text-left">{children}</tr>
}

type ThProps = ThHTMLAttributes<HTMLTableCellElement> & {
  align?: 'left' | 'right'
  tone?: 'muted' | 'accent'
  /** `roomy`: taller header row · `edge`: first/last column of wide tables */
  pad?: 'default' | 'roomy' | 'edge'
}

const headPadding = { default: 'px-4 py-3', roomy: 'px-4 py-3.5', edge: 'px-5 py-3.5' }

export function Th({ align = 'left', tone = 'muted', pad = 'default', className, children, ...rest }: ThProps) {
  return (
    <th
      scope="col"
      className={cx(
        headPadding[pad],
        'text-label-sm font-semibold',
        tone === 'accent' ? 'text-accent-ink' : 'text-ink-3',
        align === 'right' && 'text-right',
        className,
      )}
      {...rest}
    >
      {children}
    </th>
  )
}

export function Tr({ className, children, ...rest }: HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr className={cx('border-t border-line', className)} {...rest}>
      {children}
    </tr>
  )
}

type TdProps = TdHTMLAttributes<HTMLTableCellElement> & {
  align?: 'left' | 'right'
  numeric?: boolean
  /**
   * `action`: tight cell around an icon button · `input`: cell holding a text input ·
   * `roomy`: 16px all round · `edge`: first column of wide tables · `actions`: last column with links
   */
  pad?: 'default' | 'compact' | 'action' | 'input' | 'roomy' | 'edge' | 'actions'
}

const cellPadding = {
  default: 'px-4 py-3.5',
  compact: 'px-4 py-3',
  action: 'px-2 py-1',
  input: 'px-4 py-2',
  roomy: 'p-4',
  edge: 'px-5 py-4',
  actions: 'px-5 py-2.5',
}

export function Td({ align = 'left', numeric, pad = 'default', className, children, ...rest }: TdProps) {
  return (
    <td className={cx(cellPadding[pad], align === 'right' && 'text-right', numeric && 'tabular-nums', className)} {...rest}>
      {children}
    </td>
  )
}

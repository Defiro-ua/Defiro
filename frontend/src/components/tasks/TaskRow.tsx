import type { ReactNode } from 'react'
import { deadlineTone, procedureIcon, type DeadlineState, type ProcedureKind } from '../../data/types'
import { cx } from '../../lib/cx'
import { Chip, type ChipTone } from '../Chip'
import { IconTile } from '../IconTile'

type TaskRowProps = {
  kind: ProcedureKind
  title: string
  tag?: { label: string; tone: ChipTone }
  meta: string
  /** Third line (automatic assignment, detected conflict) */
  extra?: { text: string; tone: 'warning' | 'error' }
  deadline: string
  deadlineState: DeadlineState
  highlight?: boolean
  action: ReactNode
}

/** A task in an inbox list: procedure icon, who and what, deadline and the action. */
export function TaskRow({ kind, title, tag, meta, extra, deadline, deadlineState, highlight, action }: TaskRowProps) {
  return (
    <li className={cx('flex flex-wrap items-center gap-x-5 gap-y-3 px-5 py-5 sm:px-6', highlight && 'bg-soft-hover')}>
      <IconTile icon={procedureIcon[kind]} />
      <div className="flex min-w-0 grow basis-70 flex-col gap-0.5">
        <span className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
          <h3 className="text-title-md font-semibold">{title}</h3>
          {tag && (
            <Chip tone={tag.tone} size="xs">
              {tag.label}
            </Chip>
          )}
        </span>
        <p className="text-body-sm text-ink-3 tabular-nums">{meta}</p>
        {extra && (
          <p className={cx('text-label-sm leading-4.75', extra.tone === 'warning' ? 'font-semibold text-warning' : 'text-error')}>
            {extra.text}
          </p>
        )}
      </div>
      <Chip tone={deadlineTone[deadlineState]} icon="clock">
        {deadline}
      </Chip>
      {action}
    </li>
  )
}

/** List frame for task rows */
export function TaskList({ label, children }: { label?: string; children: ReactNode }) {
  return (
    <ul aria-label={label} className="divide-y divide-line overflow-hidden rounded-md border border-line bg-panel">
      {children}
    </ul>
  )
}

import { cx } from '../../lib/cx'
import type { NotificationKind } from '../../data/types'

const marks: Record<NotificationKind, { glyph: string; tone: string }> = {
  task: { glyph: '●', tone: 'bg-soft text-accent-ink' },
  deadline: { glyph: '!', tone: 'bg-warning-soft text-warning' },
  ok: { glyph: '✓', tone: 'bg-success-soft text-success' },
  info: { glyph: 'i', tone: 'bg-info-soft text-info' },
}

/** Small tinted mark showing the kind of a notification. */
export function NotificationMark({ kind, shape = 'circle' }: { kind: NotificationKind; shape?: 'circle' | 'tile' }) {
  const mark = marks[kind]
  return (
    <span
      aria-hidden="true"
      className={cx(
        'grid shrink-0 place-items-center font-extrabold',
        shape === 'circle' ? 'size-8 rounded-full text-body-sm' : 'size-10 rounded-md text-label-md',
        mark.tone,
      )}
    >
      {mark.glyph}
    </span>
  )
}

import { cx } from '../lib/cx'

export type HistoryEntry = { when: string; text: string; now?: boolean }

/** Vertical history of a procedure; the last entry can be the current moment. */
export function HistoryTimeline({ entries }: { entries: HistoryEntry[] }) {
  return (
    <ol className="flex flex-col">
      {entries.map((entry, i) => {
        const next = entries[i + 1]
        return (
          <li key={i} className={cx('relative flex gap-3', next && 'pb-4.5')}>
            {next && (
              <span
                aria-hidden="true"
                className={cx('absolute top-2.5 bottom-0 left-3.25 w-0.5', next.now ? 'bg-line-strong' : 'bg-orange')}
              />
            )}
            <span aria-hidden="true" className="relative flex w-7 shrink-0 justify-center">
              <span
                className={cx(
                  'rounded-full',
                  entry.now ? 'size-5.5 border-5 border-orange bg-bg shadow-halo-sm' : 'mt-1 size-3.5 bg-orange',
                )}
              />
            </span>
            <span className="flex flex-col text-body-sm leading-5">
              <strong className="font-semibold tabular-nums">{entry.when}</strong>
              <span className="text-ink-2">{entry.text}</span>
            </span>
          </li>
        )
      })}
    </ol>
  )
}

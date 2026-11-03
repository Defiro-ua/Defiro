import { useRef, type KeyboardEvent } from 'react'
import { cx } from '../lib/cx'
import { panelId, tabId } from '../lib/tabs'

export type TabItem<T extends string> = { id: T; label: string }

type SegmentedTabsProps<T extends string> = {
  items: Array<TabItem<T>>
  value: T
  onChange: (id: T) => void
  label: string
  /** Prefix for tab/panel ids, so panels can point back with aria-labelledby */
  idPrefix: string
  size?: 'sm' | 'md'
  className?: string
}


/** Pill tab list (ARIA tabs pattern, with arrow-key navigation). */
export function SegmentedTabs<T extends string>({
  items,
  value,
  onChange,
  label,
  idPrefix,
  size = 'md',
  className,
}: SegmentedTabsProps<T>) {
  const refs = useRef<Array<HTMLButtonElement | null>>([])

  function onKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const last = items.length - 1
    const next =
      event.key === 'ArrowRight' ? (index === last ? 0 : index + 1)
      : event.key === 'ArrowLeft' ? (index === 0 ? last : index - 1)
      : event.key === 'Home' ? 0
      : event.key === 'End' ? last
      : -1
    if (next < 0) return
    event.preventDefault()
    onChange(items[next].id)
    refs.current[next]?.focus()
  }

  return (
    <div
      role="tablist"
      aria-label={label}
      className={cx('flex max-w-full flex-wrap gap-1 self-start rounded-pill bg-soft p-1', className)}
    >
      {items.map((item, index) => {
        const selected = item.id === value
        return (
          <button
            key={item.id}
            ref={(el) => {
              refs.current[index] = el
            }}
            type="button"
            role="tab"
            id={tabId(idPrefix, item.id)}
            aria-selected={selected}
            aria-controls={panelId(idPrefix, item.id)}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(item.id)}
            onKeyDown={(event) => onKeyDown(event, index)}
            className={cx(
              'min-h-10 whitespace-nowrap rounded-pill text-body-sm transition',
              size === 'md' ? 'px-4.5' : 'px-4',
              selected ? 'bg-brand font-semibold text-on-brand' : 'text-ink-2 hover:bg-bg',
            )}
          >
            {item.label}
          </button>
        )
      })}
    </div>
  )
}

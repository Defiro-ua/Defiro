import type { ReactNode } from 'react'
import { cx } from '../../lib/cx'

type ChoiceCardProps = {
  name: string
  value: string
  checked: boolean
  onSelect: (value: string) => void
  disabled?: boolean
  /**
   * `native`: the browser radio is shown (reason picker, transport);
   * `dot`: a drawn radio dot; `none`: the whole card is the indicator (dates).
   */
  indicator?: 'native' | 'dot' | 'none'
  /** `strong`: 2px orange outline on accent-soft; `soft`: 1.5px outline on soft-hover */
  emphasis?: 'strong' | 'soft'
  /** Unselected outline colour */
  outline?: 'line-strong' | 'field'
  dotSize?: 'sm' | 'md'
  /** `stack`: content in a column (date choices) */
  layout?: 'row' | 'stack'
  /** Spacing between indicator and content */
  gap?: string
  className?: string
  children: ReactNode
}

/** A radio option drawn as a card. Uses a real radio input, so arrow keys work within the group. */
export function ChoiceCard({
  name,
  value,
  checked,
  onSelect,
  disabled,
  indicator = 'dot',
  emphasis = 'soft',
  outline = 'line-strong',
  dotSize = 'md',
  layout = 'row',
  gap = 'gap-3.5',
  className,
  children,
}: ChoiceCardProps) {
  const selected =
    emphasis === 'strong' ? 'border-2 border-orange bg-accent-soft' : 'border-emph border-orange bg-soft-hover'
  const idle = outline === 'field' ? 'border border-field bg-panel' : 'border border-line-strong bg-panel'
  return (
    <label
      className={cx(
        'flex rounded-md transition',
        layout === 'row' ? 'items-center' : 'flex-col items-start',
        gap,
        checked ? selected : idle,
        !checked && !disabled && 'hover:border-orange',
        disabled && 'cursor-not-allowed opacity-60',
        indicator !== 'native' && 'has-focus-visible:outline-3 has-focus-visible:outline-offset-2 has-focus-visible:outline-orange',
        className,
      )}
    >
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        disabled={disabled}
        onChange={() => onSelect(value)}
        className={indicator === 'native' ? 'size-5 shrink-0 accent-orange' : 'sr-only'}
      />
      {indicator === 'dot' && (
        <span
          aria-hidden="true"
          className={cx(
            'shrink-0 rounded-full bg-panel',
            dotSize === 'md' ? 'size-5' : 'size-4.5',
            checked ? (dotSize === 'md' ? 'border-6 border-orange' : 'border-5 border-orange') : 'border-emph border-field',
          )}
        />
      )}
      {children}
    </label>
  )
}

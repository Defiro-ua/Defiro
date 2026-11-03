import { useId, type ReactNode } from 'react'
import { cx } from '../../lib/cx'
import { Icon } from '../Icon'
import { Field } from './Field'

type ReadonlyFieldProps = {
  label: ReactNode
  value: string
  /** Where the value comes from (shown with a lock) */
  source: string
  hint?: ReactNode
  numeric?: boolean
  className?: string
}

/** Pre-filled field the person cannot change (profile data from Entra ID or CMD). */
export function ReadonlyField({ label, value, source, hint, numeric, className }: ReadonlyFieldProps) {
  const id = useId()
  const sourceId = `${id}-source`
  return (
    <Field id={id} label={label} hint={hint} className={className}>
      <span className="flex h-12 items-center gap-2 rounded-md bg-soft px-4">
        <input
          id={id}
          readOnly
          value={value}
          aria-describedby={sourceId}
          className={cx('w-0 min-w-0 flex-1 bg-transparent text-body-md outline-none', numeric && 'tabular-nums')}
        />
        <span id={sourceId} className="inline-flex items-center gap-1 whitespace-nowrap text-caption font-semibold text-ink-3">
          <Icon name="lock" size={14} />
          {source}
        </span>
      </span>
    </Field>
  )
}

import type { ReactNode } from 'react'
import { cx } from '../../lib/cx'
import { Icon } from '../Icon'

export function RequiredMark({ tone = 'accent' }: { tone?: 'accent' | 'error' }) {
  return (
    <span className={tone === 'accent' ? 'text-accent-ink' : 'text-error'}>
      <span aria-hidden="true">*</span>
      <span className="sr-only">(obrigatório)</span>
    </span>
  )
}

export function OptionalMark() {
  return <span className="font-normal text-ink-3">(opcional)</span>
}

export type FieldLabelProps = {
  label: ReactNode
  required?: boolean
  requiredTone?: 'accent' | 'error'
  optional?: boolean
}

type FieldProps = FieldLabelProps & {
  id: string
  hint?: ReactNode
  hintId?: string
  error?: ReactNode
  errorId?: string
  /** Extra content under the control (e.g. a reviewer note) */
  after?: ReactNode
  className?: string
  labelClassName?: string
  children: ReactNode
}

/** Label + control + help/error text, stacked. */
export function Field({
  id,
  label,
  required,
  requiredTone,
  optional,
  hint,
  hintId,
  error,
  errorId,
  after,
  className,
  labelClassName,
  children,
}: FieldProps) {
  return (
    <div className={cx('flex flex-col gap-1.5', className)}>
      <label htmlFor={id} className={labelClassName ?? 'text-body-sm leading-5 font-semibold'}>
        {label} {required && <RequiredMark tone={requiredTone} />} {optional && <OptionalMark />}
      </label>
      {children}
      {error && (
        <span id={errorId} className="flex items-center gap-1.5 text-label-sm text-error">
          <Icon name="alertCircle" size={16} />
          {error}
        </span>
      )}
      {hint && (
        <span id={hintId} className="text-label-sm text-ink-3">
          {hint}
        </span>
      )}
      {after}
    </div>
  )
}

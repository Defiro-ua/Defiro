import type { ReactNode } from 'react'
import { cx } from '../../lib/cx'
import { RequiredMark } from './Field'

type FormSectionProps = {
  legend: ReactNode
  required?: boolean
  /** A reviewer flagged this section */
  flagged?: boolean
  /** `row`: short sections laid out on one line (summaries in the correction screen) */
  layout?: 'stack' | 'row'
  id?: string
  className?: string
  children: ReactNode
}

/** A titled group of form fields: <fieldset> with its <legend> on the outline. */
export function FormSection({ legend, required, flagged, layout = 'stack', id, className, children }: FormSectionProps) {
  return (
    <fieldset
      id={id}
      className={cx(
        'min-w-0 rounded-md bg-panel',
        flagged ? 'border-emph border-yellow' : 'border border-line',
        layout === 'stack' ? 'flex flex-col gap-5 p-5 sm:p-7' : 'flex flex-wrap items-center gap-x-6 gap-y-2 px-5 py-6 sm:px-7',
        className,
      )}
    >
      <legend className="-ml-2 px-2 text-title-md font-semibold">
        {legend} {required && <RequiredMark />}
      </legend>
      {children}
    </fieldset>
  )
}

import { Fragment } from 'react'
import { cx } from '../lib/cx'
import { Icon } from './Icon'

/** `nowWarning`: current step waiting on the requester (returned for correction) */
export type MiniStepState = 'done' | 'now' | 'nowWarning' | 'rejected' | 'todo' | 'faded'

type MiniProgressProps = {
  steps: MiniStepState[]
  /** Spoken summary, e.g. "Passo 2 de 4: Validação da chefia" */
  label: string
}

const dot: Record<MiniStepState, string> = {
  done: 'size-3 bg-orange',
  now: 'size-4 border-4 border-orange bg-bg shadow-halo-sm',
  nowWarning: 'size-4 border-4 border-yellow bg-bg shadow-halo-warning',
  rejected: 'size-4 grid place-items-center border-2 border-error bg-error-soft text-error',
  todo: 'size-3 border-2 border-line-strong',
  faded: 'size-3 border-2 border-line',
}

/** Compact dots-and-lines progress used in request lists. */
export function MiniProgress({ steps, label }: MiniProgressProps) {
  return (
    <div role="img" aria-label={label} className="flex items-center">
      {steps.map((state, i) => (
        <Fragment key={i}>
          {i > 0 &&
            (steps[i - 1] === 'done' ? (
              <span className="h-1 w-7 bg-brand-x" />
            ) : (
              <span className={cx('w-7 border-t-2 border-dashed', state === 'faded' ? 'border-line' : 'border-line-strong')} />
            ))}
          <span className={cx('shrink-0 rounded-full', dot[state])}>
            {state === 'rejected' && <Icon name="x" size={10} strokeWidth={3.5} />}
          </span>
        </Fragment>
      ))}
    </div>
  )
}

import { cx } from '../lib/cx'
import type { ProcedureStep } from '../data/types'

type ProgressStepsProps = {
  steps: ProcedureStep[]
  /** Index of the current step; `steps.length` means every step is done */
  current: number
  /** Squeeze into narrow boxes (dialogs) instead of scrolling sideways */
  fit?: boolean
  className?: string
}

/** The procedure's steps on a line: done (orange), now (ring + "Agora"), next (empty ring). */
export function ProgressSteps({ steps, current, fit, className }: ProgressStepsProps) {
  const done = current >= steps.length
  const summary = done
    ? `Procedimento concluído: todos os ${steps.length} passos feitos.`
    : `Passo ${current + 1} de ${steps.length}: ${steps[current].label}.`

  return (
    <div className={cx('relative overflow-x-auto', className)}>
      <p className="sr-only">{summary}</p>
      <ol className={cx('grid auto-cols-fr grid-flow-col pt-2 pb-1', !fit && 'min-w-140')}>
        {steps.map((step, i) => {
          const state = i < current ? 'past' : i === current ? 'now' : 'next'
          const isLast = i === steps.length - 1
          const segmentDone = i < current && !isLast
          // The last finished segment ends in an arrow just before the current dot
          const leadsToNow = segmentDone && i === current - 1
          return (
            <li
              key={step.label}
              aria-current={state === 'now' ? 'step' : undefined}
              className="relative flex flex-col items-center px-2 text-center"
            >
              {!isLast &&
                (segmentDone ? (
                  <span
                    aria-hidden="true"
                    className={cx('absolute top-2.25 left-1/2 -right-1/2 h-2.5 rounded-tile bg-brand-x', leadsToNow && 'mr-8.5')}
                  >
                    {leadsToNow && (
                      <svg viewBox="0 0 16 22" className="absolute -top-1.5 -right-3.5 h-5.5 w-4 fill-orange">
                        <path d="M0 0 16 11 0 22z" />
                      </svg>
                    )}
                  </span>
                ) : (
                  <span
                    aria-hidden="true"
                    className="absolute top-3.25 left-1/2 -right-1/2 border-t-2 border-dashed border-line-strong"
                  />
                ))}
              <span className="relative mb-3 flex h-7 items-center justify-center">
                <span
                  aria-hidden="true"
                  className={cx(
                    'grid place-items-center rounded-full',
                    state === 'past' && 'size-4.5 bg-orange',
                    state === 'now' && 'size-7 border-7 border-orange bg-bg shadow-halo-now dalt:border-3',
                    state === 'next' && 'size-6 border-3 border-line-strong bg-bg dalt:size-7 dalt:border-2 dalt:border-field',
                  )}
                >
                  {/* In colour-blind modes each step also shows its number, so its state does not rest on colour alone */}
                  {state !== 'past' && (
                    <span className="hidden text-caption leading-none font-extrabold text-ink tabular-nums dalt:block">{i + 1}</span>
                  )}
                </span>
              </span>
              <span className={cx('text-label-md', state === 'next' ? 'text-ink-2' : 'font-semibold text-ink')}>
                <span className="sr-only">{state === 'past' ? 'Concluído: ' : state === 'now' ? 'Passo atual: ' : 'Por fazer: '}</span>
                {step.label}
              </span>
              {step.meta && <span className="mt-0.5 text-label-sm text-ink-3">{step.meta}</span>}
              {state === 'now' && (
                <span aria-hidden="true" className="mt-1.5 rounded-pill bg-brand px-2.5 py-0.5 text-caption font-semibold text-on-brand">
                  Agora
                </span>
              )}
            </li>
          )
        })}
      </ol>
    </div>
  )
}

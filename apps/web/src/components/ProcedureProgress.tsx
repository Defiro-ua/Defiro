import { cx } from '../lib/cx'
import { Icon } from './Icon'

export type ProgressStep = { label: string; meta: string; meta2?: string }

type Props = {
  steps: ProgressStep[]
  current: number
  estado?: '' | 'devolvido' | 'rejeitado' | 'fechado'
}

/** Line of the procedure's steps: done, now, still to do */
export function ProcedureProgress({ steps, current, estado = '' }: Props) {
  const n = steps.length
  const cur = estado === 'fechado' ? n : Math.max(0, Math.min(n - 1, current))
  const atual = steps[Math.min(cur, n - 1)]
  const resumo =
    estado === 'fechado'
      ? `Procedimento concluído: todos os ${n} passos feitos.`
      : `Passo ${cur + 1} de ${n}: ${atual?.label || ''}` +
        (estado === 'devolvido' ? ', a corrigir pelo requerente.' : estado === 'rejeitado' ? ', rejeitado.' : '.')
  const half = 50 / n + '%'
  const done = (Math.min(cur, n - 1) * 100) / n + '%'

  return (
    <div className="relative box-border w-full pt-2 pb-1 text-ink">
      <p className="sr-only">{resumo}</p>
      <span aria-hidden="true" className="absolute top-[29px] border-t-2 border-dashed border-line-strong" style={{ left: half, right: half }} />
      {cur > 0 && <span aria-hidden="true" className="absolute top-[27px] h-1.5 rounded-[6px] bg-orange" style={{ left: half, width: done }} />}
      <ol className="relative m-0 grid list-none p-0" style={{ gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))` }}>
        {steps.map((s, i) => {
          const past = i < cur
          const now = i === cur
          const failed = now && estado === 'rejeitado'
          const state = past ? 'Concluído: ' : now ? (failed ? 'Rejeitado neste passo: ' : estado === 'devolvido' ? 'Passo atual, a corrigir: ' : 'Passo atual: ') : 'Por fazer: '
          return (
            <li key={i} aria-current={now ? 'step' : undefined} className="relative flex flex-col items-center px-2 text-center">
              <span className="mb-3 flex h-7 items-center justify-center">
                <span
                  aria-hidden="true"
                  className={cx(
                    'box-border grid place-items-center rounded-full',
                    past && 'size-6 bg-orange text-bg',
                    failed && 'size-7 bg-error text-bg',
                    now && !failed && 'step-dot-now size-7 border-7 border-orange bg-bg shadow-[0_0_0_5px_color-mix(in_srgb,var(--color-orange)_25%,transparent)]',
                    !past && !now && 'step-dot-next size-5.5 border-3 border-line-strong bg-bg',
                  )}
                >
                  {past && <Icon name="check" size={14} />}
                  {failed && <Icon name="x" size={14} />}
                  {!past && !failed && <span className="step-number">{i + 1}</span>}
                </span>
              </span>
              <span className={cx('text-[15px] leading-5', past || now ? 'font-semibold text-ink' : 'font-normal text-ink-2')}>
                <span className="sr-only">{state}</span>
                {s.label}
              </span>
              <span className="mt-0.5 text-label-sm leading-[18px] text-ink-2">{s.meta}</span>
              {s.meta2 && <span className="text-caption leading-[17px] text-ink-3">{s.meta2}</span>}
              {now && failed && (
                <span aria-hidden="true" className="edge mt-1.5 inline-flex items-center gap-1 rounded-pill bg-error-soft px-2.5 py-0.5 text-caption leading-[18px] font-semibold text-error">
                  Rejeitado
                </span>
              )}
              {now && !failed && estado === 'devolvido' && (
                <span aria-hidden="true" className="edge mt-1.5 inline-flex items-center gap-1 rounded-pill bg-warning-soft px-2.5 py-0.5 text-caption leading-[18px] font-semibold text-warning">
                  A corrigir
                </span>
              )}
              {now && !failed && estado !== 'devolvido' && (
                <span aria-hidden="true" className="mt-1.5 inline-flex items-center gap-1 rounded-pill bg-brand px-2.5 py-0.5 text-caption leading-[18px] font-semibold text-on-brand">
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

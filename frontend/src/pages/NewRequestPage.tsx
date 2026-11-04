import { useRef } from 'react'
import { Button } from '../components/Button'
import { Chip } from '../components/Chip'
import { Icon } from '../components/Icon'
import { AppShell } from '../components/layout/AppShell'
import type { PersonaId } from '../domain/types'
import { canStart, totalDays } from '../domain/workflows'
import { useFocusOnArrival } from '../lib/useFocusOnArrival'
import { paths } from '../routes'
import { useDemo } from '../state/demoContext'

/** E03 · Novo pedido (UC13): the procedures the person can start, new workflows included */
export function NewRequestPage({ persona }: { persona: PersonaId }) {
  const { wfs } = useDemo()
  const headingRef = useRef<HTMLHeadingElement>(null)
  useFocusOnArrival(headingRef)
  // only the procedures the person's group or unit can start
  const active = wfs.filter((w) => canStart(w, persona))

  return (
    <AppShell persona={persona} active="novo" mainClassName="max-w-content gap-8">
      <header className="flex flex-col gap-3">
        <h1 ref={headingRef} tabIndex={-1} className="m-0 text-headline-lg outline-none">
          Novo <span className="text-orange">pedido</span>
        </h1>
        <p className="m-0 max-w-prose-lg text-body-lg text-ink-2">Escolha o procedimento. Os dados do seu perfil entram sozinhos no formulário.</p>
      </header>

      <section aria-labelledby="titulo-procedimentos" className="flex flex-col gap-5">
        <h2 id="titulo-procedimentos" className="m-0 text-title-lg font-semibold">
          Procedimentos que pode iniciar · {active.length}
        </h2>
        <ul className="m-0 flex list-none flex-wrap gap-6 p-0">
          {active.map((w) => {
            const dias = totalDays(w)
            return (
              <li key={w.id} className="flex min-w-[280px] flex-[0_1_420px]">
                <article aria-labelledby={'wf-' + w.id} className="box-border flex flex-1 flex-col gap-3.5 rounded-md border border-line bg-panel p-7">
                  <div className="flex items-center justify-between gap-3">
                    <span aria-hidden="true" className="grid size-12 place-items-center rounded-md bg-soft text-accent-ink">
                      <Icon name="briefcase" size={22} />
                    </span>
                    {w.novo && (
                      <Chip tone="info" size="xs" icon="plus">
                        Novo
                      </Chip>
                    )}
                  </div>
                  <h3 id={'wf-' + w.id} className="m-0 text-title-lg font-semibold">
                    {w.nome}
                  </h3>
                  <p className="m-0 text-[15px] leading-6 text-ink-2">{w.desc || 'Sem descrição.'}</p>
                  <dl className="m-0 flex flex-col gap-1.5 text-[14px] leading-[21px]">
                    <div className="flex flex-wrap gap-1.5">
                      <dt className="font-semibold">Vai precisar de:</dt>
                      <dd className="m-0 text-ink-2">{w.precisa || 'os dados pedidos no formulário'}</dd>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      <dt className="font-semibold">Percurso:</dt>
                      <dd className="m-0 text-ink-2">
                        {w.passos.map((x) => x.nome).join(' → ')}
                        {dias ? ` · até ${dias} dias úteis no total` : ''}
                      </dd>
                    </div>
                  </dl>
                  <span className="flex-1" />
                  <Button to={paths.requestForm(w.id)} iconRight="arrowRight" className="self-start">
                    Iniciar pedido<span className="sr-only"> de {w.nome}</span>
                  </Button>
                </article>
              </li>
            )
          })}
        </ul>
      </section>
      <p className="m-0 flex items-start gap-2 text-[14px] leading-[21px] text-ink-2">
        <Icon name="info" size={18} className="text-accent-ink" />
        <span>Só aparecem os procedimentos que a sua unidade pode iniciar. Se precisar de outro, fale com os Recursos Humanos (extensão 2210).</span>
      </p>
    </AppShell>
  )
}

import { useEffect, useRef, useState } from 'react'
import { Navigate, useLocation, useNavigate, useParams } from 'react-router'
import { Button } from '../components/Button'
import { Chip } from '../components/Chip'
import { Flash } from '../components/Flash'
import { Icon } from '../components/Icon'
import { AppShell } from '../components/layout/AppShell'
import { withRole } from '../domain/people'
import type { PersonaId, Workflow } from '../domain/types'
import { fieldsAC, reasonsAC, stepTypes, totalDays } from '../domain/workflows'
import { cx } from '../lib/cx'
import { useFlash } from '../lib/useFlash'
import { useFocusOnArrival } from '../lib/useFocusOnArrival'
import { paths } from '../routes'
import { useDemo, type NavState } from '../state/demoContext'

const facts = (w: Workflow) => [
  { rot: 'Passos', v: String(w.passos.length) },
  { rot: 'Prazo total', v: totalDays(w) + ' dias úteis' },
  { rot: 'Disponível para', v: w.passos[0]?.quem || '—' },
]

/** E12 · Workflows (UC03): each workflow opens its summary in place */
export function WorkflowsPage({ persona }: { persona: PersonaId }) {
  const { wfs } = useDemo()
  const location = useLocation()
  const [flash, closeFlash] = useFlash()
  const headingRef = useRef<HTMLHeadingElement>(null)
  // back from a workflow: its summary opens again and its name gets the focus
  const back = (location.state as NavState | null)?.abrir
  useFocusOnArrival(headingRef, !back)
  // new workflows start open, so the person sees what was just created
  const [open, setOpen] = useState<Record<string, boolean>>(() => (back ? { [back]: true } : {}))
  const isOpen = (w: Workflow) => (open[w.id] !== undefined ? open[w.id] : !!w.novo)
  useEffect(() => {
    if (back) document.getElementById('wfb-' + back)?.focus()
  }, [back])

  const list = wfs.slice().reverse()
  return (
    <AppShell persona={persona} active="workflows" mainClassName="max-w-list gap-7">
      <Flash notice={flash} onClose={closeFlash} />
      <header className="flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
        <div className="flex flex-[1_1_420px] flex-col gap-2.5">
          <h1 ref={headingRef} tabIndex={-1} className="m-0 text-headline-lg outline-none">
            Work<span className="text-orange">flows</span>
          </h1>
          <p className="m-0 max-w-[60ch] text-body-lg text-ink-2">Os procedimentos disponíveis. Escolha um para ver o resumo.</p>
        </div>
      </header>

      <section aria-labelledby="titulo-lista" className="flex flex-col gap-3.5">
        <h2 id="titulo-lista" className="m-0 text-title-lg font-semibold">
          Workflows · {wfs.length}
        </h2>
        <ul className="m-0 list-none overflow-hidden rounded-item border border-line bg-panel p-0">
          {list.map((w, i) => {
            const on = isOpen(w)
            return (
              <li key={w.id} className={cx('m-0', i > 0 && 'border-t border-line', on && 'bg-tint')}>
                <h3 className="m-0 text-[length:inherit] font-[inherit]">
                  <button
                    type="button"
                    id={'wfb-' + w.id}
                    aria-expanded={on}
                    aria-controls={'wfp-' + w.id}
                    onClick={() => setOpen((o) => ({ ...o, [w.id]: !on }))}
                    className="focus-inside box-border flex min-h-18 w-full cursor-pointer items-center gap-3.5 border-0 bg-transparent px-5 py-3 text-left font-sans text-ink"
                  >
                    <span aria-hidden="true" className="grid size-11 shrink-0 place-items-center rounded-md bg-soft text-accent-ink">
                      <Icon name="workflow" size={22} />
                    </span>
                    <span className="min-w-0 flex-1 text-title-sm font-semibold">{w.nome}</span>
                    {w.novo && (
                      <Chip tone="info" icon="plus">
                        Novo
                      </Chip>
                    )}
                    <Icon name={on ? 'chevronUp' : 'chevronDown'} size={22} className="text-ink-2" />
                  </button>
                </h3>
                {on && (
                  <div id={'wfp-' + w.id} role="region" aria-labelledby={'wfb-' + w.id} className="flex flex-col gap-4 pt-1 pr-5 pb-5.5 pl-5 sm:pl-19.5">
                    <p className="m-0 text-[16px] leading-[25px] text-ink-2">{w.desc || 'Sem descrição.'}</p>
                    <dl className="m-0 flex flex-wrap gap-2.5">
                      {facts(w).map((f) => (
                        <div key={f.rot} className="edge flex flex-[1_1_150px] flex-col gap-0.5 rounded-md bg-soft px-3.5 py-2.5">
                          <dt className="text-label-sm leading-[18px] text-ink-2">{f.rot}</dt>
                          <dd className="m-0 text-[15px] leading-[22px] font-semibold">{f.v}</dd>
                        </div>
                      ))}
                    </dl>
                    <ol aria-label={'Passos de ' + w.nome} className="m-0 flex list-none flex-wrap items-center gap-x-1 gap-y-1.5 p-0 text-[14px] leading-5">
                      {w.passos.map((x, j) => (
                        <li key={x.id} className="inline-flex items-center gap-1">
                          <span className="rounded-pill border border-line-strong bg-bg px-2.5 py-1">
                            {j + 1}. {x.nome}
                          </span>
                          {j < w.passos.length - 1 && <Icon name="arrowRight" size={14} className="text-ink-3" />}
                        </li>
                      ))}
                    </ol>
                    <Button to={paths.workflow(w.id)} variant="secondary" icon="eye" className="self-start">
                      Ver o workflow completo<span className="sr-only">: {w.nome}</span>
                    </Button>
                  </div>
                )}
              </li>
            )
          })}
        </ul>
      </section>
    </AppShell>
  )
}

const actionOf = {
  submissao: 'Preenche o formulário e junta os documentos.',
  revisao: 'Aprova, devolve para correção ou rejeita.',
  validacao: 'Confirma, fecha o procedimento e gera o documento final.',
}

/** E12b · Ver workflow completo (UC03): every step, its form and its reasons */
export function WorkflowDetailPage({ persona }: { persona: PersonaId }) {
  const { id } = useParams()
  const { wfs } = useDemo()
  const navigate = useNavigate()
  const headingRef = useRef<HTMLHeadingElement>(null)
  useFocusOnArrival(headingRef)
  const w = wfs.find((x) => x.id === id)
  if (!w) return <Navigate to={paths.workflows} replace />

  return (
    <AppShell persona={persona} active="workflows" mainClassName="max-w-list gap-7">
      <header className="flex flex-col gap-3.5">
        <Button
          variant="secondary"
          size="l"
          icon="arrowLeft"
          className="self-start"
          onClick={() => navigate(paths.workflows, { state: { abrir: w.id } satisfies NavState })}
        >
          Anterior<span className="sr-only">: Workflows</span>
        </Button>
        <div className="flex flex-wrap items-center gap-x-3.5 gap-y-2.5">
          <h1 ref={headingRef} tabIndex={-1} className="m-0 text-headline-lg outline-none">
            {w.nome}
          </h1>
          <Chip tone="ok" icon="check">
            {w.estado}
          </Chip>
        </div>
        <p className="m-0 max-w-prose-xl text-[17px] leading-[27px] text-ink-2">{w.desc || 'Sem descrição.'}</p>
        <p className="m-0 text-[14px] leading-5 text-ink-3">
          Versão 1 · criado por {withRole(w.autor || 'Sofia Almeida')} a {w.data}
        </p>
      </header>
      <dl className="m-0 flex flex-wrap gap-3">
        {facts(w)
          .concat([{ rot: 'Documentos pedidos', v: w.precisa || '—' }])
          .map((f) => (
            <div key={f.rot} className="edge flex flex-[1_1_180px] flex-col gap-0.5 rounded-md bg-soft px-4 py-3.5">
              <dt className="text-label-sm leading-[18px] text-ink-2">{f.rot}</dt>
              <dd className="m-0 text-[16px] leading-6 font-semibold">{f.v}</dd>
            </div>
          ))}
      </dl>
      <section aria-labelledby="titulo-percurso" className="flex flex-col gap-4">
        <h2 id="titulo-percurso" className="m-0 text-[22px] leading-[30px] font-semibold">
          Percurso de um pedido
        </h2>
        <ol className="m-0 flex list-none flex-col p-0">
          {w.passos.map((x, j) => {
            const sub = x.tipo === 'submissao'
            const campos = sub ? (w.id === 'ac' ? fieldsAC() : x.campos || []) : []
            const motivos = sub ? [] : w.id === 'ac' ? reasonsAC(j) : x.motivos || []
            return (
              <li key={x.id} className="flex gap-4.5">
                <div aria-hidden="true" className="flex w-10 shrink-0 flex-col items-center">
                  <span className="grid size-10 place-items-center rounded-full border-2 border-orange bg-bg text-[16px] font-extrabold">{j + 1}</span>
                  {j < w.passos.length - 1 && <span className="min-h-4 w-0.5 flex-1 bg-line-strong" />}
                </div>
                <article aria-labelledby={'pd-' + x.id} className="mb-4.5 flex min-w-0 flex-1 flex-col gap-3.5 rounded-item border border-line bg-panel px-5.5 py-5">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                    <h3 id={'pd-' + x.id} className="m-0 flex-[1_1_220px] text-title-sm font-semibold">
                      <span className="sr-only">Passo {j + 1}: </span>
                      {x.nome}
                    </h3>
                    <Chip tone={sub ? 'neutro' : x.tipo === 'validacao' ? 'ok' : 'info'} size="sm">
                      {stepTypes[x.tipo].nome}
                    </Chip>
                  </div>
                  <dl className="m-0 grid grid-cols-[minmax(120px,170px)_minmax(0,1fr)] gap-x-4 gap-y-1.5 text-[15px] leading-[22px]">
                    <dt className="text-ink-2">{sub ? 'Quem pode pedir' : 'Quem trata'}</dt>
                    <dd className="m-0">{x.quem || '—'}</dd>
                    <dt className="text-ink-2">Prazo legal</dt>
                    <dd className="m-0">{sub ? '—' : x.prazo + ' dias úteis'}</dd>
                    <dt className="text-ink-2">O que acontece</dt>
                    <dd className="m-0">{actionOf[x.tipo]}</dd>
                  </dl>
                  {campos.length > 0 && (
                    <div className="flex flex-col gap-2">
                      <h4 className="m-0 text-[15px] leading-[22px] font-semibold">Campos do formulário · {campos.length}</h4>
                      <ul className="m-0 list-none overflow-hidden rounded-md border border-line p-0">
                        {campos.map((c, k) => (
                          <li key={k} className={cx('flex flex-wrap items-center gap-x-3.5 gap-y-1.5 px-3.5 py-2.5', k > 0 && 'border-t border-line')}>
                            <span className="flex-[1_1_200px] text-[15px] font-semibold">{c.rot || 'Campo sem rótulo'}</span>
                            <span className="text-[14px] text-ink-2">{c.tipo}</span>
                            <Chip tone={c.origem === 'idp' ? 'neutro' : c.obrig ? 'warn' : 'neutro'} size="xs" icon={c.origem === 'idp' ? 'lock' : undefined} iconSize={12}>
                              {c.origem === 'idp' ? 'Do perfil' : c.obrig ? 'Obrigatório' : 'Opcional'}
                            </Chip>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {motivos.length > 0 && (
                    <div className="flex flex-col gap-2">
                      <h4 className="m-0 text-[15px] leading-[22px] font-semibold">Motivos para devolver ou rejeitar</h4>
                      <ul className="m-0 flex list-none flex-col gap-1.5 p-0">
                        {motivos.map((m) => (
                          <li key={m.nome} className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[15px] leading-[22px]">
                            <span className="flex-[1_1_220px]">{m.nome}</span>
                            <Chip tone={m.fix ? 'warn' : 'bad'} size="xs" icon={m.fix ? 'reset' : 'x'}>
                              {m.fix ? 'Volta ao requerente para corrigir' : 'Encerra o pedido'}
                            </Chip>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </article>
              </li>
            )
          })}
        </ol>
      </section>
    </AppShell>
  )
}

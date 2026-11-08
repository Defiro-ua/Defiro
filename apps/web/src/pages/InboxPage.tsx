import { useRef, useState } from 'react'
import { Button } from '../components/Button'
import { Chip } from '../components/Chip'
import { DocumentDialog } from '../components/DocumentDialog'
import { Flash } from '../components/Flash'
import { Icon, type IconName } from '../components/Icon'
import { AppShell } from '../components/layout/AppShell'
import { deadline, fmtDate, fmtShort, greeting } from '../domain/dates'
import { personas, roleOf, withRole } from '../domain/people'
import { finalDoc, statusOf, tasksOf, type Task, type TaskKind } from '../domain/requests'
import { dateConflict } from '../domain/trip'
import type { DocContent, PersonaId, Tone } from '../domain/types'
import { handlerName, workflowById } from '../domain/workflows'
import { cx } from '../lib/cx'
import { toneIcon } from '../lib/tones'
import { useFlash } from '../lib/useFlash'
import { useFocusOnArrival } from '../lib/useFocusOnArrival'
import { paths } from '../routes'
import { useDemo, type NavState } from '../state/demoContext'

const taskIcon: Record<TaskKind, IconName> = { rever: 'fileText', validar: 'shieldCheck', corrigir: 'pen' }
const taskAction: Record<TaskKind, string> = { rever: 'Rever', validar: 'Validar', corrigir: 'Corrigir' }
const fromInbox: NavState = { de: 'Caixa de tarefas' }

function TaskRow({ t, first }: { t: Task; first: boolean }) {
  const p = t.p
  const pr = deadline(p.prazo)
  const passo = t.wf.passos[p.passo] || { nome: '' }
  const conflict = t.tipo === 'validar' && !!dateConflict(p.d)
  const openNotes = (p.notas || []).filter((n) => !n.resolvida).length
  let tag = ''
  let tagTone: Tone = 'neutro'
  let tagIcon: IconName = 'pen'
  if (t.tipo === 'corrigir') {
    tag = 'Devolvido para correção'
    tagTone = 'warn'
    tagIcon = 'reset'
  } else if (conflict) {
    tag = 'Datas em conflito'
    tagTone = 'warn'
    tagIcon = 'alertTriangle'
  } else if ((p.versao || 1) > 1) {
    tag = `Versão ${p.versao} · corrigido`
    tagTone = 'info'
  }
  const correct = t.tipo === 'corrigir'
  const title = correct ? 'Corrigir pedido · ' + t.wf.nome : t.wf.nome + ' · ' + p.req.nome
  const role = !correct ? roleOf(p.req.nome) : ''
  const meta = correct
    ? `${p.id} · devolvido por ${withRole(p.devolvidoPor || 'revisor')} a ${fmtShort(p.recebido)}` +
      (openNotes ? ' · ' + (openNotes === 1 ? '1 nota' : openNotes + ' notas') : '')
    : `${p.id} · ${passo.nome} · recebido a ${fmtShort(p.recebido)}`

  return (
    <li className={cx('flex flex-wrap items-center gap-x-4.5 gap-y-3 px-5 py-4.5', !first && 'border-t border-line', first && 'bg-soft-hover')}>
      <span aria-hidden="true" className="grid size-12 shrink-0 place-items-center rounded-md bg-soft text-accent-ink">
        <Icon name={taskIcon[t.tipo]} size={22} />
      </span>
      <div className="flex min-w-0 flex-[1_1_300px] flex-col gap-1">
        <span className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
          <span className="text-[16px] leading-6 font-semibold">
            {title}
            {role && <span className="font-normal text-ink-2"> · {role}</span>}
          </span>
          {tag && (
            <Chip tone={tagTone} size="xs" icon={tagIcon}>
              {tag}
            </Chip>
          )}
        </span>
        <span className="text-[14px] leading-[21px] text-ink-3 tabular-nums">{meta}</span>
      </div>
      <Chip tone={pr.p === 'atraso' ? 'bad' : pr.p === 'perto' ? 'warn' : 'neutro'} icon={pr.p === 'atraso' ? 'alertTriangle' : 'clock'} iconSize={16}>
        <span className="sr-only">Prazo: </span>
        {pr.txt}
      </Chip>
      <Button
        to={correct ? paths.correct(p.id) : paths.request(p.id)}
        state={fromInbox}
        variant={first ? 'primary' : 'secondary'}
        size="s"
        iconRight="arrowRight"
        iconSize={18}
      >
        {taskAction[t.tipo]}
        <span className="sr-only"> {correct ? `o pedido ${p.id}` : `o pedido ${p.id} de ${withRole(p.req.nome)}`}</span>
      </Button>
    </li>
  )
}

/** E02 · Caixa de tarefas (UC27) and, for requesters, «Os meus pedidos» (UC23) */
export function InboxPage({ persona }: { persona: PersonaId }) {
  const { pedidos, wfs } = useDemo()
  const [flash, closeFlash] = useFlash()
  const [doc, setDoc] = useState<DocContent | null>(null)
  const [docOpen, setDocOpen] = useState(false)
  const headingRef = useRef<HTMLHeadingElement>(null)
  useFocusOnArrival(headingRef)

  const me = personas[persona]
  const tasks = tasksOf(pedidos, wfs, persona)
  const n = tasks.length
  let resumo = n === 0 ? 'Não tem tarefas à sua espera.' : n === 1 ? 'Tem 1 tarefa à sua espera.' : `Tem ${n} tarefas à sua espera.`
  if (n) resumo += ' A mais urgente: ' + deadline(tasks[0].p.prazo).txt.toLowerCase() + '.'
  const mine = pedidos.filter((p) => p.requerente === persona)
  const showDoc = (d: DocContent) => {
    setDoc(d)
    setDocOpen(true)
  }
  const flashRequest = flash?.id ? pedidos.find((p) => p.id === flash.id) : undefined

  return (
    <AppShell persona={persona} active="inbox" mainClassName="max-w-content gap-7">
      <Flash
        notice={flash}
        onClose={closeFlash}
        onDoc={flashRequest ? () => showDoc(finalDoc(flashRequest, workflowById(wfs, flashRequest.wf))) : undefined}
      />
      <header className="flex flex-col gap-2.5">
        <h1 ref={headingRef} tabIndex={-1} className="m-0 text-headline-lg outline-none">
          {greeting()}, <span className="text-orange">{me.primeiro}</span>
        </h1>
        <p className="m-0 text-body-lg text-ink-2">{resumo}</p>
      </header>

      <section aria-labelledby="titulo-tarefas" className="flex flex-col gap-4">
        <h2 id="titulo-tarefas" className="m-0 text-title-lg font-semibold">
          Tarefas à sua espera · {n}
        </h2>
        {n === 0 ? (
          <div className="edge flex flex-wrap items-center gap-x-5 gap-y-3 rounded-md bg-soft p-6">
            <Icon name="check" size={24} className="text-success" />
            <span className="flex-[1_1_280px] text-[15px] leading-[23px] text-ink-2">
              {persona === 'sofia'
                ? 'Não tem tarefas à sua espera. Os workflows estão em «Workflows», no menu.'
                : 'Não tem tarefas à sua espera. Quando um pedido precisar de si, aparece aqui. Para fazer um pedido, use «Novo pedido», no menu.'}
            </span>
          </div>
        ) : (
          <ul className="m-0 list-none overflow-hidden rounded-md border border-line bg-panel p-0">
            {tasks.map((t, i) => (
              <TaskRow key={t.p.id} t={t} first={i === 0} />
            ))}
          </ul>
        )}
      </section>

      {mine.length > 0 && (
        <section aria-labelledby="titulo-meus" className="flex flex-col gap-4">
          <h2 id="titulo-meus" className="m-0 text-title-lg font-semibold">
            Os meus pedidos
          </h2>
          <div className="overflow-x-auto rounded-md border border-line bg-panel">
            <table className="w-full min-w-[640px] border-collapse text-[15px] leading-[22px]">
              <caption className="sr-only">Os meus pedidos e o estado de cada um</caption>
              <thead>
                <tr className="bg-soft text-left">
                  <th scope="col" className="px-5 py-3 text-label-sm font-semibold text-ink-2">
                    Pedido
                  </th>
                  <th scope="col" className="px-4 py-3 text-label-sm font-semibold text-ink-2">
                    Estado
                  </th>
                  <th scope="col" className="px-4 py-3 text-label-sm font-semibold text-ink-2">
                    Última alteração
                  </th>
                  <th scope="col" className="px-5 py-3 text-right text-label-sm font-semibold text-ink-2">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody>
                {mine.map((p) => {
                  const wf = workflowById(wfs, p.wf)
                  const e = statusOf(p, wf)
                  const last = p.hist[p.hist.length - 1]
                  let stepTxt = ''
                  if (p.estado === 'em curso') stepTxt = `Passo ${p.passo + 1} de ${wf.passos.length} · com ${withRole(handlerName(wf, p.passo, p))}`
                  else if (p.estado === 'devolvido') stepTxt = 'Corrija até ' + fmtDate(p.prazo)
                  else if (p.estado === 'fechado') stepTxt = 'Fechado a ' + fmtDate(p.fechadoEm)
                  else if (p.estado === 'rejeitado') stepTxt = p.motivo || ''
                  return (
                    <tr key={p.id} className="border-t border-line">
                      <th scope="row" className="px-5 py-3.5 text-left align-top font-normal">
                        <span className="block font-semibold">
                          {wf.nome}
                          {p.d.destino ? ' · ' + p.d.destino : ''}
                        </span>
                        <span className="block text-label-sm text-ink-3 tabular-nums">{p.id}</span>
                      </th>
                      <td className="px-4 py-3.5 align-top">
                        <Chip tone={e.tom} icon={toneIcon[e.tom]}>
                          {e.txt}
                        </Chip>
                        <span className="mt-1 block text-label-sm leading-[19px] text-ink-3">{stepTxt}</span>
                      </td>
                      <td className="px-4 py-3.5 align-top text-[14px] text-ink-2 tabular-nums">{fmtShort(last?.q)}</td>
                      <td className="px-4 py-2 text-right align-top">
                        <span className="inline-flex flex-wrap justify-end gap-1.5">
                          {p.estado === 'fechado' && (
                            <Button size="s" icon="download" onClick={() => showDoc(finalDoc(p, wf))}>
                              Documento<span className="sr-only"> do pedido {p.id}</span>
                            </Button>
                          )}
                          <Button to={paths.request(p.id) + '?ver=1'} state={fromInbox} variant="secondary" size="s">
                            Ver<span className="sr-only"> o pedido {p.id}</span>
                          </Button>
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}
      <DocumentDialog doc={doc} open={docOpen} onClose={() => setDocOpen(false)} />
    </AppShell>
  )
}

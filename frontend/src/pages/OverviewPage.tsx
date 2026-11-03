import { useState } from 'react'
import { Button } from '../components/Button'
import { Chip, type ChipTone } from '../components/Chip'
import { Icon } from '../components/Icon'
import { AppLayout } from '../components/layout/AppLayout'
import { AssignDialog } from '../components/overview/AssignDialog'
import { PageTitle } from '../components/PageTitle'
import { SegmentedTabs } from '../components/SegmentedTabs'
import { panelId, tabId } from '../lib/tabs'
import { StatCard } from '../components/StatCard'
import { StatusBanner } from '../components/StatusBanner'
import { HeadRow, TableFrame, Td, Th, Tr } from '../components/Table'
import { groups, inProgressTotal, overviewTasks, stepsByWorkflow, type OverviewTask } from '../data/overview'
import type { DeadlineState } from '../data/types'
import { cx } from '../lib/cx'

type Tab = 'bloq' | 'atraso' | 'fila' | 'todos'

const deadlineTone: Record<DeadlineState, ChipTone> = { late: 'error', soon: 'warning', ok: 'soft', paused: 'muted' }

/** E20 · Visão geral, bloqueios e atribuição (UC24, UC33) */
export function OverviewPage() {
  const [tab, setTab] = useState<Tab>('bloq')
  const [assigned, setAssigned] = useState<Record<string, string>>({})
  const [reminded, setReminded] = useState<string[]>([])
  const [openId, setOpenId] = useState('')
  const [choice, setChoice] = useState('')
  const [last, setLast] = useState<{ kind: 'assign' | 'remind'; id: string } | null>(null)

  const openTask = overviewTasks.find((t) => t.id === openId)

  function openAssign(task: OverviewTask) {
    const candidates = groups[task.group ?? 'dom'].members
      .filter((m) => m.name !== task.holder && !m.absent)
      .sort((a, b) => a.open - b.open)
    setChoice(candidates[0].name)
    setOpenId(task.id)
  }

  // How a task reads after what was done on this screen
  const view = (task: OverviewTask) => {
    const to = assigned[task.id]
    const group = task.group ? groups[task.group] : undefined
    return {
      done: !!to,
      holder: to ?? (task.holder || (task.queue ? 'Ninguém · fila do grupo' : 'Ninguém')),
      note: to ? `${group?.name} · atribuída por si` : task.queue ? group?.name : task.note,
      doneText: `${task.holder ? 'Reatribuída' : 'Atribuída'} a ${to ?? ''}`,
      actionText: task.holder ? 'Reatribuir' : 'Atribuir',
    }
  }

  const blocked = overviewTasks.filter((t) => t.blocker)
  const isResolved = (t: OverviewTask) => (t.blocker?.action === 'remind' ? reminded.includes(t.id) : !!assigned[t.id])
  // A reminder does not unblock the procedure: it stays in the list until the requester answers
  const nBlocked = blocked.filter((t) => !isResolved(t) || t.blocker?.action === 'remind').length
  const late = overviewTasks.filter((t) => t.deadlineState === 'late')
  const queued = overviewTasks.filter((t) => t.queue)
  const nQueue = queued.filter((t) => !assigned[t.id]).length

  const banner = !last
    ? null
    : last.kind === 'remind'
      ? {
          title: 'Lembrete enviado a Hugo Sá',
          text: `Recebe um aviso para corrigir o pedido ${last.id}. O procedimento continua em «Bloqueados e parados» até ele responder.`,
        }
      : {
          title: `${last.id} ${overviewTasks.find((t) => t.id === last.id)?.holder ? 'reatribuída' : 'atribuída'} a ${assigned[last.id]}`,
          text: `Já está na caixa de tarefas de ${assigned[last.id]}, com o mesmo prazo. Não foi preciso aceitar.`,
        }

  const actionCell = (task: OverviewTask) => {
    const v = view(task)
    if (v.done)
      return (
        <Chip tone="success" size="sm">
          {v.doneText}
        </Chip>
      )
    if (task.withRequester) return <span className="text-label-sm text-ink-3">Com o requerente</span>
    return (
      <Button variant="accent-outline" size="xs" onClick={() => openAssign(task)} aria-label={`${v.actionText}: ${task.name}`}>
        {v.actionText}
      </Button>
    )
  }

  const taskTable = (tasks: OverviewTask[], noteOverride?: (t: OverviewTask) => string | undefined) => (
    <TableFrame panel>
      <table className="w-full min-w-215 border-collapse text-body-sm leading-5">
        <thead>
          <HeadRow>
            <Th>Procedimento</Th>
            <Th>Passo</Th>
            <Th>Com quem está</Th>
            <Th>Prazo</Th>
            <Th align="right">Ação</Th>
          </HeadRow>
        </thead>
        <tbody>
          {tasks.map((task) => {
            const v = view(task)
            return (
              <Tr key={task.id}>
                <Td pad="roomy">
                  <span className="font-semibold">{task.name}</span>
                  <br />
                  <span className="text-label-sm text-ink-3 tabular-nums">{task.id}</span>
                </Td>
                <Td pad="roomy" className="text-ink-2">
                  {task.step}
                </Td>
                <Td pad="roomy">
                  {v.holder}
                  <br />
                  <span className="text-label-sm text-ink-3">{noteOverride?.(task) ?? v.note}</span>
                </Td>
                <Td pad="roomy">
                  <Chip tone={deadlineTone[task.deadlineState]} size="sm">
                    {task.deadline}
                  </Chip>
                </Td>
                <Td pad="roomy" align="right">
                  {actionCell(task)}
                </Td>
              </Tr>
            )
          })}
        </tbody>
      </table>
    </TableFrame>
  )

  return (
    <AppLayout user="sofia" nav={{ active: 'visao', inboxCount: 0 }} width="full">
      <header className="flex flex-col gap-2">
        <PageTitle accent>Visão geral</PageTitle>
        <p className="max-w-prose-2xl text-body text-ink-3">
          Procedimentos em curso, o que está parado e porquê, e com quem está cada tarefa. Pode atribuir ou reatribuir qualquer
          tarefa, esteja ou não em atraso.
        </p>
      </header>

      <div className="flex flex-wrap gap-4">
        <StatCard compact label="Em curso" value={inProgressTotal}>
          <p className="text-label-sm text-ink-2">em 4 workflows</p>
        </StatCard>
        <StatCard compact tone="error" label="Bloqueados e parados" value={nBlocked}>
          <p className="text-label-sm text-ink-2">Precisam de uma ação para avançar</p>
        </StatCard>
        <StatCard compact tone="warning" label="Em atraso" value={late.length}>
          <p className="text-label-sm text-ink-2">Passaram o prazo legal do passo</p>
        </StatCard>
        <StatCard compact tone="info" label="Por atribuir" value={nQueue}>
          <p className="text-label-sm text-ink-2">Nas filas dos grupos, sem responsável</p>
        </StatCard>
      </div>

      <div className="flex flex-col gap-5">
        <SegmentedTabs<Tab>
          label="O que mostrar"
          idPrefix="visao"
          size="sm"
          value={tab}
          onChange={(next) => {
            setTab(next)
            setLast(null)
          }}
          items={[
            { id: 'bloq', label: `Bloqueados e parados · ${nBlocked}` },
            { id: 'atraso', label: `Em atraso · ${late.length}` },
            { id: 'fila', label: `Por atribuir · ${nQueue}` },
            { id: 'todos', label: `Todos em curso · ${inProgressTotal}` },
          ]}
        />

        {banner && <StatusBanner title={banner.title}>{banner.text}</StatusBanner>}

        <div role="tabpanel" id={panelId('visao', tab)} aria-labelledby={tabId('visao', tab)} className="flex flex-col gap-4">
          {tab === 'bloq' && (
            <>
              <p className="max-w-prose-2xl text-body text-ink-2">
                Procedimentos que não avançam sozinhos. Para cada um, o sistema mostra o motivo e o que pode fazer.
              </p>
              {blocked.map((task) => {
                const b = task.blocker!
                const v = view(task)
                const resolved = isResolved(task)
                const remind = b.action === 'remind'
                return (
                  <article
                    key={task.id}
                    className={cx(
                      'flex flex-col gap-3 rounded-md border border-line bg-panel px-6 py-5',
                      !resolved && 'border-l-4 border-l-error',
                    )}
                  >
                    <div className="flex flex-wrap items-start gap-x-3 gap-y-2">
                      <div className="flex grow basis-80 flex-col gap-0.5">
                        <h2 className="text-title-md leading-5.5 font-semibold">{task.name}</h2>
                        <p className="text-label-sm text-ink-3 tabular-nums">
                          {task.id} · {task.step} · {remind ? 'Com o requerente' : v.holder}
                        </p>
                      </div>
                      <Chip tone="error" size="sm">
                        {b.kind}
                      </Chip>
                      <Chip tone="soft" size="sm">
                        {b.since}
                      </Chip>
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-3">
                      <div className="flex grow basis-70 flex-col gap-1 py-3">
                        <h3 className="text-label-sm font-semibold text-ink-3">Motivo</h3>
                        <p className="text-body-sm">{b.reason}</p>
                      </div>
                      <div className="flex grow basis-70 flex-col gap-1 rounded-md bg-soft px-4 py-3">
                        <h3 className="text-label-sm font-semibold text-warning">Como proceder</h3>
                        <p className="text-body-sm">{b.howTo}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center justify-end gap-3">
                      {resolved ? (
                        <Chip tone="success">
                          {remind ? 'Lembrete enviado hoje' : `Resolvido · ${v.doneText.charAt(0).toLowerCase()}${v.doneText.slice(1)}`}
                        </Chip>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => {
                            if (remind) {
                              setReminded((list) => [...list, task.id])
                              setLast({ kind: 'remind', id: task.id })
                            } else openAssign(task)
                          }}
                        >
                          {remind ? 'Enviar lembrete' : v.actionText}
                        </Button>
                      )}
                    </div>
                  </article>
                )
              })}
            </>
          )}

          {tab === 'atraso' && (
            <>
              <p className="max-w-prose-2xl text-body text-ink-2">
                Tarefas que passaram o prazo legal do passo. Reatribuir não apaga o atraso, mas põe a tarefa com quem a pode
                tratar.
              </p>
              {taskTable(late, (t) =>
                t.id === 'FE-2026-0017' && !assigned[t.id] ? 'Bloqueado: ausente sem substituto' : undefined,
              )}
            </>
          )}

          {tab === 'fila' && (
            <>
              <p className="max-w-prose-2xl text-body text-ink-2">
                Tarefas nas filas dos grupos, ainda sem responsável. Pode atribuí-las já. Se ninguém o fizer, o sistema
                atribui-as quando passar o tempo definido no passo, a quem tiver menos tarefas do que a média do grupo.
              </p>
              {(['dom', 'fin'] as const).map((groupId) => {
                const items = queued.filter((t) => t.group === groupId)
                const waiting = items.filter((t) => !assigned[t.id]).length
                return (
                  <section key={groupId} aria-labelledby={`fila-${groupId}`} className="flex flex-col gap-2.5">
                    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                      <h2 id={`fila-${groupId}`} className="text-title-sm font-semibold">
                        {groups[groupId].name}
                      </h2>
                      <span className="text-label-sm text-ink-3">
                        {waiting} na fila · média de {groups[groupId].average} tarefas abertas por pessoa
                      </span>
                    </div>
                    <ul className="divide-y divide-line overflow-hidden rounded-md border border-line bg-panel">
                      {items.map((task) => (
                        <li key={task.id} className="flex flex-wrap items-center gap-x-4 gap-y-2.5 px-5 py-3.5">
                          <span className="flex grow basis-75 flex-col gap-0.5">
                            <span className="text-label-md font-semibold">{task.name}</span>
                            <span className="text-label-sm text-ink-3 tabular-nums">
                              {task.id} · {task.step} · {assigned[task.id] ? 'saiu da fila' : `na fila; ${task.queue}`}
                            </span>
                          </span>
                          <Chip tone={deadlineTone[task.deadlineState]} size="sm">
                            {task.deadline}
                          </Chip>
                          {actionCell(task)}
                        </li>
                      ))}
                    </ul>
                  </section>
                )
              })}
            </>
          )}

          {tab === 'todos' && (
            <div className="flex flex-col gap-6">
              <section aria-labelledby="em-que-passo" className="flex flex-col gap-3">
                <h2 id="em-que-passo" className="text-title-sm font-semibold">
                  Em que passo estão
                </h2>
                <ul className="divide-y divide-line overflow-hidden rounded-md border border-line bg-panel">
                  {stepsByWorkflow.map((workflow) => (
                    <li key={workflow.name} className="flex flex-wrap items-center gap-x-5 gap-y-3 px-5 py-4">
                      <span className="flex shrink-0 basis-55 flex-col gap-0.5">
                        <span className="text-label-md font-semibold">{workflow.name}</span>
                        <span className="text-label-sm text-ink-3">
                          {workflow.steps.reduce((sum, s) => sum + s.n, 0)} em curso
                        </span>
                      </span>
                      <span className="flex grow basis-90 flex-wrap gap-2">
                        {workflow.steps.map((step) => (
                          <span
                            key={step.name}
                            className={cx(
                              'inline-flex min-h-8 items-center gap-1 rounded-pill px-3 text-label-sm',
                              step.late ? 'bg-error-soft text-error' : 'bg-soft text-ink-2',
                            )}
                          >
                            {step.name} · <strong className="font-semibold tabular-nums">{step.n}</strong>
                            {step.late > 0 && ` · ${step.late} em atraso`}
                          </span>
                        ))}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
              <section aria-labelledby="tarefas" className="flex flex-col gap-3">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                  <h2 id="tarefas" className="grow basis-60 text-title-sm font-semibold">
                    Tarefas
                  </h2>
                  {['Workflow: todos', 'Grupo: todos'].map((filter) => (
                    <button
                      key={filter}
                      type="button"
                      className="inline-flex min-h-10 items-center gap-2 rounded-pill border border-line-strong bg-panel px-3.5 text-body-sm hover:bg-soft"
                    >
                      {filter}
                      <Icon name="chevronDown" size={14} />
                    </button>
                  ))}
                </div>
                {taskTable(overviewTasks)}
                <p className="text-label-sm text-ink-3">
                  A mostrar {overviewTasks.length} de {inProgressTotal}. Use os filtros para encontrar uma tarefa.
                </p>
              </section>
            </div>
          )}
        </div>
      </div>

      <AssignDialog
        task={openTask}
        choice={choice}
        onChoice={setChoice}
        onCancel={() => setOpenId('')}
        onConfirm={() => {
          if (!openTask) return
          setAssigned((all) => ({ ...all, [openTask.id]: choice }))
          setLast({ kind: 'assign', id: openTask.id })
          setOpenId('')
        }}
      />
    </AppLayout>
  )
}

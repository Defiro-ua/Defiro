import { useState } from 'react'
import { useLocation } from 'react-router'
import { Avatar } from '../components/Avatar'
import { Button } from '../components/Button'
import { Chip } from '../components/Chip'
import { AppLayout } from '../components/layout/AppLayout'
import { Accent, PageTitle } from '../components/PageTitle'
import { SegmentedTabs } from '../components/SegmentedTabs'
import { panelId, tabId } from '../lib/tabs'
import { SectionTitle } from '../components/SectionTitle'
import { StatCard } from '../components/StatCard'
import { StatusBanner } from '../components/StatusBanner'
import { TaskList, TaskRow } from '../components/tasks/TaskRow'
import {
  decisionBanner,
  groupQueue,
  myTasks,
  personalRequests,
  transferredTask,
  type InboxTask,
  type PersonalRequest,
  type ReviewDecision,
} from '../data/tasks'
import { cx } from '../lib/cx'

type Tab = 'meus' | 'grupo'
type Answer = 'accepted' | 'declined'

/** E02 · Caixa de tarefas do revisor (UC02, UC27, UC28, UC30) */
export function InboxPage() {
  const decided = (useLocation().state as { decided?: ReviewDecision } | null)?.decided
  const [tab, setTab] = useState<Tab>('meus')
  const [assumed, setAssumed] = useState<string[]>([])
  const [lastAssumed, setLastAssumed] = useState('')
  const [answers, setAnswers] = useState<Partial<Record<PersonalRequest['id'], Answer>>>({})

  let mine: InboxTask[] = myTasks.filter((task) => !(decided && task.id === 'AC-2026-0147'))
  if (answers.transfer === 'accepted') mine = [transferredTask, ...mine]
  const nowMine: InboxTask[] = groupQueue
    .filter((task) => assumed.includes(task.id))
    .map((task) => ({
      id: task.id,
      kind: task.kind,
      title: task.title,
      meta: `${task.id} · Validação da chefia · assumida agora`,
      deadline: task.deadline,
      deadlineState: 'ok',
      tag: 'Assumiu agora',
    }))
  mine = [...nowMine, ...mine]
  const queue = groupQueue.filter((task) => !assumed.includes(task.id))

  const banner = lastAssumed
    ? { title: `Assumiu ${lastAssumed}`, text: 'A tarefa está agora em «Atribuídas a mim» e saiu da fila dos colegas.' }
    : decided
      ? decisionBanner[decided]
      : null

  function changeTab(next: Tab) {
    setTab(next)
    setLastAssumed('')
  }

  return (
    <AppLayout user="rui" nav={{ active: 'inbox', inboxCount: mine.length }}>
      {banner && <StatusBanner title={banner.title}>{banner.text}</StatusBanner>}

      <header className="flex flex-col gap-3">
        <PageTitle>
          Bom dia, <Accent>Rui</Accent>
        </PageTitle>
        <p className="text-body-lg text-ink-2">Tem {mine.length} tarefas à sua espera. 1 já passou o prazo legal.</p>
      </header>

      <div className="flex flex-wrap gap-6">
        <StatCard label="Atribuídas a mim" value={mine.length}>
          <p className="text-body-sm text-ink-2">A média do grupo é 5 por pessoa</p>
        </StatCard>
        <StatCard label="Na fila do grupo, sem responsável" value={queue.length}>
          <p className="text-body-sm text-ink-2">Chefia · Divisão de Obras Municipais</p>
        </StatCard>
        <StatCard label="Em atraso" value={1}>
          <Chip tone="error" icon="clock" className="self-start">
            Prazo legal ultrapassado
          </Chip>
        </StatCard>
      </div>

      <section aria-labelledby="pedidos-para-si" className="flex flex-col gap-3">
        <SectionTitle id="pedidos-para-si">Pedidos para si</SectionTitle>
        {personalRequests.map((request) => (
          <PersonalRequestCard
            key={request.id}
            request={request}
            answer={answers[request.id]}
            onAnswer={(answer) => setAnswers((current) => ({ ...current, [request.id]: answer }))}
          />
        ))}
      </section>

      <section aria-label="Tarefas" className="flex flex-col gap-5">
        <SegmentedTabs<Tab>
          label="Tarefas"
          idPrefix="caixa"
          value={tab}
          onChange={changeTab}
          items={[
            { id: 'meus', label: `Atribuídas a mim · ${mine.length}` },
            { id: 'grupo', label: `Fila do grupo · ${queue.length}` },
          ]}
        />

        {tab === 'meus' && (
          <div role="tabpanel" id={panelId('caixa', 'meus')} aria-labelledby={tabId('caixa', 'meus')}>
            <TaskList>
              {mine.map((task) => (
                <TaskRow
                  key={task.id}
                  kind={task.kind}
                  title={task.title}
                  tag={task.tag ? { label: task.tag, tone: 'info' } : undefined}
                  meta={task.meta}
                  deadline={task.deadline}
                  deadlineState={task.deadlineState}
                  highlight={task.highlight || !!task.tag}
                  action={
                    <Button to={task.to} variant="ghost" size="sm" iconRight="arrowRight" aria-label={`Abrir ${task.title}`}>
                      Abrir
                    </Button>
                  }
                />
              ))}
            </TaskList>
          </div>
        )}

        {tab === 'grupo' && (
          <div role="tabpanel" id={panelId('caixa', 'grupo')} aria-labelledby={tabId('caixa', 'grupo')} className="flex flex-col gap-5">
            <p className="max-w-prose-2xl text-body leading-6 text-ink-2">
              Tarefas da <strong className="font-semibold">Chefia · Divisão de Obras Municipais</strong> que ainda não têm
              responsável. Quem assume passa a tê-la em «Atribuídas a mim» e ela sai da fila dos colegas. Se ninguém assumir
              em 1 dia útil, o sistema atribui-a a um membro disponível com menos tarefas do que a média do grupo.
            </p>
            {queue.length === 0 ? (
              <p className="rounded-md bg-soft p-6 text-body text-ink-2">Não há tarefas por assumir.</p>
            ) : (
              <TaskList>
                {queue.map((task) => (
                  <TaskRow
                    key={task.id}
                    kind={task.kind}
                    title={task.title}
                    meta={`${task.id} · Validação da chefia · ${task.since}`}
                    extra={{ text: task.autoAssign, tone: 'warning' }}
                    deadline={task.deadline}
                    deadlineState="ok"
                    action={
                      <Button
                        variant="secondary"
                        size="sm"
                        aria-label={`Assumir ${task.title}`}
                        onClick={() => {
                          setAssumed((current) => [...current, task.id])
                          setLastAssumed(task.id)
                        }}
                      >
                        Assumir
                      </Button>
                    }
                  />
                ))}
              </TaskList>
            )}
          </div>
        )}
      </section>
    </AppLayout>
  )
}

type PersonalRequestCardProps = {
  request: PersonalRequest
  answer?: Answer
  onAnswer: (answer: Answer) => void
}

/** A colleague's transfer or substitution request, waiting for an answer. */
function PersonalRequestCard({ request, answer, onAnswer }: PersonalRequestCardProps) {
  const pending = !answer
  return (
    <article
      className={cx(
        'flex flex-wrap items-center gap-x-4.5 gap-y-3.5 rounded-md px-5 py-4.5',
        pending ? 'border border-orange bg-soft-hover' : 'border border-line bg-panel',
      )}
    >
      <Avatar initials={request.initials} size="lg" />
      <div className="flex min-w-0 grow basis-90 flex-col gap-1">
        <h3 className="text-title-md font-semibold">{request.title}</h3>
        <p className="text-body-sm text-ink-2">{request.detail}</p>
        {request.reason && <p className="text-body-sm text-ink-2">Motivo: {request.reason}</p>}
        <p className="text-label-sm leading-4.75 text-ink-3">{request.note}</p>
      </div>
      {pending ? (
        <div className="flex flex-wrap gap-2.5">
          <Button variant="secondary" size="sm" onClick={() => onAnswer('declined')}>
            Recusar
          </Button>
          <Button size="sm" onClick={() => onAnswer('accepted')}>
            Aceitar
          </Button>
        </div>
      ) : (
        <p
          role="status"
          className={cx(
            'basis-full rounded-tile px-3.5 py-2.5 text-body-sm font-semibold',
            answer === 'accepted' ? 'bg-success-soft text-success' : 'bg-line text-ink-2',
          )}
        >
          {answer === 'accepted' ? request.accepted : request.declined}
        </p>
      )}
    </article>
  )
}

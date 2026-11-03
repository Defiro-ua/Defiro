import { useLocation } from 'react-router'
import { Button } from '../components/Button'
import { Chip } from '../components/Chip'
import { AppLayout } from '../components/layout/AppLayout'
import { Accent, PageTitle } from '../components/PageTitle'
import { StatCard } from '../components/StatCard'
import { StatusBanner } from '../components/StatusBanner'
import { TaskList, TaskRow } from '../components/tasks/TaskRow'
import { hrTasks } from '../data/tasks'
import { paths } from '../routes'

/** E02b · Caixa de tarefas de RH (UC22, UC27, UC28, UC30) */
export function HrInboxPage() {
  const closed = Boolean((useLocation().state as { closed?: boolean } | null)?.closed)
  const tasks = closed ? hrTasks.filter((task) => task.id !== 'AC-2026-0122') : hrTasks
  const n = tasks.length

  return (
    <AppLayout user="joana" nav={{ active: 'inbox', inboxCount: n, inboxTo: paths.inboxHr }} gap="gap-8">
      {closed && (
        <StatusBanner
          title="AC-2026-0122 validado e fechado"
          action={
            <Button variant="ghost" size="sm" icon="download" pad="none">
              Transferir ordem de reembolso (PDF)
            </Button>
          }
        >
          A ordem de reembolso foi gerada e o procedimento está arquivado. O pagamento é tratado pela Divisão Financeira, fora
          da defiro.
        </StatusBanner>
      )}

      <header className="flex flex-col gap-3">
        <PageTitle>
          Bom dia, <Accent>Joana</Accent>
        </PageTitle>
        <p className="text-body-lg text-ink-2">
          {n === 1 ? 'Tem 1 procedimento à espera da validação final.' : `Tem ${n} procedimentos à espera da validação final.`}
        </p>
      </header>

      <div className="flex flex-wrap gap-6">
        <StatCard label="Atribuídas a mim" value={n}>
          <p className="text-body-sm text-ink-2">Validações finais</p>
        </StatCard>
        <StatCard label="Na fila do grupo" value={1}>
          <p className="text-body-sm text-ink-2">RH · Formação</p>
        </StatCard>
        <StatCard label="Em atraso" value={0}>
          <Chip tone="success" className="self-start">
            Tudo dentro do prazo
          </Chip>
        </StatCard>
      </div>

      <section aria-label="Tarefas" className="flex flex-col gap-5">
        {/* The group queue of RH is not drawn in the mockup, so only the first tab has content */}
        <div role="tablist" aria-label="Tarefas" className="flex flex-wrap gap-1 self-start rounded-pill bg-soft p-1">
          <button type="button" role="tab" aria-selected="true" className="min-h-10 rounded-pill bg-brand px-4.5 text-body-sm font-semibold text-on-brand">
            Atribuídas a mim · {n}
          </button>
          <button type="button" role="tab" aria-selected="false" aria-disabled="true" className="min-h-10 cursor-not-allowed rounded-pill px-4.5 text-body-sm text-ink-2">
            Fila do grupo · 1
          </button>
        </div>

        <TaskList>
          {tasks.map((task) => (
            <TaskRow
              key={task.id}
              kind={task.kind}
              title={task.title}
              tag={task.tag ? { label: task.tag, tone: 'error' } : undefined}
              meta={task.meta}
              extra={task.conflict ? { text: task.conflict, tone: 'error' } : undefined}
              deadline={task.deadline}
              deadlineState={task.deadlineState}
              highlight={task.highlight}
              action={
                <Button to={task.to} variant="ghost" size="sm" iconRight="arrowRight" aria-label={`Abrir ${task.title}`}>
                  Abrir
                </Button>
              }
            />
          ))}
        </TaskList>
      </section>
    </AppLayout>
  )
}

import { groups, type OverviewTask } from '../../data/overview'
import { Button } from '../Button'
import { Chip, type ChipTone } from '../Chip'
import { ChoiceCard } from '../form/ChoiceCard'
import { Modal } from '../Modal'
import { cx } from '../../lib/cx'

type AssignDialogProps = {
  task: OverviewTask | undefined
  choice: string
  onChoice: (name: string) => void
  onCancel: () => void
  onConfirm: () => void
}

/** Load bars are drawn against 8 open tasks */
const LOAD_SCALE = 8

/** Assign or reassign a task, seeing how many open tasks each person has (UC24). */
export function AssignDialog({ task, choice, onChoice, onCancel, onConfirm }: AssignDialogProps) {
  const group = groups[task?.group ?? 'dom']
  const average = parseFloat(group.average.replace(',', '.'))
  const people = group.members.filter((m) => m.name !== task?.holder)
  const notified = task?.holder ? `${choice} e ${task.holder} são avisados.` : `${choice} é avisado.`

  return (
    <Modal open={!!task} onClose={onCancel} labelledBy="atribuir-titulo" size="md">
      {task && (
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <h2 id="atribuir-titulo" className="text-heading">
              {task.holder ? 'Reatribuir tarefa' : 'Atribuir tarefa'}
            </h2>
            <p className="text-body text-ink-2">
              {task.name} · {task.id} · {task.step}.{' '}
              {task.holder
                ? `Está com ${task.holder}.`
                : task.queue
                  ? 'Está na fila do grupo, sem responsável.'
                  : 'Não está com ninguém.'}
            </p>
          </div>

          <fieldset className="flex flex-col gap-2">
            <legend className="mb-2 flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
              <span className="text-body-sm font-semibold">Novo responsável</span>
              <span className="text-label-sm text-ink-3">
                {group.name} · média de {group.average} tarefas abertas por pessoa
              </span>
            </legend>
            {people.map((person) => {
              const [label, tone]: [string, ChipTone] = person.absent
                ? ['Ausente', 'muted']
                : person.open < average
                  ? ['Abaixo da média', 'success']
                  : person.open > average
                    ? ['Acima da média', 'warning']
                    : ['Na média', 'soft']
              return (
                <ChoiceCard
                  key={person.name}
                  name="responsavel"
                  value={person.name}
                  checked={person.name === choice}
                  onSelect={onChoice}
                  disabled={!!person.absent}
                  className="px-4 py-3"
                >
                  <span className="flex min-w-0 flex-1 flex-col gap-1.5">
                    <span className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
                      <span className="text-label-md font-semibold">{person.name}</span>
                      <Chip tone={tone} size="xs">
                        {label}
                      </Chip>
                    </span>
                    <span className="flex items-center gap-2.5">
                      <span aria-hidden="true" className="h-1.5 flex-1 overflow-hidden rounded-pill bg-line">
                        <span
                          className={cx(
                            'block h-full rounded-pill',
                            person.absent ? 'bg-line-muted' : person.open > average ? 'bg-yellow' : 'bg-success',
                          )}
                          // Bar length is the person's load, from the data
                          style={{ width: `${Math.round((person.open / LOAD_SCALE) * 100)}%` }}
                        />
                      </span>
                      <span className="text-label-sm whitespace-nowrap text-ink-3 tabular-nums">
                        {person.absent ?? `${person.open} tarefas abertas`}
                      </span>
                    </span>
                  </span>
                </ChoiceCard>
              )
            })}
          </fieldset>

          <p className="rounded-md bg-soft px-4 py-3 text-body-sm text-ink-2">
            A tarefa passa já para a caixa de tarefas de {choice}, com o mesmo prazo, sem precisar de aceitação. {notified} Fica
            no histórico que foi atribuída por si.
          </p>
          <div className="flex flex-wrap justify-end gap-3">
            <Button variant="ghost" onClick={onCancel}>
              Cancelar
            </Button>
            <Button onClick={onConfirm}>Atribuir a {choice}</Button>
          </div>
        </div>
      )}
    </Modal>
  )
}

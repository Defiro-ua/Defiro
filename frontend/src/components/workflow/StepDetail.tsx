import { useId, useState } from 'react'
import { Link } from 'react-router'
import type { DesignerStep } from '../../data/workflows'
import { cx } from '../../lib/cx'
import { paths } from '../../routes'
import { Chip } from '../Chip'
import { inputClasses } from '../form/inputClasses'
import { TextField } from '../form/TextField'
import { Icon } from '../Icon'

type StepDetailProps = {
  step: DesignerStep
  onClose: () => void
}

const detailRow = 'flex min-h-12 items-center gap-2.5 rounded-md border border-line bg-panel px-3.5 text-body-sm'

/** Right-hand panel of the designer: who handles a step, its deadline, distribution and contents. */
export function StepDetail({ step, onClose }: StepDetailProps) {
  const [reasonsOpen, setReasonsOpen] = useState(false)
  const reasonsId = useId()
  const deadlineId = useId()

  return (
    <div className="flex flex-col gap-4.5">
      <div className="flex items-center gap-2.5">
        <span
          aria-hidden="true"
          className={cx(
            'grid size-8 shrink-0 place-items-center rounded-full text-body-sm font-extrabold',
            step.error ? 'bg-error-soft text-error' : 'bg-brand text-on-brand',
          )}
        >
          {step.badge}
        </span>
        <h2 className="flex-1 text-title-lg font-semibold">{step.name}</h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar o detalhe do passo"
          className="grid size-11 shrink-0 place-items-center rounded-full text-ink hover:bg-soft"
        >
          <Icon name="x" size={18} />
        </button>
      </div>

      <TextField key={step.id} label="Nome do passo" size="md" defaultValue={step.name} />

      <div className="flex flex-col gap-1.5">
        <span className="text-body-sm leading-5 font-semibold">Quem trata</span>
        <span
          className={cx(
            'flex h-11 items-center gap-2 rounded-md bg-panel px-3.5',
            step.error ? 'border-emph border-error' : 'border border-field',
          )}
        >
          <Icon name="users" size={18} className="text-accent-ink" />
          <span className="flex-1 text-body">{step.owner}</span>
          <Icon name="chevronDown" size={16} />
        </span>
        <span className="text-label-sm leading-4.75 text-ink-3">{step.ownerNote}</span>
      </div>

      {step.deadlineDays && (
        <div className="flex flex-col gap-1.5">
          <label htmlFor={deadlineId} className="text-body-sm leading-5 font-semibold">
            Prazo legal
          </label>
          <div className="flex items-center gap-2.5">
            <input key={step.id} id={deadlineId} defaultValue={step.deadlineDays} inputMode="numeric" className={inputClasses('md', 'default', 'w-20')} />
            <span className="text-body">dias</span>
          </div>
        </div>
      )}

      {step.distribution === 'queue' && (
        <div className="flex flex-col gap-2 rounded-md bg-soft px-4 py-3.5 text-body-sm text-ink-2">
          <span className="font-semibold text-ink">Como se distribuem as tarefas</span>
          <span>Cada tarefa fica na fila do grupo até alguém a assumir. Se ninguém a assumir em</span>
          <span className="flex h-10 items-center gap-2 rounded-tile border border-field bg-panel px-3 text-body text-ink">
            1 dia útil
            <span className="flex-1" />
            <Icon name="chevronDown" size={16} />
          </span>
          <span>o sistema atribui-a a um membro disponível com menos tarefas do que a média do grupo.</span>
        </div>
      )}

      <div className="flex flex-col gap-2">
        <span className="text-label-sm font-semibold text-ink-3">Detalhe do passo</span>
        {step.reasons.length > 0 && (
          <>
            <button
              type="button"
              onClick={() => setReasonsOpen((open) => !open)}
              aria-expanded={reasonsOpen}
              aria-controls={reasonsId}
              className={cx(detailRow, 'text-left hover:border-orange')}
            >
              <span className="flex-1 font-semibold">Motivos de rejeição</span>
              <span className="text-ink-3">{step.reasons.length}</span>
              <Icon name="chevronDown" size={16} className={cx('transition', reasonsOpen && 'rotate-180')} />
            </button>
            {reasonsOpen && (
              <ul id={reasonsId} className="flex flex-col gap-2 py-1 pl-2">
                {step.reasons.map((reason) => (
                  <li key={reason.name} className="flex items-center gap-2 rounded-md bg-soft py-2 pr-2 pl-3.5 text-body-sm">
                    <span className="flex-1">{reason.name}</span>
                    <Chip tone={reason.type === 'Corrigível' ? 'warning' : 'error'} size="xs">
                      {reason.type}
                    </Chip>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
        <Link to={paths.stepForms} className={cx(detailRow, 'text-ink hover:border-orange hover:text-ink')}>
          <span className="flex-1 font-semibold">Formulário</span>
          <span className="text-ink-3">{step.fields} campos</span>
          <Icon name="chevronRight" size={16} />
        </Link>
        <span className={detailRow}>
          <span className="flex-1 font-semibold">Integração</span>
          <span className="text-ink-3">{step.integration}</span>
        </span>
        <span className="flex min-h-12 flex-col gap-0.5 rounded-md border border-line bg-panel px-3.5 py-2.5 text-body-sm">
          <span className="font-semibold">Regras usadas</span>
          <span className="text-ink-3">{step.rules}</span>
        </span>
      </div>
    </div>
  )
}

import { useState } from 'react'
import { Button } from '../components/Button'
import { Chip } from '../components/Chip'
import { ChoiceCard } from '../components/form/ChoiceCard'
import { Switch } from '../components/form/Switch'
import { TextField } from '../components/form/TextField'
import { Icon } from '../components/Icon'
import { EditorLayout } from '../components/layout/EditorLayout'
import { workflowTabs } from '../components/workflow/workflowTabs'
import { formSections, formSteps, valueSources, type FormFieldDef, type ValueSource } from '../data/workflows'
import { cx } from '../lib/cx'
import { paths } from '../routes'

/** A field shown like a select (the choice lists are not drawn in the mockup). */
function FakeSelect({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-body-sm leading-5 font-semibold">{label}</span>
      <span className="flex h-11 items-center gap-2 rounded-md border border-field bg-panel px-3.5">
        <span className="flex-1 text-body">{value}</span>
        <Icon name="chevronDown" size={16} />
      </span>
    </div>
  )
}

/** E14 · Designer, formulário do passo (UC04) */
export function StepFormsPage() {
  const [selectedId, setSelectedId] = useState('pais')
  const [sources, setSources] = useState<Record<string, ValueSource>>({})
  const [required, setRequired] = useState<Record<string, boolean>>({})

  const resolve = (field: FormFieldDef) => ({
    ...field,
    source: sources[field.id] ?? field.source,
    required: required[field.id] ?? field.required,
  })
  const selected = resolve(formSections.flatMap((s) => s.fields).find((f) => f.id === selectedId) ?? formSections[2].fields[1])
  const external = selected.source !== 'req'

  return (
    <EditorLayout
      backTo={paths.workflows}
      backLabel="Voltar aos workflows"
      title="Ajudas de custo"
      status={<Chip dot>v5 · rascunho</Chip>}
      tabs={workflowTabs('forms')}
      actions={
        <>
          <Button variant="secondary" size="sm" icon="check">
            Validar
          </Button>
          <Button to={paths.submitChange} size="sm" glow>
            Submeter para aprovação
          </Button>
        </>
      }
    >
      <div className="flex flex-1 flex-wrap items-stretch">
        <aside aria-label="Formulário de que passo" className="flex max-w-full grow basis-55 flex-col gap-2 border-r border-line px-4 py-5">
          <span className="px-1 pb-1.5 text-label-sm font-semibold text-ink-3">Formulário do passo</span>
          {formSteps.map((step) => (
            <button
              key={step.n}
              type="button"
              aria-pressed={!!step.active}
              className={cx(
                'flex min-h-14 items-center gap-2.5 rounded-md px-3 py-2 text-left',
                step.active ? 'border-2 border-orange bg-selected' : 'border border-line bg-panel hover:border-orange',
              )}
            >
              <span
                aria-hidden="true"
                className={cx(
                  'grid size-7 shrink-0 place-items-center rounded-full text-label-sm font-extrabold',
                  step.active ? 'bg-brand text-on-brand' : 'bg-line text-ink-2',
                )}
              >
                {step.n}
              </span>
              <span className="flex flex-1 flex-col gap-0.5">
                <span className="text-body-sm font-semibold text-ink">{step.name}</span>
                <span className="text-caption text-ink-3">{step.fields}</span>
              </span>
              {step.mark && (
                <Chip tone={step.mark.tone} size="xs">
                  {step.mark.label}
                </Chip>
              )}
            </button>
          ))}
        </aside>

        <section aria-labelledby="form-titulo" className="flex min-w-0 grow-999 basis-130 flex-col gap-5 bg-tint px-4 pt-6 pb-10 sm:px-8">
          <div className="flex flex-col gap-0.5">
            <h2 id="form-titulo" className="text-title-lg font-semibold">
              Pedido · formulário do requerente
            </h2>
            <p className="text-body-sm text-ink-3">15 campos · 1 alteração em relação à v4</p>
          </div>

          {formSections.map((section) => (
            <div key={section.name} className="flex flex-col gap-2 rounded-md border border-line bg-panel p-5">
              <div className="flex items-center gap-2.5 pb-1.5">
                <Icon name="grip" size={16} className="text-line-muted" />
                <h3 className="flex-1 text-label-md font-semibold">{section.name}</h3>
                <span className="text-label-sm text-ink-3">
                  {section.fields.length} {section.fields.length === 1 ? 'campo' : 'campos'}
                </span>
              </div>
              {section.fields.map((raw) => {
                const field = resolve(raw)
                const on = field.id === selectedId
                const source = valueSources[field.source]
                return (
                  <button
                    key={field.id}
                    type="button"
                    aria-pressed={on}
                    onClick={() => setSelectedId(field.id)}
                    className={cx(
                      'flex min-h-13 w-full flex-wrap items-center gap-x-2.5 gap-y-2 rounded-md px-3.5 py-2',
                      on ? 'border-2 border-orange bg-selected' : 'border border-line bg-bg hover:border-orange',
                    )}
                  >
                    <Icon name="grip" size={14} className="text-line-muted" />
                    <span className="min-w-0 grow basis-35 text-left text-body text-ink">
                      {field.label}
                      {field.required && (
                        <span className="text-error">
                          {' '}
                          <span aria-hidden="true">*</span>
                          <span className="sr-only">(obrigatório)</span>
                        </span>
                      )}
                    </span>
                    {field.isNew && (
                      <Chip tone="success" size="xs">
                        Novo
                      </Chip>
                    )}
                    <Chip size="xs">{field.type}</Chip>
                    <Chip tone={source.tone} size="xs">
                      {source.short}
                    </Chip>
                  </button>
                )
              })}
            </div>
          ))}
          <Button variant="dashed" size="sm" icon="plus" iconSize={16} className="self-start">
            Adicionar campo
          </Button>
        </section>

        <aside aria-label="Propriedades do campo" className="flex max-w-full grow basis-85 flex-col gap-5.5 border-l border-line bg-bg p-6">
          <div className="flex flex-col gap-1">
            <span className="text-label-sm font-semibold text-ink-3">Campo selecionado</span>
            <h2 className="text-title-lg font-semibold">{selected.label}</h2>
          </div>
          <TextField key={selected.id} label="Rótulo" size="md" defaultValue={selected.label} />
          <FakeSelect label="Tipo" value={selected.type} />

          <fieldset className="flex flex-col gap-2">
            <legend className="mb-2 text-body-sm font-semibold">Origem do valor</legend>
            {(Object.keys(valueSources) as ValueSource[]).map((id) => (
              <ChoiceCard
                key={id}
                name="origem"
                value={id}
                checked={selected.source === id}
                onSelect={(value) => setSources((current) => ({ ...current, [selected.id]: value as ValueSource }))}
                dotSize="sm"
                gap="gap-3"
                className="px-3.5 py-2.5"
              >
                <span className="flex flex-1 flex-col gap-0.5">
                  <span className="text-body-sm font-semibold text-ink">{valueSources[id].name}</span>
                  <span className="text-caption text-ink-3">{valueSources[id].description}</span>
                </span>
              </ChoiceCard>
            ))}
          </fieldset>

          {external && (
            <div className="flex flex-col gap-1.5">
              <FakeSelect
                label={selected.source === 'entra' ? 'Atributo do Entra ID' : 'Dado da Chave Móvel Digital'}
                value={selected.attribute ?? (selected.source === 'entra' ? 'País ou região' : 'Nome completo')}
              />
              <span className="text-label-sm text-ink-3">O requerente vê o valor, mas não o pode alterar.</span>
            </div>
          )}

          {!external && selected.options && (
            <div className="flex flex-col gap-2">
              <span className="text-body-sm font-semibold">Opções</span>
              <ul className="flex flex-col gap-2">
                {selected.options.map((option) => (
                  <li key={option} className="flex min-h-10 items-center rounded-md bg-soft px-3.5 text-body-sm">
                    {option}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex items-center gap-3">
            <span id="obrigatorio-rotulo" className="flex-1 text-body-sm font-semibold">
              Obrigatório
            </span>
            <Switch
              checked={selected.required}
              onChange={(value) => setRequired((current) => ({ ...current, [selected.id]: value }))}
              ariaLabel="Obrigatório"
            />
          </div>
        </aside>
      </div>
    </EditorLayout>
  )
}

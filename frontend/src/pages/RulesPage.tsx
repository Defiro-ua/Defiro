import { useState } from 'react'
import { Link } from 'react-router'
import { Button } from '../components/Button'
import { Chip, type ChipTone } from '../components/Chip'
import { TextareaField } from '../components/form/TextareaField'
import { TextField } from '../components/form/TextField'
import { inputClasses } from '../components/form/inputClasses'
import { AppLayout } from '../components/layout/AppLayout'
import { PageTitle } from '../components/PageTitle'
import { Panel } from '../components/Panel'
import { SectionTitle } from '../components/SectionTitle'
import { HeadRow, TableFrame, Td, Th, Tr } from '../components/Table'
import { TextLink } from '../components/TextLink'
import { StartDateChoice } from '../components/workflow/StartDateChoice'
import {
  businessRules,
  newRuleDraft,
  phaseIndex,
  ruleLifecycle,
  rulePhaseLabel,
  submittedNewRule,
  type BusinessRule,
  type RulePhase,
} from '../data/rules'
import { startDates } from '../data/workflows'
import { cx } from '../lib/cx'
import { paths } from '../routes'

const phaseTone: Record<RulePhase | 'live', ChipTone> = {
  live: 'warning',
  draft: 'neutral',
  approval: 'info',
  approved: 'success',
  scheduled: 'accent',
}

type Pending = { version: number; phase: RulePhase; since: string }

/** E17 · Regras de negócio (UC09, UC11, UC12, UC26) */
export function RulesPage() {
  const [selectedId, setSelectedId] = useState('horas')
  const [editing, setEditing] = useState<string[]>([])
  const [sent, setSent] = useState<string[]>([])
  const [scheduled, setScheduled] = useState<string[]>([])
  const [date, setDate] = useState(startDates[0].date)
  const [newRule, setNewRule] = useState<BusinessRule | null>(null)
  const [newRuleWorkflows, setNewRuleWorkflows] = useState(
    newRuleDraft.workflows.filter((w) => w.checked).map((w) => w.name),
  )

  const creating = selectedId === 'nova'
  const rules = newRule ? [newRule, ...businessRules] : businessRules

  // A rule's next version, taking into account what was done on this screen
  function pendingOf(rule: BusinessRule): Pending | undefined {
    if (rule.pending?.phase === 'approved' && scheduled.includes(rule.id)) return { ...rule.pending, phase: 'scheduled' }
    if (rule.pending) return rule.pending
    if (editing.includes(rule.id))
      return { version: rule.liveVersion + 1, phase: sent.includes(rule.id) ? 'approval' : 'draft', since: '10/10/2026' }
    return undefined
  }

  const phaseText = (phase: RulePhase) => (phase === 'scheduled' ? `${rulePhaseLabel.scheduled} · ${date}` : rulePhaseLabel[phase])
  const selected = rules.find((r) => r.id === selectedId) ?? rules[0]
  const pending = pendingOf(selected)

  return (
    <AppLayout user="sofia" nav={{ active: 'regras', inboxCount: 0 }} width="full" gap="gap-6">
      <header className="flex flex-wrap items-end gap-x-6 gap-y-4">
        <div className="flex grow basis-80 flex-col gap-2">
          <PageTitle accent>Regras de negócio</PageTitle>
          <p className="max-w-prose-xl text-body text-ink-3">
            Valores que os workflows usam e que mudam com o tempo, como o pagamento das horas extraordinárias. Cada alteração é
            uma versão nova: vai para aprovação, é agendada e só depois entra em vigor.
          </p>
        </div>
        <Button variant="secondary" size="sm" icon="plus" onClick={() => setSelectedId('nova')}>
          Nova regra
        </Button>
      </header>

      <div className="flex flex-wrap items-start gap-6">
        <nav aria-label="Regras" className="flex max-w-full grow basis-70 flex-col gap-2">
          {creating && (
            <span className="flex flex-col gap-1.5 rounded-md border-2 border-dashed border-orange bg-selected px-4 py-3.5">
              <span className="text-label-md font-semibold">Nova regra</span>
              <Chip size="xs" className="self-start">
                v1 em rascunho
              </Chip>
            </span>
          )}
          {rules.map((rule) => {
            const on = !creating && rule.id === selected.id
            const p = pendingOf(rule)
            return (
              <button
                key={rule.id}
                type="button"
                onClick={() => setSelectedId(rule.id)}
                aria-current={on ? 'true' : undefined}
                className={cx(
                  'flex flex-col gap-1.5 rounded-md px-4 py-3.5 text-left',
                  on ? 'border-2 border-orange bg-selected' : 'border border-line bg-panel hover:border-orange',
                )}
              >
                <span className="text-label-md font-semibold text-ink">{rule.name}</span>
                <span className="text-label-sm text-ink-3">
                  {rule.usedIn.map((u) => u.workflow).join(', ')} ·{' '}
                  {rule.liveVersion ? `v${rule.liveVersion} em vigor` : 'ainda sem versão em vigor'}
                </span>
                {p && (
                  <Chip tone={phaseTone[p.phase]} size="xs" className="self-start">
                    v{p.version} {phaseText(p.phase)}
                  </Chip>
                )}
              </button>
            )
          })}
        </nav>

        <div className="flex min-w-0 grow-999 basis-140 flex-col gap-6">
          {creating ? (
            <NewRuleForm
              workflows={newRuleWorkflows}
              onWorkflows={setNewRuleWorkflows}
              onCancel={() => setSelectedId('horas')}
              onSubmit={() => {
                setNewRule(submittedNewRule(newRuleWorkflows))
                setSelectedId('aloj')
              }}
            />
          ) : (
            <>
              <Panel padding="lg" aria-labelledby="regra-nome" className="flex flex-col gap-5">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                  <h2 id="regra-nome" className="grow basis-60 text-heading">
                    {selected.name}
                  </h2>
                  <Chip tone={phaseTone[pending?.phase ?? 'live']}>
                    {pending ? `v${pending.version} ${phaseText(pending.phase)}` : `v${selected.liveVersion} em vigor`}
                  </Chip>
                </div>

                {pending && <Lifecycle phase={pending.phase} version={pending.version} />}

                <div className="flex flex-col gap-2">
                  <h3 className="text-body-sm font-semibold">Usada em</h3>
                  {selected.usedIn.map((use) => (
                    <div key={use.workflow} className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-md bg-tint px-3.5 py-2.5">
                      <Link to={use.to} className="text-label-md font-semibold underline underline-offset-4">
                        {use.workflow}
                      </Link>
                      <span className="text-body-sm text-ink-2">{use.detail}</span>
                    </div>
                  ))}
                </div>

                <ParamsTable rule={selected} pending={pending} phaseText={phaseText} />

                {!pending && (
                  <Button
                    variant="accent-outline"
                    size="sm"
                    className="self-start"
                    onClick={() => setEditing((list) => [...list, selected.id])}
                  >
                    Alterar valores
                  </Button>
                )}

                {pending?.phase === 'draft' && (
                  <div className="flex flex-col gap-4">
                    <TextareaField label="Descrição da alteração" required requiredTone="error" rows={2} defaultValue={selected.changeNote} />
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
                      <p className="grow basis-65 text-label-sm leading-4.75 text-ink-3">
                        Vai para Helena Costa, a sua chefia no Microsoft Entra ID. Depois de aprovada, escolhe a data em que entra em
                        vigor.
                      </p>
                      <Button onClick={() => setSent((list) => [...list, selected.id])}>Submeter para aprovação</Button>
                    </div>
                  </div>
                )}

                {pending?.phase === 'approval' && (
                  <div role="status" className="flex flex-col gap-1 rounded-md bg-info-soft px-4.5 py-4">
                    <span className="text-label-md font-semibold text-info">v{pending.version} enviada para aprovação</span>
                    <span className="text-body-sm text-ink-2">
                      {selected.liveVersion
                        ? `Enviada a Helena Costa a ${pending.since}. Até ser aprovada e agendada, continua em vigor a v${selected.liveVersion}.`
                        : `Enviada a Helena Costa a ${pending.since}. Depois de aprovada, escolhe a data em que entra em vigor e liga-a aos passos no designer.`}
                    </span>
                  </div>
                )}

                {pending?.phase === 'approved' && (
                  <div className="flex flex-col gap-4 rounded-md border border-line-strong bg-bg p-5">
                    <StartDateChoice
                      name="data-regra"
                      showLegend
                      legend={`A v${pending.version} foi aprovada por Helena Costa a 09/10/2026. Quando entra em vigor?`}
                      value={date}
                      onChange={setDate}
                    />
                    <div className="flex flex-col gap-1.5 rounded-md bg-soft px-4 py-3.5">
                      <span className="text-body-sm font-semibold">Workflows afetados</span>
                      <span className="text-body-sm text-ink-2">
                        <TextLink to={paths.versions}>Ajudas de custo</TextLink> · os pedidos iniciados a partir de {date} usam a v2;
                        os 12 em curso mantêm a v1 até ao fim.
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center justify-end gap-3">
                      <p className="grow basis-65 text-label-sm leading-4.75 text-ink-3">
                        Às 00:00. Pode também indicar uma data de fim, para a regra deixar de ser usada em pedidos novos.
                      </p>
                      <Button onClick={() => setScheduled((list) => [...list, selected.id])}>Agendar para {date}</Button>
                    </div>
                  </div>
                )}

                {pending?.phase === 'scheduled' && (
                  <div role="status" className="flex flex-col gap-1 rounded-md bg-info-soft px-4.5 py-4">
                    <span className="text-label-md font-semibold text-info">
                      A v{pending.version} entra em vigor a {date}, às 00:00
                    </span>
                    <span className="text-body-sm text-ink-2">
                      Os pedidos de Ajudas de custo iniciados a partir dessa data usam a v2. Os que já estão em curso mantêm a v1.
                    </span>
                  </div>
                )}
              </Panel>

              <Panel variant="soft" aria-labelledby="historico-regra" className="flex flex-col gap-3.5">
                <SectionTitle as="h3" size="sm" id="historico-regra">
                  Histórico da regra
                </SectionTitle>
                {selected.history.map((entry) => {
                  const scheduledNow = selected.id === 'km' && entry.v === 'v2' && pending?.phase === 'scheduled'
                  return (
                    <div key={entry.v} className="flex flex-wrap items-baseline gap-x-3 gap-y-1 rounded-md bg-bg px-3.5 py-3">
                      <span className="shrink-0 basis-10 text-label-md font-extrabold">{entry.v}</span>
                      <span className="flex grow basis-65 flex-col gap-0.5">
                        <span className="text-body-sm font-semibold">{scheduledNow ? `Agendada para ${date}` : entry.period}</span>
                        <span className="text-label-sm text-ink-3">
                          {scheduledNow ? 'Agendada por Sofia Almeida · aprovada por Helena Costa a 09/10/2026' : entry.who}
                        </span>
                      </span>
                    </div>
                  )
                })}
                <p className="text-label-sm text-ink-3">Cada procedimento usa as versões em vigor no dia em que começou.</p>
              </Panel>
            </>
          )}
        </div>
      </div>
    </AppLayout>
  )
}

/** Draft → approval → approved → scheduled → in force, with the current phase highlighted. */
function Lifecycle({ phase, version }: { phase: RulePhase; version: number }) {
  const current = phaseIndex[phase]
  return (
    <ol aria-label={`Estado da v${version}`} className="flex flex-wrap gap-1.5">
      {ruleLifecycle.map((name, i) => {
        const done = i < current
        const now = i === current
        return (
          <li
            key={name}
            aria-current={now ? 'step' : undefined}
            className={cx(
              'inline-flex min-h-9 items-center gap-2 rounded-pill py-0 pr-3.5 pl-1.5 text-label-sm',
              now && 'border-emph border-orange bg-selected font-semibold text-ink',
              done && 'border border-line bg-tint text-ink-2',
              !now && !done && 'border border-dashed border-line-strong bg-panel text-ink-3',
            )}
          >
            <span
              aria-hidden="true"
              className={cx(
                'grid size-6 place-items-center rounded-full text-caption font-extrabold',
                now ? 'bg-brand text-on-brand' : done ? 'bg-success-soft text-success' : 'bg-line text-ink-3',
              )}
            >
              {done ? '✓' : i + 1}
            </span>
            {done && <span className="sr-only">Feito: </span>}
            {name}
          </li>
        )
      })}
    </ol>
  )
}

type ParamsTableProps = { rule: BusinessRule; pending?: Pending; phaseText: (p: RulePhase) => string }

/** Values in force and, when there is one, the next version (editable while in draft). */
function ParamsTable({ rule, pending, phaseText }: ParamsTableProps) {
  const editable = pending?.phase === 'draft'
  return (
    <TableFrame>
      <table className="w-full min-w-130 border-collapse text-body">
        <thead>
          <HeadRow>
            <Th>Parâmetro</Th>
            {rule.liveVersion > 0 && <Th>Em vigor · v{rule.liveVersion}</Th>}
            {pending && (
              <Th tone="accent">
                {editable ? `Nova versão · v${pending.version}` : `v${pending.version} · ${phaseText(pending.phase)}`}
              </Th>
            )}
          </HeadRow>
        </thead>
        <tbody>
          {rule.params.map((param) => {
            const changed = param.next !== param.current
            return (
              <Tr key={param.name}>
                <Td pad="compact">{param.name}</Td>
                {rule.liveVersion > 0 && (
                  <Td pad="compact" numeric className="text-ink-2">
                    {param.current}
                  </Td>
                )}
                {pending &&
                  (editable ? (
                    <Td pad="input">
                      <input
                        defaultValue={param.next}
                        aria-label={`${param.name}, nova versão`}
                        className={inputClasses('sm', changed ? 'changed' : 'default', 'max-w-45 tabular-nums')}
                      />
                    </Td>
                  ) : (
                    <Td
                      pad="compact"
                      numeric
                      className={changed && param.current ? 'bg-changed-soft font-semibold text-warning' : 'text-ink-2'}
                    >
                      {param.next}
                    </Td>
                  ))}
              </Tr>
            )
          })}
        </tbody>
      </table>
    </TableFrame>
  )
}

type NewRuleFormProps = {
  workflows: string[]
  onWorkflows: (list: string[]) => void
  onCancel: () => void
  onSubmit: () => void
}

/** "Nova regra": name, purpose, workflows that use it and its values. */
function NewRuleForm({ workflows, onWorkflows, onCancel, onSubmit }: NewRuleFormProps) {
  return (
    <Panel padding="lg" aria-labelledby="nova-regra" className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <h2 id="nova-regra" className="grow basis-60 text-heading">
          Nova regra
        </h2>
        <Chip>v1 · rascunho</Chip>
      </div>
      <TextField label="Nome" required requiredTone="error" defaultValue={newRuleDraft.name} fieldClassName="max-w-field" />
      <TextareaField label="Para que serve" rows={2} defaultValue={newRuleDraft.purpose} />
      <fieldset className="flex flex-col gap-2.5">
        <legend className="mb-2.5 text-body-sm font-semibold">Usada nos workflows</legend>
        <div className="flex flex-wrap gap-2.5">
          {newRuleDraft.workflows.map((workflow) => {
            const checked = workflows.includes(workflow.name)
            return (
              <label
                key={workflow.name}
                className={cx(
                  'inline-flex min-h-11 items-center gap-2.5 rounded-pill px-4 text-body-sm',
                  checked ? 'border-emph border-orange bg-soft-hover font-semibold' : 'border border-line-strong bg-panel',
                )}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() =>
                    onWorkflows(checked ? workflows.filter((w) => w !== workflow.name) : [...workflows, workflow.name])
                  }
                  className="size-4.5 accent-orange"
                />
                {workflow.name}
              </label>
            )
          })}
        </div>
        <p className="text-label-sm leading-4.75 text-ink-3">Em cada workflow escolhe depois, no designer, em que passo a regra é usada.</p>
      </fieldset>
      <div className="flex flex-col gap-2.5">
        <h3 className="text-body-sm font-semibold">Valores</h3>
        <TableFrame>
          <table className="w-full min-w-130 border-collapse text-body">
            <thead>
              <HeadRow>
                <Th>Parâmetro</Th>
                <Th>Valor</Th>
                <Th>Unidade</Th>
              </HeadRow>
            </thead>
            <tbody>
              {newRuleDraft.params.map((param, i) => (
                <Tr key={param.name}>
                  <Td pad="input">
                    <input defaultValue={param.name} aria-label={`Parâmetro ${i + 1}`} className={inputClasses('sm')} />
                  </Td>
                  <Td pad="input">
                    <input
                      defaultValue={param.value}
                      aria-label={`Valor do parâmetro ${i + 1}`}
                      inputMode="decimal"
                      className={inputClasses('sm', 'default', 'max-w-30 tabular-nums')}
                    />
                  </Td>
                  <Td pad="input" className="text-ink-2">
                    {param.unit}
                  </Td>
                </Tr>
              ))}
            </tbody>
          </table>
        </TableFrame>
        <Button variant="dashed" size="sm" icon="plus" iconSize={16} className="self-start">
          Adicionar parâmetro
        </Button>
      </div>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-3 pt-1">
        <p className="grow basis-65 text-label-sm leading-4.75 text-ink-3">
          Vai para Helena Costa, a sua chefia no Microsoft Entra ID. Depois de aprovada, escolhe a data em que entra em vigor.
        </p>
        <Button variant="ghost" onClick={onCancel}>
          Cancelar
        </Button>
        <Button onClick={onSubmit}>Submeter para aprovação</Button>
      </div>
    </Panel>
  )
}

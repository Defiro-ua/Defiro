import { useState } from 'react'
import { Link } from 'react-router'
import { Avatar } from '../components/Avatar'
import { Breadcrumb } from '../components/Breadcrumb'
import { Chip, type ChipTone } from '../components/Chip'
import { TextareaField } from '../components/form/TextareaField'
import { AppLayout } from '../components/layout/AppLayout'
import { Accent, PageTitle } from '../components/PageTitle'
import { Panel } from '../components/Panel'
import { SectionTitle } from '../components/SectionTitle'
import { HeadRow, TableFrame, Td, Th, Tr } from '../components/Table'
import { TextLink } from '../components/TextLink'
import { DecisionPanel, type ChangeDecision } from '../components/workflow/DecisionPanel'
import { ChangeLegend, FlowColumn } from '../components/workflow/FlowComparison'
import { approvalNotes, overtimeRuleDiff, pendingChanges, v4Flow, v5Description, v5Flow, type PendingChange } from '../data/workflows'
import { cx } from '../lib/cx'
import { paths } from '../routes'

const decisionChip: Record<ChangeDecision, { label: string; tone: ChipTone }> = {
  '': { label: 'Em aprovação', tone: 'info' },
  rejecting: { label: 'Em aprovação', tone: 'info' },
  approved: { label: 'Aprovada', tone: 'success' },
  rejected: { label: 'Rejeitada', tone: 'error' },
}

/** E16 · Rever alteração, de workflow ou de regra (UC10, UC12) */
export function ApprovalsPage() {
  const [current, setCurrent] = useState<PendingChange['id']>('wf')
  const [decisions, setDecisions] = useState<Record<PendingChange['id'], ChangeDecision>>({ wf: '', regra: '' })
  const change = pendingChanges.find((c) => c.id === current) ?? pendingChanges[0]
  const decision = decisions[current]
  const pending = pendingChanges.filter((c) => decisions[c.id] === '' || decisions[c.id] === 'rejecting').length
  const decide = (value: ChangeDecision) => setDecisions((all) => ({ ...all, [current]: value }))

  return (
    <AppLayout
      user="helena"
      nav={{ active: 'alteracoes', inboxCount: 0, approvalsCount: pending }}
      width="detail"
      compactTop
    >
      <nav aria-labelledby="por-aprovar" className="flex flex-col gap-2.5">
        <h2 id="por-aprovar" className="text-label-sm font-semibold text-ink-3">
          Por aprovar · {pending}
        </h2>
        <ul className="flex flex-wrap gap-3">
          {pendingChanges.map((item) => {
            const on = item.id === current
            const chip = decisionChip[decisions[item.id]]
            return (
              <li key={item.id} className="grow sm:grow-0">
                <button
                  type="button"
                  onClick={() => setCurrent(item.id)}
                  aria-current={on ? 'true' : undefined}
                  className={cx(
                    'flex w-full min-w-70 flex-col gap-1.5 rounded-md px-4 py-3.5 text-left',
                    on ? 'border-2 border-orange bg-selected' : 'border border-line bg-panel hover:border-orange',
                  )}
                >
                  <span className="flex items-center gap-2">
                    <Chip size="xs">{item.kind}</Chip>
                    <Chip size="xs" tone={chip.tone}>
                      {chip.label}
                    </Chip>
                  </span>
                  <span className="text-label-md font-semibold text-ink">{item.name}</span>
                  <span className="text-label-sm text-ink-3">{item.who}</span>
                </button>
              </li>
            )
          })}
        </ul>
      </nav>

      <header className="flex flex-col gap-3.5">
        <Breadcrumb trail={[{ label: 'Alterações por aprovar', to: paths.approvals }]} current={change.short} />
        <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
          <PageTitle>
            {change.titleA} · <Accent>{change.titleB}</Accent>
          </PageTitle>
          <Chip tone={decisionChip[decision].tone} dot>
            {decisionChip[decision].label}
          </Chip>
        </div>
        <p className="flex items-center gap-2.5 text-body text-ink-2">
          <Avatar initials="SA" size="xs" />
          <span>
            Submetida por <strong className="font-semibold text-ink">Sofia Almeida</strong> a {change.submitted} · enviada para
            si porque é a chefia dela no Microsoft Entra ID
          </span>
        </p>
      </header>

      {current === 'wf' ? (
        <WorkflowChange decision={decision} onDecision={decide} />
      ) : (
        <RuleChange decision={decision} onDecision={decide} />
      )}
    </AppLayout>
  )
}

type ChangeProps = { decision: ChangeDecision; onDecision: (d: ChangeDecision) => void }

function WorkflowChange({ decision, onDecision }: ChangeProps) {
  return (
    <div className="flex flex-col gap-7">
      {/* Only the flow comparison is drawn in the mockup; the other parts are shown but not available */}
      <div role="tablist" aria-label="O que mudou" className="flex flex-wrap gap-1 self-start rounded-pill bg-soft p-1">
        {['Resumo', 'Fluxo · 2', 'Formulários · 2', 'Regras · sem alterações'].map((label) => {
          const on = label.startsWith('Fluxo')
          return (
            <button
              key={label}
              type="button"
              role="tab"
              aria-selected={on}
              aria-disabled={on ? undefined : true}
              className={cx(
                'min-h-10 rounded-pill px-4 text-body-sm',
                on ? 'bg-brand font-semibold text-on-brand' : 'cursor-not-allowed text-ink-2',
              )}
            >
              {label}
            </button>
          )
        })}
      </div>

      <div className="flex flex-wrap items-start gap-8">
        <div className="flex min-w-0 grow-999 basis-140 flex-col gap-6">
          <Panel aria-label="Comparação do fluxo" className="flex flex-col gap-5">
            <div className="flex flex-wrap gap-6">
              <FlowColumn title="v4 · em vigor" nodes={v4Flow} />
              <FlowColumn title="v5 · proposta" nodes={v5Flow} proposed />
            </div>
            <ChangeLegend />
          </Panel>

          <Panel variant="soft" aria-labelledby="descricao" padding="lg" className="flex flex-col gap-2.5">
            <SectionTitle id="descricao" size="md">
              Descrição da alteração
            </SectionTitle>
            <p className="text-body leading-6 text-ink-2">{v5Description}</p>
          </Panel>

          <Panel aria-labelledby="regras-usadas" padding="lg" className="flex flex-col gap-3">
            <SectionTitle id="regras-usadas" size="md">
              Regras de negócio que esta versão usa
            </SectionTitle>
            <p className="text-body-sm text-ink-3">
              A v5 não altera regras. Cada pedido usa a versão de cada regra em vigor no dia em que começa.
            </p>
            <RuleUse name="Valor diário das ajudas de custo" detail="v3 em vigor · passo Verificação financeira" />
            <RuleUse name="Valor por quilómetro" detail="v1 em vigor · v2 aprovada, ainda por agendar · passo Pedido" />
          </Panel>

          <Panel aria-labelledby="registo-notas" padding="lg" className="flex flex-col gap-4.5">
            <SectionTitle id="registo-notas" size="md">
              Registo de notas
            </SectionTitle>
            {approvalNotes.map((note) => (
              <div key={note.when} className="flex gap-3">
                <Avatar initials={note.initials} size="md" />
                <div className="flex flex-col gap-1">
                  <p className="text-body-sm">
                    <strong className="font-semibold">{note.name}</strong> <span className="text-ink-3">· {note.when}</span>
                  </p>
                  <p className="text-body leading-6 text-ink-2">{note.text}</p>
                </div>
              </div>
            ))}
            <TextareaField label="Escrever comentário" hideLabel rows={2} placeholder="Escrever comentário…" />
          </Panel>
        </div>

        <aside className="flex max-w-full grow basis-80 flex-col gap-6">
          <DecisionPanel
            id="decisao-wf"
            version="v5"
            subject="workflow"
            decision={decision}
            onDecision={onDecision}
            rejectPlaceholder="Explique à Sofia o que falta ou o que não pode avançar"
            rejectDraft="O prazo de 3 dias não é realista em agosto. Mantenha os 5 dias e submeta só o parecer jurídico."
            rejectHint="Obrigatório. A Sofia vê este comentário no Registo de notas."
            approvedText="A Sofia Almeida é notificada e pode agora escolher a data em que a v5 entra em vigor."
            rejectedText="A v5 volta a rascunho. A Sofia recebe o seu comentário e pode corrigir e submeter de novo. A v4 continua em vigor."
            historyLink={paths.versions}
          />
          <Panel variant="soft" aria-labelledby="impacto" className="flex flex-col gap-3">
            <SectionTitle id="impacto">Impacto</SectionTitle>
            <p className="flex items-baseline gap-2.5">
              <span className="text-stat tabular-nums">12</span>
              <span className="text-body-sm text-ink-2">procedimentos em curso continuam na v4 até ao fim.</span>
            </p>
            <p className="text-body-sm text-ink-2">Só os pedidos iniciados depois da data de entrada em vigor usam a v5.</p>
          </Panel>
        </aside>
      </div>
    </div>
  )
}

function RuleChange({ decision, onDecision }: ChangeProps) {
  return (
    <div className="flex flex-wrap items-start gap-8">
      <div className="flex min-w-0 grow-999 basis-140 flex-col gap-6">
        <Panel aria-labelledby="muda-regra" className="flex flex-col gap-4">
          <SectionTitle id="muda-regra" size="md">
            O que muda em relação à v2
          </SectionTitle>
          <TableFrame>
            <table className="w-full min-w-130 border-collapse text-body">
              <thead>
                <HeadRow>
                  <Th>Parâmetro</Th>
                  <Th>v2 · em vigor</Th>
                  <Th tone="accent">v3 · proposta</Th>
                </HeadRow>
              </thead>
              <tbody>
                {overtimeRuleDiff.map((row) => {
                  const changed = row.current !== row.proposed
                  return (
                    <Tr key={row.param} className={cx(changed && 'bg-changed-soft')}>
                      <Td pad="compact" className={cx(changed && 'font-semibold')}>{row.param}</Td>
                      <Td pad="compact" className="text-ink-2">{row.current}</Td>
                      <Td pad="compact" className={changed ? 'font-semibold text-warning' : 'text-ink-2'}>
                        {row.proposed}
                        {changed && (
                          <Chip tone="warning" size="xs" className="ml-1.5">
                            Alterado
                          </Chip>
                        )}
                      </Td>
                    </Tr>
                  )
                })}
              </tbody>
            </table>
          </TableFrame>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-md bg-tint px-3.5 py-2.5">
            <span className="text-body-sm font-semibold">Usada em</span>
            <Link to={paths.workflows} className="text-label-md font-semibold underline underline-offset-4">
              Horas extraordinárias
            </Link>
            <span className="text-body-sm text-ink-2">passo Validação da chefia · calcula o valor a pagar</span>
          </div>
        </Panel>
        <Panel variant="soft" aria-labelledby="descricao-regra" padding="lg" className="flex flex-col gap-2.5">
          <SectionTitle id="descricao-regra" size="md">
            Descrição da alteração
          </SectionTitle>
          <p className="text-body leading-6 text-ink-2">Sobe o máximo mensal de 20 para 25 horas, para cobrir a época de obras.</p>
        </Panel>
      </div>

      <aside className="flex max-w-full grow basis-80 flex-col gap-6">
        <DecisionPanel
          id="decisao-regra"
          version="v3"
          subject="regra"
          decision={decision}
          onDecision={onDecision}
          rejectDraft="Confirme com a Divisão Financeira o impacto no orçamento antes de subir o limite."
          rejectHint="Obrigatório. A Sofia recebe este comentário."
          approvedText="A Sofia Almeida é notificada e pode agora escolher a data em que a v3 entra em vigor."
          rejectedText="A v3 volta a rascunho e a Sofia recebe o seu comentário. A v2 continua em vigor."
        />
        <Panel variant="soft" aria-labelledby="impacto-regra" className="flex flex-col gap-3">
          <SectionTitle id="impacto-regra">Impacto</SectionTitle>
          <p className="text-body-sm text-ink-2">
            Os pedidos de horas extraordinárias já iniciados mantêm a v2. A v3 só se aplica aos pedidos iniciados depois da data
            de entrada em vigor.
          </p>
        </Panel>
      </aside>
    </div>
  )
}

function RuleUse({ name, detail }: { name: string; detail: string }) {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-md bg-tint px-3.5 py-2.5">
      <TextLink to={paths.rules} size="md">
        {name}
      </TextLink>
      <span className="text-body-sm text-ink-2">{detail}</span>
    </div>
  )
}

import { useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { Button } from '../components/Button'
import { Chip } from '../components/Chip'
import { Icon } from '../components/Icon'
import { IconTile } from '../components/IconTile'
import { EditorLayout } from '../components/layout/EditorLayout'
import { Panel } from '../components/Panel'
import { HeadRow, TableFrame, Td, Th, Tr } from '../components/Table'
import { TextLink } from '../components/TextLink'
import { FlowCanvas } from '../components/workflow/FlowCanvas'
import { StepDetail } from '../components/workflow/StepDetail'
import { workflowTabs } from '../components/workflow/workflowTabs'
import { designerSteps, paletteItems, workflowRuleLinks, workflowSummary } from '../data/workflows'
import { cx } from '../lib/cx'
import { paths } from '../routes'

/** E13 · Designer de workflows (UC03, UC05–UC08, UC12, UC34). `?vista=regras` shows the rules used. */
export function DesignerPage() {
  const [params] = useSearchParams()
  const rulesView = params.get('vista') === 'regras'
  const [selected, setSelected] = useState('')
  const [validationOpen, setValidationOpen] = useState(true)
  const step = designerSteps.find((s) => s.id === selected)

  return (
    <EditorLayout
      backTo={paths.workflows}
      backLabel="Voltar aos workflows"
      title="Ajudas de custo"
      status={<Chip dot>v5 · rascunho</Chip>}
      tabs={workflowTabs(rulesView ? 'rules' : 'flow')}
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
      {rulesView ? (
        <RulesOfWorkflow />
      ) : (
        <div className="flex flex-1 flex-wrap items-stretch">
          <aside aria-label="Elementos" className="flex max-w-full grow basis-50 flex-col gap-2 border-r border-line px-4 py-5">
            <span className="px-1 pb-1.5 text-label-sm font-semibold text-ink-3">Arraste para o fluxo</span>
            {paletteItems.map((item) => (
              <button
                key={item.label}
                type="button"
                className="flex min-h-13 cursor-grab items-center gap-3 rounded-md border border-line bg-panel px-3 py-2 text-left text-body-sm font-semibold text-ink hover:border-orange"
              >
                <IconTile
                  icon={item.icon}
                  size="sm"
                  tone={item.tone}
                  round={item.tone !== 'soft'}
                  strokeWidth={item.tone === 'soft' ? 1.8 : 2}
                />
                {item.label}
              </button>
            ))}
          </aside>

          <section aria-label="Área do fluxo" className="flex min-w-0 grow-999 basis-140 flex-col bg-dots">
            <div className="relative flex-1 overflow-auto p-4">
              <FlowCanvas steps={designerSteps} selected={selected} onSelect={setSelected} />
            </div>

            <Panel elevated aria-label="Validação" padding="none" className="mx-4 mb-4 flex flex-col gap-2.5 px-5 py-4">
              <div className="flex items-center gap-2.5">
                <strong className="text-label-md font-semibold">Validação</strong>
                <Chip tone="error" size="xs">
                  1 erro
                </Chip>
                <Chip tone="warning" size="xs">
                  1 aviso
                </Chip>
                <span className="flex-1" />
                <button
                  type="button"
                  onClick={() => setValidationOpen((open) => !open)}
                  aria-expanded={validationOpen}
                  aria-controls="validacao-lista"
                  aria-label={validationOpen ? 'Recolher validação' : 'Mostrar validação'}
                  className="grid size-9 place-items-center rounded-full text-ink hover:bg-soft"
                >
                  <Icon name="chevronDown" size={18} className={cx('transition', !validationOpen && 'rotate-180')} />
                </button>
              </div>
              {validationOpen && (
                <ul id="validacao-lista" className="flex flex-col">
                  <li className="flex flex-wrap items-center gap-x-3 gap-y-2 text-body-sm text-error">
                    <Icon name="alertCircle" size={18} label="Erro" />
                    <span className="grow basis-65 text-ink">
                      O passo <b>Parecer jurídico</b> não é alcançável: nenhuma transição chega a ele.
                    </span>
                    <Button variant="ghost" size="sm" pad="tight" onClick={() => setSelected('parecer')}>
                      Mostrar
                    </Button>
                  </li>
                  <li className="flex flex-wrap items-center gap-x-3 gap-y-2 text-body-sm text-warning">
                    <Icon name="alertTriangle" size={18} label="Aviso" />
                    <span className="grow basis-65 text-ink">
                      O passo <b>Parecer jurídico</b> não tem responsável.
                    </span>
                    <Button variant="ghost" size="sm" pad="tight" onClick={() => setSelected('parecer')}>
                      Mostrar
                    </Button>
                  </li>
                </ul>
              )}
            </Panel>
          </section>

          <aside
            aria-label={step ? 'Detalhe do passo' : 'Resumo do workflow'}
            className="flex max-w-full grow basis-80 flex-col gap-5 border-l border-line bg-bg p-6"
          >
            {step ? (
              <StepDetail step={step} onClose={() => setSelected('')} />
            ) : (
              <div className="flex flex-col gap-4.5">
                <h2 className="text-title-lg font-semibold">Resumo do workflow</h2>
                <dl className="flex flex-col gap-3.5">
                  {workflowSummary.map((item) => (
                    <div key={item.label} className="flex flex-col gap-0.5">
                      <dt className="text-label-sm text-ink-3">{item.label}</dt>
                      <dd className="text-label-md font-semibold">{item.value}</dd>
                    </div>
                  ))}
                </dl>
                <Button to={`${paths.designer}?vista=regras`} variant="secondary" size="sm" className="self-start">
                  Ver regras do workflow
                </Button>
                <p className="rounded-md bg-soft px-4 py-3.5 text-body-sm text-ink-2">
                  Clique num passo para ver quem o trata, o prazo e como se distribuem as tarefas. Os motivos de rejeição, o
                  formulário e as integrações ficam dentro de cada passo.
                </p>
              </div>
            )}
          </aside>
        </div>
      )}
    </EditorLayout>
  )
}

/** "Regras" view of the designer: which rule each step uses. */
function RulesOfWorkflow() {
  return (
    <main className="mx-auto flex w-full max-w-rules flex-1 flex-col gap-5 px-4 pt-8 pb-16 md:px-10">
      <div className="flex flex-wrap items-end gap-4">
        <div className="flex grow basis-105 flex-col gap-2">
          <h2 className="text-heading">Regras de negócio deste workflow</h2>
          <p className="max-w-prose-xl text-body text-ink-2">
            As regras têm versões e aprovação próprias, em Regras de negócio. Aqui escolhe em que passo cada uma é usada. Cada
            pedido usa a versão de cada regra em vigor no dia em que começa.
          </p>
        </div>
        <Button variant="secondary" size="sm" icon="plus">
          Associar regra
        </Button>
      </div>
      <TableFrame panel>
        <table className="w-full min-w-215 border-collapse text-body">
          <thead>
            <HeadRow>
              <Th pad="edge">Regra</Th>
              <Th pad="roomy">Em vigor</Th>
              <Th pad="roomy">Próxima versão</Th>
              <Th pad="roomy">Usada no passo</Th>
              <Th pad="edge">Para quê</Th>
            </HeadRow>
          </thead>
          <tbody>
            {workflowRuleLinks.map((link) => (
              <Tr key={link.rule}>
                <Td pad="edge">
                  <Link to={paths.rules} className="font-semibold underline underline-offset-4">
                    {link.rule}
                  </Link>
                </Td>
                <Td pad="roomy" className="text-ink-2">
                  {link.current}
                </Td>
                <Td pad="roomy">
                  {link.next ? (
                    <Chip tone="success" size="sm">
                      {link.next}
                    </Chip>
                  ) : (
                    <span className="text-ink-3">—</span>
                  )}
                </Td>
                <Td pad="roomy" className="text-ink-2">
                  {link.step}
                </Td>
                <Td pad="edge" className="text-ink-2">
                  {link.purpose}
                </Td>
              </Tr>
            ))}
          </tbody>
        </table>
      </TableFrame>
      <TextLink to={paths.rules} size="md" className="min-h-11 self-start">
        Abrir Regras de negócio
      </TextLink>
    </main>
  )
}

import { useState } from 'react'
import { Avatar } from '../components/Avatar'
import { Button } from '../components/Button'
import { Chip } from '../components/Chip'
import { TextareaField } from '../components/form/TextareaField'
import { Icon } from '../components/Icon'
import { IconTile } from '../components/IconTile'
import { EditorLayout } from '../components/layout/EditorLayout'
import { Accent } from '../components/PageTitle'
import { Panel } from '../components/Panel'
import { SectionTitle } from '../components/SectionTitle'
import { TextLink } from '../components/TextLink'
import { approvalStages, v5Changes, v5Description } from '../data/workflows'
import { cx } from '../lib/cx'
import { paths } from '../routes'

/** E15 · Submeter alteração para aprovação (UC08, UC09) */
export function SubmitChangePage() {
  const [sent, setSent] = useState(false)

  return (
    <EditorLayout
      backTo={paths.designer}
      backLabel="Voltar ao designer"
      title="Ajudas de custo"
      status={
        <Chip tone={sent ? 'info' : 'neutral'} dot>
          {sent ? 'v5 · em aprovação' : 'v5 · rascunho'}
        </Chip>
      }
    >
      <main className="mx-auto flex w-full max-w-submit flex-col gap-7 px-4 pt-10 pb-16 md:px-10">
        {!sent ? (
          <>
            <header className="flex flex-col gap-2">
              <h2 className="text-headline-lg">
                Submeter a <Accent>v5</Accent> para aprovação
              </h2>
              <p className="text-body text-ink-3">Enquanto não for aprovada e agendada, os pedidos continuam a usar a v4.</p>
            </header>

            <div className="flex flex-wrap items-start gap-8">
              <div className="flex min-w-0 grow-999 basis-130 flex-col gap-6">
                <Panel variant="success" aria-labelledby="validacao" className="flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <span aria-hidden="true" className="grid size-8 shrink-0 place-items-center rounded-full bg-success text-on-status">
                      <Icon name="check" size={18} strokeWidth={2.4} />
                    </span>
                    <h3 id="validacao" className="flex-1 text-title-sm font-semibold text-success">
                      Validação sem erros
                    </h3>
                    <TextLink to={paths.designer}>Ver no designer</TextLink>
                  </div>
                  <ul className="flex flex-col gap-1.5 pl-11 text-body-sm text-ink-2">
                    <li>Todos os passos são alcançáveis e chegam a um fim.</li>
                    <li>Todos os passos têm responsável e prazo.</li>
                    <li>Os 5 formulários estão completos.</li>
                  </ul>
                </Panel>

                <Panel aria-labelledby="muda" className="flex flex-col gap-4">
                  <SectionTitle as="h3" size="sm" id="muda">
                    O que muda em relação à v4
                  </SectionTitle>
                  <ul>
                    {v5Changes.map((change) => (
                      <li key={change.text} className="flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-line py-3">
                        <span className="shrink-0 basis-28 text-label-sm font-semibold text-ink-3">{change.part}</span>
                        <span className="grow basis-60 text-body">{change.text}</span>
                        <Chip tone={change.type === 'Novo' ? 'success' : 'warning'} size="sm">
                          {change.type}
                        </Chip>
                      </li>
                    ))}
                  </ul>
                </Panel>

                <TextareaField
                  label="Descrição da alteração"
                  required
                  requiredTone="error"
                  description="A aprovadora lê isto primeiro. Explique o porquê, não só o quê."
                  rows={4}
                  defaultValue={v5Description}
                  labelClassName="text-label-md font-semibold"
                  className="leading-6"
                />
              </div>

              <aside className="flex max-w-full grow basis-75 flex-col gap-6">
                <Panel elevated aria-labelledby="quem-aprova" className="flex flex-col gap-4">
                  <SectionTitle as="h3" size="sm" id="quem-aprova">
                    Quem aprova
                  </SectionTitle>
                  <div className="flex items-center gap-3">
                    <Avatar initials="HC" size="xl" />
                    <span className="flex flex-col gap-0.5">
                      <span className="text-title-md font-semibold">Helena Costa</span>
                      <span className="text-label-sm text-ink-3">Diretora de Departamento</span>
                    </span>
                  </div>
                  <p className="text-label-sm leading-4.75 text-ink-2">
                    É a sua chefia no Microsoft Entra ID. O aprovador é sempre a chefia de quem submete e não se escolhe aqui.
                  </p>
                  <Button glow block onClick={() => setSent(true)}>
                    Submeter para aprovação
                  </Button>
                  <Button to={paths.designer} variant="ghost" size="sm" block>
                    Continuar a editar
                  </Button>
                </Panel>
                <Panel variant="soft" aria-labelledby="vigor" className="flex flex-col gap-2.5">
                  <SectionTitle as="h3" size="sm" id="vigor">
                    Entrada em vigor
                  </SectionTitle>
                  <p className="text-body-sm text-ink-2">
                    Escolhe a data depois da aprovação. Os <strong className="font-semibold text-ink">12 procedimentos</strong> em
                    curso terminam na v4.
                  </p>
                </Panel>
              </aside>
            </div>
          </>
        ) : (
          <div role="status" className="flex w-full max-w-dialog-xl flex-col items-center gap-6 self-center py-10 text-center">
            <IconTile icon="send" size="2xl" tone="success" round strokeWidth={2} />
            <div className="flex flex-col gap-2">
              <h2 className="text-headline-lg">
                Enviada para a <Accent>Helena Costa</Accent>
              </h2>
              <p className="text-body-md text-ink-2">
                A Helena Costa é notificada e revê a alteração. Quando decidir, recebe uma notificação; depois de aprovada,
                escolhe a data em que a v5 entra em vigor.
              </p>
            </div>
            <ol className="flex w-full flex-col gap-3.5 rounded-md bg-soft p-6 text-left">
              {approvalStages.map((stage, i) => (
                <li key={stage.name} className="flex items-center gap-3.5">
                  <span
                    aria-hidden="true"
                    className={cx(
                      'grid size-8 shrink-0 place-items-center rounded-full text-body-sm font-extrabold',
                      stage.state === 'done' && 'bg-success text-on-status',
                      stage.state === 'current' && 'bg-brand text-on-brand',
                      stage.state === 'next' && 'border-emph border-line-strong bg-bg text-ink-3',
                    )}
                  >
                    {stage.state === 'done' ? <Icon name="check" size={16} strokeWidth={2.4} /> : i + 1}
                  </span>
                  <span className="flex flex-1 flex-col gap-0.5">
                    <span className={cx('text-label-md', stage.state === 'next' ? 'text-ink-3' : 'font-semibold text-ink')}>
                      {stage.name}
                    </span>
                    <span className="text-label-sm text-ink-3">{stage.when}</span>
                  </span>
                </li>
              ))}
            </ol>
            <div className="flex flex-wrap justify-center gap-3">
              <Button to={paths.workflows} variant="secondary">
                Voltar aos workflows
              </Button>
              <Button to={paths.versions}>Ver versões</Button>
            </div>
          </div>
        )}
      </main>
    </EditorLayout>
  )
}

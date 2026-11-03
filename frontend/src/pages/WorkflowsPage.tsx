import { Link } from 'react-router'
import { Button } from '../components/Button'
import { Chip } from '../components/Chip'
import { IconTile } from '../components/IconTile'
import { AppLayout } from '../components/layout/AppLayout'
import { PageTitle } from '../components/PageTitle'
import { Panel } from '../components/Panel'
import { SectionTitle } from '../components/SectionTitle'
import { HeadRow, TableFrame, Td, Th, Tr } from '../components/Table'
import { workflowRows, type WorkflowRow } from '../data/workflows'
import { cx } from '../lib/cx'
import { paths } from '../routes'

const rowAction = 'inline-flex min-h-11 items-center px-3 text-body-sm font-semibold'

const actionLink: Record<WorkflowRow['actions'][number], { label: string; to: string }> = {
  edit: { label: 'Editar', to: paths.designer },
  continue: { label: 'Continuar', to: paths.designer },
  versions: { label: 'Versões', to: paths.versions },
}

/** E12 · Workflows (UC03, UC07, UC11, UC26) */
export function WorkflowsPage() {
  return (
    <AppLayout user="sofia" nav={{ active: 'workflows', inboxCount: 0 }} width="full">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-3">
          <PageTitle accent>Workflows</PageTitle>
          <p className="text-body-lg text-ink-2">
            Os procedimentos da Câmara, desenhados no designer e aprovados pela chefia antes de entrarem em vigor.
          </p>
        </div>
        <Button to={paths.designer} icon="plus" glow>
          Criar workflow
        </Button>
      </header>

      <TableFrame panel>
        <table className="w-full min-w-225 border-collapse text-body">
          <thead>
            <HeadRow>
              <Th pad="edge">Nome</Th>
              <Th pad="roomy">Versão e estado</Th>
              <Th pad="roomy">Regras de negócio</Th>
              <Th pad="roomy">Quem pode iniciar</Th>
              <Th pad="roomy">Última alteração</Th>
              <Th pad="edge" align="right">
                Ações
              </Th>
            </HeadRow>
          </thead>
          <tbody>
            {workflowRows.map((row) => (
              <Tr key={row.name}>
                <Td pad="edge">
                  <span className="flex items-center gap-3">
                    <IconTile icon={row.icon} size="md" tone={row.inactive ? 'muted' : 'soft'} />
                    <span className={cx('font-semibold', row.inactive && 'text-ink-2')}>{row.name}</span>
                  </span>
                </Td>
                <Td pad="roomy">
                  <span className="flex flex-col items-start gap-1.5">
                    {row.versions.map((version) => (
                      <span key={version.label} className="flex flex-col gap-1">
                        <Chip tone={version.tone} dot>
                          {version.label}
                        </Chip>
                        {version.note && <span className="text-caption text-ink-3">{version.note}</span>}
                      </span>
                    ))}
                  </span>
                </Td>
                <Td pad="roomy">
                  {row.rules.length === 0 ? (
                    <span className="text-label-sm text-ink-3">—</span>
                  ) : (
                    <span className="flex flex-wrap gap-1">
                      {row.rules.map((rule) => (
                        <Link
                          key={rule}
                          to={paths.rules}
                          className="inline-flex min-h-7 items-center rounded-pill bg-soft px-2.5 text-label-sm font-semibold whitespace-nowrap text-warning hover:text-ink"
                        >
                          {rule}
                        </Link>
                      ))}
                    </span>
                  )}
                </Td>
                <Td pad="roomy" className={row.starters === '—' ? 'text-ink-3' : 'text-ink-2'}>
                  {row.starters}
                </Td>
                <Td pad="roomy" className="text-body-sm text-ink-2">
                  {row.changedBy}
                  <br />
                  <span className="text-ink-3">{row.changedAt}</span>
                </Td>
                <Td align="right" pad="actions" className="whitespace-nowrap">
                  {row.actions.map((action) => (
                    <Link
                      key={action}
                      to={actionLink[action].to}
                      aria-label={`${actionLink[action].label}: ${row.name}`}
                      className={rowAction}
                    >
                      {actionLink[action].label}
                    </Link>
                  ))}
                </Td>
              </Tr>
            ))}
          </tbody>
        </table>
      </TableFrame>

      <Panel variant="soft" padding="none" aria-labelledby="como-termina" className="flex flex-col gap-3 px-6 py-5">
        <SectionTitle id="como-termina" size="md">
          Como termina um workflow
        </SectionTitle>
        <div className="flex flex-wrap gap-x-8 gap-y-3">
          <p className="grow basis-80 text-body-sm text-ink-2">
            <strong className="font-semibold text-ink">Expirado</strong> · chegou à data de fim que foi agendada com a versão,
            como um procedimento sazonal. O sistema aplica a data sozinho.
          </p>
          <p className="grow basis-80 text-body-sm text-ink-2">
            <strong className="font-semibold text-ink">Retirado</strong> · um gestor terminou-o antes do previsto, pondo-lhe uma
            data de fim mais cedo.
          </p>
        </div>
        <p className="text-body-sm text-ink-2">
          Nos dois casos deixa de aceitar pedidos novos, e os pedidos em curso terminam na versão com que começaram. Editar cria
          uma nova versão, que só entra em vigor depois de aprovada e agendada.
        </p>
      </Panel>
    </AppLayout>
  )
}

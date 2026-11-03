import { useState, type ReactNode } from 'react'
import { useLocation, useNavigate } from 'react-router'
import { Breadcrumb } from '../components/Breadcrumb'
import { Button } from '../components/Button'
import { Chip } from '../components/Chip'
import { FileList } from '../components/FileList'
import { TextareaField } from '../components/form/TextareaField'
import { HistoryTimeline } from '../components/HistoryTimeline'
import { Icon } from '../components/Icon'
import { InfoItem } from '../components/InfoItem'
import { AppLayout } from '../components/layout/AppLayout'
import { Accent, PageTitle } from '../components/PageTitle'
import { Panel } from '../components/Panel'
import { ProcedureProgress } from '../components/ProcedureProgress'
import { ApproveDialog } from '../components/review/ApproveDialog'
import { RejectDialog } from '../components/review/RejectDialog'
import { TransferDialog } from '../components/review/TransferDialog'
import { SectionTitle } from '../components/SectionTitle'
import { HeadRow, TableFrame, Td, Th, Tr } from '../components/Table'
import { TextLink } from '../components/TextLink'
import { colleagues, reviewAttachments, reviewExpenses, reviewHistory, reviewRequester, reviewSteps, type ReviewDecision } from '../data/tasks'
import { paths } from '../routes'

type Transfer = '' | 'choosing' | 'requested'

/** A reviewable value: on hover or focus the reviewer can leave a note on it. */
function NotableItem({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="group relative -m-2 flex grow basis-50 flex-col gap-0.5 rounded-md p-2 focus-within:bg-soft-hover hover:bg-soft-hover">
      <dt className="text-label-sm font-semibold text-ink-3">{label}</dt>
      <dd className="text-body-md">{children}</dd>
      <button
        type="button"
        aria-label={`Adicionar nota ao campo ${label}`}
        className="absolute top-1 right-1 inline-flex h-9 items-center gap-1.5 rounded-pill border border-line-strong bg-bg px-3 text-label-sm font-semibold text-accent-ink opacity-0 transition group-hover:opacity-100 focus:opacity-100"
      >
        <Icon name="message" size={16} />
        Nota
      </button>
    </div>
  )
}

/** E08 · Rever documento (UC02, UC17, UC19, UC21, UC23, UC25). On `/rejeitar` the reject dialog (E09) opens. */
export function ReviewPage() {
  const navigate = useNavigate()
  const rejecting = useLocation().pathname === paths.reject
  const [approving, setApproving] = useState(false)
  const [transfer, setTransfer] = useState<Transfer>('')
  const [colleague, setColleague] = useState(colleagues[0].id)
  const colleagueName = colleagues.find((c) => c.id === colleague)?.name

  const decide = (decided: ReviewDecision) => navigate(paths.inbox, { state: { decided } })

  return (
    <AppLayout user="rui" nav={{ active: 'inbox', inboxCount: 5 }} width="detail" compactTop>
      <header className="flex flex-col gap-3.5">
        <Breadcrumb trail={[{ label: 'Caixa de tarefas', to: paths.inbox }]} current="AC-2026-0147" />
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
            <PageTitle>
              Ajudas de custo · <Accent>Ana Ferreira</Accent>
            </PageTitle>
            <Chip tone="info" dot>
              Em análise
            </Chip>
            <Chip tone="warning" icon="clock">
              Prazo 13/10/2026 · faltam 3 dias
            </Chip>
          </div>
          <Button variant="secondary" size="sm" icon="download">
            Transferir PDF
          </Button>
        </div>
      </header>

      <ProcedureProgress steps={reviewSteps} current={1} />

      <div className="flex flex-wrap items-start gap-8">
        <article aria-label="Documento" className="flex min-w-0 grow-999 basis-140 flex-col gap-6">
          <Panel padding="lg" className="flex flex-col gap-4.5">
            <SectionTitle size="md">Requerente</SectionTitle>
            <dl className="flex flex-wrap gap-x-8 gap-y-4">
              {reviewRequester.map((item) => (
                <InfoItem key={item.label} label={item.label} numeric={item.numeric}>
                  {item.value}
                </InfoItem>
              ))}
            </dl>
          </Panel>

          <Panel padding="lg" className="flex flex-col gap-4.5">
            <SectionTitle size="md">Deslocação</SectionTitle>
            <dl className="flex flex-wrap gap-x-8 gap-y-4">
              <NotableItem label="Motivo">Formação · Contratação Pública</NotableItem>
              <NotableItem label="Destino">Lisboa</NotableItem>
              <NotableItem label="Transporte">Transportes públicos</NotableItem>
            </dl>
            <dl className="flex flex-wrap gap-x-8 gap-y-4">
              <NotableItem label="Partida">
                <span className="tabular-nums">01/10/2026 07:30</span>
              </NotableItem>
              <div className="flex grow-2 basis-105 flex-col gap-2">
                <div className="-mx-3 -mt-2 flex flex-col gap-0.5 rounded-md border-emph border-yellow px-3 py-2">
                  <dt className="text-label-sm font-semibold text-ink-3">Regresso</dt>
                  <dd className="text-body-md tabular-nums">03/10/2026 19:40</dd>
                </div>
                <p className="rounded-md border-l-3 border-yellow bg-warning-soft px-3.5 py-2.5 text-body-sm text-warning">
                  <strong className="font-semibold text-ink">A sua nota · 10/10/2026</strong>
                  <br />
                  Indicou 03/10; o certificado de presença diz 02/10.
                </p>
              </div>
            </dl>
          </Panel>

          <Panel padding="lg" className="flex flex-col gap-4">
            <SectionTitle size="md">Despesas</SectionTitle>
            <TableFrame>
              <table className="w-full min-w-120 border-collapse text-body">
                <thead>
                  <HeadRow>
                    <Th>Tipo</Th>
                    <Th>Data</Th>
                    <Th align="right">Valor</Th>
                  </HeadRow>
                </thead>
                <tbody>
                  {reviewExpenses.map((expense) => (
                    <Tr key={expense.type}>
                      <Td>{expense.type}</Td>
                      <Td numeric>{expense.date}</Td>
                      <Td align="right" numeric>
                        {expense.amount}
                      </Td>
                    </Tr>
                  ))}
                  <tr className="border-t border-line-strong bg-soft-hover">
                    <Td colSpan={2} className="font-semibold">
                      Total
                    </Td>
                    <Td align="right" numeric className="text-body-lg font-extrabold">
                      187,40 €
                    </Td>
                  </tr>
                </tbody>
              </table>
            </TableFrame>
          </Panel>

          <Panel padding="lg" className="flex flex-col gap-4">
            <SectionTitle size="md">Anexos · {reviewAttachments.length}</SectionTitle>
            <FileList
              files={reviewAttachments}
              renderAction={(file) => (
                <TextLink iconRight="externalLink" className="min-h-11 px-3">
                  Abrir<span className="sr-only"> {file.name}</span>
                </TextLink>
              )}
            />
          </Panel>
        </article>

        <aside className="flex max-w-full grow basis-80 flex-col gap-6">
          <Panel elevated aria-labelledby="decisao" className="flex flex-col gap-4">
            <SectionTitle id="decisao">Decisão</SectionTitle>
            <p className="text-body-sm text-ink-2">
              Ao aprovar, assina com a Chave Móvel Digital e o pedido segue para a Divisão Financeira.
            </p>
            <TextareaField label="Nota para a requerente" optional />
            <p className="text-label-sm leading-4.75 text-ink-3">1 nota deixada em campos do documento.</p>
            <Button icon="pen" glow block onClick={() => setApproving(true)}>
              Aprovar e assinar
            </Button>
            <Button to={paths.reject} variant="danger-outline" block>
              Rejeitar
            </Button>
            {transfer === 'requested' ? (
              <div role="status" className="flex flex-col gap-1.5 rounded-md bg-info-soft px-4 py-3.5">
                <span className="text-label-md font-semibold text-info">Transferência pedida a {colleagueName}</span>
                <span className="text-body-sm text-ink-2">
                  A aguardar que aceite. Até lá a tarefa continua consigo e o prazo continua a contar.
                </span>
                <button
                  type="button"
                  onClick={() => setTransfer('')}
                  className="min-h-10 self-start text-body-sm font-semibold text-accent-ink hover:text-ink"
                >
                  Cancelar o pedido
                </button>
              </div>
            ) : (
              <Button variant="ghost" size="sm" icon="transfer" onClick={() => setTransfer('choosing')}>
                Transferir para um colega
              </Button>
            )}
          </Panel>

          <Panel variant="soft" aria-labelledby="historico" className="flex flex-col gap-4">
            <SectionTitle id="historico">Histórico</SectionTitle>
            <HistoryTimeline entries={reviewHistory} />
            <TextLink className="min-h-11 self-start">Ver registo completo</TextLink>
          </Panel>
        </aside>
      </div>

      <ApproveDialog open={approving} onClose={() => setApproving(false)} onSigned={() => decide('aprovado')} />
      <TransferDialog
        open={transfer === 'choosing'}
        colleague={colleague}
        onColleague={setColleague}
        onCancel={() => setTransfer('')}
        onConfirm={() => setTransfer('requested')}
      />
      {rejecting && <RejectDialog open onCancel={() => navigate(paths.review)} onDecide={decide} />}
    </AppLayout>
  )
}

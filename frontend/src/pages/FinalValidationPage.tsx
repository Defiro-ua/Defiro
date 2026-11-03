import { useNavigate } from 'react-router'
import { Breadcrumb } from '../components/Breadcrumb'
import { Button } from '../components/Button'
import { Chip } from '../components/Chip'
import { Icon } from '../components/Icon'
import { AppLayout } from '../components/layout/AppLayout'
import { Accent, PageTitle } from '../components/PageTitle'
import { Panel } from '../components/Panel'
import { ProcedureProgress } from '../components/ProcedureProgress'
import { SectionTitle } from '../components/SectionTitle'
import { TextLink } from '../components/TextLink'
import { finalChecks, finalSteps, refundOrder } from '../data/tasks'
import { cx } from '../lib/cx'
import { paths } from '../routes'

/** Miniature of the generated refund order (decorative; the facts are repeated next to it). */
function RefundOrderPreview() {
  return (
    <div
      aria-hidden="true"
      className="flex h-85 w-65 shrink-0 flex-col gap-2.5 rounded-doc border border-line bg-panel px-5.5 py-6 text-doc text-ink-2 shadow-embed"
    >
      <span className="font-semibold text-ink">Câmara Municipal de Aveiro</span>
      <span className="text-body-sm leading-4.5 font-extrabold tracking-title text-ink">Ordem de reembolso</span>
      <span>{refundOrder.requester}</span>
      <span className="h-px bg-line" />
      {refundOrder.lines.map((line) => (
        <span key={line.label} className="flex justify-between">
          <span>{line.label}</span>
          <span>{line.value}</span>
        </span>
      ))}
      <span className="h-px bg-line-strong" />
      <span className="flex justify-between text-micro font-extrabold text-ink">
        <span>Total</span>
        <span>{refundOrder.total}</span>
      </span>
      <span className="flex-1" />
      <span className="flex flex-col gap-1.5">
        {refundOrder.signatures.map((s) => (
          <span key={s.step} className="flex justify-between border-t border-dashed border-line-strong pt-1">
            <span>{s.step}</span>
            <span className={cx('font-semibold', s.signed ? 'text-success' : 'text-accent-ink')}>
              {s.signed ? 'assinado' : 'por assinar'}
            </span>
          </span>
        ))}
      </span>
    </div>
  )
}

/** E10 · Validação final e fecho (UC15, UC22, UC23) */
export function FinalValidationPage() {
  const navigate = useNavigate()

  return (
    <AppLayout user="joana" nav={{ active: 'inbox', inboxCount: 2, inboxTo: paths.inboxHr }} width="detail" compactTop>
      <header className="flex flex-col gap-3.5">
        <Breadcrumb trail={[{ label: 'Caixa de tarefas', to: paths.inboxHr }]} current="AC-2026-0122" />
        <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
          <PageTitle>
            Ajudas de custo · <Accent>Pedro Sousa</Accent>
          </PageTitle>
          <Chip tone="info" dot>
            Validação final
          </Chip>
          <Chip icon="clock">Faltam 6 dias</Chip>
        </div>
      </header>

      <ProcedureProgress steps={finalSteps} current={3} />

      <div className="flex flex-wrap items-start gap-8">
        <div className="flex min-w-0 grow-999 basis-140 flex-col gap-6">
          <Panel padding="lg" aria-labelledby="verificacao" className="flex flex-col gap-4.5">
            <SectionTitle id="verificacao">Verificação final</SectionTitle>
            <p className="text-body-sm text-ink-2">
              O sistema compara as datas da deslocação com as datas do certificado que o requerente indicou no pedido. Se alguma
              coisa não coincidir, o pedido chega aqui marcado com conflito e pode devolvê-lo para correção.
            </p>
            <ul className="flex flex-col gap-3">
              {finalChecks.map((check) => (
                <li key={check.title} className="flex flex-wrap items-center gap-x-4 gap-y-3 rounded-md bg-soft px-4.5 py-4">
                  <span aria-hidden="true" className="grid size-7 place-items-center rounded-full bg-success-soft text-success">
                    <Icon name="check" size={16} strokeWidth={2.4} />
                  </span>
                  <span className="grow basis-65 text-body">
                    <strong className="font-semibold">{check.title}</strong>
                    <br />
                    <span className="text-body-sm text-ink-3">{check.detail}</span>
                  </span>
                  {check.link && (
                    <TextLink iconRight="externalLink" className="min-h-11">
                      {check.link}
                    </TextLink>
                  )}
                  {check.auto && (
                    <Chip tone="info" size="sm">
                      Verificado automaticamente
                    </Chip>
                  )}
                </li>
              ))}
            </ul>
          </Panel>

          <Panel padding="lg" aria-labelledby="documento-final" className="flex flex-wrap gap-7">
            <RefundOrderPreview />
            <div className="flex grow basis-65 flex-col gap-3">
              <SectionTitle id="documento-final">Documento final</SectionTitle>
              <p className="text-body leading-6 text-ink-2">
                A ordem de reembolso é gerada a partir dos dados do pedido e das assinaturas de cada passo. Fica registada e pode
                ser transferida em PDF por quem participa no procedimento.
              </p>
              <dl className="grid grid-cols-label gap-x-4 gap-y-1.5 text-body-sm">
                {refundOrder.facts.map((fact, i) => (
                  <div key={fact.label} className="contents">
                    <dt className="text-ink-3">{fact.label}</dt>
                    <dd className={cx(i === 0 && 'font-semibold tabular-nums')}>{fact.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </Panel>
        </div>

        <aside className="max-w-full grow basis-80">
          <Panel elevated aria-labelledby="fechar" className="flex flex-col gap-4">
            <SectionTitle id="fechar">Fechar procedimento</SectionTitle>
            <p className="text-body-sm text-ink-2">
              Ao validar, assina com a Chave Móvel Digital, a ordem de reembolso é gerada e o procedimento é arquivado.
            </p>
            <p className="flex gap-2 text-label-sm leading-4.75 font-semibold text-success">
              <Icon name="check" size={18} strokeWidth={2} />
              Sem conflitos nos dados.
            </p>
            <Button icon="pen" glow block onClick={() => navigate(paths.inboxHr, { state: { closed: true } })}>
              Validar, assinar e fechar
            </Button>
            <Button variant="danger-outline" block>
              Rejeitar
            </Button>
          </Panel>
        </aside>
      </div>
    </AppLayout>
  )
}

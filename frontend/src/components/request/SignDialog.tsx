import { useState } from 'react'
import { Button } from '../Button'
import { IconTile } from '../IconTile'
import { Modal } from '../Modal'
import { Accent } from '../PageTitle'
import { ProgressSteps } from '../ProgressSteps'
import { Icon } from '../Icon'
import { signedSteps, signSummary } from '../../data/requests'
import { paths } from '../../routes'

type Phase = 'confirm' | 'waiting' | 'done'

/** E05 · Assinar com Chave Móvel Digital (UC21): confirm → wait for the phone → submitted. */
export function SignDialog({ open, onCancel }: { open: boolean; onCancel: () => void }) {
  const [phase, setPhase] = useState<Phase>('confirm')

  return (
    <Modal open={open} onClose={onCancel} labelledBy="sign-title" look="sheet" size="lg">
      <div className="flex flex-col gap-6">
        {phase === 'confirm' && (
          <>
            <header className="flex items-center gap-4">
              <IconTile icon="pen" size="xl" />
              <h2 id="sign-title" className="text-headline-md">
                Assinar com Chave Móvel Digital
              </h2>
            </header>
            <div className="flex flex-col gap-2.5 rounded-md bg-soft px-6 py-5">
              <span className="text-label-sm font-semibold text-ink-3">O que vai assinar</span>
              <span className="text-title-md font-semibold">{signSummary.title}</span>
              <dl className="grid grid-cols-label gap-x-4 gap-y-1.5 text-body">
                {signSummary.rows.map((row) => (
                  <div key={row.label} className="contents">
                    <dt className="text-ink-2">{row.label}</dt>
                    <dd className="tabular-nums">{row.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <p className="text-body leading-6 text-ink-2">
              Ao assinar, confirma que os dados são verdadeiros. A assinatura digital tem o mesmo valor que a assinatura
              manuscrita e fica registada no histórico do pedido.
            </p>
            <footer className="flex flex-wrap justify-end gap-3">
              <Button variant="secondary" onClick={onCancel}>
                Cancelar
              </Button>
              <Button glow onClick={() => setPhase('waiting')}>
                Continuar para a Chave Móvel Digital
              </Button>
            </footer>
          </>
        )}

        {phase === 'waiting' && (
          <>
            <div className="flex flex-col items-center gap-4 pt-4 pb-2 text-center">
              <span aria-hidden="true" className="size-16 animate-spin rounded-full border-6 border-soft border-t-orange" />
              <h2 id="sign-title" className="text-headline-md">
                A aguardar a confirmação no seu telemóvel
              </h2>
              <p role="status" className="max-w-prose-xs text-body leading-6 text-ink-2">
                Confirme a assinatura na Chave Móvel Digital. O código expira em{' '}
                <strong className="tabular-nums">4:52</strong>.
              </p>
            </div>
            <footer className="flex flex-wrap justify-end gap-3">
              <Button variant="secondary" onClick={() => setPhase('confirm')}>
                Cancelar
              </Button>
              <Button onClick={() => setPhase('done')}>Já confirmei no telemóvel</Button>
            </footer>
          </>
        )}

        {phase === 'done' && (
          <>
            <div className="flex flex-col items-center gap-3.5 pt-2 text-center">
              <span aria-hidden="true" className="grid size-16 place-items-center rounded-full bg-success-soft text-success">
                <Icon name="check" size={32} strokeWidth={2.2} />
              </span>
              <h2 id="sign-title" className="text-headline-lg">
                Pedido <Accent>submetido</Accent>
              </h2>
              <p role="status" className="max-w-prose-sm text-body leading-6 text-ink-2">
                Assinado digitalmente a 08/10/2026 às 16:02. Seguiu para as chefias da Divisão de Obras Municipais, para a
                validação da chefia.
              </p>
            </div>
            <div className="rounded-md border border-line bg-panel px-2 pt-4 pb-2">
              <ProgressSteps steps={signedSteps} current={1} fit />
            </div>
            <footer className="flex flex-wrap justify-center gap-3">
              <Button to={paths.inbox} variant="secondary">
                Voltar ao início
              </Button>
              <Button to={paths.myRequests} glow>
                Ver os meus pedidos
              </Button>
            </footer>
          </>
        )}
      </div>
    </Modal>
  )
}

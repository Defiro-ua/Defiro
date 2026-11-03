import { useState } from 'react'
import { approvalSummary } from '../../data/tasks'
import { Button } from '../Button'
import { IconTile } from '../IconTile'
import { Modal } from '../Modal'

type ApproveDialogProps = {
  open: boolean
  onClose: () => void
  onSigned: () => void
}

/** Approve and sign with the Chave Móvel Digital: summary, then waiting for the phone. */
export function ApproveDialog({ open, onClose, onSigned }: ApproveDialogProps) {
  const [waiting, setWaiting] = useState(false)
  const close = () => {
    setWaiting(false)
    onClose()
  }

  return (
    <Modal open={open} onClose={close} labelledBy="aprovar-titulo" size="sm">
      {!waiting ? (
        <div className="flex flex-col gap-5">
          <h2 id="aprovar-titulo" className="text-heading">
            Aprovar e assinar
          </h2>
          <dl className="grid grid-cols-label gap-x-5 gap-y-2.5 rounded-md bg-soft p-5 text-body">
            {approvalSummary.map((row) => (
              <div key={row.label} className="contents">
                <dt className="text-ink-3">{row.label}</dt>
                <dd className="font-semibold tabular-nums">{row.value}</dd>
              </div>
            ))}
          </dl>
          <p className="text-body-sm text-ink-2">
            A sua assinatura fica no documento e no histórico, com a data e a hora. A nota que deixou no campo Destino segue com
            o pedido.
          </p>
          <div className="flex flex-wrap justify-end gap-3">
            <Button variant="ghost" onClick={close}>
              Cancelar
            </Button>
            <Button onClick={() => setWaiting(true)}>Continuar para a Chave Móvel Digital</Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4.5 text-center">
          <IconTile icon="smartphone" size="2xl" round />
          <h2 id="aprovar-titulo" className="text-heading">
            A aguardar a confirmação no seu telemóvel
          </h2>
          <p role="status" className="text-body leading-6 text-ink-2">
            Confirme a assinatura na Chave Móvel Digital. O código expira em{' '}
            <strong className="font-semibold text-ink tabular-nums">4:52</strong>.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button variant="ghost" onClick={close}>
              Cancelar
            </Button>
            <Button onClick={onSigned}>Já confirmei no telemóvel</Button>
          </div>
        </div>
      )}
    </Modal>
  )
}

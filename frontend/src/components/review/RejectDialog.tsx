import { useState } from 'react'
import { rejectReasons } from '../../data/tasks'
import { Button } from '../Button'
import { Chip } from '../Chip'
import { ChoiceCard } from '../form/ChoiceCard'
import { RequiredMark } from '../form/Field'
import { TextareaField } from '../form/TextareaField'
import { Modal } from '../Modal'
import { Notice } from '../Notice'

type RejectDialogProps = {
  open: boolean
  onCancel: () => void
  /** `devolvido`: back to the requester · `rejeitado`: the procedure ends */
  onDecide: (decision: 'devolvido' | 'rejeitado') => void
}

/** E09 · Rejeitar documento (UC18, UC19): correctable reasons return it, final ones end it. */
export function RejectDialog({ open, onCancel, onDecide }: RejectDialogProps) {
  const [reasonId, setReasonId] = useState(rejectReasons[0].id)
  const reason = rejectReasons.find((r) => r.id === reasonId) ?? rejectReasons[0]

  return (
    <Modal open={open} onClose={onCancel} labelledBy="rejeitar-titulo" look="sheet" size="xl">
      <div className="flex flex-col gap-5">
        <header className="flex flex-col gap-1">
          <h2 id="rejeitar-titulo" className="text-headline-md">
            Rejeitar documento
          </h2>
          <p className="text-body-sm text-ink-3">AC-2026-0147 · Ajudas de custo · Ana Ferreira</p>
        </header>

        <fieldset className="flex flex-col gap-2.5">
          <legend className="mb-2.5 text-body-sm font-semibold">
            Motivo <RequiredMark /> <span className="font-normal text-ink-3">· definidos no workflow «Ajudas de custo»</span>
          </legend>
          {rejectReasons.map((r) => (
            <ChoiceCard
              key={r.id}
              name="motivo"
              value={r.id}
              checked={r.id === reasonId}
              onSelect={setReasonId}
              indicator="native"
              emphasis="strong"
              gap="gap-x-3.5 gap-y-2.5"
              className="min-h-14 flex-wrap px-4 py-3"
            >
              <span className="grow basis-50 text-body font-semibold">{r.label}</span>
              <Chip tone={r.correctable ? 'warning' : 'error'}>
                {r.correctable ? 'Corrigível · volta à requerente' : 'Final · encerra o procedimento'}
              </Chip>
            </ChoiceCard>
          ))}
        </fieldset>

        <TextareaField
          label={reason.correctable ? 'Notas para a requerente' : 'Notas'}
          required={reason.correctable}
          optional={!reason.correctable}
          hint="Inclui 1 nota deixada no campo Regresso."
          defaultValue="A data de regresso não bate certo com o certificado. Junte também o certificado de presença com o carimbo da entidade formadora."
        />

        {reason.correctable ? (
          <Notice tone="info">
            O pedido volta para Ana Ferreira. Depois de corrigido e reenviado, percorre de novo todos os passos. A rejeição não
            precisa de assinatura e fica registada no histórico.
          </Notice>
        ) : (
          <Notice tone="error">
            O procedimento termina como rejeitado e a requerente é notificada. Esta ação não pode ser desfeita.
          </Notice>
        )}

        <footer className="flex flex-wrap justify-end gap-3">
          <Button variant="secondary" onClick={onCancel}>
            Cancelar
          </Button>
          {reason.correctable ? (
            <Button glow onClick={() => onDecide('devolvido')}>
              Devolver para correção
            </Button>
          ) : (
            <Button variant="danger" onClick={() => onDecide('rejeitado')}>
              Rejeitar definitivamente
            </Button>
          )}
        </footer>
      </div>
    </Modal>
  )
}

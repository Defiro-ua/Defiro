import { colleagues } from '../../data/tasks'
import { Button } from '../Button'
import { ChoiceCard } from '../form/ChoiceCard'
import { TextareaField } from '../form/TextareaField'
import { Modal } from '../Modal'
import { Notice } from '../Notice'

type TransferDialogProps = {
  open: boolean
  colleague: string
  onColleague: (id: string) => void
  onCancel: () => void
  onConfirm: () => void
}

/** Ask a colleague of the same group to take over the task (UC02). */
export function TransferDialog({ open, colleague, onColleague, onCancel, onConfirm }: TransferDialogProps) {
  const name = colleagues.find((c) => c.id === colleague)?.name ?? colleagues[0].name
  return (
    <Modal open={open} onClose={onCancel} labelledBy="transferir-titulo" size="md">
      <div className="flex flex-col gap-4.5">
        <h2 id="transferir-titulo" className="text-heading">
          Transferir a tarefa
        </h2>
        <p className="text-body text-ink-2">
          AC-2026-0147 · Ajudas de custo · Ana Ferreira. Só pode transferir para colegas do grupo deste passo,{' '}
          <strong className="font-semibold text-ink">Chefia · Divisão de Obras Municipais</strong>.
        </p>
        <fieldset className="flex flex-col gap-2.5">
          <legend className="sr-only">Para quem</legend>
          {colleagues.map((c) => (
            <ChoiceCard
              key={c.id}
              name="colega"
              value={c.id}
              checked={c.id === colleague}
              onSelect={onColleague}
              className="min-h-14 px-4 py-2.5"
            >
              <span className="flex flex-1 flex-col">
                <span className="text-label-md font-semibold">{c.name}</span>
                <span className="text-label-sm text-ink-3">{c.load}</span>
              </span>
            </ChoiceCard>
          ))}
        </fieldset>
        <TextareaField
          label="Mensagem para o colega"
          optional
          rows={2}
          defaultValue="Vou estar fora a partir de amanhã. Falta só validar as datas do certificado."
        />
        <Notice tone="info" plain neutralText>
          A tarefa só passa para o colega quando ele aceitar. Até lá continua consigo e o prazo continua a contar. Fica
          registado no histórico.
        </Notice>
        <div className="flex flex-wrap justify-end gap-3">
          <Button variant="ghost" onClick={onCancel}>
            Cancelar
          </Button>
          <Button onClick={onConfirm}>Pedir a {name}</Button>
        </div>
      </div>
    </Modal>
  )
}
